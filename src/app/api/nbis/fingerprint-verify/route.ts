import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const cpr = searchParams.get("cpr");

    if (!cpr) {
        return NextResponse.json(
            { success: false, message: "CPR missing" },
            { status: 400 }
        );
    }

    const isoBuffer = await req.arrayBuffer();




    if (!isoBuffer || isoBuffer.byteLength < 100) {
        return NextResponse.json(
            { success: false, message: "Invalid ISO template" },
            { status: 400 }
        );
    }

    const nbisUrl = `https://nbisapi.app.gov.bh/api/v2/persons/${cpr}/finger/verify`;

    const nbisResp = await fetch(nbisUrl, {
        method: "POST",
        headers: {
            "x-api-key": process.env.NBIS_API_KEY!,
            Authorization: process.env.NBIS_AUTH!,
            "api-version": "v2",
            "req-timestamp": Date.now().toString(),
            "transaction-type": "NewSim",
            "Content-Type": "application/octet-stream",
            "allow-duplicate": "true",
            "include-metadata": "true",
            "cache-control": "no-cache",
        },
        body: Buffer.from(isoBuffer),
    });

    const text = await nbisResp.text();

    if (!nbisResp.ok) {
        return NextResponse.json(
            {
                success: false,
                status: nbisResp.status,
                message: "NBIS fingerprint verification failed",
                raw: text,
            },
            { status: nbisResp.status }
        );
    }

    const json = JSON.parse(text);
    return NextResponse.json({ success: true, ...json });
}

