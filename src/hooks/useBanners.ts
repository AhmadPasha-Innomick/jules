"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useApiMutation } from "./useApi";
import { Banner, ApiResponse } from "@/types/types";

import { useQuery } from "@tanstack/react-query";

export const useApiQuery = <TData = unknown>(
  queryKey: string[],
  endpoint: string,
  params = {},
  options = {}
) => {
  return useQuery<TData>({
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

      return response.json() as Promise<TData>;
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

export const useBannerList = (category: "home" | "product_catalog") => {
  return useApiQuery<ApiResponse<Banner[]>>(
    ["banner-list", category],
    "/api/lookups/banner/list",
    {
      category,
    }
  );
};

export interface CreateBannerPayload {
  title: string;
  category: "home" | "product_catalog";
  order: number;
  base64: string;
  filename: string;
  extension: string;
}

export const useCreateBanner = () => {
  return useApiMutation<CreateBannerPayload>(
    "/api/lookups/banner/create",
    "POST",
    ["banner-list"]
  );
};

export const useBannerView = (id?: number) => {
  return useApiQuery<ApiResponse<Banner>>(
    ["banner-view", "id"],
    "/api/lookups/banner/view",
    id ? { id } : {},
    {
      enabled: Boolean(id),
    }
  );
};

export const useUpdateBanner = (bannerId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetchWithAuth(`/api/lookups/banner/${bannerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw json;
      }

      return json;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "banners",
      });

      queryClient.invalidateQueries({
        queryKey: ["banner", String(bannerId)],
      });
    },
  });
};

export const useDeleteBanner = () => {
  return useMutation<any, Error, number>({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/lookups/banner/delete/${id}`, {
        method: "POST",
      });

      if (!res.ok) {
        const errMsg = await res.json();
        throw new Error(errMsg?.message || "Delete failed");
      }

      return res.json();
    },
  });
};
