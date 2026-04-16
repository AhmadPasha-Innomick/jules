

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import EkycContainer from "@/components/pages/order_ekyc/EkycContainer";


export default function UserManagementPage() {
  return (
    <div>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Starter Pack Activation", href: "/subscribe_fingerprint_update" },

        ]}
      />


      <EkycContainer />


    </div>
  );
}


























