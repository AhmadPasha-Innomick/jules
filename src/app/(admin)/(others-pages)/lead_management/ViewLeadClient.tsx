"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLeadDetails } from "@/hooks/useLeads";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { Alert, Box, CircularProgress } from "@mui/material";
import Button from "@/components/ui/button/Button";

interface Props {
  id: string;
}

export default function ViewLeadClient({ id }: Props) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewType, setPreviewType] = React.useState<string | null>(null);
  const router = useRouter();
  const { data, isLoading, isError } = useLeadDetails(id);

  const lead = data?.data;
  const files = lead?.attachments ?? [];

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const getMimeType = (file: any) => {
    const ext =
      file.extension?.toLowerCase() ||
      file.filename?.split(".").pop()?.toLowerCase();

    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      txt: "text/plain",
    };

    return mimeMap[ext!] || "application/octet-stream";
  };

  const base64ToBlobUrl = (base64: string, mimeType: string) => {
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = Array.from(byteCharacters).map((char) =>
      char.charCodeAt(0)
    );
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    return URL.createObjectURL(blob);
  };

  const handlePreview = (file: any) => {
    if (!file?.base64) return;

    const mimeType = getMimeType(file);
    const url = base64ToBlobUrl(file.base64, mimeType);

    setPreviewUrl(url);
    setPreviewType(mimeType);
  };

  const handleDownload = (file: any) => {
    if (!file?.base64) return;

    const mimeType = getMimeType(file);
    const url = base64ToBlobUrl(file.base64, mimeType);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Lead Management", href: "/lead_management" },
          { label: `View Lead (${id})` },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
        <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
          Lead Details
        </h3>

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {isError && <Alert severity="error">Failed to load lead details</Alert>}

        {lead && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Detail label="Lead ID" value={lead.lead_id} />
              <Detail label="Name" value={lead.name} />

              <Detail label="ID Type" value={lead.idtype_name} />
              <Detail label="ID Number" value={lead.idnumber} />

              <Detail label="Phone Number" value={lead.phone_number} />

              <Detail label="Category" value={lead.category_name} />
              <Detail label="Sub Category" value={lead.sub_category_name} />

              <Detail label="Description" value={lead.description} />

              <Detail label="Status" value={lead.status} />

              <Detail label="Follow Up Date" value={lead.follow_up_date} />

              <Detail label="Reason" value={lead.reason} />

              <Detail label="Created By" value={lead.created_by} />

              <Detail
                label="Created Date"
                value={
                  lead.created_date_time
                    ? new Date(lead.created_date_time).toLocaleString()
                    : "N/A"
                }
              />

              <Detail label="Updated By" value={lead.updated_by} />

              <Detail
                label="Updated Date"
                value={
                  lead.updated_date_time
                    ? new Date(lead.updated_date_time).toLocaleString()
                    : "N/A"
                }
              />
            </div>

            <div className="mt-6">
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

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handlePreview(file)}
                          disabled={!file.base64}
                        >
                          View
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleDownload(file)}
                          disabled={!file.base64}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end mt-8">
          <Button variant="outline" onClick={() => router.push("/lead_management")}>
            Back
          </Button>
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white w-[90%] h-[85%] rounded-xl shadow-lg p-4 relative">
            <button
              className="absolute top-3 right-3 text-sm text-gray-600"
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setPreviewType(null);
              }}
            >
              Close
            </button>

            {previewType?.includes("image") && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}

            {previewType === "application/pdf" && (
              <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
            )}

            {!previewType?.includes("image") &&
              previewType !== "application/pdf" && (
                <div className="flex items-center justify-center h-full">
                  <p>Preview not supported for this file type.</p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border p-3 bg-gray-50 shadow-theme-xs">
      <p className="text-theme-xs text-gray-500">{label}</p>
      <p className="text-theme-sm font-stc-medium text-gray-900 mt-1">
        {value ?? "N/A"}
      </p>
    </div>
  );
}
