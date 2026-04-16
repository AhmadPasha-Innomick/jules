import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config";
import FetchData, { FetchHeaders } from "@/lib/fetchData";

export async function PUT(request: Request) {
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



    const apiUrl = `${API_BASE_URL}group/v1/group/update`;

    const res = await FetchData(
      apiUrl,
      {
        method: "PUT",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      "no-cache"
    );

    return NextResponse.json(res.json, { status: res.status });
  } catch (error) {
   
    return NextResponse.json(
      { success: false, message: "Failed to update group" },
      { status: 500 }
    );
  }
}
