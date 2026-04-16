"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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

type AssignPayload = {
  group_id: number | string;
  user_name: string;
};

type AssignModuleGroupPayload = {
  group_id: number | string;
  module_id: number | string;
};

const assignToGroup = async (payload: AssignPayload) => {
  const endpoint = "/api/groups/assign";

  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let json: any;
  try {
    json = await response.json();
  } catch (error) {
    console.error(" Failed to parse JSON:", error);
    throw new Error("Invalid JSON returned by server");
  }
  const extractErrorMessage = (json: any) => {
    if (json?.data) {
      const firstFieldError = Object.values(json.data).flat().find(Boolean);

      if (typeof firstFieldError === "string") {
        return firstFieldError;
      }
    }

    return json?.message || "Failed to assign user to group";
  };

  if (!response.ok || !json.success) {
    const error: any = new Error(extractErrorMessage(json));
    error.data = json.data;
    throw error;
  }

  return json;
};

export const useAssignUser = () => {
  return useMutation({
    mutationFn: assignToGroup,
  });
};

const fetchAssignments = async (params: any) => {
  const query = new URLSearchParams(params).toString();

  const res = await fetchWithAuth(`/api/groups/assign-list?${query}`, {
    method: "GET",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load assignment list");
  }

  return json;
};

export const useGroupAssignments = (params: any) => {
  return useQuery({
    queryKey: ["group-assignments", params],
    queryFn: () => fetchAssignments(params),
  });
};

const fetchModuleAssignments = async (params: any) => {
  const query = new URLSearchParams(params).toString();

  const res = await fetchWithAuth(`/api/modules/assign-list?${query}`, {
    method: "GET",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load assignment list");
  }

  return json;
};

const assignModuleToGroup = async (payload: AssignModuleGroupPayload) => {
  const endpoint = "/api/modules/assign";

  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!json?.success) {
    throw new Error(json.data?.group_id || "Failed to link module to group");
  }

  return json;
};

export const useAssignModuleGroup = () => {
  return useMutation({
    mutationFn: assignModuleToGroup,
  });
};

export const useModuleAssignments = (params: any) => {
  return useQuery({
    queryKey: ["module-assignments", params],
    queryFn: () => fetchModuleAssignments(params),
  });
};

type UnassignPayload = {
  group_user_id: number;
};

const unassignFromGroup = async (payload: UnassignPayload) => {
  const response = await fetchWithAuth("/api/groups/unassign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to unassign user");
  }

  return json;
};

export const useUnassignUserFromGroup = () =>
  useMutation({
    mutationFn: unassignFromGroup,
  });

type UnlinkModuleGroupPayload = {
  module_group_id: number;
};

const unlinkModuleGroup = async (payload: UnlinkModuleGroupPayload) => {
  const res = await fetchWithAuth("/api/modules/module-link/unlink-group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to unlink module group");
  }

  return json;
};

export const useUnlinkModuleGroup = () =>
  useMutation({
    mutationFn: unlinkModuleGroup,
  });
