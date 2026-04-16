"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useApiQuery = (
  queryKey: readonly unknown[],
  endpoint: string,
  params = {},
  options = {}
) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => {
          return value != null && value !== "" && value !== "undefined";
        })
      );

      const queryString = new URLSearchParams(cleanParams as any).toString();
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

    refetchInterval: false,
    retry: 1,

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

export const useLogs = (filters = {}) => {
  return useApiQuery(["logs", filters], "/api/logs/list", filters);
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

export const useLogDetails = (log_id: string | number) => {
  return useQuery({
    queryKey: ["log-details", String(log_id)],
    queryFn: async () => {
      if (!log_id) throw new Error("log_id is required");

      const response = await fetchWithAuth(`/api/logs/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ log_id }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch log details");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to retrieve log");
      }

      return result.data;
    },
    enabled: !!log_id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useDeleteLog = () => {
  return useApiMutation("/api/logs/delete", "POST", ["logs"]);
};

export const useExportLogs = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>): Promise<Blob> => {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });

      const response = await fetchWithAuth(`/api/logs/export?${query.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export logs");
      }

      return response.blob();
    },
  });
};
const apiHooks = {
  useLogs,
  useLogDetails,
  useDeleteLog,
  useExportLogs,
};

export default apiHooks;
