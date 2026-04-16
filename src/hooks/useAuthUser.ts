"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useApiQuery = (
  queryKey: string[],
  endpoint: string,
  params: Record<string, any> = {},
  options = {}
) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== "") {
              acc[key] = String(value);
            }
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
    retry: 1,
    retryOnMount: false,
    ...options,
  });
};

export const useAuthUser = (enabled = true) => {
  return useApiQuery(["Auth"], "/api/auth/me", {}, { enabled });
};

type EditProfilePayload = {
  user_title_id?: number;
  user_firstname?: string;
  user_middlename?: string;
  user_lastname?: string;
  user_fullname?: string;
  is_active?: number;
  is_manager?: number;
  profile?: {
    user_type?: string;
    email?: string;
    phone_number?: string;
    gender?: string;
    birth_date?: string;
    employer_ID?: string;
    dealer_id?: string;
    shop_id?: string;
    reporting_to?: string;
    company_id?: number;
    idtype_id?: number;
    idnumber?: string;
    send_notification_type?: string;
    nationality_code?: string;
    suspicious?: number;
    job_title?: string;
    pin?: string;
    mm_id?: string;
    wallet_msisdn?: string;
  };
  photo_base64?: string;
};

export const useEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditProfilePayload) => {
      const response = await fetchWithAuth("/api/auth/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Auth"] });

      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
