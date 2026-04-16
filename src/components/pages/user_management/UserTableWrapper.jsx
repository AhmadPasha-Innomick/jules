"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useUsers, useDeleteUser } from "@/hooks/useApi";
import DynamicTable from "@/components/common/DynamicTable";
import UserBulkImportPanel from "@/components/pages/user_management/UserBulkImportPanel";

import {
  Alert,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const UserTableWrapper = () => {
  const router = useRouter();
  const { data: authUser } = useAuthUser();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterError, setDateFilterError] = useState("");

  const apiParams = useMemo(() => {
    const params = {
      offset: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    };
    if (columnFilters.length > 0) {
      const searchFilter = columnFilters.find((f) =>
        ["user_name", "email", "idnumber", "terminalid"].includes(f.id)
      );
      if (searchFilter?.value) {
        params.search_by = searchFilter.id;
        params.search_value = String(searchFilter.value);
      }
    }


    columnFilters.forEach((filter) => {
      if (
        ["terminalid", "email", "user_name", "idnumber"].includes(filter.id)
      ) {
        return;
      }

      params[`filter_by[${filter.id}]`] = String(filter.value);
    });

    if (sorting?.length > 0 && sorting[0]?.id) {
      params.sort_by = sorting[0].id;
      params.sort_order = sorting[0].desc ? "desc" : "asc";
    }

    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return params;
  }, [pagination, columnFilters, sorting, startDate, endDate]);
  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUsers(apiParams);
  const deleteUserMutation = useDeleteUser();
  const exportFilters = useMemo(() => {
    const filters = {};

    const searchFilter = columnFilters.find((f) =>
      ["user_name", "email", "idnumber", "terminalid"].includes(f.id)
    );
    if (searchFilter?.value) {
      filters.search_by = searchFilter.id;
      filters.search_value = searchFilter.value;
    }

    columnFilters.forEach((filter) => {
      if (["terminalid", "email", "user_name", "idnumber"].includes(filter.id)) {
        return;
      }

      filters[`filter_by[${filter.id}]`] = String(filter.value);
    });

    if (sorting?.length > 0 && sorting[0]?.id) {
      filters.sort_by = sorting[0].id;
      filters.sort_order = sorting[0].desc ? "desc" : "asc";
    }

    if (startDate) {
      filters.start_date = startDate;
    }

    if (endDate) {
      filters.end_date = endDate;
    }

    return filters;
  }, [columnFilters, sorting, startDate, endDate]);

  const handleOpenDeletePopup = (row) => {
    if (!row) return;
    setSelectedUser(row);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    if (!selectedUser?.id) return;
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

  const users = usersResponse?.data?.users || [];
  const totalRowCount = usersResponse?.data?.totalCount || 0;

  const columns = [
    {
      accessorKey: "user_name",
      header: "Username",
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 180,
      enableSorting: false,
      Cell: ({ cell }) => {
        const email = cell.getValue();
        return typeof email === "string" && email.trim() !== "" ? email : "N/A";
      },
    },
    {
      accessorKey: "user_firstname",
      header: "First Name",
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: "user_lastname",
      header: "Last Name",
      size: 120,
      enableSorting: false,
    },
   

    {
      accessorKey: "is_manager",
      header: "Is Manager",
      size: 120,
      enableSorting: false,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" },
      ],
      Cell: ({ cell }) => {
        const isManager = Number(cell.getValue()) === 1;
        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: isManager ? "#e7f7ef" : "#f2f4f7",
              color: isManager ? "#12b76a" : "#344054",
              fontWeight: 600,
            }}
          >
            {isManager ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      size: 100,
      enableSorting: false,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
      ],
      Cell: ({ cell }) => {
        const active = Number(cell.getValue());
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
    {
      accessorKey: "created_date_time",
      header: "Created At",
      enableSorting: false,
      size: 120,
      Cell: ({ cell }) =>
        cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : "-",
    },
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      onClick: (row) =>
        row?.id && router.push(`/user_management/view/${row.id}`),

      color: "info",
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: "Edit",
      onClick: (row) =>
        row?.id && router.push(`/user_management/edit/${row.id}`),
      color: "primary",
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      label: "Delete",
      color: "error",
      onClick: (row) => row?.id && handleOpenDeletePopup(row),
    },
  ];

  const handleAddNew = () => router.push("/user_management/create");
  const handleApplyDates = () => {
    if (!draftStartDate || !draftEndDate) {
      setDateFilterError("Please select both From Date and To Date.");
      return;
    }

    if (draftEndDate <= draftStartDate) {
      setDateFilterError("To Date must be greater than From Date.");
      return;
    }

    setDateFilterError("");
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearDates = () => {
    setDateFilterError("");
    setDraftStartDate("");
    setDraftEndDate("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const isApplyDisabled =
    !draftStartDate || !draftEndDate || draftEndDate <= draftStartDate;

  return (
    <>
      <UserBulkImportPanel onImportCompleted={refetch} />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 1.5,
        }}
      >
        <TextField
          size="small"
          label="From Date"
          type="date"
          value={draftStartDate}
          onChange={(e) => setDraftStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: draftEndDate || undefined }}
        />
        <TextField
          size="small"
          label="To Date"
          type="date"
          value={draftEndDate}
          onChange={(e) => setDraftEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: draftStartDate || undefined }}
        />
        <Button
          variant="contained"
          onClick={handleApplyDates}
          disabled={isApplyDisabled}
          sx={{
            backgroundColor: isApplyDisabled ? "#e5e7eb !important" : undefined,
            color: isApplyDisabled ? "#9ca3af !important" : undefined,
            opacity: isApplyDisabled ? 1 : undefined,
            "&.Mui-disabled": {
              backgroundColor: "#e5e7eb !important",
              color: "#9ca3af !important",
              opacity: 1,
            },
          }}
        >
          Apply Dates
        </Button>
        <Button
          variant="outlined"
          onClick={handleClearDates}
        >
          Clear Dates
        </Button>
      </Box>
      {dateFilterError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {dateFilterError}
        </Alert>
      )}

      <DynamicTable
        enableColumnOrdering={false}
        data={users}
        columns={columns}
        rowActions={rowActions}
        exportParams={exportFilters}
        showCreateButton
        createButtonLabel="Add User"
        onCreate={handleAddNew}
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
        muiTableProps={{
          enableColumnFilters: false,
          enablePagination: true,
          enableSorting: true,
          muiSearchTextFieldProps: {
            placeholder: "Search users...",
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
        open={Boolean(deleteSuccess || deleteError)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 110 }}
        onClose={() => {
          setDeleteSuccess(false);
          setDeleteError(null);
        }}
      >
        <Alert
          severity={deleteSuccess ? "success" : "error"}
          variant="filled"
          onClose={() => {
            setDeleteSuccess(false);
            setDeleteError(null);
          }}
        >
          {deleteSuccess ? "User deleted successfully!" : deleteError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserTableWrapper;
