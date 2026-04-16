import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import { FetchHeaders } from "@/lib/fetchData";

export async function POST(request: Request) {
  const incomingHeaders = FetchHeaders(request);

  try {
  

    const body = {
      internal_transaction_id: "Trabs_sgshf2735735733",
      email: "rajkiran@testing@gmail.com",
      mobile_number: "12345678",
      orders: [
        {
          transaction_id: "16276386378363",
          amount: "0",
          advance_payment: "0",
        },
      ],
      payment: [],
      attachments: [
        {
          fileName: "signature.png",
          mimeType: "image/png",
          base64: "eykjdhdkjhdkjhdjdhj",
        },
      ],
    };
 

    const apiUrl = `${API_BASE_URL}/group/v1/fp-upgrade/transaction/create`;

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
     
        Accept: "application/json",
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify(body),
      cache: "no-cache",
    });


    const rawText = await backendResponse.text();

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Backend returned non-JSON:", rawText);
      return NextResponse.json(
        {
          success: false,
          message: "Backend did not return JSON",
          raw: rawText,
        },
        { status: backendResponse.status || 500 }
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Backend error",
          ...data,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
