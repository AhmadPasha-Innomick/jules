"use client";

import React, { useState, useEffect } from "react";
import { TextField, Switch, FormLabel } from "@mui/material";
import Button from "@/components/ui/button/Button";
import * as Yup from "yup";

const editFiberValidationSchema = Yup.object().shape({

    display_name: Yup.string().required("Required"),

    price_exc_vat: Yup.number().typeError("Required").required("Required"),
    price_inc_vat: Yup.number().typeError("Required").required("Required"),

    speed: Yup.string().required("Required"),
    data_allow: Yup.string().required("Required"),

    contract_duration: Yup.number().typeError("Required").required("Required"),

    Line_rental: Yup.number().typeError("Required").required("Required"),
    connection_fee: Yup.number().typeError("Required").required("Required"),

    Free_months: Yup.string().required("Required"),
    free_extra_data_sim: Yup.string().required("Required"),
    Monthlyfee_additionaldata: Yup.string().required("Required"),
    monthly_free_minutes: Yup.string().required("Required"),

    included_shared_sim: Yup.number().typeError("Required").required("Required"),

    odu_device: Yup.string().required("Required"),
    idu_device: Yup.string().required("Required"),


    cashback: Yup.string().oneOf(["YES", "NO"]).required("Required"),
    device_bundle: Yup.string().oneOf(["YES", "NO"]).required("Required"),
    free_mesh_device: Yup.string().oneOf(["YES", "NO"]).required("Required"),
    stc_rewards: Yup.string().oneOf(["YES", "NO"]).required("Required"),
    unlimited_youtube: Yup.string().oneOf(["YES", "NO"]).required("Required"),
    unlimited_netflix: Yup.string().oneOf(["YES", "NO"]).required("Required"),

    is_popular: Yup.boolean().required("Required"),
    is_recommended: Yup.boolean().required("Required"),
});


export default function PostpaidEditForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: any) {

    const [form, setForm] = useState<any>({
        plan_product_id: "",
        contract_duration: "",
        crm_product_code: "",
        crm_product_name: "",
        display_name: "",
        price_exc_vat: "",
        price_inc_vat: "",
        speed: "",
        data_allow: "",
        cashback: "NO",
        device_bundle: "NO",
        free_extra_data_sim: "",
        Monthlyfee_additionaldata: "",
        monthly_free_minutes: "",
        free_mesh_device: "NO",
        Line_rental: "",
        connection_fee: "",
        Free_months: "",
        stc_rewards: "NO",
        is_popular: false,
        is_recommended: false,
        order_by: "",
        unlimited_youtube: "NO",
        unlimited_netflix: "NO",
        included_shared_sim: "",
        odu_device: "",
        idu_device: "",
    });

    const [formErrors, setFormErrors] = useState<any>({});


    useEffect(() => {
        if (initialData) {
            setForm({
                plan_product_id: initialData.plan_product_id || "",
                contract_duration: initialData.contract_duration || "",
                crm_product_code: initialData.crm_product_code || "",
                crm_product_name: initialData.crm_product_name || "",
                display_name: initialData.display_name || "",

                price_exc_vat: initialData.price_exc_vat || "",
                price_inc_vat: initialData.price_inc_vat || "",

                speed: initialData.speed || "",
                data_allow: initialData.data_allow || "",

                cashback: initialData.cashback || "NO",
                device_bundle: initialData.device_bundle || "NO",
                free_extra_data_sim: initialData.free_extra_data_sim || "",
                Monthlyfee_additionaldata: initialData.Monthlyfee_additionaldata || "",
                monthly_free_minutes: initialData.monthly_free_minutes || "",
                free_mesh_device: initialData.free_mesh_device || "NO",

                Line_rental: initialData.Line_rental || "",
                connection_fee: initialData.connection_fee || "",
                Free_months: initialData.Free_months || "",

                stc_rewards: initialData.stc_rewards || "NO",

                is_popular: initialData.is_popular === 1,
                is_recommended: initialData.is_recommended === 1,

                order_by: initialData.order_by || "",

                unlimited_youtube: initialData.unlimited_youtube || "NO",
                unlimited_netflix: initialData.unlimited_netflix || "NO",

                included_shared_sim: initialData.included_shared_sim || "",

                odu_device: initialData.odu_device || "",
                idu_device: initialData.idu_device || "",
            });
        }
    }, [initialData]);

    const handleChange = (field: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
        setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
    };


    const handleSubmit = async () => {
        try {
            await editFiberValidationSchema.validate(form, { abortEarly: false });

            setFormErrors({});

            onSubmit({
                ...form,

                price_exc_vat: Number(form.price_exc_vat),
                price_inc_vat: Number(form.price_inc_vat),
                contract_duration: Number(form.contract_duration),
                Line_rental: Number(form.Line_rental),
                connection_fee: Number(form.connection_fee),
                order_by: Number(form.order_by),
                included_shared_sim: Number(form.included_shared_sim),

                is_popular: form.is_popular ? 1 : 0,
                is_recommended: form.is_recommended ? 1 : 0,
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
        <div className="mx-auto max-w-4xl p-8 bg-white rounded-xl border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <TextField label="Plan Product ID" fullWidth disabled
                    value={form.plan_product_id} />

                <TextField label="CRM Product Code*" fullWidth
                    value={form.crm_product_code}
                    onChange={(e) => handleChange("crm_product_code", e.target.value)}
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
                    label="Price Excl VAT*"
                    type="number"
                    fullWidth
                    value={form.price_exc_vat}
                    onChange={(e) => handleChange("price_exc_vat", e.target.value)}
                    error={Boolean(formErrors.price_exc_vat)}
                    helperText={formErrors.price_exc_vat}
                    disabled
                />

                <TextField
                    label="Price Incl VAT*"
                    type="number"
                    fullWidth
                    value={form.price_inc_vat}
                    onChange={(e) => handleChange("price_inc_vat", e.target.value)}
                    error={Boolean(formErrors.price_inc_vat)}
                    helperText={formErrors.price_inc_vat}
                    disabled
                />

                <TextField
                    label="Speed*"
                    fullWidth
                    value={form.speed}
                    onChange={(e) => handleChange("speed", e.target.value)}
                    error={Boolean(formErrors.speed)}
                    helperText={formErrors.speed}
                    disabled
                />

                <TextField
                    label="Data Allow*"
                    fullWidth
                    value={form.data_allow}
                    onChange={(e) => handleChange("data_allow", e.target.value)}
                    error={Boolean(formErrors.data_allow)}
                    helperText={formErrors.data_allow}
                    disabled
                />

                <TextField
                    label="Contract Duration*"
                    type="number"
                    fullWidth
                    value={form.contract_duration}
                    onChange={(e) => handleChange("contract_duration", e.target.value)}
                    error={Boolean(formErrors.contract_duration)}
                    helperText={formErrors.contract_duration}
                    disabled
                />

                <TextField
                    label="Line Rental*"
                    type="number"
                    fullWidth
                    value={form.Line_rental}
                    onChange={(e) => handleChange("Line_rental", e.target.value)}
                    error={Boolean(formErrors.Line_rental)}
                    helperText={formErrors.Line_rental}
                    disabled
                />

                <TextField
                    label="Connection Fee*"
                    type="number"
                    fullWidth
                    value={form.connection_fee}
                    onChange={(e) => handleChange("connection_fee", e.target.value)}
                    error={Boolean(formErrors.connection_fee)}
                    helperText={formErrors.connection_fee}
                    disabled
                />

                <TextField
                    label="Free Months*"
                    fullWidth
                    value={form.Free_months}
                    onChange={(e) => handleChange("Free_months", e.target.value)}
                    error={Boolean(formErrors.Free_months)}
                    helperText={formErrors.Free_months}
                    disabled
                />


                <TextField
                    label="Free Extra Data SIM*"
                    fullWidth
                    value={form.free_extra_data_sim}
                    onChange={(e) => handleChange("free_extra_data_sim", e.target.value)}
                    error={Boolean(formErrors.free_extra_data_sim)}
                    helperText={formErrors.free_extra_data_sim}
                    disabled
                />

                <TextField
                    label="Monthly Additional Data Fee*"
                    fullWidth
                    value={form.Monthlyfee_additionaldata}
                    onChange={(e) => handleChange("Monthlyfee_additionaldata", e.target.value)}
                    error={Boolean(formErrors.Monthlyfee_additionaldata)}
                    helperText={formErrors.Monthlyfee_additionaldata}
                    disabled
                />

                <TextField
                    label="Monthly Free Minutes*"
                    fullWidth
                    value={form.monthly_free_minutes}
                    onChange={(e) => handleChange("monthly_free_minutes", e.target.value)}
                    error={Boolean(formErrors.monthly_free_minutes)}
                    helperText={formErrors.monthly_free_minutes}
                    disabled
                />

                <TextField
                    label="Included Shared SIM*"
                    type="number"
                    fullWidth
                    value={form.included_shared_sim}
                    onChange={(e) => handleChange("included_shared_sim", e.target.value)}
                    error={Boolean(formErrors.included_shared_sim)}
                    helperText={formErrors.included_shared_sim}
                    disabled
                />

                <TextField
                    label="ODU Device*"
                    fullWidth
                    value={form.odu_device}
                    onChange={(e) => handleChange("odu_device", e.target.value)}
                    error={Boolean(formErrors.odu_device)}
                    helperText={formErrors.odu_device}
                    disabled
                />

                <TextField
                    label="IDU Device*"
                    fullWidth
                    value={form.idu_device}
                    onChange={(e) => handleChange("idu_device", e.target.value)}
                    error={Boolean(formErrors.idu_device)}
                    helperText={formErrors.idu_device}
                    disabled
                />

                <TextField
                    label="Order By"
                    type="number"
                    fullWidth
                    value={form.order_by}
                    onChange={(e) => handleChange("order_by", e.target.value)}

                />




                <div className="  rounded-lg  bg-gray-50 col-span-2">


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {[
                            { label: "Is Popular", field: "is_popular", type: "number" },
                            { label: "Is Recommended", field: "is_recommended", type: "number" },
                            { label: "Cashback", field: "cashback", type: "string" },
                            { label: "Device Bundle", field: "device_bundle", type: "string" },
                            { label: "Free Mesh Device", field: "free_mesh_device", type: "string" },
                            { label: "STC Rewards", field: "stc_rewards", type: "string" },
                            { label: "Unlimited YouTube", field: "unlimited_youtube", type: "string" },
                            { label: "Unlimited Netflix", field: "unlimited_netflix", type: "string" },
                        ].map((item) => (
                            <div key={item.field} className="flex items-center justify-between border rounded-md p-3 bg-white">
                                <FormLabel>{item.label}</FormLabel>

                                <Switch
                                    checked={
                                        item.type === "number"
                                            ? form[item.field]
                                            : form[item.field] === "YES"
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            item.field,
                                            item.type === "number"
                                                ? e.target.checked
                                                : e.target.checked ? "YES" : "NO"
                                        )
                                    }
                                    disabled={!["is_popular", "is_recommended"].includes(item.field)}
                                />
                            </div>
                        ))}

                    </div>
                </div>

            </div>

            <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>

                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Plan"}
                </Button>
            </div>
        </div>
    );
}
