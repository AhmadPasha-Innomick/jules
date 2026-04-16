"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { FormLabel } from "@mui/material";


const groupNameRegex = /^[a-zA-Z0-9\s\-_]+$/;

const schema = yup.object({
    group_name: yup
        .string()
        .required("Group name is required")
        .max(100, "Max 100 characters")
        .matches(
            groupNameRegex,
            "Only letters, numbers, space, dash (-) and underscore (_) allowed"
        ),
    group_desc: yup.string().nullable().max(255, "Max 255 characters"),
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
    group: any;
    onNext: (data: GroupBasicFormValues) => void;
    onCancel?: () => void;
}

export default function GroupEditBasicInfo({
    group,
    onNext,
    onCancel,
}: Props) {
    const {
        control,
        handleSubmit,
        formState: { isValid, dirtyFields },
        reset,
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


    useEffect(() => {
        if (group) {
            reset({
                group_name: group.group_name ?? "",
                group_desc: group.group_desc ?? "",
                group_level: group.group_level ?? 1,
                is_active: group.is_active === 1,
            });
        }
    }, [group, reset]);



    const hasUserChanges = Object.keys(dirtyFields).length > 0;

    const onSubmit = (data: GroupBasicFormValues) => {
        onNext(data);
    };

    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                     
                        <InputField<GroupBasicFormValues>
                            name="group_name"
                            control={control}
                            label="Group Name"
                            required
                            placeholder="e.g. Sales Team"
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
                            onClick={onCancel}
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
