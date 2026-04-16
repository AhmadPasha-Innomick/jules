import { NextRequest, NextResponse } from "next/server";
import {
  NBIS_BASE_URL,
  NBIS_API_KEY,
  NBIS_AUTH_TOKEN,
} from "@/config"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const cpr = searchParams.get("cpr");
    const serial = searchParams.get("serial");

    if (!cpr || !serial) {
      return NextResponse.json(
        { success: false, message: "Missing CPR or Serial" },
        { status: 400 }
      );
    }

    const nbisUrl = `${NBIS_BASE_URL}/api/v2/persons/${cpr}/smartcards/${serial}/status`;
   
    
    const resp = await fetch(nbisUrl, {
      method: "GET",
      headers: {
         "x-api-key": NBIS_API_KEY,
        Authorization:  NBIS_AUTH_TOKEN,
        "api-version": "v2",
        "req-timestamp": Date.now().toString(),
        "allow-duplicate": "true",
        "include-metadata": "true",
        "Cache-Control": "no-cache",
      },
    });

    const text = await resp.text();

    if (!resp.ok) {
      return NextResponse.json(
        {
          success: false,
          status: resp.status,
          message: "NBIS request failed",
          raw: text,
        },
        { status: resp.status }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
