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

import { useCreatePostpaidFiber } from "@/hooks/useCreatePlan";
import FiberForm from "@/components/pages/product_catalog/postapid_fiber_form";

export default function CreatePostpaidFiberPage() {
    const theme = useTheme();
    const router = useRouter();

    const [value] = React.useState(0);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const createFiberMutation = useCreatePostpaidFiber();

    const handleSubmit = async (payload: any) => {
        try {
            setErrorMsg(null);
            setSuccessMsg(null);

            await createFiberMutation.mutateAsync(payload);

            setSuccessMsg("Postpaid fiber plan created successfully");
        } catch (err: any) {
            setErrorMsg(err?.message || "Failed to create postpaid fiber plan");
        }
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Plans", href: "/product_catalogue/plans" },
                    { label: "Postpaid Fiber Catalogue", href: "/product_catalogue/postpaid_fiber_catalogue" },
                ]}
            />

            <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
                <AppBar position="static" sx={{ bgcolor: "#ebebe5", boxShadow: "none" }}>
                    <Tabs value={value} onChange={() => { }}>
                        <Tab label="Postpaid Fiber Details" />
                    </Tabs>
                </AppBar>

                <Box sx={{ pt: 3 }}>
                    <FiberForm
                        onSubmit={handleSubmit}
                        isSubmitting={createFiberMutation.isPending}
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
                sx={{
                    mt: "90px",
                    zIndex: (theme) => theme.zIndex.snackbar + 10,
                }}
                onClose={() => {
                    setSuccessMsg(null);
                    router.push("/product_catalogue/plans");
                }}
            >
                <Alert severity="success" variant="filled">
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMsg}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "90px",
                    zIndex: (theme) => theme.zIndex.snackbar + 10,
                }}
                onClose={() => setErrorMsg(null)}
            >
                <Alert severity="error" variant="filled">
                    {errorMsg}
                </Alert>
            </Snackbar>
        </>
    );
}
