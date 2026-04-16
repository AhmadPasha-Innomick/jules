import { cookies } from "next/headers";
import crypto from "crypto";
import { SECRET_KEY, IDENTIFIER } from "../config";

type FetchStrategy = "cache" | "no-cache";
interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}


export default async function FetchData(
  url: string,
  options: FetchOptions = {},
  strategy: FetchStrategy = "cache"
): Promise<{ status: number; json } | null> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value ?? "en";

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(IDENTIFIER)
    .digest("hex");

  const fetchConfig: RequestInit =
    strategy === "no-cache" ? { cache: "no-store" } : { cache: "no-store" };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        lang,
        "x-stc-auth-signature": signature,
        ...(options.headers ?? {}),
      },
      ...fetchConfig,
    });


    const json = await response.json();


    return {
      status: response.status,
      json,
    };
  } catch (e) {
    console.error("FetchData error:", e);
    return null;
  }
}


export function FetchHeaders(request: Request): Record<string, string> {
  const modifiedHeaders = new Headers(request.headers);
  modifiedHeaders.delete("content-type");

  const result: Record<string, string> = {};
  modifiedHeaders.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}
