"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { ModuleRow } from "@/types/module";

export const useModules = (params: Record<string, any> = {}) => {
  return useQuery<{ data: ModuleRow[]; totalCount: number }, Error>({
    queryKey: ["modules", params],
    queryFn: async () => {
      const qs = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/api/modules/list?${qs}`);

      if (!res.ok) throw new Error("Failed to fetch modules");

      const json = await res.json();

      return {
        data: json.data?.modules || [],
        totalCount: json.data?.totalCount || 0,
      };
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useModulesDropdown = (params: Record<string, any> = {}) => {
  return useQuery<{ data: ModuleRow[]; totalCount: number }, Error>({
    queryKey: ["modules", params],
    queryFn: async () => {
      const qs = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/api/modules/dropdown/list?${qs}`);

      if (!res.ok) throw new Error("Failed to fetch modules");

      const json = await res.json();

      return {
        data: json.data?.modules || [],
        totalCount: json.data?.totalCount || 0,
      };
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ModuleRow>) => {
      const res = await fetchWithAuth("/api/modules/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create module");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      module_id: number;
      module_name?: string;
      module_category?: string;
      module_desc?: string;
      is_active?: 0 | 1;
    }) => {
      const res = await fetchWithAuth("/api/modules/update", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to update module");
      }

      return {
        ...json,
        message: "Module updated successfully!",
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ module_id }: { module_id: number }) => {
      const res = await fetchWithAuth("/api/modules/delete", {
        method: "POST",
        body: JSON.stringify({ module_id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete module");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
};
