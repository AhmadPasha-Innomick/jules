"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import IncentiveSchemeForm from "@/components/pages/incentive_management/IncentiveSchemeForm";
import {
  useCloneIncentiveScheme,
  useCreateIncentiveScheme,
  useInsertAllIncentiveUsers,
} from "@/hooks/useIncentiveSchemes";
import type { IncentiveSchemeDetail, IncentiveSchemePayload } from "@/types/incentive";

const CreateIncentiveSchemePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneFrom = searchParams.get("clone_from");

  const [initialData, setInitialData] = useState<IncentiveSchemeDetail | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const createMutation = useCreateIncentiveScheme();
  const cloneMutation = useCloneIncentiveScheme();
  const insertAllUsersMutation = useInsertAllIncentiveUsers();

  useEffect(() => {
    if (!cloneFrom) return;
    cloneMutation
      .mutateAsync(cloneFrom)
      .then((data) => setInitialData(data))
      .catch((err: any) => {
        setToast({
          type: "error",
          message: err?.message || "Failed to prepare clone data.",
        });
      });
  }, [cloneFrom]);

  const handleSubmit = async (payload: IncentiveSchemePayload) => {
    try {
      await createMutation.mutateAsync(payload);
      setToast({ type: "success", message: "Incentive scheme created successfully." });
      setTimeout(() => router.push("/incentive_management"), 1000);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to create incentive scheme.",
      });
    }
  };

  return (
    <>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Incentive Management", href: "/incentive_management" },
          { label: "Create Scheme" },
        ]}
      />

      {cloneMutation.isPending && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Preparing clone data...
        </Alert>
      )}

      <IncentiveSchemeForm
        mode="create"
        initialData={initialData}
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/incentive_management")}
        onInsertAllUsers={(payload) => insertAllUsersMutation.mutateAsync(payload)}
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

const CreateIncentiveSchemePage = () => {
  return (
    <Suspense
      fallback={
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading page...
        </Alert>
      }
    >
      <CreateIncentiveSchemePageContent />
    </Suspense>
  );
};

export default CreateIncentiveSchemePage;
