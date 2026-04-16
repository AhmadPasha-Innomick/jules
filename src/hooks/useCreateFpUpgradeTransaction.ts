
import { useState } from "react";
import { API_BASE_URL } from "@/config";
type FpTransactionPayload = {
  internal_transaction_id: string;
  email?: string;
  mobile_number?: string;
  orders: Array<{
    transaction_id: string;
    amount: string;
    advance_payment: string;
  }>;
  payment: any[]; 
  attachments: any[];  
};

type FpTransactionResponse = {
  success: boolean;
  reference_id?: string;
  message?: string;
};
  const apiUrl = `${API_BASE_URL}/group/v1/fp-upgrade/transaction/create`;

export const useCreateFpTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = async (
    payload: FpTransactionPayload
  ): Promise<FpTransactionResponse> => {
 
    setLoading(true);
    setError(null);

    

    try {
 
     const res = await fetch("/api/fp-upgrade/transaction/create", {
     method: "POST",
      headers: {
    
  },
  body: JSON.stringify(payload),
  cache: "no-cache",  
});

      




      const data = await res.json();
      


      if (!res.ok) {
     
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Transaction failed");
      }
     

      return {
      
        success: true,
        reference_id: data.reference_id || data.ref_id || data.id,  
        message: data.message,
      };
    } catch (err: any) {
      const msg = err.message || "Network error occurred";
      setError(msg);
      console.error("FP Transaction Error:", err);  
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };


  const resetError = () => setError(null);

  return { createTransaction, loading, error, resetError };
};

