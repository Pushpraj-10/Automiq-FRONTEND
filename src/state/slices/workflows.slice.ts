import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { workflowsService } from "../../services";
import type { Workflow } from "../../types";
import type { RootState } from "../store";

type WorkflowsState = {
  items: Workflow[];
  selected?: Workflow;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: WorkflowsState = {
  items: [],
  status: "idle",
};

export const fetchWorkflows = createAsyncThunk("workflows/fetchAll", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return workflowsService.listWorkflows(token);
});

export const createWorkflow = createAsyncThunk(
  "workflows/create",
  async (
    input: {
      name: string;
      description?: string;
      status?: Workflow["status"];
      maxSteps?: number;
      triggerEventType?: string;
      triggerSource?: string;
    },
    { getState },
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return workflowsService.createWorkflow(token, input);
  },
);

export const getWorkflow = createAsyncThunk(
  "workflows/get",
  async (workflowId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return workflowsService.getWorkflow(token, workflowId);
  },
);

export const updateWorkflow = createAsyncThunk(
  "workflows/update",
  async (
    input: {
      workflowId: string;
      changes: Partial<Pick<Workflow, "name" | "description" | "status" | "triggerEventType" | "triggerSource">>;
    },
    { getState },
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return workflowsService.updateWorkflow(token, input.workflowId, input.changes);
  },
);

export const deleteWorkflow = createAsyncThunk(
  "workflows/delete",
  async (workflowId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    await workflowsService.deleteWorkflow(token, workflowId);
    return workflowId;
  },
);

const workflowsSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = undefined;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch workflows";
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(getWorkflow.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = undefined;
      });
  },
});

export const { clearSelected, clearError } = workflowsSlice.actions;

export default workflowsSlice.reducer;
