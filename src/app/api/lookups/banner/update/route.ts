import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const response = await fetchWithAuth(`/lookups/v1/banner/update?id=${id}`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (!response.ok || json?.success === false) {
      return NextResponse.json(json, { status: response.status });
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update banner" },
      { status: 500 }
    );
  }
}
