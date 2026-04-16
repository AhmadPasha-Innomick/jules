"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";


export const useApiQuery = <TData = unknown>(
  queryKey: string[],
  endpoint: string,
  params: Record<string, any> = {},
  options: any = {}
) => {
  return useQuery<TData>({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params).flatMap(([key, value]) =>
          value !== undefined && value !== null && value !== ""
            ? [[key, String(value)]]
            : []
        )
      ).toString();

      const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch from ${endpoint}`);
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


export const useApiMutation = <TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  invalidateKeys: string[] = []
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      const response = await fetchWithAuth(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${method.toLowerCase()}`);
      }

      return response.json();
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};


export const useCloseIncident = () => {
  return useApiMutation<
    { success: boolean; message: string },
    { incident_id: string; resolution_note: string }
  >("/api/incidents/close", "POST", ["incidents"]); 
};


const apiHooks = {
  useApiQuery,
  useApiMutation,
  useCloseIncident,
};

export default apiHooks;