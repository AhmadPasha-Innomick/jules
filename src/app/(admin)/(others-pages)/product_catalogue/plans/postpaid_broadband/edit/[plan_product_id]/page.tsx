"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useRouter, useParams } from "next/navigation";
import PlanEditForm from "@/components/pages/product_catalog/postpaid_broadband_form_edit";
import { useUpdatePostpaidBroadband } from "@/hooks/useCreatePlan";
import { Snackbar, Alert } from "@mui/material";
export default function EditVoiceCataloguePage() {
    const router = useRouter();
    const params = useParams();

    const planId = params.plan_product_id;

    const [initialData, setInitialData] = useState<any>(null);
    const updateMutation = useUpdatePostpaidBroadband(String(planId));
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPlan");

        if (stored) {
            const parsed = JSON.parse(stored);

            // Make sure same plan is opened
            if (parsed.plan_product_id === planId) {
                setInitialData(parsed);
            }
        }
    }, [planId]);

    const handleSubmit = async (payload: any) => {
        try {
            setErrorMsg("");
            setSuccessMsg("");

            await updateMutation.mutateAsync(payload);

            setSuccessMsg("Postpaid broadband plan updated successfully");

            setTimeout(() => {
                router.push("/product_catalogue/plans");
            }, 1200);

        } catch (err: any) {
            setErrorMsg(err?.message || "Update failed");
        }
    };


    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Product Catalogue", href: "/product_catalogue" },
                    { label: "Plans", href: "/product_catalogue/plans" },
                    { label: "Edit Postpaid Broadband Plan" },
                ]}
            />

            {!initialData ? (
                <div className="p-4 border rounded bg-orange-50 text-orange-700">
                    Plan details not available. Please open edit from list page.
                </div>
            ) : (
                <PlanEditForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={updateMutation.isPending}
                    onCancel={() =>
                        router.push("/product_catalogue/plans")
                    }
                />
            )}

            <Snackbar
                open={Boolean(successMsg || errorMsg)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => {
                    setSuccessMsg("");
                    setErrorMsg("");
                }}
            >
                <Alert
                    severity={errorMsg ? "error" : "success"}
                    variant="filled"
                >
                    {errorMsg || successMsg}
                </Alert>
            </Snackbar>

        </>
    );
}
