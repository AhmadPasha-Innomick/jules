"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import CircularProgress from "@mui/material/CircularProgress";
import { IconButton, Box } from "@mui/material";



interface ViewProps {
    id: string;
}

export default function ViewPospaidFiberClient({ id }: ViewProps) {

    const [plan, setPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPlan");

        if (stored) {
            const parsed = JSON.parse(stored);

            // ensure correct plan opened
            if (parsed.plan_product_id === id) {
                setPlan(parsed);
            }
        }

        setIsLoading(false);
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
                    Postpaid Fiber Details
                </h3>

                {isLoading && (
                    <Box className="flex justify-center items-center py-20">
                        <IconButton color="primary" disabled>
                            <CircularProgress />
                        </IconButton>
                    </Box>
                )}



                {plan && !isLoading && (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                           

                           
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            <Detail label="Plan Product ID" value={plan.plan_product_id} />
                            <Detail label="Contract Duration (Months)" value={plan.contract_duration} />
                            <Detail label="CRM Product Code" value={plan.crm_product_code} />
                            <Detail label="CRM Product Name" value={plan.crm_product_name} />
                            <Detail label="Display Name" value={plan.display_name} />

                            <Detail label="Price (Exc VAT)" value={plan.price_exc_vat} />
                            <Detail label="Price (Inc VAT)" value={plan.price_inc_vat} />

                            <Detail label="Speed" value={plan.speed} />
                            <Detail label="Data Allowance" value={plan.data_allow} />

                            <Detail label="Cashback" value={plan.cashback} />
                            <Detail label="Device Bundle" value={plan.device_bundle} />
                            <Detail label="Free Extra Data SIM" value={plan.free_extra_data_sim} />
                            <Detail label="Monthly Fee Additional Data" value={plan.Monthlyfee_additionaldata} />
                            <Detail label="Monthly Free Minutes" value={plan.monthly_free_minutes} />
                            <Detail label="Free Mesh Device" value={plan.free_mesh_device} />

                            <Detail label="Line Rental" value={plan.Line_rental} />
                            <Detail label="Connection Fee" value={plan.connection_fee} />
                            <Detail label="Free Months" value={plan.Free_months} />

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

                            <Detail label="Unlimited YouTube" value={plan.unlimited_youtube} />
                            <Detail label="Unlimited Netflix" value={plan.unlimited_netflix} />

                            <Detail
                                label="Included Shared SIM"
                                value={plan.included_shared_sim === 1 ? "Yes" : "No"}
                            />

                            <Detail label="ODU Device" value={plan.odu_device} />
                            <Detail label="IDU Device" value={plan.idu_device} />


                        </div>
                    </>
                )}

                {!isLoading && !plan && (
                    <div className="p-4 border border-orange-300 bg-orange-50 rounded-xl">
                        <p className="text-orange-700 font-stc-medium">
                            Plan not found
                        </p>
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
