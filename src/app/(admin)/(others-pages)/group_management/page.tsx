import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import GroupTableWrapper from "@/components/pages/group_management/GroupTableWrapper";

export default function UserManagementPage() {
  return (
    <div>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Group Management", href: "/" },
          { label: "Groups" },
        ]}
      />

      <GroupTableWrapper />
    </div>
  );
}
















