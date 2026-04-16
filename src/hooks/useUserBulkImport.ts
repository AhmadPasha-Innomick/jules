"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export interface UserImportDetailRow {
  row_number: number;
  user_name: string;
  status: "success" | "partial" | "failed" | "duplicate";
  action: string;
  created: boolean;
  updated: boolean;
  groups_requested: string[];
  groups_linked: string[];
  groups_already_linked: string[];
  groups_not_found: string[];
  errors: string[];
  message: string;
}

export interface UserImportSummary {
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  partial_rows: number;
  failed_rows: number;
  duplicate_rows: number;
  inserted_users: number;
  updated_users: number;
  linked_users: number;
  linked_groups: number;
  errors: string[];
  details: UserImportDetailRow[];
}

export interface UserBulkImportResponse {
  success: boolean;
  message?: string;
  error_code?: number;
  data?: UserImportSummary;
}

export interface UserBulkImportPayload {
  rows: Record<string, unknown>[];
}

export const useUserBulkImport = () => {
  return useMutation({
    mutationFn: async (payload: UserBulkImportPayload): Promise<UserBulkImportResponse> => {
      const response = await fetchWithAuth("/api/users/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok || json?.success === false) {
        throw json;
      }

      return json;
    },
  });
};
