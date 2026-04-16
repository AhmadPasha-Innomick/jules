import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import React from "react";
import IncentiveManagementWorkspace from "@/components/pages/incentive_management/IncentiveManagementWorkspace";

const IncentiveManagementPage = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incentive Management", href: "/incentive_management" },
        ]}
      />

      <IncentiveManagementWorkspace />
    </>
  );
};

export default IncentiveManagementPage;
