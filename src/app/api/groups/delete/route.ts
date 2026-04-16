import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

    const apiUrl = `${API_BASE_URL}group/v1/group/delete`;

    const backendRes = await FetchData(
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


    let jsonResponse;
    try {
      jsonResponse =
        backendRes.json && typeof backendRes.json === "object"
          ? backendRes.json
          : JSON.parse(backendRes.json || "{}");
    } catch {
      jsonResponse = {
        success: false,
        message: "Invalid response from backend",
      };
    }

    return NextResponse.json(jsonResponse, { status: backendRes.status });
  } catch (error) {


    return NextResponse.json(
      {
        success: false,
       
         message: error.message? error.message: "Failed to delete groupr",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
