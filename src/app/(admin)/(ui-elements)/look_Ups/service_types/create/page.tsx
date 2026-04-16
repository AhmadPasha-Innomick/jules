import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Create from "@/components/pages/lookUps/service_types/create/Create";

import React from "react";

function Page() {
  return (
    <>
      <PageBreadcrumb pageTitle="Service Types Create" />
      <Create />
    </>
  );
}

export default Page;
