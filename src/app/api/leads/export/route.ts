import { API_BASE_URL } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryParams = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    }

    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const backendURL = `${baseUrl}/lookups/v1/lead-gen/export?${queryParams.toString()}`;

    const response = await fetch(backendURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/csv",
      },
      cache: "no-store",
    });

    const blob = await response.blob();

    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          response.headers.get("content-disposition") ||
          'attachment; filename="leads_export.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
