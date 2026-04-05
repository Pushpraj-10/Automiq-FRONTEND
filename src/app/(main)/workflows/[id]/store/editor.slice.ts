import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ActionType } from "@/types";
import type {
  NewNodePayload,
  WorkflowEditorState,
  WorkflowMeta,
  WorkflowNode,
} from "../types/editor.types";
import {
  CANVAS_START_Y,
  NODE_SPACING_Y,
  buildSequentialEdges,
  createDefaultConfig,
  createNodeFromPayload,
  reindexNodes,
} from "../utils/editor-graph";

type HydratePayload = {
  meta?: WorkflowMeta;
  nodes: WorkflowNode[];
};

type NodeByIdPayload = {
  nodeId: string;
};

type SetNodePositionPayload = {
  nodeId: string;
  x: number;
  y: number;
};

type UpdateNodeNamePayload = {
  nodeId: string;
  name: string;
};

type UpdateNodeTypePayload = {
  nodeId: string;
  type: ActionType;
};

type UpdateNodeConfigPayload = {
  nodeId: string;
  config: Record<string, unknown>;
};

type PatchNodeConfigPayload = {
  nodeId: string;
  patch: Record<string, unknown>;
};

type UpdateNodeOnFailurePayload = {
  nodeId: string;
  onFailure?: Record<string, unknown>;
};

type SyncSavedActionsPayload = {
  steps: Array<{ stepNumber: number; id: string }>;
};

type RestoreSnapshotPayload = {
  meta?: WorkflowMeta;
  nodes: WorkflowNode[];
  selectedNodeId?: string;
};

const initialState: WorkflowEditorState = {
  nodes: [],
  edges: [],
  viewport: {
    x: 0,
    y: 0,
    scale: 1,
  },
  isDirty: false,
  isSaving: false,
};

function resequence(nodes: WorkflowNode[]) {
  const reindexed = reindexNodes(nodes);

  return {
    nodes: reindexed,
    edges: buildSequentialEdges(reindexed),
  };
}

function markDirty(state: WorkflowEditorState) {
  state.isDirty = true;
}

const editorSlice = createSlice({
  name: "workflowEditor",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<HydratePayload>) {
      const { nodes, edges } = resequence(action.payload.nodes);
      state.meta = action.payload.meta;
      state.nodes = nodes;
      state.edges = edges;
      state.selectedNodeId = nodes[0]?.id;
      state.isDirty = false;
      state.isSaving = false;
    },

    setMeta(state, action: PayloadAction<WorkflowMeta>) {
      state.meta = action.payload;
    },

    setMetaName(state, action: PayloadAction<string>) {
      if (!state.meta) return;
      state.meta.name = action.payload;
      markDirty(state);
    },

    setMetaStatus(state, action: PayloadAction<WorkflowMeta["status"]>) {
      if (!state.meta) return;
      state.meta.status = action.payload;
      markDirty(state);
    },

    setSelectedNode(state, action: PayloadAction<string | undefined>) {
      state.selectedNodeId = action.payload;
    },

    setViewport(state, action: PayloadAction<WorkflowEditorState["viewport"]>) {
      state.viewport = action.payload;
    },

    panViewport(state, action: PayloadAction<{ dx: number; dy: number }>) {
      state.viewport = {
        ...state.viewport,
        x: state.viewport.x + action.payload.dx,
        y: state.viewport.y + action.payload.dy,
      };
    },

    zoomViewport(state, action: PayloadAction<number>) {
      state.viewport = {
        ...state.viewport,
        scale: action.payload,
      };
    },

    setNodePosition(state, action: PayloadAction<SetNodePositionPayload>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.position = {
        x: action.payload.x,
        y: action.payload.y,
      };
      markDirty(state);
    },

    resequenceNodesByPosition(state) {
      const next = resequence(state.nodes);
      state.nodes = next.nodes;
      state.edges = next.edges;
      markDirty(state);
    },

    updateNodeName(state, action: PayloadAction<UpdateNodeNamePayload>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.data.name = action.payload.name;
      markDirty(state);
    },

    updateNodeType(state, action: PayloadAction<UpdateNodeTypePayload>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.data.type = action.payload.type;
      node.data.config = createDefaultConfig(action.payload.type);
      markDirty(state);
    },

    updateNodeConfig(state, action: PayloadAction<UpdateNodeConfigPayload>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.data.config = action.payload.config;
      markDirty(state);
    },

    patchNodeConfig(state, action: PayloadAction<PatchNodeConfigPayload>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.data.config = {
        ...node.data.config,
        ...action.payload.patch,
      };
      markDirty(state);
    },

    updateNodeOnFailure(state, action: PayloadAction<UpdateNodeOnFailurePayload>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.data.onFailure = action.payload.onFailure;
      markDirty(state);
    },

    setNodeActive(state, action: PayloadAction<NodeByIdPayload & { isActive: boolean }>) {
      const node = state.nodes.find((item) => item.id === action.payload.nodeId);
      if (!node) return;

      node.data.isActive = action.payload.isActive;
      markDirty(state);
    },

    addNode(state, action: PayloadAction<NewNodePayload>) {
      const workflowId = action.payload.workflowId || state.meta?.id || state.nodes[0]?.data.workflowId;
      if (!workflowId) return;
      if (state.meta && state.nodes.length >= state.meta.maxSteps) return;

      const ordered = [...state.nodes].sort((a, b) => a.data.stepNumber - b.data.stepNumber);
      const currentIndex = action.payload.afterNodeId
        ? ordered.findIndex((item) => item.id === action.payload.afterNodeId)
        : ordered.length - 1;
      const insertIndex = currentIndex + 1;

      const previousY = ordered[currentIndex]?.position.y ?? CANVAS_START_Y - NODE_SPACING_Y;
      const shifted = ordered.map((node, index) => {
        if (index < insertIndex) return node;
        return {
          ...node,
          position: {
            ...node.position,
            y: node.position.y + NODE_SPACING_Y,
          },
        };
      });

      const createdNode = createNodeFromPayload(workflowId, action.payload, insertIndex + 1, previousY + NODE_SPACING_Y);
      const combined = [
        ...shifted.slice(0, insertIndex),
        createdNode,
        ...shifted.slice(insertIndex),
      ];

      const next = resequence(combined);
      state.nodes = next.nodes;
      state.edges = next.edges;
      state.selectedNodeId = createdNode.id;
      markDirty(state);
    },

    removeNode(state, action: PayloadAction<NodeByIdPayload>) {
      const nextNodes = state.nodes.filter((node) => node.id !== action.payload.nodeId);
      const next = resequence(nextNodes);
      state.nodes = next.nodes;
      state.edges = next.edges;

      if (state.selectedNodeId === action.payload.nodeId) {
        state.selectedNodeId = next.nodes[0]?.id;
      }

      markDirty(state);
    },

    syncSavedActions(state, action: PayloadAction<SyncSavedActionsPayload>) {
      const idByStep = new Map(action.payload.steps.map((item) => [item.stepNumber, item.id]));
      state.nodes = state.nodes.map((node) => {
        const actionId = idByStep.get(node.data.stepNumber);
        if (!actionId) return node;

        return {
          ...node,
          id: actionId,
          data: {
            ...node.data,
            actionId,
          },
        };
      });
      state.edges = buildSequentialEdges(state.nodes);
      state.isDirty = false;
      state.isSaving = false;
    },

    setSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },

    markSaved(state) {
      state.isDirty = false;
      state.isSaving = false;
    },

    restoreSnapshot(state, action: PayloadAction<RestoreSnapshotPayload>) {
      const next = resequence(action.payload.nodes);
      state.meta = action.payload.meta;
      state.nodes = next.nodes;
      state.edges = next.edges;
      const requestedId = action.payload.selectedNodeId;
      const selectedExists = requestedId
        ? next.nodes.some((node) => node.id === requestedId)
        : false;
      state.selectedNodeId = selectedExists ? requestedId : next.nodes[0]?.id;
      state.isDirty = true;
      state.isSaving = false;
    },
  },
});

export const {
  hydrate,
  setMeta,
  setMetaName,
  setMetaStatus,
  setSelectedNode,
  setViewport,
  panViewport,
  zoomViewport,
  setNodePosition,
  resequenceNodesByPosition,
  updateNodeName,
  updateNodeType,
  updateNodeConfig,
  patchNodeConfig,
  updateNodeOnFailure,
  setNodeActive,
  addNode,
  removeNode,
  syncSavedActions,
  setSaving,
  markSaved,
  restoreSnapshot,
} = editorSlice.actions;

export const workflowEditorReducer = editorSlice.reducer;
