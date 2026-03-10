# Expense Approval Portal - UI Implementation Plan

This plan focuses on establishing a "clean UI" and robust design system for the portal, as prioritized in the brainstorming session.

## UI Goals
- Translate Stitch screens into high-fidelity React components.
- Establish a consistent design system (colors, typography, spacing).
- Ensure a premium, responsive experience without backend dependencies.

## Confirmed Tech Stack
- **Framework**: React with Vite.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **Components**: Shadcn/ui (Radix UI base).
- **Animations**: Framer Motion (for premium feel).

## Phased Approach

### Phase 1: Foundation
- [NEW] `src/styles/design-tokens.css` (Colors, Spacing, Shadows).
- [NEW] `src/components/ui/` (Buttons, Inputs, Modals, Cards).

### Phase 2: Page Layouts
- Implement the "Executive Overview" layout.
- Implement the "Project Analysis & Approvals" table/dashboard.
- Implement the "Financial Deep-Dive" detail pages.

### Phase 3: Backend Integration (Current State)
- Setup Express API and Drizzle ORM (`/api/projects`, `/api/line-items`).
- Integrate SWR for data fetching, removing static mock data.
- Refactor UI to map real data streams (live Variance and Paid Due computations).

### Phase 4: Mutations & Forms (Upcoming)
- Build full CRUD endpoints for Projects and Line Items.
- Add `salesPrice` to Project schema for Profit calculations.
- Build In-Line Editing for table cells to replace clunky modals.
- Setup `multer` and express static routes for Document Uploads.
- Setup data mutations (POST/PUT/DELETE) and invalidate SWR caches for real-time updates.

## Verification Plan
- Visual regression testing using Storybook or similar.
- Component-level accessibility audits (using `wcag-audit-patterns`).
