"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import DeviceForm from "@/components/pages/product_catalog/device_form";
import { useDeviceDetail, useUpdateDevice } from "@/hooks/useDeviceCatalogue";

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams<{ device_id: string }>();
  const deviceId = Number(params.device_id);

  const { data, isLoading, isError, error } = useDeviceDetail(deviceId);
  const updateMutation = useUpdateDevice();

  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (payload: any) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);

      await updateMutation.mutateAsync({
        ...payload,
        device_id: deviceId,
      });

      setSuccessMsg("Device updated successfully");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update device");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.data?.device) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {(error as Error)?.message || "Failed to load device details"}
      </Alert>
    );
  }

  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Devices", href: "/product_catalogue/device" },
          { label: "Edit Device" },
        ]}
      />

      <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
        <AppBar position="static" sx={{ bgcolor: "#ebebe5", boxShadow: "none" }}>
          <Tabs
            value={0}
            onChange={() => {}}
            sx={{
              "& .MuiTab-root": {
                pointerEvents: "none",
                color: "bg-brand-600",
                cursor: "default",
              },
            }}
          >
            <Tab label="Device Information" />
          </Tabs>
        </AppBar>

        <Box sx={{ pt: 3 }}>
          <DeviceForm
            mode="edit"
            initialValues={data?.data}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            onCancel={() => router.push("/product_catalogue/device")}
          />
        </Box>
      </Box>

      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={2500}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: "72px", zIndex: (theme) => theme.zIndex.modal + 100 }}
        onClose={() => {
          setSuccessMsg(null);
          router.push(`/product_catalogue/device/view/${deviceId}`);
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => {
            setSuccessMsg(null);
            router.push(`/product_catalogue/device/view/${deviceId}`);
          }}
        >
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: "72px", zIndex: (theme) => theme.zIndex.modal + 100 }}
        onClose={() => setErrorMsg(null)}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
