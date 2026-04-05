import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services";
import type { RootState } from "../store";

/**
 * Auth token persistence — client-only, minimal.
 * Stores the JWT in localStorage so it survives page refreshes.
 * On logout or token clear, the key is removed.
 */
export const TOKEN_KEY = "automiq_token";

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}

type AuthState = {
  token: string | null;
  hydrated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: AuthState = {
  token: null,
  hydrated: false,
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
      saveToken(action.payload);
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
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
        saveToken(null);
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to logout";
      });
  },
});

export const { setToken, setHydrated, clearError } = authSlice.actions;

export default authSlice.reducer;