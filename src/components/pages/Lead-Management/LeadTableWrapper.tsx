"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicTable from "@/components/common/LeadTable";
import { useLeads } from "@/hooks/useLeads";
import { useExportLeads } from "@/hooks/useExportLeads";

const LeadTableWrapper = () => {
    const router = useRouter();

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [sorting, setSorting] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState("");

    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);

    const apiParams = useMemo(() => {
        const params: Record<string, string> = {};

        params.limit = String(pagination.pageSize);
        params.offset = String(pagination.pageIndex * pagination.pageSize);

        if (searchValue?.trim()) {
            params.search = searchValue.trim();
        }

        columnFilters.forEach((filter) => {
            if (filter.value) {
                params[filter.id] = String(filter.value);
            }
        });

        if (startDate) params.start_date = startDate.format("YYYY-MM-DD");
        if (endDate) params.end_date = endDate.format("YYYY-MM-DD");

        if (sorting.length > 0) {
            params.sort_by = sorting[0].id;
            params.sort_order = sorting[0].desc ? "desc" : "asc";
        }

        return params;
    }, [pagination, columnFilters, sorting, searchValue, startDate, endDate]);

    const {
        data: leadsResponse,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useLeads(apiParams);
    const { mutateAsync: exportLeads, isPending: isExporting } = useExportLeads();

    const exportParams = useMemo(() => {
        const params: Record<string, string> = {};

        columnFilters.forEach((filter) => {
            const value = filter?.value;
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                params[String(filter.id)] = String(value);
            }
        });

        if (sorting.length > 0) {
            params.sort_by = sorting[0].id;
            params.sort_order = sorting[0].desc ? "desc" : "asc";
        }

        return params;
    }, [columnFilters, sorting]);

    const handleExport = async () => {
        try {
            const blob = await exportLeads(exportParams);
            const fileName = `LeadsExport_${new Date().toISOString().split("T")[0]}.csv`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lead export failed:", error);
        }
    };

    const leads = leadsResponse?.data?.leads || [];
    const totalRowCount = leadsResponse?.data?.totalCount || 0;

    const columns = [
        {
            accessorKey: "lead_id",
            header: "Lead ID",
            size: 120,
            enableSorting: false,
        },
        {
            accessorKey: "category_name",
            header: "Category",
            size: 150,
            enableSorting: false,
            Cell: ({ cell }) => cell.getValue() || "N/A"
        },
        {
            accessorKey: "sub_category_name",
            header: "Sub Category",
            size: 150,
            enableSorting: false,
            Cell: ({ cell }) => cell.getValue() || "N/A"
        },
        {
            accessorKey: "email",
            header: "Email",
            size: 180,
            enableSorting: false,
            Cell: ({ cell }) => cell.getValue() || "N/A"
        },
        {
            accessorKey: "phone_number",
            header: "Phone",
            size: 150,
            enableSorting: false,
        },

        {
            accessorKey: "status",
            header: "Status",
            size: 120,
            enableSorting: false,
        },
        {
            accessorKey: "created_date_time",
            header: "Created At",
            size: 120,
            enableSorting: false,
            Cell: ({ cell }: any) =>
                cell.getValue()
                    ? new Date(cell.getValue()).toLocaleDateString()
                    : "-",
        },
    ];

    const rowActions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: "View",
            onClick: (row: any) =>
                router.push(`/lead_management/view/${row.lead_id}`),
            color: "info",
        },
    ];

    return (
        <DynamicTable

            data={leads}
            columns={columns}
            rowActions={rowActions}
            showCreateButton={false}
            isLoading={isLoading || isFetching}
            isError={isError}
            error={error}
            refetch={refetch}
            enableServerSide
            onPaginationChange={setPagination}
            onColumnFiltersChange={setColumnFilters}
            onSortingChange={setSorting}
            pagination={pagination}
            columnFilters={columnFilters}
            sorting={sorting}
            totalRowCount={totalRowCount}
            onExport={handleExport}
            isExporting={isExporting}
            muiTableProps={{
                enableColumnFilters: true,
                enablePagination: true,
                enableSorting: true,
                muiSearchTextFieldProps: {
                    placeholder: "Search leads...",
                    size: "small",
                    variant: "outlined",
                },
            }}
        />
    );
};

export default LeadTableWrapper;
