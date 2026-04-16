
import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData from "../../../../lib/fetchData";

export async function GET(request: Request) {
 
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const apiUrl = `${API_BASE_URL}/password-management/v1/password/get-settings`;

 
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

