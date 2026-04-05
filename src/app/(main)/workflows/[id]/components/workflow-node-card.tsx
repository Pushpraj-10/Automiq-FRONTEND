import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "../types/editor.types";
import { formatActionType } from "../utils/editor-graph";
import { ActionIcon } from "./action-icon";

type WorkflowNodeCardProps = {
  node: WorkflowNode;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (nodeId: string) => void;
  onNodePointerDown: (nodeId: string, clientX: number, clientY: number) => void;
};

export function WorkflowNodeCard({
  node,
  isSelected,
  isDragging,
  onSelect,
  onNodePointerDown,
}: WorkflowNodeCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select step ${node.data.stepNumber}: ${node.data.name}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(node.id);
        }
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (event.button !== 0) return;
        onNodePointerDown(node.id, event.clientX, event.clientY);
      }}
      className={cn(
        "group absolute rounded-xl border bg-[#141414] px-4 py-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-[background-color,border-color,box-shadow]",
        "hover:border-[#facc15]/40 hover:bg-[#171717]",
        isSelected ? "border-[#facc15] ring-2 ring-[#facc15]/25" : "border-white/15",
        "focus-visible:border-[#facc15]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]/25",
        isDragging && "cursor-grabbing",
      )}
      style={{
        width: `${node.width}px`,
        height: `${node.height}px`,
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-white/10 bg-[#1d1d1d] p-2">
            <ActionIcon type={node.data.type} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#facc15]">
              Step {node.data.stepNumber}
            </p>
            <h3 className="line-clamp-2 text-sm font-semibold text-neutral-100">{node.data.name}</h3>
          </div>
        </div>

        <button
          type="button"
          aria-label={`Drag step ${node.data.stepNumber}`}
          onPointerDown={(event) => {
            event.stopPropagation();
            onNodePointerDown(node.id, event.clientX, event.clientY);
          }}
          className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]/30"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge className="h-6 border border-white/15 bg-[#1e1e1e] px-2 text-[11px] text-neutral-200 hover:bg-[#1e1e1e]">
          {formatActionType(node.data.type)}
        </Badge>
        <p className="text-xs text-neutral-400">{node.data.kind === "trigger" ? "Trigger" : "Action"}</p>
      </div>
    </div>
  );
}
