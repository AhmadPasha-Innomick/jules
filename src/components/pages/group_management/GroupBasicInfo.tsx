"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { Controller } from "react-hook-form";
import { Select, MenuItem, FormLabel, Alert } from "@mui/material";



const schema = yup.object({
    group_name: yup
        .string()
        .required("Group name is required")
        .max(100, "Max 100 characters"),

    group_desc: yup
        .string()
        .nullable()
        .max(255, "Max 255 characters"),
    group_level: yup
        .number()
        .oneOf([1, 2, 3, 4], "Please select a valid level (1–4)")
        .required("Group level is required"),
    is_active: yup.boolean().default(true),
});


export interface GroupBasicFormValues {
    group_name: string;
    group_desc: string | null;

    group_level: 1 | 2 | 3 | 4;
    is_active: boolean;
}

interface Props {
    onNext?: (data: GroupBasicFormValues) => void;
    onCancel?: () => void;
    defaultValues?: GroupBasicFormValues | null;
    backendErrors?: Record<string, string[]> | null;
}


const GroupBasicInfo: React.FC<Props> = ({ onNext, onCancel, defaultValues, backendErrors }) => {
    const router = useRouter();
    const [success, setSuccess] = React.useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { isValid, errors },
        reset,
        setError,
    } = useForm<GroupBasicFormValues>({
        resolver: yupResolver(schema) as any,
        mode: "onChange",
        defaultValues: {
            group_name: "",
            group_desc: "",
            group_level: 1,
            is_active: true,
        },
    });

    React.useEffect(() => {
        if (!backendErrors) return;

        Object.entries(backendErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
                setError(field as keyof GroupBasicFormValues, {
                    type: "server",
                    message: messages[0],
                });
            }
        });
    }, [backendErrors, setError]);


    React.useEffect(() => {
        if (defaultValues) {
            reset(defaultValues, {
                keepErrors: true,
                keepDirty: true,
            });
        }
    }, [defaultValues, reset]);


    const onSubmit = (data: GroupBasicFormValues) => {

        setSuccess("Basic information saved – proceeding to Group Properties");
        onNext?.(data);
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        else router.push("/group_management");
    };

    const handleReset = () => {
        reset();
        setSuccess(null);
    };

    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 shadow-sm">



                {success && (
                    <Alert severity="success" className="mb-6">
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     
                        <InputField<GroupBasicFormValues>
                            name="group_name"
                            control={control}
                            label="Group Name"
                            required
                            placeholder="e.g. Sales Team"
                            helperText={errors.group_name?.message}
                            error={!!errors.group_name}
                        />

                   
                        <InputField<GroupBasicFormValues>
                            name="group_desc"
                            control={control}
                            label="Description (Optional)"

                            rows={4}
                            placeholder="Short description of the group's purpose"
                        />




                  
                        <div className="flex flex-col justify-end">
                            <FormLabel className="mb-2 text-sm font-medium text-gray-700">
                                Status
                            </FormLabel>
                            <Switch<GroupBasicFormValues>
                                name="is_active"
                                control={control}
                                activeLabel="Active"
                                inactiveLabel="Inactive"
                            />
                        </div>
                    </div>


                    <div className="mt-10 flex justify-end gap-4">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid}
                            className="min-w-[120px]"
                        >
                            Next
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroupBasicInfo;