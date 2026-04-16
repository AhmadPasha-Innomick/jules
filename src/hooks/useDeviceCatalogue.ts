"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiMutation, useApiQuery } from "./useApi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export interface DeviceListParams {
  limit: number;
  offset: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  status?: "all" | "active" | "inactive" | "new";
  category?: string;
  brand?: string;
}

export interface DeviceStoragePayload {
  id?: number;
  crm_product_part_code: string;
  storage: string;
  fullprice: number;
  di_amount_12?: number | null;
  di_amount_18?: number | null;
  di_amount_24?: number | null;
  di_amount_36?: number | null;
}

export interface CreateDevicePayload {
  category: string;
  brand: string;
  device_name: string;
  color_variations?: string;
  image_file1: string;
  image_file2?: string;
  image_file3?: string;
  order_by?: number;
  status?: 0 | 1 | 2;
  storages: DeviceStoragePayload[];
}

export interface UpdateDevicePayload extends Partial<CreateDevicePayload> {
  device_id: number;
  status?: 0 | 1 | 2;
  storages?: DeviceStoragePayload[];
}

export interface DeleteDevicePayload {
  device_id: number;
}

export const useDeviceList = (params: DeviceListParams) => {
  return useApiQuery(["device-list"], "/api/product_catalogue/device/list", {
    ...params,
  });
};

export const useDeviceDetail = (deviceId?: number) => {
  return useApiQuery(
    ["device-detail", String(deviceId || "")],
    "/api/product_catalogue/device/detail",
    deviceId ? { device_id: deviceId } : {},
    {
      enabled: Boolean(deviceId),
    }
  );
};

export const useCreateDevice = () => {
  return useApiMutation<CreateDevicePayload>(
    "/api/product_catalogue/device/create",
    "POST",
    ["device-list"]
  );
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateDevicePayload) => {
      const response = await fetchWithAuth("/api/product_catalogue/device/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw json;
      }

      return json;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["device-list"] });
      queryClient.invalidateQueries({
        queryKey: ["device-detail", String(variables.device_id)],
      });
    },
  });
};

export const useDeleteDevice = () => {
  return useApiMutation<DeleteDevicePayload>(
    "/api/product_catalogue/device/delete",
    "POST",
    ["device-list"]
  );
};
