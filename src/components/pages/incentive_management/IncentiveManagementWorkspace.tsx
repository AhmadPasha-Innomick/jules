"use client";

import React from "react";
import IncentiveSchemeTableWrapper from "@/components/pages/incentive_management/IncentiveSchemeTableWrapper";
import IncentivePlanTierTableWrapper from "@/components/pages/incentive_management/IncentivePlanTierTableWrapper";

const IncentiveManagementWorkspace = () => {
  const [tab, setTab] = React.useState<"scheme" | "planTier">("scheme");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-theme-xs">
        <button
          type="button"
          onClick={() => setTab("scheme")}
          className={`rounded-lg px-4 py-2 text-sm font-stc-medium transition ${
            tab === "scheme"
              ? "bg-brand-500 text-white shadow-theme-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Scheme Management
        </button>
        <button
          type="button"
          onClick={() => setTab("planTier")}
          className={`rounded-lg px-4 py-2 text-sm font-stc-medium transition ${
            tab === "planTier"
              ? "bg-brand-500 text-white shadow-theme-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Plan Tier Master
        </button>
      </div>

      {tab === "scheme" && <IncentiveSchemeTableWrapper />}
      {tab === "planTier" && <IncentivePlanTierTableWrapper />}
    </div>
  );
};

export default IncentiveManagementWorkspace;
