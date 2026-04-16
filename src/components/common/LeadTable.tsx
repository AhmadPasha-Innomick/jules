"use client";

import React, { useMemo, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    type MRT_TableOptions,
    type MRT_PaginationState,
    type MRT_ColumnFiltersState,
    type MRT_SortingState,
} from "material-react-table";
import { Box, IconButton, Tooltip, TextField, MenuItem } from "@mui/material";
import { Search, Download, Refresh as RefreshIcon } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface TableAction<T> {
    icon: React.ReactNode;
    label: string;
    onClick: (row: T) => void;
    color?:
    | "inherit"
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | string;
}

interface SearchOption {
    label: string;
    value: string;
}

interface DynamicTableProps<T extends object> {
    data: T[];
    columns?: MRT_ColumnDef<T, unknown>[];
    muiTableProps?: Partial<MRT_TableOptions<T>>;
    showCreateButton?: boolean;
    createButtonLabel?: string;
    onCreate?: () => void;
    rowActions?: TableAction<T>[];

    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    refetch?: () => void;

    enableServerSide?: boolean;
    onPaginationChange?: (pagination: MRT_PaginationState) => void;
    onColumnFiltersChange?: (columnFilters: MRT_ColumnFiltersState) => void;
    onSortingChange?: (sorting: MRT_SortingState) => void;

    pagination?: MRT_PaginationState;
    columnFilters?: MRT_ColumnFiltersState;
    sorting?: MRT_SortingState;
    totalRowCount?: number;
    onExport?: () => void | Promise<void>;
    isExporting?: boolean;

    /** NEW: configurable search fields */
    searchOptions?: SearchOption[];
}

function DynamicTable<T extends object>({
    data,
    columns,
    muiTableProps = {},
    rowActions = [],

    isLoading = false,
    isError = false,
    error = null,
    refetch,

    enableServerSide = false,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,

    pagination = { pageIndex: 0, pageSize: 10 },
    columnFilters = [],
    sorting = [],
    totalRowCount = 0,
    onExport,
    isExporting = false,

    searchOptions = [],
}: DynamicTableProps<T>) {
    const [searchValue, setSearchValue] = useState("");


    const [dateRange, setDateRange] = useState<
        [dayjs.Dayjs | null, dayjs.Dayjs | null]
    >([null, null]);

    const startDate = dateRange[0];
    const endDate = dateRange[1];

    const memoizedData = useMemo(() => data, [data]);

    const derivedColumns = useMemo<MRT_ColumnDef<T, unknown>[]>(() => {
        let cols: MRT_ColumnDef<T, unknown>[] = [];

        cols.push({
            id: "sno",
            header: "S.No",
            size: 60,
            enableSorting: false,
            Cell: ({ table, row }) => {
                const { pageIndex, pageSize } = table.getState().pagination;
                return pageIndex * pageSize + row.index + 1;
            },
        });

        if (columns && columns.length > 0) {
            cols = [...cols, ...columns];
        } else if (data.length > 0) {
            const sample = data[0];
            cols = [
                ...cols,
                ...Object.keys(sample).map((key) => ({
                    accessorKey: key,
                    header: key.charAt(0).toUpperCase() + key.slice(1),
                })),
            ];
        }

        if (rowActions.length > 0) {
            cols.push({
                id: "actions",
                header: "Actions",
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {rowActions.map((action, idx) => (
                            <Tooltip key={idx} title={action.label}>
                                <IconButton
                                    size="small"
                                    onClick={() => action.onClick(row.original)}
                                >
                                    {action.icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Box>
                ),
            });
        }

        return cols;
    }, [columns, data, rowActions]);

    const handleSearch = () => {
        if (!enableServerSide || !onColumnFiltersChange) return;

        const filters: MRT_ColumnFiltersState = [];

        if (searchValue.trim()) {
            filters.push({
                id: "search",   // important: backend param name
                value: searchValue.trim(),
            });
        }

        if (startDate) {
            filters.push({
                id: "start_date",
                value: startDate.format("YYYY-MM-DD"),
            });
        }

        if (endDate) {
            filters.push({
                id: "end_date",
                value: endDate.format("YYYY-MM-DD"),
            });
        }

        onColumnFiltersChange(filters);
    };
    const handleResetSearch = () => {
        setSearchValue("");
        setDateRange([null, null]);

        if (onColumnFiltersChange) onColumnFiltersChange([]);
        if (refetch) refetch();
    };
    const table = useMaterialReactTable<T>({
        enableFilterMatchHighlighting: false,
        columns: derivedColumns,
        data: memoizedData,
        enableToolbarInternalActions: false,
        enableGlobalFilter: false,
        manualFiltering: enableServerSide,
        manualPagination: enableServerSide,
        manualSorting: enableServerSide,

        enableColumnFilters: false,
        enableColumnActions: false,
        enableDensityToggle: false,
        enableHiding: false,
        enableFullScreenToggle: false,

        state: {
            isLoading,
            showAlertBanner: isError,
            ...(enableServerSide && {
                pagination,
                columnFilters,
                sorting,
            }),
        },

        rowCount: enableServerSide ? totalRowCount : data.length,

        onPaginationChange: enableServerSide ? onPaginationChange : undefined,
        onColumnFiltersChange: enableServerSide
            ? onColumnFiltersChange
            : undefined,
        onSortingChange: enableServerSide ? onSortingChange : undefined,

        renderToolbarAlertBannerContent: isError
            ? () => (
                <Box sx={{ p: 2, color: "error.main" }}>
                    Error loading data: {error?.message || "Unknown error"}
                </Box>
            )
            : undefined,
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search leads..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                    sx={{ width: 300 }}
                />

                <RangePicker
                    allowClear
                    style={{ width: 260 }}
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates ?? [null, null])}
                    placeholder={["Start date", "End date"]}
                    disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                    }
                />

                <Tooltip title="Search">
                    <IconButton onClick={handleSearch}>
                        <Search />
                    </IconButton>
                </Tooltip>

                {onExport && (
                    <Tooltip title="Export CSV">
                        <span>
                            <IconButton onClick={onExport} disabled={isExporting}>
                                <Download />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {enableServerSide && refetch && (
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleResetSearch}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        ),

        ...muiTableProps,
    });

    return <MaterialReactTable table={table} />;
}

export default DynamicTable;
