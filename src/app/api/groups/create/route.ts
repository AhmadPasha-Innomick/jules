import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";



export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

  
    const apiUrl = `${API_BASE_URL}group/v1/group/create`;

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

    return NextResponse.json(res.json, { status: res.status });
  } catch (error) {
    
    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: error.message,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
