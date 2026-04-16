
import { NextRequest, NextResponse } from "next/server";
import { AuthRepository } from "@/repositories/AuthRepository";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    const result = await AuthRepository.sendOtp(username);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}