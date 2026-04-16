import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function PUT(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

    const apiUrl = `${API_BASE_URL}product-catalogue/v1/device/update`;

    const res = await FetchData(
      apiUrl,
      {
        method: "PUT",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      "no-cache"
    );

    if (!res) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update device",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update device",
      },
      { status: 500 }
    );
  }
}
