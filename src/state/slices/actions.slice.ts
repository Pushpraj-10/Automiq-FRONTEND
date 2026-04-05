import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { actionsService } from "../../services";
import type {
  ActionCatalogEntry,
  ActionType,
  StepValidationResult,
  WorkflowAction,
  WorkflowValidationResult,
} from "../../types";
import type { RootState } from "../store";

type ActionsState = {
  catalog: ActionCatalogEntry[];
  types: ActionType[];
  items: WorkflowAction[];
  byWorkflow: Record<string, WorkflowAction[]>;
  lastStepValidation?: StepValidationResult;
  lastWorkflowValidation?: WorkflowValidationResult;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: ActionsState = {
  catalog: [],
  types: [],
  items: [],
  byWorkflow: {},
  status: "idle",
};

export const fetchCatalog = createAsyncThunk("actions/fetchCatalog", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return actionsService.getCatalog(token);
});

export const fetchActionTypes = createAsyncThunk("actions/fetchTypes", async (_, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return actionsService.getActionTypes(token);
});

export const validateStep = createAsyncThunk(
  "actions/validateStep",
  async (step: unknown, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return actionsService.validateStep(token, step);
  },
);

export const validateWorkflow = createAsyncThunk(
  "actions/validateWorkflow",
  async (steps: unknown[], { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return actionsService.validateWorkflow(token, steps);
  },
);

export const fetchMyActions = createAsyncThunk("actions/fetchMy", async (limit: number | undefined, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return actionsService.listMyActions(token, limit);
});

export const fetchWorkflowActions = createAsyncThunk(
  "actions/fetchWorkflow",
  async (workflowId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return { workflowId, actions: await actionsService.listWorkflowActions(token, workflowId) };
  },
);

export const saveWorkflowAction = createAsyncThunk(
  "actions/save",
  async (
    input: {
      workflowId: string;
      stepNumber: number;
      type: ActionType;
      name?: string;
      config: Record<string, unknown>;
      onFailure?: Record<string, unknown>;
      isActive?: boolean;
      nodeId?: string;
      position?: { x: number; y: number };
      editorMeta?: Record<string, unknown>;
    },
    { getState },
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return actionsService.upsertWorkflowAction(token, input.workflowId, input.stepNumber, input);
  },
);

export const deleteAction = createAsyncThunk(
  "actions/delete",
  async (actionId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    await actionsService.deleteAction(token, actionId);
    return actionId;
  },
);

const actionsSlice = createSlice({
  name: "actions",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.catalog = action.payload;
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch catalog";
      })
      .addCase(fetchActionTypes.fulfilled, (state, action) => {
        state.types = action.payload;
      })
      .addCase(validateStep.fulfilled, (state, action) => {
        state.lastStepValidation = action.payload;
      })
      .addCase(validateWorkflow.fulfilled, (state, action) => {
        state.lastWorkflowValidation = action.payload;
      })
      .addCase(fetchMyActions.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchWorkflowActions.fulfilled, (state, action) => {
        state.byWorkflow[action.payload.workflowId] = action.payload.actions;
      })
      .addCase(saveWorkflowAction.fulfilled, (state, action) => {
        const updated = action.payload;
        const list = state.byWorkflow[updated.workflowId] || [];
        const index = list.findIndex((item) => item.id === updated.id);
        if (index >= 0) list[index] = updated;
        else list.push(updated);
        state.byWorkflow[updated.workflowId] = list;
      })
      .addCase(deleteAction.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        Object.keys(state.byWorkflow).forEach((key) => {
          state.byWorkflow[key] = state.byWorkflow[key].filter((item) => item.id !== action.payload);
        });
      });
  },
});

export const { clearError } = actionsSlice.actions;

export default actionsSlice.reducer;
