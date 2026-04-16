"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";

interface ViewProps {
    id: string;
}

export default function ViewPrepaidBroadbandClient({ id }: ViewProps) {

    const [plan, setPlan] = useState<any>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPlan");
        const parsed = JSON.parse(stored);
        setPlan(parsed);


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

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
                <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
                    Prepaid Broadband Plan Details
                </h3>

                {!plan && (
                    <div className="p-4 border border-orange-300 bg-orange-50 rounded-xl">
                        <p className="text-orange-700 font-stc-medium">
                            Plan details not available. Please open from list page.
                        </p>
                    </div>
                )}

                {plan && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <Detail label="Plan Product ID" value={plan.plan_product_id} />
                        <Detail label="CRM Product Code" value={plan.crm_product_code} />
                        <Detail label="CRM Product Name" value={plan.crm_product_name} />
                        <Detail label="Display Name" value={plan.display_name} />

                        <Detail label="Price (Exc VAT)" value={plan.price_exc_vat} />
                        <Detail label="Price (Inc VAT)" value={plan.price_inc_vat} />

                        <Detail label="Plan Validity" value={plan.plan_validity} />
                        <Detail label="Data Allowance" value={plan.data_allowance} />
                        <Detail label="Speed" value={plan.speed} />

                        <Detail label="STC Rewards" value={plan.stc_rewards} />

                        <Detail
                            label="Popular"
                            value={plan.is_popular === 1 ? "Yes" : "No"}
                        />

                        <Detail
                            label="Recommended"
                            value={plan.is_recommended === 1 ? "Yes" : "No"}
                        />

                        <Detail label="Order By" value={plan.order_by} />

                    </div>
                )}
            </div>
        </div>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) {

    const displayValue =
        value === null || value === undefined || value === ""
            ? "N/A"
            : String(value);

    return (
        <div className="rounded-xl border p-4 bg-gray-50 shadow-theme-xs">
            <p className="text-theme-xs text-gray-500">{label}</p>
            <p className="text-theme-sm font-stc-medium text-gray-900 mt-1">
                {displayValue}
            </p>
        </div>
    );
}
