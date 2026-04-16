import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params; 

  const incomingHeaders = FetchHeaders(req);
  const body = await req.json();

  const apiUrl = `${API_BASE_URL}lookups/v1/banner/update?id=${id}`;

  const res = await FetchData(
    apiUrl,
    {
      method: "POST",
      headers: {
        ...incomingHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "no-cache"
  );

  return NextResponse.json(res.json, { status: res.status });
}
