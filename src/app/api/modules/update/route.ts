
import { NextResponse } from "next/server";
import FetchData, { FetchHeaders } from "@/lib/fetchData";
import { API_BASE_URL } from "@/config";

export async function PUT(request: Request) {
  try {
    const incomingHeaders = FetchHeaders(request);
    const body = await request.json();

    const { module_id, module_name, module_category, module_desc, is_active } = body;

    if (!module_id) {
      return NextResponse.json(
        { success: false, message: "module_id is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}module-management/v1/module/update`;

    const res = await FetchData(apiUrl, {
      method: "PUT",
      headers: {
        ...incomingHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        module_id: Number(module_id),
        module_name: module_name?.trim(),
        module_category: module_category?.trim(),
        module_desc: module_desc?.trim(),
        is_active: is_active === 1 || is_active === true ? 1 : 0,
      }),
    });


  return NextResponse.json(
  {
    ...res.json,
    message: res.json?.message || "Module updated successfully!",
  },
  { status: res.status }
);
  } catch (error: any) {
    console.error("Update Module Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update module" },
      { status: 500 }
    );
  }
}