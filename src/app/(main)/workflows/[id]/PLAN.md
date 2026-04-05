# Workflow Editor MVP Roadmap (UI-Only Focus)

This roadmap is intentionally scoped to UI work only. Backend, API contract changes, persistence logic, and data model changes are deferred.

## 1) UI-Only Goal

Deliver a polished, usable workflow editor interface where users can visually compose workflows, configure step forms, and understand status and validation feedback through UI states.

## 2) UI Scope

### In Scope (UI)

1. Dark themed workflow editor shell and visual consistency.
2. Canvas and node visuals for a linear workflow editor.
3. Node create, select, drag, delete interaction UX.
4. Inspector panel UI for all supported action types.
5. Toolbar controls UI behavior (save/publish/test run/undo state feedback).
6. Empty, loading, and error presentation states.
7. Responsive and accessibility-focused interaction polish.

### Out of Scope (Non-UI for now)

1. Backend API changes.
2. State architecture refactors unrelated to presentation or interaction.
3. Business-rule validation logic changes.
4. Execution engine and dispatcher behavior.
5. Data persistence strategy changes.

## 3) UI MVP Definition of Done

UI MVP is complete when all items below are true:

1. The editor interface is visually complete for desktop and tablet breakpoints.
2. Core editor interactions are intuitive and stable:
   - add step
   - select step
   - configure step in inspector
   - reorder step
   - delete step
3. All action-type configuration forms are complete from a UI perspective.
4. Header actions provide clear visual feedback for all states.
5. Empty/loading/error UI states are consistent and informative.
6. Keyboard and focus behavior are acceptable for primary user flows.

## 4) UI Delivery Roadmap (4 Iterations)

## Iteration 1: Shell and Visual Foundation

1. Finalize dark editor shell, spacing, and hierarchy.
2. Align top toolbar, canvas, and inspector visual rhythm.
3. Standardize typography, icon sizing, and border/shadow language.

Exit Criteria:

1. Editor shell has final dark theme token usage.
2. Toolbar, canvas, and inspector feel like one coherent product surface.

## Iteration 2: Canvas and Node Interaction UX

1. Polish node cards and connector visuals.
2. Improve drag affordance, selection clarity, and insertion controls.
3. Add clear blocked-state UI when max steps are reached.

Exit Criteria:

1. User can visually understand and manipulate step sequence confidently.
2. Interaction feedback is clear during drag and insert actions.

## Iteration 3: Inspector and Form UX Completeness

1. Complete inspector layouts for all action types.
2. Improve form grouping, labels, helper text, and input affordances.
3. Add UI-level field hinting and invalid-state presentation.

Exit Criteria:

1. Users can configure all actions without confusion.
2. Form-level UI communicates what is required before save/test.

## Iteration 4: State Feedback, Accessibility, and QA

1. Finalize save/publish/validate/undo visual states.
2. Improve keyboard traversal and focus indicators.
3. Complete UI QA checklist and visual regression pass.

Exit Criteria:

1. Primary keyboard-only workflow is usable.
2. UI QA checklist is green.

## 5) Per-Feature UI Plans

## Feature UI-1: Editor Shell Layout and Theming

Priority: P0

Goal:

1. Establish a stable dark workspace layout that feels production-ready.

Files:

1. src/app/(main)/layout.tsx
2. src/app/(main)/workflows/[id]/components/workflow-editor.tsx
3. src/app/(main)/workflows/[id]/components/editor-header.tsx

UI Plan:

1. Define final shell spacing tokens for header and content zones.
2. Ensure dark palette contrast is readable for long sessions.
3. Remove visual clutter and keep a clear editor focal area.

Done Criteria:

1. Header and canvas boundaries are visually clean.
2. No accidental overlap, clipping, or inconsistent spacing.

UI QA:

1. Verify on 1280, 1440, and 1920 widths.
2. Verify no top-gap or shell offset issues.

## Feature UI-2: Canvas Visual Language

Priority: P0

Goal:

1. Make the canvas feel interactive and informative even before editing starts.

Files:

1. src/app/(main)/workflows/[id]/components/workflow-canvas.tsx

UI Plan:

1. Finalize grid/dot background density and contrast.
2. Improve empty-state card placement and messaging hierarchy.
3. Harmonize connector color/weight with selected node states.
4. Refine add-between action button visual prominence.

Done Criteria:

1. Canvas is readable at default zoom and during panning.
2. Empty and populated states feel consistent.

UI QA:

1. Verify visual clarity at zoom levels 0.75x, 1x, and 1.25x.
2. Verify connector contrast on dark background.

## Feature UI-3: Node Card Interaction UX

Priority: P0

Goal:

1. Ensure each node card clearly communicates type, order, and interaction affordance.

Files:

1. src/app/(main)/workflows/[id]/components/workflow-node-card.tsx
2. src/app/(main)/workflows/[id]/components/action-icon.tsx

UI Plan:

1. Finalize selected, hover, and drag states.
2. Improve drag handle discoverability.
3. Make step number, title, and type badge hierarchy obvious.

Done Criteria:

1. Users can identify selected node instantly.
2. Drag handle and click target behavior are visually obvious.

UI QA:

1. Verify hover/selected/drag state transitions are smooth.
2. Verify no text clipping at long action names.

## Feature UI-4: Toolbar Controls and Feedback

Priority: P0

Goal:

1. Provide clear control affordance for add, undo, test run, save, and publish actions.

Files:

1. src/app/(main)/workflows/[id]/components/editor-header.tsx

UI Plan:

1. Standardize control density and spacing across all action buttons.
2. Ensure disabled/loading states are visually distinct.
3. Improve status pill and unsaved-changes indicator readability.
4. Keep add-step menu easy to scan with stronger grouping.

Done Criteria:

1. Users can infer control status without guessing.
2. Toolbar remains usable on narrower desktop widths.

UI QA:

1. Verify all button states: idle, hover, disabled, loading.
2. Verify dropdown remains legible and keyboard-focusable.

## Feature UI-5: Inspector Panel Structure

Priority: P0

Goal:

1. Make the inspector easy to scan and edit quickly for each action type.

Files:

1. src/app/(main)/workflows/[id]/components/inspector-panel.tsx

UI Plan:

1. Group fields by intent: transport, content, retry/failure, execution status.
2. Improve section headings, helper text, and vertical spacing.
3. Apply consistent input styling for input/select/textarea controls.
4. Add subtle warning style for incomplete required fields.

Done Criteria:

1. Form sections are understandable without external docs.
2. Visual noise is reduced while preserving required detail.

UI QA:

1. Verify one pass per action type section.
2. Verify long JSON-ish text remains readable in textareas.

## Feature UI-6: Action-Type Form Completeness (UI)

Priority: P0

Goal:

1. Ensure each action type has complete and ergonomic UI controls.

Files:

1. src/app/(main)/workflows/[id]/components/inspector-panel.tsx

UI Plan:

1. HTTP Request UI:
   - method, url, timeout, success codes, headers, query, body
2. Send Email UI:
   - provider, from, to, cc, bcc, replyTo, subject, text/html
3. Webhook Notification UI:
   - url, method, timeout, success codes, headers, payload
4. Delay UI:
   - duration value and unit controls
5. Failure policy UI:
   - strategy select and max attempts field

Done Criteria:

1. No required action field is missing from UI.
2. UI labels and placeholders are clear and task-oriented.

UI QA:

1. Run through all form sections without backend dependencies.
2. Verify helper text explains expected formats.

## Feature UI-7: Empty, Loading, and Error States

Priority: P1

Goal:

1. Make non-happy paths understandable and visually consistent.

Files:

1. src/app/(main)/workflows/[id]/components/workflow-editor.tsx
2. src/app/(main)/workflows/[id]/components/workflow-canvas.tsx
3. src/app/(main)/workflows/[id]/components/inspector-panel.tsx

UI Plan:

1. Improve empty-state call-to-action hierarchy.
2. Standardize spinner and inline feedback styles.
3. Ensure errors are visible but non-disruptive.

Done Criteria:

1. Users always see what to do next in empty/error states.
2. Loading feedback does not block unrelated interactions.

UI QA:

1. Simulate initial empty workflow.
2. Simulate save/validate failure message display.

## Feature UI-8: Responsive Behavior

Priority: P1

Goal:

1. Keep editor usable on smaller desktop and tablet widths.

Files:

1. src/app/(main)/workflows/[id]/components/workflow-editor.tsx
2. src/app/(main)/workflows/[id]/components/editor-header.tsx
3. src/app/(main)/workflows/[id]/components/inspector-panel.tsx

UI Plan:

1. Define breakpoints for inspector collapse/stack behavior.
2. Prevent toolbar overflow with priority-based control wrapping.
3. Preserve node readability in constrained width.

Done Criteria:

1. Core edit flow remains possible at 1024px width.
2. No major clipping/overflow defects.

UI QA:

1. Test at 1024px, 1280px, 1440px.
2. Test browser zoom 90 percent and 110 percent.

## Feature UI-9: Accessibility and Keyboard UX

Priority: P1

Goal:

1. Improve baseline accessibility for editor interactions.

Files:

1. src/app/(main)/workflows/[id]/components/editor-header.tsx
2. src/app/(main)/workflows/[id]/components/workflow-node-card.tsx
3. src/app/(main)/workflows/[id]/components/inspector-panel.tsx
4. src/app/(main)/workflows/[id]/components/workflow-canvas.tsx

UI Plan:

1. Ensure visible focus style on all interactive elements.
2. Add/improve ARIA labels for icon-only controls.
3. Verify logical tab order through toolbar, canvas controls, and inspector.

Done Criteria:

1. Keyboard-only user can complete a basic edit cycle.
2. Focus is never lost during common interactions.

UI QA:

1. Keyboard traversal pass from page load to save action.
2. Spot check with browser accessibility inspector.

## Feature UI-10: UI QA and Visual Regression Pass

Priority: P2

Goal:

1. Reduce UI regressions and improve confidence before release.

Files:

1. src/app/(main)/workflows/[id]/*

UI Plan:

1. Define screenshot checklist for key states:
   - empty canvas
   - populated canvas
   - selected node
   - inspector per action type
   - validation success/error banner
2. Add simple manual visual regression checklist in PR template notes.

Done Criteria:

1. No unresolved visual defects with severity high.
2. UI sign-off complete for all core screens.

UI QA:

1. Screenshot comparison against baseline states.
2. Final pass on dark mode readability and spacing.

## 6) Prioritized UI Backlog

## P0 (Must Ship)

1. Feature UI-1
2. Feature UI-2
3. Feature UI-3
4. Feature UI-4
5. Feature UI-5
6. Feature UI-6

## P1 (Should Ship in MVP Window)

1. Feature UI-7
2. Feature UI-8
3. Feature UI-9

## P2 (Polish)

1. Feature UI-10

## 7) UI Risks and Mitigation

1. Risk: Dense inspector forms overwhelm users.
   Mitigation: stronger sectioning, helper text, and progressive grouping.
2. Risk: Toolbar clutter at smaller widths.
   Mitigation: control wrapping and responsive priority handling.
3. Risk: Inconsistent interactive feedback across components.
   Mitigation: standardize hover/active/focus token usage.
4. Risk: Dark theme contrast issues.
   Mitigation: explicit contrast QA for text and borders in all panels.

## 8) UI QA Checklist for Sign-off

1. Open editor and confirm shell/layout consistency.
2. Add nodes from toolbar and edge controls.
3. Select and drag nodes and verify interaction feedback.
4. Open inspector and configure each action type section.
5. Verify toolbar button states and labels.
6. Verify empty, loading, and error UI states.
7. Verify responsive behavior at key breakpoints.
8. Verify keyboard focus visibility and tab order.
9. Verify dark theme readability and spacing rhythm.
10. Verify no major clipping, overlap, or overflow issues.

## 9) Immediate UI Next Actions

1. Implement max-steps blocked-state message in canvas and add-step menu.
2. Improve inspector section spacing and helper text for required fields.
3. Add unsaved-change visual indicator persistence in header.
4. Add responsive toolbar overflow handling for narrow widths.
5. Run full UI QA checklist and fix P0 visual defects.
