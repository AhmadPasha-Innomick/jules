import React, { use, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const BYPASS_GOVT_API = false;
const BYPASS_FINGERPRINT = false;

import {
    CreditCard,
    Fingerprint,
    Loader2,
    CheckCircle,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { SmartCardData, EkycStep } from "@/types/types";
import { useCreateFpTransaction } from "@/hooks/useCreateFpUpgradeTransaction";
import { useVerifyFpStatus, useFinalTransactionCreate } from "@/hooks/useApi"
import { FP_SERVER_URL, API_BASE_URL } from "@/config";
import IDImageInput from "../common/IDImageInput";
const NBIS_PROXY_URL = "/api/nbis/fingerprint-verify";
interface Transaction {
    transactionId?: string;
    requestNo?: string;
    msisdn?: string;
}

interface EkycWizardProps {
    onComplete: (data: SmartCardData & { referenceId?: string }) => void;
    onCancel: () => void;
    selectedTransactions: Transaction[]; // ← Multi-select support
}
const fingerMap: Record<string, string> = {
    L1: "left thumb",
    L2: "left index",
    L3: "left middle",
    L4: "left ring",
    L5: "left pinky",
    R1: "right thumb",
    R2: "right index",
    R3: "right middle",
    R4: "right ring",
    R5: "right pinky",
};
const EkycWizard: React.FC<EkycWizardProps> = ({
    onComplete,
    onCancel,
    selectedTransactions,
}) => {
    const [step, setStep] = useState<EkycStep>(EkycStep.IDLE);
    const [cardData, setCardData] = useState<SmartCardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fingerdetails, setFingerdetails] = useState<string | null>(null);
    const [isFingerprintMatched, setIsFingerprintMatched] = useState<boolean | null>(null); // Add this state
    const [fingerprintBase64, setFingerprintBase64] = useState<string | null>(null);
    const [nbisAuth, setNbisAuth] = useState<{
        id: string;
        keyid: string;
        signature: string;
        timestamp: number;
    } | null>(null);
    // Fingerprint states
    const [fpStatus, setFpStatus] = useState<string>("");
    const [fpStatusColor, setFpStatusColor] = useState<"black" | "red" | "green" | "blue">("black");
    const [currentOpId, setCurrentOpId] = useState<string | null>(null);
    const [hasTemplate, setHasTemplate] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const {
        createTransaction,
        loading: transactionLoading,
        error: transactionError,
        resetError: resetTransactionError,
    } = useCreateFpTransaction();
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);



    const {
        mutate: verifyFpStatus,
        isPending: verifyingStatus,
        error: verifyError,
        data: verifyData,
        isSuccess: verifySuccess,
        reset: resetVerifyError
    } = useVerifyFpStatus();

    const {
        mutate: createFinalTransaction,
        isPending: finalTransactionLoading,
        error: finalTransactionError,
        data: finalTransactionData,
        isSuccess: finalTransactionSuccess,
        reset: resetFinalTransactionError
    } = useFinalTransactionCreate();

    // Handle verify FP status success/error
    useEffect(() => {


        if (verifySuccess && verifyData) {
            if (!verifyData?.json?.data) {
                setError("Invalid government response");
                setFpStatus("Verification failed");
                return;
            }


            // Handle success - response is the full API response from government
            const govtTransactionId = verifyData?.json?.data?.transactionId;
            if (!govtTransactionId) {
                setError("No transaction ID received from government verification");
                setFpStatus("Verification failed");
                return;
            }

            // Now call the final FP Upgrade transaction
            const orders = selectedTransactions.map((tx) => ({
                transaction_id: tx.transactionId || tx.requestNo || "",
                amount: "0",
                advance_payment: "0",
            }));
            const mobile_number = selectedTransactions[0]?.msisdn || "";
            const finalPayload = {
                internal_transaction_id: govtTransactionId,
                email: "",
                mobile_number,
                orders,
                payment: [],
                attachments: [],
            };


            // Call the final transaction creation API
            handleFinalTransaction(finalPayload);
        }
    }, [verifySuccess, verifyData, selectedTransactions]);

    useEffect(() => {
        if (verifyError) {
            // Handle error
            const msg = (verifyError as Error).message || "Government verification failed";
            setError(msg);
            setFpStatus(msg);
        }
    }, [verifyError]);

    // Handle final transaction success/error
    useEffect(() => {
        if (finalTransactionSuccess && finalTransactionData) {

            updateFpStatus("Transaction completed successfully!", "green");


            // Complete the wizard with the reference ID from the final transaction
            if (finalTransactionData.reference_id && cardData) {
                onComplete({ ...cardData, referenceId: finalTransactionData.reference_id });
            } else {
                onComplete({ ...cardData!, referenceId: finalTransactionData.internal_transaction_id || "unknown" });
            }
        }
    }, [finalTransactionSuccess, finalTransactionData, cardData, onComplete]);

    useEffect(() => {
        if (finalTransactionError) {
            console.error("Final transaction error:", finalTransactionError);
            const errorMsg = (finalTransactionError as Error).message || "Failed to process final transaction";
            setError(errorMsg);
            updateFpStatus(errorMsg, "red");
        }
    }, [finalTransactionError]);

    // Handle final transaction creation
    const handleFinalTransaction = async (payload: any) => {
        setError(null);
        resetFinalTransactionError?.();
        updateFpStatus("Processing final transaction...", "blue");


        createFinalTransaction(payload);
    };

    const updateFpStatus = (msg: string, color: "red" | "green" | "blue" | "black" = "black") => {
        setFpStatus(msg);
        setFpStatusColor(color);
    };
    const drawFingerFrame = (frameBytes: Uint8Array, width: number, height: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const imgData = ctx.createImageData(width, height);
        for (let i = 0; i < frameBytes.length; i++) {
            imgData.data[4 * i] = frameBytes[i];
            imgData.data[4 * i + 1] = frameBytes[i];
            imgData.data[4 * i + 2] = frameBytes[i];
            imgData.data[4 * i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    };
    // Futronic polling (active version)
    const pollFutronicOperation = async (opId: string) => {
        try {
            const resp = await fetch(`${FP_SERVER_URL}/${opId}`);
            if (!resp.ok) throw new Error();
            const data = await resp.json();
            if (!data) {
                throw new Error("Empty scanner response");
            }

            if (data.state === "done") {
                setIsLoading(false);
                if (data.status === "success") {
                    updateFpStatus("Fingerprint captured successfully", "green");
                    setHasTemplate(true);
                    // === NEW: Fetch ISO template and convert to base64 ===
                    const fetchTemplate = async () => {
                        try {
                            const templateResp = await fetch(`${FP_SERVER_URL}/${opId}/template`);
                            if (!templateResp.ok) throw new Error("Failed to fetch template");
                            const isoBuffer = await templateResp.arrayBuffer();
                            const isoBytes = new Uint8Array(isoBuffer);
                            // Convert to base64
                            let binary = '';
                            isoBytes.forEach(byte => binary += String.fromCharCode(byte));
                            const base64 = btoa(binary);
                            if (!isValidBase64(base64)) {
                                throw new Error("Generated base64 is invalid");
                            }
                            setFingerprintBase64(base64);

                        } catch (err) {
                            console.error("Failed to get fingerprint template as base64:", err);
                            updateFpStatus("Fingerprint captured but template unavailable", "red");
                        }
                    };
                    fetchTemplate();
                    setStep(EkycStep.FINGERPRINT_VERIFIED);
                } else {
                    updateFpStatus(data?.errorstr || "Capture failed", "red");

                    setStep(EkycStep.CARD_READ_SUCCESS);
                }
                return;
            }
            // if (data.state === "done") {
            //     setIsLoading(false);
            //     if (data.status === "success") {
            //         updateFpStatus("Fingerprint captured successfully", "green");
            //         setHasTemplate(true);
            //         setStep(EkycStep.FINGERPRINT_VERIFIED);
            //     } else {
            //         updateFpStatus(data.errorstr || "Capture failed", "red");
            //         setStep(EkycStep.CARD_READ_SUCCESS);
            //     }
            //     return;
            // }
            if (data.fingercmd === "puton") {
                updateFpStatus("Place finger on scanner", "red");
            } else if (data.fingercmd === "takeoff") {
                updateFpStatus("Remove finger", "red");
            }
            const imgResp = await fetch(`${FP_SERVER_URL}/${opId}/image`);
            if (imgResp.ok) {
                const buffer = await imgResp.arrayBuffer();
                drawFingerFrame(new Uint8Array(buffer), Number(data.devwidth || 320), Number(data.devheight || 480));
            }
            setTimeout(() => pollFutronicOperation(opId), 800);
        } catch {
            updateFpStatus("Scanner disconnected", "red");
            setIsLoading(false);
            setStep(EkycStep.CARD_READ_SUCCESS);
        }
    };
    const startFutronicEnroll = async () => {
        if (!cardData) return;
        setStep(EkycStep.SCANNING_FINGERPRINT);
        setIsLoading(true);
        setHasTemplate(false);
        updateFpStatus("Initializing fingerprint scanner...", "blue");
        if (BYPASS_FINGERPRINT) {
            setTimeout(() => {
                setHasTemplate(true);
                setIsFingerprintMatched(true);
                setStep(EkycStep.FINGERPRINT_VERIFIED);
                updateFpStatus("Fingerprint bypassed (NBIS skipped)", "green");
                setIsLoading(false);
            }, 800);
            return;
        }
        try {
            const payload = {
                operation: "enroll",
                username: `user_${cardData.cprNumber.replace(/[^a-zA-Z0-9]/g, "")}`,
                usedlib: "ansisdk",
                isoconv: "1",
                samplenum: "1",
            };
            const resp = await fetch(FP_SERVER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error("Failed to start fingerprint operation");
            const data = await resp.json();
            setCurrentOpId(data.id);
            pollFutronicOperation(data.id);
        } catch (err: any) {
            updateFpStatus(err.message || "Scanner connection failed", "red");
            setIsLoading(false);
            setStep(EkycStep.CARD_READ_SUCCESS);
        }
    };

    // BioMini Web Agent Fingerprint Scanner
    // const startBioMiniScan = async () => {
    //     if (!cardData) return;
    //     setStep(EkycStep.SCANNING_FINGERPRINT);
    //     setIsLoading(true);
    //     setHasTemplate(false);
    //     updateFpStatus("Initializing BioMini scanner...", "blue");

    //     const BIOMINI_AGENT_URL = "http://localhost:8084";
    //     let deviceHandle: string | null = null;

    //     const apiCall = async (endpoint: string, params: Record<string, any> = {}) => {
    //         const url = new URL(`${BIOMINI_AGENT_URL}${endpoint}`);
    //         // Add a dummy param to prevent caching
    //         url.searchParams.append("dummy", Math.random().toString());

    //         Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    //         try {
    //             const response = await fetch(url.toString());
    //             if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    //             return await response.json();
    //         } catch (error: any) {
    //             console.error("API Error:", error.message);
    //             throw error;
    //         }
    //     };

    //     let currentTransactionId: string | null = null;

    //     try {
    //         // 1. Initialize Device
    //         updateFpStatus("Initializing device...", "blue");
    //         const initRes = await apiCall("/api/initDevice");

    //         // Fix: Use loose equality (!=) to handle string "0"
    //         if (initRes.retValue != 0) throw new Error(`Init failed: ${initRes.retString}`);

    //         // Get the first available scanner
    //         const scanner = initRes.ScannerInfos?.[0];
    //         currentTransactionId = scanner?.ScannerName || null;
    //         if (!scanner) throw new Error("No scanner found.");

    //         deviceHandle = scanner.DeviceHandle;
    //         updateFpStatus(`Scanner ready: ${scanner.ScannerName}`, "blue");

    //         // 1.5. Set ISO Format (CRITICAL)
    //         // We must tell the device that when we ask for a template, 
    //         // we want ISO 19794-2 (Value 2002).
    //         updateFpStatus("Configuring device for ISO format...", "blue");
    //         const paramRes = await apiCall("/api/setParameters", {
    //             sHandle: deviceHandle,
    //             templateType: 2002, // 2002 = ISO 19794-2 Format
    //             securitylevel: 3,   // Standard security
    //             detectFakeAdvancedMode: 1
    //         });

    //         if (paramRes.retValue != 0) {
    //             console.warn(`Warning: Could not set ISO format (${paramRes.retString})`);
    //         } else {

    //         }

    //         // 2. Capture Single Finger (No Polling Needed!)
    //         // captureSingle will wait/hang until user places finger or timeout occurs
    //         updateFpStatus("Place finger on sensor...", "blue");
    //         const captureRes = await apiCall('/api/captureSingle', {
    //             sHandle: deviceHandle,
    //             id: currentTransactionId,
    //             resetTimer: 30000 // Wait up to 30 seconds for a finger
    //         });

    //         // If we get here, capture is done (either success or failed)
    //         if (captureRes.retValue != 0) {
    //             throw new Error(`Capture failed: ${captureRes.retString}`);
    //         }


    //         // 3. Retrieve ISO Template (FMR Data)
    //         updateFpStatus("Extracting ISO template...", "blue");
    //         const tplRes = await apiCall("/api/getTemplateData", {
    //             sHandle: deviceHandle,
    //             id: currentTransactionId,
    //             // Mandatory parameters to prevent "wrong parameter" error
    //             encrypt: 0,           // 0 = No Encryption
    //             encryptKey: "",       // Empty string
    //             extractEx: 0,         // 0 = Standard Extraction
    //             qualityLevel: 1       // 1 = None (Standard)
    //         });

    //         if (tplRes.retValue != 0) {
    //             throw new Error(`Get Template failed: ${tplRes.retString}`);
    //         }

    //         setFingerprintBase64(tplRes.templateBase64);
    //         setHasTemplate(true);


    //         // 4. Retrieve BMP for Preview
    //         try {
    //             const bmpRes = await apiCall("/api/getImageData", {
    //                 sHandle: deviceHandle,
    //                 id: currentTransactionId,
    //                 fileType: 1, // 1 is BMP
    //                 compressionRatio: 1.0
    //             });

    //             if (bmpRes.retValue == 0) {
    //                 // Draw BMP preview to canvas if available
    //                 const canvas = canvasRef.current;
    //                 if (canvas) {
    //                     const img = new Image();
    //                     img.onload = () => {
    //                         const ctx = canvas.getContext("2d");
    //                         if (ctx) {
    //                             canvas.width = img.width;
    //                             canvas.height = img.height;
    //                             ctx.drawImage(img, 0, 0);
    //                         }
    //                     };
    //                     img.src = `data:image/bmp;base64,${bmpRes.imageBase64}`;
    //                 }
    //             }
    //         } catch (previewErr) {
    //             console.warn("Could not retrieve BMP preview:", previewErr);
    //         }

    //         updateFpStatus("Fingerprint captured successfully", "green");
    //         setStep(EkycStep.FINGERPRINT_VERIFIED);
    //     } catch (err: any) {
    //         updateFpStatus(err.message || "Scanner error", "red");
    //         console.error("BioMini Scan Error:", err);
    //         if (err.message && err.message.includes("Timeout")) {
    //             updateFpStatus("Scan timed out. Please place your finger sooner.", "red");
    //         }
    //         setStep(EkycStep.CARD_READ_SUCCESS);
    //     } finally {
    //         // Always uninit to release the device lock
    //         if (deviceHandle) {
    //             try {
    //                 await apiCall("/api/uninitDevice");

    //             } catch (uninitErr) {
    //                 console.warn("Failed to uninitialize device:", uninitErr);
    //             }
    //         }
    //         setIsLoading(false);
    //     }
    // };
    const verifyFingerprintWithNBIS = async () => {

        if (!cardData) return;
        // if (!fingerprintBase64) {
        //     throw new Error("Fingerprint data not available");
        // }
        // const binaryString = atob(fingerprintBase64);
        // const bytes = new Uint8Array(binaryString.length);
        // for (let i = 0; i < binaryString.length; i++) {
        //     bytes[i] = binaryString.charCodeAt(i);
        // }

        updateFpStatus("Verifying with NBIS...", "blue");
        try {
            const templateResp = await fetch(`${FP_SERVER_URL}/${currentOpId}/template`);
            if (!templateResp.ok) throw new Error("Template not available");
            const isoBuffer = await templateResp.arrayBuffer();

            const verifyResp = await fetch(
                `${NBIS_PROXY_URL}?cpr=${encodeURIComponent(cardData.cprNumber)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/octet-stream" },
                    body: isoBuffer,
                }
            );

            const resultData = await verifyResp.json();


            if (!verifyResp.ok || !resultData.success) {
                throw new Error(resultData.message || "NBIS verification failed");
            }

            if (resultData.result === true || resultData.data?.result === true) {
                updateFpStatus("Fingerprint matched with NBIS", "green");
                setIsFingerprintMatched(true);

                // Prefer top-level authorization if present, or fall back to nested
                const auth = resultData.authorization || resultData.data?.authorization;
                if (auth) {
                    setNbisAuth({
                        id: auth.id,
                        keyid: auth.keyid,
                        signature: auth.signature,
                        timestamp: auth.timestamp,
                    });

                }
            } else {
                updateFpStatus("Fingerprint NOT matched", "red");
                setIsFingerprintMatched(false);
                console.warn("⚠️ No authorization object found in response");
            }
        } catch (err: any) {
            updateFpStatus(err.message || "NBIS error", "red");
            setIsFingerprintMatched(false);
            console.error("💥 NBIS verification error:", err);
        }
    };
    // Cleanup
    useEffect(() => {
        return () => {
            if (currentOpId) {
                fetch(`${FP_SERVER_URL}/${currentOpId}`, { method: "DELETE" }).catch(() => { });
            }
        };
    }, [currentOpId]);
    const isValidBase64 = (str: string | null): boolean => {
        if (!str) return false;
        try {
            // Check if it's valid Base64 format
            const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
            if (!base64Regex.test(str)) return false;
            // Try decoding to confirm it's valid
            atob(str);
            return true;
        } catch (e) {
            return false;
        }
    };
    const handleReadCard = async () => {
        setError(null);
        setIsLoading(true);
        setStep(EkycStep.READING_CARD);

        const transactionCpr = (selectedTransactions[0] as any)?.cprNumber
        if (!transactionCpr) {
            setError("No CPR number found in selected transaction(s)");
            setStep(EkycStep.IDLE);
            setIsLoading(false);
            return;
        }
        try {
            const resp = await fetch(`http://localhost:5050/api/operation/ReadCard`, {
                method: "POST",
                body: JSON.stringify({
                    ReadCardInfo: true,
                    ReadPersonalInfo: true,
                    ReadAddressDetails: true,
                    ReadBiometrics: true,
                    ReadEmploymentInfo: true,
                    ReadImmigrationDetails: true,
                    ReadTrafficDetails: true,
                    SilentReading: false,
                    ReaderIndex: -1,
                    ReaderName: "",
                    OutputFormat: "XML",
                    ValidateCard: false,
                }),
            });
            if (!resp.ok) throw new Error(`Read failed: ${resp.status}`);
            const xmlText = await resp.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "text/xml");
            const getTag = (tag: string) => xml.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
            const getItemValue = (section: string, key: string) => {
                const sec = xml.getElementsByTagName(section)[0];
                if (!sec) return "";
                const items = sec.getElementsByTagName("item");
                for (let i = 0; i < items.length; i++) {
                    if (items[i].getAttribute("key") === key) {
                        return items[i].getAttribute("value") ?? "";
                    }
                }
                return "";
            };
            const cpr = getTag("CPRNO") || getTag("IdNumber") || "";
            const serial = getTag("CardSerialNumber") || getTag("CardSerialHex") || "";
            const fullName = getTag("EnglishFullName") || `${getTag("FirstNameEnglish")} ${getTag("LastNameEnglish")}`.trim();
            const firstname = getItemValue("MiscellaneousTextData", "FirstNameEnglish") || getTag("EnglishFirstName") || "";
            const lastname = getItemValue("MiscellaneousTextData", "LastNameEnglish") || getTag("EnglishLastName") || "";
            const dob = getTag("BirthDate") || getTag("DateOfBirth");
            const expiry = getTag("CardexpiryDate") || getTag("ExpiryDate");
            const photoB64 = getTag("Photo");
            const nationality = getItemValue("MiscellaneousTextData", "Nationality") || getTag("NationalityCode") || "";
            const nationalityCode = getItemValue("MiscellaneousTextData", "Alpha3Code");
            const occupation = getItemValue("MiscellaneousTextData", "OccupationDescription1");
            const gender = getTag("Gender");
            const photoUrl = photoB64
                ? `data:image/jpeg;base64,${photoB64}`
                : `https://picsum.photos/seed/${cpr}/300`;
            if (!cpr || !serial) throw new Error("Missing CPR or Serial");
            if (cpr !== transactionCpr) {
                setError("Your ID Number not matched");
                setStep(EkycStep.IDLE);
                setCardData(null); // Clear any partial data
                setIsLoading(false);
                return;
            }
            const statusResp = await fetch(`/api/nbis/card-status?cpr=${cpr}&serial=${serial}`);
            if (!statusResp.ok) throw new Error("NBIS proxy failed");
            const statusJson = await statusResp.json();
            if (!statusJson.success) throw new Error(statusJson.message || "Card invalid");
            const nbisResult = statusJson.data;
            if (nbisResult?.metadata?.finger1Handcode) {
                const finger1Name = fingerMap[nbisResult.metadata.finger1Handcode] || nbisResult.metadata.finger1Handcode;
                setFingerdetails(finger1Name);
            }
            setCardData({
                cardNumber: serial,
                fullName,
                cprNumber: cpr,
                dateOfBirth: dob || "N/A",
                expiryDate: expiry || "N/A",
                gender: gender || "N/A",
                nationality: nationality || "N/A",
                nationalityCode: nationalityCode || "N/A",
                occupation: occupation || "N/A",
                photoUrl,
                FirstNameEnglish: firstname || "",
                LastNameEnglish: lastname || "",
                GovernorateNo: Number(getTag("GovernorateNo")) || 0,
            });
            setStep(EkycStep.CARD_READ_SUCCESS);
        } catch (e: any) {
            setError(e.message || "Failed to read card");
            setStep(EkycStep.IDLE);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcessTransaction = async () => {
        if (!cardData || selectedTransactions.length === 0) {
            setError("No card data or transactions selected");
            return;
        }
        if (!idFront || !idBack) {
            setError("Please upload ID images before proceeding.");
            return;
        }
        setError(null);
        resetTransactionError();
        resetVerifyError?.(); // optional, clears previous error
        // Prepare payload for government verification status check
        const cleanBase64 = (base64: string | null): string | null => {
            if (!base64) return null;
            return base64.includes(',') ? base64.split(',')[1] : base64;
        };
        const verificationPayload = {
            cpr_number: cardData.cprNumber,
            name: cardData.fullName,
            first_name: cardData.FirstNameEnglish || "", // optional: split fullName if required
            last_name: cardData.LastNameEnglish || "",
            id_front_base64: cleanBase64(idFront) || "", // You can add photo if needed later
            id_back_base64: cleanBase64(idBack) || "",
            fingerprint_base64: fingerprintBase64 || "", // ← THIS IS THE KEY
            gender: cardData.gender || "",
            dob: cardData.dateOfBirth
                ? dayjs(cardData.dateOfBirth, "DD/MM/YYYY").format("YYYY-MM-DD")
                : "",
            id_expiry_date: cardData.expiryDate
                ? dayjs(cardData.expiryDate, "DD/MM/YYYY").format("YYYY-MM-DD")
                : "",
            nationality: cardData.nationality || "",
            serial_number: cardData.cardNumber || "",
            client_timestamp: new Date().toISOString(),
            auth_id: nbisAuth?.id || "",
            auth_key_id: nbisAuth?.keyid || "",
            signature: nbisAuth?.signature || "",
            server_timestamp: nbisAuth?.timestamp ? new Date(nbisAuth.timestamp).toISOString() : new Date().toISOString(),
            flat_no: "",
            building_no: "",
            road_no: "",
            block_no: "",
            governerete: cardData.GovernorateNo || 0,
            city: "",
            passport_number: "",
            passport_issue_date: "",
            passport_expiry_date: "",
            labor_force_participation: "",
            employment_id: "",
            card_occupation: "",
        };
        verifyFpStatus(verificationPayload);
    };
    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
                    <div className={`flex flex-col items-center ${cardData ? "text-brand-500" : "text-gray-500"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${cardData ? "bg-brand-500 text-white" : "bg-white"}`}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Smart Card</span>
                    </div>
                    <div className={`flex flex-col items-center ${step >= EkycStep.FINGERPRINT_VERIFIED ? "text-green-600" : cardData ? "text-brand-500" : "text-gray-400"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step >= EkycStep.FINGERPRINT_VERIFIED ? "bg-green-600 text-white" : "bg-white"}`}>
                            <Fingerprint className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Biometric</span>
                    </div>
                    <div className={`flex flex-col items-center ${step >= EkycStep.FINGERPRINT_VERIFIED ? "text-brand-500" : "text-gray-400"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step >= EkycStep.FINGERPRINT_VERIFIED ? "bg-brand-500 text-white" : "bg-white"}`}>
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Submit</span>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Card Reading Screen */}
                {(!cardData || step === EkycStep.READING_CARD) && (
                    <div className="p-8 text-center space-y-6">
                        <h3 className="text-2xl font-bold text-gray-800">Insert Bahraini Smart Card</h3>
                        <p className="text-gray-500">Insert card into reader to begin validation.</p>
                        <div className="py-8 flex justify-center">
                            <div className={`w-48 h-32 bg-gradient-to-r from-blue-500 to-brand-700 rounded-xl shadow-inner flex items-center justify-center ${isLoading ? "animate-pulse" : ""}`}>
                                <div className="w-12 h-10 bg-yellow-400 rounded opacity-80 ml-4 mb-4 self-end"></div>
                                <div className="absolute top-4 left-4 text-white/50 text-xs">Bahrain ID</div>
                            </div>
                        </div>
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button onClick={onCancel} className="px-6 py-3 border rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                Back
                            </button>
                            <button
                                onClick={handleReadCard}
                                disabled={isLoading}
                                className="px-8 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                                Validate Smart Card
                            </button>
                        </div>
                    </div>
                )}
                {/* Main Flow After Card Read */}
                {cardData && step !== EkycStep.READING_CARD && (
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Card + Selected Transactions */}
                        <div className="lg:w-1/2 p-6 bg-gray-50 lg:border-r">
                            <h4 className="text-sm uppercase text-gray-500 font-bold mb-4">Card Details</h4>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <img src={cardData?.photoUrl} alt="Photo" className="w-24 h-24 rounded-lg object-cover border" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-bold text-gray-900">{cardData?.fullName}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-xs text-gray-500 uppercase">Nationality</p><p>{cardData?.nationalityCode}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase">Gender</p><p>{cardData?.gender}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase">CPR Number</p><p className="font-mono">{cardData?.cprNumber}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase">Expiry</p><p className="text-green-700">{cardData?.expiryDate}</p></div>
                                </div>
                                {(step === EkycStep.SCANNING_FINGERPRINT || step === EkycStep.FINGERPRINT_VERIFIED)
                                    && (
                                        <div className="mt-4">
                                            {/* IDImageInput component for ID images */}
                                            <>
                                                <IDImageInput
                                                    label="ID Front"
                                                    value={idFront}
                                                    onChange={setIdFront}
                                                />
                                                <IDImageInput
                                                    label="ID Back"
                                                    value={idBack}
                                                    onChange={setIdBack}
                                                />
                                            </>
                                        </div>
                                    )}

                            </div>
                        </div>
                        {/* Right: Fingerprint Section */}
                        <div className="lg:w-1/2 p-8 flex flex-col items-center justify-center text-center">
                            {step === EkycStep.CARD_READ_SUCCESS && (
                                <>
                                    <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                                        <Fingerprint className="w-12 h-12 text-brand-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Verify Fingerprint</h3>
                                    {fingerdetails && (
                                        <h2 className="mb-4 text-green-500 text-xl ">
                                            Please scan your  <span className="font-bold">{fingerdetails}</span>
                                        </h2>
                                    )}
                                    <button
                                        onClick={startFutronicEnroll}
                                        disabled={isLoading}
                                        className="px-8 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-60"
                                    >
                                        {isLoading ? "Starting Scanner..." : "Scan Fingerprint"}
                                    </button>
                                </>
                            )}
                            {step === EkycStep.SCANNING_FINGERPRINT && (
                                <div className="space-y-6 w-full max-w-sm">
                                    <canvas
                                        ref={canvasRef}
                                        className="mx-auto border-4 border-brand-200 rounded-lg shadow-lg"
                                        style={{ maxWidth: "300px", width: "100%" }}
                                    />
                                    <p className={`text-lg font-medium`} style={{
                                        color: fpStatusColor === "red" ? "#dc2626" :
                                            fpStatusColor === "green" ? "#16a34a" :
                                                fpStatusColor === "blue" ? "#2563eb" : "#000"
                                    }}>
                                        {fpStatus || "Scanning..."}
                                    </p>
                                </div>
                            )}
                            {step === EkycStep.FINGERPRINT_VERIFIED && (
                                <div className="space-y-8 w-full max-w-md">
                                    <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-16 h-16 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Fingerprint Captured!</h3>
                                        <p className="text-gray-600 mt-2">Ready to process {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? "s" : ""}.</p>
                                    </div>
                                    <div className="space-y-4 w-full">
                                        {/* "Verify with NBIS" button - hidden after successful verification isFingerprintMatched === null */}
                                        {true && (
                                            <button
                                                onClick={verifyFingerprintWithNBIS}
                                                disabled={!hasTemplate}
                                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
                                            >
                                                Verify with NBIS
                                            </button>
                                        )}
                                        {fpStatus && (
                                            <p className={`text-center font-medium`} style={{
                                                color: fpStatusColor === "red" ? "#dc2626" :
                                                    fpStatusColor === "green" ? "#16a34a" :
                                                        fpStatusColor === "blue" ? "#2563eb" : "#000"
                                            }}>
                                                {fpStatus}
                                            </p>
                                        )}
                                        {transactionError && (
                                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                {transactionError}
                                            </div>
                                        )}
                                        {isFingerprintMatched && (
                                            <div className="space-y-4 w-full">

                                                {(verifyError || error) && (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5" />
                                                        {(verifyError as Error).message || error || "Verification failed"}
                                                    </div>
                                                )}
                                                {/* Show error from final transaction */}
                                                {finalTransactionError && (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5" />
                                                        {(finalTransactionError as Error).message || "Final transaction failed"}
                                                    </div>
                                                )}
                                                {/* Show error from final transaction */}
                                                {transactionError && (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5" />
                                                        {transactionError}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={handleProcessTransaction}
                                                    disabled={transactionLoading || verifyingStatus || finalTransactionLoading}
                                                    className="w-full px-10 py-5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:scale-100"
                                                >
                                                    {transactionLoading || verifyingStatus || finalTransactionLoading ? (
                                                        <>
                                                            <Loader2 className="w-6 h-6 animate-spin mr-3 inline" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Process Transaction"
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default EkycWizard;