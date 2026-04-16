import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../../config";
import FetchData from "../../../../../lib/fetchData";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const accessTokenMatch = cookieHeader.match(/accessToken=([^;]*)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error_code: 401,
          message: "Unauthorized: No access token provided",
          data: null,
        },
        { status: 401 }
      );
    }

    const backendHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort_by") || "";
    const sortOrder = searchParams.get("sort_order") || "";

    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit);
    queryParams.append("offset", offset);

    if (search) queryParams.append("search", search);
    if (status !== "") queryParams.append("status", status);
    if (sortBy) queryParams.append("sort_by", sortBy);
    if (sortOrder) queryParams.append("sort_order", sortOrder);

    const apiUrl = `${API_BASE_URL}module-management/v1/selected-id-type-link/list?${queryParams.toString()}`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: backendHeaders,
      },
      "no-cache"
    );

    return NextResponse.json(res.json || res, {
      status: res.status || 200,
    });
  } catch (error: any) {
    console.error("Error in selected-id-type-link list proxy:", error);

    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: "Failed to fetch linked ID types",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
