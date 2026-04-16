"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useExportIncidents = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>): Promise<Blob> => {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });

      const response = await fetchWithAuth(`/api/incidents/export?${query.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export incidents");
      }

      return response.blob();
    },
  });
};
