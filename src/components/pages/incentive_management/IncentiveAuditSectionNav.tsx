import React from "react";
import Link from "next/link";

type Props = {
  active: "scheme" | "plan-tier";
};

const activeClass = "border-brand-500 bg-brand-50 text-brand-700";
const inactiveClass = "border-gray-300 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50";

const IncentiveAuditSectionNav = ({ active }: Props) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Link
        href="/incentive_audits"
        className={`rounded-xl border px-4 py-2 text-sm font-stc-medium transition ${
          active === "scheme" ? activeClass : inactiveClass
        }`}
      >
        Scheme Audits
      </Link>
      <Link
        href="/incentive_audits/plan_tier"
        className={`rounded-xl border px-4 py-2 text-sm font-stc-medium transition ${
          active === "plan-tier" ? activeClass : inactiveClass
        }`}
      >
        Plan Tier Audits
      </Link>
    </div>
  );
};

export default IncentiveAuditSectionNav;
