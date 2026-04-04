# Frontend Flow (UI -> State -> Services -> Repository)

This document defines the required flow for the frontend codebase. The goal is to keep UI components simple and route all data work through state, services, and repository layers in a clear, consistent order.

## Core Principles

1. App layer (UI) only renders UI and calls functions with raw input data.
2. State layer (Redux Toolkit slices) owns async thunks for all entity operations.
3. Thunks call service functions.
4. Service functions validate/process data and call repository functions.
5. Repository functions perform actual server calls and return the raw output.

## Flow Sequence

1. UI event triggers (click, submit, load, etc.).
2. UI calls a slice thunk with raw data.
3. Thunk invokes a service function.
4. Service validates and transforms inputs/outputs as needed.
5. Service calls repository function (actual API call).
6. Repository returns data to service.
7. Service returns processed result to thunk.
8. Thunk updates slice state (loading/success/error).
9. UI renders state.

## Mermaid Flow Diagram

```mermaid
flowchart LR
	UI[App UI (raw input)] --> THUNK[Slice Thunk]
	THUNK --> SERVICE[Service Function]
	SERVICE --> REPO[Repository Function]
	REPO --> API[Server/API]
	API --> REPO
	REPO --> SERVICE
	SERVICE --> THUNK
	THUNK --> STATE[Slice State]
	STATE --> UI
```

## Responsibilities By Layer

### App UI (src/app and components)
- UI rendering only
- Collect raw user input and pass directly to thunk
- No validation, no data shaping, no API calls

### State Slices (Redux Toolkit)
- Expose async thunks per entity
- Manage loading/success/error and normalized state
- No direct API calls (must call services)

### Services
- Validate input (required fields, basic shape)
- Transform or enrich data (defaults, trimming)
- Map server response to app-friendly data
- Call repository functions only

### Repository
- Perform HTTP requests
- Return raw API response data
- No UI or state logic

## Example Call Chain

UI -> thunk

```ts
dispatch(createWorkflow({ name, description, triggerEventType }))
```

Thunk -> service

```ts
const result = await workflowService.createWorkflow(input)
```

Service -> repository

```ts
const response = await workflowRepository.createWorkflow(payload)
```

Repository -> API

```ts
return http.post('/workflows', payload)
```

## Naming Conventions

- Thunks: `createX`, `updateX`, `deleteX`, `fetchX`
- Services: `createX`, `updateX`, `deleteX`, `listX`, `getX`
- Repository: `createX`, `updateX`, `deleteX`, `listX`, `getX`

## Error Handling

- Repository throws or returns API error
- Service converts into friendly error messages and consistent shapes
- Thunk sets `error` in slice state
- UI displays error state

## Directory Hints (Frontend)

- src/app: UI and layout only
- src/components: shared UI components
- src/state: slices and store
- src/services: validation + processing
- src/repository: API layer only
- src/types: shared types

