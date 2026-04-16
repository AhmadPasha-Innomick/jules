import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData from "../../../../lib/fetchData";

export async function POST(request: Request) {
  try {

    const cookieHeader = request.headers.get("cookie") || "";
    const accessTokenMatch = cookieHeader.match(/accessToken=([^;]*)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error_code: 401,
          message: "Unauthorized: No access token provided",
          data: null,
        },
        { status: 401 }
      );
    }


    const body = await request.json();

    if (!body?.group_user_id) {
      return NextResponse.json(
        {
          success: false,
          error_code: 400,
          message: "group_user_id is required",
          data: null,
        },
        { status: 400 }
      );
    }

 
    const backendHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const apiUrl = `${API_BASE_URL}group/v1/group/unassign`;


    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify({
          group_user_id: body.group_user_id,
        }),
      },
      "no-cache"
    );

 
    return NextResponse.json(res.json || res, {
      status: res.status || 200,
    });
  } catch (error: any) {
    console.error("Error in group unassign proxy:", error);

    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: "Failed to unassign user from group",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
