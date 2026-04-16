import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData from "../../../../lib/fetchData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const incident_id = searchParams.get("incident_id");

  if (!incident_id) {
    return NextResponse.json(
      { success: false, message: "Incident ID missing" },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/lookups/v1/incident-management/view?incident_id=${incident_id}`;

  const res = await FetchData(
    apiUrl,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
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