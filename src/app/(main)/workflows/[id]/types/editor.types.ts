import type { ActionType, WorkflowStatus } from "@/types";

export type Point = {
  x: number;
  y: number;
};

export type EditorNodeKind = "trigger" | "action";

export type WorkflowNodeData = {
  actionId?: string;
  workflowId: string;
  stepNumber: number;
  type: ActionType;
  name: string;
  config: Record<string, unknown>;
  onFailure?: Record<string, unknown>;
  isActive: boolean;
  kind: EditorNodeKind;
};

export type WorkflowNode = {
  id: string;
  position: Point;
  width: number;
  height: number;
  data: WorkflowNodeData;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

export type ViewportState = {
  x: number;
  y: number;
  scale: number;
};

export type WorkflowMeta = {
  id: string;
  name: string;
  status: WorkflowStatus;
  description?: string;
  maxSteps: number;
};

export type WorkflowEditorState = {
  meta?: WorkflowMeta;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: ViewportState;
  revision?: number;
  selectedNodeId?: string;
  isDirty: boolean;
  isSaving: boolean;
};

export type NewNodePayload = {
  workflowId?: string;
  afterNodeId?: string;
  position?: Point;
  type: ActionType;
  name: string;
};

export type SaveActionInput = {
  id?: string;
  nodeId?: string;
  position?: Point;
  editorMeta?: Record<string, unknown>;
  stepNumber: number;
  type: ActionType;
  name: string;
  config: Record<string, unknown>;
  onFailure?: Record<string, unknown>;
  isActive: boolean;
};
