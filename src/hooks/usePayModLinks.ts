import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useApiQuery = (
  queryKey: string[],
  endpoint: string,
  params = {},
  options = {}
) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${endpoint}`);
      }
      return response.json();
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    retry: 1,
    retryOnMount: false,
    ...options,
  });
};

export const usePayModLinks = (params: any = {}) => {
  return useQuery({
    queryKey: ["pay-mod-links", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/proxy/pay-mod-link/list${queryString ? `?${queryString}` : ""}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error("Failed to fetch paymod links");
      }
      return response.json();
    },
    staleTime: 0, 
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export type LinkPaymodePayload = {
  module_group_id: number;
  mpos_paymode_id: number;
  is_active: 1 | 0;
};

const linkPaymodeToGroup = async (payload: LinkPaymodePayload) => {
  const endpoint = "/api/paymod-link/link-group";

  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();


  const extractErrorMessage = (json: any) => {
    if (json?.data) {
      const firstFieldError = Object.values(json.data).flat().find(Boolean);

      if (typeof firstFieldError === "string") {
        return firstFieldError;
      }
    }
    return json?.message || "Failed to link payment mode";
  };

  if (!response.ok || !json?.success) {
    const error: any = new Error(extractErrorMessage(json));
    error.data = json.data; 
    error.error_code = json.error_code;
    throw error;
  }

  return json;
};

export const useLinkPaymodeToGroup = () => {
  return useMutation({
    mutationFn: linkPaymodeToGroup,
  });
};

type UnlinkPaymodePayload = {
  module_group_id: number;
  mpos_paymode_id: number;
};

const unlinkPaymodeFromGroup = async (payload: UnlinkPaymodePayload) => {
  const res = await fetchWithAuth("/api/paymod-link/unlink-paymod", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to unlink payment mode");
  }

  return json;
};

export const useUnlinkPaymodeFromGroup = () =>
  useMutation({
    mutationFn: unlinkPaymodeFromGroup,
  });
