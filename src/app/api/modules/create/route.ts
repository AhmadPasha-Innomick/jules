
import { NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../config";
import FetchData, { FetchHeaders } from "../../../../lib/fetchData";

export async function POST(request: Request) {
  try {

    const incomingHeaders = FetchHeaders(request);


    const body = await request.json();


    const { module_name, module_slug, module_category, module_desc, is_active } = body;

    if (!module_name || !module_slug || !module_category || !module_desc) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

   
    const apiUrl = `${API_BASE_URL}module-management/v1/module/create`;

    const res = await FetchData(
      apiUrl,
      {
        method: "POST",
        headers: {
          ...incomingHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module_name: module_name.trim(),
          module_slug: module_slug.trim(),
          module_category: module_category.trim(),
          module_desc: module_desc.trim(),
          is_active: is_active === 1 || is_active === true ? 1 : 0,
        }),
      },
      "no-cache"
    );

  

    return NextResponse.json(res.json, { status: res.status });
  } catch (error: any) {
    console.error("CREATE MODULE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}