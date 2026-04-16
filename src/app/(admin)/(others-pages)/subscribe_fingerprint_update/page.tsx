

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import EkycContainer from "@/components/pages/ekyc/EkycContainer";



export default function UserManagementPage() {
  return (
    <div>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Subscriber Fingerprint Update", href: "/subscribe_fingerprint_update" },

        ]}
      />
   

      <EkycContainer />
     
     
    </div>
  );
}


























