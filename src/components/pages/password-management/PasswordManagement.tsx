"use client";

import React, { useEffect } from "react";
import {
  FormControlLabel,
  FormLabel,
  TextField,
  Divider,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Button from "@/components/ui/button/Button";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePasswordSettings } from "@/hooks/useSettings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";


type UpdatePasswordPayload = {
  passwd_min_len: number;
  passwd_upper_char: number;
  passwd_lower_char: number;
  passwd_number: number;
  passwd_spl_char: number;
  enable_forgot_password: 0 | 1;
  is_active: 0 | 1;
};


const useUpdatePasswordSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const res = await fetchWithAuth("/api/password/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save settings");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwords"] });
    },
  });
};


const schema = yup.object({
  passwd_min_len: yup
    .number()
    .min(1, "At least 1")
    .max(50, "Max 50")
    .required("Required")
    .typeError("Must be a number"),

  
  passwd_upper_char: yup
    .number()
    .min(0, "Minimum 0")
    .max(9, "Maximum 9")
    .integer("Must be a whole number")
    .required("Required")
    .typeError("Enter a number from 0 to 9"),

  passwd_lower_char: yup
    .number()
    .min(0, "Minimum 0")
    .max(9, "Maximum 9")
    .integer("Must be a whole number")
    .required("Required")
    .typeError("Enter a number from 0 to 9"),

  passwd_number: yup
    .number()
    .min(0, "Minimum 0")
    .max(9, "Maximum 9")
    .integer("Must be a whole number")
    .required("Required")
    .typeError("Enter a number from 0 to 9"),

  passwd_spl_char: yup
    .number()
    .min(0, "Minimum 0")
    .max(9, "Maximum 9")
    .integer("Must be a whole number")
    .required("Required")
    .typeError("Enter a number from 0 to 9"),

  enable_forgot_password: yup.boolean().required(),
  is_active: yup.boolean().required(),
});



const PasswordSettings = () => {
  const { data, isLoading, isError, refetch } = usePasswordSettings();
  const settings = data?.data;

  const updateMutation = useUpdatePasswordSettings();


  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      passwd_min_len: 6,
      passwd_upper_char: 0,
      passwd_lower_char: 0,
      passwd_number: 0,
      passwd_spl_char: 0,
      enable_forgot_password: true,
      is_active: true,
    },
  });


  useEffect(() => {
    if (settings) {
      setValue("passwd_min_len", settings.passwd_min_len ?? 6);
      setValue("passwd_upper_char", settings.passwd_upper_char ?? 0);
      setValue("passwd_lower_char", settings.passwd_lower_char ?? 0);
      setValue("passwd_number", settings.passwd_number ?? 0);
      setValue("passwd_spl_char", settings.passwd_spl_char ?? 0);
      setValue("enable_forgot_password", settings.enable_forgot_password === 1);
      setValue("is_active", settings.is_active === 1);
    }
  }, [settings, setValue]);


  const [openToast, setOpenToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastSeverity, setToastSeverity] = React.useState<"success" | "error">("success");

  const onSubmit = (data: any) => {
    const payload: UpdatePasswordPayload = {
      passwd_min_len: Number(data.passwd_min_len),
      passwd_upper_char: Number(data.passwd_upper_char),
      passwd_lower_char: Number(data.passwd_lower_char),
      passwd_number: Number(data.passwd_number),
      passwd_spl_char: Number(data.passwd_spl_char),
      enable_forgot_password: data.enable_forgot_password ? 1 : 0,
      is_active: data.is_active ? 1 : 0,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setToastMessage(" Updated Successfully!");
        setToastSeverity("success");
        setOpenToast(true);
      },
      onError: (err: any) => {
        setToastMessage(err.message || "Update failed");
        setToastSeverity("error");
        setOpenToast(true);
      }
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <CircularProgress />
      <span className="ml-4 text-lg">Loading...</span>
    </div>
  );

  if (isError) return (
    <Alert severity="error" className="max-w-2xl mx-auto">
      Failed to load settings.{" "}
      <button onClick={() => refetch()} className="underline">Retry</button>
    </Alert>
  );

  const charFields = [
    { name: "passwd_upper_char" as const, label: "Minimum Uppercase (A-Z)" },
    { name: "passwd_lower_char" as const, label: "Minimum Lowercase (a-z)" },
    { name: "passwd_number" as const, label: "Minimum Numbers (0-9)" },
    { name: "passwd_spl_char" as const, label: "Minimum Special Characters" },
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-stc-bold text-gray-800 mb-8">
          Password Policy Settings
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

       
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-stc-bold mb-4">Password Complexity</h3>
            <Divider className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Box display="flex" alignItems="center" gap={1}>
                <FormLabel sx={{ width: 160, fontSize: 14 }}>
                  Minimum Length
                </FormLabel>

                <TextField
                  type="number"
                  size="small"
                  {...register("passwd_min_len")}
                  inputProps={{ min: 1, max: 50 }}
                  sx={{ width: 120 }}
                  error={!!errors.passwd_min_len}
                  helperText={errors.passwd_min_len?.message}
                  required
                />

                <Typography variant="body2" color="text.secondary">
                  characters
                </Typography>
              </Box>


            

              <div className="space-y-6">
                {charFields.map(({ name, label }) => (
                  <div key={name} className="flex items-center gap-4 p-1">
                    <FormLabel className="w-56 text-sm text-gray-700">{label}</FormLabel>
                    <TextField
                      type="number"
                      size="small"
                      {...register(name)}
                      inputProps={{ min: 0, max: 9, step: 1 }}
                      className="w-24"
                      error={!!errors[name]}
                      helperText={errors[name]?.message}
                    />
                    <span className="text-xs text-gray-500">0–9</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-stc-bold mb-4">Password Recovery</h3>
            <Divider className="mb-6" />
            <FormControlLabel
              control={
                <Controller
                  name="enable_forgot_password"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label="Enable Forgot Password Feature"
            />
          </section>

      

          {false && <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-stc-bold mb-4">Policy Status</h3>
           
            <FormControlLabel
              control={
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label="Policy is Active"
            />
          </section>}


        
          <div className="flex justify-end pt-6 border-t">
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>

          </div>
        </form>
      </div>

     <Snackbar
  open={openToast}
  autoHideDuration={6000}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
  sx={{
    mt: "90px", 
    zIndex: (theme) => theme.zIndex.snackbar + 10,
  }}
  onClose={() => setOpenToast(false)}
>
  <Alert
    severity={toastSeverity}
    variant="filled"
    onClose={() => setOpenToast(false)}
  >
    {toastMessage}
  </Alert>
</Snackbar>





    </>
  );
};

export default PasswordSettings;