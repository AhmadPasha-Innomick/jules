"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@/components/ui/button/Button";
import { DeviceStoragePayload } from "@/hooks/useDeviceCatalogue";
import FileInput from "@/components/form/form-elements/FileInputExampleBanner";

type Mode = "create" | "edit";

interface StorageFormRow {
  id?: number;
  crm_product_part_code: string;
  storage: string;
  fullprice: string;
  di_amount_12: string;
  di_amount_18: string;
  di_amount_24: string;
  di_amount_36: string;
}

interface DeviceFormState {
  category: string;
  brand: string;
  device_name: string;
  color_variations: string;
  image_file1: string;
  image_file2: string;
  image_file3: string;
  order_by: string;
  is_active: boolean;
  storages: StorageFormRow[];
}

interface DeviceFormProps {
  mode: Mode;
  initialValues?: any;
  isSubmitting?: boolean;
  onSubmit: (payload: any) => void;
  onCancel: () => void;
}

const emptyStorageRow: StorageFormRow = {
  crm_product_part_code: "",
  storage: "",
  fullprice: "",
  di_amount_12: "",
  di_amount_18: "",
  di_amount_24: "",
  di_amount_36: "",
};

const defaultState: DeviceFormState = {
  category: "",
  brand: "",
  device_name: "",
  color_variations: "",
  image_file1: "",
  image_file2: "",
  image_file3: "",
  order_by: "",
  is_active: true,
  storages: [{ ...emptyStorageRow }],
};

const normalizeNumber = (value: string) => {
  const trimmed = String(value || "").trim();
  if (trimmed === "") return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const resolvePreviewSrc = (value?: string) => {
  const src = (value || "").trim();
  if (!src) return "";

  if (
    src.startsWith("data:image/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }

  return src.startsWith("/") ? src : `/${src}`;
};

export default function DeviceForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: DeviceFormProps) {
  const [form, setForm] = useState<DeviceFormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storageErrors, setStorageErrors] = useState<Record<number, Record<string, string>>>({});
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!initialValues) {
      setForm(defaultState);
      return;
    }

    const device = initialValues?.device || initialValues;
    const storages = initialValues?.storages || [];

    const normalizedStorages: StorageFormRow[] =
      Array.isArray(storages) && storages.length > 0
        ? storages.map((row: any) => ({
            id: row?.id ? Number(row.id) : undefined,
            crm_product_part_code: row?.crm_product_part_code || "",
            storage: row?.storage || "",
            fullprice: row?.fullprice !== undefined && row?.fullprice !== null ? String(row.fullprice) : "",
            di_amount_12:
              row?.di_amount_12 !== undefined && row?.di_amount_12 !== null
                ? String(row.di_amount_12)
                : "",
            di_amount_18:
              row?.di_amount_18 !== undefined && row?.di_amount_18 !== null
                ? String(row.di_amount_18)
                : "",
            di_amount_24:
              row?.di_amount_24 !== undefined && row?.di_amount_24 !== null
                ? String(row.di_amount_24)
                : "",
            di_amount_36:
              row?.di_amount_36 !== undefined && row?.di_amount_36 !== null
                ? String(row.di_amount_36)
                : row?.Di_amount_36 !== undefined && row?.Di_amount_36 !== null
                  ? String(row.Di_amount_36)
                  : "",
          }))
        : [{ ...emptyStorageRow }];

    const activeFlag = device?.status ?? device?.is_active;
    const isActive =
      activeFlag === undefined || activeFlag === null || activeFlag === ""
        ? true
        : Number(activeFlag) === 1;

    setForm({
      category: device?.category || "",
      brand: device?.brand || "",
      device_name: device?.device_name || "",
      color_variations: device?.color_variations || "",
      image_file1: device?.image_file1 || device?.Image_file1 || "",
      image_file2: device?.image_file2 || device?.Image_file2 || "",
      image_file3: device?.image_file3 || device?.Image_file3 || "",
      order_by:
        device?.order_by !== undefined && device?.order_by !== null ? String(device.order_by) : "",
      is_active: isActive,
      storages: normalizedStorages,
    });
  }, [initialValues]);

  const title = useMemo(() => (mode === "create" ? "Create Device" : "Update Device"), [mode]);

  const validate = () => {
    if (isEditMode) {
      setErrors({});
      setStorageErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    const nextStorageErrors: Record<number, Record<string, string>> = {};

    if (!form.category.trim()) nextErrors.category = "Category is required";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required";
    if (!form.device_name.trim()) nextErrors.device_name = "Device name is required";

    if (mode === "create" && !form.image_file1.trim()) {
      nextErrors.image_file1 = "Image 1 is required";
    }

    if (!form.storages.length) {
      nextErrors.storages = "At least one storage row is required";
    }

    form.storages.forEach((row, index) => {
      const rowErrors: Record<string, string> = {};

      if (!row.crm_product_part_code.trim()) {
        rowErrors.crm_product_part_code = "CRM Product Part Code is required";
      }

      if (!row.storage.trim()) {
        rowErrors.storage = "Storage is required";
      }

      const fullPrice = normalizeNumber(row.fullprice);
      if (row.fullprice.trim() === "") {
        rowErrors.fullprice = "Full price is required";
      } else if (fullPrice === null) {
        rowErrors.fullprice = "Full price must be numeric";
      }

      ["di_amount_12", "di_amount_18", "di_amount_24", "di_amount_36"].forEach((field) => {
        const value = (row as any)[field];
        if (value.trim() !== "" && normalizeNumber(value) === null) {
          rowErrors[field] = "Must be numeric";
        }
      });

      if (Object.keys(rowErrors).length > 0) {
        nextStorageErrors[index] = rowErrors;
      }
    });

    setErrors(nextErrors);
    setStorageErrors(nextStorageErrors);

    return Object.keys(nextErrors).length === 0 && Object.keys(nextStorageErrors).length === 0;
  };

  const handleFieldChange = (field: keyof DeviceFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleImageUpload = (field: "image_file1" | "image_file2" | "image_file3") => {
    return (base64: string, file: File) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Only JPG, PNG or WEBP images are allowed",
        }));
        return;
      }

      handleFieldChange(field, base64);
    };
  };

  const handleStorageChange = (index: number, field: keyof StorageFormRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      storages: prev.storages.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }));

    setStorageErrors((prev) => {
      const next = { ...prev };
      if (next[index]) {
        delete next[index][field];
        if (Object.keys(next[index]).length === 0) delete next[index];
      }
      return next;
    });
  };

  const addStorageRow = () => {
    setForm((prev) => ({ ...prev, storages: [...prev.storages, { ...emptyStorageRow }] }));
  };

  const removeStorageRow = (index: number) => {
    setForm((prev) => {
      const nextRows = prev.storages.filter((_, rowIndex) => rowIndex !== index);
      return {
        ...prev,
        storages: nextRows.length ? nextRows : [{ ...emptyStorageRow }],
      };
    });

    setStorageErrors((prev) => {
      const next: Record<number, Record<string, string>> = {};
      Object.entries(prev).forEach(([key, rowErrors]) => {
        const numericKey = Number(key);
        if (numericKey < index) {
          next[numericKey] = rowErrors;
        } else if (numericKey > index) {
          next[numericKey - 1] = rowErrors;
        }
      });
      return next;
    });
  };

  const buildPayload = () => {
    if (isEditMode) {
      return {
        status: form.is_active ? 1 : 0,
      };
    }

    const storages: DeviceStoragePayload[] = form.storages.map((row) => {
      const payloadRow: DeviceStoragePayload = {
        crm_product_part_code: row.crm_product_part_code.trim(),
        storage: row.storage.trim(),
        fullprice: Number(row.fullprice),
      };

      if (row.id) payloadRow.id = Number(row.id);

      const di12 = normalizeNumber(row.di_amount_12);
      const di18 = normalizeNumber(row.di_amount_18);
      const di24 = normalizeNumber(row.di_amount_24);
      const di36 = normalizeNumber(row.di_amount_36);

      payloadRow.di_amount_12 = di12;
      payloadRow.di_amount_18 = di18;
      payloadRow.di_amount_24 = di24;
      payloadRow.di_amount_36 = di36;

      return payloadRow;
    });

    const payload: any = {
      category: form.category.trim(),
      brand: form.brand.trim(),
      device_name: form.device_name.trim(),
      color_variations: form.color_variations.trim(),
      image_file1: form.image_file1.trim(),
      image_file2: form.image_file2.trim() || undefined,
      image_file3: form.image_file3.trim() || undefined,
      order_by: normalizeNumber(form.order_by),
      storages,
    };

    if (mode === "create") {
      payload.status = 2;
    }

    return payload;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(buildPayload());
  };

  return (
    <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3, p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <TextField
          label="Category *"
          value={form.category}
          onChange={(e) => handleFieldChange("category", e.target.value)}
          error={Boolean(errors.category)}
          helperText={errors.category}
          disabled={isEditMode}
          fullWidth
        />

        <TextField
          label="Brand *"
          value={form.brand}
          onChange={(e) => handleFieldChange("brand", e.target.value)}
          error={Boolean(errors.brand)}
          helperText={errors.brand}
          disabled={isEditMode}
          fullWidth
        />

        <TextField
          label="Device Name *"
          value={form.device_name}
          onChange={(e) => handleFieldChange("device_name", e.target.value)}
          error={Boolean(errors.device_name)}
          helperText={errors.device_name}
          disabled={isEditMode}
          fullWidth
        />

        <TextField
          label="Color Variations"
          value={form.color_variations}
          onChange={(e) => handleFieldChange("color_variations", e.target.value)}
          disabled={isEditMode}
          fullWidth
        />

        <Box>
          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
            Upload Image 1 {mode === "create" ? "*" : "(Optional)"}
          </Typography>
          <FileInput
            id="device-image-1"
            label="Choose File"
            placeholder={form.image_file1 ? "Image selected" : "No file chosen"}
            onFileBase64={handleImageUpload("image_file1")}
            disabled={isEditMode}
          />
          {errors.image_file1 && (
            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
              {errors.image_file1}
            </Typography>
          )}
          {resolvePreviewSrc(form.image_file1) && (
            <Box
              component="img"
              src={resolvePreviewSrc(form.image_file1)}
              alt="Device image 1"
              sx={{
                mt: 1,
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid #e5e7eb",
              }}
            />
          )}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
            Upload Image 2 (Optional)
          </Typography>
          <FileInput
            id="device-image-2"
            label="Choose File"
            placeholder={form.image_file2 ? "Image selected" : "No file chosen"}
            onFileBase64={handleImageUpload("image_file2")}
            disabled={isEditMode}
          />
          {errors.image_file2 && (
            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
              {errors.image_file2}
            </Typography>
          )}
          {resolvePreviewSrc(form.image_file2) && (
            <Box
              component="img"
              src={resolvePreviewSrc(form.image_file2)}
              alt="Device image 2"
              sx={{
                mt: 1,
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid #e5e7eb",
              }}
            />
          )}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
            Upload Image 3 (Optional)
          </Typography>
          <FileInput
            id="device-image-3"
            label="Choose File"
            placeholder={form.image_file3 ? "Image selected" : "No file chosen"}
            onFileBase64={handleImageUpload("image_file3")}
            disabled={isEditMode}
          />
          {errors.image_file3 && (
            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
              {errors.image_file3}
            </Typography>
          )}
          {resolvePreviewSrc(form.image_file3) && (
            <Box
              component="img"
              src={resolvePreviewSrc(form.image_file3)}
              alt="Device image 3"
              sx={{
                mt: 1,
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid #e5e7eb",
              }}
            />
          )}
        </Box>

        <TextField
          label="Display Order"
          type="number"
          value={form.order_by}
          onChange={(e) => handleFieldChange("order_by", e.target.value)}
          disabled={isEditMode}
          fullWidth
        />
      </Box>

      {mode === "edit" && (
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => handleFieldChange("is_active", e.target.checked)}
              />
            }
            label={form.is_active ? "Status: Active" : "Status: Inactive"}
          />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Storage Variants *
        </Typography>

        {!isEditMode && (
          <Button
            onClick={addStorageRow}
            className="bg-brand-500 hover:bg-brand-600 text-theme-sm font-stc-medium shadow-theme-sm flex items-center gap-2 rounded-lg px-4 py-2 text-white"
          >
            <AddIcon fontSize="small" />
            Add Storage
          </Button>
        )}
      </Box>

      {errors.storages && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errors.storages}
        </Typography>
      )}

      <Box sx={{ display: "grid", gap: 2 }}>
        {form.storages.map((row, index) => (
          <Paper key={`${row.id || "new"}-${index}`} variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              <TextField
                label="CRM Product Part Code *"
                value={row.crm_product_part_code}
                onChange={(e) =>
                  handleStorageChange(index, "crm_product_part_code", e.target.value)
                }
                error={Boolean(storageErrors[index]?.crm_product_part_code)}
                helperText={storageErrors[index]?.crm_product_part_code}
                disabled={isEditMode}
                fullWidth
              />

              <TextField
                label="Storage *"
                value={row.storage}
                onChange={(e) => handleStorageChange(index, "storage", e.target.value)}
                error={Boolean(storageErrors[index]?.storage)}
                helperText={storageErrors[index]?.storage}
                disabled={isEditMode}
                fullWidth
              />

              <TextField
                label="Full Price *"
                type="number"
                value={row.fullprice}
                onChange={(e) => handleStorageChange(index, "fullprice", e.target.value)}
                error={Boolean(storageErrors[index]?.fullprice)}
                helperText={storageErrors[index]?.fullprice}
                disabled={isEditMode}
                fullWidth
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                {!isEditMode && (
                  <Tooltip title="Remove storage">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => removeStorageRow(index)}
                        disabled={form.storages.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>

              <TextField
                label="DI Amount 12"
                type="number"
                value={row.di_amount_12}
                onChange={(e) => handleStorageChange(index, "di_amount_12", e.target.value)}
                error={Boolean(storageErrors[index]?.di_amount_12)}
                helperText={storageErrors[index]?.di_amount_12}
                disabled={isEditMode}
                fullWidth
              />

              <TextField
                label="DI Amount 18"
                type="number"
                value={row.di_amount_18}
                onChange={(e) => handleStorageChange(index, "di_amount_18", e.target.value)}
                error={Boolean(storageErrors[index]?.di_amount_18)}
                helperText={storageErrors[index]?.di_amount_18}
                disabled={isEditMode}
                fullWidth
              />

              <TextField
                label="DI Amount 24"
                type="number"
                value={row.di_amount_24}
                onChange={(e) => handleStorageChange(index, "di_amount_24", e.target.value)}
                error={Boolean(storageErrors[index]?.di_amount_24)}
                helperText={storageErrors[index]?.di_amount_24}
                disabled={isEditMode}
                fullWidth
              />

              <TextField
                label="DI Amount 36"
                type="number"
                value={row.di_amount_36}
                onChange={(e) => handleStorageChange(index, "di_amount_36", e.target.value)}
                error={Boolean(storageErrors[index]?.di_amount_36)}
                helperText={storageErrors[index]?.di_amount_36}
                disabled={isEditMode}
                fullWidth
              />
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
              ? "Create Device"
              : "Update Device"}
        </Button>
      </Box>
    </Paper>
  );
}
