import { useCallback, useEffect, useMemo, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionType } from "@/types";
import { usePanZoom } from "../hooks/use-pan-zoom";
import type { Point, ViewportState, WorkflowEdge, WorkflowNode } from "../types/editor.types";
import { WorkflowNodeCard } from "./workflow-node-card";

type WorkflowCanvasProps = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: ViewportState;
  canAddStep: boolean;
  currentStepCount: number;
  maxSteps: number;
  selectedNodeId?: string;
  dragNodeId?: string;
  onSelectNode: (nodeId?: string) => void;
  onNodePointerDown: (nodeId: string, clientX: number, clientY: number) => void;
  onViewportChange: (viewport: ViewportState) => void;
  onAddStepBlocked?: () => void;
  onCreateNodeAfter: (afterNodeId?: string, type?: ActionType, position?: Point) => void;
};

const CANVAS_SIZE = 2600;

function getCubicBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) {
  const invT = 1 - t;
  const invTSquared = invT * invT;
  const invTCubed = invTSquared * invT;
  const tSquared = t * t;
  const tCubed = tSquared * t;

  return {
    x: invTCubed * p0.x + 3 * invTSquared * t * p1.x + 3 * invT * tSquared * p2.x + tCubed * p3.x,
    y: invTCubed * p0.y + 3 * invTSquared * t * p1.y + 3 * invT * tSquared * p2.y + tCubed * p3.y,
  };
}

export function WorkflowCanvas({
  nodes,
  edges,
  viewport,
  canAddStep,
  currentStepCount,
  maxSteps,
  selectedNodeId,
  dragNodeId,
  onSelectNode,
  onNodePointerDown,
  onViewportChange,
  onAddStepBlocked,
  onCreateNodeAfter,
}: WorkflowCanvasProps) {
  const nodeById = useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  const {
    isPanning,
    onBackgroundPointerDown,
    onBackgroundPointerMove,
    onBackgroundPointerUp,
    onNativeCanvasWheel,
  } = usePanZoom({
    viewport,
    onViewportChange,
  });

  const canvasRef = useRef<HTMLElement | null>(null);
  const initialCenterAppliedRef = useRef(false);
  const hasViewportInteractionRef = useRef(false);
  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const centerOriginInViewport = useCallback(() => {
    if (hasViewportInteractionRef.current) return;

    const currentViewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!initialCenterAppliedRef.current) {
      const isDefaultViewport = currentViewport.x === 0 && currentViewport.y === 0 && currentViewport.scale === 1;
      if (!isDefaultViewport) {
        hasViewportInteractionRef.current = true;
        return;
      }
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const targetX = rect.width / 2;
    const targetY = rect.height / 2;
    const alreadyCentered = Math.abs(currentViewport.x - targetX) < 0.5 && Math.abs(currentViewport.y - targetY) < 0.5;

    if (alreadyCentered) {
      initialCenterAppliedRef.current = true;
      return;
    }

    initialCenterAppliedRef.current = true;
    onViewportChange({
      ...currentViewport,
      x: targetX,
      y: targetY,
    });
  }, [onViewportChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    centerOriginInViewport();

    const observer = new ResizeObserver(() => {
      centerOriginInViewport();
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [centerOriginInViewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        hasViewportInteractionRef.current = true;
      }
      onNativeCanvasWheel(event);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [onNativeCanvasWheel]);

  return (
    <section
      ref={canvasRef}
      tabIndex={0}
      role="region"
      aria-label="Workflow canvas"
      className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#090909] focus-visible:border-[#facc15]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]/20"
      onPointerDown={(event) => {
        if (event.button === 0) {
          hasViewportInteractionRef.current = true;
        }
        onBackgroundPointerDown(event);
      }}
      onPointerMove={onBackgroundPointerMove}
      onPointerUp={onBackgroundPointerUp}
      onPointerCancel={onBackgroundPointerUp}
      onClick={() => onSelectNode(undefined)}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)]"
        style={{
          backgroundSize: `${14 * viewport.scale}px ${14 * viewport.scale}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {!canAddStep && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-200">
          Step limit reached ({currentStepCount}/{maxSteps}). Remove a step to add another.
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 z-20 hidden rounded-lg border border-white/10 bg-[#121212]/95 px-3 py-1.5 text-[11px] text-neutral-400 shadow-sm backdrop-blur lg:block">
        Hold Ctrl or Cmd and scroll to zoom
      </div>

      <div
        className="relative origin-top-left"
        style={{
          width: `${CANVAS_SIZE}px`,
          height: `${CANVAS_SIZE}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          cursor: isPanning ? "grabbing" : "grab",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          fill="none"
          style={{ overflow: "visible" }}
        >
          {edges.map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;

            const sourceX = source.position.x + source.width / 2;
            const sourceY = source.position.y + source.height;
            const targetX = target.position.x + target.width / 2;
            const targetY = target.position.y;
            const controlY = (sourceY + targetY) / 2;

            return (
              <path
                key={edge.id}
                d={`M ${sourceX} ${sourceY} C ${sourceX} ${controlY}, ${targetX} ${controlY}, ${targetX} ${targetY}`}
                stroke="#facc15"
                strokeWidth={2}
                strokeDasharray="4 5"
              />
            );
          })}
        </svg>

        {edges.map((edge) => {
          const source = nodeById.get(edge.source);
          const target = nodeById.get(edge.target);
          if (!source || !target) return null;

          const sourceX = source.position.x + source.width / 2;
          const sourceY = source.position.y + source.height;
          const targetX = target.position.x + target.width / 2;
          const targetY = target.position.y;
          const controlY = (sourceY + targetY) / 2;

          // Keep the add button locked to the connector curve itself.
          const pointOnConnector = getCubicBezierPoint(
            0.5,
            { x: sourceX, y: sourceY },
            { x: sourceX, y: controlY },
            { x: targetX, y: controlY },
            { x: targetX, y: targetY },
          );

          const x = pointOnConnector.x - 16;
          const y = pointOnConnector.y - 16;

          return (
            <Button
              key={`${edge.id}-add`}
              variant="outline"
              size="icon"
              disabled={!canAddStep}
              aria-label={`Add step after step ${source.data.stepNumber}`}
              onClick={(event) => {
                event.stopPropagation();
                if (!canAddStep) {
                  onAddStepBlocked?.();
                  return;
                }
                onCreateNodeAfter(edge.source);
              }}
              className={`absolute z-20 h-8 w-8 rounded-full border shadow-sm ${
                canAddStep
                  ? "border-white/15 bg-[#171717] text-[#facc15] hover:bg-[#1f1f1f]"
                  : "border-amber-400/35 bg-amber-500/10 text-amber-200"
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          );
        })}

        {nodes.map((node) => (
          <WorkflowNodeCard
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            isDragging={dragNodeId === node.id}
            onSelect={onSelectNode}
            onNodePointerDown={onNodePointerDown}
          />
        ))}

        {nodes.length === 0 && (
          <div className="absolute left-0 top-0 w-105 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <h3 className="text-lg font-semibold text-neutral-100">No steps yet</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Add your trigger and first action to start composing this workflow.
            </p>
            <Button
              disabled={!canAddStep}
              aria-label="Add trigger step"
              className="mt-4 h-9 rounded-md bg-[#facc15] px-4 text-sm font-semibold text-black hover:bg-[#f2c414]"
              onClick={(event) => {
                event.stopPropagation();
                if (!canAddStep) {
                  onAddStepBlocked?.();
                  return;
                }
                onCreateNodeAfter(undefined, "http_request", { x: 0, y: 0 });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add trigger step
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}