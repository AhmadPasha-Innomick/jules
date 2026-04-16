"use client";

import React, { useMemo, useState } from "react";
import * as Yup from "yup";
import Button from "@/components/ui/button/Button";
import { Switch, FormLabel } from "@mui/material";
import { ID_TYPE_OPTIONS } from "@/constants/idTypes";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useModuleAssignments } from "@/hooks/useGroupAssignments";



const schema = Yup.object({
    module_group_id: Yup.number()
        .required("Module Group is required")
        .typeError("Module Group is required"),

    select_id_types: Yup.string()
        .required("ID Type is required"),

    select_id_type_order: Yup.number()
        .typeError("Order must be a number")
        .required("Order is required")
        .integer("Order must be a whole number")
        .min(1, "Order must be greater than 0"),
});



export default function SelectedIdTypeForm({
    onSubmit,
    onCancel,
    isSubmitting,
}: any) {
    const [selectedModuleGroup, setSelectedModuleGroup] = useState<any>(null);
    const [selectedIdType, setSelectedIdType] = useState<any>(null);

    const [moduleGroupId, setModuleGroupId] = useState<number | null>(null);
    const [idType, setIdType] = useState("");
    const [order, setOrder] = useState<number | "">("");
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const ORDER_OPTIONS = [1, 2, 3, 4, 5];


    const moduleGroupParams = useMemo(
        () => ({
            limit: 1000,
            offset: 0,
        }),
        []
    );

    const {
        data: moduleGroupData,
        isLoading: moduleGroupLoading,
    } = useModuleAssignments(moduleGroupParams);

    const moduleGroups = moduleGroupData?.data?.items || [];



    const handleSubmit = async () => {
        try {
            setErrors({});

            await schema.validate(
                {
                    module_group_id: moduleGroupId,
                    select_id_types: idType,
                    select_id_type_order: order,
                },
                { abortEarly: false }
            );

            onSubmit({
                module_group_id: moduleGroupId,
                select_id_types: idType,
                select_id_type_order: Number(order),
                is_active: isActive ? 1 : 0,
            });
        } catch (err: any) {
            const e: Record<string, string> = {};


            if (err?.inner) {
                err.inner.forEach((x: any) => {
                    e[x.path] = x.message;
                });
            }


            if (err?.data) {
                Object.entries(err.data).forEach(([field, messages]: any) => {
                    if (Array.isArray(messages)) {
                        e[field] = messages[0];
                    }
                });
            }

            setErrors(e);
        }

    };

  

    return (
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              
                <Autocomplete
                    options={moduleGroups}
                    loading={moduleGroupLoading}
                    value={selectedModuleGroup}
                    isOptionEqualToValue={(option, value) =>
                        option.module_group_id === value?.module_group_id
                    }
                    getOptionLabel={(opt: any) =>
                        opt ? `${opt.module_name} - ${opt.group_name}` : ""
                    }
                    onChange={(_, val) => {
                        setSelectedModuleGroup(val);
                        setModuleGroupId(val ? val.module_group_id : null);
                    }}
                    renderOption={(props, option) => (
                        <li {...props} key={option.module_group_id}>
                            {option.module_name} - {option.group_name}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Module Group*"
                            fullWidth
                            error={!!errors.module_group_id}
                            helperText={errors.module_group_id}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {moduleGroupLoading && <CircularProgress size={20} />}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />




                <Autocomplete
                    options={ID_TYPE_OPTIONS}
                    value={selectedIdType}
                    isOptionEqualToValue={(option, value) =>
                        option.code === value?.code
                    }
                    getOptionLabel={(option) => option.label || ""}
                    onChange={(_, val) => {
                        setSelectedIdType(val);
                        setIdType(val ? val.code : "");

                   
                    }}
                    renderOption={(props, option) => (
                        <li {...props} key={option.code}>
                            <span className="font-medium">{option.label}</span>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="ID Type*"
                            fullWidth
                            error={!!errors.select_id_types}
                            helperText={errors.select_id_types}
                        />
                    )}
                />



                <TextField
                    label="Order*"
                    fullWidth
                    value={order}
                    inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                    }}
                    onChange={(e) => {
                        const value = e.target.value;


                        if (value === "") {
                            setOrder("");
                            return;
                        }


                        if (/^\d+$/.test(value)) {
                            setOrder(Number(value));
                        }
                    }}
                    error={!!errors.select_id_type_order}
                    helperText={errors.select_id_type_order}
                />




                <div>
                    <FormLabel>Status</FormLabel>
                    <Switch
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                </div>
            </div>


            <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Link ID Type"}
                </Button>
            </div>
        </div>
    );
}
