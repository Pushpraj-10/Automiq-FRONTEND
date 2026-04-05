"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Provider } from "react-redux";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Workflow, WorkflowAction, WorkflowValidationResult } from "@/types";
import { ACTION_PRESETS } from "../data/action-presets";
import { useNodeDrag } from "../hooks/use-node-drag";
import { useWorkflowEditorRealtime } from "../hooks/use-workflow-editor-realtime";
import {
  addNode,
  hydrate,
  markSaved,
  patchNodeConfig,
  removeNode,
  resequenceNodesByPosition,
  restoreSnapshot,
  setMetaName,
  setMetaStatus,
  setNodeActive,
  setNodePosition,
  setSelectedNode,
  setSaving,
  setViewport,
  syncSavedActions,
  updateNodeName,
  updateNodeOnFailure,
  updateNodeType,
} from "../store/editor.slice";
import { useWorkflowEditorDispatch, useWorkflowEditorSelector } from "../store/editor.hooks";
import { createWorkflowEditorStore } from "../store/editor.store";
import type { ActionType } from "@/types";
import type {
  Point,
  SaveActionInput,
  ViewportState,
  WorkflowEditorState,
  WorkflowMeta,
  WorkflowNode,
} from "../types/editor.types";
import { buildNodesFromActions, toSavePayload, toWorkflowMeta } from "../utils/editor-graph";
import { EditorHeader } from "./editor-header";
import { InspectorPanel } from "./inspector-panel";
import { WorkflowCanvas } from "./workflow-canvas";

export type WorkflowEditorSaveRequest = {
  name: string;
  status: Workflow["status"];
  steps: SaveActionInput[];
  deletedActionIds: string[];
};

export type WorkflowEditorSaveResponse = {
  steps: Array<{ stepNumber: number; id: string }>;
  dispatchExecutionId?: string;
};

type WorkflowEditorProps = {
  workflowId: string;
  authToken?: string | null;
  workflow?: Workflow;
  actions: WorkflowAction[];
  isLoading: boolean;
  onSave: (request: WorkflowEditorSaveRequest) => Promise<WorkflowEditorSaveResponse>;
  onPublish: (request: WorkflowEditorSaveRequest) => Promise<WorkflowEditorSaveResponse>;
  onRetryDispatch?: () => Promise<{ executionId: string }>;
  onValidate: (request: WorkflowEditorSaveRequest) => Promise<WorkflowValidationResult>;
};

type EditorSnapshot = {
  meta?: WorkflowMeta;
  nodes: WorkflowNode[];
  selectedNodeId?: string;
};

type PublishDispatchPartialError = Error & {
  __kind?: "publish_dispatch_partial";
  steps?: WorkflowEditorSaveResponse["steps"];
};

function isPublishDispatchPartialError(value: unknown): value is PublishDispatchPartialError {
  if (!(value instanceof Error)) return false;

  const candidate = value as PublishDispatchPartialError;
  return candidate.__kind === "publish_dispatch_partial" && Array.isArray(candidate.steps);
}

function deepClone<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function createSnapshot(editor: WorkflowEditorState): EditorSnapshot {
  return {
    meta: deepClone(editor.meta),
    nodes: deepClone(editor.nodes),
    selectedNodeId: editor.selectedNodeId,
  };
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  return target.isContentEditable;
}

function WorkflowEditorInner({ workflowId, authToken, workflow, actions, isLoading, onSave, onPublish, onRetryDispatch, onValidate }: WorkflowEditorProps) {
  const dispatch = useWorkflowEditorDispatch();
  const editor = useWorkflowEditorSelector((state) => state.editor);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [dispatchExecutionId, setDispatchExecutionId] = useState<string>();
  const [retryDispatchAvailable, setRetryDispatchAvailable] = useState(false);
  const [isRetryingDispatch, setIsRetryingDispatch] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string>();
  const [validationResult, setValidationResult] = useState<WorkflowValidationResult>();
  const [isValidating, setIsValidating] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const initialActionIdsRef = useRef<string[]>([]);
  const hydratedWorkflowIdRef = useRef<string | null>(null);
  const undoStackRef = useRef<EditorSnapshot[]>([]);
  const [undoDepth, setUndoDepth] = useState(0);

  useEffect(() => {
    if (!workflow || isLoading) return;
    if (hydratedWorkflowIdRef.current === workflow.id) return;

    const nodes = buildNodesFromActions(workflow.id, actions);
    initialActionIdsRef.current = actions.map((action) => action.id);
    hydratedWorkflowIdRef.current = workflow.id;
    undoStackRef.current = [];
    setUndoDepth(0);
    setErrorMessage(undefined);
    setDispatchExecutionId(undefined);
    setRetryDispatchAvailable(false);
    setIsRetryingDispatch(false);
    setLimitMessage(undefined);
    setValidationResult(undefined);
    setLastSavedAt(Date.now());
    dispatch(
      hydrate({
        meta: toWorkflowMeta(workflow),
        nodes,
      }),
    );
  }, [actions, dispatch, isLoading, workflow]);

  useWorkflowEditorRealtime({
    workflowId,
    token: authToken,
    editor,
    dispatch,
    enabled: !isLoading,
    onConflict: (message) => {
      setErrorMessage(message);
      setValidationResult(undefined);
      setLimitMessage(undefined);
    },
  });

  const selectedNode = useMemo(() => {
    if (!editor.selectedNodeId) return undefined;
    return editor.nodes.find((node) => node.id === editor.selectedNodeId);
  }, [editor.nodes, editor.selectedNodeId]);

  useEffect(() => {
    if (selectedNode) {
      setIsInspectorOpen(true);
      return;
    }

    setIsInspectorOpen(false);
  }, [selectedNode]);

  useEffect(() => {
    if (!selectedNode) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (window.innerWidth < 1280 && isInspectorOpen) {
        setIsInspectorOpen(false);
        return;
      }

      dispatch(setSelectedNode(undefined));
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, isInspectorOpen, selectedNode]);

  const pushUndoSnapshot = useCallback(() => {
    if (!editor.meta) return;
    undoStackRef.current.push(createSnapshot(editor));
    if (undoStackRef.current.length > 100) {
      undoStackRef.current.shift();
    }
    setUndoDepth(undoStackRef.current.length);
  }, [editor]);

  const applyEditorChange = useCallback(
    (change: () => void) => {
      pushUndoSnapshot();
      setErrorMessage(undefined);
      setLimitMessage(undefined);
      setValidationResult(undefined);
      change();
    },
    [pushUndoSnapshot],
  );

  const { dragNodeId, onNodePointerDown } = useNodeDrag({
    viewport: editor.viewport,
    getNodeById(nodeId) {
      return editor.nodes.find((node) => node.id === nodeId);
    },
    onNodeMove(nodeId, x, y) {
      dispatch(setNodePosition({ nodeId, x, y }));
    },
    onDragStart() {
      pushUndoSnapshot();
      setValidationResult(undefined);
      setErrorMessage(undefined);
      setLimitMessage(undefined);
    },
    onDragEnd() {
      dispatch(resequenceNodesByPosition());
      setValidationResult(undefined);
      setErrorMessage(undefined);
      setLimitMessage(undefined);
    },
  });

  const maxSteps = editor.meta?.maxSteps ?? 5;
  const canAddStep = editor.nodes.length < maxSteps;

  const buildRequest = useCallback(
    (status: Workflow["status"]): WorkflowEditorSaveRequest => {
      const steps = toSavePayload(editor.nodes);
      const currentIds = steps
        .map((step) => step.id)
        .filter((id): id is string => Boolean(id));
      const deletedActionIds = initialActionIdsRef.current.filter((id) => !currentIds.includes(id));

      return {
        name: editor.meta?.name || workflow?.name || "Untitled workflow",
        status,
        steps,
        deletedActionIds,
      };
    },
    [editor.meta?.name, editor.nodes, workflow?.name],
  );

  const runSave = useCallback(
    async (status: Workflow["status"], publish = false) => {
      if (!editor.meta) return;

      setErrorMessage(undefined);
      dispatch(setSaving(true));

      try {
        const request = buildRequest(status);
        const response = publish ? await onPublish(request) : await onSave(request);
        initialActionIdsRef.current = response.steps.map((step) => step.id);
        dispatch(syncSavedActions({ steps: response.steps }));
        setLastSavedAt(Date.now());
        setValidationResult(undefined);
        setLimitMessage(undefined);
        setRetryDispatchAvailable(false);

        if (publish && response.dispatchExecutionId) {
          setDispatchExecutionId(response.dispatchExecutionId);
        } else if (!publish) {
          setDispatchExecutionId(undefined);
        }

        if (request.status !== editor.meta.status) {
          dispatch(setMetaStatus(request.status));
          dispatch(markSaved());
        }
      } catch (error) {
        if (publish && isPublishDispatchPartialError(error)) {
          const responseSteps = error.steps || [];

          initialActionIdsRef.current = responseSteps.map((step) => step.id);
          dispatch(syncSavedActions({ steps: responseSteps }));
          setLastSavedAt(Date.now());
          setValidationResult(undefined);
          setLimitMessage(undefined);

          if (status !== editor.meta.status) {
            dispatch(setMetaStatus(status));
            dispatch(markSaved());
          }

          setDispatchExecutionId(undefined);
          setRetryDispatchAvailable(true);
          setErrorMessage(error.message || "Workflow published, but dispatch failed");
          return;
        }

        setDispatchExecutionId(undefined);
        setRetryDispatchAvailable(false);
        dispatch(setSaving(false));
        setErrorMessage(error instanceof Error ? error.message : "Unable to save workflow");
      }
    },
    [buildRequest, dispatch, editor.meta, onPublish, onSave],
  );

  const handlePublish = useCallback(async () => {
    await runSave("active", true);
  }, [runSave]);

  const handleRetryDispatch = useCallback(async () => {
    if (!onRetryDispatch) return;

    setIsRetryingDispatch(true);
    setErrorMessage(undefined);

    try {
      const result = await onRetryDispatch();
      setDispatchExecutionId(result.executionId);
      setRetryDispatchAvailable(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dispatch retry failed";
      setErrorMessage(`Workflow is published, but dispatch retry failed: ${message}`);
    } finally {
      setIsRetryingDispatch(false);
    }
  }, [onRetryDispatch]);

  const handleValidate = useCallback(async () => {
    if (!editor.meta) return;

    setErrorMessage(undefined);
    setIsValidating(true);

    try {
      const request = buildRequest(editor.meta.status || "draft");
      const result = await onValidate(request);
      setValidationResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to validate workflow");
    } finally {
      setIsValidating(false);
    }
  }, [buildRequest, editor.meta, onValidate]);

  const handleUndo = useCallback(() => {
    const snapshot = undoStackRef.current.pop();
    if (!snapshot) return;

    setUndoDepth(undoStackRef.current.length);
    setValidationResult(undefined);
    setErrorMessage(undefined);
    dispatch(restoreSnapshot(snapshot));
  }, [dispatch]);

  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    applyEditorChange(() => {
      dispatch(removeNode({ nodeId: selectedNode.id }));
    });
  }, [applyEditorChange, dispatch, selectedNode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const isUndoShortcut = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z";
      if (!isUndoShortcut) return;

      event.preventDefault();
      handleUndo();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleUndo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const isDeleteKey = event.key === "Delete" || event.key === "Backspace";
      if (!isDeleteKey || !selectedNode) return;

      event.preventDefault();
      handleDeleteSelectedNode();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleDeleteSelectedNode, selectedNode]);

  const handleAddNode = useCallback(
    (type: ActionType, options?: { afterNodeId?: string; position?: Point }) => {
      if (!canAddStep) {
        setLimitMessage(`Step limit reached (${editor.nodes.length}/${maxSteps}). Remove a step to add another.`);
        return;
      }

      const preset = ACTION_PRESETS.find((item) => item.type === type);
      applyEditorChange(() => {
        dispatch(
          addNode({
            workflowId,
            afterNodeId: options?.afterNodeId,
            position: options?.position,
            type,
            name: preset?.title || "New action",
          }),
        );
      });
    },
    [applyEditorChange, canAddStep, dispatch, editor.nodes.length, maxSteps, workflowId],
  );

  const handleAddStepBlocked = useCallback(() => {
    setLimitMessage(`Step limit reached (${editor.nodes.length}/${maxSteps}). Remove a step to add another.`);
  }, [editor.nodes.length, maxSteps]);

  if (isLoading && !workflow) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#050505] select-none">
      <EditorHeader
        meta={editor.meta}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        isValidating={isValidating}
        canUndo={undoDepth > 0}
        canAddStep={canAddStep}
        currentStepCount={editor.nodes.length}
        maxSteps={maxSteps}
        hasSelectedNode={Boolean(selectedNode)}
        isInspectorOpen={isInspectorOpen}
        lastSavedAt={lastSavedAt}
        onNameChange={(name) => {
          applyEditorChange(() => {
            dispatch(setMetaName(name));
          });
        }}
        onValidate={handleValidate}
        onUndo={handleUndo}
        onPublish={handlePublish}
        onAddNode={(type) => handleAddNode(type, { position: { x: 0, y: 0 } })}
        onToggleInspector={() => setIsInspectorOpen((current) => !current)}
      />

      {errorMessage && (
        <div role="alert" className="mx-4 mt-3 rounded-lg border border-red-500/35 bg-red-950/40 px-4 py-2 text-sm text-red-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{errorMessage}</span>
            {retryDispatchAvailable && onRetryDispatch && (
              <button
                type="button"
                onClick={() => {
                  void handleRetryDispatch();
                }}
                disabled={isRetryingDispatch}
                className="inline-flex items-center rounded-md border border-red-300/40 bg-red-100/10 px-3 py-1 text-xs font-semibold text-red-100 hover:bg-red-100/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRetryingDispatch ? "Retrying dispatch..." : "Retry Dispatch"}
              </button>
            )}
          </div>
        </div>
      )}

      {dispatchExecutionId && (
        <div role="status" aria-live="polite" className="mx-4 mt-3 rounded-lg border border-emerald-500/35 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Workflow dispatched successfully.</span>
            <Link
              href={`/executions/${dispatchExecutionId}`}
              className="inline-flex items-center rounded-md border border-emerald-300/35 bg-emerald-100/10 px-3 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-100/20"
            >
              Open Execution Trace
            </Link>
          </div>
        </div>
      )}

      {limitMessage && (
        <div role="status" aria-live="polite" className="mx-4 mt-3 rounded-lg border border-amber-400/35 bg-amber-950/35 px-4 py-2 text-sm text-amber-200">
          {limitMessage}
        </div>
      )}

      {validationResult?.valid && (
        <div role="status" aria-live="polite" className="mx-4 mt-3 rounded-lg border border-emerald-400/35 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Workflow validation passed. This flow is ready to run.
          </div>
        </div>
      )}

      {validationResult && !validationResult.valid && (
        <div role="alert" className="mx-4 mt-3 rounded-lg border border-amber-400/35 bg-amber-950/35 px-4 py-3 text-sm text-amber-200">
          <div className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-4 w-4" />
            Validation found {validationResult.errorsByStep.length} step issue(s)
          </div>

          <div className="mt-2 space-y-1 text-xs text-amber-100/90">
            {validationResult.errorsByStep.slice(0, 6).map((entry) => (
              <p key={`${entry.index}-${entry.stepId || "unknown"}`}>
                Step {entry.index + 1}: {entry.errors.map((error) => error.message).join("; ")}
              </p>
            ))}
            {validationResult.errorsByStep.length > 6 && (
              <p>...and {validationResult.errorsByStep.length - 6} more.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 pt-3 xl:flex-row">
        <WorkflowCanvas
          nodes={editor.nodes}
          edges={editor.edges}
          viewport={editor.viewport}
          selectedNodeId={editor.selectedNodeId}
          dragNodeId={dragNodeId}
          onSelectNode={(nodeId) => dispatch(setSelectedNode(nodeId))}
          onNodePointerDown={onNodePointerDown}
          onViewportChange={(viewport: ViewportState) => dispatch(setViewport(viewport))}
          canAddStep={canAddStep}
          currentStepCount={editor.nodes.length}
          maxSteps={maxSteps}
          onAddStepBlocked={handleAddStepBlocked}
          onCreateNodeAfter={(afterNodeId, type, position) =>
            handleAddNode(type || "http_request", { afterNodeId, position })
          }
        />

        {selectedNode && (
          <div
            className={cn(
              isInspectorOpen ? "block" : "hidden xl:block",
              "min-h-0 xl:h-full xl:w-95 xl:shrink-0",
            )}
          >
            <InspectorPanel
              selectedNode={selectedNode}
              onUpdateName={(name) => {
                if (!selectedNode) return;
                applyEditorChange(() => {
                  dispatch(updateNodeName({ nodeId: selectedNode.id, name }));
                });
              }}
              onUpdateType={(type) => {
                if (!selectedNode) return;
                applyEditorChange(() => {
                  dispatch(updateNodeType({ nodeId: selectedNode.id, type }));
                });
              }}
              onPatchConfig={(patch) => {
                if (!selectedNode) return;
                applyEditorChange(() => {
                  dispatch(patchNodeConfig({ nodeId: selectedNode.id, patch }));
                });
              }}
              onUpdateFailure={(onFailure) => {
                if (!selectedNode) return;
                applyEditorChange(() => {
                  dispatch(updateNodeOnFailure({ nodeId: selectedNode.id, onFailure }));
                });
              }}
              onToggleActive={(isActive) => {
                if (!selectedNode) return;
                applyEditorChange(() => {
                  dispatch(setNodeActive({ nodeId: selectedNode.id, isActive }));
                });
              }}
              onDeleteNode={() => {
                handleDeleteSelectedNode();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkflowEditor(props: WorkflowEditorProps) {
  const [store] = useState(() => createWorkflowEditorStore());

  return (
    <Provider store={store}>
      <WorkflowEditorInner {...props} />
    </Provider>
  );
}
