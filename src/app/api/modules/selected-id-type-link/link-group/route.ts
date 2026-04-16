import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData from "@/lib/fetchData";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
    const accessToken = tokenMatch?.[1];

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await FetchData(
      `${API_BASE_URL}module-management/v1/selected-id-type-link/link-group`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      "no-cache"
    );

    return NextResponse.json(res.json || res, {
      status: res.status || 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Failed to link ID type",
      },
      { status: 500 }
    );
  }
}
