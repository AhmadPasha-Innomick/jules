import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ?? "10";
  const offset = searchParams.get("offset") ?? "0";
  const search = searchParams.get("search") ?? "";

  const isActive = searchParams.get("is_active") ?? "";
  const isLocked = searchParams.get("is_locked") ?? "";

  const sortBy = searchParams.get("sortBy") ?? "";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const queryParams = new URLSearchParams();
  queryParams.append("limit", String(limit));
  queryParams.append("offset", String(offset));

  if (search) queryParams.append("search", search);
  if (isActive) queryParams.append("filter_by[is_active]", isActive);
  if (isLocked) queryParams.append("filter_by[is_locked]", isLocked);

  if (sortBy) {
    queryParams.append("sort_by", sortBy);
    queryParams.append("sort_order", sortOrder);
  }

  const apiUrl = `${API_BASE_URL}module-management/v1/module/list?${queryParams.toString()}`;

  const res = await FetchData(
    apiUrl,
    {
      method: "GET",
      headers: incomingHeaders,
    },
    "no-cache"
  );

  const modules = res?.json?.data?.modules ?? [];
  const totalCount = res?.json?.data?.totalCount ?? 0;

  return NextResponse.json(res.json, { status: res.status });
}
