import { NextResponse } from "next/server";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
import { API_BASE_URL } from "@/config";

export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();


    const apiUrl = `${API_BASE_URL}payment/v1/prepaid/transaction/create`;

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


    if (!res) {
      console.error("FetchData returned null");
      return NextResponse.json(
        {
          success: false,
          message: "No response from backend service",
        },
        { status: 502 }
      );
    }

    const { status, json } = res;

 
    if (status >= 400) {
      return NextResponse.json(
        {
          success: false,
          message: json?.message || "Backend error",
          ...json,
        },
        { status }
      );
    }


    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    console.error("Prepaid transaction creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
