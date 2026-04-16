"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicTable from "@/components/common/DynamicProductPlansTable";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Tab,
  Tabs,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDeleteDevice, useDeviceList } from "@/hooks/useDeviceCatalogue";

type StatusTab = "all" | "active" | "inactive" | "new";

const getStatusValue = (row: any) => {
  if (row?.status === null || row?.status === "null") return null;

  if (row?.status !== undefined && row?.status !== null && row?.status !== "") {
    const parsed = Number(row.status);
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (row?.is_active === null || row?.is_active === "null") return null;

  if (row?.is_active !== undefined && row?.is_active !== null && row?.is_active !== "") {
    const parsed = Number(row.is_active);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return null;
};

const getStatusMeta = (row: any) => {
  const value = getStatusValue(row);

  if (value === 1) {
    return { label: "Active", color: "success" as const };
  }

  if (value === 0) {
    return { label: "Inactive", color: "default" as const };
  }

  return { label: "New", color: "warning" as const };
};

export default function DeviceList() {
  const router = useRouter();
  const deleteMutation = useDeleteDevice();

  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [sorting, setSorting] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDeleteRow, setSelectedDeleteRow] = useState<any>(null);

  const apiParams = useMemo(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: globalFilter || "",
      status: statusTab,
      sort_by: "created_at",
      sort_order: "desc" as const,
    }),
    [pagination, globalFilter, statusTab]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useDeviceList(apiParams);

  const rows = data?.data?.devices || [];
  const totalRowCount = data?.data?.totalCount || 0;

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, statusTab]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "device_id",
        header: "Device ID",
        enableSorting: false,
      },
      {
        accessorKey: "brand",
        header: "Brand",
        enableSorting: false,
      },
      {
        accessorKey: "device_name",
        header: "Device Name",
        enableSorting: false,
      },
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: false,
        Cell: ({ cell }: any) => cell.getValue() || "N/A",
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        Cell: ({ row }: any) => {
          const meta = getStatusMeta(row.original);
          return <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />;
        },
      },
    ],
    []
  );

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      onClick: (row: any) => {
        router.push(`/product_catalogue/device/view/${row.device_id}`);
      },
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: "Edit",
      onClick: (row: any) => {
        router.push(`/product_catalogue/device/edit/${row.device_id}`);
      },
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      label: "Delete",
      color: "error",
      onClick: (row: any) => {
        setSelectedDeleteRow(row);
        setOpenDeleteDialog(true);
      },
    },
  ];

  const handleConfirmDelete = async () => {
    if (!selectedDeleteRow?.device_id) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");

      await deleteMutation.mutateAsync({
        device_id: Number(selectedDeleteRow.device_id),
      });

      setOpenDeleteDialog(false);
      setSelectedDeleteRow(null);
      setSuccessMsg("Device deleted successfully");
      refetch();
    } catch (err: any) {
      const apiError = err?.response?.data || err;
      setErrorMsg(apiError?.message || "Failed to delete device");
    }
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={statusTab} onChange={(_, value) => setStatusTab(value)}>
          <Tab label="All" value="all" />
          <Tab label="Active" value="active" />
          <Tab label="Inactive" value="inactive" />
          <Tab label="New" value="new" />
        </Tabs>
      </Box>

      <DynamicTable
        data={rows}
        columns={columns}
        rowActions={rowActions.filter((action) => action.label !== "Delete")}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={error as Error}
        refetch={refetch}
        createButtonLabel="Create Device"
        onCreate={() => router.push("/product_catalogue/device/create")}
        showCreateButton={false}
        enableServerSide={true}
        onPaginationChange={setPagination}
        onGlobalFilterChange={setGlobalFilter}
        onColumnFiltersChange={setColumnFilters}
        onSortingChange={setSorting}
        pagination={pagination}
        globalFilter={globalFilter}
        columnFilters={columnFilters}
        sorting={sorting}
        totalRowCount={totalRowCount}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Device</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete <strong>{selectedDeleteRow?.device_name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successMsg || errorMsg)}
        autoHideDuration={4000}
        onClose={() => {
          setSuccessMsg("");
          setErrorMsg("");
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: "72px", zIndex: (theme) => theme.zIndex.modal + 100 }}
      >
        <Alert severity={errorMsg ? "error" : "success"} variant="filled">
          {errorMsg || successMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}
