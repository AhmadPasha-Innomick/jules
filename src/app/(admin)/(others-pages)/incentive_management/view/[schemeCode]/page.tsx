"use client";

import React from "react";
import { Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import IncentiveSchemeForm from "@/components/pages/incentive_management/IncentiveSchemeForm";
import { useIncentiveSchemeDetail } from "@/hooks/useIncentiveSchemes";

interface ViewIncentiveSchemePageProps {
  params: Promise<{ schemeCode: string }>;
}

const ViewIncentiveSchemePage = ({ params }: ViewIncentiveSchemePageProps) => {
  const router = useRouter();
  const { schemeCode } = React.use(params);
  const decodedSchemeCode = decodeURIComponent(schemeCode);

  const { data, isLoading, isError, error } = useIncentiveSchemeDetail(decodedSchemeCode);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-gray-600">Loading scheme details...</div>
      </div>
    );
  }

  if (isError) {
    return <Alert severity="error">{(error as Error)?.message || "Failed to load scheme."}</Alert>;
  }

  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incentive Management", href: "/incentive_management" },
          { label: "View Scheme" },
        ]}
      />

      <IncentiveSchemeForm
        mode="view"
        initialData={data}
        onSubmit={() => undefined}
        onCancel={() => router.push("/incentive_management")}
      />
    </>
  );
};

export default ViewIncentiveSchemePage;
