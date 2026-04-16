import React from "react";
import NotificationTableWrapper from "@/components/pages/notification_management/notificationtableWrapper";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";


const NotificationManagement = () => {
  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Notification Management", href: "/notification_management" },

        ]}
      />
        <NotificationTableWrapper />
    </>
  );
};

export default NotificationManagement;
