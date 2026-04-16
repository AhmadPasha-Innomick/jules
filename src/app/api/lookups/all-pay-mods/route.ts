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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

   
    const apiUrl = `${API_BASE_URL}/lookups/v1/lookups/get-all-pay-mods`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: backendHeaders,
      },
      "no-cache"
    );

    const data = res.json || res; 

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("All PayMods API Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment modes",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
