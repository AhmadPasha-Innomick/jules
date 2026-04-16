// components/FinalActivationForm.tsx
"use client";

import React, { useState } from "react";
import { Loader2, Send, Smartphone, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { SmartCardData } from "@/types/types";
// import { useFinalTransactionCreate } from "@/hooks/useApi";
import { usePrepaidTransactionCreate } from "@/hooks/usePrepaidTransactionCreate";
import { PackageCheck, XCircle, RefreshCcw, LogOut, AlertCircle } from "lucide-react";
interface FinalActivationFormProps {
    cardData: SmartCardData;
    govtTransactionId: string; // from government verification
    selectedTransactions: Array<{ transactionId?: string; requestNo?: string; msisdn?: string }>;
    signature: string | null;  // ← ADD THIS LINE
    onSuccess: (referenceId: string) => void;
    onBack: () => void;
    onReset: () => void;  // ← ADD THIS LINE
}

// const renderSuccess = () => (
//     <div className="max-w-md mx-auto mt-12 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-500">
//         <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
//             <PackageCheck className="w-12 h-12" />
//         </div>
//         <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Order Received!</h2>
//         <p className="text-gray-500 mb-8 leading-relaxed">
//             The customer's EKYC validation is complete and the mobile line activation request has been queued.
//         </p>

//         <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-10">
//             <p className="text-xs text-blue-600 uppercase font-black tracking-widest mb-1">Order Reference</p>
//             <p className="text-2xl font-mono font-bold text-gray-800">SOME ID 2753765376387</p>
//         </div>

//         <button
//             // onClick={onReset || onBack}  
//             className=" w-full px-8 py-3 bg-yellow-500 text-white rounded-lg font-medium justify-center hover:bg-brand-600 disabled:opacity-70 flex items-center gap-2"
//         >
//             <RefreshCcw className="w-5 h-5" /> Start New Transaction
//         </button>
//     </div>
// );

// const renderFailed = () => (
//     <div className="max-w-md mx-auto mt-12 bg-white p-10 rounded-3xl shadow-2xl border border-red-100 text-center animate-in zoom-in duration-500">
//         <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
//             <XCircle className="w-12 h-12" />
//         </div>
//         <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Order Failed</h2>
//         <p className="text-gray-500 mb-10 leading-relaxed">
//             We encountered a system timeout during activation. The request could not be completed at this time.
//         </p>

//         <div className="flex flex-col gap-4">
//             <button
//                 // onClick={onReset || onBack}
//                 className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center gap-3"
//             >
//                 <RefreshCcw className="w-5 h-5" /> Try Again
//             </button>

//             <button
//                 // onClick={onReset || onBack}
//                 className="w-full py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
//             >
//                 <LogOut className="w-5 h-5 text-gray-400" /> Exit and Try Another Transaction
//             </button>
//         </div>
//     </div>
// );

const OrderFailed = ({ onRetry, onExit, errorMessage }: {
    onRetry: () => void;
    onExit: () => void;
    errorMessage: string | null;
}) => (
    <div className="max-w-md mx-auto mt-12 bg-white p-10 rounded-3xl shadow-2xl border border-red-100 text-center">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-12 h-12" />
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-3">
            Order Failed
        </h2>

        <p className="text-gray-500 mb-10 leading-relaxed">
            {errorMessage || "We encountered an error during activation. The request could not be completed."}
        </p>

        <div className="flex flex-col gap-4">
            {/* <button
                onClick={onRetry}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-3"
            >
                <RefreshCcw className="w-5 h-5" />
                Try Again
            </button> */}

            <button
                onClick={onExit}
                className="w-full py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-3"
            >
                <LogOut className="w-5 h-5 text-gray-400" />
                Exit and Try Another Transaction
            </button>
        </div>
    </div>
);

export const FinalActivationForm: React.FC<FinalActivationFormProps> = ({
    cardData,
    govtTransactionId,
    selectedTransactions,
    signature,  // ← ADD THIS LINE
    onSuccess,
    onBack,
    onReset,
}) => {
    const [msisdn, setMsisdn] = useState("");

    type SubmissionState = "idle" | "success" | "failure";

    const [submissionState, setSubmissionState] =
        useState<SubmissionState>("idle");
    const [intendedOutcome, setIntendedOutcome] = useState<"success" | "failure">("success");
    const [isLoading, setIsLoading] = useState(false);
    const [msisdnError, setMsisdnError] = useState<string | null>(null);
    const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
    const [checkSignature, setCheckSignature] = useState<boolean | null>(false);
    // const { mutate: createFinalTransaction, isPending, error } = useFinalTransactionCreate();
    // Change this line
    const { mutate: createFinalTransaction, isPending, error } = usePrepaidTransactionCreate();

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signature || signature.trim() == "") {
            setCheckSignature(true);
            return;
        }
        setCheckSignature(false);
        if (!msisdn || msisdn.length !== 8) {
            setMsisdnError("Mobile number must be exactly 8 digits");
            return;
        }
        setMsisdnError(null); // Clear error on valid input

        setIsLoading(true);

        const orders = selectedTransactions.map((tx) => ({
            transaction_id: tx.transactionId || tx.requestNo || "",
            amount: "0",
            advance_payment: "0",
        }));
        const cleanBase64 = (base64: string | null): string | null => {
            if (!base64) return null;
            return base64.includes(',') ? base64.split(',')[1] : base64;
        };

        const mobile_number = msisdn;
        const finalPayload = {
            transaction_id: govtTransactionId,
            email: "Na@gmail.com",
            mobile_number: mobile_number,
            sim: [
                {
                    row_id: "",
                    sim_number: "",
                    amount: 0,
                    msisdn: mobile_number,
                    plan_part_code: "",
                    plan_name: "",
                    vanity_contract: "",
                    sub_service_type: "starterPack",
                    mnp_flag: "",
                    mnp_sim_number: "",
                    mnp_donor: ""
                }
            ],
            payment: [],
            attachments: [
                {
                    fileName: "signature.png",
                    mimeType: "image/png",
                    base64: cleanBase64(signature)
                }
            ]
        };



        createFinalTransaction(finalPayload, {
            onSuccess: (data) => {
                const referenceId =
                    data?.data?.sr_number || data.sr_number;

                setSubmissionState("success");
                onSuccess(referenceId);
            },
            onError: (err: any) => {
                console.error("Final transaction failed:", err);

                // Extract meaningful message from backend response
                let message = "Failed to submit transaction";

                if (err?.response?.data?.message) {
                    message = err.response.data.message;
                } else if (err?.response?.data?.error) {
                    message = err.response.data.error;
                } else if (err?.message) {
                    message = err.message;
                }

                setApiErrorMessage(message);
                setSubmissionState("failure");
            },
            onSettled: () => {
                setIsLoading(false);
            },
        });

    };

    if (submissionState === "failure") {
        return (
            <OrderFailed
                onRetry={() => {
                    setSubmissionState("idle");
                    setApiErrorMessage(null);  // Clear error on retry
                    onBack();
                }}
                onExit={onReset}
                errorMessage={apiErrorMessage}  // ← PASS IT HERE
            />
        );
    }

    return (
        <form onSubmit={handleFinalSubmit} className="p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                {/* Left content */}
                <div className="max-w-xl">
                    <h3 className="text-2xl font-bold text-gray-900">
                        Complete Activation
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Enter customers service number to activate
                    </p>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Identity Verified
                </div>
            </div>


            {/* <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Complete Activation</h3>
                    <p className="text-sm text-gray-500">Enter customer's service number to activate</p>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Identity Verified
                </div>
            </div> */}




            <div className="max-w-md mx-auto w-full space-y-8">
                {/* MSISDN Input */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Service MSISDN (Mobile Number)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            required
                            placeholder="e.g. 3xxxxxxx"
                            value={msisdn}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 8); // Only digits, max 8
                                setMsisdn(value);

                                if (value.length === 0) {
                                    setMsisdnError(null);
                                } else if (value.length < 8) {
                                    setMsisdnError("Mobile number must be exactly 8 digits");
                                } else {
                                    setMsisdnError(null);
                                }
                            }}
                            className="block w-full pl-11 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400 text-xl font-mono tracking-[0.2em] bg-gray-50/50"
                        />
                        {msisdnError && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {msisdnError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Simulation Outcome Selector */}
                <div className="space-y-3">

                </div>
            </div>

            {(error || checkSignature == true) && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                    {(error as Error)?.message || "Please capture signature before submitting order"}
                </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex gap-4">

                <button
                    type="submit"
                    disabled={isLoading || isPending || msisdn.length !== 8}
                    className="w-full px-8 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isLoading || isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Order...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Order
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};