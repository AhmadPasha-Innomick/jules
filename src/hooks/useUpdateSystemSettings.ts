import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { UpdateSystemSettingsPayload } from "@/types/systemSettings";

export const useUpdateSystemSettings = () => {
  return useMutation({
    mutationFn: async (payload: UpdateSystemSettingsPayload) => {
      const res = await fetchWithAuth("/api/system-settings/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Failed to save system settings");
      }

      return res.json();
    },
  });
};
