import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewportState, WorkflowNode } from "../types/editor.types";

type UseNodeDragOptions = {
  viewport: ViewportState;
  getNodeById: (nodeId: string) => WorkflowNode | undefined;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onDragStart?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string) => void;
};

type DragState = {
  nodeId: string;
  pointerX: number;
  pointerY: number;
  originX: number;
  originY: number;
  started: boolean;
};

const DRAG_START_THRESHOLD_PX = 3;

export function useNodeDrag({ viewport, getNodeById, onNodeMove, onDragStart, onDragEnd }: UseNodeDragOptions) {
  const [dragNodeId, setDragNodeId] = useState<string>();
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);

  const applyDragMove = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      if (!drag) return;

      const distancePx = Math.hypot(clientX - drag.pointerX, clientY - drag.pointerY);
      if (!drag.started) {
        if (distancePx < DRAG_START_THRESHOLD_PX) return;
        drag.started = true;
        onDragStart?.(drag.nodeId);
      }

      const dx = (clientX - drag.pointerX) / viewport.scale;
      const dy = (clientY - drag.pointerY) / viewport.scale;

      onNodeMove(drag.nodeId, drag.originX + dx, drag.originY + dy);
    },
    [onDragStart, onNodeMove, viewport.scale],
  );

  const queueDragMove = useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const latest = latestPointerRef.current;
      if (!latest) return;
      applyDragMove(latest.x, latest.y);
    });
  }, [applyDragMove]);

  const onNodePointerDown = useCallback(
    (nodeId: string, clientX: number, clientY: number) => {
      const node = getNodeById(nodeId);
      if (!node) return;

      dragRef.current = {
        nodeId,
        pointerX: clientX,
        pointerY: clientY,
        originX: node.position.x,
        originY: node.position.y,
        started: false,
      };
      latestPointerRef.current = { x: clientX, y: clientY };
      setDragNodeId(nodeId);
    },
    [getNodeById],
  );

  useEffect(() => {
    if (!dragNodeId) return;

    const onPointerMove = (event: PointerEvent) => {
      latestPointerRef.current = { x: event.clientX, y: event.clientY };
      queueDragMove();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      applyDragMove(event.clientX, event.clientY);

      const drag = dragRef.current;
      if (drag?.started) {
        onDragEnd?.(drag.nodeId);
      }

      dragRef.current = null;
      latestPointerRef.current = null;
      setDragNodeId(undefined);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [applyDragMove, dragNodeId, onDragEnd, queueDragMove]);

  return {
    dragNodeId,
    onNodePointerDown,
  };
}
