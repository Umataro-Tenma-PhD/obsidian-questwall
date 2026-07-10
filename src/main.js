/**
 * @file src/main.js
 * @description Questwall 2.0 Plugin Entrypoint — High-Fidelity Agile & Kanban Workflow Engine.
 * @author Antigravity Engineering
 */

import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from './constants/defaults.js';
import { ThemeService } from './services/ThemeService.js';
import { MenuService } from './services/MenuService.js';
import { CardService } from './services/CardService.js';
import { FilterService } from './services/FilterService.js';
import { QuestwallSettingTab } from './ui/SettingsTab.js';

export default class QuestwallPlugin extends Plugin {
    async onload() {
        console.log('Loading Questwall 2.0 (Agile Team & Kanban Supercharger Engine)...');

        await this.loadSettings();

        // Initialize core decoupled services
        this.themeService = new ThemeService(this);
        this.menuService = new MenuService(this);
        this.cardService = new CardService(this);
        this.filterService = new FilterService(this);

        // Apply theme to document body and stylesheet
        this.themeService.applyBodyTheme();
        this.themeService.updateDynamicTeamStyles();

        // Initialize zero-polling menu observer
        this.menuService.init();

        // Add Settings Tab (Cmd + ,)
        this.addSettingTab(new QuestwallSettingTab(this.app, this));

        // Hook into layout changes and file opening (zero interval polling)
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.filterService.scanAndInjectToolbars();
            })
        );

        this.registerEvent(
            this.app.workspace.on('file-open', () => {
                this.filterService.scanAndInjectToolbars();
            })
        );

        // Initial scan on load
        this.app.workspace.onLayoutReady(() => {
            if (!this._unloaded && this.filterService) {
                this.filterService.scanAndInjectToolbars();
            }
        });
    }

    async loadSettings() {
        const loaded = (await this.loadData()) || {};
        this.settings = Object.assign({}, structuredClone(DEFAULT_SETTINGS), loaded);
        if (!this.settings.laneTintMap) this.settings.laneTintMap = {};
        if (!Array.isArray(this.settings.teamMembers)) this.settings.teamMembers = structuredClone(DEFAULT_SETTINGS.teamMembers);
        if (this.settings.theme === 'pixel') {
            this.settings.theme = 'guild';
        }
        if (!document.body.dataset.questwallTheme) {
            document.body.dataset.questwallTheme = this.settings.theme;
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
        if (this.themeService) {
            this.themeService.applyBodyTheme();
            this.themeService.updateDynamicTeamStyles();
        }
        document.querySelectorAll('.questwall-toolbar').forEach(el => el.remove());
        if (this.filterService) {
            this.filterService.scanAndInjectToolbars();
        }
    }

    onunload() {
        console.log('Unloading Questwall 2.0...');
        this._unloaded = true;
        if (this.themeService) this.themeService.cleanup();
        if (this.menuService) this.menuService.cleanup();
        document.querySelectorAll('.questwall-toolbar, .qw-quick-assign-trigger').forEach(el => el.remove());
        document.querySelectorAll('.kanban-plugin__board').forEach(board => {
            board.querySelectorAll('.qw-card-badge').forEach(badge => {
                const raw = badge.dataset.qwCleanTag || badge.textContent;
                if (raw) badge.outerHTML = `<a class="tag" href="#${raw}">#${raw}</a>`;
            });
            board.querySelectorAll('.is-filtered-dimmed').forEach(el => el.classList.remove('is-filtered-dimmed'));
        });
    }
}
