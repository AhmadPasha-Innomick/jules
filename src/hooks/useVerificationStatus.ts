"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface VerificationStatusResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    verificationStatus: "PENDING" | "SUCCESS" | "FAILED";
    [key: string]: any;
  };
}

export const useVerificationStatus = () => {
  return useMutation({
    mutationFn: async (payload: any): Promise<string> => {
      const response = await fetchWithAuth(
        "/verifications/v1/cpr-with-fingerprint/verification-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Verification status check failed");
      }

      const result: VerificationStatusResponse = await response.json();

      if (!result.success || !result.data?.transactionId) {
        throw new Error(result.message || "No transaction ID received from government verification");
      }

      return result.data.transactionId;
    },
  });
};