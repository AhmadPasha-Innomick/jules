import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);
  const { searchParams } = new URL(request.url);
  const schemeCode = searchParams.get("scheme_code") || "";

  const query = new URLSearchParams();
  query.append("scheme_code", schemeCode);

  const apiUrl = `${API_BASE_URL}incentive-management/v1/incentive-scheme/detail?${query.toString()}`;
  const res = await FetchData(
    apiUrl,
    {
      method: "GET",
      headers: incomingHeaders,
    },
    "no-cache"
  );

  return NextResponse.json(res?.json, { status: res?.status || 500 });
}
