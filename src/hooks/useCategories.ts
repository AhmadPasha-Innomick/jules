
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";


export interface Category {
  id: number;
  name: string;
  
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

const fetchCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetchWithAuth("/api/incidents/categories");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch categories");
  }

  return response.json();
};

export const useCategories = () => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};