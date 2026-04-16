"use client";

import React, { useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumbDynamic";
import { useParams, useRouter } from "next/navigation";
import { useGroups } from "@/hooks/useGroups";

export default function ViewGroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = Number(params.id);

    const { data, isLoading, isError } = useGroups({
        limit: 1000,
        offset: 0,
    });

    const groups = data?.data?.groups || [];
    const apiMessage = data?.message;

    const group = useMemo(
        () => groups.find((g) => Number(g.group_id) === groupId),
        [groups, groupId]
    );

    return (
        <div className="space-y-6">
            <PageBreadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Group Management", href: "/group_management" },
                    { label: "View Group" },
                ]}
            />


            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
                <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
                    Group Details
                </h3>


                {isLoading && (
                    <p className="text-gray-600 text-theme-sm">Loading group details...</p>
                )}


                {isError && (
                    <p className="text-red-600 text-theme-sm">
                        {apiMessage || "Failed to load group details."}
                    </p>
                )}


                {!isLoading && !group && (
                    <div className="p-6 border border-red-300 bg-red-50 rounded-xl text-center">
                        <p className="text-red-700 font-stc-bold text-theme-lg">
                            Group Not Found
                        </p>
                        <p className="mt-2 text-gray-600">
                            No group found with ID: <span className="font-stc-bold">{groupId}</span>
                        </p>
                        <button
                            onClick={() => router.push("/group_management")}
                            className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                        >
                            Back to Groups
                        </button>
                    </div>
                )}


                {group && (
                    <>

                        <div className="mb-8 pb-6 border-b border-b">
                            <h2 className="text-2xl font-stc-bold text-brand-600">
                                {group.group_name}
                            </h2>
                            <p className="text-theme-sm text-gray-500 mt-1">
                                Group ID: <span className="font-stc-medium">{group.group_id}</span>
                            </p>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                            <Detail label="Group Name" value={group.group_name} />
                            <Detail label="Description" value={group.group_desc || "N/A"} />


                            <Detail
                                label="Status"
                                value={group.is_active === 1 ?
                                    <span className="text-green-600 font-stc-medium">Active</span> :
                                    <span className="text-red-600 font-stc-medium">Inactive</span>
                                }
                            />

                            <Detail label="Created By" value={group.created_by} />

                            <Detail
                                label="Created Date & Time"
                                value={group.created_date_time
                                    ? new Date(group.created_date_time).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })
                                    : "—"
                                }
                            />
                            <Detail label="Employment ID" value={group.employment_id || "—"} />

                            <Detail label="MSISDN Pool" value={group.msisdn_pool || "—"} />

                            <Detail label="IMEI Pool" value={group.imei_pool || "—"} />

                            <Detail
                                label="MNP Charge"
                                value={group.mnp_charge !== undefined && group.mnp_charge !== null
                                    ? `${Number(group.mnp_charge).toFixed(2)}`
                                    : "—"
                                }
                            />

                            <Detail
                                label="SIM Swap Charge"
                                value={group.sim_swap_charge !== undefined && group.sim_swap_charge !== null
                                    ? `${Number(group.sim_swap_charge).toFixed(2)}`
                                    : "—"
                                }
                            />


                        </div>



                    </>
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
    value?: string | number | React.ReactNode | null;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
            <p className="text-sm font-medium text-gray-500 tracking-wide">
                {label}
            </p>

            <p
                className="mt-1 text-base text-gray-900 break-words whitespace-pre-wrap"
                style={{ wordBreak: "break-word" }}
            >
                {value ?? "—"}
            </p>
        </div>
    );
}
