import { API_BASE_URL } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit");
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
    if (search) queryParams.append("search", search.toLowerCase());
    if (sortBy) queryParams.append("sort_by", sortBy);
    if (sortOrder) queryParams.append("sort_order", sortOrder);
    if (status) queryParams.append("status", status);
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);

    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const backendURL = `${baseUrl}/lookups/v1/incident-management/export?${queryParams.toString()}`;

    const response = await fetch(backendURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/csv",
      },
      cache: "no-store",
    });

    const blob = await response.blob();

    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          response.headers.get("content-disposition") ||
          'attachment; filename="incidents_export.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
