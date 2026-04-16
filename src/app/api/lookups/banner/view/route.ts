import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error_code: 400,
          message: "Banner id is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}lookups/v1/banner/view?id=${id}`;

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
        message: error?.message || "Failed to fetch banner details",
      },
      { status: 500 }
    );
  }
}
