"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { SmartCardData } from "@/types/types";
import { useVerifyFpStatus } from "@/hooks/useApi";
import { FP_SERVER_URL } from "@/config";
import { FinalActivationForm } from "@/components/order-ekyc/FinalActivationForm";
import IDImageInput from "@/components/common/IDImageInput";
import SignatureModal from "@/components/common/SignatureModal";

const NBIS_PROXY_URL = "/api/nbis/fingerprint-verify";

interface Transaction {
    transactionId?: string;
    requestNo?: string;
    msisdn?: string;
}

interface EkycWizardProps {
    onComplete: (data: SmartCardData & { referenceId?: string }) => void;
    onCancel: () => void;
    selectedTransactions: Transaction[];
    onReset?: () => void;  // ← ADD THIS LINE (with the question mark)
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

enum ExtendedEkycStep {
    IDLE = "IDLE",
    READING_CARD = "READING_CARD",
    CARD_READ_SUCCESS = "CARD_READ_SUCCESS",
    SCANNING_FINGERPRINT = "SCANNING_FINGERPRINT",
    FINGERPRINT_VERIFIED = "FINGERPRINT_VERIFIED",
    FINAL_ACTIVATION = "FINAL_ACTIVATION",
}

const EkycWizard: React.FC<EkycWizardProps> = ({
    onComplete,
    onCancel,
    selectedTransactions,
    onReset,
}) => {
    const [step, setStep] = useState<ExtendedEkycStep>(ExtendedEkycStep.IDLE);
    const [cardData, setCardData] = useState<SmartCardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fingerdetails, setFingerdetails] = useState<string | null>(null);
    const [fingerprintBase64, setFingerprintBase64] = useState<string | null>(null);
    const [nbisAuth, setNbisAuth] = useState<{
        id: string;
        keyid: string;
        signature: string;
        timestamp: number;
    } | null>(null);

    const [fpStatus, setFpStatus] = useState<string>("");
    const [fpStatusColor, setFpStatusColor] = useState<"black" | "red" | "green" | "blue">("black");
    const [currentOpId, setCurrentOpId] = useState<string | null>(null);
    const [hasTemplate, setHasTemplate] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isNbisVerified, setIsNbisVerified] = useState(false);
    const [govtTransactionId, setGovtTransactionId] = useState<string | null>(null);
   
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);
 
    const [signature, setSignature] = useState<string | null>(null);
    const [signatureModalOpen, setSignatureModalOpen] = useState(false);

    const {
        mutate: verifyFpStatus,
        isPending: verifyingStatus,
        error: verifyError,
        data: verifyData,
        isSuccess: verifySuccess,
        reset: resetVerifyError,
    } = useVerifyFpStatus();

    // Handle government verification success
    useEffect(() => {
        if (verifySuccess && verifyData) {
            const govtTransactionId = verifyData?.json?.data?.transactionId;
            if (!govtTransactionId) {
                setError("No transaction ID received from government verification");
                updateFpStatus("Verification failed", "red");
                return;
            }

            setGovtTransactionId(govtTransactionId);
            updateFpStatus("Government verification successful", "green");
            setStep(ExtendedEkycStep.FINAL_ACTIVATION);
        }
    }, [verifySuccess, verifyData]);

    // Handle government verification error
    useEffect(() => {
        if (verifyError) {
            const msg = (verifyError as Error).message || "Government verification failed";
            setError(msg);
            updateFpStatus(msg, "red");
        }
    }, [verifyError]);

    const updateFpStatus = (
        msg: string,
        color: "red" | "green" | "blue" | "black" = "black"
    ) => {
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

                    const fetchTemplate = async () => {
                        try {
                            const templateResp = await fetch(`${FP_SERVER_URL}/${opId}/template`);
                            if (!templateResp.ok) throw new Error("Failed to fetch template");
                            const isoBuffer = await templateResp.arrayBuffer();
                            const isoBytes = new Uint8Array(isoBuffer);
                            let binary = "";
                            isoBytes.forEach((byte) => (binary += String.fromCharCode(byte)));
                            const base64 = btoa(binary);
                            if (isValidBase64(base64)) {
                                setFingerprintBase64(base64);
                            }
                        } catch (err) {
                            console.error("Failed to get fingerprint template:", err);
                            updateFpStatus("Template unavailable", "red");
                        }
                    };
                    fetchTemplate();

                    setStep(ExtendedEkycStep.FINGERPRINT_VERIFIED);
                } else {
                    updateFpStatus(data.errorstr || "Capture failed", "red");
                    setStep(ExtendedEkycStep.CARD_READ_SUCCESS);
                }
                return;
            }

            if (data?.fingercmd === "puton") {
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
            setStep(ExtendedEkycStep.CARD_READ_SUCCESS);
        }
    };

    const startFutronicEnroll = async () => {
        setIsNbisVerified(false); // 🔄 reset
        setNbisAuth(null);
        if (!cardData) return;
        setStep(ExtendedEkycStep.SCANNING_FINGERPRINT);
        setIsLoading(true);
        setHasTemplate(false);
        updateFpStatus("Initializing fingerprint scanner...", "blue");

        if (BYPASS_FINGERPRINT) {
            setTimeout(() => {
                setHasTemplate(true);
                setStep(ExtendedEkycStep.FINGERPRINT_VERIFIED);
                updateFpStatus("Fingerprint bypassed", "green");
                setIsLoading(false);
            }, 800);
            return;
        }

        try {
            const payload = {
                operation: "enroll",
                username: `user_${cardData?.cprNumber?.replace(/[^a-zA-Z0-9]/g, "") || "unknown"}`,

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
            setStep(ExtendedEkycStep.CARD_READ_SUCCESS);
        }
    };

    // BioMini Web Agent Fingerprint Scanner
    // const startBioMiniScan = async () => {
    //     setIsNbisVerified(false); // 🔄 reset
    //     setNbisAuth(null);
    //     if (!cardData) return;
    //     setStep(ExtendedEkycStep.SCANNING_FINGERPRINT);
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
    //         setStep(ExtendedEkycStep.FINGERPRINT_VERIFIED);
    //     } catch (err: any) {
    //         updateFpStatus(err.message || "Scanner error", "red");
    //         console.error("BioMini Scan Error:", err);
    //         if (err.message && err.message.includes("Timeout")) {
    //             updateFpStatus("Scan timed out. Please place your finger sooner.", "red");
    //         }
    //         setStep(ExtendedEkycStep.CARD_READ_SUCCESS);
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
        updateFpStatus("Verifying with NBIS...", "blue");
        try {
            // Convert base64 fingerprint to octet stream (Uint8Array)
            // if (!fingerprintBase64) {
            //     throw new Error("Fingerprint data not available");
            // }
            // const binaryString = atob(fingerprintBase64);
            // const bytes = new Uint8Array(binaryString.length);
            // for (let i = 0; i < binaryString.length; i++) {
            //     bytes[i] = binaryString.charCodeAt(i);
            // }
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

                const auth = resultData.authorization || resultData.data?.authorization;
                if (auth) {
                    setNbisAuth({
                        id: auth.id,
                        keyid: auth.keyid,
                        signature: auth.signature,
                        timestamp: auth.timestamp,
                    });
                }
                setIsNbisVerified(true); // ← This enables the "Next" button
            } else {
                updateFpStatus("Fingerprint NOT matched", "red");
            }
        } catch (err: any) {
            updateFpStatus(err.message || "NBIS error", "red");
            console.error("NBIS verification error:", err);
        }
    };

    const handleProcessTransaction = async () => {
        if (!cardData) return;
        if (!idFront || !idBack) {
            setError("Please upload ID images before submitting.");
            return;
        }
        setError(null);
        resetVerifyError?.();
        if (BYPASS_GOVT_API) {
            updateFpStatus("Government verification bypassed (testing mode)", "green");
            const fakeTxnId = `TEST_GOVT_${Date.now()}`;
            setGovtTransactionId(fakeTxnId);
            setStep(ExtendedEkycStep.FINAL_ACTIVATION);
            return;
        }

        // // Validate images
        // if (!idFront || !idBack) {
        //     setError("Please provide both ID Front and ID Back images.");
        //     return;
        // }
        // // Validate signature
        // if (!signature) {
        //     setError("Please capture a signature before submitting.");
        //     return;
        // }
        const cleanBase64 = (base64: string | null): string | null => {
            if (!base64) return null;
            return base64.includes(',') ? base64.split(',')[1] : base64;
        };


        const verificationPayload = {
            cpr_number: cardData?.cprNumber || "",
            name: cardData?.fullName || "",
            gender: cardData?.gender || "",
            first_name: cardData.FirstNameEnglish || "",
            last_name: cardData.LastNameEnglish || "",
            id_front_base64: cleanBase64(idFront),
            id_back_base64: cleanBase64(idBack),
            fingerprint_base64: fingerprintBase64 || "",

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
            server_timestamp: nbisAuth?.timestamp
                ? new Date(nbisAuth.timestamp).toISOString()
                : new Date().toISOString(),
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
            card_occupation: ""
        };

        verifyFpStatus(verificationPayload);
    };

    const isValidBase64 = (str: string | null): boolean => {
        if (!str) return false;
        try {
            const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
            if (!base64Regex.test(str)) return false;
            atob(str);
            return true;
        } catch {
            return false;
        }
    };

    const handleReadCard = async () => {
        setError(null);
        setIsLoading(true);
        setStep(ExtendedEkycStep.READING_CARD);

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
            const nationality = getItemValue("MiscellaneousTextData", "Nationality") || getTag("NationalityCode");
            const nationalityCode = getItemValue("MiscellaneousTextData", "Alpha3Code");
            const gender = getTag("Gender");
            const photoUrl = photoB64
                ? `data:image/jpeg;base64,${photoB64}`
                : `https://picsum.photos/seed/${cpr}/300`;

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
                occupation: "",
                photoUrl,
                FirstNameEnglish: firstname || "",
                LastNameEnglish: lastname || "",
                GovernorateNo: Number(getTag("GovernorateNo")) || 0,
                nationalityCode: nationalityCode || "N/A",   // ← ADD THIS LINE

            });

            setStep(ExtendedEkycStep.CARD_READ_SUCCESS);
        } catch (e: any) {
            setError(e.message || "Failed to read card");
            setStep(ExtendedEkycStep.IDLE);
        } finally {
            setIsLoading(false);
        }
    };
    const handleReset = () => {
        setStep(ExtendedEkycStep.IDLE);
        setCardData(null);
        setError(null);
        setIsLoading(false);
        setFingerdetails(null);
        setFingerprintBase64(null);
        setNbisAuth(null);
        setFpStatus("");
        setCurrentOpId(null);
        setHasTemplate(false);
        setIsNbisVerified(false);
        setGovtTransactionId(null);

        // Also cancel any ongoing scanner operation
        if (currentOpId) {
            fetch(`${FP_SERVER_URL}/${currentOpId}`, { method: "DELETE" }).catch(() => { });
        }

        // Call parent reset if provided
        onReset?.();  // ← This calls resetAll() in the parent
    };

    useEffect(() => {
        return () => {
            if (currentOpId) {
                fetch(`${FP_SERVER_URL}/${currentOpId}`, { method: "DELETE" }).catch(() => { });
            }
        };
    }, [currentOpId]);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>

                    {/* Smart Card Step */}
                    {/* <div className={`flex flex-col items-center ${cardData ? "text-brand-500" : "text-gray-500"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${cardData ? "bg-brand-500 text-white" : "bg-white"}`}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Smart Card</span>
                    </div> */}
                    {/* Smart Card Step - Green when card is successfully read */}
                    <div className={`flex flex-col items-center ${!cardData && step !== ExtendedEkycStep.FINAL_ACTIVATION ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${cardData ? "bg-green-600 text-white" : "bg-white"}`}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Smart Card</span>
                    </div>

                    {/* Biometric Step - Green only after fingerprint verified */}
                    <div className={`flex flex-col items-center ${ExtendedEkycStep.SCANNING_FINGERPRINT && cardData ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step === ExtendedEkycStep.FINGERPRINT_VERIFIED || !ExtendedEkycStep.SCANNING_FINGERPRINT || (step === ExtendedEkycStep.FINAL_ACTIVATION) ? "bg-green-600 text-white" : "bg-white"}`}>
                            <Fingerprint className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Biometric</span>
                    </div>

                    {/* Submit Step - Purple when active */}
                    <div className={`flex flex-col items-center ${step === ExtendedEkycStep.FINAL_ACTIVATION ? "text-green-500" : "text-gray-400"}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step === ExtendedEkycStep.FINAL_ACTIVATION ? "bg-green-500 text-white" : "bg-white"}`}>
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2">Submit</span>
                    </div>


                    {/* Biometric Step */}

                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Card Reading Screen */}
                {(!cardData || step === ExtendedEkycStep.READING_CARD) && (
                    <div className="p-8 text-center space-y-6">
                        <h3 className="text-2xl font-bold text-gray-800">Insert Bahraini Smart Card</h3>
                        <p className="text-gray-500">Insert card into reader to begin validation.</p>
                        <div className="py-8 flex justify-center">
                            <div className={`w-48 h-32 bg-linear-to-r from-blue-500 to-brand-700 rounded-xl shadow-inner flex items-center justify-center ${isLoading ? "animate-pulse" : ""}`}>
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
                {cardData && step !== ExtendedEkycStep.READING_CARD && (
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel: Card Details */}
                        <div className="lg:w-1/2 p-6 bg-gray-50 lg:border-r">
                            <h4 className="text-sm uppercase text-gray-500 font-bold mb-4">Card Details</h4>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    {/* <img src={cardData.photoUrl} alt="Photo" className="w-24 h-24 rounded-lg object-cover border" /> */}
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


                                {/* ID Front/Back Upload/Scan */}
                                {step === ExtendedEkycStep.FINGERPRINT_VERIFIED && (
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
                                {step === ExtendedEkycStep.FINAL_ACTIVATION && (
                                    <div className="mt-4">
                                        {/* Signature capture button and modal */}
                                        <button
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mb-2"
                                            onClick={() => setSignatureModalOpen(true)}
                                            type="button"
                                        >
                                            {signature ? "Re-capture Signature" : "Capture Signature"}
                                        </button>
                                        {signature && (
                                            <div className="mt-2">
                                                <img src={signature} alt="Signature preview" style={{ maxWidth: 300, border: '1px solid #eee', borderRadius: 8 }} />
                                            </div>
                                        )}
                                        {/* SignatureModal component for signature capture */}
                                        <SignatureModal
                                            open={signatureModalOpen}
                                            onClose={() => setSignatureModalOpen(false)}
                                            onSave={setSignature}
                                            initialValue={signature}
                                        />
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Right Panel: Fingerprint + Final Form */}
                        <div className="lg:w-1/2 p-8 flex flex-col items-center justify-center text-center">
                            {step === ExtendedEkycStep.CARD_READ_SUCCESS && (
                                <>
                                    <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                                        <Fingerprint className="w-12 h-12 text-brand-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Verify Fingerprint</h3>
                                    {fingerdetails && (
                                        <h2 className="mb-4 text-green-500 text-xl">
                                            Please scan your <span className="font-bold">{fingerdetails}</span>
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

                            {step === ExtendedEkycStep.SCANNING_FINGERPRINT && (
                                <div className="space-y-6 w-full max-w-sm">
                                    <canvas
                                        ref={canvasRef}
                                        className="mx-auto border-4 border-brand-200 rounded-lg shadow-lg"
                                        style={{ maxWidth: "300px", width: "100%" }}
                                    />
                                    <p
                                        className="text-lg font-medium"
                                        style={{
                                            color:
                                                fpStatusColor === "red" ? "#dc2626" :
                                                    fpStatusColor === "green" ? "#16a34a" :
                                                        fpStatusColor === "blue" ? "#2563eb" : "#000",
                                        }}
                                    >
                                        {fpStatus || "Scanning..."}
                                    </p>
                                </div>
                            )}

                            {step === ExtendedEkycStep.FINGERPRINT_VERIFIED && (
                                <div className="space-y-8 w-full max-w-md">
                                    <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-16 h-16 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Fingerprint Captured!</h3>
                                        <p className="text-gray-600 mt-2">
                                            Ready to process {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? "s" : ""}.
                                        </p>
                                    </div>

                                    <div className="space-y-4 w-full">
                                        {
                                            !isNbisVerified && <button
                                                onClick={verifyFingerprintWithNBIS}
                                                disabled={!hasTemplate}
                                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
                                            >
                                                Verify with NBIS
                                            </button>

                                        }

                                        {fpStatus && (
                                            <p
                                                className="text-center font-medium"
                                                style={{
                                                    color:
                                                        fpStatusColor === "red" ? "#dc2626" :
                                                            fpStatusColor === "green" ? "#16a34a" :
                                                                fpStatusColor === "blue" ? "#2563eb" : "#000",
                                                }}
                                            >
                                                {fpStatus}
                                            </p>
                                        )}

                                        {(verifyError || error) && (
                                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                {(verifyError as Error)?.message || error || "Verification failed"}
                                            </div>
                                        )}

                                        {
                                            isNbisVerified &&
                                            <button
                                                onClick={handleProcessTransaction}
                                                disabled={!isNbisVerified || verifyingStatus}
                                                className=" w-full px-8 py-3 bg-brand-500 text-white rounded-lg font-medium justify-center hover:bg-brand-600 disabled:opacity-70 flex items-center gap-2"
                                            >
                                                {verifyingStatus ? (
                                                    <p>Loading</p>
                                                    // <>
                                                    //     <Loader2 className="w-6 h-6 animate-spin mr-3 inline" />
                                                    //     Processing...
                                                    // </>
                                                ) : (
                                                    "Next"
                                                )}
                                            </button>
                                        }

                                    </div>
                                </div>
                            )}

                            {/* Final Activation Form */}
                            {step === ExtendedEkycStep.FINAL_ACTIVATION && cardData && govtTransactionId && (
                                <FinalActivationForm
                                    cardData={cardData}
                                    govtTransactionId={govtTransactionId}
                                    selectedTransactions={selectedTransactions}
                                    signature={signature}
                                    onSuccess={(referenceId) => onComplete({ ...cardData, referenceId })}
                                    onBack={() => setStep(ExtendedEkycStep.FINGERPRINT_VERIFIED)}
                                    onReset={handleReset}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EkycWizard;