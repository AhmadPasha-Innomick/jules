"use client";

import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import Settings_Management from "@/components/pages/settings_management/Settings_Management";
import React from "react";

const SystemSettings = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Settings Management", href: "/settings_management" },
        ]}
      />

      {/* ✅ CENTER CONTAINER */}
      <div className="flex justify-center px-6">
        <div className="w-full max-w-6xl">
          <Settings_Management />
        </div>
      </div>
    </>
  );
};

export default SystemSettings;
