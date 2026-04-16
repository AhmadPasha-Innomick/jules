import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Table from "@/components/pages/lookUps/idTypes/table/Table";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: " Id Types Page | STC -  Dashboard Template",
  description: "This is  Blank Page STC Dashboard Template",
};

export default function BlankPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="ID Types" />
      <Table />
    </div>
  );
}
