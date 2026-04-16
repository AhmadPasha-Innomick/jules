"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, Snackbar } from "@mui/material";
import ActionConfirmationDialog from "@/components/common/ActionConfirmationDialog";
import DynamicGroupTable from "@/components/common/DynamicGroupTable";
import { useIncentiveSchemes } from "@/hooks/useIncentiveSchemes";

const IncentiveSchemeTableWrapper = () => {
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [cloneSchemeCode, setCloneSchemeCode] = useState<string | null>(null);

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

  const { data, isLoading, isError, error, refetch, isFetching } = useIncentiveSchemes(apiParams);

  const schemes = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const columns = [
    {
      accessorKey: "scheme_code",
      header: "Scheme Code",
      enableSorting: false,
      size: 140,
    },
    {
      accessorKey: "scheme_name",
      header: "Scheme Name",
      enableSorting: false,
      size: 200,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "scheme_type",
      header: "Scheme Type",
      enableSorting: false,
      size: 120,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "service_type",
      header: "Service Type",
      enableSorting: false,
      size: 140,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      enableSorting: false,
      size: 170,
      Cell: ({ cell }: any) => (cell.getValue() ? String(cell.getValue()) : "-"),
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      enableSorting: false,
      size: 170,
      Cell: ({ cell }: any) => (cell.getValue() ? String(cell.getValue()) : "-"),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      Cell: ({ cell }: any) => {
        const status = String(cell.getValue() || "").toLowerCase();
        const active = status === "active";
        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: active ? "#e7f7ef" : "#fef2f2",
              color: active ? "#12b76a" : "#f04438",
              fontWeight: 600,
            }}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      onClick: (row: any) =>
        row?.scheme_code && router.push(`/incentive_management/view/${encodeURIComponent(row.scheme_code)}`),
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: "Edit",
      color: "primary",
      onClick: (row: any) => {
        if (!row?.scheme_code) return;
        if (row.can_edit || row.edit_limited_to_dates) {
          router.push(`/incentive_management/edit/${encodeURIComponent(row.scheme_code)}`);
          return;
        }
        setSnackbarMessage("This scheme cannot be edited in the current date/status state.");
      },
    },
    {
      icon: <ContentCopyIcon fontSize="small" />,
      label: "Clone",
      onClick: (row: any) => {
        if (!row?.scheme_code) return;
        setCloneSchemeCode(String(row.scheme_code));
      },
      color: "success",
    },
  ];

  return (
    <>
      <DynamicGroupTable
        data={schemes}
        columns={columns as any}
        searchPlaceholder="Search schemes..."
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
        showCreateButton
        createButtonLabel="Add Scheme"
        onCreate={() => router.push("/incentive_management/create")}
      />

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 100 }}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert severity="warning" variant="filled" onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ActionConfirmationDialog
        open={Boolean(cloneSchemeCode)}
        title="Clone Scheme"
        message="Are you sure you want to clone this scheme?"
        confirmText="Clone"
        confirmVariant="brand"
        onClose={() => setCloneSchemeCode(null)}
        onConfirm={() => {
          if (!cloneSchemeCode) return;
          const target = cloneSchemeCode;
          setCloneSchemeCode(null);
          router.push(`/incentive_management/create?clone_from=${encodeURIComponent(target)}`);
        }}
      />
    </>
  );
};

export default IncentiveSchemeTableWrapper;
