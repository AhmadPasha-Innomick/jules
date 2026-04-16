"use client";
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import GroupBasicInfo from "@/components/pages/group_management/GroupBasicInfo";
import GroupProperties from "@/components/pages/group_management/GroupProperties";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCreateGroup } from "@/hooks/useGroups";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
      {...other}
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

export default function CreateGroupPage() {
  const theme = useTheme();
  const router = useRouter();
  const [value, setValue] = React.useState(0);
  const [basicData, setBasicData] = React.useState<any>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const [backendErrors, setBackendErrors] = React.useState<Record<string, string[]> | null>(null);

  const [propsFormState, setPropsFormState] = React.useState<any>({
    msisdn_pool: "",
    employment_id: "",
    imei_pool: "",
    mnp_charge: "",
    sim_swap_charge: "",
  });


  const createGroupMutation = useCreateGroup();

  const handlePropsChange = (updated: any) => {
    setPropsFormState((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleBasicNext = (data: any) => {

    setBasicData(data);
    setValue(1);
  };


  const handlePropsPrev = () => setValue(0);

  const handleFinalSubmit = async (propsData: any) => {
    if (!basicData) return;

    try {
      setSubmitError(null);
      setSubmitSuccess(null);

      const payload = {
        group_name: basicData.group_name,
        group_desc: basicData.group_desc,
        group_level: Number(basicData.group_level),
        is_active: basicData.is_active ? 1 : 0,
        group_props: {
          msisdn_pool: propsData.msisdn_pool || null,
          employment_id: propsData.employment_id || null,
          imei_pool: propsData.imei_pool || null,
          mnp_charge: propsData.mnp_charge ? Number(propsData.mnp_charge) : null,
          sim_swap_charge: propsData.sim_swap_charge ? Number(propsData.sim_swap_charge) : null,
        },
        photo_base64: propsData.photo_base64 || null,
      };

      await createGroupMutation.mutateAsync(payload);

      setSubmitSuccess("Group created successfully!");
      setTimeout(() => router.push("/group_management"), 2000);
    } catch (err: any) {
      let errorMessage = "Failed to create group";

      if (err?.data && typeof err.data === "object") {
        setBackendErrors(err.data);

        const firstFieldError = Object.values(err.data)?.[0];
        if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
          errorMessage = firstFieldError[0];
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setSubmitError(errorMessage);

    
      setValue(0);
    }



  };

  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Group Management", href: "/group_management" },
          { label: "Create Group" },
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
              "& .MuiTab-root": { pointerEvents: "none", cursor: "default", color: "#1d252d" },
              "& .Mui-selected": { color: "#1d252d", fontWeight: 600 },
            }}
          >
            <Tab label="Basic Info" {...a11yProps(0)} />
            <Tab label="Group Properties" {...a11yProps(1)} />
          </Tabs>
        </AppBar>

        <TabPanel value={value} index={0}>
          <GroupBasicInfo onNext={handleBasicNext} backendErrors={backendErrors} defaultValues={basicData} onCancel={() => router.push("/group_management")} />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <GroupProperties
            values={propsFormState}
            onChange={handlePropsChange}
            onPrev={handlePropsPrev}
            onSubmit={handleFinalSubmit}
            isSubmitting={createGroupMutation.isPending}
          />

        </TabPanel>
      </Box>
      <Snackbar
        open={Boolean(submitSuccess || submitError)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "72px",
          zIndex: (theme) => theme.zIndex.modal + 100,
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