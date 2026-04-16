import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchWithAuth, { FetchHeaders } from "@/lib/fetchData";

export async function POST(req: Request) {
  try {
    const incomingHeaders = FetchHeaders(req);
    const { log_id } = await req.json();

  
    if (!log_id) {
      return NextResponse.json(
        { success: false, message: "log_id is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/log-management/v1/log/details`;

   
    const result = await FetchWithAuth(
      apiUrl,
      {
        method: "POST",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ log_id }), 
      },
      "no-cache"
    );

    

    return NextResponse.json(result.json ?? result, {
      status: result.status ?? 200,
    });
  } catch (error: any) {
    console.error("[/api/logs/details] Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch log details",
      },
      { status: 500 }
    );
  }
}