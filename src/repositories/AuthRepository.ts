
import { SignJWT, jwtVerify, JWTVerifyResult } from "jose";
import FetchData from "../lib/fetchData";
import { API_BASE_URL } from "../config";

interface AuthUser {
  id: string | number;
  username: string;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

type LoginSuccess = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
};

export class AuthRepository {

  static async login(
    username: string,
    password: string
  ): Promise<ApiResponse<LoginSuccess>> {
    try {
      const result = await FetchData(
        `${API_BASE_URL}user/v1/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
          headers: { "Content-Type": "application/json" },
        },
        "no-cache"
      );

 
      if (!result || result.status < 200 || result.status >= 300) {
        return { success: false, message: "Login failed" };
      }

      const data = result.json as ApiResponse<LoginSuccess>;

  
      if (!data.success || !data.data?.user || !data.data?.access_token) {
        return {
          success: false,
          message: data.message || "Invalid login response",
        };
      }

      return data;
    } catch (error) {
      console.error("AuthRepository.login() error:", error);
      return { success: false, message: "Network error" };
    }
  }


  static async verifyOtp(
    username: string,
    otp: string
  ): Promise<
    { token: string; expiresAt: string } | { success: false; message: string }
  > {
    try {
      const result = await FetchData(
        `${API_BASE_URL}/user/v1/auth/verify-otp`,
        {
          method: "POST",
          body: JSON.stringify({ user_name: username, otp }),
          headers: { "Content-Type": "application/json" },
        },
        "no-cache"
      );

      if (!result || result.status < 200 || result.status >= 300) {
        return { success: false, message: "Invalid OTP" };
      }

      const api = result.json as ApiResponse<{
        token: string;
        token_expires_at: string;
      }>;

      if (!api.success || !api.data?.token) {
        return { success: false, message: api.message || "Invalid OTP" };
      }

      return {
        token: api.data.token,
        expiresAt: api.data.token_expires_at,
      };
    } catch (error) {
      console.error("verifyOtp() error:", error);
      return { success: false, message: "Verification failed" };
    }
  }


  static async sendOtp(username: string): Promise<ApiResponse> {
    try {
      const result = await FetchData(
        `${API_BASE_URL}/user/v1/auth/send-otp`,
        {
          method: "POST",
          body: JSON.stringify({ user_name: username }),
          headers: { "Content-Type": "application/json" },
        },
        "no-cache"
      );

      if (!result || result.status < 200 || result.status >= 300) {
        return { success: false, message: "Failed to send OTP" };
      }

      return result.json as ApiResponse;
    } catch (error) {
      console.error("sendOtp() error:", error);
      return { success: false, message: "Failed to send OTP" };
    }
  }


  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse> {
    try {
      const result = await FetchData(
        `${API_BASE_URL}/user/v1/auth/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({ token, password: newPassword }),
          headers: { "Content-Type": "application/json" },
        },
        "no-cache"
      );

      if (!result || result.status < 200 || result.status >= 300) {
        return { success: false, message: "Reset failed" };
      }

      return result.json as ApiResponse;
    } catch (error) {
      console.error("resetPassword() error:", error);
      return { success: false, message: "Reset failed" };
    }
  }


  static async verifyToken(token: string): Promise<JWTVerifyResult | null> {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY || "secret");
    try {
      return await jwtVerify(token, secret);
    } catch {
      return null;
    }
  }

  static async generateTokens(user: AuthUser) {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY || "secret");

    const accessToken = await new SignJWT({
      sub: String(user.id),
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    const refreshToken = await new SignJWT({ sub: String(user.id) })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    return { accessToken, refreshToken };
  }
}
