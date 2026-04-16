import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData from "@/lib/fetchData";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.module_group_id || !body.service_typeID) {
      return NextResponse.json(
        {
          success: false,
          message: "module_group_id and service_typeID are required",
        },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const accessTokenMatch = cookieHeader.match(/accessToken=([^;]*)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const apiUrl = `${API_BASE_URL}/module-management/v1/service-link/link-group`;

    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify(body),
      },
      "no-cache"
    );

    const data = res.json || res;
    return NextResponse.json(data, { status: res.status || 200 });
  } catch (error: any) {
    console.error("Service Link API Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to link service",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
