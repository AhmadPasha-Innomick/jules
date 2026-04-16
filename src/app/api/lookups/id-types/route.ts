import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const apiUrl = `${API_BASE_URL}lookups/v1/lookups/get-id-types`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: incomingHeaders,
      },
      "no-cache"
    );

    return NextResponse.json(res.json, { status: res.status });
  } catch (error) {
    console.error("GET /lookups/get-id-types Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch ID Types" },
      { status: 500 }
    );
  }
}
