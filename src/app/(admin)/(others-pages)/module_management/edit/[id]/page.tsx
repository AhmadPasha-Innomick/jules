
"use client";

import React, { useMemo } from "react";
import { Alert, Snackbar, Tabs, Tab, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";

import { useModules, useUpdateModule } from "@/hooks/useModules";
import ModuleEditBasicInfo from "@/components/pages/module_management/ModuleEditBasicInfo";
interface EditModulePageProps {
    params: Promise<{ id: string }>;
}

export default function EditModulePage({ params }: EditModulePageProps) {
    const { id } = React.use(params);
    const router = useRouter();

    const apiParams = useMemo(() => ({
        limit: 1000,
        page: 1,
    }), []);

    const { data, isLoading, isError } = useModules(apiParams);
    const updateModule = useUpdateModule();

    const [submitSuccess, setSubmitSuccess] = React.useState(null);
    const [submitError, setSubmitError] = React.useState(null);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading ...</p>
                </div>
            </div>
        );
    }

    if (isError) return <Alert severity="error">Unable to load modules</Alert>;

    const modules = data?.data || [];
    const editingModule = modules.find((m) => Number(m.module_id) === Number(id));

    if (!editingModule) return <Alert severity="error">Module not found</Alert>;

    const handleSubmit = async (payload) => {
        try {
            await updateModule.mutateAsync({
                module_id: editingModule.module_id,
                module_name: payload.module_name,
                module_category: payload.module_category,
                module_desc: payload.module_desc,
                is_active: payload.is_active ? 1 : 0,
            });

            setSubmitSuccess("Module updated successfully!");
            setTimeout(() => router.push("/module_management"), 1500);
        } catch (err) {
            setSubmitError(err?.message || "Failed to update module");
        }
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Module Management", href: "/module_management" },
                    { label: `Edit Module` },
                ]}
            />


            <Tabs value={0} onChange={() => { }}>
                <Tab label="Basic Info" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
                <ModuleEditBasicInfo
                    module={editingModule}
                    onSubmit={handleSubmit}
                    isSubmitting={updateModule.isPending}
                />
            </Box>

            <Snackbar
                open={Boolean(submitSuccess || submitError)}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "90px",                 // 👈 move DOWN from top
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

