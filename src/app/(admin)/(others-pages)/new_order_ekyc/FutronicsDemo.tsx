"use client";
import React, { useEffect, useRef, useState } from "react";
import { FP_SERVER_URL } from "@/config";
import {

    Fingerprint,

} from "lucide-react";
const NBIS_PROXY_URL = "/api/nbis/fingerprint-verify"; 

interface OperationDescription {
    id: string;
    state: "init" | "inprogress" | "done";
    status?: "success" | "fail";
    operation: string;
    message?: string;
    errorstr?: string;
    errornum?: string;
    fingercmd?: "puton" | "takeoff";
    devwidth?: string;
    devheight?: string;
}

const FutronicDemo: React.FC = () => {
    // Refs for DOM elements
    const btnEnrollAnsi = useRef<HTMLButtonElement>(null);
    const btnEnrollFTR = useRef<HTMLButtonElement>(null);
    const btnEnrollFTRIdn = useRef<HTMLButtonElement>(null);
    const btnCapture = useRef<HTMLButtonElement>(null);
    const btnCancel = useRef<HTMLButtonElement>(null);
    const checkBoxConvToISO = useRef<HTMLInputElement>(null);
    const sampleNumList = useRef<HTMLInputElement>(null);
    const resultTextRef = useRef<HTMLParagraphElement>(null);
    const resultLinkRef = useRef<HTMLAnchorElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [lastInitOp, setLastInitOp] = useState<string | null>(null);
    const [isOperationInProgress, setIsOperationInProgress] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [statusColor, setStatusColor] = useState<"black" | "red" | "green" | "blue">("black");
    const [cpr, setCpr] = useState<string>("940338939"); // State for CPR input
    const [verificationResult, setVerificationResult] = useState<string>(""); // State for NBIS verification result
    const [hasTemplate, setHasTemplate] = useState(false); // Track if a template is ready for verification

    // Helper to set status text with color
    const setStatus = (msg: string, color: "red" | "green" | "blue") => {
        setStatusMessage(msg);
        setStatusColor(color);
    };

    const fixError = (statusText: string, errorText: string) => {
        if (errorText) {
            setStatus(`${errorText}${statusText ? ` (${statusText})` : ""}`, "red");
        } else {
            setStatus(statusText, "red");
        }
    };

    const enableControlsForOp = (opBegin: boolean) => {
        setIsOperationInProgress(opBegin);
        if (btnCancel.current) btnCancel.current.disabled = !opBegin;
    };

    const beginOperation = async (opName: string, libName: string, sendSampleNum: boolean, isoconv: number) => {
        let sampleNum = "1";
        if (sendSampleNum && sampleNumList.current) {
            sampleNum = sampleNumList.current.value;
            const num = parseInt(sampleNum);
            if (isNaN(num) || num < 3 || num > 10) {
                fixError("", "Invalid number of samples (must be 3–10)");
                return;
            }
        }
        const payload = {
            operation: opName,
            username: "testuser", // Fixed non-empty username to avoid 400
            usedlib: libName,
            isoconv: isoconv,
            samplenum: sampleNum,
        };

     
        enableControlsForOp(true);
        if (resultLinkRef.current) resultLinkRef.current.innerHTML = "";
        setHasTemplate(false); // Reset template readiness
        setVerificationResult(""); // Clear previous verification result
        try {
            const resp = await fetch(FP_SERVER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error("Server error");
            const data = await resp.json();
            setStatus("Operation started", "blue");
            parseOperationDsc(data);
        } catch (err) {
            fixError("", "Failed to start operation");
            enableControlsForOp(false);
        }
    };

    const getOperationState = async (opId: string) => {
        try {
            const resp = await fetch(`${FP_SERVER_URL}/${opId}`);
            if (!resp.ok) throw new Error();
            const data = await resp.json();
            parseOperationDsc(data);
        } catch {
            enableControlsForOp(false);
        }
    };

    const getOperationImg = async (opId: string, width: number, height: number) => {
        try {
            const resp = await fetch(`${FP_SERVER_URL}/${opId}/image`);
            if (!resp.ok) return;
            const buffer = await resp.arrayBuffer();
            drawFingerFrame(new Uint8Array(buffer), width, height);
        } catch {
            // silent
        }
    };

    const linkOperationTemplate = (opId: string, operationName: string) => {
        if (!resultLinkRef.current) return;
        const isCapture = operationName === "capture";
        const target = isCapture ? "/image" : "/template";
        const saveAs = isCapture ? "image.bin" : "template.bin";
        const text = isCapture ? "Result image bytes" : "Result template";
        resultLinkRef.current.href = `${FP_SERVER_URL}/${opId}${target}`;
        resultLinkRef.current.download = saveAs;
        resultLinkRef.current.innerHTML = text;
    };

    const parseOperationDsc = (opDsc: OperationDescription) => {
        if (opDsc.state === "done") {
            enableControlsForOp(false);
            if (opDsc.status === "success") {
                setStatus(opDsc.message || "Success", "green");
                linkOperationTemplate(opDsc.id, opDsc.operation);
                setHasTemplate(true); // Template is ready for verification
            } else if (opDsc.status === "fail") {
                fixError("", opDsc.errorstr || "Operation failed");
            }
        } else if (opDsc.state === "init") {
            setLastInitOp(opDsc.id);
            setTimeout(() => getOperationState(opDsc.id), 1000);
            setTimeout(
                () => getOperationImg(opDsc.id, parseInt(opDsc.devwidth || "320"), parseInt(opDsc.devheight || "480")),
                1000
            );
        } else if (opDsc.state === "inprogress") {
            if (opDsc.fingercmd === "puton") {
                setStatus("Put finger on scanner", "blue");
            } else if (opDsc.fingercmd === "takeoff") {
                setStatus("Take off finger from scanner", "blue");
            }
            setTimeout(() => getOperationState(opDsc.id), 1000);
            setTimeout(
                () => getOperationImg(opDsc.id, parseInt(opDsc.devwidth || "320"), parseInt(opDsc.devheight || "480")),
                1000
            );
        }
    };

    const drawFingerFrame = (frameBytes: Uint8Array, width: number, height: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < frameBytes.length; i++) {
            imgData.data[4 * i] = frameBytes[i];
            imgData.data[4 * i + 1] = frameBytes[i];
            imgData.data[4 * i + 2] = frameBytes[i];
            imgData.data[4 * i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    };

    const verifyWithNBIS = async () => {
        if (!lastInitOp) {
            setStatus("No operation ID available", "red");
            return;
        }
        if (!cpr.trim()) {
            setStatus("Please enter a valid CPR number", "red");
            return;
        }
        setStatus("Verifying with NBIS...", "blue");
        setVerificationResult("");
        try {
            // Fetch the ISO template from FP server
            const templateResp = await fetch(`${FP_SERVER_URL}/${lastInitOp}/template`);
            if (!templateResp.ok) throw new Error("Failed to fetch template");
            const isoBuffer = await templateResp.arrayBuffer();

            // Send to NBIS proxy API
            const verifyUrl = `${NBIS_PROXY_URL}?cpr=${encodeURIComponent(cpr)}`;
            const verifyResp = await fetch(verifyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                body: isoBuffer,
            });
            const verifyData = await verifyResp.json();

            if (!verifyResp.ok || !verifyData.success) {
                throw new Error(verifyData.message || "Verification request failed");
            }

            // Handle NBIS response logic
            const matched = verifyData.result === true;

            if (matched) {
                setStatus("Fingerprint Matched ", "green");
            } else {
                setStatus("Fingerprint NOT Matched ", "red");
            }

            // Store full result for display
            setVerificationResult(JSON.stringify(verifyData, null, 2));
        } catch (err: any) {
            setStatus(err.message || "NBIS Verification Failed", "red");
            setVerificationResult("");
        }
    };

   
    const checkServerConnection = async () => {
        try {
            await fetch(FP_SERVER_URL);
            // Enable all buttons
            if (btnEnrollAnsi.current) btnEnrollAnsi.current.disabled = false;
            if (btnEnrollFTR.current) btnEnrollFTR.current.disabled = false;
            if (btnEnrollFTRIdn.current) btnEnrollFTRIdn.current.disabled = false;
            if (btnCapture.current) btnCapture.current.disabled = false;
            setStatus("Press operation button", "blue");
        } catch {
            setStatus("Waiting for FPHttpServer...", "red");
            setTimeout(checkServerConnection, 2000);
        }
    };

   

    return (
        <div className="max-w-4xl mx-auto p-6 font-sans mt-5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="mb-6">
                        <button
                            ref={btnEnrollAnsi}
                            onClick={() => beginOperation("enroll", "ansisdk", false, checkBoxConvToISO.current?.checked ? 1 : 0)}
                            disabled={isOperationInProgress}
                            className="px-8 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-70 flex items-center gap-2"
                        >
                            SCAN FINGERPRINT
                        </button>
                      
                    </div>
                    <div className="space-y-4">
                      
                    
                      
                        <button
                            onClick={verifyWithNBIS}
                            disabled={!hasTemplate || isOperationInProgress || !cpr.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                        >
                            Verify with NBIS
                        </button>
                    </div>
                </div>
                <div>
                   
                </div>
            </div>
            <div className="mt-8">
                <p ref={resultTextRef} style={{ color: statusColor }} className="text-lg font-medium">
                    {statusMessage || "Waiting for server..."}
                </p>
            </div>
          
           
        </div>
    );
};

export default FutronicDemo;
















// "use client";
// import React, { useEffect, useRef, useState } from "react";

// const FP_SERVER_URL = "http://127.0.0.1:15170/fpoperation";
// import {

//     Fingerprint,

// } from "lucide-react";
// const NBIS_PROXY_URL = "/api/nbis/fingerprint-verify"; // Adjust this to your actual Next.js API route path (e.g., /api/verify-fp)

// interface OperationDescription {
//     id: string;
//     state: "init" | "inprogress" | "done";
//     status?: "success" | "fail";
//     operation: string;
//     message?: string;
//     errorstr?: string;
//     errornum?: string;
//     fingercmd?: "puton" | "takeoff";
//     devwidth?: string;
//     devheight?: string;
// }

// const FutronicDemo: React.FC = () => {
//     // Refs for DOM elements
//     const btnEnrollAnsi = useRef<HTMLButtonElement>(null);
//     const btnEnrollFTR = useRef<HTMLButtonElement>(null);
//     const btnEnrollFTRIdn = useRef<HTMLButtonElement>(null);
//     const btnCapture = useRef<HTMLButtonElement>(null);
//     const btnCancel = useRef<HTMLButtonElement>(null);
//     const checkBoxConvToISO = useRef<HTMLInputElement>(null);
//     const sampleNumList = useRef<HTMLInputElement>(null);
//     const resultTextRef = useRef<HTMLParagraphElement>(null);
//     const resultLinkRef = useRef<HTMLAnchorElement>(null);
//     const canvasRef = useRef<HTMLCanvasElement>(null);

//     const [lastInitOp, setLastInitOp] = useState<string | null>(null);
//     const [isOperationInProgress, setIsOperationInProgress] = useState(false);
//     const [statusMessage, setStatusMessage] = useState<string>("");
//     const [statusColor, setStatusColor] = useState<"black" | "red" | "green" | "blue">("black");
//     const [cpr, setCpr] = useState<string>(""); // State for CPR input
//     const [verificationResult, setVerificationResult] = useState<string>(""); // State for NBIS verification result
//     const [hasTemplate, setHasTemplate] = useState(false); // Track if a template is ready for verification

//     // Helper to set status text with color
//     const setStatus = (msg: string, color: "red" | "green" | "blue") => {
//         setStatusMessage(msg);
//         setStatusColor(color);
//     };

//     const fixError = (statusText: string, errorText: string) => {
//         if (errorText) {
//             setStatus(`${errorText}${statusText ? ` (${statusText})` : ""}`, "red");
//         } else {
//             setStatus(statusText, "red");
//         }
//     };

//     const enableControlsForOp = (opBegin: boolean) => {
//         setIsOperationInProgress(opBegin);
//         if (btnCancel.current) btnCancel.current.disabled = !opBegin;
//     };

//     const beginOperation = async (opName: string, libName: string, sendSampleNum: boolean, isoconv: number) => {
//         let sampleNum = "1";
//         if (sendSampleNum && sampleNumList.current) {
//             sampleNum = sampleNumList.current.value;
//             const num = parseInt(sampleNum);
//             if (isNaN(num) || num < 3 || num > 10) {
//                 fixError("", "Invalid number of samples (must be 3–10)");
//                 return;
//             }
//         }
//         const payload = {
//             operation: opName,
//             username: "testuser", // Fixed non-empty username to avoid 400
//             usedlib: libName,
//             isoconv: isoconv,
//             samplenum: sampleNum,
//         };
//         enableControlsForOp(true);
//         if (resultLinkRef.current) resultLinkRef.current.innerHTML = "";
//         setHasTemplate(false); // Reset template readiness
//         setVerificationResult(""); // Clear previous verification result
//         try {
//             const resp = await fetch(FP_SERVER_URL, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });
//             if (!resp.ok) throw new Error("Server error");
//             const data = await resp.json();
//             setStatus("Operation started", "blue");
//             parseOperationDsc(data);
//         } catch (err) {
//             fixError("", "Failed to start operation");
//             enableControlsForOp(false);
//         }
//     };

//     const getOperationState = async (opId: string) => {
//         try {
//             const resp = await fetch(`${FP_SERVER_URL}/${opId}`);
//             if (!resp.ok) throw new Error();
//             const data = await resp.json();
//             parseOperationDsc(data);
//         } catch {
//             enableControlsForOp(false);
//         }
//     };

//     const getOperationImg = async (opId: string, width: number, height: number) => {
//         try {
//             const resp = await fetch(`${FP_SERVER_URL}/${opId}/image`);
//             if (!resp.ok) return;
//             const buffer = await resp.arrayBuffer();
//             drawFingerFrame(new Uint8Array(buffer), width, height);
//         } catch {
//             // silent
//         }
//     };

//     const linkOperationTemplate = (opId: string, operationName: string) => {
//         if (!resultLinkRef.current) return;
//         const isCapture = operationName === "capture";
//         const target = isCapture ? "/image" : "/template";
//         const saveAs = isCapture ? "image.bin" : "template.bin";
//         const text = isCapture ? "Result image bytes" : "Result template";
//         resultLinkRef.current.href = `${FP_SERVER_URL}/${opId}${target}`;
//         resultLinkRef.current.download = saveAs;
//         resultLinkRef.current.innerHTML = text;
//     };

//     const parseOperationDsc = (opDsc: OperationDescription) => {
//         if (opDsc.state === "done") {
//             enableControlsForOp(false);
//             if (opDsc.status === "success") {
//                 setStatus(opDsc.message || "Success", "green");
//                 linkOperationTemplate(opDsc.id, opDsc.operation);
//                 setHasTemplate(true); // Template is ready for verification
//             } else if (opDsc.status === "fail") {
//                 fixError("", opDsc.errorstr || "Operation failed");
//             }
//         } else if (opDsc.state === "init") {
//             setLastInitOp(opDsc.id);
//             setTimeout(() => getOperationState(opDsc.id), 1000);
//             setTimeout(
//                 () => getOperationImg(opDsc.id, parseInt(opDsc.devwidth || "320"), parseInt(opDsc.devheight || "480")),
//                 1000
//             );
//         } else if (opDsc.state === "inprogress") {
//             if (opDsc.fingercmd === "puton") {
//                 setStatus("Put finger on scanner", "blue");
//             } else if (opDsc.fingercmd === "takeoff") {
//                 setStatus("Take off finger from scanner", "blue");
//             }
//             setTimeout(() => getOperationState(opDsc.id), 1000);
//             setTimeout(
//                 () => getOperationImg(opDsc.id, parseInt(opDsc.devwidth || "320"), parseInt(opDsc.devheight || "480")),
//                 1000
//             );
//         }
//     };

//     const drawFingerFrame = (frameBytes: Uint8Array, width: number, height: number) => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//         const ctx = canvas.getContext("2d");
//         if (!ctx) return;
//         const imgData = ctx.createImageData(canvas.width, canvas.height);
//         for (let i = 0; i < frameBytes.length; i++) {
//             imgData.data[4 * i] = frameBytes[i];
//             imgData.data[4 * i + 1] = frameBytes[i];
//             imgData.data[4 * i + 2] = frameBytes[i];
//             imgData.data[4 * i + 3] = 255;
//         }
//         ctx.putImageData(imgData, 0, 0);
//     };

//     const verifyWithNBIS = async () => {
//         if (!lastInitOp) {
//             setStatus("No operation ID available", "red");
//             return;
//         }
//         if (!cpr.trim()) {
//             setStatus("Please enter a valid CPR number", "red");
//             return;
//         }
//         setStatus("Verifying with NBIS...", "blue");
//         setVerificationResult("");
//         try {
//             // Fetch the ISO template from FP server
//             const templateResp = await fetch(`${FP_SERVER_URL}/${lastInitOp}/template`);
//             if (!templateResp.ok) throw new Error("Failed to fetch template");
//             const isoBuffer = await templateResp.arrayBuffer();

//             // Send to NBIS proxy API
//             const verifyUrl = `${NBIS_PROXY_URL}?cpr=${encodeURIComponent(cpr)}`;
//             const verifyResp = await fetch(verifyUrl, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/octet-stream",
//                 },
//                 body: isoBuffer,
//             });
//             const verifyData = await verifyResp.json();

//             if (!verifyResp.ok || !verifyData.success) {
//                 throw new Error(verifyData.message || "Verification request failed");
//             }

//             // Handle NBIS response logic
//             const matched = verifyData.result === true;

//             if (matched) {
//                 setStatus("Fingerprint Matched ✅", "green");
//             } else {
//                 setStatus("Fingerprint NOT Matched ❌", "red");
//             }

//             // Store full result for display
//             setVerificationResult(JSON.stringify(verifyData, null, 2));
//         } catch (err: any) {
//             setStatus(err.message || "NBIS Verification Failed", "red");
//             setVerificationResult("");
//         }
//     };

   
//     const checkServerConnection = async () => {
//         try {
//             await fetch(FP_SERVER_URL);
//             // Enable all buttons
//             if (btnEnrollAnsi.current) btnEnrollAnsi.current.disabled = false;
//             if (btnEnrollFTR.current) btnEnrollFTR.current.disabled = false;
//             if (btnEnrollFTRIdn.current) btnEnrollFTRIdn.current.disabled = false;
//             if (btnCapture.current) btnCapture.current.disabled = false;
//             setStatus("Press operation button", "blue");
//         } catch {
//             setStatus("Waiting for FPHttpServer...", "red");
//             setTimeout(checkServerConnection, 2000);
//         }
//     };

//     useEffect(() => {
//         // Load default image (replace with your actual path or base64)
//         const defImg = new Image();
//         defImg.onload = () => {
//             const canvas = canvasRef.current;
//             if (!canvas) return;
//             const ctx = canvas.getContext("2d");
//             if (!ctx) return;
//             ctx.drawImage(defImg, 0, 0, canvas.width, canvas.height);
//         };
//         defImg.src = "/defframe.png"; // Put defframe.png in public folder
//         checkServerConnection();
//     }, []);

//     return (
//         <div className="max-w-4xl mx-auto p-6 font-sans mt-5">
//             <h2 className="text-3xl font-bold mb-6 " >BIOMETRIC</h2>

//             {/* <img src="/bunner.png" alt="Banner" className="w-full" /> */}
//             <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-6">
//                 <Fingerprint className="w-12 h-12 text-brand-600" />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div>
//                     <div className="mb-6">
//                         <button
//                             ref={btnEnrollAnsi}
//                             onClick={() => beginOperation("enroll", "ansisdk", false, checkBoxConvToISO.current?.checked ? 1 : 0)}
//                             disabled={isOperationInProgress}
//                             className="px-8 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-70 flex items-center gap-2"
//                         >
//                             SCAN FINGERPRINT
//                         </button>
//                         {/* Add other buttons if needed, e.g., Enroll FTR, Capture */}
//                     </div>
//                     <div className="space-y-4">
//                         <label className="flex items-center">
//                             <input type="checkbox" ref={checkBoxConvToISO} className="mr-2" defaultChecked />
//                             Convert ANSI to ISO (required for NBIS)
//                         </label>
//                         <div>
//                             <label>Samples in FTRAPI template: </label>
//                             <input
//                                 type="number"
//                                 ref={sampleNumList}
//                                 defaultValue={5}
//                                 min={3}
//                                 max={10}
//                                 className="border rounded px-2 py-1 w-20"
//                             />
//                         </div>
//                         <div>
//                             <label>CPR Number: </label>
//                             <input
//                                 type="text"
//                                 value={cpr}
//                                 onChange={(e) => setCpr(e.target.value)}
//                                 placeholder="Enter CPR"
//                                 className="border rounded px-2 py-1 w-full max-w-xs"
//                             />
//                         </div>
//                         <button
//                             onClick={verifyWithNBIS}
//                             disabled={!hasTemplate || isOperationInProgress || !cpr.trim()}
//                             className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
//                         >
//                             Verify with NBIS
//                         </button>
//                     </div>
//                 </div>
//                 <div>
//                     <canvas
//                         ref={canvasRef}
//                         width={320}
//                         height={480}
//                         className="border-4 border-gray-300 bg-gray-100"
//                     />
//                 </div>
//             </div>
//             <div className="mt-8">
//                 <p ref={resultTextRef} style={{ color: statusColor }} className="text-lg font-medium">
//                     {statusMessage || "Waiting for server..."}
//                 </p>
//             </div>
//             <div className="mt-4">
//                 <a
//                     ref={resultLinkRef}
//                     href="#"
//                     download
//                     className="text-blue-600 underline"
//                     target="_blank"
//                 >
//                     Download result
//                 </a>
//             </div>
//             {verificationResult && (
//                 <div className="mt-8 p-6 border rounded-lg bg-gray-50">
//                     <h2 className="text-2xl font-bold mb-4">NBIS Verification Result</h2>

//                     {/* Clear Match Status */}
//                     {(() => {
//                         try {
//                             const data = JSON.parse(verificationResult);
//                             const matched = data.result === true;
//                             return (
//                                 <div className={`text-2xl font-bold mb-4 p-4 rounded text-center ${matched ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                                     }`}>
//                                     {matched ? "✅ Fingerprint Matched" : "❌ Fingerprint NOT Matched"}
//                                 </div>
//                             );
//                         } catch {
//                             return null;
//                         }
//                     })()}

//                     {/* Raw JSON Response */}
//                     <details className="mt-4">
//                         <summary className="cursor-pointer font-medium text-blue-600 hover:underline">
//                             View raw response details
//                         </summary>
//                         <pre className="mt-3 bg-gray-900 text-gray-100 p-4 rounded overflow-auto text-sm">
//                             {verificationResult}
//                         </pre>
//                     </details>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FutronicDemo;