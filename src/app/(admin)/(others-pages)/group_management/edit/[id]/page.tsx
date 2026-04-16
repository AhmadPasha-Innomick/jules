"use client";

import * as React from "react";
import { useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import GroupEditBasicInfo from "@/components/pages/group_management/GroupEditBasicInfo";
import GroupEditPropsInfo from "@/components/pages/group_management/GroupEditPropInfo";

import { useGroups, getGroupById, useUpdateGroup } from "@/hooks/useGroups";
interface EditGroupPageProps {
    params: Promise<{ id: string }>;
}


interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`group-tabpanel-${index}`}
            aria-labelledby={`group-tab-${index}`}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `group-tab-${index}`,
        "aria-controls": `group-tabpanel-${index}`,
    };
}

export default function EditGroupPage({ params }: EditGroupPageProps) {
    const theme = useTheme();
    const router = useRouter();
    const { id } = React.use(params);

    const [value, setValue] = React.useState(0);
    const [basicData, setBasicData] = React.useState<any>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [basicFormState, setBasicFormState] = React.useState<any | null>(null);
    const [propsFormState, setPropsFormState] = React.useState<any | null>(null);

    const { data, isLoading, isError } = useGroups();
    const updateGroup = useUpdateGroup();
    const allGroups = data?.data?.groups || [];
    const group = getGroupById(allGroups, id);

    useEffect(() => {
        if (!group || propsFormState) return;

        setPropsFormState({
            msisdn_pool: group.msisdn_pool ?? null,
            employment_id: group.employment_id ?? null,
            imei_pool: group.imei_pool ?? null,
            mnp_charge: group.mnp_charge ?? null,
            sim_swap_charge: group.sim_swap_charge ?? null,
        });
    }, [group, propsFormState]);

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
    if (!group) return <Alert severity="error">Group not found</Alert>;


    const handlePropsChange = (updated: any) => {
        setPropsFormState((prev: any) => ({
            ...prev,
            ...updated,
        }));
    };


    const handleBasicNext = (payload: any) => {
        const normalized = {
            group_name: payload.group_name,
            group_desc: payload.group_desc,
            group_level: payload.group_level,
            is_active: payload.is_active ? 1 : 0,
        };

        setBasicFormState(normalized);
        setBasicData(normalized);
        setValue(1);
    };


    const handlePropsPrev = () => setValue(0);

    const handlePropsSubmit = async (propsData: any) => {
        setPropsFormState(propsData);
        try {
            setSubmitError(null);
            setSubmitSuccess(null);
            setPropsFormState(propsData);

            const finalPayload = {
                ...basicData,
                group_id: id,
                group_props: {
                    msisdn_pool: propsData.msisdn_pool || null,
                    employment_id: propsData.employment_id || null,
                    imei_pool: propsData.imei_pool || null,
                    mnp_charge: propsData.mnp_charge
                        ? Number(propsData.mnp_charge)
                        : null,
                    sim_swap_charge: propsData.sim_swap_charge
                        ? Number(propsData.sim_swap_charge)
                        : null,
                },
                photo_base64: propsData.photo_base64 || null,
            };

            await updateGroup.mutateAsync(finalPayload);
            setSubmitSuccess("Group updated successfully!");

            setTimeout(() => {
                router.push("/group_management");
            }, 2000);

        } catch (err: any) {
            setSubmitError(err?.message || "Failed to update group");
        }
    };

    return (
        <>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Group Management", href: "/group_management" },
                    { label: "Edit Group" },
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
                        <Tab label="Group Properties" {...a11yProps(1)} />
                    </Tabs>
                </AppBar>

                <TabPanel value={value} index={0}>
                    <GroupEditBasicInfo
                        group={{
                            ...group,
                            ...basicFormState,
                        }}
                        onNext={handleBasicNext}
                        onCancel={() => router.push("/group_management")}
                    />
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <GroupEditPropsInfo
                        group={{
                            ...group,
                            ...(propsFormState ?? {}),
                        }}
                        onChange={handlePropsChange}
                        onPrev={handlePropsPrev}
                        onSubmit={handlePropsSubmit}
                        isSubmitting={updateGroup.isPending}
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
