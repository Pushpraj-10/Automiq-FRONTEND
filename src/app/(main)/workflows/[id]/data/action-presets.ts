import type { ActionType } from "@/types";

export type ActionPreset = {
  type: ActionType;
  title: string;
  description: string;
  accentClass: string;
};

export const ACTION_PRESETS: ActionPreset[] = [
  {
    type: "webhook_notification",
    title: "Webhook Trigger",
    description: "Start the workflow when an external system sends a webhook.",
    accentClass: "text-indigo-300",
  },
  {
    type: "http_request",
    title: "HTTP Request",
    description: "Call an API endpoint with custom method, headers, and body.",
    accentClass: "text-cyan-300",
  },
  {
    type: "send_email",
    title: "Send Email",
    description: "Send a transactional email to one or more recipients.",
    accentClass: "text-emerald-300",
  },
  {
    type: "delay",
    title: "Delay",
    description: "Pause workflow execution for a fixed duration.",
    accentClass: "text-amber-300",
  },
];

export const ACTION_PRESET_MAP: Record<ActionType, ActionPreset> = ACTION_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.type] = preset;
    return acc;
  },
  {} as Record<ActionType, ActionPreset>,
);
