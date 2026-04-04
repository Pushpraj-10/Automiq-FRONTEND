import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { eventsService } from "../../services";
import type { EventPreview, EventRecord } from "../../types";
import type { RootState } from "../store";

type EventsState = {
  items: EventRecord[];
  preview?: EventPreview;
  lastIngestResult?: { event: EventRecord; duplicate: boolean; executionIds: string[] };
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: EventsState = {
  items: [],
  status: "idle",
};

export const ingestEvent = createAsyncThunk(
  "events/ingest",
  async (
    input: {
      apiKey: string;
      idempotencyKey: string;
      source?: string;
      eventType: string;
      payloadJson?: Record<string, unknown>;
    },
  ) => {
    return eventsService.ingestEvent(input);
  },
);

export const fetchEvents = createAsyncThunk("events/fetchAll", async (limit: number | undefined, { getState }) => {
  const state = getState() as RootState;
  const token = state.auth.token;
  if (!token) throw new Error("Missing auth token");
  return eventsService.listMyEvents(token, limit);
});

export const previewEvent = createAsyncThunk(
  "events/preview",
  async (workflowId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Missing auth token");
    return eventsService.previewEvent(token, workflowId);
  },
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearPreview(state) {
      state.preview = undefined;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ingestEvent.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(ingestEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastIngestResult = action.payload;
        state.items.unshift(action.payload.event);
      })
      .addCase(ingestEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to ingest event";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(previewEvent.fulfilled, (state, action) => {
        state.preview = action.payload;
      });
  },
});

export const { clearPreview, clearError } = eventsSlice.actions;

export default eventsSlice.reducer;
