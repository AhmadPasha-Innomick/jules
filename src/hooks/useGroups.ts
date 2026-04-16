"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useApiMutation = <TData = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  invalidateKeys: string[] = []
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TData) => {
      const response = await fetchWithAuth(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "DELETE" ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw {
          success: result.success,
          error_code: result.error_code,
          message: result.message,
          data: result.data,
        };
      }

      return result;
    },

    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};

export const useCreateGroup = () => {
  return useApiMutation("/api/groups/create", "POST", ["users"]);
};

export const useGroups = (filters = {}) => {
  return useApiQuery(["groups"], "/api/groups/list", filters);
};

export const useGroupsDropdown = (params: any) => {
  return useApiQuery(
    ["groups-dropdown", params],
    "/api/groups/dropdown/list",
    params
  );
};

export const getGroupById = (groups, id) => {
  if (!groups || !Array.isArray(groups)) return null;
  return groups.find((g) => String(g.group_id) === String(id));
};

export const useCustomQuery = <TData = unknown>(
  queryKey: string[],
  fetcher: () => Promise<TData>,
  options = {}
) => {
  return useQuery({
    queryKey,
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useUpdateGroup = () => {
  return useApiMutation("/api/groups/update", "PUT", ["groups"]);
};

export const useDeleteGroup = () => {
  return useApiMutation("/api/groups/delete", "POST", ["groups"]);
};

const apiHooks = {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
};

export default apiHooks;
