"use client";

import { useApiMutation } from "./useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export interface CreatePostpaidVoicePayload {
    plan_product_id: string;
    contract_duration: number;
    crm_product_code: string;
    crm_product_name: string;
    display_name: string;
    price_exc_vat: number;
    price_inc_vat: number;
    data_allowance: string;
    social_media: string;
    local_calls: string;
    stc_to_stc_calls: string;
    intl_min: string;
    data_roaming: string;
    roaming_min: string;
    stc_rewards: string;
    is_popular: number;
    is_recommended: number;
    order_by: number;
}

export const useCreatePostpaidVoice = () => {
    return useApiMutation<CreatePostpaidVoicePayload>(
        "/api/product_catalogue/postpaid_voice/create",
        "POST"
    );
};



export interface CreatePrepaidVoicePayload {
    plan_product_id: string;
    crm_product_code: string;
    crm_product_name: string;
    display_name: string;

    price_exc_vat: number;
    price_inc_vat: number;

    plan_validity: string;
    data_allowance: string;

    local_calls: string;
    stc_to_stc_calls: string;
    other_features: string;

    stc_rewards: string;

    is_popular: number;
    is_recommended: number;
    order_by: number;
}

export const useCreatePrepaidVoice = () => {
    return useApiMutation<CreatePrepaidVoicePayload>(
        "/api/product_catalogue/prepaid_voice/create",
        "POST"
    );
};




export interface CreatePostpaidFiberPayload {
    plan_product_id: string;
    contract_duration: number;
    crm_product_code: string;
    crm_product_name: string;
    display_name: string;
    price_exc_vat: number;
    price_inc_vat: number;
    speed: string;
    data_allow: string;
    cashback: string;
    device_bundle: string;
    free_extra_data_sim: string;
    Monthlyfee_additionaldata: string;
    monthly_free_minutes: string;
    free_mesh_device: string;
    Line_rental: number;
    connection_fee: number;
    Free_months: string;
    stc_rewards: string;
    is_popular: number;
    is_recommended: number;
    order_by: number;
    unlimited_youtube: string;
    unlimited_netflix: string;
    included_shared_sim: number;
    odu_device: string;
    idu_device: string;
}

export const useCreatePostpaidFiber = () => {
    return useApiMutation<CreatePostpaidFiberPayload>(
        "/api/product_catalogue/postpaid_fiber/create",
        "POST"
    );
};



export interface DeletePostpaidFiberPayload {
    plan_product_id: string;
    contract_duration: number;
}

export const useDeletePostpaidFiber = () => {
    return useApiMutation<DeletePostpaidFiberPayload>(
        "/api/product_catalogue/postpaid_fiber/delete",
        "POST"
    );
};


export interface DeletePrepaidVoicePayload {
    plan_product_id: string;
}

export const useDeletePrepaidVoice = () => {
    return useApiMutation<DeletePrepaidVoicePayload>(
        "/api/product_catalogue/prepaid_voice/delete",
        "POST"
    );
};



export interface DeletePostpaidVoicePayload {
    plan_product_id: string;
    contract_duration: number;
}

export const useDeletePostpaidVoice = () => {
    return useApiMutation<DeletePostpaidVoicePayload>(
        "/api/product_catalogue/postpaid_voice/delete",
        "POST"
    );
};


export const useUpdatePrepaidVoice = (planProductId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await fetchWithAuth(
                "/api/product_catalogue/prepaid_voice/update",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        plan_product_id: planProductId,
                        ...data,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok || json?.success === false) {
                throw json;
            }

            return json;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["productCatalogue"],
            });

            queryClient.invalidateQueries({
                queryKey: ["prepaid_voice"],
            });

            queryClient.invalidateQueries({
                queryKey: ["prepaid_voice", String(planProductId)],
            });
        },
    });
};

export const useUpdatePostpaidVoice = (planId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await fetchWithAuth(
                `/api/product_catalogue/postpaid_voice/update`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...payload,
                        plan_product_id: planId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to update postpaid plan");
            }

            return data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productCatalogue"] });
            queryClient.invalidateQueries({ queryKey: ["postpaid_voice"] });
        },
    });
};


export const useUpdatePostpaidFiber = (planId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await fetchWithAuth(
                `/api/product_catalogue/postpaid_fiber/update`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const json = await response.json();

            if (!response.ok || json?.success === false) {
                throw json;
            }

            return json;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productCatalogue"] });
            queryClient.invalidateQueries({ queryKey: ["postpaid_fiber"] });
            queryClient.invalidateQueries({
                queryKey: ["postpaid_fiber", String(planId)],
            });
        },
    });
};


export const useUpdatePrepaidBroadband = (planProductId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await fetchWithAuth(
                "/api/product_catalogue/prepaid_broadband/update",

                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        plan_product_id: planProductId,
                        ...data,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok || json?.success === false) {
                throw json;
            }

            return json;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["plan-list"],
            });

            queryClient.invalidateQueries({
                queryKey: ["prepaid_broadband"],
            });

            queryClient.invalidateQueries({
                queryKey: ["prepaid_broadband", String(planProductId)],
            });
        },
    });
};





export interface CreatePrepaidBroadbandPayload {
    plan_product_id: string;
    crm_product_code: string;
    crm_product_name: string;
    display_name: string;

    price_exc_vat: number;
    price_inc_vat: number;

    plan_validity: string;
    data_allowance: string;

    local_calls: string;
    stc_to_stc_calls: string;
    other_features: string;

    stc_rewards: string;

    is_popular: number;
    is_recommended: number;
    order_by: number;
}

export const useCreatePrepaidBroadband = () => {
    return useApiMutation<CreatePrepaidBroadbandPayload>(
        "/api/product_catalogue/prepaid-broadband/create",
        "POST"
    );
};


export interface DeletePrepaidBroadbandPayload {
    plan_product_id: string;
}

export const useDeletePrepaidBroadband = () => {
    return useApiMutation<DeletePrepaidBroadbandPayload>(
        "/api/product_catalogue/prepaid_broadband/delete",
        "POST"
    );
};


export interface CreatePostpaidBroadbandPayload {
    plan_product_id: string;
    contract_duration: number;

    crm_product_code: string;
    crm_product_name: string;
    display_name: string;

    price_exc_vat: number;
    price_inc_vat: number;

    data_allowance: string;

    Free5GMifi: string;
    Included_Shared_Sim: string;
    Extra_sharing_sim_price: string;
    Free_social_media: string;

    stc_rewards: string;

    is_popular: number;
    is_recommended: number;
    order_by: number;
}

export const useCreatePostpaidBroadband = () => {
    return useApiMutation<CreatePostpaidBroadbandPayload>(
        "/api/product_catalogue/postpaid-broadband/create",
        "POST"
    );
};

export const useUpdatePostpaidBroadband = (planProductId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await fetchWithAuth(
                "/api/product_catalogue/postpaid-broadband/update",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        plan_product_id: planProductId,
                        ...data,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok || json?.success === false) {
                throw json;
            }

            return json;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["plan-list"],
            });

            queryClient.invalidateQueries({
                queryKey: ["postpaid_broadband"],
            });

            queryClient.invalidateQueries({
                queryKey: ["postpaid_broadband", String(planProductId)],
            });
        },
    });
};


export interface DeletePostpaidBroadbandPayload {
    plan_product_id: string;
    contract_duration: number;
}

export const useDeletePostpaidBroadband = () => {
    return useApiMutation<DeletePostpaidBroadbandPayload>(
        "/api/product_catalogue/postpaid-broadband/delete",
        "POST"
    );
};

