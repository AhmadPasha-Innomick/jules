"use client";

import React, { useState, useEffect } from "react";
import { Transaction, SmartCardData } from "@/types/types";
import { submitEkycRequest } from "@/app/(admin)/(others-pages)/subscribe_fingerprint_update/mockService";
import TransactionList from "@/components/ekyc/TransactionList";
import EkycWizard from "@/components/order-ekyc/EkycWizard";
import FutronicDemo from "@/app/(admin)/(others-pages)/subscribe_fingerprint_update/FutronicsDemo";

import {
  Search,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  PackageCheck,
  XCircle,
  RefreshCcw,
  LogOut,
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

const searchSchema = yup
  .object({
    id_number: yup.string().optional(),
    request_no: yup.string().optional(),
    msisdn: yup.string().optional(),
  })
  .test(
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
        path: "id_number", // Error appears on CPR field
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
  const [view, setView] = useState<"SEARCH" | "EKYC" | "CONFIRM" | "SUCCESS">(
    "EKYC"
  );

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
  const [pendingCardData, setPendingCardData] = useState<SmartCardData | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [wizardKey, setWizardKey] = useState(0); // ← ADD THIS LINE

  const queryParams = {
    page: 1,
    "per-page": 10,
    ...(watchedValues.id_number?.trim() && {
      id_number: watchedValues.id_number.trim(),
    }),
    ...(watchedValues.request_no?.trim() && {
      request_no: watchedValues.request_no.trim(),
    }),
    ...(watchedValues.msisdn?.trim() && {
      msisdn: watchedValues.msisdn.trim(),
    }),
  };

  const {
    data: apiData,
    isLoading: isSearching,
    isError,
    refetch,
  } = useFingerprintUpgradeSearch(queryParams, { enabled: false });

  useEffect(() => {
    if (apiData?.data?.items) {
      const mapped: Transaction[] = apiData.data.items.map(
        (item: any): Transaction => ({
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
          serviceType: (item.service?.toUpperCase() ||
            "PREPAID") as Transaction["serviceType"],
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "N/A",
          amount: "N/A", // Or map from actual amount if available
        })
      );

      setSearchResults(mapped);
    } else if (hasAnyFilter && !isSearching && !apiData) {
      setSearchResults([]);
    }
  }, [apiData, isSearching, hasAnyFilter]);

  // const toggleSelection = (id: string) => {
  //     setSelectedIds((prev) =>
  //         prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //     );
  // };
  // const toggleSelection = (id: string) => {
  //     setSelectedId((prev) => (prev === id ? null : id));
  // };

  // const selectedTransaction = searchResults.find(t => t.id === selectedId) || null;
  // const startEkyc = () => {
  //     if (!selectedId) {
  //         alert("Please select a transaction");
  //         return;
  //     }
  //     setView("EKYC");
  // };

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
  const selectedTransactions = searchResults.filter((t) =>
    selectedIds.includes(t.id)
  );

  // Proceed to eKYC
  const startEkyc = () => {
    // if (selectedIds.length === 0) {
    //     alert("Please select at least one transaction");
    //     return;
    // }
    setView("EKYC");
  };

  // Remove the old handleEkycComplete entirely
  // Replace it with these TWO separate functions:

  const handleFingerprintVerified = (
    { referenceId }: { referenceId?: string }
  ) => {
    if (referenceId) {
      setSubmissionId(referenceId);
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
    setView("EKYC");
    setWizardKey((prev) => prev + 1);
    reset(); // Clears the search form fields
    setSearchResults([]);
    setSelectedIds([]); // ← Clear the array of selected transaction IDs
    setSubmissionId(null);
    setHasSearched(false);
    // setPendingCardData(null); // ← Remove this line entirely (no longer used)
  };

  // const handleProcessTransaction = async () => {
  //     if (!pendingCardData || !selectedId) return;

  //     setIsProcessing(true);
  //     try {
  //         const refId = await submitEkycRequest([selectedId!], pendingCardData);
  //         setSubmissionId(refId);
  //         setView("SUCCESS");
  //     } catch (err) {
  //         console.error(err);
  //         alert("Transaction processing failed. Please try again.");
  //     } finally {
  //         setIsProcessing(false);
  //     }
  // };

  //     const handleEkycComplete = async (cardData: SmartCardData) => {
  //         // Replace the entire handleEkycComplete function with this:
  // const handleFingerprintVerified = (cardData: SmartCardData) => {
  //     setPendingCardData(cardData);
  //     setView("CONFIRM");
  // };

  // const handleProcessTransaction = async () => {
  //     if (!pendingCardData || selectedIds.length === 0) return;

  //     setIsProcessing(true);
  //     try {
  //         const refId = await submitEkycRequest(selectedIds, pendingCardData);
  //         setSubmissionId(refId);
  //         setView("SUCCESS");
  //     } catch (err) {
  //         console.error(err);
  //         alert("Transaction processing failed. Please try again.");
  //     } finally {
  //         setIsProcessing(false);
  //     }
  // };

  //     };

  // const resetAll = () => {
  //     setView("SEARCH");
  //     reset();
  //     setSearchResults([]);
  //     setSelectedId(null);
  //     setSubmissionId(null);
  //     setHasSearched(false);
  //     setPendingCardData(null);
  // };

  const onSubmit = () => {
    setHasSearched(true);
    refetch();
  };

  const renderSearchSection = () => (
    <div className="animate-in fade-in mx-auto max-w-5xl space-y-8 duration-500">
      {/* <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
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
                            {/* <button
                                type="button"
                                onClick={() =>
                                    reset({ id_number: "V6491246", request_no: "", msisdn: "" })
                                }
                                className="text-xs px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-100 transition"
                            >
                                Test: CPR V6491246
                            </button>
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
            </div> */}
      {/* {true && (
                <TransactionList
                    transactions={searchResults}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelection}
                    onSelectAll={handleSelectAll}
                    onProceed={startEkyc}
                    isError={isError}
                />
            )} */}

      {/* {searchResults.length > 0 && (
                <TransactionList
                    transactions={searchResults}
                    selectedId={selectedId}
                    onToggleSelect={toggleSelection}
                    onProceed={startEkyc}
                    isError={isError}
                />
            )} */}

      {hasSearched &&
        searchResults.length === 0 &&
        !isSearching &&
        !isError && (
          <div className="rounded-xl border border-gray-100 bg-white py-16 text-center text-gray-500">
            <p className="text-lg">
              No transactions found matching your criteria.
            </p>
          </div>
        )}
    </div>
  );

  const renderSuccess = () => (
    <div className="animate-in zoom-in mx-auto mt-12 max-w-md rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-2xl duration-500">
      <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
        <PackageCheck className="h-12 w-12" />
      </div>
      <h2 className="mb-3 text-3xl font-black tracking-tight text-gray-900">
        Order Received!
      </h2>
      <p className="mb-8 leading-relaxed text-gray-500">
        The customers EKYC validation is complete and the mobile line
        activation request has been queued.
      </p>

      <div className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
        <p className="mb-1 text-xs font-black tracking-widest text-blue-600 uppercase">
          Order Reference
        </p>
        <p className="font-mono text-2xl font-bold text-gray-800">
          {submissionId || "N/A"}
        </p>
      </div>

      <button
        onClick={resetAll}
        className="bg-brand-500 hover:bg-brand-700 flex w-full items-center justify-center gap-3 rounded-xl py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-200"
      >
        <RefreshCcw className="h-5 w-5" /> Start New Transaction
      </button>
    </div>
  );

  const renderFailed = () => (
    <div className="animate-in zoom-in mx-auto mt-12 max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-2xl duration-500">
      <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
        <XCircle className="h-12 w-12" />
      </div>
      <h2 className="mb-3 text-3xl font-black tracking-tight text-gray-900">
        Order Failed
      </h2>
      <p className="mb-10 leading-relaxed text-gray-500">
        We encountered a system timeout during activation. The request could not
        be completed at this time.
      </p>

      <div className="flex flex-col gap-4">
        <button
          onClick={resetAll}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-red-200"
        >
          <RefreshCcw className="h-5 w-5" /> Try Again
        </button>

        <button
          onClick={resetAll}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-4 font-bold text-gray-600 transition-all hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5 text-gray-400" /> Exit and Try Another
          Transaction
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <main className="container mx-auto flex-grow px-4 py-8">
        {/* {view === "SEARCH" && renderSearchSection()} */}

        {view === "EKYC" && (
          <div className="animate-in slide-in-from-right duration-500">
            <button
              onClick={resetAll}
              className="mb-8 flex items-center font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </button>

            <EkycWizard
              key={wizardKey}
              onCancel={() => setView("SEARCH")}
              selectedTransactions={selectedTransactions} // ← Correct: pass the array
              onComplete={handleFingerprintVerified}
              onReset={resetAll}
            />
          </div>
        )}

        {view === "CONFIRM" && (
          <div className="animate-in fade-in mx-auto mt-10 max-w-2xl duration-500">
            <button
              onClick={() => setView("EKYC")}
              className="mb-8 flex items-center font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Fingerprint Scan
            </button>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
              {/* ... rest of the CONFIRM UI from change #7 ... */}
            </div>
          </div>
        )}

        {view === "SUCCESS" && renderSuccess()}
      </main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-gray-400">
          © 2025 Telecom Provider — System v2.1.0
        </div>
      </footer>
    </div>
  );
};

export default EkycContainer;
