import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { SystemSettingsResponse } from "@/types/systemSettings";

export const useSystemSettings = () => {
  return useQuery<SystemSettingsResponse>({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/system-settings/get-settings");

      if (!res.ok) {
        throw new Error("Failed to fetch system settings");
      }

      const json = await res.json();
      return json.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};
