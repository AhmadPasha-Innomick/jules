import { NextRequest, NextResponse } from "next/server";
import FetchData from "@/lib/fetchData";
import { API_BASE_URL } from "@/config";

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();

  try {
    const data = await FetchData(
      `${API_BASE_URL}user/v1/auth/refresh`,
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: { "Content-Type": "application/json" },
      },
      "no-cache"
    );

   
    if (data === null) {
      return NextResponse.json(
        { success: false, message: "Network error. Please try again." },
        { status: 500 }
      );
    }

   
    return NextResponse.json(data.json, { status: data.status });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Your session has expired. Please sign in again"},
      { status: 401 }
    );
  }
}
