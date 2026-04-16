import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort_by") || "order_by";
    const sortOrder = searchParams.get("sort_order") || "asc";

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalogue type is required",
        },
        { status: 400 }
      );
    }

    let apiUrl = `${API_BASE_URL}product-catalogue/v1/product-catalogue/list?type=${type}`;

    apiUrl += `&limit=${limit}&offset=${offset}`;
    apiUrl += `&sort_by=${encodeURIComponent(sortBy)}&sort_order=${encodeURIComponent(
      sortOrder
    )}`;

    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: {
          ...incomingHeaders,
        },
      },
      "no-cache"
    );

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch catalogue",
      },
      { status: 500 }
    );
  }
}
