"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { FormLabel, Alert } from "@mui/material";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";
import { useUserTitles } from "@/hooks/useLookups";
import { useRouter } from "next/navigation";

const schema = yup.object({
  user_title_id: yup.number().required("Title is required"),

  user_name: yup
    .string()
    .required("Username is required")
    .max(50, "Max 50 characters"), 

  user_firstname: yup
    .string()
    .required("First name is required")
    .max(50, "Max 50 characters"),

  user_middlename: yup
    .string()
    .nullable()
    .max(50, "Max 50 characters"),

  user_lastname: yup
    .string()
    .required("Last name is required")
    .max(50, "Max 50 characters"),

  user_fullname: yup
    .string()
    .required("Full name is required")
    .max(150, "Max 150 characters"),

  is_active: yup.number().oneOf([0, 1]).required(),
  is_manager: yup.number().oneOf([0, 1]).required(),
});
type FormData = yup.InferType<typeof schema>;

export default function UserEditInfo({ user, onNext }: any) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid, isDirty },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
  });


  const router = useRouter();
  const { data: titlesData, isLoading: titlesLoading } = useUserTitles();

  const titles =
    titlesData?.data?.map((t: any) => ({
      id: t.id,
      name: t.titlecode,
    })) || [];

  useEffect(() => {
    reset({
      user_title_id: user.user_title_id ?? 1,
      user_name: user.username,
      user_firstname: user.first_name,
      user_middlename: user.middle_name,
      user_lastname: user.last_name,
      user_fullname: user.full_name,
      is_active: Number(user.status),
      is_manager: Number(user.is_manager ?? 0),
    });
  }, [user, reset]);

  const first = watch("user_firstname");
  const mid = watch("user_middlename");
  const last = watch("user_lastname");

  useEffect(() => {
    const fullName = [first, mid, last].filter(Boolean).join(" ");
    setValue("user_fullname", fullName, { shouldValidate: true });
  }, [first, mid, last, setValue]);

  const onSubmit = (data: FormData) => {
    onNext(data);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="font-stc-bold mb-2 text-2xl text-gray-900">
            Edit User
          </h2>
          <p className="text-sm text-gray-600">
            Update the basic information of the user
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

      
            <Controller
              name="user_title_id"
              control={control}
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <DynamicAutocomplete
                    label="Title *"
                    options={titles}
                    loading={titlesLoading}
                    value={field.value ?? null}
                    onChange={(val: any) =>
                      field.onChange(val ? Number(val) : undefined)
                    }
                    getOptionLabel={(o: any) => o.name}
                    getOptionValue={(o: any) => o.id}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </div>
              )}
            />

    
            <InputField<FormData>
              name="user_name"
              control={control}
              label="Username"
              disabled
            />

        
            <InputField<FormData>
              name="user_firstname"
              control={control}
              label="First Name"
              required
            />

          
            <InputField<FormData>
              name="user_middlename"
              control={control}
              label="Middle Name (Optional)"
            />

          
            <InputField<FormData>
              name="user_lastname"
              control={control}
              label="Last Name"
              required
            />

          
            <div className="md:col-span-2">
              <InputField<FormData>
                name="user_fullname"
                control={control}
                label="Full Name"
                disabled
              />
            </div>

         
            <div className="flex flex-col">
              <FormLabel className="font-stc-medium mb-2 text-sm text-gray-700">
                Status
              </FormLabel>
              <Switch<FormData>
                name="is_active"
                control={control}
                activeLabel="Active"
                inactiveLabel="Inactive"
              />
            </div>

         
            <div className="flex flex-col">
              <FormLabel className="font-stc-medium mb-2 text-sm text-gray-700">
                Manager Role
              </FormLabel>
              <Switch<FormData>
                name="is_manager"
                control={control}
                activeLabel="Yes"
                inactiveLabel="No"
              />
            </div>
          </div>

     
          <div className="mt-8 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/user_management")}
              className="min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"

              className="min-w-[120px]"
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
