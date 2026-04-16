import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import React from "react";
import LeadTableWrapper from "@/components/pages/Lead-Management/LeadTableWrapper";

const LeadManagement = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Lead Management", href: "/lead_management" },
        ]}
      />

      <LeadTableWrapper />
    </>
  );
};

export default LeadManagement;
