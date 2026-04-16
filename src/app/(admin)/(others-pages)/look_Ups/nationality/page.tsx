import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Table from "@/components/pages/lookUps/nationality/table/table";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Nationality Lookups | STC - Dashboard Template",
  description:
    "Manage and view nationality lookups in the STC Dashboard Template",
};

export default function BlankPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Nationalities" />
      <Table />
    </>
  );
}
