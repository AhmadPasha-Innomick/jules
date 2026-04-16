import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function POST(req: Request) {
  try {
    const { log_id } = await req.json();

    if (!log_id) {
      return NextResponse.json(
        { success: false, message: "log_id is required" },
        { status: 400 }
      );
    }

    const result = await FetchData(
      `${API_BASE_URL}/log-management/v1/log/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...FetchHeaders(req),
        },
        body: JSON.stringify({ log_id }),
      },
      "no-cache"
    );

   
    return NextResponse.json(result.json, { status: result.status });
  } catch (error: any) {
    console.error("Delete log API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete log",
      },
      { status: 500 }
    );
  }
}