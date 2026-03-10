# Final Design Proposal: Expense Approval Portal

## 1. Project Overview
A premium, internal-only portal for partners to track, review, and approve project-related expenses. The focus is on a "clean, Apple-style UI" with rich data visualization and seamless interactions.

---

## 2. Technical Architecture & Skill Mapping
To ensure corporate-grade quality, each layer of the proposal is backed by a specific skill from the `@brainstorming` catalog.

### A. Core Architecture
- **Tech Stack**: Vite + React + TypeScript.
- **Skill Mapping**: `senior-architect`
    - *Role*: Guiding the overall folder structure, scalable component patterns, and efficient build pipeline.

### B. Design System & Styling
- **Tech Stack**: Tailwind CSS + Shadcn/ui.
- **Skill Mapping**: `tailwind-design-system` & `core-components`
    - *Role*: Establishing a tokenized design system (colors, typography, spacing) that ensures consistency and allows for "clean" rapid development.

### C. Premium Aesthetic & Experience
- **Focus**: Glassmorphism, subtle micro-interactions, and dark-mode optimization.
- **Skill Mapping**: `frontend-ui-dark-ts` & `scroll-experience`
    - *Role*: Implementing the high-end visuals and "smooth" feel expected from an internal partner tool.

### D. Component Development
- **Focus**: Translating Stitch screens (Executive Overview, Approvals, Deep-Dive).
- **Skill Mapping**: `frontend-mobile-development-component-scaffold`
    - *Role*: Scaffolding robust, accessible, and high-performance components for complex data tables and dashboards.

### E. Reliability & Standards
- **Focus**: TDD and accessibility compliance.
- **Skill Mapping**: `testing-patterns` & `wcag-audit-patterns`
    - *Role*: Ensuring the portal is stable and usable by all partners across various devices.

---

## 3. Implementation Roadmap

### Phase 1: Environment & Foundations
- Initialize Vite + React (TS) project.
- Configure Tailwind v4 and install Shadcn/ui primitives.
- **Skill Applied**: `tailwind-patterns`

### Phase 2: Design Token & Layouts
- Define "partner-exclusive" color palettes and spacing.
- Build the global sidebar and navigation frame.
- **Skill Applied**: `core-components`

### Phase 3: Screen Implementation (Mocked Data)
- **Executive Overview**: High-level KPIs and charts.
- **Project Analysis**: Approval workflows and filters.
- **Financial Deep-Dive**: Granular expense breakdown.
- **Skill Applied**: `frontend-ui-dark-ts`

### Phase 4: Data Modeling & Storage Strategy
- Define Postgres Relational Schema (`LINE_ITEM`, `PROJECT`, `DOCUMENT`).
- Calculate variance and amounts dynamically.
- **Skill Applied**: `database-design`, `drizzle-orm-expert`

### Phase 5: Backend & Database Integration
- **Backend API**: Initialize an Express.js server within the monorepo to safely handle database connections.
- **ORM Setup**: Configure Drizzle ORM to connect to a PostgreSQL database (e.g., local mock or Neon Serverless).
- **Skill Applied**: `nodejs-backend-patterns`, `database-design`

### Phase 6: Frontend API Integration
- **Frontend Integration**: Implement async data fetching in React using SWR or React Query (Skeleton loaders, error boundaries).
- **Data Hookup**: Replace all hardcoded mocks in Dashboard, Approvals, and Finance views with live `/api/projects` and `/api/line-items` data.
- **Skill Applied**: `react-ui-patterns`

### Phase 7: Full CRUD, In-Line Editing & File Uploads
- **Data Entry & Management**: Allow creation & deletion of both Projects and Line Items. Add a `salesPrice` to the Project model.
- **In-Line Editing**: Implement robust in-line cell editing within the Approvals table, skipping modals for rapid data entry (budget, actual cost, status).
- **File Uploads**: Setup an upload pipeline with `multer` to attach receipts/invoices to individual projects.
- **Profit Tracking**: Calculate and display "Project Revenue / Profit" (Sales Price minus Total Actual Cost).
- **Skill Applied**: `react-ui-patterns` (for inline edit state), `nodejs-backend-patterns` (for Multer streams).

---

## 4. Decision Log
- **Decision**: Vite + React over Next.js.
    - *Rationale*: Speed and pure frontend focus for internal prototyping.
- **Decision**: Tailwind + Shadcn over Custom CSS.
    - *Rationale*: Pre-baked accessibility and professional defaults for a "clean" finish.
- **Decision**: PostgreSQL + Drizzle ORM.
    - *Rationale*: Maximum type safety across the stack and seamless complex relationship handling.
