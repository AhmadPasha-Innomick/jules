import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

    const apiUrl = `${API_BASE_URL}incentive-management/v1/incentive-scheme/clone`;
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

    return NextResponse.json(res?.json, { status: res?.status || 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
