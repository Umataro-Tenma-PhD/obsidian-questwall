# ⚔️ Questwall 2.0 — Gamified Dual-Theme Kanban Engine for Obsidian

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-emerald.svg)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-%3E%3D1.0.0-purple.svg)](https://obsidian.md)

**Questwall** transforms standard Obsidian Kanban boards (`obsidian-kanban`) into interactive, high-fidelity **Adventure Guild RPG** mission boards or **Sleek Glassmorphism** startup command centers.

Built from the ground up with **zero polling intervals**, **deterministic DOM interception**, and **WCAG 2.1 AA accessibility**, Questwall is designed for engineering velocity and gamified team alignment.

---

## ✨ Key Features

### 🏰 Dual-Theme Design Engine
- **Adventure Guild Quest RPG (`guild`)**: High-fantasy parchment textures, glowing gold wax seals, threat ranks (`🐉 S-Rank`, `⚔️ A-Rank`), and adventurer party management.
- **Sleek Glassmorphism (`sleek`)**: Deep dark blur backdrops (`backdrop-filter: blur(14px)`), neon accents, clean badges (`🔴 P1`, `✨ Feature`), and minimalist startup aesthetics.

### 👥 Multi-Role Party & Team Management
- **Adventurer Classes**: Assign curated roles (`Paladin (System Resilience)`, `Archmage (AI Orchestration)`, `Ranger (Workflows)`) or create custom tags.
- **Universal Note Badges**: Team member hashtags (`#assignee/James`) and mentions (`[[@James]]`) automatically render as custom icon badges across any note, markdown table, or Kanban card in your vault.

### ⚡ Quick-Assign & Real-Time Filtering
- **Interactive Board Toolbar**: Filter live by Assignee, Threat Rank (`#P1`, `#P2`), or Quest Type (`#bug`, `#feature`, `#task`).
- **Focus Mode Dimming**: Unselected cards gracefully dim (`opacity: 0.18`, `grayscale(85%)`) to keep your focus locked on priority objectives.
- **Lightning Quick-Assign (`⚡`)**: Point-and-click assignment button directly on card headers without opening raw markdown.

### 🎨 Custom Column & Lane Tinting
- **Native Context Menu Integration**: Seamlessly attaches **`🎨 Change List Color...`** directly into the standard `obsidian-kanban` column settings (`...`) menu.
- **Persistent State**: Column tints (`Sapphire Blue`, `Emerald Green`, `Amethyst Purple`) persist across vault reloads and board re-renders.

---

## 🛠️ Technical Architecture & Portfolio Engineering

Unlike legacy plugins that rely on `window.setInterval` polling loops or brittle multi-stage `setTimeout` cascades, Questwall 2.0 is engineered with strict performance and architectural standards:

```
src/
├── main.js                 # Plugin lifecycle & zero-polling workspace event hooks
├── constants/
│   └── defaults.js         # Single source of truth for regexes, settings, and roles
├── services/
│   ├── ThemeService.js     # Dynamic CSS injection & column tint state management
│   ├── MenuService.js      # Scoped MutationObservers for deterministic menu insertion
│   ├── CardService.js      # Badge decorator & multi-pass exact vault note updater
│   └── FilterService.js    # Interactive toolbar rendering & sorting algorithm
└── ui/
    ├── Modals.js           # WCAG 2.1 AA compliant color & quick-assign modals
    └── SettingsTab.js      # Searchable, paginated party management interface
```

### Technical Highlights
1. **Zero-Polling Performance**: All DOM updates are driven by clean event hooks (`app.workspace.on('layout-change')`, `on('file-open')`) and container-scoped `MutationObserver` instances.
2. **Deterministic Menu Interception (`MenuService.js`)**: Hooks into dynamic Preact/React menu instantiations (`obsidian-kanban`) by observing the `.menu` container during microtask execution, ensuring options appear underneath `Edit list` with 100% reliability.
3. **WCAG 2.1 AA Compliant Modals (`Modals.js`)**: All interactive pills, quick-assign triggers, and color selectors feature `role="button"`, `tabindex="0"`, `aria-label`, and full `Enter` / `Space` keyboard navigation.

---

## 🚀 Installation & Build Instructions

### Building from Source
Prerequisites: Node.js `v20+` and `npm`.

```bash
# Clone repository into your Obsidian vault's plugins folder
cd /path/to/your/vault/.obsidian/plugins/questwall
npm install

# Build production bundle (main.js)
npm run build

# Watch mode for active development
npm run dev
```

### Manual Installation
1. Copy `main.js`, `manifest.json`, and `styles.css` into `.obsidian/plugins/questwall/`.
2. Enable **Questwall** in your Obsidian Community Plugins settings (`Cmd + ,`).
3. Press **`Cmd + R`** to reload your vault.

---

## 📄 License
This project is licensed under the MIT License. Designed & developed by **Antigravity Engineering**.
