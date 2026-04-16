import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);

  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";

  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const queryParams = new URLSearchParams();

  const limit = searchParams.get("limit") || "10";
  const offset = searchParams.get("offset") || "0"; 

  queryParams.append("limit", limit);
  queryParams.append("offset", offset.toString());

  if (search) queryParams.append("search", search);
  if (startDate) queryParams.append("start_date", startDate);
  if (endDate) queryParams.append("end_date", endDate);

  if (sortBy) {
    queryParams.append("sort_by", sortBy);
    queryParams.append("sort_order", sortOrder);
  }

  const apiUrl = `${API_BASE_URL}/log-management/v1/log/list?${queryParams.toString()}`;

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
