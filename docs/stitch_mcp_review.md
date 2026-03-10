# Stitch MCP Capability Review

The Stitch MCP provides a suite of tools for managing UI projects, generating screens from text, and editing existing UI designs.

## Available Tools and Functions

### Project Management
- **`create_project`**: Create a new container for UI designs and frontend code.
- **`get_project`**: Retrieve details of a specific project.
- **`list_projects`**: List all Stitch projects accessible to you (owned or shared).

### Screen Operations
- **`list_screens`**: View all screens within a specific project.
- **`get_screen`**: Fetch detailed information about a single screen.

### AI Generation & Editing
- **`generate_screen_from_text`**: Create new UI screens based on a descriptive prompt. Supports specifying device types (mobile, desktop, tablet).
- **`edit_screens`**: Modify existing screens using text instructions.
- **`generate_variants`**: Create multiple versions of an existing screen to explore different design options.

## Current Status and Usage Notes

> [!NOTE]
> **Successful Connection**: As of 2026-03-06, projects were successfully listed using the `stitch` server. The previously noted connection issues were due to the `StitchMCP` server being disabled in the configuration.

### Currently Identified Projects
1. **Expense Approval Portal** (ID: `16318611587639186197`) - Created: 2026-03-06
2. **Text Document** (ID: `5285680531412814242`) - Created: 2026-03-02
3. **Solidroad Landing Page** (ID: `175738844362937660`) - Created: 2026-02-23
4. **Solidroad Landing Page Recreation** (ID: `5147174629573253473`) - Created: 2026-02-23
5. **Merit Homes Luxury Landing Page** (ID: `7649310685455060909`) - Created: 2026-02-23
6. **Merit Homes Landing Page** (ID: `12520493998070727985`) - Created: 2026-02-23
7. **Cinematic Narrative - PRD** (ID: `5179077945413921124`) - Created: 2026-02-13
8. **Featured Projects Gallery** (ID: `5518065133474075069`) - Created: 2026-02-08

### Workflow Example
1.  **Initialize**: Use `create_project` to start a new design effort.
2.  **Generate**: Use `generate_screen_from_text` with a detailed prompt (e.g., "A modern dashboard for a construction expense tracker").
3.  **Refine**: Use `edit_screens` to adjust specific elements or `generate_variants` for layout exploration.
4.  **Integrate**: Retrieve screen details via `get_screen` to guide frontend implementation.
