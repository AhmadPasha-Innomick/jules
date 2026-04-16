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
      const queryString = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [k, v]) => {
            if (v !== undefined && v !== "") acc[k] = String(v);
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

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
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(data) : undefined,
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw json;
      }

      return json;
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};

export const useUsers = (filters = {}) => {
  return useApiQuery(["users"], "/api/users", filters);
};

export const useUsersDropdown = (params: any) => {
  return useApiQuery(["users-dropdown", params], "/api/users/dropdown", params);
};

export const useUser = (userId: string | number) => {
  return useApiQuery(
    ["user", String(userId)],
    `/api/user`,
    { id: userId },
    {
      enabled: !!userId,
    }
  );
};

export const useCreateUser = () => {
  return useApiMutation("/api/user", "POST", ["users"]);
};

export const useUpdateUser = (userId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetchWithAuth(`/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        const error: any = new Error(json?.message || "Failed to update user");
        error.data = json?.data;
        error.error_code = json?.error_code;
        throw error;
      }

      return json;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", String(userId)] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["userDetails", String(userId)],
      });
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/user/delete/${id}`, {
        method: "POST",
      });

      if (!res.ok) {
        const errMsg = await res.json();
        throw new Error(errMsg.message || "Delete failed");
      }

      return res.json();
    },
  });
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

export const useUserDetails = (userId: string | number) => {
  return useApiQuery(
    ["userDetails", String(userId)],
    `/api/user/details`,
    { id: userId },
    {
      enabled: !!userId,
    }
  );
};

export const useManagers = (limit = 20, offset = 0) => {
  return useApiQuery(["managers"], "/api/managers", {
    limit,
    offset,
    "filter_by[is_active]": 1,
    "filter_by[is_manager]": 1,
  });
};

export const useCreateFpUpgradeTransaction = () => {
  return useApiMutation("/api/fp-upgrade/transaction/create", "POST", [
    "users",
    "user",
  ]);
};

export const useVerifyFpStatus = () => {
  return useApiMutation(
    "/api/verifications/v1/cpr-with-fingerprint/verification-status",
    "POST",
    []
  );
};

export const useFinalTransactionCreate = () => {
  return useApiMutation("/api/fp-upgrade/transaction/final-create", "POST", []);
};

const apiHooks = {
  useApiQuery,
  useApiMutation,
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useCustomQuery,
  useUserDetails,
  useManagers,
  useCreateFpUpgradeTransaction,
  useVerifyFpStatus,
  useFinalTransactionCreate,
};

export default apiHooks;
