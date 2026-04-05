import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import type { ViewportState } from "../types/editor.types";
import { zoomAroundPoint } from "../utils/viewport";

type UsePanZoomOptions = {
  viewport: ViewportState;
  onViewportChange: (next: ViewportState) => void;
};

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(target.closest('button, input, textarea, select, a, [role="button"], [data-no-pan="true"]'));
}

export function usePanZoom({ viewport, onViewportChange }: UsePanZoomOptions) {
  const [isPanning, setIsPanning] = useState(false);
  const startRef = useRef<{ x: number; y: number; viewport: ViewportState } | null>(null);
  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const applyWheelZoom = useCallback(
    (deltaY: number, clientX: number, clientY: number) => {
      const zoomDelta = deltaY > 0 ? -0.07 : 0.07;
      const next = zoomAroundPoint(viewportRef.current, zoomDelta, {
        x: clientX,
        y: clientY,
      });
      onViewportChange(next);
    },
    [onViewportChange],
  );

  const onBackgroundPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      if (isInteractiveTarget(event.target)) return;

      startRef.current = {
        x: event.clientX,
        y: event.clientY,
        viewport,
      };
      setIsPanning(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [viewport],
  );

  const onBackgroundPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!startRef.current) return;

      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      onViewportChange({
        ...startRef.current.viewport,
        x: startRef.current.viewport.x + dx,
        y: startRef.current.viewport.y + dy,
      });
    },
    [onViewportChange],
  );

  const onBackgroundPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    startRef.current = null;
    setIsPanning(false);
  }, []);

  const onCanvasWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();

      applyWheelZoom(event.deltaY, event.clientX, event.clientY);
    },
    [applyWheelZoom],
  );

  const onNativeCanvasWheel = useCallback(
    (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();

      applyWheelZoom(event.deltaY, event.clientX, event.clientY);
    },
    [applyWheelZoom],
  );

  return {
    isPanning,
    onBackgroundPointerDown,
    onBackgroundPointerMove,
    onBackgroundPointerUp,
    onCanvasWheel,
    onNativeCanvasWheel,
  };
}
