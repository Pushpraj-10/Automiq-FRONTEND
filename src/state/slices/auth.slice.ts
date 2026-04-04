import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services";
import type { RootState } from "../store";

type AuthState = {
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: AuthState = {
  token: null,
  status: "idle",
};

export const logout = createAsyncThunk("auth/logout", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return authService.logout(token);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "succeeded";
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to logout";
      });
  },
});

export const { setToken, clearError } = authSlice.actions;

export default authSlice.reducer;
