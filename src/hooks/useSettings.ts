
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

export const usePasswordSettings = () => {
  return useApiQuery(
    ["passwords", ],
    `/api/password/list`,
    
   
  );
};




type UpdatePayload = {
  passwd_min_len: number;
  passwd_upper_char: number;
  passwd_lower_char: number;
  passwd_number: number;
  passwd_spl_char: number;
  enable_forgot_password: 0 | 1;
  is_active: 0 | 1;
};

export const useUpdatePasswordSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const response = await fetchWithAuth("/api/password/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Update failed" }));
        throw new Error(error.message || "Failed to update password settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwords"] });
    },
  });
};