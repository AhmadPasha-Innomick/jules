import { API_BASE_URL } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }


    const { searchParams } = new URL(req.url);


    if (!searchParams.has("limit")) searchParams.set("limit", "1000");
    if (!searchParams.has("offset")) searchParams.set("offset", "0");


    const backendURL = `${API_BASE_URL}/user/v1/user/export?${searchParams.toString()}`;

    const response = await fetch(backendURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/csv",
      },
      cache: "no-store",
    });

    const blob = await response.blob();

    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": response.headers.get("content-disposition"),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
