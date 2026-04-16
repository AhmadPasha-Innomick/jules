"use client";

import { useApiQuery } from "./useIncident";

export const useLeads = (filters = {}) => {
  return useApiQuery(["leads"], "/api/leads", filters);
};

export const useLeadDetails = (lead_id: string | number | undefined) => {
  const idString = lead_id ? String(lead_id) : undefined;

  return useApiQuery(
    ["leadDetails", idString ?? "none"],
    idString ? `/api/leads/${idString}` : "/api/leads/none",
    {},
    {
      enabled: !!idString,
    }
  );
};