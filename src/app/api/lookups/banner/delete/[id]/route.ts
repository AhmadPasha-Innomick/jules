import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No access token" },
        { status: 401 }
      );
    }

    const base = process.env.API_BASE_URL;
    if (!base) {
      return NextResponse.json(
        {
          success: false,
          message: "Server config error: Missing API base URL",
        },
        { status: 500 }
      );
    }

   
    const backendUrl = `${base}/lookups/v1/banner/delete?id=${id}`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(
        { success: true, message: "Banner deleted successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Banner Delete API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}