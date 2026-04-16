import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);

    const apiUrl = `${API_BASE_URL}user/v1/auth/me`;

    const res = await FetchData(apiUrl, {
      method: "GET",
      headers: incomingHeaders,
    });

    return NextResponse.json(res, { status: res.status });
  } catch (err) {
    console.error("API Error (auth/me):", err);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
