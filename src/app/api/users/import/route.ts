import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

    const rows = Array.isArray(body?.rows) ? body.rows : Array.isArray(body?.users) ? body.users : null;
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error_code: 422,
          message: "rows is required and must be a non-empty array",
        },
        { status: 422 }
      );
    }

    const apiUrl = `${API_BASE_URL}user/v1/user/import`;

    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
      },
      "no-cache"
    );

    if (!res) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to import users",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: error?.message || "Failed to import users",
      },
      { status: 500 }
    );
  }
}

