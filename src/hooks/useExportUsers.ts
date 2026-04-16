import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useMutation } from "@tanstack/react-query";

export const useApiQuery = (
  queryKey: string[],
  endpoint: string,
  params?: Record<string, any>,
  options = {}
) => {
  return useQuery({
    queryKey: params ? [...queryKey, params] : queryKey,

    queryFn: async () => {

      const token = Cookies.get('accessToken');
      if (!token) throw new Error('No access token found. Please login.');

      const queryStr = params ? new URLSearchParams(params).toString() : "";
      const url = `${endpoint}${queryStr ? `?${queryStr}` : ""}`;

  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }


      return response.blob();
    },

    staleTime: 0,
 
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,

    ...options,
  });
};

export const useExportUsers = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>): Promise<Blob> => {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });

      const res = await fetch(`/api/users/export?${query.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to export users");
      }

      return res.blob();
    },
  });
};

