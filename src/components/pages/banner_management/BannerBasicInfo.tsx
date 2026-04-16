"use client";
import * as Yup from "yup";
import React, { useState } from "react";
import InputField from "@/components/form/input/InputFieldBanner";
import Button from "@/components/ui/button/Button";
import { MenuItem } from "@mui/material";
import FileInput from "@/components/form/form-elements/FileInputExampleBanner";


const bannerSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required("Banner title is required*")

        .max(50, "Banner title must not exceed 50 characters"),

    base64: Yup.string()
        .required("Banner image is required*"),

    order: Yup.number()
        .typeError("Display order must be a number")
        .required("Display order is required")
        .min(0, "Display order cannot be negative"),
});

interface Props {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];


const BannerBasicInfo: React.FC<Props> = ({
    onSubmit,
    onCancel,
    isSubmitting,
}) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<"home" | "product_catalog">(
        "home"
    );
    const [order, setOrder] = useState("");
    const [base64, setBase64] = useState<string | null>(null);
    const [filename, setFilename] = useState("");
    const [extension, setExtension] = useState("");
    const [errors, setErrors] = useState<{
        title?: string;
        base64?: string;
        order?: string;
    }>({});

    const handleFileChange = async (fileBase64: string, file: File) => {
        setBase64(fileBase64.split(",")[1]);
        setFilename(file.name);
        setExtension(file.name.split(".").pop() || "");
    };

    const handleSubmit = async () => {
        setErrors({});

        try {
            await bannerSchema.validate(
                { title, base64, order },
                { abortEarly: false }
            );

            onSubmit({
                title,
                category,
                filename,
                extension,
                base64,
                order: Number(order),
            });
        } catch (err: any) {
            const validationErrors: any = {};

            err.inner?.forEach((error: any) => {
                validationErrors[error.path] = error.message;
            });

            setErrors(validationErrors);
        }
    };



    return (
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                    label={
                        <>
                            Banner Title<span >*</span>
                        </>
                    }
                    value={title}
                    error={!!errors.title}
                    helperText={errors.title}
                    onChange={(e) => {
                        setTitle(e.target.value);


                        setErrors((prev) => ({
                            ...prev,
                            title: undefined,
                        }));
                    }}
                />


                <InputField
                    select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                >
                    <MenuItem value="product_catalog">Product Catalogue</MenuItem>
                    <MenuItem value="home">Home</MenuItem>
                </InputField>


                <div>
                    <FileInput
                        label={
                            <>
                                Upload Banner Image <span >*</span>
                            </>
                        }
                        onFileBase64={(base64, file) => {

                            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                                setBase64(null);
                                setFilename("");
                                setExtension("");

                                setErrors((prev) => ({
                                    ...prev,
                                    base64: "Only image files (JPG, PNG, WEBP) are allowed",
                                }));
                                return;
                            }


                            setBase64(base64.split(",")[1]);
                            setFilename(file.name);
                            setExtension(file.name.split(".").pop() || "");

                            setErrors((prev) => ({ ...prev, base64: undefined }));
                        }}
                    />


                    {errors.base64 && (
                        <p className="mt-[3px] ml-[10px] text-[0.65rem] leading-[1.66] text-red-500">
                            {errors.base64}
                        </p>
                    )}

                </div>


                <InputField
                    label={
                        <>
                            Display Order<span >*</span>
                        </>
                    }

                    type="number"
                    value={order}
                    error={!!errors.order}
                    helperText={errors.order}
                    onChange={(e) => {
                        setOrder(e.target.value);
                        setErrors((prev) => ({ ...prev, order: undefined }));
                    }}
                />


            </div>

            <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Banner"}
                </Button>
            </div>
        </div>
    );
};

export default BannerBasicInfo;


















































