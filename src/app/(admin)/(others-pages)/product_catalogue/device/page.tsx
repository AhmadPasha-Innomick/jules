import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import DeviceList from "@/components/pages/product_catalog/device_list";

export default function DeviceCataloguePage() {
  return (
    <div>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Devices" },
        ]}
      />

      <div className="mt-6">
        <DeviceList />
      </div>
    </div>
  );
}
