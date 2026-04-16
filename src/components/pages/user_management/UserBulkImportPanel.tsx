"use client";

import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DownloadIcon from "@mui/icons-material/Download";
import { useUserBulkImport, UserImportSummary } from "@/hooks/useUserBulkImport";

interface UserBulkImportPanelProps {
  onImportCompleted?: () => void;
}

const IMPORT_CHUNK_SIZE = 100;

const TEMPLATE_HEADERS = [
  "user_name",
  "user_title_id",
  "user_firstname",
  "user_middlename",
  "user_lastname",
  "user_fullname",
  "is_active",
  "is_manager",
  "user_type",
  "email",
  "phone_number",
  "gender",
  "birth_date",
  "employer_id",
  "dealer_id",
  "shop_id",
  "reporting_to",
  "company_id",
  "idtype_id",
  "idnumber",
  "send_notification_type",
  "nationality_code",
  "job_title",
  "mm_id",
  "wallet_msisdn",
  "mnp_charge",
  "sim_swap_charge",
  "terminalid",
  "posid",
  "suspicious",
  "group_names",
];

const TEMPLATE_SAMPLE: Record<string, string> = {
  user_name: "john.agent01",
  user_title_id: "1",
  user_firstname: "John",
  user_middlename: "M",
  user_lastname: "Doe",
  user_fullname: "John M Doe",
  is_active: "1",
  is_manager: "0",
  user_type: "Agent",
  email: "john.doe@example.com",
  phone_number: "98765432",
  gender: "M",
  birth_date: "1995-04-11",
  employer_id: "EMP1001",
  dealer_id: "DLR0001",
  shop_id: "SHOP-15",
  reporting_to: "manager01",
  company_id: "10",
  idtype_id: "2",
  idnumber: "A1234567",
  send_notification_type: "Email",
  nationality_code: "BHR",
  job_title: "Sales Associate",
  mm_id: "MM001",
  wallet_msisdn: "97330000000",
  mnp_charge: "0",
  sim_swap_charge: "0",
  terminalid: "T10001",
  posid: "P10001",
  suspicious: "0",
  group_names: "Retail Team,Device Sales",
};

const escapeCsv = (value: unknown) => {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
};

const buildCsv = (rows: Record<string, unknown>[], headers: string[]) => {
  const lines = [headers.map(escapeCsv).join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(","));
  });
  return lines.join("\n");
};

const downloadText = (content: string, fileName: string, mime = "text/csv;charset=utf-8;") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const parseImportFile = async (file: File): Promise<Record<string, unknown>[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", raw: false, cellDates: false });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
    raw: false,
  });
};

const statusColor = (status: string): "success" | "warning" | "error" | "default" => {
  if (status === "success") return "success";
  if (status === "partial") return "warning";
  if (status === "failed") return "error";
  return "default";
};

const emptySummary = (): UserImportSummary => ({
  total_rows: 0,
  processed_rows: 0,
  success_rows: 0,
  partial_rows: 0,
  failed_rows: 0,
  duplicate_rows: 0,
  inserted_users: 0,
  updated_users: 0,
  linked_users: 0,
  linked_groups: 0,
  errors: [],
  details: [],
});

const mergeSummary = (base: UserImportSummary, incoming: UserImportSummary): UserImportSummary => ({
  total_rows: base.total_rows + (incoming.total_rows || 0),
  processed_rows: base.processed_rows + (incoming.processed_rows || 0),
  success_rows: base.success_rows + (incoming.success_rows || 0),
  partial_rows: base.partial_rows + (incoming.partial_rows || 0),
  failed_rows: base.failed_rows + (incoming.failed_rows || 0),
  duplicate_rows: base.duplicate_rows + (incoming.duplicate_rows || 0),
  inserted_users: base.inserted_users + (incoming.inserted_users || 0),
  updated_users: base.updated_users + (incoming.updated_users || 0),
  linked_users: base.linked_users + (incoming.linked_users || 0),
  linked_groups: base.linked_groups + (incoming.linked_groups || 0),
  errors: [...(base.errors || []), ...(incoming.errors || [])],
  details: [...(base.details || []), ...(incoming.details || [])],
});

export default function UserBulkImportPanel({ onImportCompleted }: UserBulkImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importMutation = useUserBulkImport();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<UserImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 });

  const isBusy = isParsing || importMutation.isPending;
  const isImportDisabled = !selectedFile || isBusy;

  const issueRows = useMemo(
    () => (summary?.details || []).filter((row) => row.status !== "success"),
    [summary]
  );

  const handleTemplateDownload = () => {
    const csv = buildCsv([TEMPLATE_SAMPLE], TEMPLATE_HEADERS);
    downloadText(csv, "user_bulk_import_template.csv");
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a CSV/XLS/XLSX file before importing.");
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setSummary(null);
      setIsParsing(true);
      const rows = await parseImportFile(selectedFile);

      if (!rows.length) {
        throw new Error("The selected file has no data rows.");
      }

      const indexedRows = rows.map((row, index) => ({
        ...row,
        __row_number: index + 2,
      }));

      const chunks: Record<string, unknown>[][] = [];
      for (let i = 0; i < indexedRows.length; i += IMPORT_CHUNK_SIZE) {
        chunks.push(indexedRows.slice(i, i + IMPORT_CHUNK_SIZE));
      }

      let aggregate = emptySummary();
      setChunkProgress({ current: 0, total: chunks.length });

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        setChunkProgress({ current: chunkIndex + 1, total: chunks.length });
        const response = await importMutation.mutateAsync({ rows: chunks[chunkIndex] });
        if (response?.data) {
          aggregate = mergeSummary(aggregate, response.data);
        }
      }

      setSummary(aggregate);
      setSuccessMessage(
        `Import completed. Processed ${aggregate.processed_rows} rows in ${chunks.length} chunk(s).`
      );
      onImportCompleted?.();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to import users.");
    } finally {
      setIsParsing(false);
      setChunkProgress({ current: 0, total: 0 });
    }
  };

  const handleExportIssues = () => {
    if (!issueRows.length) {
      setErrorMessage("No issue rows available to export.");
      return;
    }

    const rows = issueRows.map((row) => ({
      row_number: row.row_number,
      user_name: row.user_name,
      status: row.status,
      action: row.action,
      message: row.message,
      groups_requested: row.groups_requested.join(", "),
      groups_linked: row.groups_linked.join(", "),
      groups_already_linked: row.groups_already_linked.join(", "),
      groups_not_found: row.groups_not_found.join(", "),
      errors: row.errors.join(" | "),
    }));

    const headers = [
      "row_number",
      "user_name",
      "status",
      "action",
      "message",
      "groups_requested",
      "groups_linked",
      "groups_already_linked",
      "groups_not_found",
      "errors",
    ];

    const csv = buildCsv(rows, headers);
    downloadText(csv, `user_import_issues_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2.5, mb: 2.5 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Bulk User Import
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload CSV/XLS/XLSX. <code>group_names</code> is optional; if provided, use comma-separated group names.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleTemplateDownload}>
            Download Template
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleSelectFile}>
            Choose File
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleImport}
            disabled={isImportDisabled}
            sx={{
              backgroundColor: isImportDisabled ? "#e5e7eb !important" : undefined,
              color: isImportDisabled ? "#9ca3af !important" : undefined,
              opacity: isImportDisabled ? 1 : undefined,
              "&.Mui-disabled": {
                backgroundColor: "#e5e7eb !important",
                color: "#9ca3af !important",
                opacity: 1,
              },
            }}
          >
            {isBusy ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>Importing...</span>
              </Stack>
            ) : (
              "Import Users"
            )}
          </Button>
        </Stack>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Typography variant="body2" sx={{ mt: 1.25 }}>
        Selected File: <strong>{selectedFile?.name || "None"}</strong>
      </Typography>

      {chunkProgress.total > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
          Processing chunk {chunkProgress.current} of {chunkProgress.total}
        </Typography>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {summary && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            {[
              { label: "Total Rows", value: summary.total_rows },
              { label: "Inserted", value: summary.inserted_users },
              { label: "Updated", value: summary.updated_users },
              { label: "Groups Linked", value: summary.linked_groups },
              { label: "Duplicates", value: summary.duplicate_rows },
              { label: "Partial", value: summary.partial_rows },
              { label: "Failed", value: summary.failed_rows },
              { label: "Success", value: summary.success_rows },
              { label: "Processed", value: summary.processed_rows },
              { label: "Users Linked", value: summary.linked_users },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Import Result Details</Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportIssues}
              disabled={!issueRows.length}
            >
              Export Issues CSV
            </Button>
          </Stack>

          <TableContainer sx={{ mt: 1.2, maxHeight: 360, border: "1px solid #e5e7eb", borderRadius: 1.5 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Linked Groups</TableCell>
                  <TableCell>Missing Groups</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.details.map((row) => (
                  <TableRow key={`${row.row_number}-${row.user_name}`}>
                    <TableCell>{row.row_number}</TableCell>
                    <TableCell>{row.user_name || "-"}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={statusColor(row.status)} />
                    </TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell>{row.message || "-"}</TableCell>
                    <TableCell>{(row.groups_linked || []).join(", ") || "-"}</TableCell>
                    <TableCell>{(row.groups_not_found || []).join(", ") || "-"}</TableCell>
                    <TableCell>{(row.errors || []).join(" | ") || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
}
