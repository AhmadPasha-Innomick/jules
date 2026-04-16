"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import DeviceForm from "@/components/pages/product_catalog/device_form";
import { useCreateDevice } from "@/hooks/useDeviceCatalogue";

export default function CreateDevicePage() {
  const router = useRouter();
  const createMutation = useCreateDevice();

  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (payload: any) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);

      await createMutation.mutateAsync(payload);
      setSuccessMsg("Device created successfully");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create device");
    }
  };

  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Devices", href: "/product_catalogue/device" },
          { label: "Create Device" },
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
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
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
          router.push("/product_catalogue/device");
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => {
            setSuccessMsg(null);
            router.push("/product_catalogue/device");
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
