import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Create from "@/components/pages/lookUps/occupation/create/Create";

import React from "react";

function Page() {
  return (
    <>
      <PageBreadcrumb pageTitle="Create Occupation" />
      <Create />
    </>
  );
}

export default Page;
