import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function POST(req: Request) {
  try {
    const incomingHeaders = FetchHeaders(req);
    const body = await req.json();

    const apiUrl = `${API_BASE_URL}/user/v1/auth/edit`;

    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: { ...incomingHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      "no-cache"
    );

    const data = await res.json;
    

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error in /api/auth/edit:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
