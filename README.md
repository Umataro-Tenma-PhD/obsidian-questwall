# Questwall — Agile Workflow Engine for Obsidian Kanban

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Umataro-Tenma-PhD/obsidian-questwall)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-10b981.svg)](https://www.w3.org/TR/WCAG21/)
[![Obsidian Kanban](https://img.shields.io/badge/Requires-Obsidian_Kanban-8b5cf6.svg)](https://github.com/mgmeyers/obsidian-kanban)

Questwall adds interactive filtering, multi-role team assignment, quick priority and type tagging, column color tints, and focus mode directly to your **Obsidian Kanban** boards. It extends standard Markdown task lists with dynamic team management and multi-property sorting without modifying or polluting your underlying markdown files.

---

## Technical Architecture & Compatibility

Questwall operates as a non-destructive functional layer for the official **[`obsidian-kanban`](https://github.com/mgmeyers/obsidian-kanban)** community plugin:

* **Event-Driven UI Updates**: Instead of running background timers (`setInterval`), Questwall uses precise `MutationObservers` to detect board changes instantly. This ensures responsive UI rendering with zero layout thrashing or CPU overhead.
* **Standard Markdown Storage**: All Kanban cards remain standard, human-readable Markdown lists (`- [ ] Task title #P1 [[@James]]`). If you disable Questwall at any time, your notes and boards remain completely intact and accessible.
* **Universal Vault Support**: Team member mentions (`[[@James]]` and `#assignee/James`) and priority tags (`#P1`, `#P2`, `#P3`) render as color-coded interactive pills anywhere in your Obsidian vault—including daily notes, project documentation, and markdown tables.

---

## Core Features

### 1. Interactive Command Toolbar
Questwall automatically injects a sticky toolbar above your Kanban board header for fast filtering and sorting:

* **Real-Time Filtering**: Isolate tasks instantly by clicking any team member (`[[@James]]`), priority level (`🔴 P1`, `🟡 P2`, `🟢 P3`), or task classification (`🐞 Bug`, `✨ Feature`, `📋 Task`).
* **Focus Mode (`🎯`)**: Dim all lower-priority and completed items (`#P2`, `#P3`) with a single click, allowing you to focus exclusively on `🔴 P1` critical deliverables during deep work sessions.
* **Multi-Property Column Sorting (`↕️ Order By`)**: Sort cards inside every column dynamically by:
  * **Priority**: Highest to Lowest (`P1 → P3`) or Lowest to Highest (`P3 → P1`).
  * **Assignee**: Group and order tasks alphabetically by assigned team member (`A → Z`).
  * **Category**: Categorize columns by task classification (`Bug → Feature → Task`).
  * **Title**: Alphabetical card title ordering (`A → Z` or `Z → A`).
  * **Default (Board Order)**: Instantly return to standard drag-and-drop ordering at any time.

### 2. Multi-Role Team Management
Manage your engineering team directly inside Obsidian (`Cmd + ,` → **Questwall**), creating a centralized registry of project responsibilities across your vault:

* **Engineering & Product Roles**: Assign specific industry-standard roles to each teammate (`AI Architect`, `Site Reliability & DevOps`, `Core Backend API`, `QA Engineering`, `UX/UI Design`).
* **Live Role Editing**: Click **`✏️ Edit Roles`** next to any team member in settings to update their display name, hex badge color (`#3b82f6`), or assigned engineering disciplines on the fly.
* **Team List Sorting**: Sort your team members alphabetically by name (`A → Z` / `Z → A`) or group them cleanly by technical discipline.

### 3. Quick-Assign Dialog (`⚡`)
Eliminate manual markdown syntax typing when assigning tasks or setting card metadata:

* Hover over any Kanban card and click the lightning bolt (**`⚡`**) trigger to open a clean assignment dialog.
* Select assignees, priority levels (`#P1`, `#P2`, `#P3`), and task types (`#bug`, `#feature`, `#task`) with tactile button controls.
* Add new team members to your project directly from the assignment dialog with `+ Add New Person...`.

### 4. Column & List Tinting (`🎨`)
Improve board scannability by applying subtle color tints to specific workflow columns:

* Right-click on any Kanban column header (`To Do`, `In Progress`, `Done`, `Blocked`) and select **`Change List Color...`**.
* Choose from 6 accessible background and border tints (`Sapphire Blue`, `Amethyst Purple`, `Emerald Green`, `Crimson Red`, `Amber Orange`, `Slate Gray`).
* Column color selections are saved persistently in `data.json` without altering your markdown titles.

---

## Themes

Questwall includes a clean theme switcher (`Cmd + ,` → **Questwall** → **Board Aesthetics & Theme**) with two options:

* **Default**: Modern glassmorphism styling with clean, professional engineering terminology (`AI Architect`, `Site Reliability & DevOps`, `P1`, `Bug`, `Feature`).
* **Guild**: An optional RPG theme that reskins priorities into Threat Ranks (`🐉 S-Rank`, `⚔️ A-Rank`, `🌱 B-Rank`) and engineering roles into fantasy class badges (`🧙‍♂️ Archmage` for AI Systems, `🛡️ Paladin` for Site Reliability & DevOps).

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
5. Open any Kanban board note to begin using the interactive toolbar and universal badges right away.

---

## License
Licensed under the **MIT License**. Developed by [Antigravity Engineering](https://github.com/Umataro-Tenma-PhD).
