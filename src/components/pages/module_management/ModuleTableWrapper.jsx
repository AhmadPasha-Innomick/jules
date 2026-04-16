"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useUsers, useDeleteUser } from "@/hooks/useApi";
import DynamicTable from "@/components/common/DynamicModuleTable";
import { useExportUsers } from "@/hooks/useExportUsers";

import {
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
} from "@/hooks/useModules";

const UserTableWrapper = () => {
  const router = useRouter();
  const { data: authUser } = useAuthUser();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [searchBy, setSearchBy] = useState("username");
  const [searchValue, setSearchValue] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [globalFilter]);

  const apiParams = useMemo(() => {
    const params = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      _refresh: refreshKey,
    };

    if (globalFilter) {
      params.search = globalFilter.trim();
    }

    columnFilters.forEach((f) => {
      if (f.id && (f.value || f.value === "0" || f.value === "1")) {
        params[`filter_by[${f.id}]`] = f.value;
      }
    });

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    return params;
  }, [pagination, globalFilter, columnFilters, sorting]);

  const { data, isLoading, isError, error, refetch } = useModules(apiParams);

  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const tableData = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;

  const exportFilters = useMemo(() => {
    const filters = {};
    if (searchValue) {
      filters.searchBy = searchBy;
      filters.searchValue = searchValue;
    }
    columnFilters.forEach((filter) => {
      if (filter.value) filters[filter.id] = filter.value;
    });
    if (sorting.length > 0) {
      filters.sortBy = sorting[0].id;
      filters.sortOrder = sorting[0].desc ? "desc" : "asc";
    }
    return filters;
  }, [searchBy, searchValue, columnFilters, sorting]);

  const {
    data: fileBlob,
    isLoading: isExporting,
    refetch: refetchExport,
  } = useExportUsers(exportFilters);

  const handleOpenDeletePopup = (row) => {
    setSelectedUser(row);
    setOpenDeleteDialog(true);
  };

  const handleAddNew = () => router.push("/module_management/create");

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setDeleteSuccess(true);
        refetch();
      },
      onError: (err) => {
        setDeleteError(err?.message || "Failed to delete user");
      },
      onSettled: () => {
        setIsDeleting(false);
        setOpenDeleteDialog(false);
        setSelectedUser(null);
      },
    });
  };
  const handleRefresh = () => {
    // Reset pagination to first page
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
    setRefreshKey((prev) => prev + 1);
    // Optional: clear filters/search
    setGlobalFilter("");
    setColumnFilters([]);
    setSorting([]);

    // Force API call
    refetch({ cancelRefetch: false });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "module_name",
        header: "Module Name",
        size: 70,
        enableSorting: false,
      },
      {
        accessorKey: "module_desc",
        header: "Description",
        enableSorting: false,
      },
      {
        accessorKey: "is_active",
        header: "Status",
        filterVariant: "select",
        size: 120,
        enableSorting: false,
        filterSelectOptions: [
          { text: "Active", value: "1" },
          { text: "Inactive", value: "0" },
        ],
        Cell: ({ cell }) => {
          const value = cell.getValue(); // this will be "1" or "0" or 1 or 0
          const isActive = String(value) === "1";
          const statusText = isActive ? "Active" : "Inactive";

          return (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {statusText}
            </span>
          );
        },
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        icon: <EditIcon fontSize="small" />,
        size: 120,
        label: "Edit",
        onClick: (row) =>
          router.push(`/module_management/edit/${row.module_id}`),
      },
      // {
      //   icon: <DeleteIcon className="text-red-600" />,
      //   label: "Delete",
      //   onClick: (row) => {
      //     setSelectedModule(row);
      //     setOpenDeleteDialog(true);
      //   },
      //   color: "error",
      // },
    ],
    []
  );

  const handleImport = () => console.log("Import Users Called");

  return (
    <>
      <DynamicTable
        isLoading={isLoading}
        data={tableData}
        columns={columns}
        onImport={null}
        rowActions={rowActions}
        totalRowCount={totalCount}
        isError={isError}
        error={error}
        refetch={handleRefresh}
        enableServerSide={true}
        onPaginationChange={setPagination}
        onColumnFiltersChange={setColumnFilters}
        onSortingChange={setSorting}
        pagination={pagination}
        onGlobalFilterChange={setGlobalFilter}
        globalFilter={globalFilter}
        columnFilters={columnFilters}
        sorting={sorting}
        showCreateButton={false}
        createButtonLabel="Add Module"
        onCreate={handleAddNew}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete{" "}
          <strong>{selectedUser?.user_name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteUser}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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
