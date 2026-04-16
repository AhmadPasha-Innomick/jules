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
import {
    Box, IconButton, Tooltip, TextField,
    MenuItem,
} from "@mui/material";
import * as XLSX from "xlsx";
import Button from "../ui/button/Button";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

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

    createButtonLabel?: string;
    onCreate?: () => void;
    rowActions?: TableAction<T>[];


    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    refetch?: () => void;

    enableServerSide?: boolean;
    onPaginationChange?: (pagination: MRT_PaginationState) => void;
    onGlobalFilterChange?: (globalFilter: string) => void;
    onColumnFiltersChange?: (columnFilters: MRT_ColumnFiltersState) => void;
    onSortingChange?: (sorting: MRT_SortingState) => void;
    pagination?: MRT_PaginationState;
    globalFilter?: string;
    columnFilters?: MRT_ColumnFiltersState;
    sorting?: MRT_SortingState;
    totalRowCount?: number;
    onCreateClick?: () => void;
    showCreateButton?: boolean;
}

function DynamicGroupTable<T extends object>({
    data,
    columns,
    muiTableProps = {},
    showCreateButton = false,
    createButtonLabel = "Assign User",
    onCreate,
    onCreateClick,
    rowActions = [],

    isLoading = false,
    isError = false,
    error = null,
    refetch,
    enableServerSide = false,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    onSortingChange,
    pagination = { pageIndex: 0, pageSize: 10 },
    globalFilter = "",
    columnFilters = [],
    sorting = [],
    totalRowCount = 0,
}: DynamicTableProps<T>) {
    const [importError, setImportError] = useState<string | null>(null);
    const [searchField, setSearchField] = useState<string>("Search by");

    const [searchInput, setSearchInput] = useState(globalFilter);
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
                                            ? (action.color as
                                                | "inherit"
                                                | "default"
                                                | "primary"
                                                | "secondary"
                                                | "error"
                                                | "info"
                                                | "success"
                                                | "warning")
                                            : "default"
                                    }
                                    sx={
                                        ![
                                            "inherit",
                                            "default",
                                            "primary",
                                            "secondary",
                                            "error",
                                            "info",
                                            "success",
                                            "warning",
                                        ].includes(action.color || "")
                                            ? {
                                                color:
                                                    action.color === "success"
                                                        ? "#12b76a"
                                                        : action.color === "error"
                                                            ? "#f04438"
                                                            : action.color === "warning"
                                                                ? "#f79009"
                                                                : "#4f008c",
                                            }
                                            : {}
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




    const table = useMaterialReactTable<T>({
        enableGlobalFilter: false,
        columns: derivedColumns,
        data: memoizedData,
        enableFullScreenToggle: false,
        enableFilterMatchHighlighting: false,

        rowCount: totalRowCount,

        manualFiltering: enableServerSide,
        manualPagination: enableServerSide,
        manualSorting: enableServerSide,

        state: {
            isLoading,
            showAlertBanner: isError,
            showProgressBars: false,
            ...(enableServerSide && {
                pagination,
                globalFilter,
                columnFilters,
                sorting,
            }),
        },



        onPaginationChange: enableServerSide ? onPaginationChange : undefined,
        onGlobalFilterChange: enableServerSide ? onGlobalFilterChange : undefined,
        onColumnFiltersChange: enableServerSide ? onColumnFiltersChange : undefined,
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
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 2,
                }}
            >

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {showCreateButton && (
                        <Button
                            onClick={onCreate}
                            className="bg-brand-500 hover:bg-brand-600 text-theme-sm font-stc-medium shadow-theme-sm flex items-center gap-2 rounded-lg px-6 py-2 text-white"
                        >
                            <AddIcon fontSize="small" />
                            {createButtonLabel}
                        </Button>
                    )}


                </Box>



                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onPaginationChange?.({ pageIndex: 0, pageSize: pagination.pageSize });
                                    onGlobalFilterChange?.(searchInput);
                                }
                            }}
                            placeholder="Search groups..."
                            className="w-56 rounded-md border px-3 py-1.5 pr-8 text-sm outline-none"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    onPaginationChange?.({
                                        pageIndex: 0,
                                        pageSize: pagination.pageSize,
                                    });
                                    onGlobalFilterChange?.("");
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}


                    </div>

                    <IconButton
                        onClick={() => {
                            onPaginationChange?.({ pageIndex: 0, pageSize: pagination.pageSize });
                            onGlobalFilterChange?.(searchInput);
                        }}
                        sx={{ color: "#4f008c" }}
                    >
                        <SearchIcon />
                    </IconButton>

                    {enableServerSide && refetch && (
                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={() => {

                                    setSearchInput("");


                                    onPaginationChange?.({
                                        pageIndex: 0,
                                        pageSize: pagination.pageSize,
                                    });


                                    onGlobalFilterChange?.("");


                                    refetch();
                                }}
                                disabled={isLoading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                </Box>
            </Box>
        ),
        muiTopToolbarProps: {
            sx: {
                "& .MuiIconButton-root": {
                    color: "#4f008c",
                },
            },
        },
        ...muiTableProps,
    });

    return (
        <>
            {importError && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        color: "red",
                        fontSize: 14,
                        mb: 1,
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={() => setImportError(null)}
                        sx={{ color: "red", ml: 1 }}
                    >
                        <CancelIcon fontSize="small" />
                    </IconButton>
                    <span style={{ flex: 1 }}>{importError}</span>
                </Box>
            )}
            <MaterialReactTable table={table} />
        </>
    );
}

export default DynamicGroupTable;
