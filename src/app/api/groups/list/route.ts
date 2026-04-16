import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);
  const { searchParams } = new URL(request.url);

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  const search = searchParams.get("search") || "";
  const isActive = searchParams.get("is_active") || "";
  const isLocked = searchParams.get("is_locked") || "";

  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const queryParams = new URLSearchParams();

  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    queryParams.append("limit", limit);
    queryParams.append("offset", offset.toString());
  }

  if (search) queryParams.append("search", search);

  if (isActive) queryParams.append("filter_by[is_active]", isActive);
  if (isLocked) queryParams.append("filter_by[is_locked]", isLocked);

  if (sortBy) {
    queryParams.append("sort_by", sortBy);
    queryParams.append("sort_order", sortOrder);
  }

  const apiUrl = `${API_BASE_URL}group/v1/group/list?${queryParams.toString()}`;

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
