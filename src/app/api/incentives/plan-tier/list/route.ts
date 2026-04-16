import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const offset = Math.max(0, (page - 1) * limit);

  const queryParams = new URLSearchParams();
  queryParams.append("limit", String(limit));
  queryParams.append("offset", String(offset));

  const search = searchParams.get("search");
  if (search) queryParams.append("search", search);

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || "desc";
  if (sortBy) {
    queryParams.append("sort_by", sortBy);
    queryParams.append("sort_order", sortOrder);
  }

  const apiUrl = `${API_BASE_URL}incentive-management/v1/incentive-plan-tier/list?${queryParams.toString()}`;
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
