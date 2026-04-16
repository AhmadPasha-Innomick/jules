"use client";

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useIncidentDetails } from "@/hooks/useIncident";
import { useRouter } from "next/navigation";
import { base64ToBlob } from "@/utils/base64";
import { useCloseIncident } from "@/hooks/useIncidentClose";
import Button from "@/components/ui/button/Button";
import { Alert, Snackbar, Box, CircularProgress, TextField } from "@mui/material";

interface ViewUserClientProps {
  id: string;
}

const FIELD_LABELS: Record<string, string> = {
  incident_id: "Incident ID",
  category_id: "Category ID",
  category_name: "Category",
  sub_category_id: "Sub Category ID",
  sub_category_name: "Sub Category",
  issue_types: "Issue Types",
  msisdn: "MSISDN",
  plan_name: "Plan Name",
  recharge_serial_number: "Recharge Serial Number",
  resolution_note: "Resolution Note",
  created_by: "Created By",
  created_date_time: "Created Date/Time",
  updated_by: "Updated By",
  updated_date_time: "Updated Date/Time",
};

const PREFERRED_FIELD_ORDER = [
  "incident_id",
  "category_name",
  "category_id",
  "sub_category_name",
  "sub_category_id",
  "issue_types",
  "msisdn",
  "plan_name",
  "recharge_serial_number",
  "description",
  "status",
  "resolution_note",
  "created_by",
  "created_date_time",
  "updated_by",
  "updated_date_time",
];

const EXCLUDED_KEYS = new Set([
  "files",
  "attachments",
  "category_id",
  "sub_category_id",
  "issue_type_id",
  "issue_type_ids",
  "issue_type_name",
  "issue_type_names",
  "type_of_issue_id",
]);
const hasDisplayValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    return value.trim() !== "";
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return true;
};

const prettifyLabel = (key: string): string => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatFieldValue = (key: string, value: unknown): string => {
  if (!hasDisplayValue(value)) return "";

  if (key === "issue_types" && Array.isArray(value)) {
    const names = value
      .map((item) =>
        item && typeof item === "object"
          ? String((item as { name?: unknown }).name ?? "").trim()
          : ""
      )
      .filter((name) => name.length > 0);

    return names.join(", ");
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (key === "status" && typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "close") return "Closed";
    if (normalized === "open") return "Open";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  if (
    (key.includes("date") || key.includes("time")) &&
    typeof value === "string"
  ) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }

  return String(value);
};

const handleDownload = (file: any) => {
  if (!file?.base64 || !file?.filename) return;

  const ext =
    file.extension?.toLowerCase() ||
    file.filename.split(".").pop()?.toLowerCase();

  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    json: "application/json",
    xml: "application/xml",
  };

  const mimeType = mimeMap[ext!] || "application/octet-stream";

  try {
    let base64 = file.base64;

    if (base64.includes(",")) {
      base64 = base64.split(",")[1];
    }

    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");

    const blob = base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed", err);
  }
};

export default function ViewUserClient({ id }: ViewUserClientProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useIncidentDetails(id);

  const incidentData = data?.data ?? data?.json?.data;
  const incident =
    incidentData && typeof incidentData === "object" ? incidentData : null;

  const files = incident?.files ?? incident?.attachments ?? [];

  const [resolutionNote, setResolutionNote] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<
    "success" | "error"
  >("success");

  const { mutate: closeIncident, isPending: isClosing } = useCloseIncident();

  const isClosed =
    String(incident?.status ?? "")
      .toLowerCase()
      .trim() === "close";

  const detailFields = React.useMemo(() => {
    if (!incident) return [] as Array<[string, unknown]>;

    const entries = Object.entries(incident).filter(([key, value]) => {
      if (EXCLUDED_KEYS.has(key)) return false;
      return hasDisplayValue(value);
    });

    const orderMap = new Map(
      PREFERRED_FIELD_ORDER.map((field, index) => [field, index])
    );

    entries.sort(([a], [b]) => {
      const aIndex = orderMap.has(a)
        ? (orderMap.get(a) as number)
        : Number.MAX_SAFE_INTEGER;
      const bIndex = orderMap.has(b)
        ? (orderMap.get(b) as number)
        : Number.MAX_SAFE_INTEGER;

      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.localeCompare(b);
    });

    return entries;
  }, [incident]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isClosed) {
      setSnackbarMessage("This incident is already closed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (!resolutionNote.trim()) {
      setSnackbarMessage("Resolution note is required");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    closeIncident(
      {
        incident_id: incident?.incident_id || id,
        resolution_note: resolutionNote.trim(),
      },
      {
        onSuccess: () => {
          setSnackbarMessage("Incident closed successfully!");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
          setTimeout(() => router.push("/incident_management"), 2000);
        },
        onError: (error: any) => {
          setSnackbarMessage(error.message || "Failed to close incident");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incident Management", href: "/incident_management" },
          { label: `View Incident (${id})` },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
        <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
          Incident Details
        </h3>

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load incident
          </Alert>
        )}

        {incident && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {detailFields.map(([key, value]) => (
                <Detail
                  key={key}
                  label={prettifyLabel(key)}
                  value={formatFieldValue(key, value)}
                />
              ))}
            </div>

            <div className="col-span-full mt-6">
              <h4 className="text-theme-md font-stc-bold text-gray-900 mb-4">
                Attachments
              </h4>
              {files.length === 0 ? (
                <p className="text-sm text-gray-500">No attachments available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-gray-50 p-4 shadow-theme-xs"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500">.{file.extension}</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleDownload(file)}
                        disabled={!file.base64}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="col-span-full mt-8">
              {!isClosed && (
                <div className="mb-6">
                  <TextField
                    multiline
                    fullWidth
                    minRows={4}
                    label="Resolution Note"
                    placeholder="Enter resolution details..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    required
                    variant="outlined"
                    helperText="This note will be recorded when closing the incident"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/incident_management")}
                >
                  Back
                </Button>
                {!isClosed && (
                  <Button type="submit" disabled={isClosing}>
                    {isClosing ? "Closing..." : "Close Incident"}
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={8000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-3 bg-gray-50 shadow-theme-xs">
      <p className="text-theme-xs text-gray-500">{label}</p>
      <p className="text-theme-sm font-stc-medium text-gray-900 mt-1">
        {value}
      </p>
    </div>
  );
}





