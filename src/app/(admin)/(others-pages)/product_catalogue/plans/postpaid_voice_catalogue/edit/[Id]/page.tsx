"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import PostpaidEditForm from "@/components/pages/product_catalog/postpaid_voice_form_edit";
import { Snackbar, Alert } from "@mui/material";
import { useUpdatePostpaidVoice } from "@/hooks/useCreatePlan";

export default function EditPostpaidPage() {
    const params = useParams();
    const router = useRouter();

    const planId = Array.isArray(params.Id)
        ? params.Id[0]
        : params.Id;



    const updateMutation = useUpdatePostpaidVoice(planId as string);

    const [initialData, setInitialData] = useState<any>(null);

    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("selectedPlan");

            if (!stored) return;

            const parsed = JSON.parse(stored);



            setInitialData(parsed);
        } catch (err) {
            console.error("Session parse error:", err);
        }
    }, []);


    const handleSubmit = async (payload: any) => {

        try {
            await updateMutation.mutateAsync(payload);

            setSubmitSuccess("Postpaid plan updated successfully");

            setTimeout(() => {
                router.push("/product_catalogue/plans");
            }, 1200);

        } catch (err: any) {
            let msg = "Failed to update postpaid plan";

            const apiError = err?.response?.data;

            if (apiError) {
                if (apiError.data) {

                    const fieldErrors = Object.values(apiError.data)
                        .flat()
                        .join(", ");

                    msg = fieldErrors || apiError.message;
                } else {
                    msg = apiError.message;
                }
            } else if (err?.message) {
                msg = err.message;
            }

            setSubmitError(msg);
        }

    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Plans", href: "/product_catalogue/plans" },
                    { label: "Edit Postpaid Plan" },
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
