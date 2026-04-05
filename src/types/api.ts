export type WorkflowStatus = "draft" | "active" | "paused" | "archived";
export type ActionType = "http_request" | "send_email" | "webhook_notification" | "delay";
export type DispatchStatus = "queued" | "running" | "succeeded" | "failed";
export type EventStatus = "received" | "dispatched" | "no_match" | "failed";

export type User = {
  id: string;
  email: string;
  name?: string;
  profilePic?: string;
};

export type ApiKeyRecord = {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Workflow = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  maxSteps: number;
  triggerEventType?: string;
  triggerSource?: string;
  createdAt: string;
  updatedAt: string;
};

export type ActionCatalogEntry = {
  type: ActionType;
  title: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  mvp: boolean;
};

export type WorkflowAction = {
  id: string;
  workflowId: string;
  nodeId?: string;
  positionX?: number;
  positionY?: number;
  editorMeta?: Record<string, unknown>;
  stepNumber: number;
  type: ActionType;
  name?: string;
  config: Record<string, unknown>;
  onFailure?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActionValidationError = {
  field: string;
  message: string;
};

export type StepValidationResult = {
  valid: boolean;
  errors: ActionValidationError[];
};

export type WorkflowValidationResult = {
  valid: boolean;
  errorsByStep: Array<{ index: number; stepId?: string; errors: ActionValidationError[] }>;
};

export type EventRecord = {
  id: string;
  userId: string;
  source?: string;
  eventType: string;
  payloadJson: Record<string, unknown>;
  idempotencyKey: string;
  status: EventStatus;
  workflowMatches: number;
  dispatchedCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type EventPreview = {
  workflow: {
    id: string;
    name: string;
    triggerEventType?: string;
    triggerSource?: string;
  };
  preview: {
    eventType: string;
    source?: string;
    payloadJson: Record<string, unknown>;
  };
  headers: {
    "x-api-key": string;
    "x-idempotency-key": string;
  };
  notes: string[];
};

export type DispatchExecution = {
  id: string;
  tenantId: string;
  correlationId?: string;
  workflowId: string;
  workflowVersionId: string;
  status: DispatchStatus;
  attemptCount: number;
  errorSummary?: string;
  queuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExecutionStep = {
  stepIndex: number;
  stepType: string;
  status: string;
  attemptCount: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  requestJson?: Record<string, unknown>;
  responseJson?: Record<string, unknown>;
  updatedAt?: string;
};

export type DashboardSummary = {
  totals: {
    events: number;
    executions: number;
    executionsFailed: number;
    executionsSucceeded: number;
    workflowsActive: number;
  };
  recent: {
    eventsLast24h: number;
    executionsLast24h: number;
    failuresLast24h: number;
  };
};

export type CheckoutSession = {
  checkoutUrl: string;
  sessionId: string;
};
