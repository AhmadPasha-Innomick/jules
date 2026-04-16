import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const apiUrl = `${API_BASE_URL}lookups/v1/lookups/get-nationalities`;
    const incomingHeaders = FetchHeaders(request);

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
    console.error("Nationalities API Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch nationalities" },
      { status: 500 }
    );
  }
}
