"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import * as XLSX from "xlsx";
import Button from "../ui/button/Button";
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

type RowData = Record<string, unknown>;

interface DynamicTableProps<T extends object> {
    data: T[];
    columns?: MRT_ColumnDef<T, unknown>[];
    muiTableProps?: Partial<MRT_TableOptions<T>>;
    showCreateButton?: boolean;
    createButtonLabel?: string;
    onCreate?: () => void;
    rowActions?: TableAction<T>[];
    onImport?: (rows: T[]) => void;

    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    refetch?: () => void;

    enableServerSide?: boolean;
    onPaginationChange?: (pagination: MRT_PaginationState) => void;
    onColumnFiltersChange?: (columnFilters: MRT_ColumnFiltersState) => void;
    onSortingChange?: (sorting: MRT_SortingState) => void;

    pagination?: MRT_PaginationState;
    globalFilter?: string;
    columnFilters?: MRT_ColumnFiltersState;
    sorting?: MRT_SortingState;
    totalRowCount?: number;
    onExport?: () => void | Promise<void>;
    isExporting?: boolean;

    startDate?: Dayjs | null;
    endDate?: Dayjs | null;
    onStartDateChange?: (date: Dayjs | null) => void;
    onEndDateChange?: (date: Dayjs | null) => void;
}

function DynamicTable<T extends object>({
    data,
    columns,
    muiTableProps = {},
    showCreateButton = false,
    createButtonLabel = "Create",
    onCreate,
    rowActions = [],
    onImport,

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

    onStartDateChange,
    onEndDateChange,
}: DynamicTableProps<T>) {


    const [searchField, setSearchField] = useState("searchby");
    const [searchValue, setSearchValue] = useState("");
    const [openRange, setOpenRange] = useState(false);
    const rangeInputRef = React.useRef<HTMLDivElement | null>(null);


    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        null,
        null,
    ]);


    const startDate = dateRange[0];
    const endDate = dateRange[1];


    const rangeValue = [
        {
            startDate: startDate ? startDate.toDate() : new Date(),
            endDate: endDate ? endDate.toDate() : new Date(),
            key: "selection",
        },
    ]
    const getPopupPosition = () => {
        if (!rangeInputRef.current) return { top: 0, left: 0 };

        const rect = rangeInputRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 8,
            left: rect.left,
        };
    };
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
                                    color={
                                        [
                                            "inherit",
                                            "default",
                                            "primary",
                                            "secondary",
                                            "error",
                                            "info",
                                            "success",
                                            "warning",
                                        ].includes(action.color || "")
                                            ? (action.color as any)
                                            : "default"
                                    }
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

    const handleEnterKey =
        (cb: () => void) =>
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    cb();
                }
            };


    const handleSearch = () => {
        if (!enableServerSide || !onColumnFiltersChange) return;

        const filters: MRT_ColumnFiltersState = [];


        if (searchField !== "searchby" && searchValue.trim()) {
            filters.push({
                id: searchField,
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
        setSearchField("searchby");
        setSearchValue("");

        setDateRange([null, null]);

        if (onColumnFiltersChange) {
            onColumnFiltersChange([]);
        }


        if (refetch) {
            refetch();
        }
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
            showProgressBars: false,
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                    <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                        Error loading data: {error?.message || "Unknown error occurred"}
                    </Box>
                    {refetch && (
                        <IconButton
                            size="small"
                            onClick={() => refetch()}

                            sx={{ color: "error.main" }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    )}
                </Box>
            )
            : undefined,


        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    width: "100%",
                    flexWrap: "wrap",
                }}
            >


                <TextField
                    select
                    size="small"
                    value={searchField}
                    onChange={(e) => {
                        setSearchField(e.target.value);
                        setSearchValue("");
                    }}
                    sx={{
                        width: 180,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            background: "#fff",
                            "& fieldset": {
                                borderColor: "#4f008c",
                                borderWidth: "1.5px",
                            },
                            "&:hover fieldset": {
                                borderColor: "#4f008c",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#4f008c",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: "#4f008c",
                            fontWeight: 600,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                            color: "#4f008c",
                        },
                    }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                                },
                            },
                            MenuListProps: {
                                sx: {
                                    "& .MuiMenuItem-root.Mui-selected": {
                                        backgroundColor: "#6A1B9A !important",
                                        color: "#fff",
                                    },
                                    "& .MuiMenuItem-root:hover": {
                                        backgroundColor: "rgba(106,27,154,0.1)",
                                    },
                                },
                            },
                        },
                    }}
                >
                    <MenuItem value="searchby">Search by</MenuItem>
                    <MenuItem value="incident_id">Incident ID</MenuItem>
                    <MenuItem value="created_by">Created By</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                </TextField>


                <TextField
                    size="small"
                    label="Select search type"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    disabled={searchField === "searchby"}
                    onKeyDown={handleEnterKey(handleSearch)}
                    sx={{ width: 250 }}
                    InputProps={{
                        endAdornment: searchValue && (
                            <button
                                onClick={() => setSearchValue("")}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                ✖
                            </button>
                        ),
                    }}
                />







                <RangePicker
                    size="middle"
                    allowClear
                    style={{ width: 260 }}
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates ?? [null, null])}
                    placeholder={["Start date", "End date"]}
                    disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                    }
                    presets={[
                        { label: "Today", value: [dayjs(), dayjs()] },
                        { label: "Last 7 Days", value: [dayjs().subtract(6, "day"), dayjs()] },
                        { label: "Last 30 Days", value: [dayjs().subtract(29, "day"), dayjs()] },
                        { label: "This Month", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
                    ]}
                />
                <Tooltip title="Search">
                    <IconButton
                        color="primary"
                        onClick={handleSearch}
                        sx={{ border: "1px solid #ccc" }}
                    >
                        <Search />
                    </IconButton>
                </Tooltip>

                {onExport && (
                    <Tooltip title="Export CSV">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={onExport}
                                disabled={isExporting}
                                sx={{ border: "1px solid #ccc" }}
                            >
                                <Download />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {enableServerSide && refetch && (
                    <Tooltip title="Refresh">
                        <IconButton
                            color="primary"
                            onClick={handleResetSearch}
                            disabled={isLoading}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                )}

            </Box>


























        ),




        ...muiTableProps,
    });

    return (
        <>
            <MaterialReactTable table={table} />
        </>
    );
}

export default DynamicTable;
