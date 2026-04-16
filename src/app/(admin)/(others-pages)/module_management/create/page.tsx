"use client";

import React, { useState } from "react";
import { Alert, Snackbar, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";

import { useCreateModule } from "@/hooks/useModules";

import ModuleCreateBasicInfo from "@/components/pages/module_management/ModuleCreateBasicInfo";
export default function Page() {
    const router = useRouter();
    const createModule = useCreateModule();

    const [submitSuccess, setSubmitSuccess] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    const handleSubmit = async (payload: any) => {
        try {
            await createModule.mutateAsync({
                module_name: payload.module_name,
                module_slug: payload.module_name.toLowerCase().replace(/\s+/g, "-"),
                module_category: payload.module_category,
                module_desc: payload.module_desc,
                is_active: payload.is_active ? 1 : 0,
            });

            setSubmitSuccess("Module created successfully!");
            setTimeout(() => router.push("/module_management"), 1500);
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to create module");
        }
    };



    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Module Management", href: "/module_management" },
                    { label: "Create Module" },
                ]}
            />

            <Box sx={{ mt: 3 }}>
                <ModuleCreateBasicInfo
                    onSubmit={handleSubmit}
                    isSubmitting={createModule.isPending}
                />
            </Box>



            <Snackbar
                open={Boolean(submitSuccess || submitError)}
                autoHideDuration={4000}
                onClose={() => {
                    setSubmitSuccess(null);
                    setSubmitError(null);
                }}
            >
                <Alert severity={submitSuccess ? "success" : "error"} variant="filled">
                    {submitSuccess || submitError}
                </Alert>
            </Snackbar>
        </>
    );
}
