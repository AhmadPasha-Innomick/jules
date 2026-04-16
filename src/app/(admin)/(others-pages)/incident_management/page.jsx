import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";

import React from "react";
import IncidentTableWrapper from "@/components/pages/incident_management/IncidenttableWrapper";

const IncidentManagement = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incident Management", href: "/incident_management" },
        ]}
      />
      <IncidentTableWrapper />
    </>
  );
};

export default IncidentManagement;
