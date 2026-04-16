"use client";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import UserBasicInfo from "@/components/pages/user_management/UserBasicInfo";
import UserProfileInfo from "@/components/pages/user_management/UserProfileInfo";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/hooks/useApi";
import { useState } from "react";

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-tabpanel-${index}`}
            aria-labelledby={`scrollable-tab-${index}`}
            {...other}
        >
            <Box sx={{ pt: 3, display: value === index ? "block" : "none" }}>{children}</Box>
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `scrollable-tab-${index}`,
        "aria-controls": `scrollable-tabpanel-${index}`,
    };
}

export default function ScrollableTabs() {
    const theme = useTheme();
    const router = useRouter();
    const [value, setValue] = React.useState(0);
    const [basicData, setBasicData] = React.useState<any | null>(null);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
    const [backendErrors, setBackendErrors] =
        React.useState<Record<string, string[]>>({});
    const [genderError, setGenderError] = React.useState<string | null>(null);

    const [backendFieldErrors, setBackendFieldErrors] =
        React.useState<Record<string, string[]>>({});

    const createUserMutation = useCreateUser();

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleBasicNext = (data: any) => {
        setBasicData(data);
        setValue(1);
    };
    const handleProfilePrev = () => {
        setSubmitSuccess(null);
        setValue(0);
    };



    const handleProfileSubmit = async (profile: any) => {

        if (!basicData) {
            return;
        }


        try {
            setSubmitError(null);
            setSubmitSuccess(null);


            const payload = {
                user_title_id: basicData.user_title_id,
                user_name: basicData.user_name,
                password: basicData.password,
                user_firstname: basicData.user_firstname,
                user_middlename: basicData.user_middlename || "",
                user_lastname: basicData.user_lastname,
                user_fullname: basicData.user_fullname,
                is_active: basicData.is_active,
                is_admin: basicData.is_admin,
                is_manager: basicData.is_manager,


                profile: {

                    user_type: profile.user_type,
                    email: profile.email,
                    phone_number: profile.phone_number,
                    gender:
                        typeof profile.gender === "string"
                            ? profile.gender
                            : profile.gender?.id ?? null,

                    employer_ID: profile.employer_ID,
                    birth_date: profile.birth_date,
                    dealer_id: profile.dealer_id,
                    shop_id: profile.shop_id,
                    reporting_to: profile.reporting_to,
                    company_id:
                        profile.company_id !== "" && profile.company_id != null
                            ? Number(profile.company_id)
                            : null,

                    idtype_id: profile.idtype_id ? Number(profile.idtype_id) : null,

                    idnumber: profile.idnumber,
                    send_notification_type: profile.send_notification_type,
                    nationality_code: profile.nationality_code,
                    job_title: profile.job_title,
                    mm_id: profile.mm_id,
                    wallet_msisdn: profile.wallet_msisdn,
                    mnp_charge: Number(profile.mnp_charge) || 0,
                    sim_swap_charge: Number(profile.sim_swap_charge) || 0,
                    terminalid: profile.terminalid,
                    posid: profile.posid,
                    suspicious: profile.suspicious,
                },
                photo_base64: profile.photo_base64,
            };

            const result = await createUserMutation.mutateAsync(payload);

            if (result.success) {
                setSubmitSuccess("User created successfully!");
                setTimeout(() => {
                    router.push("../user_management");
                }, 2000);
            } else {
                setSubmitError(result.message || "Failed to create user");
            }
        } catch (err) {
            {

                if (err?.data) {
                    setSubmitError(err.message || "Validation failed");
                    setBackendErrors(err.data);
                    setValue(0);
                } else {
                    setSubmitError("An unexpected error occurred");
                }
            }

        }
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "User Management", href: "/user_management" },
                    { label: "Create User" },
                ]}
            />

            <Box sx={{ bgcolor: "background.paper", width: "100%" }}>

                <AppBar
                    position="static"
                    sx={{
                        bgcolor: "#ebebe5",
                        boxShadow: "none",
                    }}
                >
                    <Tabs
                        value={value}
                        onChange={() => { }}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
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
                    <UserBasicInfo
                        onNext={handleBasicNext}
                        onCancel={() => router.push("../user_management")}
                        defaultValues={basicData}
                        backendErrors={backendErrors}
                    />
                </TabPanel>

                <TabPanel value={value} index={1} dir={theme.direction}>
                    <UserProfileInfo
                        onPrev={handleProfilePrev}
                        onSubmit={handleProfileSubmit}
                        isSubmitting={createUserMutation.isPending}

                    />
                </TabPanel>
            </Box>
            <Snackbar
                open={Boolean(submitSuccess || submitError)}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => {
                    setSubmitSuccess(null);
                    setSubmitError(null);
                }}
                sx={{
                    position: "fixed",
                    top: 72,
                    right: 24,
                    zIndex: (theme) => theme.zIndex.snackbar + 100,
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
