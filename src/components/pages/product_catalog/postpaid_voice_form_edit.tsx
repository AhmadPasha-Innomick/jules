"use client";

import React, { useState, useEffect } from "react";
import { TextField, Switch, FormLabel } from "@mui/material";
import Button from "@/components/ui/button/Button";
import * as Yup from "yup";
const postpaidEditValidationSchema = Yup.object().shape({

    display_name: Yup.string().required("Required"),

    price_exc_vat: Yup.number().typeError("Required").required("Required"),
    price_inc_vat: Yup.number().typeError("Required").required("Required"),

    data_allowance: Yup.string().required("Required"),
    social_media: Yup.string().required("Required"),
    local_calls: Yup.string().required("Required"),
    stc_to_stc_calls: Yup.string().required("Required"),
    intl_min: Yup.string().required("Required"),
    data_roaming: Yup.string().required("Required"),
    roaming_min: Yup.string().required("Required"),

    contract_duration: Yup.number().typeError("Required").required("Required"),

    order_by: Yup.number().typeError("Required").required("Required"),

    is_popular: Yup.boolean().required("Required"),
    is_recommended: Yup.boolean().required("Required"),
    stc_rewards: Yup.boolean().required("Required"),
});

export default function PostpaidEditForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: any) {

    const [form, setForm] = useState({
        plan_product_id: "",
        crm_product_code: "",
        crm_product_name: "",
        display_name: "",
        price_exc_vat: "",
        price_inc_vat: "",
        data_allowance: "",
        social_media: "",
        local_calls: "",
        stc_to_stc_calls: "",
        intl_min: "",
        data_roaming: "",
        roaming_min: "",
        contract_duration: "",
        stc_rewards: false,
        is_popular: false,
        is_recommended: false,
        order_by: "",
    });

    const [formErrors, setFormErrors] = useState<any>({});



    useEffect(() => {
     
        if (initialData) {
            setForm({
                plan_product_id: initialData.plan_product_id || "",

                crm_product_code: initialData.crm_product_code || "",
                crm_product_name: initialData.crm_product_name || "",

                display_name: initialData.display_name || "",

                price_exc_vat: initialData.price_exc_vat !== undefined
                    ? String(initialData.price_exc_vat)
                    : "",

                price_inc_vat: initialData.price_inc_vat !== undefined
                    ? String(initialData.price_inc_vat)
                    : "",

                data_allowance: initialData.data_allowance || "",
                social_media: initialData.social_media || "",
                local_calls: initialData.local_calls || "",
                stc_to_stc_calls: initialData.stc_to_stc_calls || "",

                intl_min: initialData.intl_min || "",
                data_roaming: initialData.data_roaming || "",
                roaming_min: initialData.roaming_min || "",

                contract_duration: initialData.contract_duration !== undefined
                    ? String(initialData.contract_duration)
                    : "",

                order_by: initialData.order_by !== undefined
                    ? String(initialData.order_by)
                    : "",

                is_popular: Number(initialData.is_popular) === 1,
                is_recommended: Number(initialData.is_recommended) === 1,

                stc_rewards:
                    String(initialData.stc_rewards || "").toLowerCase() === "yes",
            });
        }
    }, [initialData]);


    const handleChange = (field: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
        setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
    };


    const handleSubmit = async () => {
        try {
            await postpaidEditValidationSchema.validate(form, { abortEarly: false });

            setFormErrors({});

            onSubmit({
                ...form,

                is_popular: form.is_popular ? 1 : 0,
                is_recommended: form.is_recommended ? 1 : 0,
                stc_rewards: form.stc_rewards ? "YES" : "NO",
            });

        } catch (err: any) {
            const newErrors: any = {};

            err.inner.forEach((e: any) => {
                newErrors[e.path] = e.message;
            });

            setFormErrors(newErrors);
        }
    };



    return (
        <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <TextField label="Plan Product ID" fullWidth value={form.plan_product_id} disabled />

                <TextField
                    label="CRM Product Code*"
                    fullWidth
                    value={form.crm_product_code}
                    onChange={(e) => handleChange("crm_product_code", e.target.value)}
                    error={Boolean(formErrors.crm_product_code)}
                    helperText={formErrors.crm_product_code}
                    disabled
                />
                <TextField
                    label="CRM Product Name*"
                    fullWidth
                    value={form.crm_product_name}
                    onChange={(e) => handleChange("crm_product_name", e.target.value)}
                    disabled


                />

                <TextField
                    label="Display Name*"
                    fullWidth
                    value={form.display_name}
                    onChange={(e) => handleChange("display_name", e.target.value)}
                    error={Boolean(formErrors.display_name)}
                    helperText={formErrors.display_name}
                />

                <TextField
                    label="Price (Exc VAT)*"
                    fullWidth
                    type="number"
                    value={form.price_exc_vat}
                    onChange={(e) => handleChange("price_exc_vat", e.target.value)}
                    error={Boolean(formErrors.price_exc_vat)}
                    helperText={formErrors.price_exc_vat}
                    disabled
                />

                <TextField
                    label="Price (Inc VAT)*"
                    fullWidth
                    type="number"
                    value={form.price_inc_vat}
                    onChange={(e) => handleChange("price_inc_vat", e.target.value)}
                    error={Boolean(formErrors.price_inc_vat)}
                    helperText={formErrors.price_inc_vat}
                    disabled
                />

                <TextField
                    label="Data Allowance*"
                    fullWidth
                    value={form.data_allowance}
                    onChange={(e) => handleChange("data_allowance", e.target.value)}
                    error={Boolean(formErrors.data_allowance)}
                    helperText={formErrors.data_allowance}
                    disabled
                />

                <TextField
                    label="Social Media*"
                    fullWidth
                    value={form.social_media}
                    onChange={(e) => handleChange("social_media", e.target.value)}
                    error={Boolean(formErrors.social_media)}
                    helperText={formErrors.social_media}
                    disabled
                />

                <TextField
                    label="Local Calls*"
                    fullWidth
                    value={form.local_calls}
                    onChange={(e) => handleChange("local_calls", e.target.value)}
                    error={Boolean(formErrors.local_calls)}
                    helperText={formErrors.local_calls}
                    disabled
                />

                <TextField
                    label="STC to STC Calls*"
                    fullWidth
                    value={form.stc_to_stc_calls}
                    onChange={(e) => handleChange("stc_to_stc_calls", e.target.value)}
                    error={Boolean(formErrors.stc_to_stc_calls)}
                    helperText={formErrors.stc_to_stc_calls}
                    disabled
                />

                <TextField
                    label="International Minutes*"
                    fullWidth
                    value={form.intl_min}
                    onChange={(e) => handleChange("intl_min", e.target.value)}
                    error={Boolean(formErrors.intl_min)}
                    helperText={formErrors.intl_min}
                    disabled
                />

                <TextField
                    label="Data Roaming*"
                    fullWidth
                    value={form.data_roaming}
                    onChange={(e) => handleChange("data_roaming", e.target.value)}
                    error={Boolean(formErrors.data_roaming)}
                    helperText={formErrors.data_roaming}
                    disabled
                />

                <TextField
                    label="Roaming Min*"
                    fullWidth
                    value={form.roaming_min}
                    onChange={(e) => handleChange("roaming_min", e.target.value)}
                    error={Boolean(formErrors.roaming_min)}
                    helperText={formErrors.roaming_min}
                    disabled
                />

                <TextField
                    label="Contract Duration*"
                    fullWidth
                    type="number"
                    value={form.contract_duration}
                    onChange={(e) => handleChange("contract_duration", e.target.value)}
                    error={Boolean(formErrors.contract_duration)}
                    helperText={formErrors.contract_duration}
                    disabled
                />


                <div className="flex items-center justify-between border rounded-md p-3 bg-white">
                    <FormLabel>Popular</FormLabel>
                    <Switch checked={form.is_popular}
                        onChange={(e) => handleChange("is_popular", e.target.checked)} />
                </div>

                <div className="flex items-center justify-between border rounded-md p-3 bg-white">
                    <FormLabel>STC Rewards</FormLabel>
                    <Switch
                        checked={form.stc_rewards}
                        onChange={(e) => handleChange("stc_rewards", e.target.checked)}
                        disabled
                    />
                </div>

                <div className="flex items-center justify-between border rounded-md p-3 bg-white">
                    <FormLabel>Recommended</FormLabel>
                    <Switch checked={form.is_recommended}
                        onChange={(e) => handleChange("is_recommended", e.target.checked)} />
                </div>
                <TextField
                    label="Display Order*"
                    fullWidth
                    value={form.order_by}
                    onChange={(e) => handleChange("order_by", e.target.value)}
                    error={Boolean(formErrors.order_by)}
                    helperText={formErrors.order_by}
                />

            </div>

            <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>

                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Plan"}
                </Button>
            </div>
        </div>
    );
}
