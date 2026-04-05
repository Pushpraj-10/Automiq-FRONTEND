"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import type { DispatchExecution, ExecutionStep } from "@/types";
import {
  applyExecutionRealtimePatch,
  applyExecutionStepRealtimeUpdate,
} from "@/state/slices/dispatch.slice";
import { useAppDispatch, useAppSelector } from "./useAppStore";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function asNumber(value: unknown): number | undefined {
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) return undefined;
  return next;
}

function asDispatchStatus(value: unknown): DispatchExecution["status"] | undefined {
  if (value === "queued" || value === "running" || value === "succeeded" || value === "failed") {
    return value;
  }

  return undefined;
}

function parseExecutionStatusPayload(payload: unknown):
  | { executionId: string; patch: Partial<DispatchExecution> }
  | undefined {
  if (!isRecord(payload)) return undefined;

  const nestedExecution = isRecord(payload.execution) ? payload.execution : undefined;
  const executionId = asString(payload.executionId) || asString(nestedExecution?.id);
  if (!executionId) return undefined;

  const patch: Partial<DispatchExecution> = {};

  const status = asDispatchStatus(payload.status) || asDispatchStatus(nestedExecution?.status);
  if (status) patch.status = status;

  const errorSummary = asString(payload.errorSummary) || asString(nestedExecution?.errorSummary);
  if (errorSummary) patch.errorSummary = errorSummary;

  const startedAt = asString(payload.startedAt) || asString(nestedExecution?.startedAt);
  if (startedAt) patch.startedAt = startedAt;

  const finishedAt = asString(payload.finishedAt) || asString(nestedExecution?.finishedAt);
  if (finishedAt) patch.finishedAt = finishedAt;

  const updatedAt = asString(payload.updatedAt) || asString(nestedExecution?.updatedAt);
  if (updatedAt) patch.updatedAt = updatedAt;

  const attemptCount = asNumber(payload.attemptCount) || asNumber(nestedExecution?.attemptCount);
  if (attemptCount !== undefined) patch.attemptCount = attemptCount;

  return { executionId, patch };
}

function parseJsonObject(value: unknown): Record<string, unknown> | undefined {
  if (isRecord(value)) return value;

  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function parseExecutionStepPayload(payload: unknown):
  | { executionId: string; step: ExecutionStep }
  | undefined {
  if (!isRecord(payload)) return undefined;

  const nestedStep = isRecord(payload.step) ? payload.step : payload;
  const executionId = asString(payload.executionId) || asString(nestedStep.executionId);
  const stepIndex = asNumber(nestedStep.stepIndex);

  if (!executionId || stepIndex === undefined) {
    return undefined;
  }

  const step: ExecutionStep = {
    stepIndex,
    stepType: asString(nestedStep.stepType) || asString(nestedStep.type) || "unknown",
    status: asString(nestedStep.status) || "queued",
    attemptCount: asNumber(nestedStep.attemptCount) || 0,
    errorMessage: asString(nestedStep.errorMessage),
    startedAt: asString(nestedStep.startedAt),
    finishedAt: asString(nestedStep.finishedAt),
    requestJson: parseJsonObject(nestedStep.requestJson),
    responseJson: parseJsonObject(nestedStep.responseJson),
    updatedAt: asString(nestedStep.updatedAt),
  };

  return { executionId, step };
}

function getSocketUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicitUrl && explicitUrl.trim().length > 0) {
    return explicitUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiUrl && apiUrl.startsWith("http")) {
    return apiUrl;
  }

  return undefined;
}

export function useExecutionRealtime(executionId?: string) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!executionId || !token) return;

    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
      reconnection: true,
      auth: { token },
    });

    const handleStatus = (payload: unknown) => {
      const parsed = parseExecutionStatusPayload(payload);
      if (!parsed || parsed.executionId !== executionId) return;
      dispatch(applyExecutionRealtimePatch(parsed));
    };

    const handleStep = (payload: unknown) => {
      const parsed = parseExecutionStepPayload(payload);
      if (!parsed || parsed.executionId !== executionId) return;
      dispatch(applyExecutionStepRealtimeUpdate(parsed));
    };

    socket.on("connect", () => {
      socket.emit("execution:join", { executionId });
    });

    socket.on("execution:status", handleStatus);
    socket.on("dispatch:execution:status", handleStatus);
    socket.on("execution:step", handleStep);
    socket.on("dispatch:execution:step", handleStep);

    return () => {
      socket.off("execution:status", handleStatus);
      socket.off("dispatch:execution:status", handleStatus);
      socket.off("execution:step", handleStep);
      socket.off("dispatch:execution:step", handleStep);
      socket.disconnect();
    };
  }, [dispatch, executionId, token]);
}

export default useExecutionRealtime;
