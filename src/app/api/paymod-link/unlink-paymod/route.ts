import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData from "@/lib/fetchData";

export async function POST(request: Request) {
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

    const body = await request.json();

    const res = await FetchData(
      `${API_BASE_URL}module-management/v1/pay-mod-link/unlink-paymod`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json(res.json || res, {
      status: res.status || 200,
    });
  } catch (error: any) {
    console.error("Unlink paymode error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to unlink payment mode",
      },
      { status: 500 }
    );
  }
}
