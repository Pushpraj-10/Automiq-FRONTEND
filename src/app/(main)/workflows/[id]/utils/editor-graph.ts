import type { Workflow, WorkflowAction } from "@/types";
import type { ActionType } from "@/types";
import type {
  NewNodePayload,
  Point,
  SaveActionInput,
  WorkflowEdge,
  WorkflowMeta,
  WorkflowNode,
} from "../types/editor.types";

export const NODE_WIDTH = 320;
export const NODE_HEIGHT = 112;
export const NODE_SPACING_Y = 190;
export const CANVAS_CENTER_X = 560;
export const CANVAS_START_Y = 260;

export function toWorkflowMeta(workflow: Workflow): WorkflowMeta {
  return {
    id: workflow.id,
    name: workflow.name,
    status: workflow.status,
    description: workflow.description,
    maxSteps: workflow.maxSteps,
  };
}

export function createNodeId() {
  const nonce = Math.random().toString(36).slice(2, 8);
  return `node-${Date.now().toString(36)}-${nonce}`;
}

export function createDefaultConfig(type: ActionType): Record<string, unknown> {
  if (type === "http_request") {
    return {
      method: "POST",
      url: "",
      headers: {},
      query: {},
      body: "",
      timeoutMs: 10000,
      successStatusCodes: [200, 201, 202, 204],
    };
  }

  if (type === "delay") {
    return {
      durationMs: 60000,
    };
  }

  if (type === "send_email") {
    return {
      provider: "sendgrid",
      from: "",
      to: [],
      cc: [],
      bcc: [],
      subject: "",
      text: "",
      html: "",
      replyTo: "",
    };
  }

  return {
    url: "",
    method: "POST",
    headers: {},
    payload: {},
    timeoutMs: 10000,
    successStatusCodes: [200, 201, 202, 204],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toNumberArray(value: unknown) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return source
    .map((item) => {
      const next = typeof item === "number" ? item : Number(item);
      return Number.isFinite(next) ? next : undefined;
    })
    .filter((item): item is number => typeof item === "number");
}

function getDurationMs(config: Record<string, unknown>) {
  const durationMs = Number(config.durationMs);
  if (Number.isFinite(durationMs) && durationMs > 0) {
    return durationMs;
  }

  const legacyDuration = Number(config.duration);
  const legacyUnit = typeof config.unit === "string" ? config.unit.toLowerCase() : "minutes";

  if (Number.isFinite(legacyDuration) && legacyDuration > 0) {
    if (legacyUnit === "seconds") return legacyDuration * 1000;
    if (legacyUnit === "hours") return legacyDuration * 60 * 60 * 1000;
    if (legacyUnit === "days") return legacyDuration * 24 * 60 * 60 * 1000;
    return legacyDuration * 60 * 1000;
  }

  return 60000;
}

function toFiniteNumber(value: unknown): number | undefined {
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) return undefined;
  return next;
}

function resolveNodePosition(action: WorkflowAction, index: number): Point {
  const savedX = toFiniteNumber(action.positionX);
  const savedY = toFiniteNumber(action.positionY);

  if (savedX !== undefined && savedY !== undefined) {
    return { x: savedX, y: savedY };
  }

  return {
    x: CANVAS_CENTER_X,
    y: CANVAS_START_Y + index * NODE_SPACING_Y,
  };
}

export function normalizeOnFailure(onFailure?: Record<string, unknown>) {
  if (!isRecord(onFailure)) return undefined;

  const rawStrategy = typeof onFailure.strategy === "string" ? onFailure.strategy : "stop";
  const strategy = rawStrategy === "ignore" ? "continue" : rawStrategy;

  if (strategy !== "retry" && strategy !== "stop" && strategy !== "continue") {
    return { strategy: "stop" };
  }

  const normalized: Record<string, unknown> = { strategy };

  if (strategy === "retry") {
    const maxAttempts = Number(onFailure.maxAttempts);
    normalized.maxAttempts = Number.isFinite(maxAttempts) && maxAttempts > 0 ? Math.floor(maxAttempts) : 3;
  }

  return normalized;
}

export function normalizeActionConfig(type: ActionType, config: Record<string, unknown>) {
  const source = isRecord(config) ? config : {};

  if (type === "http_request") {
    return {
      method: typeof source.method === "string" && source.method.trim() ? source.method : "POST",
      url: typeof source.url === "string" ? source.url : "",
      headers: isRecord(source.headers) ? source.headers : {},
      query: isRecord(source.query) ? source.query : {},
      body: source.body ?? "",
      timeoutMs: Number.isFinite(Number(source.timeoutMs)) && Number(source.timeoutMs) > 0 ? Number(source.timeoutMs) : 10000,
      successStatusCodes: toNumberArray(source.successStatusCodes),
    };
  }

  if (type === "send_email") {
    return {
      provider: source.provider === "smtp" ? "smtp" : "sendgrid",
      from: typeof source.from === "string" ? source.from : "",
      to: toStringArray(source.to),
      cc: toStringArray(source.cc),
      bcc: toStringArray(source.bcc),
      subject: typeof source.subject === "string" ? source.subject : "",
      text: typeof source.text === "string" ? source.text : typeof source.body === "string" ? source.body : "",
      html: typeof source.html === "string" ? source.html : "",
      replyTo: typeof source.replyTo === "string" ? source.replyTo : "",
    };
  }

  if (type === "delay") {
    return {
      durationMs: getDurationMs(source),
    };
  }

  return {
    url: typeof source.url === "string" ? source.url : "",
    method: typeof source.method === "string" && source.method.trim() ? source.method : "POST",
    headers: isRecord(source.headers) ? source.headers : {},
    payload: isRecord(source.payload) ? source.payload : {},
    timeoutMs: Number.isFinite(Number(source.timeoutMs)) && Number(source.timeoutMs) > 0 ? Number(source.timeoutMs) : 10000,
    successStatusCodes: toNumberArray(source.successStatusCodes),
  };
}

export function buildNodesFromActions(workflowId: string, actions: WorkflowAction[]): WorkflowNode[] {
  const sorted = [...actions].sort((a, b) => a.stepNumber - b.stepNumber);

  return sorted.map((action, index) => ({
    id: action.nodeId || action.id || createNodeId(),
    position: resolveNodePosition(action, index),
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    data: {
      actionId: action.id,
      workflowId,
      stepNumber: action.stepNumber,
      type: action.type,
      name: action.name || `${formatActionType(action.type)} ${action.stepNumber}`,
      config: normalizeActionConfig(action.type, action.config),
      onFailure: normalizeOnFailure(action.onFailure),
      isActive: action.isActive,
      kind: index === 0 ? "trigger" : "action",
    },
  }));
}

export function buildSequentialEdges(nodes: WorkflowNode[]): WorkflowEdge[] {
  if (nodes.length < 2) return [];

  const sorted = [...nodes].sort((a, b) => a.data.stepNumber - b.data.stepNumber);
  const edges: WorkflowEdge[] = [];

  for (let index = 0; index < sorted.length - 1; index += 1) {
    edges.push({
      id: `${sorted[index].id}-${sorted[index + 1].id}`,
      source: sorted[index].id,
      target: sorted[index + 1].id,
    });
  }

  return edges;
}

export function reindexNodes(nodes: WorkflowNode[]): WorkflowNode[] {
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);

  return sorted.map((node, index) => ({
    ...node,
    data: {
      ...node.data,
      stepNumber: index + 1,
      kind: index === 0 ? "trigger" : "action",
    },
  }));
}

export function createNodeFromPayload(
  workflowId: string,
  payload: NewNodePayload,
  stepNumber: number,
  positionY: number,
): WorkflowNode {
  const position: Point = payload.position ?? {
    x: CANVAS_CENTER_X,
    y: positionY,
  };

  return {
    id: createNodeId(),
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    position,
    data: {
      workflowId,
      stepNumber,
      type: payload.type,
      name: payload.name,
      config: createDefaultConfig(payload.type),
      isActive: true,
      kind: "action",
    },
  };
}

export function toSavePayload(nodes: WorkflowNode[]): SaveActionInput[] {
  const sorted = reindexNodes(nodes);

  return sorted.map((node) => ({
    id: node.data.actionId,
    nodeId: node.id,
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
    editorMeta: {
      width: node.width,
      height: node.height,
    },
    stepNumber: node.data.stepNumber,
    type: node.data.type,
    name: node.data.name,
    config: normalizeActionConfig(node.data.type, node.data.config),
    onFailure: normalizeOnFailure(node.data.onFailure),
    isActive: node.data.isActive,
  }));
}

export function formatActionType(type: ActionType) {
  return type
    .split("_")
    .map((word) => `${word[0]?.toUpperCase() || ""}${word.slice(1)}`)
    .join(" ");
}
