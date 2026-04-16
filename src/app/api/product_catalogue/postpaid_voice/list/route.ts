import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";

    let apiUrl = `${API_BASE_URL}product-catalogue/v1/product-catalogue/list?type=postpaid_voice`;

    apiUrl += `&limit=${limit}&offset=${offset}`;

    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: {
          ...incomingHeaders,
        },
      },
      "no-cache"
    );

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: error?.message || "Failed to fetch postpaid voice catalogue",
      },
      { status: 500 }
    );
  }
}
