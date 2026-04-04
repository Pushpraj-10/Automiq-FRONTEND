# UI Components & Page Sections — Conventions for Agents

This document explains the project conventions for reusable UI components and page-local "sections" so an agent (or engineer) can create, refactor, and export components consistently.

## Goals

- Keep truly reusable UI code in a single global location: `src/components/`.
- Keep page-specific UI co-located with the page: `src/app/<route>/sections/`.
- Make imports predictable, support tree-shaking, and keep the global barrel (`src/components/index.ts`) small and stable.

## When to put something in `src/components`

- The component is used by multiple pages or across multiple feature areas (3+ pages is a good heuristic).
- The component is a generic UI primitive (Button, Input, Modal, Icon, Tag, Avatar, FormField, Skeleton, Tooltip, Badge).
- The component has a stable, documented API and tests.

What goes in `src/components`:

- Reusable primitives and higher-level shared widgets.
- A small, focused public API (props) and unit tests.
- Barrel export from `src/components/index.ts`.

What NOT to put in `src/components`:

- Page-only UI that depends on page-specific data or layout.
- Components that import page-specific hooks/state (keep those local).

## Page-local sections (co-located)

- For each route under the App Router, create a `sections/` folder for that page's pieces.
- Example:

  src/app/room/
  - page.tsx
  - sections/
    - RoomHeader.tsx
    - RoomPlayer.tsx
    - RoomControls.tsx

- Page sections are not exported from the global barrel. They live next to the page that composes them.

## Folder layout recommendation

- `src/components/`  — shared UI + `index.ts` barrel
- `src/app/<route>/sections/` — page-specific sections (server or client components)
- `src/app/<route>/components/` — optional small helpers local to the page

Example tree:

```
src/
  components/
    Button.tsx
    Input.tsx
    index.ts            # exports public shared components
  app/
    room/
      page.tsx
      sections/
        RoomHeader.tsx
        RoomPlayer.tsx
      components/
        TimeAgo.tsx      # tiny helper used only by the page
```

## Client vs Server components (Next.js App Router)

- Default to server components (no `"use client"`) for pages and sections when possible.
- Add `"use client"` to a component only when it needs state, effects, refs, or browser-only APIs.
- Prefer server components for wrapper/layout and data fetching; keep interactive logic in client sections.

## Barrel exports (`src/components/index.ts`)

- Export only shared components. Examples:

```ts
export { default as Button } from './Button';
export { default as Input } from './Input';
```

- Do NOT export page-local sections from this barrel.

## Styling

- Prefer Tailwind classes for most styling.
- Use CSS modules or scoped files for complex or canvas-based styles: `Component.module.css`.
- Keep design tokens and global styles in `src/styles` or `tailwind.config.js`.

## Testing

- Shared components: unit tests with Vitest + React Testing Library.
- Page sections: integration tests at the page level if behaviour depends on data/state.

## Code snippets

Shared button (client):

```tsx
"use client";
import React from 'react';

type ButtonProps = { onClick?: () => void; children?: React.ReactNode };

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className="px-4 py-2 rounded bg-blue-600 text-white">
      {children}
    </button>
  );
}
```

Page section (server by default):

```tsx
// src/app/room/sections/RoomHeader.tsx
export default function RoomHeader({ title }: { title: string }) {
  return (
    <header className="p-4">
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  );
}
```

## Agent checklist — creating or moving a component

1. Decide location
   - If reusable (3+ pages) → `src/components/`.
   - If page-only → `src/app/<route>/sections/`.
2. Create the component file (`PascalCase`.tsx). Add `"use client"` only if needed.
3. Add tests: `Component.test.tsx` (shared components must have unit tests).
4. If shared, add export to `src/components/index.ts` (barrel).
5. Update `COMPONENTS.md` with a one-line description and examples if relevant.
6. Run linter and tests:

```bash
# from frontend/
pnpm lint
pnpm test
```

7. Commit with clear message: `feat(ui): add <ComponentName>` or `refactor(ui): move <ComponentName> to components`

## When to refactor into shared components

- The component is copy-pasted across routes.
- The component is a presentational primitive that other components compose.

## Notes for agents

- Always prefer minimal, well-typed props and avoid coupling a shared component to app-specific services or stores.
- If a component needs global hooks/state, prefer keeping it page-local and pass data as props from a server/layout component.

---

Keep this file updated whenever you add or move shared components so future agents and engineers follow the same convention.
