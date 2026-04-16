import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData from "@/lib/fetchData";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const backendUrl = `${baseUrl}/lookups/v1/incident-management/categories`;

  try {
    const res = await FetchData(
      backendUrl,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
      "no-cache"
    );

    if (!res) {
      return NextResponse.json(
        { success: false, message: "Backend unreachable" },
        { status: 502 }
      );
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}