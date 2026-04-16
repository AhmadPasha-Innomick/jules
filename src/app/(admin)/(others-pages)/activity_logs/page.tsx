import PageBreadcrumb from "@/components/common/PageBreadCrumbDynamic";
import ActivityLog from "@/components/pages/activity_logs/ActivityLog";

import React from "react";

const SystemSettings = () => {
  return (
    <>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Login Activity Logs" }
        ]}
      />

      <ActivityLog />
    </>
  );
};

export default SystemSettings;
