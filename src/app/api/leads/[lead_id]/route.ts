import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const { lead_id } = await params;

  const incomingHeaders = FetchHeaders(request);

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/lookups/v1/lead-gen/view?lead_id=${lead_id}`;

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
      { message: "Backend unreachable" },
      { status: 502 }
    );
  }

  return NextResponse.json(res.json, { status: res.status });
}
