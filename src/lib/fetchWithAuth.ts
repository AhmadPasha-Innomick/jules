"use client";

import Cookies from "js-cookie";
import { store } from "@/store/store";
import { refreshTokenThunk, logout } from "@/store/authSlice";

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const REFRESH_ENDPOINT = "/api/auth/refresh";

const normalizeHeaders = (
  headers: RequestInit["headers"] = {}
): Record<string, string> => {
  const result: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      if (key && value) result[key] = value;
    });
  } else if (headers && typeof headers === "object") {
    Object.assign(result, headers);
  }

  return result;
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const getToken = () => Cookies.get("accessToken");

  const buildHeaders = (token?: string): Record<string, string> => {
    const base = normalizeHeaders(options.headers);

    const headers: Record<string, string> = { ...base };

    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  let accessToken = getToken();

  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(accessToken || undefined),
  });

  if (response.status === 401 && !url.includes(REFRESH_ENDPOINT)) {
   
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = store
        .dispatch(refreshTokenThunk())
        .unwrap()
        .catch((err) => {
          store.dispatch(logout());
          throw err;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;

      accessToken = getToken();
      if (!accessToken) {
        store.dispatch(logout());
        throw new Error("No access token after refresh");
      }

      response = await fetch(url, {
        ...options,
        headers: buildHeaders(accessToken),
      });
    } catch {
      throw new Error("Session expired");
    }
  }

  return response;
}
