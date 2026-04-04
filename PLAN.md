# Automiq Frontend Comprehensive Technical Plan (Page-by-Page)

This document provides a highly detailed, component-by-component and state-by-state architectural plan for the Automiq frontend, strictly adhering to the standards defined in `COMPONENTS.md` and `FLOW.md`.

---

## 1. Authentication & Onboarding

### 1.1 Login Page
- **Route**: `src/app/(auth)/login/page.tsx`
- **Purpose**: The sole entry point for user authentication.
- **Layout Mockup**:
  - `[Left Panel]`: Product branding, value proposition, and customer testimonials.
  - `[Right Panel]`: Card containing the "Continue with Google" OAuth button.
- **Local Sections (`src/app/(auth)/login/sections/`)**:
  - `LoginForm.tsx`: Renders the OAuth buttons and handles loading state when clicked.
  - `FeatureHighlight.tsx`: The marketing panel on the left (hidden on mobile).
- **State & Flow**:
  - **Action**: User clicks Google login.
  - **Flow**: UI changes to "loading" -> redirects `window.location.href = '/api/auth/google'`.
  - **Edge Case**: If redirected back with `?error=auth_failed`, display a toast notification.

### 1.2 Auth Callback
- **Route**: `src/app/(auth)/auth/callback/page.tsx`
- **Purpose**: Invisible processing route for OAuth callbacks.
- **Local Sections**:
  - `AuthRedirect.tsx`: A full-screen spinner saying "Authenticating...".
- **State & Flow**:
  - **Action**: Page loads.
  - **Thunk**: `verifyOAuthToken(tokenString)` in `authSlice.ts`.
  - **Service**: Validates token payload if necessary.
  - **Outcome**: 
    - Success -> Dispatch `setCredentials(token)` and `fetchCurrentUser()`, then `router.push('/dashboard')`.
    - Error -> `router.push('/login?error=invalid_token')`.

---

## 2. Main Dashboard

- **Route**: `src/app/(main)/dashboard/page.tsx`
- **Purpose**: Command center showing account health.
- **Local Sections (`src/app/(main)/dashboard/sections/`)**:
  - `DashboardMetricsBar.tsx`: A horizontal row of 4 `MetricBox` cards (Active Workflows, Total Events, Execution Success %, Today's Executions).
  - `RecentExecutionsFeed.tsx`: A mini-table showing the 5 most recent executions (success/fail).
  - `SystemAlerts.tsx`: A conditionally rendered banner if any executions failed in the last 24h.
- **State & Flow**:
  - **Action**: Page load mounts `useEffect`.
  - **Thunk**: `fetchDashboardSummary()` in `dashboardSlice.ts`.
  - **Service**: Transforms API response `totals` and `recent` into charting data.
  - **API**: `GET /dashboard/summary`
- **Data Shape**: 
  ```typescript
  { totals: { events: number, executions: number, ... }, recent: { failuresLast24h: number ... } }
  ```

---

## 3. Workflows Module

### 3.1 Workflow List
- **Route**: `src/app/(main)/workflows/page.tsx`
- **Purpose**: Overview of all workflows for the current tenant.
- **Local Sections (`src/app/(main)/workflows/sections/`)**:
  - `WorkflowsHeader.tsx`: Title and "New Workflow" button.
  - `WorkflowsTable.tsx`: Main data grid.
    - Columns: Name, Status (`Badge`), Trigger Type, Created Date, Actions (Edit, Delete).
  - `CreateWorkflowDialog.tsx`: Modal to enter Workflow Name and select a Trigger Type.
- **State & Flow**:
  - **Action (Load)**: Dispatch `fetchWorkflows()`.
  - **Action (Create)**: Submit `CreateWorkflowDialog`. Dispatch `createWorkflow({ name, triggerEventType })`.
  - **API**: `GET /workflows`, `POST /workflows`.
  - **Outcome**: On creation success, `router.push('/workflows/${newId}')`.

### 3.2 Visual Workflow Builder (Core Engine)
- **Route**: `src/app/(main)/workflows/[id]/page.tsx`
- **Purpose**: The visual composer for chaining actions.
- **Local Sections (`src/app/(main)/workflows/[id]/sections/`)**:
  - `BuilderToolbar.tsx`: Contains breadcrumbs, real-time sync status ("Saved"), and a "Publish/Draft" toggle switch.
  - `BuilderCanvas.tsx`: Renders the nodes. Given maximum 5 steps (`maxSteps` in DB), a vertical list of cards connected by a line is optimal.
  - `StepNode.tsx`: Renders a single action block (e.g., HTTP Request). Click to select.
  - `PropertyPanel.tsx`: The right-side drawer that opens when a `StepNode` is clicked.
    - Internally conditionally renders: `HttpActionConfig.tsx`, `DelayActionConfig.tsx`, etc.
    - Contains tabs: `[Configuration]`, `[Settings (Timeout/Retries)]`.
- **State & Flow**:
  - **Action (Load)**: `fetchWorkflowDetails(id)` (loads workflow + actions array).
  - **Action (Edit)**: User types in `PropertyPanel`. Modifies local component state.
  - **Action (Save)**: On blur or debounce, dispatch `updateWorkflowStep(stepNumber, config)`.
  - **Validation**: Service calls `POST /actions/validate/step` before updating the repository.
  - **API**: `GET /actions/workflows/:id`, `PATCH /workflows/:id`, `PUT /actions/workflows/:id/steps/:number`.

### 3.3 Scoped Executions
- **Route**: `src/app/(main)/workflows/[id]/executions/page.tsx`
- **Purpose**: View run logs *only* for the current workflow.
- **Reuses**: Global Execution table components but passes `workflowId` prop.

---

## 4. Executions & Trace Logs

### 4.1 Global Executions
- **Route**: `src/app/(main)/executions/page.tsx`
- **Purpose**: High-level monitoring of all runs.
- **Local Sections (`src/app/(main)/executions/sections/`)**:
  - `ExecutionsFilters.tsx`: Search bar, Status Dropdown (Running, Succeeded, Failed), Date Picker.
  - `ExecutionsTable.tsx`: Grid showing ID, Workflow, Status, Started At, Finished At.
- **State & Flow**:
  - **Action**: URL query parameters change (e.g., `?status=failed`).
  - **Thunk**: `fetchExecutions(queryParams)`.
  - **API**: `GET /dispatch/executions`

### 4.2 Execution Detailed Trace
- **Route**: `src/app/(main)/executions/[id]/page.tsx`
- **Purpose**: Deep forensic view of a specific run.
- **Local Sections (`src/app/(main)/executions/[id]/sections/`)**:
  - `ExecutionSummaryCard.tsx`: Visual badge for overall status, total duration, and a "Replay Execution" button.
  - `StepTraceAccordion.tsx`: A vertical list of steps. Clicking one expands it.
  - `StepTracePayloadTab.tsx`: Renders JSON payload input and output.
  - `StepTraceErrorTab.tsx`: Shows stack trace or API error message if the step failed.
- **State & Flow**:
  - **Action (Load)**: Dispatch `fetchExecutionDetails(id)` and `fetchExecutionSteps(id)`.
  - **Action (Replay)**: User clicks Replay. Dispatch `replayExecution(id)`.
  - **API**: `GET /dispatch/executions/:id`, `GET /dispatch/executions/:id/steps`, `POST /dispatch/executions/:id/replay`.

---

## 5. Event Ingestion Pipeline

- **Route**: `src/app/(main)/events/page.tsx`
- **Purpose**: Audit log for incoming webhooks.
- **Local Sections (`src/app/(main)/events/sections/`)**:
  - `EventsTable.tsx`: Shows timestamps, `eventType` (e.g., `order.created`), `source` (e.g., `shopify`), and Status.
  - `EventPayloadDrawer.tsx`: Slides out to show the raw `payloadJson` and `idempotencyKey`. It also lists the integer `workflowMatches` (how many workflows this event triggered).
- **State & Flow**:
  - **API**: `GET /events/my?limit=100`.
  - **Data Shape**: `[{ eventType, source, payloadJson, idempotencyKey, status, workflowMatches }]`.

---

## 6. Settings & Administration

### 6.1 Layout Wrapper
- **Route**: `src/app/(main)/settings/layout.tsx`
- **Purpose**: Shared side-navigation menu pointing to Profile, API Keys, and Billing.

### 6.2 Profile
- **Route**: `src/app/(main)/settings/profile/page.tsx`
- **Local Sections**:
  - `IdentityForm.tsx`: Read-only inputs for Name and Email, showing Google avatar.
- **API**: `GET /users/me`.

### 6.3 API Keys
- **Route**: `src/app/(main)/settings/api-keys/page.tsx`
- **Purpose**: Manage webhook ingestion secrets.
- **Local Sections (`src/app/(main)/settings/api-keys/sections/`)**:
  - `ApiKeyTable.tsx`: Shows Key Name, Prefix, and status.
  - `GenerateKeyModal.tsx`: Input for key name.
  - `RevealKeyDialog.tsx`: Extremely important UI component. It only appears *once* immediately after creation, showing the raw `apiKey`. Includes a "Copy" button. If closed, the key is gone forever.
- **State & Flow**:
  - **Action (Create)**: Submit name -> `createApiKey(name)`.
  - **Result**: The thunk returns `{ apiKey, record }`. The slice stores `record`, while the local component state temporarily holds `apiKey` to pass to `RevealKeyDialog`.
  - **API**: `POST /apikeys`, `GET /apikeys`, `DELETE /apikeys/:id`.

### 6.4 Billing
- **Route**: `src/app/(main)/settings/billing/page.tsx`
- **Local Sections**:
  - `PricingTiers.tsx`: Lists available plans.
  - `CurrentSubscriptionView.tsx`: Shows current plan and standard text if `trialing` or `active`.
- **State & Flow**:
  - **Action**: Click "Upgrade".
  - **Thunk**: `initiateCheckout({ priceId })`.
  - **Service**: Receives `checkoutUrl`.
  - **Flow**: `window.location.href = checkoutUrl` (redirects to Stripe).
  - **API**: `POST /billing/checkout`.

---

## Component Architecture (Shared Reusables)
*To be placed in `src/components/` and exported via `index.ts`.*

- **Data Display**: `DataTable` (generic, sortable), `StatusBadge` (color-coded by enum), `MetricCard`.
- **Feedback**: `Modal`, `SlideDrawer` (for properties and payloads), `Toast` (global notifications).
- **Inputs**: `SearchInput`, `SelectMenu`, `JSONEditor` (Monaco or simple text area), `ToggleSwitch`.
- **Layout**: `SidebarNav`, `TopHeader`, `PageContainer`.
