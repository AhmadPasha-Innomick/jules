import { NextResponse } from "next/server";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
import { API_BASE_URL } from "@/config";

export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { module_id } = await request.json();

    if (!module_id) {
      return NextResponse.json(
        { success: false, message: "module_id is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}module-management/v1/module/delete`;

    const res = await FetchData(apiUrl, {
      method: "POST", 
      headers: {
        ...incomingHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ module_id }),
    });

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
      return NextResponse.json(
      { success: false, message: error.message || "Failed to delete module" },
      { status: 500 }
    );
  }
}