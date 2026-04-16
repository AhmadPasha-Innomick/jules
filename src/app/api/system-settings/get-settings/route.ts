import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  const headers = FetchHeaders(request);

  const apiUrl = `${API_BASE_URL}password-management/v1/system-settings/get-settings`;

  const res = await FetchData(
    apiUrl,
    {
      method: "GET",
      headers,
    },
    "no-cache"
  );

  return NextResponse.json(res.json, { status: res.status });
}
