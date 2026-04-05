"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { ActionType } from "@/types";
import type { WorkflowEditorDispatch } from "../store/editor.store";
import {
  ackRealtimeEditorRevision,
  applyRealtimeEditorPatch,
  applyRealtimeEditorState,
} from "../store/editor.slice";
import type {
  Point,
  ViewportState,
  WorkflowEditorState,
  WorkflowMeta,
  WorkflowNode,
} from "../types/editor.types";
import {
  CANVAS_CENTER_X,
  CANVAS_START_Y,
  NODE_HEIGHT,
  NODE_SPACING_Y,
  NODE_WIDTH,
} from "../utils/editor-graph";

type UseWorkflowEditorRealtimeOptions = {
  workflowId: string;
  token?: string | null;
  editor: WorkflowEditorState;
  dispatch: WorkflowEditorDispatch;
  enabled?: boolean;
  onConflict?: (message: string) => void;
};

type ParsedEditorState = {
  meta?: WorkflowMeta;
  nodes: WorkflowNode[];
  viewport?: ViewportState;
  selectedNodeId?: string;
  revision?: number;
};

type ParsedEditorPatch = {
  nodes?: WorkflowNode[];
  viewport?: ViewportState;
  selectedNodeId?: string;
  revision?: number;
};

type ParsedEditorAck = {
  workflowId: string;
  revision: number;
};

function buildPatchSignature(input: {
  nodes: WorkflowNode[];
  viewport: ViewportState;
  selectedNodeId?: string;
}) {
  return JSON.stringify(input);
}

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

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  return undefined;
}

function asActionType(value: unknown): ActionType | undefined {
  if (value === "http_request" || value === "send_email" || value === "webhook_notification" || value === "delay") {
    return value;
  }

  return undefined;
}

function parseViewport(input: unknown): ViewportState | undefined {
  if (!isRecord(input)) return undefined;

  const x = asNumber(input.x);
  const y = asNumber(input.y);
  const scale = asNumber(input.scale);

  if (x === undefined || y === undefined || scale === undefined) {
    return undefined;
  }

  return {
    x,
    y,
    scale,
  };
}

function parsePoint(input: unknown): Point | undefined {
  if (!isRecord(input)) return undefined;

  const x = asNumber(input.x);
  const y = asNumber(input.y);
  if (x === undefined || y === undefined) return undefined;

  return { x, y };
}

function parseNode(input: unknown, index: number, workflowId: string): WorkflowNode | undefined {
  if (!isRecord(input)) return undefined;

  const data = isRecord(input.data) ? input.data : input;
  const type = asActionType(data.type);
  if (!type) return undefined;

  const stepNumber = asNumber(data.stepNumber) ?? index + 1;
  const id = asString(input.id) || asString(data.nodeId) || `remote-node-${stepNumber}`;

  const providedPosition =
    parsePoint(input.position) ||
    (asNumber(data.positionX) !== undefined && asNumber(data.positionY) !== undefined
      ? {
          x: asNumber(data.positionX)!,
          y: asNumber(data.positionY)!,
        }
      : undefined);

  const position = providedPosition ?? {
    x: CANVAS_CENTER_X,
    y: CANVAS_START_Y + index * NODE_SPACING_Y,
  };

  return {
    id,
    position,
    width: asNumber(input.width) ?? NODE_WIDTH,
    height: asNumber(input.height) ?? NODE_HEIGHT,
    data: {
      actionId: asString(data.actionId) || asString(data.id),
      workflowId: asString(data.workflowId) || workflowId,
      stepNumber,
      type,
      name: asString(data.name) || `Step ${stepNumber}`,
      config: isRecord(data.config) ? data.config : {},
      onFailure: isRecord(data.onFailure) ? data.onFailure : undefined,
      isActive: asBoolean(data.isActive) ?? true,
      kind: data.kind === "trigger" || data.kind === "action" ? data.kind : index === 0 ? "trigger" : "action",
    },
  };
}

function parseNodes(input: unknown, workflowId: string): WorkflowNode[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const nodes = input
    .map((item, index) => parseNode(item, index, workflowId))
    .filter((item): item is WorkflowNode => Boolean(item));

  return nodes.length > 0 ? nodes : undefined;
}

function parseMeta(input: unknown, fallbackWorkflowId: string): WorkflowMeta | undefined {
  if (!isRecord(input)) return undefined;

  const id = asString(input.id) || fallbackWorkflowId;
  const name = asString(input.name);
  const status = input.status;
  const maxSteps = asNumber(input.maxSteps);

  if (
    !name ||
    (status !== "draft" && status !== "active" && status !== "paused" && status !== "archived") ||
    maxSteps === undefined
  ) {
    return undefined;
  }

  return {
    id,
    name,
    status,
    maxSteps,
    description: asString(input.description),
  };
}

function parseEditorStatePayload(payload: unknown, workflowId: string): ParsedEditorState | undefined {
  if (!isRecord(payload)) return undefined;

  const stateRoot = isRecord(payload.state) ? payload.state : payload;
  const payloadWorkflowId = asString(payload.workflowId) || asString(stateRoot.workflowId);
  if (payloadWorkflowId && payloadWorkflowId !== workflowId) return undefined;

  const nodes = parseNodes(stateRoot.nodes, workflowId);
  if (!nodes) return undefined;

  return {
    nodes,
    viewport: parseViewport(stateRoot.viewport),
    selectedNodeId: asString(stateRoot.selectedNodeId),
    revision: asNumber(stateRoot.revision),
    meta: parseMeta(stateRoot.meta, workflowId),
  };
}

function parseEditorPatchPayload(payload: unknown, workflowId: string): ParsedEditorPatch | undefined {
  if (!isRecord(payload)) return undefined;

  const payloadWorkflowId = asString(payload.workflowId);
  if (payloadWorkflowId && payloadWorkflowId !== workflowId) return undefined;

  const changes = isRecord(payload.changes) ? payload.changes : payload;

  const parsed: ParsedEditorPatch = {
    nodes: parseNodes(changes.nodes, workflowId),
    viewport: parseViewport(changes.viewport),
    selectedNodeId: asString(changes.selectedNodeId),
    revision: asNumber(payload.revision) ?? asNumber(changes.revision),
  };

  if (!parsed.nodes && !parsed.viewport && parsed.selectedNodeId === undefined && parsed.revision === undefined) {
    return undefined;
  }

  return parsed;
}

function parseEditorAckPayload(payload: unknown, workflowId: string): ParsedEditorAck | undefined {
  if (!isRecord(payload)) return undefined;

  const payloadWorkflowId = asString(payload.workflowId) || workflowId;
  const revision = asNumber(payload.revision);

  if (!payloadWorkflowId || payloadWorkflowId !== workflowId || revision === undefined) {
    return undefined;
  }

  return {
    workflowId: payloadWorkflowId,
    revision,
  };
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

function isEditorSocketEnabled() {
  const raw = process.env.NEXT_PUBLIC_EDITOR_SOCKET_ENABLED;
  if (!raw) return true;

  return raw.toLowerCase() === "true";
}

export function useWorkflowEditorRealtime({
  workflowId,
  token,
  editor,
  dispatch,
  enabled = true,
  onConflict,
}: UseWorkflowEditorRealtimeOptions) {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const patchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApplyingRemoteUpdateRef = useRef(false);
  const isPatchInFlightRef = useRef(false);
  const lastSentSignatureRef = useRef<string | null>(null);
  const lastAckedSignatureRef = useRef<string | null>(null);
  const onConflictRef = useRef(onConflict);

  useEffect(() => {
    onConflictRef.current = onConflict;
  }, [onConflict]);

  useEffect(() => {
    if (!enabled || !isEditorSocketEnabled() || !workflowId || !token) return;

    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
      reconnection: true,
      auth: { token },
    });

    socketRef.current = socket;

    const markRemoteApplying = () => {
      isApplyingRemoteUpdateRef.current = true;
      window.setTimeout(() => {
        isApplyingRemoteUpdateRef.current = false;
      }, 0);
    };

    const handleState = (payload: unknown) => {
      const parsed = parseEditorStatePayload(payload, workflowId);
      if (!parsed) return;

      markRemoteApplying();
      dispatch(applyRealtimeEditorState(parsed));
      isPatchInFlightRef.current = false;
      lastSentSignatureRef.current = null;
      lastAckedSignatureRef.current = null;
    };

    const handlePatch = (payload: unknown) => {
      const parsed = parseEditorPatchPayload(payload, workflowId);
      if (!parsed) return;

      markRemoteApplying();
      dispatch(applyRealtimeEditorPatch(parsed));
      isPatchInFlightRef.current = false;
      lastSentSignatureRef.current = null;
      lastAckedSignatureRef.current = null;
    };

    const handleAck = (payload: unknown) => {
      const parsed = parseEditorAckPayload(payload, workflowId);
      if (!parsed) return;

      isPatchInFlightRef.current = false;
      lastAckedSignatureRef.current = lastSentSignatureRef.current;
      dispatch(ackRealtimeEditorRevision({ revision: parsed.revision }));
    };

    const handleConflict = (payload: unknown) => {
      const conflictMessage = isRecord(payload)
        ? asString(payload.message) || "Editor state conflict detected. Synced with server snapshot."
        : "Editor state conflict detected. Synced with server snapshot.";

      const parsedState = parseEditorStatePayload(payload, workflowId);
      if (parsedState) {
        markRemoteApplying();
        dispatch(applyRealtimeEditorState(parsedState));
      }

      isPatchInFlightRef.current = false;
      lastSentSignatureRef.current = null;
      lastAckedSignatureRef.current = null;
      onConflictRef.current?.(conflictMessage);
    };

    socket.on("connect", () => {
      socket.emit("editor:join", { workflowId });
    });

    socket.on("editor:state", handleState);
    socket.on("editor:patch", handlePatch);
    socket.on("editor:ack", handleAck);
    socket.on("editor:conflict", handleConflict);

    return () => {
      if (patchTimeoutRef.current) {
        clearTimeout(patchTimeoutRef.current);
        patchTimeoutRef.current = null;
      }

      socket.off("editor:state", handleState);
      socket.off("editor:patch", handlePatch);
      socket.off("editor:ack", handleAck);
      socket.off("editor:conflict", handleConflict);
      socket.disconnect();
      socketRef.current = null;
      isPatchInFlightRef.current = false;
      lastSentSignatureRef.current = null;
      lastAckedSignatureRef.current = null;
    };
  }, [dispatch, enabled, token, workflowId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!editor.meta || !editor.isDirty) return;
    if (isApplyingRemoteUpdateRef.current) return;

    if (patchTimeoutRef.current) {
      clearTimeout(patchTimeoutRef.current);
    }

    const patchSignature = buildPatchSignature({
      nodes: editor.nodes,
      viewport: editor.viewport,
      selectedNodeId: editor.selectedNodeId,
    });

    if (patchSignature === lastAckedSignatureRef.current) {
      return;
    }

    patchTimeoutRef.current = setTimeout(() => {
      if (isPatchInFlightRef.current) return;

      if (patchSignature === lastAckedSignatureRef.current) return;

      isPatchInFlightRef.current = true;
      lastSentSignatureRef.current = patchSignature;
      socket.emit("editor:patch", {
        workflowId,
        baseRevision: editor.revision ?? 0,
        changes: {
          nodes: editor.nodes,
          viewport: editor.viewport,
          selectedNodeId: editor.selectedNodeId,
        },
      });
    }, 320);

    return () => {
      if (patchTimeoutRef.current) {
        clearTimeout(patchTimeoutRef.current);
        patchTimeoutRef.current = null;
      }
    };
  }, [
    editor.isDirty,
    editor.meta,
    editor.nodes,
    editor.revision,
    editor.selectedNodeId,
    editor.viewport,
    workflowId,
  ]);
}

export default useWorkflowEditorRealtime;
