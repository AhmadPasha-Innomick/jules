import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";
    const statusTab = (searchParams.get("status") || "all").toLowerCase();
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";

    const query = new URLSearchParams();
    query.append("limit", limit);
    query.append("offset", offset);
    query.append("sort_by", sortBy);
    query.append("sort_order", sortOrder);

    if (search) {
      query.append("search", search);
    }

    if (category) {
      query.append("filter_by[category]", category);
    }

    if (brand) {
      query.append("filter_by[brand]", brand);
    }

    if (statusTab === "active") {
      query.append("status", "1");
    } else if (statusTab === "inactive") {
      query.append("status", "0");
    } else if (statusTab === "new") {
      query.append("status", "2");
    }

    const apiUrl = `${API_BASE_URL}product-catalogue/v1/device/list?${query.toString()}`;

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
        {
          success: false,
          message: "Failed to fetch device list",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch device list",
      },
      { status: 500 }
    );
  }
}
