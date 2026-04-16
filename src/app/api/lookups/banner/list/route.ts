import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");

    const apiUrl = `${API_BASE_URL}lookups/v1/banner/list${
      category ? `?category=${category}` : ""
    }`;

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
        message: error?.message || "Failed to fetch banners",
      },
      { status: 500 }
    );
  }
}
