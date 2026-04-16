"use client";

import React, { useState, useEffect } from "react";
import {
    Transaction,
    SmartCardData,
} from "@/types/types";
import { submitEkycRequest } from "@/app/(admin)/(others-pages)/subscribe_fingerprint_update/mockService";
import TransactionList from "@/components/ekyc/TransactionList";
import EkycWizard from "@/components/ekyc/EkycWizard";

import {
    Search,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    RefreshCcw,
    AlertCircle,
} from "lucide-react";

import { useFingerprintUpgradeSearch } from "@/hooks/useFingerprintUpgrade";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

type SearchFilters = {
    id_number?: string;
    request_no?: string;
    msisdn?: string;
};


const searchSchema = yup.object({
    id_number: yup.string().optional(),
    request_no: yup.string().optional(),
    msisdn: yup.string().optional(),
}).test(
    "at-least-one-filled",
    "Please fill at least one field to search",
    function (values) {
        const hasValue =
            !!values?.id_number?.trim() ||
            !!values?.request_no?.trim() ||
            !!values?.msisdn?.trim();

        if (hasValue) return true;

        // Attach error to the first field (CPR input) — this shows reliably
        return this.createError({
            path: "id_number",  // Error appears on CPR field
            message: "Please fill at least one field to search",
        });
    }
)
    .test(
        "only-one-filled",
        "Please fill only one input field",
        function (values) {
            const filledCount = [
                values?.id_number?.trim(),
                values?.request_no?.trim(),
                values?.msisdn?.trim(),
            ].filter(Boolean).length;

            if (filledCount <= 1) return true;

            return this.createError({
                path: "id_number",
                message: "Please fill only one input field",
            });
        }
    );





const EkycContainer: React.FC = () => {
    const [view, setView] = useState<"SEARCH" | "EKYC" | "CONFIRM" | "SUCCESS">("SEARCH");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<SearchFilters>({
        // Suppress known type inference limitation with optional fields in yupResolver
        // @ts-expect-error yupResolver type inference issue with optional properties (common in @hookform/resolvers v3+)
        resolver: yupResolver(searchSchema),
        defaultValues: {
            id_number: "",
            request_no: "",
            msisdn: "",
        },
        mode: "onSubmit",
    });

    const watchedValues = watch();
    const hasAnyFilter = Object.values(watchedValues).some((v) => v?.trim());

    const [searchResults, setSearchResults] = useState<Transaction[]>([]);
    // const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [pendingCardData, setPendingCardData] = useState<SmartCardData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const queryParams = {
        page: 1,
        "per-page": 10,
        ...(watchedValues.id_number?.trim() && { id_number: watchedValues.id_number.trim() }),
        ...(watchedValues.request_no?.trim() && { request_no: watchedValues.request_no.trim() }),
        ...(watchedValues.msisdn?.trim() && { msisdn: watchedValues.msisdn.trim() }),
    };

    const {
        data: apiData,
        isLoading: isSearching,
        isError,
        refetch,
    } = useFingerprintUpgradeSearch(queryParams, { enabled: false });

    useEffect(() => {
        if (apiData?.data?.items) {
            const mapped: Transaction[] = apiData.data.items.map((item: any): Transaction => ({
                id: item.id?.toString() || "",
                transactionId: item.transaction_id || item.request_no || "N/A",
                requestNo: item.request_no || "N/A",
                idNumber: item.id_number || "N/A",
                msisdn: item.msisdn || "N/A",
                cprNumber: item.id_number || "N/A", // Keep for compatibility
                planName: item.plan_name || "Unknown Plan",
                service: item.service || "prepaid",
                status: (item.status || "Open") as Transaction["status"],
                userId: item.user_id || "-",
                createdAt: item.created_at || "N/A",
                updatedAt: item.updated_at || "N/A",
                sender: item.sender || "N/A",
                requestUserId: item.request_user_id || "N/A",
                customerName: "N/A", // You may want to map real name if available
                serviceType: (item.service?.toUpperCase() || "PREPAID") as Transaction["serviceType"],
                date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A",
                amount: "N/A", // Or map from actual amount if available
            }));

            setSearchResults(mapped);
        } else if (hasAnyFilter && !isSearching && !apiData) {
            setSearchResults([]);
        }
    }, [apiData, isSearching, hasAnyFilter]);



    // Toggle individual selection
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Select/deselect all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(searchResults.map((t) => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    // Get selected transactions
    const selectedTransactions = searchResults.filter((t) => selectedIds.includes(t.id));

    // Proceed to eKYC
    const startEkyc = () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one transaction");
            return;
        }
        setView("EKYC");
    };


    // Remove the old handleEkycComplete entirely
    // Replace it with these TWO separate functions:

    const handleFingerprintVerified = (cardData: SmartCardData & { referenceId?: string }) => {
        if (cardData.referenceId) {
            setSubmissionId(cardData.referenceId);
            setView("SUCCESS");
        } else {
            // Fallback if no referenceId (should not happen)
            setView("SUCCESS");
        }
    };

    const handleProcessTransaction = async () => {
        if (!pendingCardData || selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            // Pass the array of selected transaction IDs directly
            const refId = await submitEkycRequest(selectedIds, pendingCardData);
            setSubmissionId(refId);
            setView("SUCCESS");
        } catch (err) {
            console.error(err);
            alert("Transaction processing failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };
    const resetAll = () => {
        setView("SEARCH");
        reset();                    // Clears the search form fields
        setSearchResults([]);
        setSelectedIds([]);         // ← Clear the array of selected transaction IDs
        setSubmissionId(null);
        setHasSearched(false);

    };

    const onSubmit = () => {
        setHasSearched(true);
        refetch();
    };

    const renderSearchSection = () => (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    Fingerprint Upgrade Transaction Search
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CPR / ID Number
                            </label>
                            <input
                                type="text"
                                {...register("id_number")}
                                placeholder="e.g. C123211"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow ${errors.id_number ? "border-red-500 ring-1 ring-red-300" : "border-gray-300"}
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Request Number
                            </label>
                            <input
                                type="text"
                                {...register("request_no")}
                                placeholder="e.g. 12345678"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow ${errors.id_number ? "border-red-500 ring-1 ring-red-300" : "border-gray-300"}
                                    `}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                MSISDN
                            </label>
                            <input
                                type="text"
                                {...register("msisdn")}
                                placeholder="e.g. 123456789"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow ${errors.id_number ? "border-red-500 ring-1 ring-red-300" : "border-gray-300"}
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Show validation errors */}
                    {(errors.id_number || errors.root) && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">
                                {errors.id_number?.message || errors.root?.message}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">

                        </div>

                        <button
                            type="submit"
                            className={`px-8 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all
                ${isSearching
                                    ? "bg-brand-500 cursor-wait"
                                    : "bg-brand-500 hover:bg-brand-600 shadow-lg hover:shadow-xl cursor-pointer"
                                }`}
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Search
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {isError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span>Search failed. Please check your connection and try again.</span>
                    </div>
                )}
            </div>
            {searchResults.length > 0 && (
                <TransactionList
                    transactions={searchResults}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelection}
                    onSelectAll={handleSelectAll}
                    onProceed={startEkyc}
                    isError={isError}
                />
            )}



            {hasSearched && searchResults.length === 0 && !isSearching && !isError && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-500">
                    <p className="text-lg">No transactions found matching your criteria.</p>
                </div>
            )}
        </div>
    );

    const renderSuccess = () => (
        <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-gray-600 mb-8">
                Fingerprint upgrade request has been successfully processed.
            </p>


            <button
                onClick={resetAll}
                className="w-full py-4 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center justify-center gap-3 text-lg font-medium transition"
            >
                <RefreshCcw className="w-5 h-5" />
                Process Next Customer
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8">
                {view === "SEARCH" && renderSearchSection()}

                {view === "EKYC" && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <button
                            onClick={() => setView("SEARCH")}
                            className="mb-8 flex items-center text-gray-600 hover:text-gray-900 font-medium"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Search
                        </button>

                        <EkycWizard
                            onCancel={() => setView("SEARCH")}
                            selectedTransactions={selectedTransactions}  // ← Correct: pass the array
                            onComplete={handleFingerprintVerified}
                        />

                    </div>
                )}


                {view === "CONFIRM" && (
                    <div className="max-w-2xl mx-auto mt-10 animate-in fade-in duration-500">
                        <button
                            onClick={() => setView("EKYC")}
                            className="mb-8 flex items-center text-gray-600 hover:text-gray-900 font-medium"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Fingerprint Scan
                        </button>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            {/* ... rest of the CONFIRM UI from change #7 ... */}
                        </div>
                    </div>
                )}

                {view === "SUCCESS" && renderSuccess()}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
                    © 2025 Telecom Provider — System v2.1.0
                </div>
            </footer>
        </div>
    );
};

export default EkycContainer;









