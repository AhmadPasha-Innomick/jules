"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type {
  IncentiveAuditLog,
  IncentivePlanTierAuditLog,
  IncentiveSchemeDetail,
  IncentiveSchemeListItem,
  IncentivePlanTier,
  IncentiveSchemePayload,
  IncentiveSubscriber,
} from "@/types/incentive";

type ListResponse = {
  items: IncentiveSchemeListItem[];
  totalCount: number;
  limit: number;
  offset: number;
};

type PlanTierListResponse = {
  items: IncentivePlanTier[];
  totalCount: number;
  limit: number;
  offset: number;
};

type AuditListResponse = {
  items: IncentiveAuditLog[];
  totalCount: number;
  limit: number;
  offset: number;
};

type PlanTierAuditListResponse = {
  items: IncentivePlanTierAuditLog[];
  totalCount: number;
  limit: number;
  offset: number;
};

const parseErrorMessage = (json: any, fallback: string) => {
  if (json?.data && typeof json.data === "object") {
    const firstFieldError = Object.values(json.data).flat().find(Boolean);
    if (typeof firstFieldError === "string") return firstFieldError;
  }
  return json?.message || fallback;
};

export const useIncentiveSchemes = (params: Record<string, any> = {}) =>
  useQuery<ListResponse, Error>({
    queryKey: ["incentive-schemes", params],
    queryFn: async () => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetchWithAuth(`/api/incentives/list?${query}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to fetch incentive schemes"));
      }

      return {
        items: json?.data?.items || [],
        totalCount: json?.data?.totalCount || 0,
        limit: json?.data?.limit || 20,
        offset: json?.data?.offset || 0,
      };
    },
    refetchOnMount: true,
    staleTime: 0,
  });

export const useIncentiveAudits = (params: Record<string, any> = {}) =>
  useQuery<AuditListResponse, Error>({
    queryKey: ["incentive-audits", params],
    queryFn: async () => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetchWithAuth(`/api/incentives/audits/list?${query}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to fetch incentive audits"));
      }

      return {
        items: json?.data?.items || [],
        totalCount: json?.data?.totalCount || 0,
        limit: json?.data?.limit || 20,
        offset: json?.data?.offset || 0,
      };
    },
    refetchOnMount: true,
    staleTime: 0,
  });

export const useIncentivePlanTierAudits = (params: Record<string, any> = {}) =>
  useQuery<PlanTierAuditListResponse, Error>({
    queryKey: ["incentive-plan-tier-audits", params],
    queryFn: async () => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetchWithAuth(`/api/incentives/plan-tier/audits/list?${query}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to fetch plan tier audits"));
      }

      return {
        items: json?.data?.items || [],
        totalCount: json?.data?.totalCount || 0,
        limit: json?.data?.limit || 20,
        offset: json?.data?.offset || 0,
      };
    },
    refetchOnMount: true,
    staleTime: 0,
  });

export const useIncentiveSchemeDetail = (schemeCode?: string) =>
  useQuery<IncentiveSchemeDetail, Error>({
    queryKey: ["incentive-scheme-detail", schemeCode],
    enabled: Boolean(schemeCode),
    queryFn: async () => {
      const query = new URLSearchParams({ scheme_code: schemeCode || "" }).toString();
      const res = await fetchWithAuth(`/api/incentives/detail?${query}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to fetch incentive scheme details"));
      }

      return json?.data as IncentiveSchemeDetail;
    },
  });

export const useCreateIncentiveScheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IncentiveSchemePayload) => {
      const res = await fetchWithAuth("/api/incentives/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        const error: any = new Error(parseErrorMessage(json, "Failed to create incentive scheme"));
        error.data = json?.data;
        throw error;
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incentive-schemes"] });
    },
  });
};

export const useUpdateIncentiveScheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IncentiveSchemePayload) => {
      const res = await fetchWithAuth("/api/incentives/update", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        const error: any = new Error(parseErrorMessage(json, "Failed to update incentive scheme"));
        error.data = json?.data;
        throw error;
      }
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incentive-schemes"] });
      if (variables?.scheme_code) {
        queryClient.invalidateQueries({
          queryKey: ["incentive-scheme-detail", variables.scheme_code],
        });
      }
    },
  });
};

export const useCloneIncentiveScheme = () =>
  useMutation({
    mutationFn: async (sourceSchemeCode: string) => {
      const res = await fetchWithAuth("/api/incentives/clone", {
        method: "POST",
        body: JSON.stringify({ source_scheme_code: sourceSchemeCode }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to clone scheme"));
      }
      return json?.data as IncentiveSchemeDetail;
    },
  });

export const useInsertAllIncentiveUsers = () =>
  useMutation({
    mutationFn: async (payload: {
      scheme_code?: string;
      scheme_type?: string;
      ind_target?: number | string | null;
      ind_payout?: number | string | null;
    }) => {
      const res = await fetchWithAuth("/api/incentives/insert-all-users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to insert users"));
      }

      return (json?.data?.subscribers || []) as IncentiveSubscriber[];
    },
  });

export const useIncentivePlanTiers = (params: Record<string, any> = {}) =>
  useQuery<PlanTierListResponse, Error>({
    queryKey: ["incentive-plan-tiers", params],
    queryFn: async () => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetchWithAuth(`/api/incentives/plan-tier/list?${query}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to fetch plan tiers"));
      }

      return {
        items: json?.data?.items || [],
        totalCount: json?.data?.totalCount || 0,
        limit: json?.data?.limit || 20,
        offset: json?.data?.offset || 0,
      };
    },
    refetchOnMount: true,
    staleTime: 0,
  });

export const useUpdateIncentivePlanTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IncentivePlanTier) => {
      const res = await fetchWithAuth("/api/incentives/plan-tier/update", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to update plan tier"));
      }
      return json?.data as IncentivePlanTier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incentive-plan-tiers"] });
    },
  });
};

export const useImportIncentivePlanTiers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await fetchWithAuth("/api/incentives/plan-tier/import", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(parseErrorMessage(json, "Failed to import plan tiers"));
      }
      return json?.data as {
        total?: number;
        inserted: number;
        updated: number;
        failed?: number;
        failures?: Array<{
          row_number: number;
          reason: string;
          row: Record<string, any>;
        }>;
        errors: string[];
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incentive-plan-tiers"] });
    },
  });
};
