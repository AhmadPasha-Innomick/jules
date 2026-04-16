"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  FormLabel,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Switch from "@/components/form/switch/Switch";
import { useCreateUser } from "@/hooks/useApi";
import { useUserTitles } from "@/hooks/useLookups";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";

const alphabetOnly = /^[A-Za-z\s]+$/;
const alphabetOnlyWithDot = /^[A-Za-z.\s]+$/;


const userSchema = yup.object({

  user_name: yup
    .string()
    .required("Username is required")
    .max(50, "Max 50 characters"),


  user_title_id: yup.number().required("Title is required"),

  user_firstname: yup
    .string()
    .required("First name is required")
    .max(50, "Max 50 characters")
    .matches(
      alphabetOnlyWithDot,
      "Only alphabets and dot (.) allowed"
    ),

  user_middlename: yup
    .string()
    .nullable()
    .max(50, "Max 50 characters")
    .test("alphabet-only", "Only alphabets allowed", (value) => {
      if (!value) return true;
      return alphabetOnly.test(value);
    }),

  user_lastname: yup
    .string()
    .required("Last name is required")
    .max(50, "Max 50 characters")
    .matches(alphabetOnly, "Only alphabets allowed"),

  user_fullname: yup
    .string()
    .required("Full name is required")
    .max(150, "Max 150 characters"),


  is_active: yup.number().oneOf([0, 1]).default(1),
  is_manager: yup.number().oneOf([0, 1]),
});

export interface UserFormData {
  user_name: string;
  password?: string;
  confirmPassword?: string;
  user_firstname: string;
  user_middlename: string;
  user_lastname: string;
  user_fullname: string;
  is_active: number;
  is_manager: number;
  required?: boolean;
  rules?: any;

  user_title_id: number;
}

interface UserBasicInfoProps {
  onNext?: (data: Omit<UserFormData, "confirmPassword">) => void;
  onCancel?: () => void;
  defaultValues?: Partial<UserFormData>;
  backendErrors?: Record<string, string[]>;


}

const EMPTY_FORM: UserFormData = {
  user_name: "",
  user_firstname: "",
  user_middlename: "",
  user_lastname: "",
  user_fullname: "",
  user_title_id: undefined as any,
  is_active: 1,
  is_manager: 0,
};


const UserBasicInfo: React.FC<UserBasicInfoProps> = ({
  onNext,
  onCancel,
  defaultValues,
  backendErrors,
}) => {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const [skipDefaultReset, setSkipDefaultReset] = React.useState(false);

  const { data: titleData, isLoading: titlesLoading } = useUserTitles();
  const titles = titleData?.data ?? [];

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,

    setValue,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema) as any,
    mode: "onChange",
    defaultValues: defaultValues || {
      user_name: "",
      user_firstname: "",
      user_middlename: "",
      user_lastname: "",
      user_fullname: "",
      user_title_id: undefined,
      is_active: 1,
      is_manager: 0,
    },
  });

  useEffect(() => {
    if (!isValid || Object.keys(errors).length > 0) {
      setSubmitSuccess(null);
    }
  }, [isValid, errors]);
  useEffect(() => {
    if (isDirty) {
      setSubmitSuccess(null);
    }
  }, [isDirty]);



  useEffect(() => {
    if (backendErrors && Object.keys(backendErrors).length > 0) {

      setSubmitSuccess(null);

      Object.entries(backendErrors).forEach(([field, messages]) => {
        setError(field as any, {
          type: "server",
          message: messages[0],
        });
      });
    }
  }, [backendErrors, setError]);

  useEffect(() => {
    if (defaultValues && !skipDefaultReset) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, skipDefaultReset]);



  const createUserMutation = useCreateUser();

  const watchedFirstName = watch("user_firstname");
  const watchedMiddleName = watch("user_middlename");
  const watchedLastName = watch("user_lastname");

  useEffect(() => {
    const first = watchedFirstName?.trim();
    const middle = watchedMiddleName?.trim();
    const last = watchedLastName?.trim();

    if (!first || !last) {

      setValue("user_fullname", "", { shouldValidate: false });

      return;
    }

    const fullName = [first, middle, last].filter(Boolean).join(" ");
    setValue("user_fullname", fullName, { shouldValidate: false });

  }, [watchedFirstName, watchedMiddleName, watchedLastName, setValue]);


  const onSubmit = async (data: UserFormData) => {
    const isFormValid = await trigger();
    if (!isFormValid) return;

    setSkipDefaultReset(false);

    const { confirmPassword, ...formData } = data;
    onNext?.(formData);

    setSubmitSuccess("Basic information saved. Continue to Profile.");
  };




  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("../user_management");
    }
  };

  const handleReset = () => {
    setSkipDefaultReset(true);

    reset(EMPTY_FORM, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
    });

    setSubmitError(null);
    setSubmitSuccess(null);
  };



  const hasAllRequiredFields =
    !!watch("user_title_id") &&
    !!watch("user_name")?.trim() &&
    !!watch("user_firstname")?.trim() &&
    !!watch("user_lastname")?.trim();

  const nextButtonEnabled = hasAllRequiredFields && !createUserMutation.isPending;


  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-stc-bold mb-2 text-2xl text-gray-900">
            Create New User
          </h2>
          <p className="text-sm text-gray-600">
            Fill in the information below to create a new user account
          </p>
        </div>

        {submitSuccess && (
          <Alert severity="success" className="mb-6">
            {submitSuccess}
          </Alert>
        )}
        {submitError && (
          <Alert severity="error" className="mb-6">
            {submitError}
          </Alert>
        )}
        {createUserMutation.isError && (
          <Alert severity="error" className="mb-6">
            {(createUserMutation.error as Error)?.message ||
              "Failed to create user"}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


            <Controller
              name="user_title_id"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field, fieldState: { error } }) => (
                <div className="w-full">
                  <DynamicAutocomplete
                    label="Title *"
                    options={titles.map((t: any) => ({
                      id: t.id,
                      name: t.titlecode,
                    }))}
                    loading={titlesLoading}
                    value={field.value ?? null}
                    onChange={(val: any) =>
                      field.onChange(val ? Number(val) : undefined)
                    }
                    getOptionLabel={(o: any) => o.name}
                    getOptionValue={(o: any) => o.id}
                    error={!!error}
                    helperText={error?.message}
                  />

                </div>
              )}
            />

            <InputField<UserFormData>
              required
              rules={{ required: "Username is required" }}
              name="user_name"
              control={control}
              label="Username"
              placeholder="Enter username"
              disabled={createUserMutation.isPending}
              onInput={(e: any) => {
                e.target.value = e.target.value.slice(0, 50);
              }}


            />



            <InputField<UserFormData>
              name="user_firstname"
              control={control}
              label="First Name"
              placeholder="Enter first name"
              disabled={createUserMutation.isPending}
              required
              rules={{ required: "First Name is required" }}
              onInput={(e: any) => {
                e.target.value = e.target.value
                  .replace(/[^A-Za-z.]/g, "")
                  .slice(0, 50);
              }}
            />


            <InputField<UserFormData>
              name="user_middlename"
              control={control}
              label="Middle Name (Optional)"
              placeholder="Enter middle name"
              disabled={createUserMutation.isPending}
              onInput={(e: any) => {
                e.target.value = e.target.value
                  .replace(/[^A-Za-z]/g, "")
                  .slice(0, 50);
              }}
            />


            <InputField<UserFormData>
              name="user_lastname"
              control={control}
              label="Last Name"
              placeholder="Enter last name"
              disabled={createUserMutation.isPending}
              required
              rules={{ required: "Last Name is required" }}
              onInput={(e: any) => {
                e.target.value = e.target.value
                  .replace(/[^A-Za-z]/g, "")
                  .slice(0, 50);
              }}
            />


            <div className="md:col-span-2">
              <InputField<UserFormData>
                name="user_fullname"
                control={control}
                label="Full Name"
                placeholder="Auto-generated"
                disabled
              />
            </div>


            <div className="flex flex-col">
              <FormLabel className="font-stc-medium mb-2 text-sm text-gray-700">
                Status
              </FormLabel>
              <Switch<UserFormData>
                name="is_active"
                control={control}
                activeLabel="Active"
                inactiveLabel="Inactive"
                color="primary"
                disabled={createUserMutation.isPending}
              />
            </div>


            <div className="flex flex-col">
              <FormLabel className="font-stc-medium mb-2 text-sm text-gray-700">
                Manager Role
              </FormLabel>
              <Switch<UserFormData>
                name="is_manager"
                control={control}
                activeLabel="Yes"
                inactiveLabel="No"
                color="primary"
                disabled={createUserMutation.isPending}
              />

            </div>

          </div>



          <div className="mt-8 flex flex-col justify-end gap-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={createUserMutation.isPending || !isDirty}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!nextButtonEnabled}
              className="min-w-[120px]"
            >
              {createUserMutation.isPending ? "Creating..." : "Next"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UserBasicInfo;
