import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../config";
import FetchData, { FetchHeaders } from "../../../lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const queryParams = new URLSearchParams();

    const allowedParams = [
      "limit",
      "offset",
      "search",
      "sort_by",
      "sort_order",
      "status",
      "start_date",
      "end_date",
    ];

    allowedParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) queryParams.append(param, value);
    });

    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const apiUrl = `${baseUrl}/lookups/v1/lead-gen/list?${queryParams}`;

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
        { message: "Backend unreachable" },
        { status: 502 }
      );
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
