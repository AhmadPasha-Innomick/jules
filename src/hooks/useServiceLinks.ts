import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useServiceLinks = (params: any = {}) => {
  return useQuery({
    queryKey: ["service-links", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/proxy/service-link/list${queryString ? `?${queryString}` : ""}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error("Failed to fetch service links");
      }
      return response.json();
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export type LinkServicePayload = {
  module_group_id: number;
  service_typeID: number;
  is_active: 1 | 0;
};

const linkServiceToGroup = async (payload: LinkServicePayload) => {
  const endpoint = "/api/service-link/link-group";

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
    return json?.message || "Failed to link service to group";
  };

  if (!response.ok || !json?.success) {
    const error: any = new Error(extractErrorMessage(json));
    error.data = json.data;
    throw error;
  }

  return json;
};

export const useLinkServiceToGroup = () =>
  useMutation({
    mutationFn: linkServiceToGroup,
  });

type UnlinkServicePayload = {
  module_group_id: number;
  service_typeID: number;
};

const unlinkServiceFromGroup = async (payload: UnlinkServicePayload) => {
  const res = await fetchWithAuth("/api/service-link/unlink-service", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to unlink service");
  }

  return json;
};

export const useUnlinkServiceFromGroup = () =>
  useMutation({
    mutationFn: unlinkServiceFromGroup,
  });
