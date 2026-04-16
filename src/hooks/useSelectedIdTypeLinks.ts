import { useQuery } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type SelectedIdTypeLinkParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: number | string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

const fetchSelectedIdTypeLinks = async (params: SelectedIdTypeLinkParams) => {
  const query = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>
    )
  ).toString();

  const res = await fetch(`/api/modules/selected-id-type-link/list?${query}`, {
    method: "GET",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch linked ID types");
  }

  return json;
};

export const useSelectedIdTypeLinks = (params: SelectedIdTypeLinkParams) => {
  return useQuery({
    queryKey: ["selected-id-type-links", params],
    queryFn: () => fetchSelectedIdTypeLinks(params),
  });
};

type LinkSelectedIdTypePayload = {
  module_group_id: number;
  select_id_types: string;
  select_id_type_order: number;
  is_active: number;
};

const linkSelectedIdType = async (payload: LinkSelectedIdTypePayload) => {
  const res = await fetchWithAuth(
    "/api/modules/selected-id-type-link/link-group",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();


  if (!res.ok || !json.success) {
    throw json;
  }

  return json;
};

export const useLinkSelectedIdType = () =>
  useMutation({
    mutationFn: linkSelectedIdType,
  });

type UnlinkSelectedIdTypePayload = {
  module_group_id: number;
  select_id_types: string;
};

const unlinkSelectedIdType = async (payload: UnlinkSelectedIdTypePayload) => {
  const res = await fetchWithAuth(
    "/api/modules/selected-id-type-link/unlink-group",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to unlink ID type");
  }

  return json;
};

export const useUnlinkSelectedIdType = () =>
  useMutation({
    mutationFn: unlinkSelectedIdType,
  });
