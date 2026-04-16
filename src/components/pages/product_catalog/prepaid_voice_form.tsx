"use client";

import React, { useState } from "react";
import { TextField, Switch, FormLabel, Autocomplete } from "@mui/material";
import Button from "@/components/ui/button/Button";
import * as Yup from "yup";
import { usePlanList } from "@/hooks/useProductCatalogue"

export const prepaidValidationSchema = Yup.object().shape({
    plan_product_id: Yup.string().required("Plan Product ID is required"),



    display_name: Yup.string().required("Display Name is required"),

    price_exc_vat: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Price Excl. VAT must be a number")
        .required("Price Excl. VAT is required"),

    price_inc_vat: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Price Incl. VAT must be a number")
        .required("Price Incl. VAT is required"),

    plan_validity: Yup.string().required("Plan Validity is required"),

    data_allowance: Yup.string().required("Data Allowance is required"),

    local_calls: Yup.string().required("Local Calls is required"),

    stc_to_stc_calls: Yup.string().required("STC to STC Calls is required"),

    other_features: Yup.string().required("Other Features are required"),


});




export default function PlanForm({
    onSubmit,
    onCancel,
    isSubmitting,
    planList,
    isLoading
}: any) {
    // const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const [formErrors, setFormErrors] = useState<any>({});

    const [form, setForm] = useState({
        plan_product_id: "",
        crm_product_name: "",
        crm_product_code: "",
        display_name: "",
        price_exc_vat: "",
        price_inc_vat: "",
        plan_validity: "",
        data_allowance: "",
        local_calls: "",
        stc_to_stc_calls: "",
        other_features: "",
        stc_rewards: false,
        is_popular: false,
        is_recommended: false,
        order_by: "",

    });







    const handleChange = (field: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));

        setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        try {
            await prepaidValidationSchema.validate(form, {
                abortEarly: false,
            });

            setFormErrors({});

            onSubmit({
                ...form,

                is_popular: form.is_popular ? 1 : 0,
                is_recommended: form.is_recommended ? 1 : 0,

                stc_rewards: form.stc_rewards ? "YES" : "NO",

                price_exc_vat: Number(form.price_exc_vat),
                price_inc_vat: Number(form.price_inc_vat),
                order_by: Number(form.order_by),
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


                <Autocomplete
                    options={planList}
                    loading={isLoading}
                    getOptionLabel={(option: any) =>
                        option?.plan_product_id
                            ? `${option.plan_product_id} - ${option.plan_product_name}`
                            : ""
                    }
                    value={
                        planList.find(
                            (p: any) => p.plan_product_id === form.plan_product_id
                        ) || null
                    }
                    onChange={(event, newValue: any) => {
                        if (newValue) {
                            setForm((prev: any) => ({
                                ...prev,
                                plan_product_id: newValue.plan_product_id,
                                crm_product_name: newValue.plan_product_name,
                                crm_product_code: newValue.plan_product_part_code,
                            }));
                        } else {
                            setForm((prev: any) => ({
                                ...prev,
                                plan_product_id: "",
                                crm_product_name: "",
                                crm_product_code: "",
                            }));
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Plan Product ID*"
                            error={Boolean(formErrors.plan_product_id)}
                            helperText={formErrors.plan_product_id}
                        />
                    )}
                />


                <TextField
                    label="CRM Product Name*"
                    fullWidth
                    value={form.crm_product_name}
                    InputProps={{ readOnly: true }}
                    error={Boolean(formErrors.crm_product_name)}
                    helperText={formErrors.crm_product_name}
                />

                <TextField
                    label="CRM Product Code*"
                    fullWidth
                    value={form.crm_product_code}
                    InputProps={{ readOnly: true }}
                    error={Boolean(formErrors.crm_product_code)}
                    helperText={formErrors.crm_product_code}
                />




                <TextField
                    label="Display Name*"
                    fullWidth
                    value={form.display_name}
                    onChange={(e) =>
                        handleChange("display_name", e.target.value)
                    }
                    error={Boolean(formErrors.display_name)}
                    helperText={formErrors.display_name}
                />

                <TextField
                    label="Price (Excl. VAT)*"
                    fullWidth
                    type="number"
                    value={form.price_exc_vat}
                    onChange={(e) =>
                        handleChange("price_exc_vat", e.target.value)
                    }
                    error={Boolean(formErrors.price_exc_vat)}
                    helperText={formErrors.price_exc_vat}
                />

                <TextField
                    label="Price (Incl. VAT)*"
                    fullWidth
                    type="number"
                    value={form.price_inc_vat}
                    onChange={(e) =>
                        handleChange("price_inc_vat", e.target.value)
                    }
                    error={Boolean(formErrors.price_inc_vat)}
                    helperText={formErrors.price_inc_vat}
                />

                <TextField
                    label="Plan Validity*"
                    fullWidth
                    value={form.plan_validity}
                    onChange={(e) =>
                        handleChange("plan_validity", e.target.value)
                    }
                    error={Boolean(formErrors.plan_validity)}
                    helperText={formErrors.plan_validity}
                />

                <TextField
                    label="Data Allowance*"
                    fullWidth
                    value={form.data_allowance}
                    onChange={(e) =>
                        handleChange("data_allowance", e.target.value)
                    }
                    error={Boolean(formErrors.data_allowance)}
                    helperText={formErrors.data_allowance}
                />

                <TextField
                    label="Local Calls*"
                    fullWidth
                    value={form.local_calls}
                    onChange={(e) =>
                        handleChange("local_calls", e.target.value)
                    }
                    error={Boolean(formErrors.local_calls)}
                    helperText={formErrors.local_calls}
                />

                <TextField
                    label="STC to STC Calls*"
                    fullWidth
                    value={form.stc_to_stc_calls}
                    onChange={(e) =>
                        handleChange("stc_to_stc_calls", e.target.value)
                    }
                    error={Boolean(formErrors.stc_to_stc_calls)}
                    helperText={formErrors.stc_to_stc_calls}
                />

                <TextField
                    label="Other Features*"
                    fullWidth
                    value={form.other_features}
                    onChange={(e) =>
                        handleChange("other_features", e.target.value)
                    }
                    error={Boolean(formErrors.other_features)}
                    helperText={formErrors.other_features}
                />

                <TextField
                    label="Order By"
                    fullWidth
                    type="number"
                    value={form.order_by}
                    onChange={(e) =>
                        handleChange("order_by", e.target.value)
                    }

                />


                <div className="flex items-center justify-between border rounded-md p-3 bg-white">
                    <FormLabel>STC Rewards</FormLabel>
                    <Switch
                        checked={form.stc_rewards}
                        onChange={(e) => handleChange("stc_rewards", e.target.checked)}
                    />
                </div>

                <div className="flex items-center justify-between border rounded-md p-3 bg-white">
                    <FormLabel>Popular</FormLabel>
                    <Switch
                        checked={form.is_popular}
                        onChange={(e) => handleChange("is_popular", e.target.checked)}
                    />
                </div>

                <div className="flex items-center justify-between border rounded-md p-3 bg-white">
                    <FormLabel>Recommended</FormLabel>
                    <Switch
                        checked={form.is_recommended}
                        onChange={(e) => handleChange("is_recommended", e.target.checked)}
                    />
                </div>

            </div>



            <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>

                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Save Plan"}
                </Button>
            </div>
        </div>
    );
}
