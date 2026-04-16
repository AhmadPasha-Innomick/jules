import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
 
export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();
    const apiUrl = `${API_BASE_URL}finger-print-update/v1/finger-print-update/verification-status`;
 
    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      "no-cache"
    );
 
   
    if (res && typeof res === "object") {
      return NextResponse.json(res);
    } else {
   
      return NextResponse.json(
        { success: false, message: "Invalid response from verification service" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error in verification-status API route:", error);
 

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check verification status",
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}