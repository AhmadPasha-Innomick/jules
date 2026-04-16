import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import PasswordManagement from "@/components/pages/password-management/PasswordManagement";

import React from "react";

const SystemSettings = () => {
  return (
    <>
     
       <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Password Management", href: "/" },
         
        ]}
      />
      <PasswordManagement />
    </>
  );
};

export default SystemSettings;
