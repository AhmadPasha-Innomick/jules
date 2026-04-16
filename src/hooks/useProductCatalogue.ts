"use client";

import { useApiQuery } from "./useApi";

interface Params {
  limit: number;
  offset: number;
  search?: string;
  status?: string | number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const useProductCatalogue = (type: string, params: Params) => {
  return useApiQuery(
    ["product-catalogue", type],
    "/api/product_catalogue/list",
    {
      ...params,
      type,
    }
  );
};

interface PlanListParams {
  service_type: string;
  sub_service_type: string;
}

export const usePlanList = (params: PlanListParams) => {
  return useApiQuery(
    ["plan-list", params.service_type, params.sub_service_type],
    "/api/product_catalogue/plan-list",
    {
      ...params,
    }
  );
};
