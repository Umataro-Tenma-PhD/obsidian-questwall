# ✨ Questwall — Agile Team & Kanban Supercharger for Obsidian

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Umataro-Tenma-PhD/obsidian-questwall)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-10b981.svg)](https://www.w3.org/TR/WCAG21/)
[![Obsidian Kanban](https://img.shields.io/badge/Requires-Obsidian_Kanban-8b5cf6.svg)](https://github.com/mgmeyers/obsidian-kanban)

**Questwall** is a high-performance, zero-polling workflow engine that supercharges your **Obsidian Kanban** boards into modern, glassmorphism engineering command centers (`Default` theme) — with optional gamified RPG mechanics (`Guild` theme).

Built for engineering teams, product owners, and individual developers, Questwall elevates standard Markdown task lists into dynamic visual workspaces without touching or polluting your underlying data files.

---

## 📸 Core Aesthetics & Themes

Questwall features a dual-theme architecture, switchable on the fly from the settings (`Cmd + ,` → **Questwall**) or via board toggles:

### 🌟 1. Default (Sleek Modern Glassmorphism) — *Primary Theme*
Designed for professional engineering orgs and minimalist desktop workflows:
* **Glassmorphism Panels**: `backdrop-filter: blur(14px)` with translucent card containers and refined border gradients.
* **Industry-Standard Role Badges**: Clean, color-coded team member badges indicating distinct engineering roles (`SRE`, `AI Architect`, `Distributed Systems`, `QA Engineering`).
* **High-Contrast Focus & Ergonomics**: Calibrated specifically for long coding sessions with WCAG 2.1 AA compliant color palettes.

### ⚔️ 2. Guild (Gamified RPG Command Center) — *Optional Theme*
For teams that want to inject gamification into their agile sprints:
* **Fantasy Quests & Contracts**: Converts task lanes into Guild Bounties (`🐉 S-Rank`, `⚔️ A-Rank`, `🕷️ Monster`, `💎 Artifact`).
* **Adventurer Classes**: Displays RPG icons and titles (`Paladin`, `Archmage`, `Sorcerer`, `Artificer`) mapped 1-to-1 to your team's real engineering disciplines.
* **Warm Parchment & Gold Accents**: Atmospheric styling reminiscent of tabletop campaign boards.

---

## ⚡ Key Features

### 👥 Dynamic Multi-Role Team Management
No more manual typing of complex hashtags or plain text assignments. Manage your entire team from the **Team & Role Management** settings tab:
* **Multi-Class Assignment**: Assign dual or triple engineering specialties to any person (e.g., `James` as both **Paladin** / SRE and **Archmage** / AI Architect).
* **Live Role Editing**: Click **`✏️ Edit Roles`** on any team member to instantly update their display name, custom hex badge color (`#3b82f6`), or roles using an accessible grid complete with exact industry definitions.
* **Universal Note Badges**: Team member tags (`[[@James]]` or `#assignee/James`) render as interactive badges across all standard Markdown notes and Kanban cards.

### 🎨 Interactive List & Column Tinting (`LaneColorModal`)
Right-click on any column title (`To Do`, `In Progress`, `Done`, `Blocked`) in your Kanban board to instantly tint the entire column:
* Choose from 6 curated, accessible color palettes (`Sapphire Blue`, `Amethyst Purple`, `Emerald Green`, `Crimson Red`, `Amber Orange`, `Slate Gray`).
* Column tints are saved persistently in `data.json` without modifying the text of your `.md` file.

### 🔍 Real-Time Toolbar & Focus Mode (`FilterService`)
Questwall injects a sleek, sticky command toolbar directly into your Kanban header:
* **Instant Filtering**: Filter board cards by specific team members (`[[@James]]`) or priorities (`#P1`, `#P2`, `#P3`).
* **Focus Mode**: Dim all non-priority cards (`#P2`, `#P3`, completed items) with a single click so you can focus exclusively on `🔴 P1 / S-Rank` critical path tasks.

### ⚡ Quick-Assign Modal (`QuickAssignModal`)
Hover over any Kanban card and click the lightning bolt (**`⚡`**) icon to launch the WCAG 2.1 AA compliant assignment modal:
* Assign team members with interactive pill buttons (or write-in new teammates on the fly).
* Set exact priority (`#P1`, `#P2`, `#P3`) and task classifications (`#bug`, `#feature`, `#task`) without touching raw markdown syntax.

---

## 🏗️ Architecture & Zero-Polling Design

Questwall 2.0 has been completely rebuilt around deterministic DOM event handling and mutation observers, eliminating all `setInterval` polling loops for maximum battery life and zero layout thrashing:

```
src/
├── main.js                 # Plugin Entrypoint & Lifecycle Controller
├── constants/defaults.js   # Single Source of Truth for Roles, Themes, & Palettes
├── services/
│   ├── CardService.js      # Zero-Polling Card Transformation & Badge Injector
│   ├── FilterService.js    # Sticky Toolbar, Search Engine & Focus Mode Dimmer
│   └── MenuService.js      # Column Title Context Menu Intercept (Exact Target Match)
└── ui/
    ├── Modals.js           # WCAG 2.1 AA Accessible Dialogs (QuickAssign, EditMember, LaneColor)
    └── SettingsTab.js      # Multi-Role Team Management & Theme Selector
```

### 📦 Prerequisites & Compatibility
Questwall is designed to supercharge the official **[`obsidian-kanban`](https://github.com/mgmeyers/obsidian-kanban)** community plugin by `mgmeyers`:
* **Requirement**: You must have **`obsidian-kanban`** installed and enabled in your Obsidian vault.
* **How It Works**: `obsidian-kanban` renders the base drag-and-drop board directly from standard Markdown task lists (`- [ ]`). Questwall intercepts its DOM tree via non-invasive `MutationObservers` to apply high-fidelity themes (`Default` / `Guild`), interactive toolbars, quick-assign buttons (`⚡`), and multi-role team badges.
* **Data Safety**: If you ever disable Questwall or `obsidian-kanban`, your boards remain clean, standard, human-readable Markdown files (`- [ ] Task Name #P1`).

---

## 🚀 Installation & Setup

### For Local Vaults / Team Distribution
1. Ensure the **[`obsidian-kanban`](https://github.com/mgmeyers/obsidian-kanban)** plugin is installed via Obsidian's Community Plugins browser.
2. Download or clone this repository into your vault's `.obsidian/plugins/` directory:
   ```bash
   git clone https://github.com/Umataro-Tenma-PhD/obsidian-questwall.git path/to/your/vault/.obsidian/plugins/questwall
   ```
3. Open your terminal in the plugin directory and install dependencies / build:
   ```bash
   npm install
   npm run build
   ```
4. Open **Obsidian** → **Settings** → **Community Plugins**, and enable **`Questwall`**.
5. Open any Kanban board note to experience the modern **Default** command center!

---

## 📖 Engineering Role Mapping Reference

To maintain clarity between real-world organizational teams and Questwall roles, each class maps to an industry discipline:

| Role Title / Class | Industry Discipline | Responsibility & Scope |
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

## 📄 License
This project is licensed under the **MIT License**. Created by [Antigravity Engineering](https://github.com/Umataro-Tenma-PhD).
