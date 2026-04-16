"use client";

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useLogDetails } from "@/hooks/useLog";
import CircularProgress from "@mui/material/CircularProgress";

import { IconButton, Box } from "@mui/material";

interface ViewLogProps {
    id: string;
}
const handleResetSearch = () => {
};


export default function ViewLog({ id }: ViewLogProps) {
    const log_id = id;
    const {
        data: log,          
        isLoading,
        isError,
        error,                
    } = useLogDetails(log_id);

  
    const errorMessage = error instanceof Error ? error.message : "Failed to load log details";

    return (
        <div className="space-y-6">
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                   

                    { label: "Login Activity Logs", href: "/activity_logs" },
                    { label: `View Log (${id})` },
                ]}
            />

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
                <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
                    Login Activity Details
                </h3>

           
                {isLoading && <Box className="flex justify-center items-center py-20">
                    <IconButton color="primary" disabled>
                        <CircularProgress />
                    </IconButton>
                </Box>}     ,








          
                {isError && (
                    <div className="p-4 border border-red-300 bg-red-50 rounded-xl shadow-theme-xs">
                        <p className="text-red-700 font-stc-medium text-theme-sm">
                            {errorMessage}
                        </p>
                        <p className="text-gray-600 text-theme-xs mt-1">
                            The log with ID <span className="font-stc-bold">{id}</span> could not be loaded.
                        </p>
                    </div>
                )}

          
                {log && !isLoading && (
                    <>
                
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-theme-sm">
                                <span className="text-gray-600 text-2xl font-stc-bold">
                                    {log.username?.charAt(0)?.toUpperCase() || "L"}
                                </span>
                            </div>

                            <div>
                                <p className="text-brand-500 font-stc-bold text-theme-xl">
                                    {log.username || "Unknown User"}
                                </p>
                                <p className="text-theme-sm text-gray-600">
                                    Login:{" "}
                                    <span className={log.login_successful === "Y" ? "text-green-600" : "text-red-600"}>
                                        {log.login_successful === "Y" ? "Successful" : "Failed"}
                                    </span>
                                </p>
                            </div>
                        </div>

                   
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Detail label="Log ID" value={log.Id} />
                            <Detail label="Username" value={log.username} />
                            <Detail label="Login Successful" value={log.login_successful === "Y" ? "Yes" : "No"} />
                            <Detail label="Reason" value={log.Reason} />
                            <Detail label="IP Address" value={log.IP_address} />




                            <Detail
                                label="Created Date/Time"
                                value={new Date(log.created_date_time).toLocaleString()}
                            />
                        </div>
                    </>
                )}

           
                {!isLoading && !isError && !log && (
                    <div className="p-4 border border-orange-300 bg-orange-50 rounded-xl">
                        <p className="text-orange-700 font-stc-medium">Log not found</p>
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
        value === null || value === undefined || value === "" || value === 0
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