"use client";

import { useApiQuery } from "./useApi";

interface Params {
  limit: number;
  offset: number;
  search?: string;
}

export const usePrepaidVoiceCatalogue = (params: Params) => {
  return useApiQuery(
    ["prepaid-voice-catalogue"],
    "/api/product_catalogue/prepaid_voice/list",
    params
  );
};

export const usePostpaidVoiceCatalogue = (params: Params) => {
  return useApiQuery(
    ["postpaid-voice-catalogue"],
    "/api/product_catalogue/postpaid_voice/list",
    params
  );
};
