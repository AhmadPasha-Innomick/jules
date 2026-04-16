import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import ModuleManagement from "@/components/pages/module_management/ModuleManagement";
import ModuleTableWrappper from "@/components/pages/module_management/ModuleTableWrapper"
import React from "react";

const SystemSettings = () => {
  return (
    <div>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Modules", href: "/module_management" },

        ]}
      />
    
      <ModuleTableWrappper />
    </div>
  );
};

export default SystemSettings;
