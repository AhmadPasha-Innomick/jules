import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Create from "@/components/pages/lookUps/idTypes/create/Create";
import React from "react";

function Page() {
  return (
    <>
      <PageBreadcrumb pageTitle="Create ID Types" />
      <Create />
    </>
  );
}

export default Page;
