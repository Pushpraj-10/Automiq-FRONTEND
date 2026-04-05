import { Clock3, Globe, Mail, Settings2, Webhook } from "lucide-react";
import type { ActionType } from "@/types";

type ActionIconProps = {
  type: ActionType;
  className?: string;
};

export function ActionIcon({ type, className }: ActionIconProps) {
  if (type === "webhook_notification") {
    return <Webhook className={className || "h-5 w-5 text-indigo-300"} />;
  }

  if (type === "http_request") {
    return <Globe className={className || "h-5 w-5 text-cyan-300"} />;
  }

  if (type === "send_email") {
    return <Mail className={className || "h-5 w-5 text-emerald-300"} />;
  }

  if (type === "delay") {
    return <Clock3 className={className || "h-5 w-5 text-amber-300"} />;
  }

  return <Settings2 className={className || "h-5 w-5 text-neutral-300"} />;
}
