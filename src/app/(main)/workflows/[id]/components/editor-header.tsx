import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  Send,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActionType } from "@/types";
import { ACTION_PRESETS } from "../data/action-presets";
import type { WorkflowMeta } from "../types/editor.types";

const statusClass: Record<WorkflowMeta["status"], string> = {
  draft: "border border-[#facc15]/30 bg-[#2f2611] text-[#f5d46a]",
  active: "border border-emerald-400/30 bg-[#13241b] text-emerald-300",
  paused: "border border-amber-400/30 bg-[#302510] text-amber-300",
  archived: "border border-white/15 bg-[#202020] text-neutral-300",
};

type EditorHeaderProps = {
  meta?: WorkflowMeta;
  isDirty: boolean;
  isSaving: boolean;
  isValidating: boolean;
  canUndo: boolean;
  canAddStep: boolean;
  currentStepCount: number;
  maxSteps: number;
  hasSelectedNode: boolean;
  isInspectorOpen: boolean;
  lastSavedAt?: number | null;
  onNameChange: (name: string) => void;
  onValidate: () => void;
  onUndo: () => void;
  onPublish: () => void;
  onAddNode: (type: ActionType) => void;
  onToggleInspector: () => void;
};

export function EditorHeader({
  meta,
  isDirty,
  isSaving,
  isValidating,
  canUndo,
  canAddStep,
  currentStepCount,
  maxSteps,
  hasSelectedNode,
  isInspectorOpen,
  lastSavedAt,
  onNameChange,
  onValidate,
  onUndo,
  onPublish,
  onAddNode,
  onToggleInspector,
}: EditorHeaderProps) {
  const workflowName = meta?.name || "Untitled workflow";
  const savedAtLabel = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : undefined;
  const syncLabel = isSaving
    ? "Saving changes"
    : isDirty
      ? "Unsaved changes"
      : savedAtLabel
        ? `Saved at ${savedAtLabel}`
        : "All changes saved";
  const syncTone = isSaving
    ? "border border-sky-400/25 bg-sky-500/10 text-sky-200"
    : isDirty
      ? "border border-[#facc15]/30 bg-[#facc15]/10 text-[#f8d97e]"
      : "border border-emerald-400/25 bg-emerald-500/10 text-emerald-200";

  return (
    <header className="flex shrink-0 flex-col gap-3 border-b border-white/10 bg-[#0f0f0f] px-4 py-3 xl:h-14 xl:flex-row xl:items-center xl:justify-between xl:gap-4 xl:px-5 xl:py-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link href="/workflows">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back to workflows"
            className="h-8 w-8 rounded-md text-neutral-400 hover:bg-white/10 hover:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="h-6 w-px bg-white/15" />

        <Input
          value={workflowName}
          onChange={(event) => onNameChange(event.target.value)}
          className="my-0 h-8 w-44 border-white/15 bg-[#171717] px-2 text-sm font-semibold text-neutral-100 hover:border-white/25 sm:w-64 lg:w-80"
        />

        <Badge className={`${statusClass[meta?.status || "draft"]} text-[11px] font-semibold capitalize`}>
          {meta?.status || "draft"}
        </Badge>

        <span className={cn("hidden rounded-md px-2 py-1 text-[11px] font-medium md:inline-flex", syncTone)}>
          {syncLabel}
        </span>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
        <span className={cn("rounded-md px-2 py-1 text-[11px] font-medium md:hidden", syncTone)}>{syncLabel}</span>

        <Button
          variant="outline"
          onClick={onToggleInspector}
          disabled={!hasSelectedNode}
          aria-pressed={isInspectorOpen}
          aria-label={isInspectorOpen ? "Hide inspector" : "Show inspector"}
          className="h-9 shrink-0 border-white/15 bg-transparent px-3 text-neutral-300 hover:bg-white/10 hover:text-neutral-100 xl:hidden"
        >
          {isInspectorOpen ? <PanelRightClose className="mr-2 h-4 w-4" /> : <PanelRightOpen className="mr-2 h-4 w-4" />}
          Inspector
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isSaving}
            render={
              <Button
                variant="outline"
                className={cn(
                  "h-9 shrink-0 border-white/15 bg-transparent px-3 font-semibold text-neutral-200 hover:bg-white/10",
                  !canAddStep && "border-amber-400/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15",
                )}
              />
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Step
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 min-w-80 border-white/15 bg-[#121212] text-neutral-100">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-neutral-400">
                Action Library ({currentStepCount}/{maxSteps})
              </DropdownMenuLabel>
              {!canAddStep && (
                <div className="mb-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200">
                  Step limit reached. Remove a step to add another.
                </div>
              )}
              {ACTION_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset.type}
                  disabled={!canAddStep}
                  onClick={() => onAddNode(preset.type)}
                  className="h-14 items-start focus:bg-white/10"
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-100">{preset.title}</span>
                    <span className="text-xs text-neutral-400">{preset.description}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!canAddStep} onClick={() => onAddNode("http_request")}>
              Quick add HTTP request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={onValidate}
          disabled={isSaving || isValidating}
          className="h-9 shrink-0 border-white/15 bg-transparent px-3 text-neutral-200 hover:bg-white/10"
        >
          {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {isValidating ? "Validating" : "Test run"}
        </Button>

        <Button
          onClick={onPublish}
          disabled={isSaving}
          className="h-9 shrink-0 rounded-md bg-[#facc15] px-4 font-semibold text-[#241f16] hover:bg-[#f2c414]"
        >
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
      </div>
    </header>
  );
}
