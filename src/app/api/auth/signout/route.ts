import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  
  response.cookies.set("accessToken", "", { path: "/", maxAge: -1 });
  response.cookies.set("refreshToken", "", { path: "/", maxAge: -1 });

  return response;
}
