import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config"; 
import FetchData from "@/lib/fetchData"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { incident_id, resolution_note } = body;

    
    if (!incident_id || !resolution_note?.trim()) {
      return NextResponse.json(
        { success: false, message: "Incident ID and resolution note are required" },
        { status: 400 }
      );
    }

    
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

  
    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const backendUrl = `${baseUrl}/lookups/v1/incident-management/close`;

    const res = await FetchData(
      backendUrl,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incident_id, resolution_note }),
      },
      "no-cache"
    );

    if (!res) {
      return NextResponse.json(
        { success: false, message: "Backend unreachable" },
        { status: 502 }
      );
    }

    
    const data = res.json;

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
  
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET() {
  return NextResponse.json(
    { message: "Method GET not allowed" },
    { status: 405 }
  );
}
