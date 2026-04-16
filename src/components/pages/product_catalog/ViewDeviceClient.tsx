"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useDeviceDetail } from "@/hooks/useDeviceCatalogue";

interface ViewDeviceClientProps {
  id: string;
}

const normalizeStatus = (device: any) => {
  if (device?.status === null || device?.status === "null") {
    return { label: "New", color: "warning" as const };
  }

  if (device?.status !== undefined && device?.status !== null && device?.status !== "") {
    const status = Number(device.status);
    if (status === 1) return { label: "Active", color: "success" as const };
    if (status === 0) return { label: "Inactive", color: "default" as const };
  }

  if (device?.is_active === null || device?.is_active === "null") {
    return { label: "New", color: "warning" as const };
  }

  if (device?.is_active !== undefined && device?.is_active !== null && device?.is_active !== "") {
    const active = Number(device.is_active);
    if (active === 1) return { label: "Active", color: "success" as const };
    if (active === 0) return { label: "Inactive", color: "default" as const };
  }

  return { label: "New", color: "warning" as const };
};

const normalizeImage = (image?: string | null) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }

  return image;
};

export default function ViewDeviceClient({ id }: ViewDeviceClientProps) {
  const router = useRouter();
  const deviceId = Number(id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data, isLoading, isError, error } = useDeviceDetail(deviceId);

  const device = data?.data?.device || null;
  const storages = data?.data?.storages || [];

  const images = useMemo(() => {
    const list = [
      normalizeImage(device?.image_file1 || device?.Image_file1),
      normalizeImage(device?.image_file2 || device?.Image_file2),
      normalizeImage(device?.image_file3 || device?.Image_file3),
    ].filter(Boolean);

    return list;
  }, [device]);

  const statusMeta = normalizeStatus(device);

  const nextImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !device) {
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
          { label: device.device_name || "View Device" },
        ]}
      />

      <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {device.device_name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Chip label={statusMeta.label} color={statusMeta.color} variant="outlined" size="small" />
            <Typography variant="body2" color="text.secondary">
              Device ID: {device.device_id}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Box>
              {images.length ? (
                <Box
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Box
                    component="img"
                    src={images[activeImageIndex]}
                    alt={`${device.device_name} ${activeImageIndex + 1}`}
                    sx={{ width: "100%", height: 320, objectFit: "contain", backgroundColor: "#fff" }}
                  />

                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={prevImage}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 8,
                          transform: "translateY(-50%)",
                          backgroundColor: "rgba(255,255,255,0.8)",
                        }}
                      >
                        <NavigateBeforeIcon />
                      </IconButton>

                      <IconButton
                        onClick={nextImage}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 8,
                          transform: "translateY(-50%)",
                          backgroundColor: "rgba(255,255,255,0.8)",
                        }}
                      >
                        <NavigateNextIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 320,
                    border: "1px dashed #d1d5db",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  No image available
                </Box>
              )}

              {images.length > 1 && (
                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "center", gap: 1 }}>
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        cursor: "pointer",
                        backgroundColor: index === activeImageIndex ? "#4f008c" : "#d1d5db",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Typography variant="body2">
                <strong>Category:</strong> {device.category || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Brand:</strong> {device.brand || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Color Variations:</strong> {device.color_variations || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Display Order:</strong> {device.order_by ?? "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Created By:</strong> {device.created_by || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Created At:</strong> {device.created_at || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Storage Variants
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>CRM Product Part Code</TableCell>
                  <TableCell>Storage</TableCell>
                  <TableCell>Full Price</TableCell>
                  <TableCell>DI 12</TableCell>
                  <TableCell>DI 18</TableCell>
                  <TableCell>DI 24</TableCell>
                  <TableCell>DI 36</TableCell>
                  <TableCell>Lowest EMI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storages.length ? (
                  storages.map((row: any, index: number) => (
                    <TableRow key={row.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.crm_product_part_code || "N/A"}</TableCell>
                      <TableCell>{row.storage || "N/A"}</TableCell>
                      <TableCell>{row.fullprice ?? "N/A"}</TableCell>
                      <TableCell>{row.di_amount_12 ?? "0"}</TableCell>
                      <TableCell>{row.di_amount_18 ?? "0"}</TableCell>
                      <TableCell>{row.di_amount_24 ?? "0"}</TableCell>
                      <TableCell>{row.di_amount_36 ?? row.Di_amount_36 ?? "0"}</TableCell>
                      <TableCell>{row.lowest_emi ?? "0"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No storage variants available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button variant="outlined" onClick={() => router.push("/product_catalogue/device")}>
            Back
          </Button>
          <Button variant="contained" onClick={() => router.push(`/product_catalogue/device/edit/${device.device_id}`)}>
            Update
          </Button>
        </Box>
      </Box>
    </>
  );
}
