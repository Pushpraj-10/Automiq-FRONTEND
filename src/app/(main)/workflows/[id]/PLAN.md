# Workflow Backend Implementation Plan (Scalable)

## 1) Goal

Implement a production-ready backend for:

1. Editor state persistence (nodes + node positions in database).
2. Live collaborative updates over sockets.
3. Reliable workflow action dispatch to executor.

The design must support horizontal scaling, retries, idempotency, and low-latency UX.

---

## 2) Current Baseline (What Already Exists)

- Backend already stores workflow actions in Postgres (`WorkflowAction`) and dispatches executions over gRPC to executor.
- Executor already reports execution and step updates back to backend over gRPC.
- Dispatch callbacks are accepted, but backend step status persistence is still minimal.
- Frontend editor currently builds nodes in memory and does not persist node layout coordinates.

Implication: We should extend existing modules, not rewrite.

---

## 3) Target Architecture

### 3.1 Source of Truth

- Postgres remains source of truth for workflow definitions and editor layout metadata.
- Executor remains source of truth for execution runtime internals, but backend keeps a mirrored execution timeline for API + socket fan-out.

### 3.2 Realtime Layer

- Add Socket.IO in backend attached to the same HTTP server.
- Use Redis adapter for multi-instance pub/sub fan-out.
- Clients join workflow rooms and execution rooms.

### 3.3 Reliable Dispatch

- Add dispatch outbox table + worker to decouple API latency from gRPC delivery.
- Use at-least-once delivery with idempotency keys and retry policy.
- Executor enqueue must be idempotent by `executionId`.

---

## 4) Workstream A: Editor State in DB (Nodes + Positions)

### 4.1 Data Model Changes (Prisma)

Add layout fields to `WorkflowAction` (minimal-change path):

- `nodeId String?`
- `positionX Int?`
- `positionY Int?`
- `editorMeta Json?` (optional for width, height, future node flags)

Add workflow-level editor revision tracking:

- New table `WorkflowEditorState`
	- `workflowId String @unique`
	- `revision Int @default(1)`
	- `viewport Json?`
	- `lastEditedBy String?`
	- `updatedAt DateTime @updatedAt`

Reason:

- Per-node coordinates stay queryable with actions.
- Revision enables optimistic concurrency for live edits.
- Viewport is workflow-level, not action-level.

### 4.2 API Contract Changes

Extend existing action upsert payload:

- Accept `nodeId`, `position`, `editorMeta`.

Add editor-state endpoints:

- `GET /workflows/:workflowId/editor-state`
	- returns `revision`, `viewport`, `nodes` (action + layout)
- `PATCH /workflows/:workflowId/editor-state`
	- accepts `baseRevision`, patch payload
	- server increments revision atomically

### 4.3 Backend Code Changes

Update modules:

- `backend/src/modules/actions/actions.controller.ts`
- `backend/src/modules/actions/actions.service.ts`
- `backend/src/modules/actions/actions.repository.ts`

Create new module:

- `backend/src/modules/editor-state/editor-state.router.ts`
- `backend/src/modules/editor-state/editor-state.controller.ts`
- `backend/src/modules/editor-state/editor-state.service.ts`
- `backend/src/modules/editor-state/editor-state.repository.ts`

### 4.4 Migration and Backfill

- Backfill existing actions with deterministic defaults:
	- `nodeId = action.id`
	- `positionX = 560`
	- `positionY = 260 + ((stepNumber - 1) * 190)`
- Create `WorkflowEditorState` row for every existing workflow.

---

## 5) Workstream B: Live Updates with Socket

### 5.1 Socket Stack

- Add dependencies:
	- `socket.io`
	- `@socket.io/redis-adapter`
	- `redis`
- Mount socket server in `backend/src/server.ts` after HTTP server creation.

### 5.2 Auth and Room Strategy

- Authenticate handshake with existing JWT.
- Room naming:
	- `workflow:{workflowId}` for editor collaboration
	- `execution:{executionId}` for run monitoring

### 5.3 Event Protocol (v1)

Editor events:

- `editor:join` -> payload `{ workflowId }`
- `editor:state` -> initial snapshot `{ revision, nodes, viewport }`
- `editor:patch` -> client patch `{ workflowId, baseRevision, changes }`
- `editor:patched` -> ack with new revision
- `editor:conflict` -> server sends canonical state if revision mismatch
- `editor:presence` -> optional cursor/selection presence metadata

Execution events:

- `execution:status`
- `execution:step`

### 5.4 Concurrency Control

- Every patch must include `baseRevision`.
- Server applies patch in DB transaction only if `baseRevision` matches current.
- On mismatch: reject and return fresh snapshot.

### 5.5 Performance Safeguards

- Debounce drag patch emission on client (for example every 80-150ms).
- Server-side patch validation + payload size limits.
- Optional coalescing worker for high-frequency position updates.

---

## 6) Workstream C: Dispatcher to Executor (Reliable + Scalable)

### 6.1 Gaps to Close

- Current enqueue path is synchronous from API/event handler to gRPC call.
- Step status callback currently does not persist detailed step logs in backend Postgres.

### 6.2 Add Dispatch Outbox

New table: `DispatchOutbox`

- `id`
- `executionId` (unique)
- `payloadJson`
- `status` (`pending`, `processing`, `delivered`, `failed`)
- `attemptCount`
- `nextAttemptAt`
- `lastError`
- timestamps

Flow:

1. API/event path creates execution + outbox row in one transaction.
2. Worker polls outbox and performs gRPC enqueue.
3. On success -> `delivered`.
4. On failure -> retry with exponential backoff; send to dead-letter when max attempts exceeded.

### 6.3 Mirror Execution Steps in Backend DB

New table: `ExecutionStep` in Postgres (backend side mirror)

- `executionId`, `stepIndex` composite unique
- `status`, `attemptCount`, `stepType`
- `requestJson`, `responseJson`, `errorMessage`
- `startedAt`, `finishedAt`, `updatedAt`

When backend receives gRPC callbacks:

- Upsert execution status in `Execution`.
- Upsert step row in `ExecutionStep`.
- Emit socket events to `execution:{executionId}` room.

### 6.4 API Changes

- `GET /dispatch/executions/:executionId/steps` should read from backend Postgres mirror first.
- Keep gRPC pull from executor only as fallback path behind feature flag during migration.

---

## 7) Scalability Design Rules

1. Stateless API nodes
- No in-memory workflow state ownership.
- All state persisted in Postgres and propagated via Redis-backed socket adapter.

2. Idempotency everywhere
- Event ingestion already has idempotency key.
- Outbox uses unique `executionId`.
- Executor enqueue is idempotent by `executionId`.

3. Backpressure and retries
- Bounded worker concurrency.
- Exponential backoff with max retry count.
- Dead-letter for manual replay.

4. Optimistic concurrency for editor
- Revision checks prevent last-write-wins corruption.

5. Observability
- Add metrics and structured logs for:
	- socket joins/disconnects
	- patch apply latency
	- outbox lag and retry counts
	- gRPC enqueue latency and failure rate
	- callback processing latency

---

## 8) Delivery Phases

### Phase 1: Schema + Persistence Foundations

- Prisma migrations for layout fields, editor state, outbox, execution steps.
- Repository + service updates for actions and execution step mirror.
- Backfill script for existing workflows.

Exit criteria:

- Node coordinates persisted and returned by APIs.
- No regression in existing workflow/action endpoints.

### Phase 2: Realtime Editor (Single Instance)

- Socket server with JWT auth.
- Workflow room join + snapshot + patch ack/conflict.
- Revision-based transactional patch application.

Exit criteria:

- Two tabs can edit same workflow with consistent state.

### Phase 3: Realtime + Horizontal Scale

- Redis adapter integration.
- Multi-instance socket fan-out validation.
- Presence events (optional, lightweight).

Exit criteria:

- Cross-instance realtime updates are consistent.

### Phase 4: Reliable Dispatch Outbox

- Outbox worker + retry + dead-letter.
- API/event path writes to outbox transactionally.

Exit criteria:

- Temporary executor outage no longer causes execution loss.

### Phase 5: Execution Live Stream + API Stabilization

- Persist step callbacks in backend Postgres mirror.
- Emit execution socket events.
- Switch execution steps endpoint to backend mirror.

Exit criteria:

- Dashboard/execution detail can run without direct executor gRPC reads.

---

## 9) Testing Plan

### Unit Tests

- Patch merge and revision conflict logic.
- Outbox retry scheduling and terminal failure behavior.
- Step status upsert idempotency.

### Integration Tests

- End-to-end: create workflow -> edit positions -> save -> reload -> positions retained.
- End-to-end: enqueue execution -> executor callback -> backend status + socket event.
- Multi-client socket conflict scenario.

### Load Tests

- 1k concurrent socket clients across workflow rooms.
- High-frequency drag patches with throttling.
- Outbox throughput benchmark under executor latency.

---

## 10) Operational Runbook Additions

- Feature flags:
	- `EDITOR_SOCKET_ENABLED`
	- `DISPATCH_OUTBOX_ENABLED`
	- `EXECUTION_STEP_MIRROR_ENABLED`
- Replay tools for dead letters.
- Dashboard panel for outbox lag + callback failure rate.

---

## 11) Suggested Implementation Order (Team Parallelism)

Track A (Data/API): Schema, repositories, action payload updates.

Track B (Realtime): Socket infra, auth middleware, patch protocol, Redis adapter.

Track C (Dispatch): Outbox worker, callback mirroring, execution event emission.

Integration point after Track A baseline migration.

---

## 12) Definition of Done

1. Node positions and editor state persist in DB and survive reload/publish.
2. Realtime updates work for multi-client collaboration and execution monitoring.
3. Dispatch path is resilient (retry + dead-letter) and observable.
4. APIs are backward compatible or versioned with migration notes.
5. Automated tests cover conflict handling, retries, and callback idempotency.

