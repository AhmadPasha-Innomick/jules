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
import { useCreateBanner } from "@/hooks/useBanners";
import BannerBasicInfo from "@/components/pages/banner_management/BannerBasicInfo";

export default function CreateBannerPage() {
    const theme = useTheme();
    const router = useRouter();

    const [value] = React.useState(0);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

    const createBannerMutation = useCreateBanner();


    const handleCloseSuccess = () => {
        setSubmitSuccess(null);
        router.push("/product_catalogue/banner_management");
    };

    const handleCloseError = () => {
        setSubmitError(null);

    };

    const handleSubmit = async (data: any) => {
        try {
            setSubmitError(null);
            setSubmitSuccess(null);

            await createBannerMutation.mutateAsync(data);

            setSubmitSuccess("Banner created successfully!");


        } catch (err: any) {
            setSubmitError(err?.message || "Failed to create banner");
        }
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Banner Management", href: "product_catalogue/banner_management" },
                    { label: "Create Banner" },
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
                        <Tab label="Banner Info" />
                    </Tabs>
                </AppBar>

                <Box sx={{ pt: 3 }}>
                    <BannerBasicInfo
                        onSubmit={handleSubmit}
                        isSubmitting={createBannerMutation.isPending}
                        onCancel={() => router.push("/product_catalogue/banner_management")}
                    />

                </Box>
            </Box>


            <Snackbar
                open={Boolean(submitSuccess)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "72px",
                    zIndex: (theme) => theme.zIndex.modal + 100,
                }}
                onClose={handleCloseSuccess}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={handleCloseSuccess}
                    sx={{ minWidth: 320 }}
                >
                    {submitSuccess}
                </Alert>
            </Snackbar>


            <Snackbar
                open={Boolean(submitError)}
                autoHideDuration={5500}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "72px",
                    zIndex: (theme) => theme.zIndex.modal + 100,
                }}
                onClose={handleCloseError}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={handleCloseError}
                    sx={{ minWidth: 320 }}
                >
                    {submitError}
                </Alert>
            </Snackbar>

        </>
    );
}
