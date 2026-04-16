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
import SelectedIdTypeForm from "@/components/pages/product_catalog/prepaid_broadband_form";

import { useCreatePrepaidBroadband } from "@/hooks/useCreatePlan";

export default function CreateSelectedIdTypePage() {
    const theme = useTheme();
    const router = useRouter();

    const [value] = React.useState(0);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);


    const createPrepaidBroadbandMutation = useCreatePrepaidBroadband();

    const handleSubmit = async (payload: any) => {
        try {
            setErrorMsg(null);
            setSuccessMsg(null);

            await createPrepaidBroadbandMutation.mutateAsync(payload);

            setSuccessMsg("Prepaid broadband plan created successfully");

        } catch (err: any) {
            setErrorMsg(err?.message || "Failed to create plan");
        }
    };


    return (
        <>

            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Plans", href: "/product_catalogue/plans" },
                    {
                        label: "Prepaid Broadband",
                        href: "/product_catalogue/plans/prepaid_broadband_catalogue",
                    },
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
                        <Tab label="Postpaid Broadband Details" />
                    </Tabs>
                </AppBar>

                <Box sx={{ pt: 3 }}>
                    <SelectedIdTypeForm
                        onSubmit={handleSubmit}
                        isSubmitting={createPrepaidBroadbandMutation.isPending}

                        onCancel={() =>
                            router.push("/product_catalogue/plans")
                        }
                    />
                </Box>
            </Box>


            <Snackbar
                open={!!successMsg}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ mt: "72px", zIndex: (theme) => theme.zIndex.modal + 100 }}
                onClose={() => {
                    setSuccessMsg(null);
                    router.push("/module_management/selected_id_types");
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => {
                        setSuccessMsg(null);
                        router.push("/module_management/selected_id_types");
                    }}
                >
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMsg}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ mt: "72px", zIndex: (theme) => theme.zIndex.modal + 100 }}
                onClose={() => setErrorMsg(null)}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={() => setErrorMsg(null)}
                >
                    {errorMsg}
                </Alert>
            </Snackbar>
        </>
    );
}
