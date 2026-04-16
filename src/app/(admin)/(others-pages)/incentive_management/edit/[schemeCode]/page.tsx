"use client";

import React from "react";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import IncentiveSchemeForm from "@/components/pages/incentive_management/IncentiveSchemeForm";
import {
  useIncentiveSchemeDetail,
  useInsertAllIncentiveUsers,
  useUpdateIncentiveScheme,
} from "@/hooks/useIncentiveSchemes";
import type { IncentiveSchemePayload } from "@/types/incentive";

interface EditIncentiveSchemePageProps {
  params: Promise<{ schemeCode: string }>;
}

const EditIncentiveSchemePage = ({ params }: EditIncentiveSchemePageProps) => {
  const router = useRouter();
  const { schemeCode } = React.use(params);
  const decodedSchemeCode = decodeURIComponent(schemeCode);

  const { data, isLoading, isError, error } = useIncentiveSchemeDetail(decodedSchemeCode);
  const updateMutation = useUpdateIncentiveScheme();
  const insertAllUsersMutation = useInsertAllIncentiveUsers();

  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleSubmit = async (payload: IncentiveSchemePayload) => {
    try {
      await updateMutation.mutateAsync(payload);
      setToast({ type: "success", message: "Incentive scheme updated successfully." });
      setTimeout(() => router.push("/incentive_management"), 1000);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to update incentive scheme.",
      });
    }
  };

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
          { label: "Edit Scheme" },
        ]}
      />

      <IncentiveSchemeForm
        mode="edit"
        initialData={data}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/incentive_management")}
        onCloneFromCurrent={() =>
          router.push(`/incentive_management/create?clone_from=${encodeURIComponent(decodedSchemeCode)}`)
        }
        onInsertAllUsers={(payload) =>
          insertAllUsersMutation.mutateAsync({
            ...payload,
            scheme_code: payload.scheme_code || decodedSchemeCode,
          })
        }
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 100 }}
        onClose={() => setToast(null)}
      >
        <Alert severity={toast?.type || "success"} variant="filled" onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditIncentiveSchemePage;
