import { NextResponse } from "next/server";
export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      success: false,
      error_code: 4003,
      message: "Plan tier create is disabled by specification. Use update/import flows.",
    },
    { status: 405 }
  );
}
