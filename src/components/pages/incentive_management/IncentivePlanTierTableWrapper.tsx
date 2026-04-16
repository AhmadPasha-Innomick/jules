"use client";

import React, { useMemo, useRef, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import * as XLSX from "xlsx";
import ActionConfirmationDialog from "@/components/common/ActionConfirmationDialog";
import DynamicGroupTable from "@/components/common/DynamicGroupTable";
import Button from "@/components/ui/button/Button";
import {
  useImportIncentivePlanTiers,
  useIncentivePlanTiers,
  useUpdateIncentivePlanTier,
} from "@/hooks/useIncentiveSchemes";
import type { IncentivePlanTier } from "@/types/incentive";

type ImportFailure = {
  row_number: number;
  reason: string;
  row: Record<string, any>;
};

type ImportReport = {
  total: number;
  inserted: number;
  failed: number;
};

const emptyForm: IncentivePlanTier = {
  plan_product_part_code: "",
  plan_tier: "",
  plan_family: "",
  Type: "",
  active: 1,
};

const IncentivePlanTierTableWrapper = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<IncentivePlanTier | null>(null);
  const [form, setForm] = useState<IncentivePlanTier>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [importFailures, setImportFailures] = useState<ImportFailure[]>([]);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importReportOpen, setImportReportOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isImportingFile, setIsImportingFile] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [confirmImportOpen, setConfirmImportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const listParams = useMemo(() => {
    const params: Record<string, any> = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };
    if (globalFilter) params.search = globalFilter.trim();
    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? "desc" : "asc";
    }
    return params;
  }, [pagination, globalFilter, sorting]);

  const { data, isLoading, isFetching, isError, error: listError, refetch } = useIncentivePlanTiers(listParams);
  const updateMutation = useUpdateIncentivePlanTier();
  const importMutation = useImportIncentivePlanTiers();

  const rows = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const openEdit = (row: IncentivePlanTier) => {
    setEditingTier(row);
    setForm({
      id: row.id,
      plan_product_part_code: row.plan_product_part_code || "",
      plan_tier: row.plan_tier || "",
      plan_family: row.plan_family || "",
      Type: row.Type || "",
      active: Number(row.active) ? 1 : 0,
    });
    setError(null);
    setModalOpen(true);
  };

  const validateForm = () => {
    const productCode = String(form.plan_product_part_code || "").trim();
    if (!productCode) return "Plan product code is required.";
    if (productCode.length > 50) return "Plan product code must be 50 characters or less.";
    if (form.plan_tier && String(form.plan_tier).length > 4) return "Plan tier must be 4 characters or less.";
    if (form.plan_family && String(form.plan_family).length > 10) return "Plan family must be 10 characters or less.";
    const selectedType = String(form.Type || "").trim();
    if (selectedType.length > 10) {
      return "Type must be 10 characters or less.";
    }
    if (![0, 1].includes(Number(form.active))) {
      return "Active must be either 0 or 1.";
    }
    return null;
  };

  const executeUpdate = async () => {
    if (!editingTier?.id) {
      setError("Update requires a valid tier record.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        ...form,
        Type: String(form.Type || "").trim(),
        id: editingTier.id,
      });
      setToast({ type: "success", message: "Plan tier updated successfully." });
      setModalOpen(false);
      setConfirmUpdateOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update plan tier.");
      setConfirmUpdateOpen(false);
    }
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setConfirmUpdateOpen(true);
  };

  const normalizeImportRow = (row: Record<string, any>) => ({
    plan_product_part_code:
      row.plan_product_part_code ??
      row.PlanProductPartCode ??
      row["Plan Product Part Code"] ??
      "",
    plan_tier: row.plan_tier ?? row.PlanTier ?? row["Plan Tier"] ?? "",
    plan_family: row.plan_family ?? row.PlanFamily ?? row["Plan Family"] ?? "",
    Type: row.Type ?? row.type ?? row.TYPE ?? row["Type"] ?? "",
    active: row.active ?? row.Active ?? row["Active"] ?? 1,
  });

  const handleImportFile = async (file?: File | null) => {
    if (!file) return;

    setImportFailures([]);
    setImportReport(null);
    setIsImportingFile(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
      const normalizedRows = jsonRows.map(normalizeImportRow);

      const result = await importMutation.mutateAsync(normalizedRows);
      const failures = result.failures || [];
      setImportFailures(failures);
      setImportReport({
        total: Number(result.total ?? normalizedRows.length),
        inserted: Number(result.inserted || 0),
        failed: Number(result.failed ?? failures.length),
      });
      setImportReportOpen(true);

      if (failures.length > 0) {
        setToast({
          type: "error",
          message: `Import completed. Total: ${result.total ?? normalizedRows.length}, Inserted: ${result.inserted}, Failed: ${result.failed ?? failures.length}`,
        });
      } else {
        setToast({
          type: "success",
          message: `Import successful. Total: ${result.total ?? normalizedRows.length}, Inserted: ${result.inserted}, Failed: 0`,
        });
      }
    } catch (err: any) {
      setImportReport(null);
      setToast({ type: "error", message: err?.message || "Failed to import file." });
    } finally {
      setIsImportingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportSelection = (file?: File | null) => {
    if (!file) return;
    setPendingImportFile(file);
    setConfirmImportOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return;
    const selectedFile = pendingImportFile;
    setConfirmImportOpen(false);
    setPendingImportFile(null);
    await handleImportFile(selectedFile);
  };

  const handleCancelImport = () => {
    setConfirmImportOpen(false);
    setPendingImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const csv = [
      ["plan_product_part_code", "plan_tier", "plan_family", "Type", "active"].join(","),
      ["PLAN12345", "T1", "FAM01", "SampleType", "1"].join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "incentive_plan_tier_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFailedRecords = () => {
    if (!importFailures.length) return;

    const exportRows = importFailures.map((failure) => ({
      row_number: failure.row_number,
      reason: failure.reason || "",
      plan_product_part_code: failure.row?.plan_product_part_code ?? "",
      plan_tier: failure.row?.plan_tier ?? "",
      plan_family: failure.row?.plan_family ?? "",
      Type: failure.row?.Type ?? failure.row?.type ?? "",
      active: failure.row?.active ?? "",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows, {
      header: ["row_number", "reason", "plan_product_part_code", "plan_tier", "plan_family", "Type", "active"],
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Records");
    XLSX.writeFile(workbook, "incentive_plan_tier_failed_records.xlsx");
  };

  const columns = [
    { accessorKey: "plan_product_part_code", header: "Plan Product Code", enableSorting: false, size: 180 },
    { accessorKey: "plan_tier", header: "Plan Tier", enableSorting: false, size: 100, Cell: ({ cell }: any) => cell.getValue() || "-" },
    { accessorKey: "plan_family", header: "Plan Family", enableSorting: false, size: 120, Cell: ({ cell }: any) => cell.getValue() || "-" },
    { accessorKey: "Type", header: "Type", enableSorting: false, size: 110, Cell: ({ cell }: any) => cell.getValue() || "-" },
    {
      accessorKey: "active",
      header: "Status",
      enableSorting: false,
      size: 100,
      Cell: ({ cell }: any) => (Number(cell.getValue()) ? "Active" : "Inactive"),
    },
    {
      accessorKey: "updated_on",
      header: "Updated On",
      enableSorting: false,
      size: 180,
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
  ];

  const rowActions = [
    {
      icon: <EditIcon fontSize="small" />,
      label: "Edit",
      color: "primary",
      onClick: (row: IncentivePlanTier) => openEdit(row),
    },
  ];

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleImportSelection(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 rounded-xl border-brand-300 text-brand-600 hover:border-brand-400 hover:bg-brand-50 px-5 py-2.5 text-sm font-stc-medium"
        >
          <DownloadIcon fontSize="small" />
          Download Template
        </Button>
        <Button
          type="button"
          variant="brand"
          disabled={isImportingFile || importMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-stc-medium"
        >
          {isImportingFile || importMutation.isPending ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <UploadFileIcon fontSize="small" />
          )}
          {isImportingFile || importMutation.isPending ? "Importing..." : "Import Plan Tiers"}
        </Button>
      </div>

      <DynamicGroupTable
        data={rows}
        columns={columns as any}
        searchPlaceholder="Search plan tiers..."
        rowActions={rowActions as any}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={listError as any}
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

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Plan Tier</DialogTitle>
        <DialogContent>
          <div className="mt-2 grid grid-cols-1 gap-4">
            {error && <Alert severity="error">{error}</Alert>}

            <div>
              <label className="mb-1 block text-sm font-stc-medium">Plan Product Code</label>
              <input
                value={form.plan_product_part_code || ""}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-stc-medium">Plan Tier</label>
                <input
                  value={String(form.plan_tier ?? "")}
                  onChange={(e) => setForm((prev) => ({ ...prev, plan_tier: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-stc-medium">Plan Family</label>
                <input
                  value={String(form.plan_family ?? "")}
                  onChange={(e) => setForm((prev) => ({ ...prev, plan_family: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-stc-medium">Type</label>
                <input
                  value={String(form.Type || "")}
                  onChange={(e) => setForm((prev) => ({ ...prev, Type: e.target.value }))}
                  placeholder="Enter type"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-stc-medium">Status</label>
                <select
                  value={Number(form.active) ? "1" : "0"}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(false)}
            className="rounded-xl px-6 py-2.5 text-sm font-stc-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="warning"
            onClick={handleSave}
            className="min-w-[150px] rounded-xl px-6 py-2.5 text-sm font-stc-bold tracking-wide"
          >
            Update Tier
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 100 }}
        onClose={() => setToast(null)}
      >
        <Alert severity={toast?.type || "success"} variant="filled" onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
      <ActionConfirmationDialog
        open={confirmUpdateOpen}
        title="Update Plan Tier"
        message="Are you sure you want to update this plan tier?"
        confirmText="Update"
        confirmVariant="warning"
        confirmDisabled={updateMutation.isPending}
        onClose={() => setConfirmUpdateOpen(false)}
        onConfirm={() => {
          void executeUpdate();
        }}
      />
      <ActionConfirmationDialog
        open={confirmImportOpen}
        title="Import Plan Tiers"
        message={
          pendingImportFile
            ? `Are you sure you want to import "${pendingImportFile.name}"?.`
            : "Are you sure you want to import this file?"
        }
        confirmText="Import"
        confirmVariant="brand"
        confirmDisabled={isImportingFile || importMutation.isPending}
        onClose={handleCancelImport}
        onConfirm={() => {
          void handleConfirmImport();
        }}
      />
      <Dialog
        open={importReportOpen && Boolean(importReport)}
        onClose={() => setImportReportOpen(false)}
        fullWidth
        maxWidth="lg"
        sx={{
          zIndex: 100000,
          "& .MuiDialog-paper": {
            mt: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },
            maxHeight: "calc(100% - 48px)",
          },
        }}
      >
        <DialogTitle>Plan Tier Import Report</DialogTitle>
        <DialogContent dividers>
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
            <h4 className="mb-3 text-sm font-stc-bold uppercase tracking-wide text-brand-800">Summary</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Total Records</p>
                <p className="text-lg font-stc-bold text-gray-900">{importReport?.total || 0}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Inserted</p>
                <p className="text-lg font-stc-bold text-emerald-700">{importReport?.inserted || 0}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-red-700">Failed</p>
                <p className="text-lg font-stc-bold text-red-700">{importReport?.failed || 0}</p>
              </div>
            </div>
          </div>

          {importFailures.length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-stc-bold uppercase tracking-wide text-amber-900">
                  Failed Records ({importFailures.length})
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportFailedRecords}
                  className="rounded-xl border-amber-300 text-amber-800 hover:border-amber-400 hover:bg-amber-100 px-4 py-2 text-sm font-stc-medium"
                >
                  Download Failed Records (Excel)
                </Button>
              </div>
              <div className="max-h-80 overflow-auto rounded-lg border border-amber-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-amber-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2 text-left">Reason</th>
                      <th className="px-3 py-2 text-left">Plan Product Code</th>
                      <th className="px-3 py-2 text-left">Plan Tier</th>
                      <th className="px-3 py-2 text-left">Plan Family</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importFailures.map((failure, index) => (
                      <tr key={`failure-${index}`} className="border-t border-amber-100">
                        <td className="px-3 py-2">{failure.row_number}</td>
                        <td className="px-3 py-2 text-red-700">{failure.reason}</td>
                        <td className="px-3 py-2">{failure.row?.plan_product_part_code ?? "-"}</td>
                        <td className="px-3 py-2">{failure.row?.plan_tier ?? "-"}</td>
                        <td className="px-3 py-2">{failure.row?.plan_family ?? "-"}</td>
                        <td className="px-3 py-2">{failure.row?.Type ?? failure.row?.type ?? "-"}</td>
                        <td className="px-3 py-2">{failure.row?.active ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              No failed records. All rows were imported successfully.
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => setImportReportOpen(false)}
            className="rounded-xl px-6 py-2.5 text-sm font-stc-medium"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IncentivePlanTierTableWrapper;
