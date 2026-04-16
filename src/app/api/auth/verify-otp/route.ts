import { NextRequest, NextResponse } from "next/server";
import { AuthRepository } from "@/repositories/AuthRepository";

export async function POST(req: NextRequest) {
  try {
    const { username, otp } = await req.json();

    const raw = await AuthRepository.verifyOtp(username, otp);


    if ("success" in raw && raw.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: raw.message,
        },
        { status: 400 }
      );
    }

   
    const result = raw as { token: string; expiresAt: string };

    return NextResponse.json({
      success: true,
      error_code: 2000,
      message: "OTP Verified Successfully.",
      data: {
        token: result.token,
        token_expires_at: result.expiresAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server Error",
      },
      { status: 500 }
    );
  }
}
