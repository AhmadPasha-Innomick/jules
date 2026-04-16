"use client";

import * as React from "react";
import { Box, Alert, Typography, Divider } from "@mui/material";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import NotificationBasicInfo from "@/components/pages/notification_management/NotificationBasicInfo";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/hooks/useApi";

export default function CreateNotification() {
    const router = useRouter();
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
    const createUserMutation = useCreateUser();

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Notification Management", href: "/notification_management" },
                    { label: "Create Notification" },
                ]}
            />

            <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
                {submitSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {submitSuccess}
                    </Alert>
                )}

                {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Alert>
                )}


                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: "#ebebe5",
                        borderRadius: "4px 4px 0 0",
                    }}
                >
                    <Typography fontWeight={600} color="#1d252d">
                        Notification Info
                    </Typography>
                </Box>

                <Divider />


                <Box sx={{ pt: 3 }}>
                    <NotificationBasicInfo
                        onNext={() => { }}
                        onCancel={() => router.push("../notification_management")}
                    />
                </Box>
            </Box>
        </>
    );
}
