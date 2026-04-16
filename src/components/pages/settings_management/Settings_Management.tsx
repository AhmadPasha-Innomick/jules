"use client";

import React, { useEffect, useState } from "react";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";
import Switch from "@/components/form/switch/Switch";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useUpdateSystemSettings } from "@/hooks/useUpdateSystemSettings";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import * as yup from "yup";

const dateFormats = [
  { id: 1, name: "DD-MM-YYYY" },
  { id: 2, name: "DD/MM/YYYY" },
];

const timeFormats = [
  { id: 1, name: "24Hrs" },
  { id: 2, name: "12Hrs" },
];


type Option = { id: number; name: string };

interface FormState {
  sysdate_format: Option | null;
  systime_format: Option | null;
  currency: string;
  currency_symbol: string;
  admin_export_only: boolean;
  no_try_before_lock: number;
  lock_timeout: number;
  pre_validation_timer_ms: number;
  is_active: boolean;
  created_by: string;
  created_date_time: string;
}

const systemSettingsSchema = yup.object({
  sysdate_format: yup
    .object()
    .nullable()
    .required("Sysdate format is required"),

  systime_format: yup
    .object()
    .nullable()
    .required("Systime format is required"),

  currency: yup
    .string()
    .trim()
    .required("Currency is required"),

  currency_symbol: yup
    .string()
    .trim()
    .required("Currency symbol is required"),

  no_try_before_lock: yup
    .number()
    .typeError("Must be a number")
    .min(1, "Must be greater than 0")
    .required("No. of tries is required"),

  lock_timeout: yup
    .number()
    .typeError("Must be a number")
    .min(1, "Must be greater than 0")
    .required("Lock timeout is required"),

  pre_validation_timer_ms: yup
    .number()
    .typeError("Must be a number")
    .min(1, "Must be greater than 0")
    .required("Pre-validation timer is required"),
});


const SystemSettings = () => {
  const { data, isLoading } = useSystemSettings();
  const updateMutation = useUpdateSystemSettings();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    sysdate_format: null,
    systime_format: null,
    currency: "",
    currency_symbol: "",
    admin_export_only: false,
    no_try_before_lock: 0,
    lock_timeout: 0,
    pre_validation_timer_ms: 0,
    is_active: false,
    created_by: "",
    created_date_time: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();


  useEffect(() => {
    if (!data) return;

    const mappedDateFormat =
      dateFormats.find(d => d.name === data.sysdate_format) ?? null;

    const mappedTimeFormat =
      timeFormats.find(t => t.name === data.systime_format) ?? null;

    setFormData(prev => ({
      ...prev,
      sysdate_format: mappedDateFormat,
      systime_format: mappedTimeFormat,
      currency: data.currency,
      currency_symbol: data.currency_symbol,
      admin_export_only: data.admin_export_only === 1,
      no_try_before_lock: data.no_try_before_lock,
      lock_timeout: data.lock_timeout,
      is_active: data.is_active === 1,
      created_by: data.created_by,
      pre_validation_timer_ms: data.pre_validation_timer_ms,
      created_date_time: data.created_date_time,
    }));
  }, [data]);


  const handleChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await systemSettingsSchema.validate(formData, {
        abortEarly: false,
      });

      const payload = {
        sysdate_format: formData.sysdate_format!.name,
        systime_format: formData.systime_format!.name,
        currency: formData.currency,
        currency_symbol: formData.currency_symbol,
        admin_export_only: formData.admin_export_only ? 1 : 0,
        no_try_before_lock: formData.no_try_before_lock,
        lock_timeout: formData.lock_timeout,
        pre_validation_timer_ms: formData.pre_validation_timer_ms,
        is_active: formData.is_active ? 1 : 0,
      };

      await updateMutation.mutateAsync(payload);
      setSuccessMsg("System settings saved successfully");
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const fieldErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setErrorMsg(err.message || "Failed to save settings");
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-8">





      
        <section className="rounded-xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">Security Settings</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              type="number"
              label="No. of Tries Before Lock"
              value={formData.no_try_before_lock}
              onChange={e =>
                handleChange("no_try_before_lock", Number(e.target.value))
              }
            />

            <InputField
              type="number"
              label="Lock Timeout (seconds)"
              value={formData.lock_timeout}
              onChange={e =>
                handleChange("lock_timeout", Number(e.target.value))
              }
            />

            <InputField
              type="number"
              label="Pre-validation Timer (ms)"
              value={formData.pre_validation_timer_ms}
              onChange={e =>
                handleChange(
                  "pre_validation_timer_ms",
                  Number(e.target.value)
                )
              }
            />
          </div>

        </section>

       
        <section className="rounded-xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">System Status</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


            <InputField
              label="Created By"
              value={formData.created_by}
              disabled
            />

            <InputField
              label="Created Date & Time"
              value={formData.created_date_time}
              disabled
            />


          </div>
        </section>

      
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>

        </div>
      </form>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "90px",
          zIndex: (theme) => theme.zIndex.snackbar + 10,
        }}
        onClose={() => setSuccessMsg(null)}

      >
        <Alert severity="success" variant="filled">
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error" variant="filled">
          {errorMsg}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default SystemSettings;
