import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("device_id");

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "device_id is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}product-catalogue/v1/device/detail?device_id=${encodeURIComponent(deviceId)}`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: incomingHeaders,
      },
      "no-cache"
    );

    if (!res) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch device details",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch device details",
      },
      { status: 500 }
    );
  }
}
