import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ incident_id: string }> }
) {
  const { incident_id } = await params;

  if (!incident_id) {
    return NextResponse.json(
      { success: false, message: "Incident ID is required" },
      { status: 400 }
    );
  }

  const incomingHeaders = FetchHeaders(request);
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/lookups/v1/incident-management/view?incident_id=${incident_id}`;

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
