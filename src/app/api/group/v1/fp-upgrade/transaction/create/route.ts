
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import  { FetchHeaders } from "@/lib/fetchData";

const BACKEND_API_URL= "http://127.0.0.1:20080/group/v1/fp-upgrade/transaction/create"



export async function POST(request: NextRequest) {
        const incomingHeaders = FetchHeaders(request);
     
   
  try {
    const body = await request.json();

    const response = await fetch(BACKEND_API_URL, {
      method: "POST",
      headers: {
         ...incomingHeaders,
          "Content-Type": "application/json",
        
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Transaction failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      reference_id: data.reference_id || data.refNo || data.transaction_ref || data.id,
      message: data.message || "Transaction created successfully",
      raw: data,
    });
  } catch (error: any) {
    console.error("FP Transaction Create API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}