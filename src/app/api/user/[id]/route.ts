import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function PUT(req: Request, ctx) {
  const { id } = await ctx.params; 

  const incomingHeaders = FetchHeaders(req);

  const body = await req.json();

  const apiUrl = `${API_BASE_URL}user/v1/user/update?id=${id}`;

  const res = await FetchData(
    apiUrl,
    {
      method: "PUT",
      headers: { ...incomingHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "no-cache"
  );

  return NextResponse.json(res.json, { status: res.status });
}
