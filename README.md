# Questwall — Agile Team & Kanban Supercharger for Obsidian

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Umataro-Tenma-PhD/obsidian-questwall)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-10b981.svg)](https://www.w3.org/TR/WCAG21/)
[![Obsidian Kanban](https://img.shields.io/badge/Requires-Obsidian_Kanban-8b5cf6.svg)](https://github.com/mgmeyers/obsidian-kanban)

Questwall is a high-performance workflow layer designed to elevate **Obsidian Kanban** boards into modern engineering command centers. It extends standard Markdown task lists with dynamic team management, real-time filtering, multi-property sorting, WCAG 2.1 AA accessible assignment dialogs, and universal note badges—all without modifying or polluting your underlying markdown files.

---

## Technical Architecture & Ecosystem Integration

Questwall operates as a non-invasive visual and functional extension for the official **[`obsidian-kanban`](https://github.com/mgmeyers/obsidian-kanban)** community plugin by `mgmeyers`:

* **Zero-Polling DOM Transformation**: Instead of running background polling loops (`setInterval`), Questwall utilizes lightweight `MutationObservers` to detect board changes instantly. This ensures zero layout thrashing, immediate UI responsiveness, and minimal battery consumption.
* **Pristine Data Storage**: All Kanban cards remain standard, human-readable Markdown lists (`- [ ] Task title #P1 [[@James]]`). If you disable Questwall or `obsidian-kanban` at any time, your notes and boards remain 100% standard and accessible across all devices.
* **Universal Vault Compatibility**: Team member badges (`[[@James]]` and `#assignee/James`) and priority tags (`#P1`, `#P2`, `#P3`) are not restricted to Kanban boards. They render as clean, color-coded interactive pills anywhere in your Obsidian vault—including daily notes, meeting agendas, and markdown tables—complementing existing plugins like **Dataview**, **Tasks**, and **Style Settings**.

---

## Core Features

### 1. Interactive Command Toolbar (`FilterService`)
Questwall automatically injects a sticky command bar directly above your Kanban board header, providing immediate multi-dimensional control over large project backlogs:

* **Real-Time Filtering**: Isolate tasks instantly by clicking any team member (`[[@James]]`), priority level (`🔴 P1`, `🟡 P2`, `🟢 P3`), or task classification (`🐞 Bug`, `✨ Feature`, `📋 Task`).
* **Focus Mode (`🎯`)**: Dim all lower-priority and completed items (`#P2`, `#P3`) with a single click, allowing engineers to maintain focus exclusively on `🔴 P1` critical path deliverables during deep work sessions.
* **Multi-Property Column Sorting (`↕️ Order By`)**: Reorder tasks across every column dynamically by:
  * **Priority**: Highest to Lowest (`P1 → P3`) or Lowest to Highest (`P3 → P1`).
  * **Assignee**: Group and order tasks alphabetically by assigned team member (`A → Z`).
  * **Task Type**: Categorize columns by classification (`Bug → Feature → Task`).
  * **Title**: Alphabetical card title ordering (`A → Z` or `Z → A`).
  * **Default (Manual Drag & Drop)**: Instantly revert to standard drag-and-drop card physics at any time.

### 2. Universal Agile Team & Role Management (`SettingsTab`)
Manage your entire engineering team directly inside Obsidian (`Cmd + ,` → **Questwall**), creating a single source of truth for project responsibilities across your vault:

* **Multi-Discipline Role Mapping**: Assign specific engineering and product roles to each teammate (`AI Architect`, `Site Reliability & DevOps`, `Distributed Systems API`, `QA Engineering`, `UX/UI Design`).
* **Interactive Live Editing (`EditMemberModal`)**: Click **`✏️ Edit Roles`** next to any team member to update their display name, custom hex badge color (`#3b82f6`), or assigned engineering disciplines on the fly.
* **Team List Sorting**: Organize your team settings view alphabetically by name (`A → Z` / `Z → A`) or group them cleanly by engineering discipline.

### 3. Accessible Quick-Assign Modal (`QuickAssignModal` / `⚡`)
Eliminate manual markdown syntax typing when assigning tasks or updating card states:

* Hover over any Kanban card and click the lightning bolt (**`⚡`**) trigger to launch a WCAG 2.1 AA compliant assignment dialog.
* Select assignees, priority levels (`#P1`, `#P2`, `#P3`), and task types (`#bug`, `#feature`, `#task`) using tactile pill buttons, or write in new team members instantly right from the modal.

### 4. Persistent Column & List Tinting (`LaneColorModal` / `🎨`)
Improve board scannability by color-coding individual workflow columns:

* Right-click on any Kanban column header (`To Do`, `In Progress`, `Done`, `Blocked`) to open the color selection modal.
* Apply one of 6 curated, accessible background tints (`Sapphire Blue`, `Amethyst Purple`, `Emerald Green`, `Crimson Red`, `Amber Orange`, `Slate Gray`).
* Column color mappings are saved persistently in `data.json` without modifying your markdown column titles.

---

## Aesthetics & Themes

Questwall includes a dual-theme engine that dynamically updates all modals, toolbars, badges, and settings UI (`Cmd + ,` → **Questwall** → **Board Aesthetics & Theme**):

### 🌟 1. Default (Modern Glassmorphism) — *Primary Theme*
The default visual experience designed for modern engineering teams and clean desktop workspaces:
* **Glassmorphism Panels**: Translucent card wrappers (`backdrop-filter: blur(14px)`) with subtle border gradients and high-contrast typography.
* **Professional Badge Styling**: Clean, color-coded team member pills and standard engineering terminology across all settings panels and assignment dialogs.

### ⚔️ 2. Guild (Gamified RPG Command Center) — *Optional Theme*
A secondary, optional visual skin for teams that want to inject tabletop RPG gamification and whimsy into their agile sprints without changing any underlying workflow mechanics:
* **Quests & Contracts**: Reskins priority ranks into Threat Levels (`🐉 S-Rank`, `⚔️ A-Rank`, `🌱 B-Rank`) and task classifications into Contracts (`🕷️ Monster`, `💎 Artifact`, `📜 Commission`).
* **Adventurer Classes**: Maps standard engineering disciplines directly to fantasy class titles (`🧙‍♂️ Archmage` for AI Systems, `🛡️ Paladin` for Site Reliability, `🔥 Sorcerer` for Backend Architecture, `⚙️ Artificer` for Tooling & CI/CD).
* **Atmospheric Styling**: Warm parchment backgrounds, subtle gold accents, and campaign-style board styling.

---

## Engineering Discipline Mapping Legend

To maintain clear alignment between standard engineering organizations and Questwall badges, each role maps to a core technical discipline:

| Role / Class Badge | Industry Engineering Discipline | Primary Scope & Responsibilities |
| :--- | :--- | :--- |
| **`🧙‍♂️ Archmage`** | **AI Architect & LLM Systems** | Agent orchestration, prompt architecture, and AI pipeline integration. |
| **`🛡️ Paladin`** | **Site Reliability & DevOps** | Infrastructure resilience, high-availability uptime, and system alignment. |
| **`🔥 Sorcerer`** | **Core Backend API & Distributed Systems** | Microservices, API prototyping, and scalable database architecture. |
| **`🐴 Knight`** | **Security, Governance & Risk** | Code security auditing, IAM access policies, and enterprise compliance. |
| **`⚙️ Artificer`** | **Systems Engineering & Tooling** | CI/CD deployment pipelines, developer experience, and cloud build tools. |
| **`⚔️ Ranger`** | **Full-Stack Velocity & Automation** | End-to-end feature exploration, cross-cutting workflows, and rapid delivery. |
| **`🧪 Alchemist`** | **Data Engineering & RAG Pipelines** | Vector databases, ETL transformations, ML pipelines, and analytics. |
| **`🌿 Druid`** | **Product Ownership & Agile Scrum** | Sprint planning, backlog grooming, roadmap priorities, and team velocity. |
| **`🗡️ Rogue`** | **Performance & Red Teaming** | Memory leak profiling, latency reduction, and vulnerability testing. |
| **`🪕 Bard`** | **UX/UI Design & Product Synthesis** | Design systems, interactive user flows, component libraries, and docs. |
| **`✨ Cleric`** | **QA Engineering & Test Automation** | Test automation frameworks, regression prevention, and continuous telemetry. |
| **`🥊 Monk`** | **Frontend Core & State Architecture** | Modern web frameworks, responsive layouts, and deterministic state management. |
| **`💀 Necromancer`** | **Legacy Refactoring & Modernization** | Technical debt elimination, codebase migrations, and clean refactoring. |

---

## Installation & Setup

1. Ensure the **[`obsidian-kanban`](https://github.com/mgmeyers/obsidian-kanban)** community plugin is installed and enabled in your vault.
2. Clone this repository into your vault's `.obsidian/plugins/` folder:
   ```bash
   git clone https://github.com/Umataro-Tenma-PhD/obsidian-questwall.git path/to/your/vault/.obsidian/plugins/questwall
   ```
3. Open a terminal inside the plugin folder and install dependencies:
   ```bash
   npm install
   npm run build
   ```
4. In Obsidian, go to **Settings** → **Community Plugins**, reload the plugin list, and enable **`Questwall`**.
5. Open any Kanban board note to experience the modern **Default** workflow engine immediately!

---

## License
Licensed under the **MIT License**. Developed by [Antigravity Engineering](https://github.com/Umataro-Tenma-PhD).
