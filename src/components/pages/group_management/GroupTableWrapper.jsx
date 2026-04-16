"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicGroupTable from "@/components/common/DynamicGroupTable";
import { useGroups, useDeleteGroup } from "@/hooks/useGroups";

import {
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const GroupTableWrapper = () => {
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [searchBy, setSearchBy] = useState("group_name");
  const [searchValue, setSearchValue] = useState("");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [globalFilter, setGlobalFilter] = useState("");

  const apiParams = useMemo(() => {
    const params = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      globalFilter,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (searchValue) {
      params.searchBy = searchBy;
      params.searchValue = searchValue;
    }

    columnFilters.forEach((filter) => {
      if (filter.value) params[filter.id] = filter.value;
    });

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    return params;
  }, [pagination, columnFilters, sorting, searchBy, searchValue, globalFilter]); // <-- include globalFilter


  const {
    data: groupResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGroups(apiParams);

  const deleteGroupMutation = useDeleteGroup();

  const handleOpenDeletePopup = (row) => {
    if (!row) return;
    setSelectedGroup(row);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteGroup = () => {
    if (!selectedGroup) return;
    setIsDeleting(true);
    if (!selectedGroup?.group_id) return;
    deleteGroupMutation.mutate(
      { group_id: selectedGroup.group_id },
      {
        onSuccess: () => {
          setDeleteSuccess(true);
          refetch();
        },
        onError: (err) => {
          setDeleteError(err?.message || "Failed to delete group");
        },
        onSettled: () => {
          setIsDeleting(false);
          setOpenDeleteDialog(false);
          setSelectedGroup(null);
        },
      }
    );
  };

  const groups = groupResponse?.data?.groups || [];
  const totalRowCount = groupResponse?.data?.totalCount || 0;

  const columns = [
    {
      accessorKey: "group_name",
      header: "Group Name",
      size: 160,
      enableSorting: false,
    },

    {
      accessorKey: "msisdn_pool",
      header: "MSISDN Pool",
      size: 160,
      Cell: ({ cell }) => cell.getValue() ?? "N/A",
      enableSorting: false,
    },
    {
      accessorKey: "imei_pool",
      header: "IMEI Pool",
      size: 160,
      Cell: ({ cell }) => cell.getValue() ?? "N/A",
      enableSorting: false,
    },
    {
      accessorKey: "employment_id",
      header: "Employment ID",
      size: 80,
      enableSorting: false,

      muiTableHeadCellProps: {
        align: "center",
      },
      muiTableBodyCellProps: {
        align: "center",
      },

      Cell: ({ cell }) => (
        <span style={{ display: "block", textAlign: "center" }}>
          {cell.getValue() ?? "N/A"}
        </span>
      ),
    },

    {
      accessorKey: "mnp_charge",
      header: "MNP Charge",
      size: 100,
      enableSorting: false,

      muiTableHeadCellProps: {
        align: "center",
      },
      muiTableBodyCellProps: {
        align: "center",
      },

      Cell: ({ cell }) => (
        <span style={{ display: "block", textAlign: "center" }}>
          {cell.getValue() ?? "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "sim_swap_charge",
      header: "Sim Swap Charge",
      size: 100,
      enableSorting: false,

      muiTableHeadCellProps: {
        align: "center",
      },
      muiTableBodyCellProps: {
        align: "center",
      },

      Cell: ({ cell }) => (
        <span style={{ display: "block", textAlign: "center" }}>
          {cell.getValue() ?? "N/A"}
        </span>
      ),
    },

    {
      accessorKey: "is_active",
      header: "Status",
      size: 80,
      filterVariant: "select",
      enableSorting: false,
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
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      onClick: (row) =>
        row?.group_id && router.push(`/group_management/view/${row.group_id}`),
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: "Edit",
      onClick: (row) =>
        row?.group_id && router.push(`/group_management/edit/${row.group_id}`),
      color: "primary",
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      label: "Delete",
      color: "error",
      onClick: (row) => row?.group_id && handleOpenDeletePopup(row),
    },
  ];

  const handleAddNew = () => router.push("/group_management/create");

  return (
    <>
      <DynamicGroupTable
        enableColumnOrdering={false}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onColumnFiltersChange={setColumnFilters}
        onSortingChange={setSorting}
        pagination={pagination}
        columnFilters={columnFilters}
        sorting={sorting}
        totalRowCount={totalRowCount}
        data={groups}
        columns={columns}
        rowActions={rowActions}
        showCreateButton
        createButtonLabel="Add Group"
        onCreate={handleAddNew}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={error}
        refetch={refetch}
        enableServerSide
        muiTableProps={{
          enableColumnFilters: false,
          enablePagination: true,
          enableSorting: true,
          muiSearchTextFieldProps: {
            placeholder: "Search groups...",
            size: "small",
            variant: "outlined",
            InputProps: {
              startAdornment: null,
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
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete{" "}
          <strong>{selectedGroup?.group_name || "this group"}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteGroup}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(deleteSuccess || deleteError)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          top: 110,
        }}
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
          {deleteSuccess ? "Group deleted successfully!" : deleteError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GroupTableWrapper;
