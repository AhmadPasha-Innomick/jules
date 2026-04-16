import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import IncentiveAuditSectionNav from "@/components/pages/incentive_management/IncentiveAuditSectionNav";
import IncentivePlanTierAuditTableWrapper from "@/components/pages/incentive_management/IncentivePlanTierAuditTableWrapper";

const IncentivePlanTierAuditsPage = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incentive Audits", href: "/incentive_audits" },
          { label: "Plan Tier Audits", href: "/incentive_audits/plan_tier" },
        ]}
      />

      <IncentiveAuditSectionNav active="plan-tier" />
      <IncentivePlanTierAuditTableWrapper />
    </>
  );
};

export default IncentivePlanTierAuditsPage;
