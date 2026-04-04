import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { usersService } from "../../services";
import type { User } from "../../types";
import type { RootState } from "../store";

type UsersState = {
  current?: User;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: UsersState = {
  status: "idle",
};

export const fetchCurrentUser = createAsyncThunk("users/fetchCurrent", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return usersService.getCurrentUser(token);
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUser(state) {
      state.current = undefined;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch current user";
      });
  },
});

export const { clearUser, clearError } = usersSlice.actions;

export default usersSlice.reducer;
