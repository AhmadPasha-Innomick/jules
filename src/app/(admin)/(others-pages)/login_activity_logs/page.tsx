import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ActivityLog from "@/components/pages/activity_logs/ActivityLog";

import React from "react";

const SystemSettings = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Login Activity Logs" />
      <ActivityLog />
    </>
  );
};

export default SystemSettings;
