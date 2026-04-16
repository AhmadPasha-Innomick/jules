"use client";

import React, { useState } from "react";
import { TextField, Switch, FormLabel, Autocomplete } from "@mui/material";
import Button from "@/components/ui/button/Button";
import * as Yup from "yup";
import { usePlanList } from "@/hooks/useProductCatalogue"

export const postpaidValidationSchema = Yup.object().shape({
    plan_product_id: Yup.string().required("Required"),
    crm_product_code: Yup.string().required("Required"),
    crm_product_name: Yup.string().required("Required"),
    display_name: Yup.string().required("Required"),

    contract_duration: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Must be number")
        .required("Required"),

    price_exc_vat: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Must be number")
        .required("Required"),

    price_inc_vat: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Must be number")
        .required("Required"),


    data_allowance: Yup.string().required("Required"),

    Extra_sharing_sim_price: Yup.string().required("Required"),


});




export default function PlanForm({
    onSubmit,
    onCancel,
    isSubmitting,
}: any) {


    const [formErrors, setFormErrors] = useState<any>({});

    const [form, setForm] = useState({
        plan_product_id: "",
        crm_product_name: "",
        crm_product_code: "",
        display_name: "",
        contract_duration: "",
        price_exc_vat: "",
        price_inc_vat: "",
        data_allowance: "",
        Free5GMifi: "NO",
        Included_Shared_Sim: "NO",
        Extra_sharing_sim_price: "",
        Free_social_media: "NO",
        stc_rewards: "NO",
        is_popular: false,
        is_recommended: false,
        order_by: "",
    });

    const { data, isLoading } = usePlanList({
        service_type: "prepaid",
        sub_service_type: "broadband",
    });

    const planList = data?.data || [];

    const handleChange = (field: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));

        setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        try {
            await postpaidValidationSchema.validate(form, {
                abortEarly: false,
            });

            setFormErrors({});

            onSubmit({
                ...form,

                contract_duration: Number(form.contract_duration),
                price_exc_vat: Number(form.price_exc_vat),
                price_inc_vat: Number(form.price_inc_vat),
                order_by: Number(form.order_by),

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
                    label="Contract Duration (Months)*"
                    fullWidth
                    type="number"
                    value={form.contract_duration}
                    onChange={(e) => handleChange("contract_duration", e.target.value)}
                    error={Boolean(formErrors.contract_duration)}
                    helperText={formErrors.contract_duration}
                />
                <TextField
                    label="Extra Sharing SIM Price*"
                    fullWidth
                    value={form.Extra_sharing_sim_price}
                    onChange={(e) => handleChange("Extra_sharing_sim_price", e.target.value)}
                    error={Boolean(formErrors.Extra_sharing_sim_price)}
                    helperText={formErrors.Extra_sharing_sim_price}
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


                {
                    [
                        { label: "Free 5G Mifi", field: "Free5GMifi" },
                        { label: "Included Shared SIM", field: "Included_Shared_Sim" },
                        { label: "Free Social Media", field: "Free_social_media" },
                        { label: "STC Rewards", field: "stc_rewards" },
                        { label: "Popular", field: "is_popular" },
                        { label: "Recommended", field: "is_recommended" }
                    ].map((item) => (
                        <div key={item.field} className="  flex items-center justify-between   border rounded-md p-2 bg-white">
                            <FormLabel>{item.label}</FormLabel>
                            <Switch
                                checked={form[item.field] === "YES"}
                                onChange={(e) =>
                                    handleChange(item.field, e.target.checked ? "YES" : "NO")
                                }
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
                    {isSubmitting ? "Submitting..." : "Save Plan"}
                </Button>
            </div>
        </div>
    );
}
