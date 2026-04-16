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
import { Search, Refresh as RefreshIcon } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import Button from "../ui/button/Button";
import AddIcon from "@mui/icons-material/Add";
import { useGroups } from "@/hooks/useGroups";
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

interface DynamicTableProps<T extends object> {
    data: T[];
    columns?: MRT_ColumnDef<T, unknown>[];
    muiTableProps?: Partial<MRT_TableOptions<T>>;
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
    showCreateButton?: boolean;
    createButtonLabel?: string;
    onCreate?: () => void;


    startDate?: Dayjs | null;
    endDate?: Dayjs | null;
    onStartDateChange?: (date: Dayjs | null) => void;
    onEndDateChange?: (date: Dayjs | null) => void;


    searchFields?: { label: string; value: string }[];
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
    showCreateButton,
    createButtonLabel = "Create",
    onCreate,

    pagination = { pageIndex: 0, pageSize: 10 },
    columnFilters = [],
    sorting = [],
    totalRowCount = 0,
    startDate: propStartDate,
    endDate: propEndDate,
    onStartDateChange,
    onEndDateChange,
    searchFields = [],
}: DynamicTableProps<T>) {


    const [searchField, setSearchField] = useState("searchby");
    const [searchValue, setSearchValue] = useState("");


    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [internalDateRange, setInternalDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const { data: groupsData, isLoading: groupsLoading } = useGroups();
    const groups = groupsData?.data?.groups || [];


    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        const newDates: [Dayjs | null, Dayjs | null] = dates ?? [null, null];
        setDateRange(newDates);

        if (onStartDateChange) onStartDateChange(newDates[0]);
        if (onEndDateChange) onEndDateChange(newDates[1]);

        triggerSearch();
    };

    const memoizedData = useMemo(() => data, [data]);

    const derivedColumns = useMemo<MRT_ColumnDef<T, unknown>[]>(() => {
        let cols: MRT_ColumnDef<T, unknown>[] = [];

        cols.push({
            id: "sno",
            header: "S.No",
            size: 60,
            Cell: ({ row }) => (pagination.pageIndex * pagination.pageSize) + row.index + 1,
        });

        if (columns && columns.length > 0) {
            cols = [...cols, ...columns];
        }

        if (rowActions.length > 0) {
            cols.push({
                id: "actions",
                header: "Actions",
                size: 100,
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {rowActions.map((action, idx) => (
                            <Tooltip key={idx} title={action.label}>
                                <IconButton
                                    color={action.color as any || "default"}
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
    }, [columns, data, rowActions, pagination]);
    const triggerSearch = () => {
        if (!enableServerSide || !onColumnFiltersChange) return;

        const filters: MRT_ColumnFiltersState = [];


        const searchValueStr = String(searchValue || "").trim();

        if (searchValueStr) {
            let value = searchValueStr;


            if (searchField === "category") {
                value = value.toUpperCase();
            }

            if (searchField === "global") {
                filters.push({ id: "q", value });
            } else {
                filters.push({ id: searchField, value });
            }
        }

        if (startDate) {
            filters.push({
                id: "from_date",
                value: startDate.format("YYYY-MM-DD HH:mm:ss"),
            });
        }
        if (endDate) {
            filters.push({
                id: "to_date",
                value: endDate.format("YYYY-MM-DD HH:mm:ss"),
            });
        }

        onColumnFiltersChange(filters);
    };


    const handleResetSearch = () => {
        setDateRange([null, null]);
        setSearchField("global");
        setSearchValue("");
        setInternalDateRange([null, dayjs()]);
        if (onStartDateChange) onStartDateChange(null);
        if (onEndDateChange) onEndDateChange(null);

        if (onColumnFiltersChange) {
            onColumnFiltersChange([]);
        }
        if (refetch) refetch();
    };


    const defaultSearchFields = [
        { label: "Search By", value: "searchby" },
        { label: "Category", value: "category" },
        { label: "Group", value: "group_id" },
    ];

    const finalSearchFields = searchFields.length > 0 ? searchFields : defaultSearchFields;

    const table = useMaterialReactTable<T>({
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
        onColumnFiltersChange: enableServerSide ? onColumnFiltersChange : undefined,
        onSortingChange: enableServerSide ? onSortingChange : undefined,

        renderToolbarAlertBannerContent: isError
            ? () => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                    <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                        Error loading data: {error?.message || "Unknown error"}
                    </Box>
                    {refetch && (
                        <IconButton size="small" onClick={refetch} sx={{ color: "error.main" }}>
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
                    py: 1,
                }}
            >
                {showCreateButton && (
                    <Button
                        onClick={onCreate}
                        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-2 py-2 flex items-center gap-2"
                    >
                        <AddIcon fontSize="small" />
                        {createButtonLabel}
                    </Button>
                )}

                <TextField
                    select
                    size="small"

                    value={searchField || "searchby"}
                    onChange={(e) => {
                        setSearchField(e.target.value);
                        setSearchValue("");
                    }}
                    sx={{
                        width: 200,
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
                   

                    {finalSearchFields.map((field) => (
                        <MenuItem key={field.value} value={field.value}>
                            {field.label}
                        </MenuItem>
                    ))}
                </TextField>






                {searchField === "category" ? (
                    <TextField
                        select
                        size="small"
                        placeholder="Select category"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="PROMOTIONAL">PROMOTIONAL</MenuItem>
                        <MenuItem value="SYSTEM">SYSTEM</MenuItem>
                    </TextField>
                ) : searchField === "group_id" ? (
                    <TextField
                        select
                        size="small"
                        placeholder="Select group"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        disabled={groupsLoading}
                        sx={{ width: 250 }}

                    >
                        {groups.map((group: any) => (
                            <MenuItem key={group.group_id} value={group.group_id}>
                                {group.group_name || `Group ${group.group_id}`}
                            </MenuItem>
                        ))}
                        {groupsLoading && <MenuItem disabled>Loading groups...</MenuItem>}
                        {groups.length === 0 && !groupsLoading && (
                            <MenuItem disabled>No groups found</MenuItem>
                        )}
                    </TextField>
                ) : (
                    <TextField
                        size="small"
                        placeholder="Select search type"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
                        sx={{ width: 200 }}
                        InputProps={{
                            endAdornment: searchValue && (
                                <button
                                    onClick={() => setSearchValue("")}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
                                >
                                    ✕
                                </button>
                            ),
                        }}
                    />
                )}


                <RangePicker
                    size="middle"
                    allowClear
                    style={{ width: 400 }}
                    value={dateRange}
                    onChange={handleDateChange}
                    showTime={{ format: "HH:mm:ss" }}

                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={["From Date Time", "To Date Time"]}
                    disabledDate={(current) => {
                        const [start, end] = dateRange;


                        if (start && !end) {
                            return current.isBefore(start, "minute");
                        }

                        return false;
                    }}

                    presets={[
                        { label: "Today", value: [dayjs().startOf("day"), dayjs()] },
                        { label: "Last 7 Days", value: [dayjs().subtract(6, "day"), dayjs()] },
                        { label: "Last 30 Days", value: [dayjs().subtract(29, "day"), dayjs()] },
                        { label: "This Month", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
                    ]}
                />










                <Tooltip title="Search">
                    <IconButton color="primary" onClick={triggerSearch} sx={{ border: "1px solid #ccc" }}>
                        <Search />
                    </IconButton>
                </Tooltip>

                {enableServerSide && refetch && (
                    <Tooltip title="Reset Filters">
                        <IconButton color="primary" onClick={handleResetSearch} disabled={isLoading}>
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