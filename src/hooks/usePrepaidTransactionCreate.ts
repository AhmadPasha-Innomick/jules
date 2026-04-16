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

      if (!response.ok) {
        throw new Error(`Failed to ${method.toLowerCase()} data`);
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

export const usePrepaidTransactionCreate = () => {
  return useApiMutation("/api/prepaid/transaction/create", "POST", []);
};
