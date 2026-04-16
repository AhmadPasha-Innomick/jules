import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../config";
import FetchData, { FetchHeaders } from "../../../lib/fetchData";

export async function GET(request: Request) {
  const incomingHeaders = FetchHeaders(request);


  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (userId) {


    const apiUrl = `${API_BASE_URL}user/v1/auth/users/${userId}`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: incomingHeaders,
      },
      "no-cache"
    );


    return Response.json(res);
  } else {

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "";
    const sortOrder = searchParams.get("sortOrder") || "asc";

 
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    if (search) {
      queryParams.append("search", search);
    }

    if (status) {
      queryParams.append("status", status);
    }

    if (sortBy) {
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);
    }

    const apiUrl = `${API_BASE_URL}user/v1/auth/users?${queryParams.toString()}`;

    const res = await FetchData(
      apiUrl,
      {
        method: "GET",
        headers: incomingHeaders,
      },
      "no-cache"
    );

    return Response.json(res);
  }
}

export async function POST(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();



    const apiUrl = `${API_BASE_URL}user/v1/user/create`;

    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      "no-cache"
    );


    return NextResponse.json(res.json, { status: res.status });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);

  
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

  

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error_code: 400,
          message: "User ID is required for deletion",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}user/v1/auth/users?id=${userId}`;

    const res = await FetchData(
      apiUrl,
      {
        method: "DELETE",
        headers: incomingHeaders,
      },
      "no-cache"
    );



    return NextResponse.json(res);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error_code: 500,
        message: error.message? error.message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
