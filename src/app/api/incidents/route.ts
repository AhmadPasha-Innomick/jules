import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../config";
import FetchData, { FetchHeaders } from "../../../lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);


    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const sortOrder = searchParams.get("sort_order");
    const status = searchParams.get("status");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let search = searchParams.get("search");
    let sortBy = searchParams.get("sort_by");

  
    const SEARCH_MAP: Record<string, string> = {
      incident_id: "incident_id",
      category: "category_name",
      created_by: "created_by",
    };

    for (const [frontendKey, backendSortBy] of Object.entries(SEARCH_MAP)) {
      if (searchParams.has(frontendKey)) {
        search = searchParams.get(frontendKey) || "";
        sortBy = backendSortBy;
        break; 
      }
    }

    
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append("limit", limit);
    if (offset) queryParams.append("offset", offset);
    if (search) queryParams.append("search", search.toLowerCase());
    if (sortBy) queryParams.append("sort_by", sortBy);
    if (sortOrder) queryParams.append("sort_order", sortOrder);
    if (status) queryParams.append("status", status);
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);


    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const apiUrl = `${baseUrl}/lookups/v1/incident-management/list?${queryParams.toString()}`;

  

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
  } catch (error) {
  

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
