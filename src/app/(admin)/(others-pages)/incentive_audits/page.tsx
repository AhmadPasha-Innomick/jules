import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import IncentiveAuditSectionNav from "@/components/pages/incentive_management/IncentiveAuditSectionNav";
import IncentiveAuditTableWrapper from "@/components/pages/incentive_management/IncentiveAuditTableWrapper";

const IncentiveAuditsPage = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incentive Audits", href: "/incentive_audits" },
        ]}
      />

      <IncentiveAuditSectionNav active="scheme" />
      <IncentiveAuditTableWrapper />
    </>
  );
};

export default IncentiveAuditsPage;
