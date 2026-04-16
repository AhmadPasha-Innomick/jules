"use client";

import React, { useMemo, useState } from "react";
import { Delete } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DynamicTable from "@/components/common/DynamicLogTable";
import { useLogs } from "@/hooks/useLog";
import { useRouter } from "next/navigation";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useDeleteLog, useExportLogs } from "@/hooks/useLog";

type ActivityLogRow = {
  Id: number;
  username: string;
  login_successful: "Y" | "N";
  Reason: string;
  IP_address: string;
  created_date_time: string;
};

export default function ActivityLog() {
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");


  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [logToDelete, setLogToDelete] = useState<ActivityLogRow | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const deleteLogMutation = useDeleteLog(); 
  const exportLogMutation = useExportLogs();


  const searchParam = useMemo(() => {
    if (!globalFilter || typeof globalFilter !== "string") return undefined;
    const trimmed = globalFilter.trim();
    return trimmed === "" ? undefined : trimmed;
  }, [globalFilter]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLogs({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: searchParam,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });


  const rows = useMemo(() => {
    return data?.data?.logs ?? [];
  }, [data]);

  const totalCount = data?.data?.totalCount ?? 0;

  const columns = [
    { accessorKey: "username", header: "Username", enableSorting: false },

    { accessorKey: "Reason", header: "Reason", enableSorting: false },
    { accessorKey: "IP_address", header: "IP Address", enableSorting: false },
    { accessorKey: "latitude", header: "Latitude", enableSorting: false },
    { accessorKey: "longtude", header: "Longtude", enableSorting: false },
    { accessorKey: "app_version", header: "App Version", enableSorting: false },
    {
      header: "Date & Time",
      enableSorting: false,
      accessorFn: (row: ActivityLogRow) => {
        if (!row.created_date_time) return "-";

        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date(row.created_date_time));
      },
    },

  ];

  const handleDeleteClick = (row: ActivityLogRow) => {
    setLogToDelete(row);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!logToDelete) return;

    deleteLogMutation.mutate(
      { log_id: logToDelete.Id },
      {
        onSuccess: () => {
          setDeleteSuccess(true);
          refetch();
        },
        onError: (err: any) => {
          setDeleteError(err?.message || "Failed to delete log");
        },
        onSettled: () => {
          setOpenDeleteDialog(false);
          setLogToDelete(null);
        },
      }
    );
  };

  const isApplyDisabled = !draftStartDate || !draftEndDate || draftEndDate <= draftStartDate;

  const handleApplyDates = () => {
    if (!draftStartDate || !draftEndDate) {
      setDateError("Please select both From Date and To Date.");
      return;
    }

    if (draftEndDate <= draftStartDate) {
      setDateError("To Date must be greater than From Date.");
      return;
    }

    setDateError(null);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearDates = () => {
    setDateError(null);
    setDraftStartDate("");
    setDraftEndDate("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleExport = async () => {
    try {
      setExportError(null);

      const blob = await exportLogMutation.mutateAsync({
        search: searchParam,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      const fileName = `LoginActivityExport_${new Date().toISOString().split("T")[0]}.csv`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setExportError(error?.message || "Failed to export logs");
    }
  };

  return (
    <div className="space-y-6">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
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
        <Button variant="outlined" onClick={handleClearDates}>
          Clear Dates
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exportLogMutation.isPending}
        >
          {exportLogMutation.isPending ? "Exporting..." : "Export CSV"}
        </Button>
      </Box>

      {dateError && <Alert severity="error">{dateError}</Alert>}
      {exportError && <Alert severity="error">{exportError}</Alert>}


      <DynamicTable
        data={rows}
        columns={columns}
        rowActions={[
          {
            icon: <VisibilityIcon fontSize="small" />,
            label: "View",
            onClick: (row: ActivityLogRow) => router.push(`/activity_logs/view/${row.Id}`),
          },
          {
            icon: <Delete fontSize="small" />,
            label: "Delete",
            color: "error" as const,
            onClick: handleDeleteClick,
          },
        ]}


        enableServerSide
        pagination={pagination}
        onPaginationChange={setPagination}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        totalRowCount={totalCount}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={error}
        refetch={refetch}
        showCreateButton={false}



      />
   
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Log Entry</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete log ID <strong>{logToDelete?.Id}</strong> for user <strong>{logToDelete?.username}</strong>?
          <br />
          <span className="text-sm text-gray-600">This action cannot be undone.</span>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteLogMutation.isPending}
          >
            {deleteLogMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

   
      <Snackbar open={deleteSuccess} autoHideDuration={8000} onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "72px", 
          zIndex: (theme) => theme.zIndex.modal + 100, 
        }}>
        <Alert severity="success" variant="filled" onClose={() => setDeleteSuccess(false)}>
          Log deleted successfully!
        </Alert>
      </Snackbar>

    
      <Snackbar open={!!deleteError} autoHideDuration={8000} onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "72px", 
          zIndex: (theme) => theme.zIndex.modal + 100,
        }}
      >
        <Alert severity="error" variant="filled" onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      </Snackbar>
    </div>
  );
}
