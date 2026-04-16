"use client";

import React, { useState, useEffect } from "react";
import { TextField, Switch, FormLabel } from "@mui/material";
import Button from "@/components/ui/button/Button";
import * as Yup from "yup";


const editValidationSchema = Yup.object().shape({
    display_name: Yup.string().required("Required"),

    contract_duration: Yup.number()
        .transform((v, o) => o === "" ? undefined : v)
        .typeError("Must be number")
        .required("Required"),

    price_exc_vat: Yup.number()
        .transform((v, o) => o === "" ? undefined : v)
        .typeError("Must be number")
        .required("Required"),

    price_inc_vat: Yup.number()
        .transform((v, o) => o === "" ? undefined : v)
        .typeError("Must be number")
        .required("Required"),

    data_allowance: Yup.string().required("Required"),

    Extra_sharing_sim_price: Yup.string().required("Required"),
});


export default function PlanEditForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: any) {

    const [form, setForm] = useState({
        plan_product_id: "",
        crm_product_name: "",
        crm_product_code: "",
        display_name: "",
        contract_duration: "",
        price_exc_vat: "",
        price_inc_vat: "",
        data_allowance: "",
        Extra_sharing_sim_price: "",
        order_by: "",
        Free5GMifi: "NO",
        Included_Shared_Sim: "NO",
        Free_social_media: "NO",
        stc_rewards: "NO",
        is_popular: false,
        is_recommended: false,
    });


    const [formErrors, setFormErrors] = useState<any>({});

    useEffect(() => {
        if (initialData) {
            setForm(prev => ({
                ...prev, // 🔥 keeps all required fields
                plan_product_id: initialData.plan_product_id || "",
                crm_product_name: initialData.crm_product_name || "",
                crm_product_code: initialData.crm_product_code || "",
                display_name: initialData.display_name || "",
                contract_duration: initialData.contract_duration || "",
                price_exc_vat: initialData.price_exc_vat || "",
                price_inc_vat: initialData.price_inc_vat || "",
                data_allowance: initialData.data_allowance || "",
                Extra_sharing_sim_price: initialData.Extra_sharing_sim_price || "",
                Free5GMifi: initialData.Free5GMifi || "NO",
                Included_Shared_Sim: initialData.Included_Shared_Sim || "NO",
                Free_social_media: initialData.Free_social_media || "NO",
                stc_rewards: initialData.stc_rewards || "NO",
                is_popular: initialData.is_popular === 1,
                is_recommended: initialData.is_recommended === 1,
                order_by: initialData.order_by || "",
            }));
        }
    }, [initialData]);


    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
    };


    const handleSubmit = async () => {
        try {
            await editValidationSchema.validate(form, { abortEarly: false });

            setFormErrors({});

            onSubmit({
                ...form,

                price_exc_vat: Number(form.price_exc_vat),
                price_inc_vat: Number(form.price_inc_vat),
                order_by: Number(form.order_by),

                stc_rewards: form.stc_rewards,


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
        <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <TextField
                    label="Plan Product ID"
                    fullWidth
                    value={form.plan_product_id}
                    disabled
                />

                <TextField
                    label="CRM Product Name"
                    fullWidth
                    value={form.crm_product_name}
                    disabled
                />

                <TextField
                    label="CRM Product Code*"
                    fullWidth
                    value={form.crm_product_code}
                    onChange={(e) => handleChange("crm_product_code", e.target.value)}
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
                    label="Price (Excl. VAT)*"
                    fullWidth
                    type="number"
                    value={form.price_exc_vat}
                    onChange={(e) => handleChange("price_exc_vat", e.target.value)}
                    error={Boolean(formErrors.price_exc_vat)}
                    helperText={formErrors.price_exc_vat}
                    disabled
                />

                <TextField
                    label="Price (Incl. VAT)*"
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
                    label="Order By"
                    fullWidth
                    type="number"
                    value={form.order_by}
                    onChange={(e) => handleChange("order_by", e.target.value)}

                />
                {
                    [
                        { label: "Free 5G Mifi", field: "Free5GMifi", type: "string" },
                        { label: "Included Shared SIM", field: "Included_Shared_Sim", type: "string" },
                        { label: "Free Social Media", field: "Free_social_media", type: "string" },
                        { label: "STC Rewards", field: "stc_rewards", type: "string" },
                        { label: "Popular", field: "is_popular", type: "boolean" },
                        { label: "Recommended", field: "is_recommended", type: "boolean" },
                    ].map((item) => (
                        <div
                            key={item.field}
                            className="flex items-center justify-between border rounded-md p-3 bg-white"
                        >
                            <FormLabel>{item.label}</FormLabel>

                            <Switch
                                checked={
                                    item.type === "boolean"
                                        ? form[item.field]
                                        : form[item.field] === "YES"
                                }
                                onChange={(e) =>
                                    handleChange(
                                        item.field,
                                        item.type === "boolean"
                                            ? e.target.checked
                                            : e.target.checked
                                                ? "YES"
                                                : "NO"
                                    )
                                }
                                disabled={!["is_popular", "is_recommended"].includes(item.field)}
                            />
                        </div>
                    ))
                }

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
