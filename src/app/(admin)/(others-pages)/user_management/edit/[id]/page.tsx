"use client";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Box, Alert, CircularProgress } from "@mui/material";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import UserEditInfo from "@/components/pages/user_management/UserEditInfo";
import UserEditProfileInfo from "@/components/pages/user_management/UserEditProfileInfo";
import { useRouter } from "next/navigation";
import { useUpdateUser, useUserDetails } from "@/hooks/useApi";
import { Snackbar } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
    dir?: string;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            <Box sx={{ pt: 3, display: value === index ? "block" : "none" }}>
                {children}
            </Box>
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `scrollable-tab-${index}`,
        "aria-controls": `scrollable-tabpanel-${index}`,
    };
}

interface EditUserPageProps {
    params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
    const resolvedParams = React.use(params);
    const { id } = resolvedParams;

    const theme = useTheme();
    const router = useRouter();

    const [value, setValue] = React.useState(0);
    const [basicData, setBasicData] = React.useState<any | null>(null);
    const [password, setPassword] = React.useState<string | null>(null);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

    const updateUser = useUpdateUser(id);
    const { data, isLoading, isError } = useUserDetails(id);

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


    if (isError || !data?.data) {
        return <Alert severity="error">Unable to load user.</Alert>;
    }

    const user = data.data;

    const handleBasicNext = (payload: any) => {
        setBasicData({
            user_title_id: payload.user_title_id ?? 1,
            user_name: payload.user_name,
            user_firstname: payload.user_firstname,
            user_middlename: payload.user_middlename,
            user_lastname: payload.user_lastname,
            user_fullname: payload.user_fullname,
            is_active: payload.is_active,
            is_manager: payload.is_manager,
        });

        setPassword(payload.password?.trim() ? payload.password : null);
        setValue(1);
    };

    const handleProfileSubmit = async (profile: any) => {
        if (!basicData) return;

        setSubmitError(null);
        setSubmitSuccess(null);
   

        const payload: any = {
            ...basicData,
            profile: {
                email: profile.email,
                user_type: profile.user_type,
                phone_number: profile.phone_number,
                gender:
                    typeof profile.gender === "string"
                        ? profile.gender
                        : profile.gender?.id ?? null,

                birth_date: profile.birth_date,
                dealer_id: profile.dealer_id,
                shop_id: profile.shop_id,
                employer_id: profile.employer_id,
                reporting_to: profile.reporting_to,
                company_id: profile.company_id ? Number(profile.company_id) : null,
                idtype_id: profile.idtype_id ? Number(profile.idtype_id) : null,
                idnumber: profile.idnumber,
                send_notification_type: profile.send_notification_type,
                nationality_code: profile.nationality_code,
                job_title: profile.job_title,
                mm_id: profile.mm_id,
                wallet_msisdn: profile.wallet_msisdn,
            },
            ...(password && { password }),
            ...(profile.photo_updated &&
                profile.photo_base64 && { photo_base64: profile.photo_base64 }),
        };

        try {
            await updateUser.mutateAsync(payload);
            setSubmitSuccess("User updated successfully!");
            setTimeout(() => router.push("/user_management"), 2000);
        } catch (err: any) {
           
            if (err?.data?.photo_base64?.length) {
                setSubmitError(err.data.photo_base64[0]);
                return;
            }

      
            if (err?.message) {
                setSubmitError(err.message);
                return;
            }

       
            setSubmitError("Failed to update user");
        }

    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "User Management", href: "/user_management" },
                    { label: `Edit User` },
                ]}
            />

            <Box sx={{ bgcolor: "background.paper", width: "100%" }}>


      
                <AppBar position="static" sx={{ bgcolor: "#ebebe5", boxShadow: "none" }}>
                    <Tabs
                        value={value}
                        onChange={() => { }}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            "& .MuiTab-root": {
                                pointerEvents: "none",
                                cursor: "default",
                                color: "#1d252d",
                            },
                            "& .Mui-selected": {
                                color: "#1d252d",
                                fontWeight: 600,
                            },
                        }}
                    >
                        <Tab label="Basic Info" {...a11yProps(0)} />
                        <Tab label="Profile Info" {...a11yProps(1)} />
                    </Tabs>
                </AppBar>

                <TabPanel value={value} index={0} dir={theme.direction}>
                    <UserEditInfo user={user} onNext={handleBasicNext} />
                </TabPanel>

                <TabPanel value={value} index={1} dir={theme.direction}>
                    <UserEditProfileInfo
                        user={user}
                        onPrev={() => setValue(0)}
                        onSubmit={handleProfileSubmit}
                        isSubmitting={updateUser.isPending}
                    />
                </TabPanel>


            </Box>
            <Snackbar
                open={Boolean(submitSuccess || submitError)}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "90px",
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
