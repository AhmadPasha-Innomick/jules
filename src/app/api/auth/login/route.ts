import { NextRequest, NextResponse } from "next/server";
import { AuthRepository } from "@/repositories/AuthRepository";


export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

 
    const result: {
      success?: boolean;
      message?: string;
      data?: {
        user?: { id: string | number; username: string };
        access_token: string;
        refresh_token: string;
      };
    } = await AuthRepository.login(username, password);

    if (!result || !result.success) {
      return NextResponse.json(
        { error: result?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = result.data?.user; 
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const accessToken = result.data?.access_token;

    const refreshToken = result.data?.refresh_token;

    return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
