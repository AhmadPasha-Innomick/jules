"use client";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useLinkSelectedIdType } from "@/hooks/useSelectedIdTypeLinks";
import SelectedIdTypeForm from "@/components/pages/Selected_id_types/SelectedIdTypeForm";

export default function CreateSelectedIdTypePage() {
    const theme = useTheme();
    const router = useRouter();

    const [value] = React.useState(0);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const linkMutation = useLinkSelectedIdType();

    const handleSubmit = async (payload: any) => {
        try {
            setErrorMsg(null);
            setSuccessMsg(null);

            await linkMutation.mutateAsync(payload);

            setSuccessMsg("ID type linked to module group successfully");
        } catch (err: any) {
        
            if (err?.data?.select_id_types?.length) {
                setErrorMsg(err.data.select_id_types[0]);
                return;
            }

      
            setErrorMsg(err?.message || "Failed to link ID type");
        }

    };

    return (
        <>

            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Module Management", href: "/module_management" },
                    { label: "ID Types Management", href: "/module_management/selected_id_types" },
                    { label: "Assign ID Type" },
                ]}
            />


            <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
                <AppBar
                    position="static"
                    sx={{ bgcolor: "#ebebe5", boxShadow: "none" }}
                >
                    <Tabs
                        value={value}
                        onChange={() => { }}
                        indicatorColor="secondary"
                        sx={{
                            "& .MuiTab-root": {
                                pointerEvents: "none",
                                color: "bg-brand-600",
                                cursor: "default",
                            },
                        }}
                    >
                        <Tab label="Assign ID Type" />
                    </Tabs>
                </AppBar>

                <Box sx={{ pt: 3 }}>
                    <SelectedIdTypeForm
                        onSubmit={handleSubmit}
                        isSubmitting={linkMutation.isPending}
                        onCancel={() =>
                            router.push("/module_management/selected_id_types")
                        }
                    />
                </Box>
            </Box>


            <Snackbar
                open={Boolean(successMsg || errorMsg)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "72px",
                    zIndex: (theme) => theme.zIndex.modal + 100,
                }}
                onClose={() => {
                    if (successMsg) {
                        router.push("/module_management/selected_id_types");
                    }
                    setSuccessMsg(null);
                    setErrorMsg(null);
                }}
            >
                <Alert
                    severity={successMsg ? "success" : "error"}
                    variant="filled"
                    onClose={() => {
                        if (successMsg) {
                            router.push("/module_management/selected_id_types");
                        }
                        setSuccessMsg(null);
                        setErrorMsg(null);
                    }}
                >
                    {successMsg || errorMsg}
                </Alert>
            </Snackbar>
        </>
    );
}
