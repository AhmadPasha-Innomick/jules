"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useIncidents } from "@/hooks/useIncident";
import DynamicTable from "@/components/common/IncidentTable";
import { useExportIncidents } from "@/hooks/useExportIncidents";
import {
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const UserTableWrapper = () => {
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [searchBy, setSearchBy] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const apiParams = useMemo(() => {
    const params = {};

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

    if (startDate) {
      params.start_date = startDate.format("YYYY-MM-DD");
    }

    if (endDate) {
      params.end_date = endDate.format("YYYY-MM-DD");
    }

    if (sorting.length > 0) {
      params.sort_by = sorting[0].id;
      params.sort_order = sorting[0].desc ? "desc" : "asc";
    }

    return params;
  }, [pagination, columnFilters, sorting, searchValue, startDate, endDate]);

  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useIncidents(apiParams, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
  const { mutateAsync: exportIncidents, isPending: isExporting } = useExportIncidents();

  const exportFilters = useMemo(() => {
    const filters = {};

    columnFilters.forEach((filter) => {
      if (filter.value !== undefined && filter.value !== null && String(filter.value).trim() !== "") {
        filters[filter.id] = String(filter.value);
      }
    });

    if (sorting.length > 0) {
      filters.sortBy = sorting[0].id;
      filters.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    return filters;
  }, [columnFilters, sorting]);

  const handleExport = async () => {
    try {
      const params = { ...exportFilters };
      if (params.sortBy) {
        params.sort_by = params.sortBy;
        delete params.sortBy;
      }
      if (params.sortOrder) {
        params.sort_order = params.sortOrder;
        delete params.sortOrder;
      }

      const blob = await exportIncidents(params);
      const fileName = `IncidentsExport_${new Date().toISOString().split("T")[0]}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Incident export failed:", error);
    }
  };

  const incidents = usersResponse?.data?.incidents || [];
  const totalRowCount = usersResponse?.data?.totalCount || 0;
  const columns = [
    {
      accessorKey: "incident_id",
      header: "Incident ID",
      size: 50,
      enableSorting: false,
    },
    {
      accessorKey: "category_name",
      header: "Category",
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: "sub_category_name",
      header: "Sub Category",
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: "created_by",
      header: "CreatedBy",
      size: 100,
      enableSorting: false,
    },

    {
      accessorKey: "status",
      header: "Status",
      size: 80,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Open", value: "open" },
        { label: "Closed", value: "close" },
      ],
      Cell: ({ cell }) => {
        const status = String(cell.getValue());
        const isOpen = status === "open";
        const statusLabel = status === "close" ? "Closed" : status;

        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: isOpen ? "#e7f7ef" : "#fef2f2",
              color: isOpen ? "#12b76a" : "#f04438",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {statusLabel}
          </span>
        );
      },
      enableSorting: false,
    },

    {
      accessorKey: "created_date_time",
      header: "Created At",
      size: 100,
      enableSorting: false,
      Cell: ({ cell }) =>
        cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : "-",
    },
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      onClick: (row) => router.push(`/incident_management/view/${row.incident_id}`),
      color: "info",
    },
  ];

  return (
    <>
      <DynamicTable
        enableColumnOrdering={false}
        data={incidents}
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
            placeholder: "Search incidents...",
            size: "small",
            variant: "outlined",
          },
          muiTableProps: {
            sx: {
              "& .MuiTableCell-head": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
            },
          },
        }}
      />

      <Snackbar
        open={deleteSuccess}
        autoHideDuration={4000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => setDeleteSuccess(false)}
          variant="filled"
        >
          User deleted successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!deleteError}
        autoHideDuration={10000}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="error"
          onClose={() => setDeleteError(null)}
          variant="filled"
        >
          {deleteError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserTableWrapper;
