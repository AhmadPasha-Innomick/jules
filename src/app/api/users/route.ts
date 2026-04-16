import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../config";
import FetchData, { FetchHeaders } from "../../../lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);
  const { searchParams } = new URL(request.url);

  const queryParams = new URLSearchParams();


  const allowedParams = [
    "limit",
    "offset",
    "search_by",
    "search_value",
    "sort_by",
    "sort_order",
    "filter_by[is_active]",
    "filter_by[is_manager]",
    "filter_by[is_locked]",
    "start_date",
    "end_date",
  ];

  allowedParams.forEach((key) => {
    const value = searchParams.get(key);
    if (value) queryParams.append(key, value);
  });

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/user/v1/user/list?${queryParams.toString()}`;

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
}
