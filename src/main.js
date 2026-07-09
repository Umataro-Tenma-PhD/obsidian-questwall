/**
 * @file src/main.js
 * @description Questwall 2.0 Plugin Entrypoint — High-Fidelity Dual-Theme Engine for Obsidian Kanban.
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
        console.log('Loading Questwall 2.0 (Zero-Polling Gamified Kanban Engine)...');

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
            this.filterService.scanAndInjectToolbars();
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        if (this.settings.theme === 'pixel') {
            this.settings.theme = 'guild';
        }
        if (!document.body.dataset.questwallTheme) {
            document.body.dataset.questwallTheme = this.settings.theme;
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.themeService.applyBodyTheme();
        this.themeService.updateDynamicTeamStyles();

        // Refresh active toolbars on theme change
        document.querySelectorAll('.questwall-toolbar').forEach(el => el.remove());
        this.filterService.scanAndInjectToolbars();
    }

    onunload() {
        console.log('Unloading Questwall 2.0...');
        if (this.themeService) this.themeService.cleanup();
        if (this.menuService) this.menuService.cleanup();
        document.querySelectorAll('.questwall-toolbar, .qw-quick-assign-trigger').forEach(el => el.remove());
    }
}
