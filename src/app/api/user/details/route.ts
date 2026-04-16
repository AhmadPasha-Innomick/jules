import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData from "../../../../lib/fetchData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID missing" },
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

  const apiUrl = `${API_BASE_URL}user/v1/user/details?id=${userId}`;


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

  return NextResponse.json(res.json, { status: res.status });
}