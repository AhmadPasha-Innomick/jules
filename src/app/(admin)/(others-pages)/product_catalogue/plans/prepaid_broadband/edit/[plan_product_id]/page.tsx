"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useRouter, useParams } from "next/navigation";
import PlanEditForm from "@/components/pages/product_catalog/prepaid_broadband_form_edit";
import { useUpdatePrepaidBroadband } from "@/hooks/useCreatePlan";
import { Snackbar, Alert } from "@mui/material";

export default function EditVoiceCataloguePage() {
    const router = useRouter();
    const params = useParams();



    const planId = String(params.plan_product_id);

    const updateMutation = useUpdatePrepaidBroadband(planId);

    const [initialData, setInitialData] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const storedData = sessionStorage.getItem("selectedPlan");

        if (storedData) {
            const parsed = JSON.parse(storedData);
            setInitialData(parsed);
        } else {
            console.warn("No selectedPlan found in sessionStorage");
            router.push("/product_catalogue/plans");
        }
    }, [router]);

    const handleSubmit = async (payload: any) => {
        try {
            setErrorMsg(null);
            await updateMutation.mutateAsync(payload);

            setSuccessMsg("Prepaid broadband plan updated successfully");

        } catch (err: any) {
            setErrorMsg(err?.message || "Update failed");
        }
    };


    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Plans", href: "/product_catalogue/plans" },
                    { label: "Edit Prepaid Plan" },
                ]}
            />

            <PlanEditForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}

                onCancel={() =>
                    router.push("/product_catalogue/plans")
                }
            />

            <Snackbar
                open={!!successMsg}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => {
                    setSuccessMsg(null);
                    router.push("/product_catalogue/plans");
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => {
                        setSuccessMsg(null);
                        router.push("/product_catalogue/plans");
                    }}
                >
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMsg}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => setErrorMsg(null)}
            >
                <Alert severity="error" variant="filled">
                    {errorMsg}
                </Alert>
            </Snackbar>

        </>
    );
}
