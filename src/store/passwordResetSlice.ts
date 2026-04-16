
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface PasswordResetState {
  step: "username" | "otp" | "success";
  username: string;
  resetToken: string | null;
  tokenExpiresAt: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PasswordResetState = {
  step: "username",
  username: "",
  resetToken: null,
  tokenExpiresAt: null,
  status: "idle",
  error: null,
};

export const sendOtp = createAsyncThunk(
  "passwordReset/sendOtp",
  async (username: string, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (!data.success) {
        return rejectWithValue(data.message);
      }

      return { username };
    } catch (err) {
      return rejectWithValue(`Error: ${(err as Error).message}`);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "passwordReset/verifyOtp",
  async (
    { username, otp }: { username: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ username, otp }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!data.success) {
        return rejectWithValue(data.message);
      }

      return {
        token: data.data.token,
        expiresAt: data.data.token_expires_at,
      };
    } catch (err) {
      return rejectWithValue(`Error: ${(err as Error).message}`);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "passwordReset/resetPassword",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!data.success) {
        return rejectWithValue(data.message);
      }

      return true;
    } catch (err) {
      return rejectWithValue(`Error: ${(err as Error).message}`);
    }
  }
);



const passwordResetSlice = createSlice({
  name: "passwordReset",
  initialState,
  reducers: {
    resetFlow: () => initialState,
    completeReset: () => initialState
  },
  extraReducers: (builder) => {
    builder
   
      .addCase(sendOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.step = "otp";
        state.username = action.payload.username;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

  
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.step = "success";
        state.resetToken = action.payload.token;
        state.tokenExpiresAt = action.payload.expiresAt;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      

   
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.step = "success";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetFlow , completeReset} = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
