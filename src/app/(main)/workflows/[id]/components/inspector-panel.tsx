import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTION_PRESETS } from "../data/action-presets";
import type { WorkflowNode } from "../types/editor.types";
import { ActionIcon } from "./action-icon";
import { cn } from "@/lib/utils";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
const DELAY_UNITS = ["seconds", "minutes", "hours", "days"] as const;

type DelayUnit = (typeof DELAY_UNITS)[number];

const PANEL_INPUT_CLASS =
  "my-0 h-10 border-white/15 bg-[#181818] px-3 text-neutral-100 placeholder:text-neutral-500 transition-colors hover:border-white/25 focus-visible:border-[#facc15]/45 focus-visible:ring-2 focus-visible:ring-[#facc15]/20";

const PANEL_SELECT_TRIGGER_CLASS =
  "my-0 w-full rounded-xl border-white/15 bg-[#181818] px-3.5 text-neutral-100 data-[size=default]:h-10 data-placeholder:text-neutral-500 transition-colors hover:border-white/25 hover:bg-[#1c1c1c] focus-visible:border-[#facc15]/45 focus-visible:ring-2 focus-visible:ring-[#facc15]/20";

const PANEL_SELECT_CONTENT_CLASS =
  "w-auto min-w-[max(14rem,var(--anchor-width))] rounded-xl border border-white/15 bg-[#121212]/98 p-1.5 text-neutral-100 shadow-[0_18px_44px_rgba(0,0,0,0.55)] ring-1 ring-black/35 backdrop-blur-sm";

const PANEL_SELECT_ITEM_CLASS =
  "cursor-pointer rounded-lg py-2 pl-2.5 pr-8 text-sm font-medium leading-5 text-neutral-100 focus:bg-white/10 focus:text-neutral-100 data-[highlighted]:bg-white/10 data-[state=checked]:bg-white/10 data-[state=checked]:text-neutral-100 data-[state=checked]:font-semibold";

const PANEL_TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-white/15 bg-[#181818] px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 transition-colors hover:border-white/25 focus-visible:border-[#facc15]/45 focus-visible:ring-2 focus-visible:ring-[#facc15]/20";

const PANEL_SELECT_CONTENT_PROPS = {
  side: "bottom" as const,
  align: "start" as const,
  sideOffset: 8,
  alignItemWithTrigger: false,
};

type InspectorPanelProps = {
  selectedNode?: WorkflowNode;
  className?: string;
  onUpdateName: (name: string) => void;
  onUpdateType: (type: WorkflowNode["data"]["type"]) => void;
  onPatchConfig: (patch: Record<string, unknown>) => void;
  onUpdateFailure: (onFailure: Record<string, unknown>) => void;
  onToggleActive: (isActive: boolean) => void;
  onDeleteNode: () => void;
};

function asString(input: unknown, fallback = "") {
  if (typeof input === "string") return input;
  return fallback;
}

function asNumber(input: unknown, fallback = 0) {
  if (typeof input === "number") return input;
  return fallback;
}

function parseCommaList(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCommaNumberList(input: string) {
  return input
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

function toCommaList(input: unknown) {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function recordToLines(input: unknown) {
  if (!isRecord(input)) return "";

  return Object.entries(input)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}: ${value}`;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return `${key}: ${String(value)}`;
      }

      return `${key}: ${JSON.stringify(value)}`;
    })
    .join("\n");
}

function parseLinesToRecord(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const colonIndex = line.indexOf(":");
      const equalsIndex = line.indexOf("=");
      const separatorIndex =
        colonIndex >= 0 && equalsIndex >= 0
          ? Math.min(colonIndex, equalsIndex)
          : Math.max(colonIndex, equalsIndex);

      if (separatorIndex < 0) {
        acc[line] = "";
        return acc;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key) {
        acc[key] = value;
      }

      return acc;
    }, {});
}

function toDisplayText(input: unknown) {
  if (typeof input === "string") return input;
  if (input === null || input === undefined) return "";

  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return String(input);
  }
}

function toDelayParts(durationMs: number): { value: number; unit: DelayUnit } {
  if (durationMs % (24 * 60 * 60 * 1000) === 0) {
    return { value: Math.max(1, durationMs / (24 * 60 * 60 * 1000)), unit: "days" };
  }

  if (durationMs % (60 * 60 * 1000) === 0) {
    return { value: Math.max(1, durationMs / (60 * 60 * 1000)), unit: "hours" };
  }

  if (durationMs % (60 * 1000) === 0) {
    return { value: Math.max(1, durationMs / (60 * 1000)), unit: "minutes" };
  }

  return { value: Math.max(1, Math.floor(durationMs / 1000)), unit: "seconds" };
}

function toDurationMs(value: number, unit: DelayUnit) {
  if (!Number.isFinite(value) || value <= 0) return 1000;

  if (unit === "days") return value * 24 * 60 * 60 * 1000;
  if (unit === "hours") return value * 60 * 60 * 1000;
  if (unit === "minutes") return value * 60 * 1000;
  return value * 1000;
}

function normalizeFailureStrategy(input: unknown): "retry" | "stop" | "continue" {
  if (input === "retry" || input === "stop" || input === "continue") {
    return input;
  }

  if (input === "ignore") {
    return "continue";
  }

  return "retry";
}

type NumberInputWithStepperProps = {
  value: number;
  min?: number;
  fallback: number;
  ariaLabel: string;
  onChange: (value: number) => void;
};

function NumberInputWithStepper({
  value,
  min = 1,
  fallback,
  ariaLabel,
  onChange,
}: NumberInputWithStepperProps) {
  const normalizedValue = Number.isFinite(value) ? Math.max(min, value) : fallback;

  const commit = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      onChange(fallback);
      return;
    }

    onChange(Math.max(min, Math.floor(nextValue)));
  };

  return (
    <div className="relative">
      <Input
        type="number"
        min={min}
        value={normalizedValue}
        onChange={(event) => {
          const rawValue = event.target.value;
          if (rawValue === "") {
            onChange(fallback);
            return;
          }

          commit(Number(rawValue));
        }}
        aria-label={ariaLabel}
        className={cn(
          PANEL_INPUT_CLASS,
          "pr-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />

      <div className="absolute inset-y-1 right-1 flex w-7 flex-col overflow-hidden rounded-md border border-white/10 bg-[#212121]">
        <button
          type="button"
          aria-label={`Increase ${ariaLabel}`}
          className="flex h-1/2 items-center justify-center border-b border-white/10 text-neutral-300 transition-colors hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#facc15]/35"
          onClick={() => commit(normalizedValue + 1)}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          aria-label={`Decrease ${ariaLabel}`}
          className="flex h-1/2 items-center justify-center text-neutral-300 transition-colors hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#facc15]/35"
          onClick={() => commit(normalizedValue - 1)}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function InspectorPanel({
  selectedNode,
  className,
  onUpdateName,
  onUpdateType,
  onPatchConfig,
  onUpdateFailure,
  onToggleActive,
  onDeleteNode,
}: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <aside className={cn("w-full shrink-0 rounded-xl border border-white/10 bg-[#111111] p-6 xl:w-95", className)}>
        <h3 className="text-base font-semibold text-neutral-100">Inspector</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Select a node to configure behavior, request payloads, and failure strategy.
        </p>
      </aside>
    );
  }

  const strategy = normalizeFailureStrategy(selectedNode.data.onFailure?.strategy);
  const maxAttempts = Math.max(1, asNumber(selectedNode.data.onFailure?.maxAttempts, 3));
  const delayParts = toDelayParts(Math.max(1000, asNumber(selectedNode.data.config.durationMs, 60000)));

  return (
    <aside
      role="region"
      aria-label="Step inspector"
      className={cn(
        "min-h-0 w-full shrink-0 max-h-[58vh] overflow-y-auto rounded-xl border border-white/10 bg-[#111111] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden xl:h-full xl:max-h-none xl:w-95 pb-3",
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-white/10 bg-[#1d1d1d] p-2">
            <ActionIcon type={selectedNode.data.type} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#facc15]">Step {selectedNode.data.stepNumber}</p>
            <p className="text-sm font-semibold text-neutral-100">{selectedNode.data.kind === "trigger" ? "Trigger" : "Action"}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete selected step"
          className="h-8 w-8 text-neutral-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={onDeleteNode}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-7 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Name</p>
          <Input
            value={selectedNode.data.name}
            onChange={(event) => onUpdateName(event.target.value)}
            className={PANEL_INPUT_CLASS}
          />
          <p className="text-[11px] text-neutral-500">Use a short, action-oriented title so this step is easy to scan in the canvas.</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Type</p>
          <Select value={selectedNode.data.type} onValueChange={(value) => onUpdateType(value as WorkflowNode["data"]["type"])}>
            <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
              {ACTION_PRESETS.map((preset) => (
                <SelectItem key={preset.type} value={preset.type} className={PANEL_SELECT_ITEM_CLASS}>
                  {preset.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-neutral-500">Changing type resets this step configuration to safe defaults.</p>
        </div>

        {selectedNode.data.type === "http_request" && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-[#161616] p-4">
            <div className="rounded-lg border border-[#facc15]/25 bg-[#facc15]/10 px-3 py-2">
              <p className="text-xs font-semibold text-[#f7d97b]">Required fields: Method, URL</p>
              <p className="mt-1 text-[11px] text-neutral-400">Optional: headers, query params, body, timeout, and success status codes.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Method</p>
                <Select
                  value={asString(selectedNode.data.config.method, "POST")}
                  onValueChange={(value) => onPatchConfig({ method: value })}
                >
                  <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
                    {HTTP_METHODS.map((method) => (
                      <SelectItem key={method} value={method} className={PANEL_SELECT_ITEM_CLASS}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <p className="text-xs text-neutral-500">URL</p>
                <Input
                  value={asString(selectedNode.data.config.url)}
                  onChange={(event) => onPatchConfig({ url: event.target.value })}
                  className={PANEL_INPUT_CLASS}
                />
                <p className="text-[11px] text-neutral-500">Include full URL with protocol, for example https://api.example.com/orders.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Timeout (ms)</p>
                <NumberInputWithStepper
                  ariaLabel="Timeout in milliseconds"
                  value={Math.max(1, asNumber(selectedNode.data.config.timeoutMs, 10000))}
                  fallback={10000}
                  onChange={(timeoutMs) => onPatchConfig({ timeoutMs })}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Success Codes</p>
                <Input
                  value={toCommaList(selectedNode.data.config.successStatusCodes)}
                  onChange={(event) => onPatchConfig({ successStatusCodes: parseCommaNumberList(event.target.value) })}
                  className={PANEL_INPUT_CLASS}
                  placeholder="200, 201, 204"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Headers (one per line: key: value)</p>
              <textarea
                value={recordToLines(selectedNode.data.config.headers)}
                onChange={(event) => onPatchConfig({ headers: parseLinesToRecord(event.target.value) })}
                className={cn("h-24", PANEL_TEXTAREA_CLASS)}
                placeholder={"Authorization: Bearer <token>\\nX-Correlation-Id: abc-123"}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Query Params (one per line: key=value)</p>
              <textarea
                value={recordToLines(selectedNode.data.config.query)}
                onChange={(event) => onPatchConfig({ query: parseLinesToRecord(event.target.value) })}
                className={cn("h-24", PANEL_TEXTAREA_CLASS)}
                placeholder={"limit=100\\nactive=true"}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Body</p>
              <textarea
                value={toDisplayText(selectedNode.data.config.body)}
                onChange={(event) => onPatchConfig({ body: event.target.value })}
                className={cn("h-40", PANEL_TEXTAREA_CLASS)}
                placeholder='{"key":"value"}'
              />
              <p className="text-[11px] text-neutral-500">Use raw text or JSON. Variables can be added later with templating support.</p>
            </div>
          </div>
        )}

        {selectedNode.data.type === "delay" && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#161616] p-4">
            <div className="rounded-lg border border-[#facc15]/25 bg-[#facc15]/10 px-3 py-2">
              <p className="text-xs font-semibold text-[#f7d97b]">Required field: Duration</p>
              <p className="mt-1 text-[11px] text-neutral-400">Set how long execution should pause before the next step.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Duration</p>
                <NumberInputWithStepper
                  ariaLabel="Delay duration"
                  value={delayParts.value}
                  fallback={1}
                  onChange={(value) => onPatchConfig({ durationMs: toDurationMs(value, delayParts.unit) })}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Unit</p>
                <Select
                  value={delayParts.unit}
                  onValueChange={(value) => {
                    const unit = value as DelayUnit;
                    onPatchConfig({ durationMs: toDurationMs(delayParts.value, unit) });
                  }}
                >
                  <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
                    {DELAY_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit} className={PANEL_SELECT_ITEM_CLASS}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {selectedNode.data.type === "send_email" && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#161616] p-4">
            <div className="rounded-lg border border-[#facc15]/25 bg-[#facc15]/10 px-3 py-2">
              <p className="text-xs font-semibold text-[#f7d97b]">Required fields: Provider, From, To, Subject, Text or HTML body</p>
              <p className="mt-1 text-[11px] text-neutral-400">Use comma-separated addresses for recipient fields.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Provider</p>
                <Select
                  value={asString(selectedNode.data.config.provider, "sendgrid")}
                  onValueChange={(value) => onPatchConfig({ provider: value })}
                >
                  <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
                    <SelectItem value="sendgrid" className={PANEL_SELECT_ITEM_CLASS}>SendGrid</SelectItem>
                    <SelectItem value="smtp" className={PANEL_SELECT_ITEM_CLASS}>SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-neutral-500">From</p>
                <Input
                  value={asString(selectedNode.data.config.from)}
                  onChange={(event) => onPatchConfig({ from: event.target.value })}
                  className={PANEL_INPUT_CLASS}
                  placeholder="noreply@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">To</p>
              <Input
                value={toCommaList(selectedNode.data.config.to)}
                onChange={(event) => onPatchConfig({ to: parseCommaList(event.target.value) })}
                className={PANEL_INPUT_CLASS}
                placeholder="ops@example.com, engineering@example.com"
              />
              <p className="text-[11px] text-neutral-500">At least one recipient is required.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">CC</p>
                <Input
                  value={toCommaList(selectedNode.data.config.cc)}
                  onChange={(event) => onPatchConfig({ cc: parseCommaList(event.target.value) })}
                  className={PANEL_INPUT_CLASS}
                  placeholder="team@example.com"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">BCC</p>
                <Input
                  value={toCommaList(selectedNode.data.config.bcc)}
                  onChange={(event) => onPatchConfig({ bcc: parseCommaList(event.target.value) })}
                  className={PANEL_INPUT_CLASS}
                  placeholder="audit@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Reply-To</p>
              <Input
                value={asString(selectedNode.data.config.replyTo)}
                onChange={(event) => onPatchConfig({ replyTo: event.target.value })}
                className={PANEL_INPUT_CLASS}
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Subject</p>
              <Input
                value={asString(selectedNode.data.config.subject)}
                onChange={(event) => onPatchConfig({ subject: event.target.value })}
                className={PANEL_INPUT_CLASS}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Text Body</p>
              <textarea
                value={asString(selectedNode.data.config.text)}
                onChange={(event) => onPatchConfig({ text: event.target.value })}
                className={cn("h-32", PANEL_TEXTAREA_CLASS)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">HTML Body</p>
              <textarea
                value={asString(selectedNode.data.config.html)}
                onChange={(event) => onPatchConfig({ html: event.target.value })}
                className={cn("h-32", PANEL_TEXTAREA_CLASS)}
                placeholder="<p>Hello {{user.name}}</p>"
              />
            </div>

            {!asString(selectedNode.data.config.text) && !asString(selectedNode.data.config.html) && (
              <p className="rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                Provide either Text Body or HTML Body to satisfy action validation.
              </p>
            )}
          </div>
        )}

        {selectedNode.data.type === "webhook_notification" && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-[#161616] p-4">
            <div className="rounded-lg border border-[#facc15]/25 bg-[#facc15]/10 px-3 py-2">
              <p className="text-xs font-semibold text-[#f7d97b]">Required field: Webhook URL</p>
              <p className="mt-1 text-[11px] text-neutral-400">Optional method, headers, payload, timeout, and success status codes can refine delivery behavior.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <p className="text-xs text-neutral-500">Webhook URL</p>
                <Input
                  value={asString(selectedNode.data.config.url)}
                  onChange={(event) => onPatchConfig({ url: event.target.value })}
                  className={PANEL_INPUT_CLASS}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Method</p>
                <Select
                  value={asString(selectedNode.data.config.method, "POST")}
                  onValueChange={(value) => onPatchConfig({ method: value })}
                >
                  <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
                    {HTTP_METHODS.map((method) => (
                      <SelectItem key={method} value={method} className={PANEL_SELECT_ITEM_CLASS}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Timeout (ms)</p>
                <NumberInputWithStepper
                  ariaLabel="Webhook timeout in milliseconds"
                  value={Math.max(1, asNumber(selectedNode.data.config.timeoutMs, 10000))}
                  fallback={10000}
                  onChange={(timeoutMs) => onPatchConfig({ timeoutMs })}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Success Codes</p>
                <Input
                  value={toCommaList(selectedNode.data.config.successStatusCodes)}
                  onChange={(event) => onPatchConfig({ successStatusCodes: parseCommaNumberList(event.target.value) })}
                  className={PANEL_INPUT_CLASS}
                  placeholder="200, 201, 204"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Headers (one per line: key: value)</p>
              <textarea
                value={recordToLines(selectedNode.data.config.headers)}
                onChange={(event) => onPatchConfig({ headers: parseLinesToRecord(event.target.value) })}
                className={cn("h-24", PANEL_TEXTAREA_CLASS)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Payload (one per line: key=value)</p>
              <textarea
                value={recordToLines(selectedNode.data.config.payload)}
                onChange={(event) => onPatchConfig({ payload: parseLinesToRecord(event.target.value) })}
                className={cn("h-24", PANEL_TEXTAREA_CLASS)}
              />
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-white/10 bg-[#161616] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Failure Strategy</p>
          <p className="text-[11px] text-neutral-500">Define how this step should behave if execution fails.</p>
          <Select
            value={strategy}
            onValueChange={(value) => {
              const next = normalizeFailureStrategy(value);
              if (next === "retry") {
                onUpdateFailure({ strategy: "retry", maxAttempts });
                return;
              }
              onUpdateFailure({ strategy: next });
            }}
          >
            <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
              <SelectItem value="retry" className={PANEL_SELECT_ITEM_CLASS}>Auto Retry</SelectItem>
              <SelectItem value="stop" className={PANEL_SELECT_ITEM_CLASS}>Stop Workflow</SelectItem>
              <SelectItem value="continue" className={PANEL_SELECT_ITEM_CLASS}>Continue Workflow</SelectItem>
            </SelectContent>
          </Select>

          {strategy === "retry" && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-neutral-500">Max Attempts</p>
              <NumberInputWithStepper
                ariaLabel="Retry max attempts"
                value={maxAttempts}
                fallback={1}
                onChange={(next) => onUpdateFailure({ strategy: "retry", maxAttempts: next })}
              />
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-[#161616] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Execution</p>
          <p className="text-[11px] text-neutral-500">Paused steps are skipped until reactivated.</p>
          <Select
            value={selectedNode.data.isActive ? "active" : "paused"}
            onValueChange={(value) => onToggleActive(value === "active")}
          >
            <SelectTrigger className={PANEL_SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent {...PANEL_SELECT_CONTENT_PROPS} className={PANEL_SELECT_CONTENT_CLASS}>
              <SelectItem value="active" className={PANEL_SELECT_ITEM_CLASS}>Active</SelectItem>
              <SelectItem value="paused" className={PANEL_SELECT_ITEM_CLASS}>Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
}
