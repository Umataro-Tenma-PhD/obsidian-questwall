/**
 * @file src/services/ThemeService.js
 * @description Manages active theme classes, dynamic CSS stylesheet generation, and column color tinting across Obsidian Kanban boards.
 * @author Antigravity Engineering
 */

import { LANE_COLORS } from '../constants/defaults.js';

export class ThemeService {
    /**
     * @param {object} plugin - Reference to the main QuestwallPlugin instance
     */
    constructor(plugin) {
        this.plugin = plugin;
    }

    /**
     * Converts a 3 or 6 digit hex string to an RGB comma-separated string (`"255, 128, 0"`).
     * @param {string} hex
     * @returns {string}
     */
    hexToRgb(hex) {
        let clean = (hex || '#3b82f6').replace('#', '');
        if (clean.length === 3) {
            clean = clean.split('').map(c => c + c).join('');
        }
        const num = parseInt(clean, 16);
        return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    }

    /**
     * Updates body data attributes when theme changes.
     */
    applyBodyTheme() {
        if (!this.plugin.settings) return;
        document.body.dataset.questwallTheme = this.plugin.settings.theme;
    }

    /**
     * Generates dynamic stylesheet (`#qw-dynamic-team-styles`) for team members across all notes, tables, and Kanban cards.
     */
    updateDynamicTeamStyles() {
        if (!this.plugin.settings || !Array.isArray(this.plugin.settings.teamMembers)) return;

        let styleEl = document.getElementById('qw-dynamic-team-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'qw-dynamic-team-styles';
            document.head.appendChild(styleEl);
        }

        let css = '';
        this.plugin.settings.teamMembers.forEach(member => {
            const name = (member.name || '').trim();
            if (!name) return;
            const color = member.color || '#3b82f6';
            const rgb = this.hexToRgb(color);

            css += `
/* Universal Badges & Tags for ${name} across any note or table */
body[data-questwall-theme] a.tag[href*="${name}" i],
body[data-questwall-theme] a.tag[href*="#assignee/${name}" i],
body[data-questwall-theme] span.cm-hashtag:has(.cm-hashtag-end:is([data-content*="${name}" i])),
body[data-questwall-theme] a.internal-link[href*="@${name}" i],
body[data-questwall-theme] a.internal-link[data-href*="@${name}" i],
body[data-questwall-theme] .kanban-plugin__item .qw-card-badge[data-qw-assignee="${name}"] {
    background-color: rgba(${rgb}, 0.18) !important;
    border: 1.5px solid ${color} !important;
    color: var(--text-normal) !important;
    font-weight: 700 !important;
    box-shadow: 0 0 10px rgba(${rgb}, 0.25) !important;
}

body[data-questwall-theme="guild"] a.tag[href*="${name}" i],
body[data-questwall-theme="guild"] a.tag[href*="#assignee/${name}" i],
body[data-questwall-theme="guild"] span.cm-hashtag:has(.cm-hashtag-end:is([data-content*="${name}" i])),
body[data-questwall-theme="guild"] a.internal-link[href*="@${name}" i],
body[data-questwall-theme="guild"] a.internal-link[data-href*="@${name}" i],
body[data-questwall-theme="guild"] .kanban-plugin__item .qw-card-badge[data-qw-assignee="${name}"] {
    background: linear-gradient(135deg, rgba(${rgb}, 0.35), rgba(${rgb}, 0.15)) !important;
    border: 1.5px solid ${color} !important;
    color: #fff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
    box-shadow: 0 0 14px rgba(${rgb}, 0.45), inset 0 0 8px rgba(255,255,255,0.15) !important;
}
`;
        });

        styleEl.textContent = css;
    }

    /**
     * Extracts title string from an obsidian-kanban lane element.
     * @param {HTMLElement} lane
     * @returns {string}
     */
    getLaneTitle(lane) {
        if (!lane) return '';
        const titleEl = lane.querySelector('.kanban-plugin__lane-title-text, .kanban-plugin__lane-title');
        return titleEl ? titleEl.textContent.trim() : '';
    }

    /**
     * Applies saved color tints from settings to all lanes on a Kanban board.
     * @param {HTMLElement} board
     */
    applyLaneColorsToBoard(board) {
        if (!board || !this.plugin.settings || !this.plugin.settings.laneTintMap) return;
        board.querySelectorAll('.kanban-plugin__lane').forEach(lane => {
            const laneTitle = this.getLaneTitle(lane);
            const colorKey = this.plugin.settings.laneTintMap[laneTitle];
            if (colorKey && LANE_COLORS[colorKey]) {
                lane.style.backgroundColor = LANE_COLORS[colorKey].bg;
                lane.style.borderColor = LANE_COLORS[colorKey].border;
            } else {
                lane.style.backgroundColor = '';
                lane.style.borderColor = '';
            }
        });
    }

    /**
     * Removes injected stylesheets on unload.
     */
    cleanup() {
        const styleEl = document.getElementById('qw-dynamic-team-styles');
        if (styleEl && styleEl.parentNode) {
            styleEl.parentNode.removeChild(styleEl);
        }
        delete document.body.dataset.questwallTheme;
    }
}
