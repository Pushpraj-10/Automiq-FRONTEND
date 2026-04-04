import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardService } from "../../services";
import type { DashboardSummary } from "../../types";
import type { RootState } from "../store";

type DashboardState = {
  summary?: DashboardSummary;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: DashboardState = {
  status: "idle",
};

export const fetchSummary = createAsyncThunk("dashboard/fetchSummary", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return dashboardService.getSummary(token);
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch dashboard summary";
      });
  },
});

export const { clearError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
