
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export interface SubCategory {
  id: number;
  name: string;
  category_id?: number;
}

export interface SubCategoriesResponse {
  success: boolean;
  data: SubCategory[];
  message?: string;
}

const fetchSubCategories = async (categoryId: number | string): Promise<SubCategoriesResponse> => {
  if (!categoryId) throw new Error("category_id is required");

  const res = await fetchWithAuth(`/api/incidents/sub-categories?category_id=${categoryId}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch sub-categories");
  }

  return res.json();
};

export const useSubCategories = (categoryId: number | string | undefined) => {
  return useQuery<SubCategoriesResponse, Error>({
    queryKey: ["subCategories", categoryId],
    queryFn: () => fetchSubCategories(categoryId!),
    enabled: !!categoryId, 
    staleTime: 10 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
  });
};