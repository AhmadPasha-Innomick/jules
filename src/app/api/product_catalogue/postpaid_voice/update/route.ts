import { NextResponse } from "next/server";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
import { API_BASE_URL } from "@/config";

export async function PUT(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

    const apiUrl = `${API_BASE_URL}product-catalogue/v1/postpaid-voice/update`;

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

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update postpaid voice plan",
      },
      { status: 500 }
    );
  }
}
