import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import UserTableWrapper from "@/components/pages/user_management/UserTableWrapper";


export default function UserManagementPage() {
  return (
    <div>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "User Management" },
        ]}
      />

      <UserTableWrapper />
    </div>
  );
}
