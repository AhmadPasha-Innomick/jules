"use client";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
    Alert,
    Snackbar,
    CircularProgress,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";

import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import BannerBasicInfoUpdate from "@/components/pages/banner_management/BannerBasicInfoUpdate";

import {
    useBannerView,
    useUpdateBanner,
} from "@/hooks/useBanners";



interface Banner {
    id: number;
    title: string;
    category: "home" | "product_catalog";
    order: number;
    filename: string;
    extension: string;
    image_base64?: string;
}

export default function UpdateBannerPage() {
    const theme = useTheme();
    const router = useRouter();
    const params = useParams<{ id: string }>();

    const bannerId = Number(params.id);

    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
    const [submitError, setSubmitError] = React.useState<string | null>(null);


    const {
        data: bannerResponse,
        isLoading,
        isError,
        error,
    } = useBannerView(bannerId);

    const banner = bannerResponse?.data as Banner | undefined;


    const updateBannerMutation = useUpdateBanner(bannerId);



    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={8}>
                <CircularProgress />
            </Box>
        );
    }


    if (isError || !banner) {
        return (
            <Box mt={4} px={3}>
                <Alert severity="error">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load banner details"}
                </Alert>
            </Box>
        );
    }
    const normalizeBase64 = (base64?: string) => {
        if (!base64) return undefined;
        return base64.includes("base64,")
            ? base64.split("base64,")[1]
            : base64;
    };

    const handleSubmit = async (values: {
        title: string;
        category: "home" | "product_catalog";
        order: number | string;
        base64?: string;
        filename?: string;
        extension?: string;
    }) => {
        try {
            setSubmitError(null);
            setSubmitSuccess(null);

            const payload: Record<string, any> = {
                title: values.title.trim(),
                category: values.category,
                order: Number(values.order) || 0,
            };

            if (values.base64) {
                payload.base64 = normalizeBase64(values.base64);
                payload.filename = values.filename;
                payload.extension = values.extension?.replace(".", "").toLowerCase();
            }

            await updateBannerMutation.mutateAsync(payload);

            setSubmitSuccess("Banner updated successfully!");

        } catch (err: any) {
            setSubmitError(
                err?.message ||
                err?.error_message ||
                err?.data?.message ||
                "Failed to update banner"
            );
        }
    };


    const handleCloseSuccess = () => {
        setSubmitSuccess(null);
        router.push("/product_catalogue/banner_management");
    };

    const handleCloseError = () => {
        setSubmitError(null);

    };



    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Banner Management", href: "/product_catalogue/banner_management" },
                    { label: "Update Banner" },
                ]}
            />

            <Box bgcolor="background.paper" width="100%" pb={4}>
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        bgcolor: "#f5f5f5",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Tabs
                        value={0}
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

                <Box px={{ xs: 2, md: 4 }} pt={4} maxWidth={960} mx="auto">
                    <BannerBasicInfoUpdate
                        initialValues={{
                            title: banner.title,
                            category: banner.category,
                            order: banner.order,
                            filename: banner.filename,
                            extension: banner.extension,
                            base64: banner.image_base64,
                        }}
                        onSubmit={handleSubmit}
                        isSubmitting={updateBannerMutation.isPending}
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
                    sx={{ width: "100%", minWidth: 320 }}
                >
                    {submitSuccess}
                </Alert>
            </Snackbar>


            <Snackbar
                open={Boolean(submitError)}
                autoHideDuration={4000}
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
                    sx={{ width: "100%", minWidth: 320 }}
                >
                    {submitError}
                </Alert>
            </Snackbar>

        </>
    );
}
