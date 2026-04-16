import { useQuery } from "@tanstack/react-query";
import { getAccessTokenFromCookie } from "@/utils/GetAccessToken";

export type SearchParams = {
  page?: number;
  "per-page"?: number;
  id_number?: string;
  request_no?: string;
  msisdn?: string;
};

export type FingerprintItem = {
  id: number;
  msisdn: string | null;
  plan_name: string;
  service: string;
  status: string;
  user_id: string;
  password?: string;
  sender: string;
  transaction_id?: string;
  id_number: string;
  request_no: string;
  request_user_id: string;
  created_at: string;
  updated_at: string;
};

type Pagination = {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
};

export type ApiResponse = {
  success: boolean;
  error_code?: number;
  message: string;
  data: {
    items: FingerprintItem[];
    pagination: Pagination;
  };
};

export const useFingerprintUpgradeSearch = (
  params: SearchParams = {},
  options?: { enabled?: boolean }
) => {
  
  const {
    page = 1,
    "per-page": perPage = 20,
    id_number = "",
    request_no = "",
    msisdn = "",
  } = params;

  return useQuery<ApiResponse>({
    queryKey: [
      "fingerprint-upgrade",
      { page, perPage, id_number, request_no, msisdn },
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append("page", String(page));
      searchParams.append("per-page", String(perPage));

      if (id_number?.trim()) searchParams.append("id_number", id_number.trim());
      if (request_no?.trim())
        searchParams.append("request_no", request_no.trim());
      if (msisdn?.trim()) searchParams.append("msisdn", msisdn.trim());

      const token = getAccessTokenFromCookie();

   
      const response = await fetch(
        `/api/fingerprint-upgrade/search?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || "Failed to search fingerprint upgrade requests"
        );
      }

      return response.json() as Promise<ApiResponse>;
    },
    staleTime: 1000 * 60 * 5, 
    retry: 1,
    enabled: options?.enabled ?? true,
  });
};
