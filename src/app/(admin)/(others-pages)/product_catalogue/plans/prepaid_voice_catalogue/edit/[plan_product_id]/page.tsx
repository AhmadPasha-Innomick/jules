"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useRouter, useParams } from "next/navigation";
import PlanEditForm from "@/components/pages/product_catalog/prepaid_voice_form_edit";
import { useUpdatePrepaidVoice } from "@/hooks/useCreatePlan"
export default function EditVoiceCataloguePage() {
    const router = useRouter();
    const params = useParams();

    const planId = Array.isArray(params.plan_product_id)
        ? params.plan_product_id[0]
        : params.plan_product_id;

    const updateMutation = useUpdatePrepaidVoice(planId as string);
    const [initialData, setInitialData] = useState<any>(null);


    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPlan");

        if (stored) {
            const parsed = JSON.parse(stored);

            // Ensure correct plan is loaded
            if (parsed.plan_product_id === planId) {
                setInitialData(parsed);
            }
        }
    }, [planId]);
    const handleSubmit = async (payload: any) => {
        try {
            await updateMutation.mutateAsync(payload);

            router.push("/product_catalogue/plans");

        } catch (err: any) {
            console.error(err.message);
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

            {!initialData ? (
                <div className="p-4 border border-orange-300 bg-orange-50 rounded-xl">
                    <p className="text-orange-700">
                        Plan details not available. Please go back and open edit from list page.
                    </p>
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
        </>
    );
}
