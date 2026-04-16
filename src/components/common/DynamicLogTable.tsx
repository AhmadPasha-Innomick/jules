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
import { Box, IconButton, Tooltip } from "@mui/material";
import * as XLSX from "xlsx";
import Button from "../ui/button/Button";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from '@mui/icons-material/Add';
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
    onImport?: (rows: T[]) => void;

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

function DynamicLogTable<T extends object>({
    data,
    columns,
    muiTableProps = {},
    showCreateButton = false,
    createButtonLabel = "Assign User",
    onCreate,
    onCreateClick,
    rowActions = [],
    onImport,

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
                                            ? { color: action.color === 'success' ? '#12b76a' : action.color === 'error' ? '#f04438' : action.color === 'warning' ? '#f79009' : '#4f008c' }
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


    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
            const bstr = evt.target?.result;
            if (!bstr) return;


            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];


            const jsonData: T[] = XLSX.utils
                .sheet_to_json<RowData>(ws, {
                    defval: "",
                    header: 0,
                })
                .map((row) => {
                    const normalizedRow: RowData = {};
                    Object.keys(row).forEach((key) => {
                        const cleanKey = key.trim();
                        normalizedRow[cleanKey] = row[key];
                    });
                    return normalizedRow as T;
                });


            const requiredFields =
                columns && columns.length > 0
                    ? (columns.map((c) => c.accessorKey).filter(Boolean) as string[])
                    : data.length > 0
                        ? Object.keys(data[0])
                        : [];


            const invalidRows = jsonData.filter((row) =>
                requiredFields.some(
                    (field) =>
                        row[field as keyof T] === undefined || row[field as keyof T] === ""
                )
            );

            if (invalidRows.length > 0) {
                setImportError(
                    `Found ${invalidRows.length} invalid rows (missing required fields: ${requiredFields.join(
                        ", "
                    )})`
                );
                return;
            }

            setImportError(null);
            if (onImport) {
                onImport(jsonData);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleRefresh = () => {
   
        setSearchInput("");

      
        onPaginationChange?.({
            pageIndex: 0,
            pageSize: pagination.pageSize,
        });


        onGlobalFilterChange?.("");


        refetch?.();
    };




    const table = useMaterialReactTable<T>({
        enableColumnFilters: false,
        enableGlobalFilter: false,
        columns: derivedColumns,
        data: memoizedData,
        enableFullScreenToggle: false,
        enableFilterMatchHighlighting: false,
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

        rowCount: enableServerSide ? totalRowCount : data.length,

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
                            onClick={handleRefresh}
                            sx={{ color: "error.main" }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    )}

                </Box>
            )
            : undefined,
        renderTopToolbarCustomActions: () => (
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: "auto",
            }}>
                {showCreateButton && (
                    <Button
                        onClick={onCreateClick}
                        className="bg-brand-500 hover:bg-brand-600 text-white text-theme-sm font-stc-medium rounded-lg px-6 py-2 shadow-theme-sm flex items-center gap-2"
                    >
                        <AddIcon fontSize="small" />
                        {createButtonLabel}
                    </Button>

                )}




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
                            placeholder="Search Logs..."
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

                </Box>

                {enableServerSide && refetch && (
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleRefresh} disabled={isLoading}>
                            <RefreshIcon />
                        </IconButton>

                    </Tooltip>
                )}


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

export default DynamicLogTable;