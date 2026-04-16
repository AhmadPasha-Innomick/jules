"use client";

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useUserDetails } from "@/hooks/useApi";
import { useIdTypes } from "@/hooks/useLookups";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import Button from "@/components/ui/button/Button";
interface ViewUserClientProps {
  id: string;
}

const titleMap: Record<number, string> = {
  1: "Mr",
  2: "Miss",
  3: "Mrs",
};

const sampleAttachments = [
  {
    id: 1,
    name: "incident_photo.png",
    type: "image/png",
    url: "https://picsum.photos/400/250",
  },
  {
    id: 2,
    name: "incident.pdf",
    type: "image/png",
    url: "https://picsum.photos/400/250",
  },
];

export default function ViewUserClient({ id }: ViewUserClientProps) {
  const { data, isLoading, isError } = useUserDetails(id);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const router = useRouter();

  const user = data?.data;
  
  const profile = user?.profile;
  const apiMessage = data?.message;
  const titleid = user?.user_title_id;

  const { data: idTypes } = useIdTypes();

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {

      setDownloadError(
        "Unable to download attachment. Please try again later."
      );
    }
  };

  const idTypeName = React.useMemo(() => {
    if (!idTypes || !profile?.idtype_id) return "N/A";
    const match = idTypes.find((t: any) => t.id === profile.idtype_id);
    return match?.idtype_name || "N/A";
  }, [idTypes, profile?.idtype_id]);
  return (
    <div className="space-y-6">
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incident Management", href: "/incident_management" },
          { label: `View Incident (${id})` },
        ]}
      />

      <div className="shadow-theme-md rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-theme-xl font-stc-bold mb-6 text-gray-900">
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
          <p className="text-theme-sm text-red-600">
            {apiMessage || "User not found."}
          </p>
        )}

    
        {!isLoading && !user && data?.success === false && (
          <div className="shadow-theme-xs rounded-xl border border-red-300 bg-red-50 p-4">
            <p className="font-stc-medium text-theme-sm text-red-700">
              {apiMessage || "User not found."}
            </p>
            <p className="text-theme-xs mt-1 text-gray-600">
              The user with ID <span className="font-stc-bold">{id}</span> does
              not exist.
            </p>
          </div>
        )}

     
        {user && (
          <>
      
            <div className="mb-6 flex items-center gap-4">


              <div></div>
            </div>

    
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Incident ID" value={true ? "A12345" : "N/A"} />
              

              <Detail label="Created By" value="Admin" />
              <Detail label="Category" value="Sales" />
              <Detail label="Sub Category" value="SIM" />
              <Detail label=" Create Date/Time" value="16-12-2025 7:42" />

              <Detail
                label="Status"
                value={user.status === 1 ? "Active" : "Inactive"}
              />

          

              <div className="col-span-full mt-6">
                <h4 className="text-theme-md font-stc-bold mb-4 text-gray-900">
                  Attachments
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {sampleAttachments.map((file) => (
                    <div
                      key={file.id}
                      className="shadow-theme-xs flex items-center justify-between gap-3 rounded-lg border bg-gray-50 p-4"
                    >
                 
                      <div className="flex flex-col overflow-hidden">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{file.type}</p>
                      </div>

                   

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleDownload(file.url, file.name)}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <form className="col-span-full">
             
                <div className="col-span-full">
                  <TextField
                    multiline
                    fullWidth
                    minRows={4}
                    placeholder="Resolution Note"
                  />
                </div>

         
                <div className="mt-6 flex w-full justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/incident_management")}
                  >
                    Back
                  </Button>
                  <Button type="submit">
                    {false ? "Closing..." : "Close"}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
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
  const displayValue =
    value === null || value === undefined || value === "" ? "N/A" : value;

  return (
    <div className="shadow-theme-xs rounded-xl border bg-gray-50 p-3">
      <p className="text-theme-xs text-gray-500">{label}</p>
      <p className="text-theme-sm font-stc-medium mt-1 text-gray-900">
        {displayValue}
      </p>
    </div>
  );
}
