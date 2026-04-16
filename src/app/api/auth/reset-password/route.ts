
import { NextRequest, NextResponse } from "next/server";
import { AuthRepository } from "@/repositories/AuthRepository";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password required" },
        { status: 400 }
      );
    }

    await AuthRepository.resetPassword(token, newPassword);

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}