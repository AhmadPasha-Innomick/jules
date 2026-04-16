"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import NotificationEditForm from "@/components/pages/notification_management/NotificationEditForm";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useUpdateNotification, useNotificationDetails } from "@/hooks/useNotifications";
import { Box, CircularProgress } from "@mui/material";
interface EditNotificationPageProps {
    params: Promise<{ id: string }>;
}

export default function EditNotificationPage({ params }: EditNotificationPageProps) {
    const resolvedParams = React.use(params);
    const { id } = resolvedParams;

    const theme = useTheme();
    const router = useRouter();

    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

    const updateNotification = useUpdateNotification(id);
    const { data, isLoading, isError } = useNotificationDetails(id);

    {
        isLoading && (
            <Box>
                <CircularProgress />
            </Box>
        )
    }


    if (isError || !data?.data)
        return <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
            }}
        >
            <CircularProgress color="primary" />
        </Box>
  

    const notification = data.data;

    const handleSubmit = async (formData: any) => {
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            const payload = {
                id: Number(id),
                category: formData.category.toUpperCase().trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                image: formData.photo_base64 || null,
                group_ids: formData.group_ids,
                schedule_start: formData.schedule_start ? formData.schedule_start + ":00" : null,
                schedule_end: formData.schedule_end ? formData.schedule_end + ":00" : null,
            };

            await updateNotification.mutateAsync(payload);

            setSubmitSuccess("Notification updated successfully!");
            setTimeout(() => router.push("/notification_management"), 2000);
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to update notification");
        }
    };

    const handleCancel = () => {
        router.push("/notification_management");
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Notification Management", href: "/notification_management" },
                    { label: `Edit Notification` },
                ]}
            />

            <Box sx={{ bgcolor: "background.paper", width: "100%" }}>


                <AppBar position="static" sx={{ bgcolor: "#ebebe5", boxShadow: "none" }}>
                    <Tabs value={0} sx={{ "& .MuiTab-root": { color: "#1d252d" } }}>
                        <Tab label="Edit Notification" />
                    </Tabs>
                </AppBar>

                <Box sx={{ pt: 3 }}>
                    <NotificationEditForm
                        notification={notification}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isSubmitting={updateNotification.isPending}
                    />
                </Box>
            </Box>

            <Snackbar
                open={Boolean(submitSuccess || submitError)}
                autoHideDuration={6000}
                onClose={() => {
                    setSubmitSuccess(null);
                    setSubmitError(null);
                }}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
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