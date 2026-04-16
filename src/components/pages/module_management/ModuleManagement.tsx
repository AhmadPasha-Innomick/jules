"use client";

import React, { useMemo, useState } from "react";
import DynamicTable from "@/components/common/DynamicModuleTable";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useRouter } from "next/navigation";
import { IconButton, Box } from "@mui/material";
import { CircularProgress } from "@mui/material";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  AlertTitle,
} from "@mui/material";

import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
} from "@/hooks/useModules";

import type { ModuleRow } from "@/types/module"

export default function ModuleManagement() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Array<{ id: string; value: any }>>([]);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [newModule, setNewModule] = useState({
    module_name: "",
    module_slug: "",
    module_category: "",
    module_desc: "",
    is_active: 1 as 0 | 1,
  });

  const [editModule, setEditModule] = useState<ModuleRow | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleRow | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
    };
    if (globalFilter) params.search = globalFilter;
    columnFilters.forEach((f) => {
      if (f.id && (f.value || f.value === 0)) params[f.id] = f.value;
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


  const tableData: ModuleRow[] = data?.data ?? [];
  const totalCount: number = data?.totalCount ?? 0;

  const formatStatus = (v: number) => (v === 1 ? "Active" : "Inactive");


  const handleSubmitCreate = async () => {
    try {
      const response = await createModule.mutateAsync({
        module_name: newModule.module_name,
        module_slug: newModule.module_slug || newModule.module_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        module_category: newModule.module_category,
        module_desc: newModule.module_desc,
        is_active: newModule.is_active,
      });

      setOpenCreate(false);
      setNewModule({ module_name: "", module_slug: "", module_category: "", module_desc: "", is_active: 1 });
      setSuccessMsg(response?.message || "Module Created Successfully.");
      refetch();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create module");
    }
  };

  const handleEditModule = (row: ModuleRow) => {
    setEditModule(row);
    setOpenEditDialog(true);
  };

  const handleSubmitEdit = async () => {
    if (!editModule) return;

    try {
      const response = await updateModule.mutateAsync({
        module_id: editModule.module_id,
        module_name: editModule.module_name,
        module_category: editModule.module_category,
        module_desc: editModule.module_desc,
        is_active: editModule.is_active,

      });

      setOpenEditDialog(false);
      setEditModule(null);
      setSuccessMsg(response?.message || "Module updated successfully!");

      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update module");
    }
  };

  const handleDeleteClick = (row: ModuleRow) => {
    setSelectedModule(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedModule?.module_id) return;

    try {
      const response = await deleteModule.mutateAsync({
        module_id: selectedModule.module_id,

      });

      setOpenDeleteDialog(false);
      setSelectedModule(null);
      setSuccessMsg(response?.message || "Module deleted successfully!");
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete module");
    }
  };
  const handleResetSearch = () => {

    if (refetch) {
      refetch();
    }
  };

  const handleAddNew = () => router.push("/module_management/create");


  const columns = useMemo(
    () => [
      { accessorKey: "module_name", header: "Module Name" },
      { accessorKey: "module_desc", header: "Description", enableSorting: false, },
      {
        accessorKey: "is_active",
        header: "Status",
        filterVariant: "select" as const,
        enableSorting: false,
        filterSelectOptions: [
          { text: "All", value: "" },
          { text: "Active", value: "1" },
          { text: "Inactive", value: "0" },
        ],
        Cell: ({ cell }: any) => {
          const value = Number(cell.getValue());
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${value === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >
              {formatStatus(value)}
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
        label: "Edit",
        onClick: (row) => router.push(`/module_management/edit/${row.module_id}`),
      },
      {
        icon: <DeleteIcon className="text-red-600" />,
        label: "Delete",
        onClick: (row: ModuleRow) => {
          setSelectedModule(row);
          setOpenDeleteDialog(true);
        },
        color: "error" as const,
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center py-20">
        <IconButton color="primary" onClick={handleResetSearch} disabled>
          <CircularProgress color="primary" />
        </IconButton>
      </Box>
    );
  }

  if (isError) return <div className="p-8 text-center text-red-600">Error loading modules</div>;

  return (
    < >
      <DynamicTable
        data={tableData}
        columns={columns}
        totalRowCount={totalCount}
        showCreateButton
        createButtonLabel="Add Module"
        onCreate={handleAddNew}
        rowActions={rowActions}
        isLoading={isLoading}
        refetch={refetch}
        enableServerSide
        onPaginationChange={setPagination}
        onGlobalFilterChange={setGlobalFilter}
        onColumnFiltersChange={setColumnFilters}
        onSortingChange={setSorting}
        pagination={pagination}
        globalFilter={globalFilter}
        columnFilters={columnFilters}
        sorting={sorting}
        muiTableProps={{
          enableColumnFilters: false,
          enablePagination: true,
          enableSorting: true,
          muiSearchTextFieldProps: {
            placeholder: "Search Modules...",
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

  
      <Dialog open={openCreate} onClose={() => !createModule.isPending && setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle className="text-2xl font-bold">Create New Module</DialogTitle>
        <DialogContent dividers className="space-y-5">
          <TextField
            autoFocus
            required
            fullWidth
            label="Module Name"
            value={newModule.module_name}
            onChange={(e) => {
              const name = e.target.value;
              setNewModule({
                ...newModule,
                module_name: name,
                module_slug: name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
              });
            }}
            disabled={createModule.isPending}
          />
          <TextField required fullWidth label="Slug" sx={{ mt: 2 }} value={newModule.module_slug} onChange={(e) => setNewModule({ ...newModule, module_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} disabled={createModule.isPending} />
          <TextField required fullWidth label="Category" sx={{ mt: 2 }} value={newModule.module_category} onChange={(e) => setNewModule({ ...newModule, module_category: e.target.value })} disabled={createModule.isPending} />
          <TextField required fullWidth label="Description" sx={{ mt: 2 }} multiline rows={4} value={newModule.module_desc} onChange={(e) => setNewModule({ ...newModule, module_desc: e.target.value })} disabled={createModule.isPending} />
          <FormControlLabel
            control={<Switch checked={newModule.is_active === 1} onChange={(e) => setNewModule({ ...newModule, is_active: e.target.checked ? 1 : 0 })} disabled={createModule.isPending} />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)} disabled={createModule.isPending}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitCreate} disabled={createModule.isPending || !newModule.module_name.trim() || !newModule.module_category.trim() || !newModule.module_desc.trim()}>
            {createModule.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>



   
      <Dialog open={openDeleteDialog} onClose={() => !deleteModule.isPending && setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-2xl font-bold text-red-700 flex items-center gap-3">
          <DeleteForeverIcon /> Delete Module
        </DialogTitle>
        <DialogContent dividers>

          <div className="py-4 bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-bold text-lg text-red-700">{selectedModule?.module_name}</p>
            <p className="text-sm text-gray-600">ID: {selectedModule?.module_id}</p>
            <p className="text-sm text-gray-600">Category: {selectedModule?.module_category}</p>
          </div>
        </DialogContent>


        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleteModule.isPending}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteModule.isPending}
            startIcon={<DeleteForeverIcon />}
          >
            {deleteModule.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>


      </Dialog>


      <Snackbar open={!!successMsg || !!errorMsg} autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }} onClose={() => { setSuccessMsg(""); setErrorMsg(""); }}>
        <Alert severity={successMsg ? "success" : "error"} variant="filled">
          {successMsg || errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
}























