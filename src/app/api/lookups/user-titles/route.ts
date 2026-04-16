import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);

  const apiUrl = `${API_BASE_URL}lookups/v1/lookups/get-user-titles`;

  const res = await FetchData(
    apiUrl,
    {
      method: "GET",
      headers: incomingHeaders,
    },
    "no-cache"
  );

  return NextResponse.json(res.json, { status: res.status });
}
