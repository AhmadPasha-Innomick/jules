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
import * as XLSX from "xlsx";
import Button from "../ui/button/Button";
import { Search, Download, Refresh as RefreshIcon } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import { useExportUsers } from "@/hooks/useExportUsers";

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
}: DynamicTableProps<T>) {
    const [importError, setImportError] = useState<string | null>(null);

    const [searchField, setSearchField] = useState("Search by");
    const [searchValue, setSearchValue] = useState("");

    const memoizedData = useMemo(() => data, [data]);


    const derivedColumns = useMemo<MRT_ColumnDef<T, unknown>[]>(() => {
        let cols: MRT_ColumnDef<T, unknown>[] = [];

        cols.push({
            id: "sno",
            header: "S.No",
            size: 60,
            Cell: ({ row }) => row.index + 1,
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







    const { mutateAsync: exportUsers } = useExportUsers();

    const handleDownload = async () => {
        try {
            const filters = {
                search_by: searchField,

                search_value: searchValue,
            };



            const blob: Blob = await exportUsers(filters);

            const fileName = `UsersExport_${new Date().toISOString().split("T")[0]}.csv`;
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
        }
    };


    const handleExportExcel = () => {

    };





    const handleSearch = () => {
        if (!searchValue.trim() || searchField === "Search by") return;


        if (refetch) {
            refetch();
        }
    };

    const handleResetSearch = () => {
        setSearchField("Search by");
        setSearchValue("");

        if (onColumnFiltersChange) {
            onColumnFiltersChange([]);
        }
        if (refetch) {
            refetch();
        }
    };


    const table = useMaterialReactTable<T>({
        columns: derivedColumns,
        data: memoizedData,
        enableToolbarInternalActions: true,
        enableGlobalFilter: false,
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
                    gap: 1,
                    width: "100%",
                }}
            >
            
                {showCreateButton && (
                    <Button
                        onClick={onCreate}
                        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-6 py-2 flex items-center gap-2"
                    >
                        <AddIcon fontSize="small" />
                        {createButtonLabel}
                    </Button>
                )}

            
                <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 1 }}>




                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextField
                            select

                            size="small"
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            sx={{
                                color: "#4f008c",
                                width: 180,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    background: "#fff",
                                    "& fieldset": {
                                        borderColor: "4f008c",
                                        borderWidth: "1.5px",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "4f008c",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "4f008c",
                                    },
                                },

                                "& .MuiInputLabel-root": {
                                    color: "4f008c",
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
                            <MenuItem value="Search by">Search by</MenuItem>
                            <MenuItem value="incident_id">Incident ID</MenuItem>
                            <MenuItem value="created_by">Created By</MenuItem>
                            <MenuItem value="category">Category</MenuItem>
                            <MenuItem value="status">Status</MenuItem>

                        </TextField>

                        <TextField
                            size="small"
                            label="Search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            disabled={searchField === "Search by"}
                            sx={{
                                width: 250,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    "& fieldset": { borderColor: "#6A1B9A" },
                                    "&:hover fieldset": { borderColor: "#6A1B9A" },
                                    "&.Mui-focused fieldset": { borderColor: "#6A1B9A" },
                                },
                                "& .MuiInputLabel-root": {
                                    color: "#6A1B9A",
                                    fontWeight: 600,
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#6A1B9A",
                                },
                            }}
                            InputProps={{
                                endAdornment: searchValue && (
                                    <button
                                        onClick={() => setSearchValue("")}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            padding: 0,
                                            marginRight: "4px",
                                        }}
                                    >
                                        ✖
                                    </button>
                                ),
                            }}
                        />



                        <Tooltip title="Search">
                            <span> 
                                <IconButton
                                    color="primary"
                                    onClick={handleSearch}
                                    disabled={searchField === "Search by" || !searchValue.trim()}
                                    sx={{ border: "1px solid #ccc" }}
                                >
                                    <Search />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>



               


                 
                    {enableServerSide && refetch && (
                        <Tooltip title="Refresh">
                            <IconButton color="primary" onClick={() => handleResetSearch()} disabled={isLoading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                </Box>
            </Box>
        ),



        ...muiTableProps,
    });

    return (
        <>
            {importError && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
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
                    <span>{importError}</span>
                </Box>
            )}

            <MaterialReactTable table={table} />
        </>
    );
}

export default DynamicTable;
