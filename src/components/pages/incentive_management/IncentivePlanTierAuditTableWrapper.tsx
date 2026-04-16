"use client";

import React, { useMemo, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuditDetailDialog from "@/components/pages/incentive_management/AuditDetailDialog";
import DynamicGroupTable from "@/components/common/DynamicGroupTable";
import { useIncentivePlanTierAudits } from "@/hooks/useIncentiveSchemes";
import type { IncentivePlanTierAuditLog } from "@/types/incentive";

const IncentivePlanTierAuditTableWrapper = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<IncentivePlanTierAuditLog | null>(null);

  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter.trim();
    }

    columnFilters.forEach((f) => {
      if (f.id && (f.value || f.value === "0" || f.value === "1")) {
        params[f.id] = f.value;
      }
    });

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    return params;
  }, [pagination, columnFilters, sorting, globalFilter]);

  const { data, isLoading, isError, error, refetch, isFetching } = useIncentivePlanTierAudits(apiParams);

  const rows = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const columns = [
    {
      accessorKey: "tier_code",
      header: "Plan Product Code",
      enableSorting: false,
      size: 180,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "action",
      header: "Action",
      enableSorting: false,
      size: 140,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Create", value: "CREATE" },
        { label: "Update", value: "UPDATE" },
        { label: "Import Create", value: "IMPORT_CREATE" },
        { label: "Import Update", value: "IMPORT_UPDATE" },
      ],
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "user_id",
      header: "User",
      enableSorting: false,
      size: 140,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      enableSorting: false,
      size: 180,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "changed_fields_preview",
      header: "Changed Fields",
      enableSorting: false,
      size: 340,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View Details",
      color: "primary",
      onClick: (row: IncentivePlanTierAuditLog) => setSelectedAudit(row),
    },
  ];

  return (
    <>
      <DynamicGroupTable
        data={rows}
        columns={columns as any}
        searchPlaceholder="Search plan tier audits..."
        rowActions={rowActions as any}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={error as any}
        refetch={refetch}
        enableServerSide
        totalRowCount={totalCount}
        pagination={pagination}
        columnFilters={columnFilters}
        sorting={sorting}
        globalFilter={globalFilter}
        onPaginationChange={setPagination as any}
        onColumnFiltersChange={setColumnFilters as any}
        onSortingChange={setSorting as any}
        onGlobalFilterChange={setGlobalFilter}
        showCreateButton={false}
      />
      <AuditDetailDialog
        open={Boolean(selectedAudit)}
        title="Plan Tier Audit Details"
        entityLabel="Plan Product Code"
        entityValue={selectedAudit?.tier_code}
        action={selectedAudit?.action}
        userId={selectedAudit?.user_id}
        timestamp={selectedAudit?.timestamp}
        beforeData={selectedAudit?.before_data || {}}
        afterData={selectedAudit?.after_data || {}}
        onClose={() => setSelectedAudit(null)}
      />
    </>
  );
};

export default IncentivePlanTierAuditTableWrapper;
