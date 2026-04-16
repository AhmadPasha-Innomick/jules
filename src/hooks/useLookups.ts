import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useQuery } from "@tanstack/react-query";

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

export const useNationalities = () => {
  return useQuery({
    queryKey: ["nationalities"],

    queryFn: async () => {
      const res = await fetchWithAuth("/api/lookups/nationalities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch nationalities");

      const json = await res.json();
      return json.data;
    },
  });
};

export const useIdTypes = () => {
  return useQuery({
    queryKey: ["id-types"],

    queryFn: async () => {
      const res = await fetchWithAuth("/api/lookups/id-types", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to load ID Types");

      const json = await res.json();
      return json.data;
    },
  });
};

export const useUserTitles = () => {
  return useApiQuery(["user-titles"], "/api/lookups/user-titles");
};

export const usePaymentModes = () => {
  return useApiQuery(
    ["payment-modes"],
    "/api/lookups/all-pay-mods",
    {},
    {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );
};

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/proxy/lookups/service-types");
      if (!response.ok) {
        throw new Error("Failed to fetch service types");
      }
      const result = await response.json();
    
      return result.json.data || [];
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
};
