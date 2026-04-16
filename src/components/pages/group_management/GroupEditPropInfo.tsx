"use client";

import React, { useEffect } from "react";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import * as Yup from "yup";

interface Props {
    group: any;
    onPrev?: () => void;
    onSubmit?: (data: any) => void;
    onChange?: (data: any) => void;
    isSubmitting?: boolean;
}
const schema = Yup.object().shape({
    msisdn_pool: Yup.string()
        .required("MSISDN Pool is required")
        .max(50)

    ,
    employment_id: Yup.string()
        .max(50)

        .nullable(),
    imei_pool: Yup.string()
        .max(50)


        .nullable(),
    mnp_charge: Yup.string()

        .nullable(),
    sim_swap_charge: Yup.string()

        .nullable(),
});

export default function GroupEditPropsInfo({
    group,
    onPrev,
    onSubmit,
    onChange,
    isSubmitting,
}: Props) {
    const [msisdnPool, setMsisdnPool] = React.useState(group.msisdn_pool ?? "");
    const [employmentId, setEmploymentId] = React.useState(group.employment_id ?? "");
    const [imeiPool, setImeiPool] = React.useState(group.imei_pool ?? "");
    const [mnpCharge, setMnpCharge] = React.useState(group.mnp_charge?.toString() ?? "");
    const [simSwapCharge, setSimSwapCharge] = React.useState(group.sim_swap_charge?.toString() ?? "");

    const [errors, setErrors] = React.useState<Record<string, string>>({});





    useEffect(() => {
        setMsisdnPool(group.msisdn_pool ?? "");
        setEmploymentId(group.employment_id ?? "");
        setImeiPool(group.imei_pool ?? "");
        setMnpCharge(group.mnp_charge?.toString() ?? "");
        setSimSwapCharge(group.sim_swap_charge?.toString() ?? "");
    }, [group]);

    const sanitizeAmount = (v: string) =>
        v
            .replace(/[^0-9.]/g, "")
            .replace(/^(\d*)(\.\d{0,2}).*/, "$1$2")
            .slice(0, 12);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            msisdn_pool: msisdnPool || null,
            employment_id: employmentId || null,
            imei_pool: imeiPool || null,
            mnp_charge: mnpCharge || null,
            sim_swap_charge: simSwapCharge || null,
        };

        try {
            await schema.validate(formData, { abortEarly: false });
            setErrors({});

            onSubmit?.({
                ...formData,
                mnp_charge: mnpCharge ? Number(mnpCharge) : null,
                sim_swap_charge: simSwapCharge ? Number(simSwapCharge) : null,
            });
        } catch (err: any) {
            const errObj: Record<string, string> = {};
            err.inner?.forEach((e: any) => {
                errObj[e.path] = e.message;
            });
            setErrors(errObj);
        }
    };

    const validateField = async (field: string, value: any) => {
        try {
            await schema.validateAt(field, {
                msisdn_pool: msisdnPool,
                employment_id: employmentId,
                imei_pool: imeiPool,
                mnp_charge: mnpCharge,
                sim_swap_charge: simSwapCharge,
                [field]: value, 
            });

        
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } catch (err: any) {
            setErrors((prev) => ({
                ...prev,
                [field]: err.message,
            }));
        }
    };


    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    Group Properties
                </h2>
                <p className="mb-6 text-sm text-gray-600">
                    Configure additional group settings.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        <InputField
                            label="MSISDN Pool"
                            value={msisdnPool}
                            onChange={(e) => {
                                const val = e.target.value;
                                setMsisdnPool(val);
                                onChange?.({ msisdn_pool: val });
                                validateField("msisdn_pool", val);
                            }}
                            required
                            error={!!errors.msisdn_pool}
                            helperText={errors.msisdn_pool}
                        />

                        <InputField
                            label="Employment ID"
                            value={employmentId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEmploymentId(val);
                                onChange?.({ employment_id: val });
                            }}
                            error={!!errors.employment_id}
                            helperText={errors.employment_id}
                        />

                        <InputField
                            label="IMEI Pool"
                            value={imeiPool}
                            onChange={(e) => {
                                const val = e.target.value;
                                setImeiPool(val);
                                onChange?.({ imei_pool: val });
                            }}
                            error={!!errors.imei_pool}
                            helperText={errors.imei_pool}
                        />


                        <InputField
                            label="MNP Charge"
                            value={mnpCharge}
                            onChange={(e) => {
                                const val = sanitizeAmount(e.target.value);
                                setMnpCharge(val);
                                onChange?.({ mnp_charge: val });
                            }}
                        />

                        <InputField
                            label="SIM Swap Charge"
                            value={simSwapCharge}
                            onChange={(e) => {
                                const val = sanitizeAmount(e.target.value);
                                setSimSwapCharge(val);
                                onChange?.({ sim_swap_charge: val });
                            }}
                            error={!!errors.sim_swap_charge}
                            helperText={errors.sim_swap_charge}
                        />

                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPrev}
                            disabled={isSubmitting}
                        >
                            Previous
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Group"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
