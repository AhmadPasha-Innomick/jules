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
import { UploadFile, Download, Refresh as RefreshIcon } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from '@mui/icons-material/Add';

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
    onGlobalFilterChange?: (globalFilter: string) => void;
    onColumnFiltersChange?: (columnFilters: MRT_ColumnFiltersState) => void;
    onSortingChange?: (sorting: MRT_SortingState) => void;
    pagination?: MRT_PaginationState;
    globalFilter?: string;
    columnFilters?: MRT_ColumnFiltersState;
    sorting?: MRT_SortingState;
    totalRowCount?: number;
}

function DynamicKycTable<T extends object>({
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

    const memoizedData = useMemo(() => data, [data]);

    const derivedColumns = useMemo<MRT_ColumnDef<T, unknown>[]>(() => {
        let cols: MRT_ColumnDef<T, unknown>[] = [];

        // ✅ Inject Serial Number column first
    // cols.push({
    //     id: "sno",
    //     header: "S.No",
    //     size: 60,
    //     Cell: ({ row }) => row.index + 1, // 1-based index
    // });

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

    // ✅ Excel Import Handler
    // const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;

    //     const reader = new FileReader();
    //     reader.onload = (evt: ProgressEvent<FileReader>) => {
    //         const bstr = evt.target?.result;
    //         if (!bstr) return;

    //         // read workbook
    //         const wb = XLSX.read(bstr, { type: "binary" });
    //         const wsname = wb.SheetNames[0];
    //         const ws = wb.Sheets[wsname];

    //         // convert sheet → json
    //         const jsonData: T[] = XLSX.utils
    //             .sheet_to_json<RowData>(ws, {
    //                 defval: "", // empty cells become ""
    //                 header: 0, // use first row as headers
    //             })
    //             .map((row) => {
    //                 const normalizedRow: RowData = {};
    //                 Object.keys(row).forEach((key) => {
    //                     const cleanKey = key.trim(); // remove spaces
    //                     normalizedRow[cleanKey] = row[key];
    //                 });
    //                 return normalizedRow as T;
    //             });

    //         // determine required fields
    //         const requiredFields =
    //             columns && columns.length > 0
    //                 ? (columns.map((c) => c.accessorKey).filter(Boolean) as string[])
    //                 : data.length > 0
    //                     ? Object.keys(data[0])
    //                     : [];

    //         // validate imported rows
    //         const invalidRows = jsonData.filter((row) =>
    //             requiredFields.some(
    //                 (field) =>
    //                     row[field as keyof T] === undefined || row[field as keyof T] === ""
    //             )
    //         );

    //         if (invalidRows.length > 0) {
    //             setImportError(
    //                 `Found ${invalidRows.length} invalid rows (missing required fields: ${requiredFields.join(
    //                     ", "
    //                 )})`
    //             );
    //             return;
    //         }

    //         setImportError(null);
    //         if (onImport) {
    //             onImport(jsonData);
    //         }
    //     };

    //     reader.readAsBinaryString(file);
    // };

    // ✅ Excel Export Handler
    // const handleExportExcel = () => {
    //     const ws = XLSX.utils.json_to_sheet(memoizedData);
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    //     XLSX.writeFile(wb, "export.xlsx"); // downloads file
    // };

    const table = useMaterialReactTable<T>({
        columns: derivedColumns,
        data: memoizedData,
        enableFullScreenToggle: false,
        // Server-side configuration
        manualFiltering: enableServerSide,
        manualPagination: enableServerSide,
        manualSorting: enableServerSide,
        // State management
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
        // Row count for server-side pagination
        rowCount: enableServerSide ? totalRowCount : data.length,
        // Server-side event handlers
        onPaginationChange: enableServerSide ? onPaginationChange : undefined,
        onGlobalFilterChange: enableServerSide ? onGlobalFilterChange : undefined,
        onColumnFiltersChange: enableServerSide ? onColumnFiltersChange : undefined,
        onSortingChange: enableServerSide ? onSortingChange : undefined,
        // Custom alert banner for errors
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {showCreateButton && (
                    <Button
                        onClick={onCreate}
                        className="bg-brand-500 hover:bg-brand-600 text-white text-theme-sm font-stc-medium rounded-lg px-6 py-2 shadow-theme-sm flex items-center gap-2"
                    >
                        <AddIcon fontSize="small" />
                        {createButtonLabel}
                    </Button>

                )}

                {/* ✅ Excel Upload */}
                {/* <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    id="excel-upload"
                    style={{ display: "none" }}
                    onChange={handleImportExcel}
                />
                <label htmlFor="excel-upload">
                    <Tooltip title="Import Excel">
                        <IconButton component="span" color="primary">
                            <UploadFile />
                        </IconButton>
                    </Tooltip>
                </label> */}

                {/* ✅ Excel Export */}
                {/* <Tooltip title="Export Excel">
                    <IconButton color="secondary" onClick={handleExportExcel}>
                        <Download />
                    </IconButton>
                </Tooltip> */}

                {/* Refresh button for server-side */}
                {enableServerSide && refetch && (
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => refetch()} disabled={isLoading}>
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

export default DynamicKycTable ;