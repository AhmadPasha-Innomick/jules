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

export const useNotifications = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: async () => {
      const queryString = new URLSearchParams(filters).toString();
      const url = `/api/notifications${queryString ? `?${queryString}` : ""}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return response.json();
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    ...options,
  });
};

export const useCreateNotification = () => {
  return useApiMutation("/api/notifications/create", "POST", ["notifications"]);
};


export const useNotificationDetails = (notificationId: string | number) => {
  return useApiQuery(
    ["notificationDetails", String(notificationId)],
    `/api/notifications/view`,
    { id: notificationId },
    {
      enabled: !!notificationId,
    }
  );
};


export const useUpdateNotification = (notificationId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchWithAuth(`/api/notifications/update?id=${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw {
          message: result.message || "Failed to update notification",
          error_code: result.error_code,
        };
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationDetails", String(notificationId)] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] }); 
    },
  });
};