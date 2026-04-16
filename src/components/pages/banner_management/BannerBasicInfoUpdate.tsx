"use client";

import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { MenuItem } from "@mui/material";
import FileInput from "@/components/form/form-elements/FileInputExampleBanner";

const bannerUpdateSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required("Banner title is required*")
        .min(3, "Banner title must be at least 3 characters")
        .max(50, "Banner title must not exceed 50 characters"),
    order: Yup.number()
        .typeError("Display order must be a number")
        .required("Display order is required*")
        .min(0, "Display order cannot be negative"),

    base64: Yup.string().nullable(), 
});

interface InitialValues {
    title: string;
    category: "home" | "product_catalog";
    order: number;
    filename: string;
    extension: string;
    base64?: string;

}

interface Props {
    initialValues: InitialValues;
    onSubmit: (values: InitialValues) => void;
    isSubmitting?: boolean;
    onCancel: () => void;
}

const BannerBasicInfoUpdate: React.FC<Props> = ({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] =
        useState<"home" | "product_catalog">("product_catalog");
    const [order, setOrder] = useState("");

    const [base64, setBase64] = useState<string | null>(null);
    const [filename, setFilename] = useState("");
    const [extension, setExtension] = useState("");


    const [errors, setErrors] = useState<{
        title?: string;
        order?: string;
        base64?: string;
    }>({});

   
    useEffect(() => {
        setTitle(initialValues.title);
        setCategory(initialValues.category);
        setOrder(String(initialValues.order));
        setFilename(initialValues.filename || "");
        setExtension(initialValues.extension || "");
        setBase64(null); 
    }, [initialValues]);



    const handleFileChange = (fileBase64: string, file: File) => {
        setBase64(
            fileBase64.includes("base64,")
                ? fileBase64.split("base64,")[1]
                : fileBase64
        );

        setFilename(file.name.split(".")[0]); 
        setExtension(file.name.split(".").pop()?.toLowerCase() || "");

        setErrors((prev) => ({ ...prev, base64: undefined }));
    };


 
    const handleSubmit = async () => {
        setErrors({});

        try {
            await bannerUpdateSchema.validate(
                {
                    title,
                    order: order === "" ? undefined : Number(order),
                    base64,
                },
                { abortEarly: false }
            );


            onSubmit({
                title,
                category,
                order: Number(order),

                ...(base64 && {
                    base64,
                    filename,
                    extension,
                }),
            });

        } catch (err: any) {
            const validationErrors: any = {};
            err.inner?.forEach((e: any) => {
                validationErrors[e.path] = e.message;
            });
            setErrors(validationErrors);
        }
    };


    const validateTitleOnChange = async (value: string) => {
        try {
            await bannerUpdateSchema.validateAt("title", { title: value });
            setErrors((prev) => ({ ...prev, title: undefined }));
        } catch (err: any) {
            setErrors((prev) => ({
                ...prev,
                title: err.message,
            }));
        }
    };
    const validateOrderOnChange = async (value: string) => {
        try {
            await bannerUpdateSchema.validateAt("order", {
                order: value === "" ? undefined : Number(value),
            });

            setErrors((prev) => ({ ...prev, order: undefined }));
        } catch (err: any) {
            setErrors((prev) => ({
                ...prev,
                order: err.message,
            }));
        }
    };


    return (
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                    label="Banner Title*"
                    value={title}
                    error={!!errors.title}
                    helperText={errors.title}
                    onChange={(e) => {
                        const value = e.target.value;
                        setTitle(value);
                        validateTitleOnChange(value);
                    }}

                />

                <InputField
                    select
                    label="Category"
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value as "home" | "product_catalog")
                    }
                >
                    <MenuItem value="product_catalog">Product Catalogue</MenuItem>
                    <MenuItem value="home">Home</MenuItem>
                </InputField>

          
                <div>
                    <FileInput
                        label="Change Banner Image (optional)"
                        onFileBase64={handleFileChange}
                    />

                    {!base64 && filename && (
                        <p className="mt-1 text-sm text-gray-600">
                            Current file: <strong>{filename}</strong>
                        </p>
                    )}

                    {errors.base64 && (
                        <p className="mt-[3px] ml-[10px] text-[0.75rem] leading-[1.66] text-red-500">
                            {errors.base64}
                        </p>
                    )}
                </div>

                <InputField
                    label="Display Order*"
                    type="number"
                    value={order}
                    error={!!errors.order}
                    helperText={errors.order}
                    onChange={(e) => {
                        const value = e.target.value;
                        setOrder(value);
                        validateOrderOnChange(value);
                    }}
                />

            </div>

            <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Banner"}
                </Button>
            </div>
        </div>
    );
};

export default BannerBasicInfoUpdate;


