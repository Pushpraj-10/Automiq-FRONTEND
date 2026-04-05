import type { Point, ViewportState } from "../types/editor.types";

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 1.8;

export function clampZoom(nextScale: number) {
  if (nextScale < MIN_ZOOM) return MIN_ZOOM;
  if (nextScale > MAX_ZOOM) return MAX_ZOOM;
  return nextScale;
}

export function screenToCanvas(point: Point, viewport: ViewportState): Point {
  return {
    x: (point.x - viewport.x) / viewport.scale,
    y: (point.y - viewport.y) / viewport.scale,
  };
}

export function zoomAroundPoint(
  viewport: ViewportState,
  zoomDelta: number,
  anchor: Point,
): ViewportState {
  const nextScale = clampZoom(viewport.scale + zoomDelta);
  const scaleRatio = nextScale / viewport.scale;

  return {
    x: anchor.x - (anchor.x - viewport.x) * scaleRatio,
    y: anchor.y - (anchor.y - viewport.y) * scaleRatio,
    scale: nextScale,
  };
}
