import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData from "@/lib/fetchData";

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

 
    const apiUrl = `${API_BASE_URL}/lookups/v1/lookups/get-all-service-types`;

    const data = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: backendHeaders,
      },
      "no-cache"
    );


    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Service Types Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch service types",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
