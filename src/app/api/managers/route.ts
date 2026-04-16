import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../config";
import FetchData, { FetchHeaders } from "../../../lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);
  const { searchParams } = new URL(request.url);

  const limit = searchParams.get("limit") || "20";
  const offset = searchParams.get("offset") || "0";

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");

  const queryParams = new URLSearchParams();

  queryParams.append("limit", limit);
  queryParams.append("offset", offset);


  queryParams.append("filter_by[is_active]", "1");
  queryParams.append("filter_by[is_manager]", "1");

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
