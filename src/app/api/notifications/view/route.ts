import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Notification ID is required" },
      { status: 400 }
    );
  }

  const incomingHeaders = FetchHeaders(request);

  const apiUrl = `${API_BASE_URL}/notification/v1/notification/view?id=${id}`;

  const res = await FetchData(
    apiUrl,
    {
      method: "GET",
      headers: incomingHeaders,
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
}