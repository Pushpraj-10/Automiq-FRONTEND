import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dispatchService } from "../../services";
import type { DispatchExecution, ExecutionStep } from "../../types";
import type { RootState } from "../store";

type DispatchState = {
  executions: DispatchExecution[];
  current?: DispatchExecution;
  steps: ExecutionStep[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: DispatchState = {
  executions: [],
  steps: [],
  status: "idle",
};

export const enqueueWorkflow = createAsyncThunk(
  "dispatch/enqueue",
  async (workflowId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return dispatchService.enqueueWorkflow(token, workflowId);
  },
);

export const fetchExecutions = createAsyncThunk("dispatch/fetchAll", async (limit: number | undefined, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return dispatchService.listExecutions(token, limit);
});

export const fetchExecution = createAsyncThunk(
  "dispatch/fetchOne",
  async (executionId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return dispatchService.getExecution(token, executionId);
  },
);

export const fetchExecutionSteps = createAsyncThunk(
  "dispatch/fetchSteps",
  async (
    input: { executionId: string; limit?: number },
    { getState },
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return dispatchService.getExecutionSteps(token, input.executionId, input.limit);
  },
);

export const replayExecution = createAsyncThunk(
  "dispatch/replay",
  async (executionId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return dispatchService.replayExecution(token, executionId);
  },
);

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = undefined;
      state.steps = [];
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enqueueWorkflow.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(enqueueWorkflow.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.executions.unshift(action.payload);
      })
      .addCase(enqueueWorkflow.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to enqueue workflow";
      })
      .addCase(fetchExecutions.fulfilled, (state, action) => {
        state.executions = action.payload;
      })
      .addCase(fetchExecution.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchExecutionSteps.fulfilled, (state, action) => {
        state.current = action.payload.execution as DispatchExecution;
        state.steps = action.payload.steps as ExecutionStep[];
      })
      .addCase(replayExecution.fulfilled, (state, action) => {
        state.executions.unshift(action.payload);
      });
  },
});

export const { clearCurrent, clearError } = dispatchSlice.actions;

export default dispatchSlice.reducer;
