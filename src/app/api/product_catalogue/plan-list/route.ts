import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const service_type = searchParams.get("service_type");
    const sub_service_type = searchParams.get("sub_service_type");

    if (!service_type || !sub_service_type) {
      return NextResponse.json(
        {
          success: false,
          message: "service_type and sub_service_type are required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}product-catalogue/v1/product-catalogue/plan-list?service_type=${service_type}&sub_service_type=${sub_service_type}`;

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
        message: error?.message || "Failed to fetch plan list",
      },
      { status: 500 }
    );
  }
}
