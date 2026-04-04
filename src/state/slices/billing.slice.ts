import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { billingService } from "../../services";
import type { CheckoutSession } from "../../types";
import type { RootState } from "../store";

type BillingState = {
  checkout?: CheckoutSession;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: BillingState = {
  status: "idle",
};

export const createCheckout = createAsyncThunk(
  "billing/createCheckout",
  async (priceId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return billingService.createCheckout(token, priceId);
  },
);

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    clearCheckout(state) {
      state.checkout = undefined;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.checkout = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to create checkout";
      });
  },
});

export const { clearCheckout, clearError } = billingSlice.actions;

export default billingSlice.reducer;
