"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import PostpaidEditForm from "@/components/pages/product_catalog/postpaid_fiber_form_edit";
import { Snackbar, Alert } from "@mui/material";
import { useUpdatePostpaidFiber } from "@/hooks/useCreatePlan";

export default function EditPostpaidFiberPage() {
    const params = useParams();
    const router = useRouter();

    const planId = Array.isArray(params.plan_product_id)
        ? params.plan_product_id[0]
        : params.plan_product_id;

    const updateMutation = useUpdatePostpaidFiber(planId as string);

    const [initialData, setInitialData] = useState<any>(null);

    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPlan");

        if (stored) {
            const parsed = JSON.parse(stored);

            if (parsed.plan_product_id === planId) {
                setInitialData(parsed);
            }
        }
    }, [planId]);

    const handleSubmit = async (payload: any) => {
        try {
            await updateMutation.mutateAsync(payload);

            setSubmitSuccess("Postpaid fiber plan updated successfully");

            setTimeout(() => {
                router.push("/product_catalogue/plans");
            }, 1200);

        } catch (err: any) {
            const msg =
                err?.message ||
                err?.response?.data?.message ||
                "Failed to update postpaid fiber plan";

            setSubmitError(msg);
        }
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Plans", href: "/product_catalogue/plans" },
                    { label: "Edit Postpaid Fiber Plan" },
                ]}
            />

            {!initialData ? (
                <div className="p-4 border border-orange-300 bg-orange-50 rounded-xl">
                    <p className="text-orange-700">
                        Plan details not available. Please go back and open edit from list page.
                    </p>
                </div>
            ) : (
                <PostpaidEditForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={updateMutation.isPending}
                    onCancel={() => router.push("/product_catalogue/plans")}
                />
            )}

            <Snackbar
                open={Boolean(submitSuccess || submitError)}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "90px",
                    zIndex: (theme) => theme.zIndex.snackbar + 10,
                }}
                onClose={() => {
                    setSubmitSuccess(null);
                    setSubmitError(null);
                }}
            >
                <Alert
                    severity={submitSuccess ? "success" : "error"}
                    variant="filled"
                    onClose={() => {
                        setSubmitSuccess(null);
                        setSubmitError(null);
                    }}
                >
                    {submitSuccess || submitError}
                </Alert>
            </Snackbar>
        </>
    );
}
