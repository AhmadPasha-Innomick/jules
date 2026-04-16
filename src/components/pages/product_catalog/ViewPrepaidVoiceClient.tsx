"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { Box } from "@mui/material";

interface ViewProps {
    id: string;
}

export default function ViewPrepaidVoiceClient({ id }: ViewProps) {

    const [plan, setPlan] = useState<any>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPlan");

        if (stored) {
            const parsed = JSON.parse(stored);

            if (parsed.plan_product_id === id) {
                setPlan(parsed);
            }
        }
    }, [id]);

    return (
        <div className="space-y-6">
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },

                    { label: "Plans", href: "/product_catalogue/plans" },
                    { label: `View Plan ` },
                ]}
            />

            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-theme-xl font-stc-bold mb-6">
                    Prepaid Voice Plan Details
                </h3>

                {!plan && (
                    <div className="p-4 border border-orange-300 bg-orange-50 rounded-xl">
                        <p className="text-orange-700">
                            Plan details not available. Please go back and try again.
                        </p>
                    </div>
                )}

                {plan && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <Detail label="Plan Product ID" value={plan.plan_product_id} />
                            <Detail label="CRM Product Code" value={plan.crm_product_code} />
                            <Detail label="CRM Product Name" value={plan.crm_product_name} />
                            <Detail label="Display Name" value={plan.display_name} />

                            <Detail label="Price (Exc VAT)" value={plan.price_exc_vat} />
                            <Detail label="Price (Inc VAT)" value={plan.price_inc_vat} />

                            <Detail label="Plan Validity" value={plan.plan_validity} />
                            <Detail label="Data Allowance" value={plan.data_allowance} />

                            <Detail label="Local Calls" value={plan.local_calls} />
                            <Detail label="STC to STC Calls" value={plan.stc_to_stc_calls} />

                            <Detail label="Other Features" value={plan.other_features} />

                            <Detail label="STC Rewards" value={plan.stc_rewards} />

                            <Detail
                                label="Popular"
                                value={
                                    plan.is_popular === 1
                                        ? "Yes"
                                        : plan.is_popular === 0
                                            ? "No"
                                            : "N/A"
                                }
                            />

                            <Detail
                                label="Recommended"
                                value={
                                    plan.is_recommended === 1
                                        ? "Yes"
                                        : plan.is_recommended === 0
                                            ? "No"
                                            : "N/A"
                                }
                            />

                            <Detail label="Order By" value={plan.order_by} />

                        </div>

                    </>
                )}

            </div>
        </div>
    );
}

function Detail({ label, value }: any) {

    const displayValue =
        value === null ||
            value === undefined ||
            value === ""
            ? "N/A"
            : String(value);

    return (
        <div className="border p-4 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium">
                {displayValue}
            </p>
        </div>
    );
}
