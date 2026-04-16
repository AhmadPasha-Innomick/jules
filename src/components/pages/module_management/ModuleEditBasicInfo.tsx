"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { FormLabel } from "@mui/material";
import Switch from "@/components/form/switch/Switch";

interface ModuleData {
  module_name: string;
  module_category: string;
  module_desc: string;
  is_active: number;
}

interface Props {
  module: ModuleData;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const getInitialForm = (module: ModuleData) => ({
  module_name: module.module_name || "",
  module_category: module.module_category || "",
  module_desc: module.module_desc || "",
  is_active: module.is_active === 1,
});

export default function ModuleEditBasicInfo({
  module,
  onSubmit,
  isSubmitting,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState(() => getInitialForm(module));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(getInitialForm(module));
    setErrors({});
  }, [module]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // ✅ Cancel → reset + redirect
  const handleCancel = () => {
    setForm(getInitialForm(module));
    setErrors({});
    router.push("/module_management");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.module_name.trim()) {
      newErrors.module_name = "Module name is required";
    } else if (form.module_name.length > 50) {
      newErrors.module_name = "Maximum 50 characters allowed";
    }

    if (!form.module_category.trim()) {
      newErrors.module_category = "Category is required";
    }

    if (!form.module_desc.trim()) {
      newErrors.module_desc = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...form,
      is_active: form.is_active ? 1 : 0,
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Edit Module Info
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Update module details.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="Module Name"
              value={form.module_name}
              onChange={(e) => handleChange("module_name", e.target.value)}
              required
              error={!!errors.module_name}
              helperText={errors.module_name}
              inputProps={{ maxLength: 50 }}
            />

            <InputField
              label="Category"
              value={form.module_category}
              onChange={(e) => handleChange("module_category", e.target.value)}
              required
              error={!!errors.module_category}
              helperText={errors.module_category}
            />

            <InputField
              label="Description"
              value={form.module_desc}
              onChange={(e) => handleChange("module_desc", e.target.value)}
              required
              multiline
              rows={3}
              error={!!errors.module_desc}
              helperText={errors.module_desc}
              className="md:col-span-2"
            />
          </div>

          <div className="mt-6 flex flex-col">
            <FormLabel className="mb-2 text-sm font-medium text-gray-700">
              Status
            </FormLabel>
            <Switch
              checked={form.is_active}
              onChange={(checked) => handleChange("is_active", checked)}
              activeLabel="Active"
              inactiveLabel="Inactive"
              disabled={isSubmitting}
            />
          </div>

         
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
