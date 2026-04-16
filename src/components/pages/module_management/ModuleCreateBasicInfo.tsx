"use client";

import React, { useState, useEffect } from "react";
import {
    TextField,
    Switch,
    FormControlLabel,
    Button as MUIButton,
} from "@mui/material";
import * as Yup from "yup";


interface ModuleForm {
    module_name: string;
    module_slug: string;
    module_category: string;
    module_desc: string;
    is_active: boolean;
}

interface ErrorType {
    [key: string]: string | undefined;
}


const schema = Yup.object().shape({
    module_name: Yup.string()
        .required("Module Name is required")
        .max(50, "Maximum 50 characters allowed"),

    module_slug: Yup.string().required(),

    module_category: Yup.string()
        .required("Category is required")
        .max(100, "Maximum 100 characters allowed"),

    module_desc: Yup.string()
        .required("Description is required")
        .max(250, "Maximum 250 characters allowed"),

    is_active: Yup.boolean(),
});


export default function ModuleCreateBasicInfo({
    onSubmit,
    isSubmitting,
}: {
    onSubmit: (data: ModuleForm) => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<ModuleForm>({
        module_name: "",
        module_slug: "",
        module_category: "",
        module_desc: "",
        is_active: true,
    });

    const [formErrors, setFormErrors] = useState<ErrorType>({});


    useEffect(() => {
        const slug = form.module_name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setForm((prev) => ({ ...prev, module_slug: slug }));
    }, [form.module_name]);


    const handleChange = (key: keyof ModuleForm, value: any) => {
        const maxLimits: Record<string, number> = {
            module_name: 50,
            module_category: 100,
            module_desc: 250,
        };

        if (maxLimits[key] && value.length > maxLimits[key]) return;

        setForm((prev) => ({ ...prev, [key]: value }));
        setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    };


    const handleSubmit = async () => {
        try {
            await schema.validate(form, { abortEarly: false });
            setFormErrors({});
            onSubmit(form);
        } catch (err: any) {
            const newErrors: ErrorType = {};
            err.inner.forEach((e: any) => {
                newErrors[e.path] = e.message;
            });
            setFormErrors(newErrors);
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Create Module
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    <TextField
                        label="Module Name "
                        fullWidth
                        value={form.module_name}
                        onChange={(e) => handleChange("module_name", e.target.value)}
                        error={Boolean(formErrors.module_name)}
                        helperText={formErrors.module_name}
                        required
                    />


                    <TextField
                        label="Module Slug"
                        fullWidth
                        value={form.module_slug}
                        InputProps={{ readOnly: true }}

                    />


                    <TextField
                        label="Category "
                        fullWidth
                        value={form.module_category}
                        onChange={(e) =>
                            handleChange("module_category", e.target.value)
                        }
                        error={Boolean(formErrors.module_category)}
                        helperText={formErrors.module_category}
                        required


                    />


                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={form.module_desc}
                        onChange={(e) => handleChange("module_desc", e.target.value)}
                        error={Boolean(formErrors.module_desc)}
                        helperText={formErrors.module_desc}
                        required
                    />


                    <div className="flex items-center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        handleChange("is_active", e.target.checked)
                                    }
                                />
                            }
                            label="Active"
                        />
                    </div>
                </div>


                <div className="mt-8 flex justify-end">
                    <MUIButton
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Module"}
                    </MUIButton>
                </div>
            </div>
        </div>
    );
}
