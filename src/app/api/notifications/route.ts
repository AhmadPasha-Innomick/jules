
import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../config";
import FetchData, { FetchHeaders } from "../../../lib/fetchData";

export async function GET(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const { searchParams } = new URL(request.url);

 
    const page = searchParams.get("page");
    const per_page = searchParams.get("per_page");
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const group_id = searchParams.get("group_id");
    const from_date = searchParams.get("from_date");
    const to_date = searchParams.get("to_date");
    const sort_by = searchParams.get("sort_by");
    const sort_order = searchParams.get("sort_order");

    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page);
    if (per_page) queryParams.append("per_page", per_page);
    if (q) queryParams.append("q", q);
    if (category) queryParams.append("category", category);
    if (group_id) queryParams.append("group_id", group_id);
    if (from_date) queryParams.append("from_date", from_date);
    if (to_date) queryParams.append("to_date", to_date);
    if (sort_by) queryParams.append("sort_by", sort_by);
    if (sort_order) queryParams.append("sort_order", sort_order);

    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const apiUrl = `${baseUrl}/notification/v1/notification/list?${queryParams.toString()}`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: incomingHeaders,
      },
      "no-cache"
    );

    if (!res) {
      return NextResponse.json({ message: "Backend unreachable" }, { status: 502 });
    }

    return NextResponse.json(res.json, { status: res.status });
  } catch (error) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}