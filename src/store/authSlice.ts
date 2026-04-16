import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  status: "idle",
  error: null,
};
export const login = createAsyncThunk(
  "auth/login",
  async (
    { username, password }: { username: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(data.error || "Login failed");
      }

      const { accessToken, refreshToken } = data;
     Cookies.set("accessToken", accessToken, { sameSite: "lax" });
      Cookies.set("refreshToken", refreshToken, { sameSite: "lax" });
      Cookies.set("username", username, { sameSite: "lax" });

      return { accessToken, refreshToken, username };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });

      return true;
    } catch {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    const refreshToken = Cookies.get("refreshToken");

    if (!refreshToken) {
      return thunkAPI.rejectWithValue(null);
    }

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          "Session expired. Please sign in again."
        );
      }

      const data = await res.json();
      const { access_token: accessToken } = data.data;

      Cookies.set("accessToken", accessToken, { sameSite: "lax" });
  
      return { accessToken };
    } catch (err) {
      return thunkAPI.rejectWithValue("Session expired. Please sign in again.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
