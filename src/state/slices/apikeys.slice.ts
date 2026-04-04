import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiKeysService } from "../../services";
import type { ApiKeyRecord } from "../../types";
import type { RootState } from "../store";

type ApiKeysState = {
  items: ApiKeyRecord[];
  lastCreated?: { apiKey: string; record: ApiKeyRecord };
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: ApiKeysState = {
  items: [],
  status: "idle",
};

export const fetchApiKeys = createAsyncThunk("apiKeys/fetchAll", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return apiKeysService.listApiKeys(token);
});

export const createApiKey = createAsyncThunk(
  "apiKeys/create",
  async (name: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return apiKeysService.createApiKey(token, name);
  },
);

export const revokeApiKey = createAsyncThunk(
  "apiKeys/revoke",
  async (apiKeyId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    await apiKeysService.revokeApiKey(token, apiKeyId);
    return apiKeyId;
  },
);

const apiKeysSlice = createSlice({
  name: "apiKeys",
  initialState,
  reducers: {
    clearLastCreated(state) {
      state.lastCreated = undefined;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiKeys.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch API keys";
      })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.lastCreated = action.payload;
        state.items.unshift(action.payload.record);
      })
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearLastCreated, clearError } = apiKeysSlice.actions;

export default apiKeysSlice.reducer;
