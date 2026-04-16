import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData from "@/lib/fetchData";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.module_group_id || !body.mpos_paymode_id) {
      return NextResponse.json(
        {
          success: false,
          message: "module_group_id and mpos_paymode_id are required",
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

    const apiUrl = `${API_BASE_URL}/module-management/v1/pay-mod-link/link-group`;

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
    console.error("Paymod Link API Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to link payment mode",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
