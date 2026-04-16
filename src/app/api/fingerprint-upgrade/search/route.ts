
 
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
 
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
 
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401 }
    );
  }
 
  const { searchParams } = new URL(request.url);
 

  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per-page") || "10";
  const id_number = searchParams.get("id_number") || "";
  const request_no = searchParams.get("request_no") || "";
  const msisdn = searchParams.get("msisdn") || "";
 

  const query = new URLSearchParams();
  query.append("page", page);
  query.append("per-page", perPage);
  if (id_number) query.append("id_number", id_number);
  if (request_no) query.append("request_no", request_no);
  if (msisdn) query.append("msisdn", msisdn);
 

  const backendUrl = `${API_BASE_URL}/finger-print-update/v1/finger-print-update/search?${query.toString()}`;
 
 

 
  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });
 
    const data = await res.json();
 
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Backend error" },
        { status: res.status }
      );
    }
 
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fingerprint search proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
 
 
 
 
 
 
 
 
 
 