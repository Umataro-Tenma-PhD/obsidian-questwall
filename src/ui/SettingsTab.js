/**
 * @file src/ui/SettingsTab.js
 * @description Plugin settings interface featuring multi-role party management, search/pagination, and theme selection.
 * @author Antigravity Engineering
 */

import { PluginSettingTab, Setting, Notice } from 'obsidian';
import { ADVENTURER_CLASSES, computeRolesDisplay } from '../constants/defaults.js';

export class QuestwallSettingTab extends PluginSettingTab {
    /**
     * @param {object} app
     * @param {object} plugin - Reference to main QuestwallPlugin instance
     */
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.currentPage = 1;
        this.searchQuery = '';
        this.pageSize = 5;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.style.maxWidth = '750px';

        containerEl.createEl('h2', { text: 'Questwall Settings — Power Gamified Kanban Engine' });

        // 1. Theme Setting
        new Setting(containerEl)
            .setName('Board Aesthetics & Theme')
            .setDesc('Choose between Adventure Guild Quest RPG (parchment, wax seals, threat ranks) or Sleek Glassmorphism (blur, neon accents, modern badges).')
            .addDropdown(drop => {
                drop.addOption('guild', '⚔️ Adventure Guild RPG (High Fantasy Quests)');
                drop.addOption('sleek', '✨ Sleek Glass (Modern Glassmorphism & Neon UI)');
                drop.setValue(this.plugin.settings.theme);
                drop.onChange(async (value) => {
                    this.plugin.settings.theme = value;
                    await this.plugin.saveSettings();
                    this.display();
                });
            });

        containerEl.createEl('hr', { attr: { style: 'margin: 24px 0;' } });

        // 2. Team & Party Management Section
        const teamHeader = containerEl.createDiv({ attr: { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;' } });
        teamHeader.createEl('h3', { text: '👥 Party & Team Management', attr: { style: 'margin: 0;' } });

        const searchContainer = teamHeader.createDiv({ attr: { style: 'display: flex; gap: 8px; align-items: center;' } });
        const searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: '🔍 Search team members...',
            value: this.searchQuery,
            attr: { style: 'padding: 6px 12px; border-radius: 8px; border: 1px solid var(--background-modifier-border);' }
        });
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.currentPage = 1;
            this.renderTeamList(listContainerEl);
        });

        const listContainerEl = containerEl.createDiv();
        this.renderTeamList(listContainerEl);

        containerEl.createEl('hr', { attr: { style: 'margin: 24px 0;' } });

        // 3. Add New Team Member Box
        const addSection = containerEl.createDiv({ attr: { style: 'padding: 18px; border-radius: 12px; background: var(--background-secondary); border: 1px solid var(--background-modifier-border);' } });
        addSection.createEl('h4', { text: '➕ Recruit New Adventurer / Team Member', attr: { style: 'margin-top: 0; margin-bottom: 14px;' } });

        const addGrid = addSection.createDiv({ attr: { style: 'display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 14px;' } });

        const nameInput = addGrid.createEl('input', { type: 'text', placeholder: 'Name (e.g. James)', attr: { style: 'flex: 1; min-width: 160px; padding: 8px 12px; border-radius: 8px;' } });
        const colorInput = addGrid.createEl('input', { type: 'color', value: '#3b82f6', attr: { style: 'width: 44px; height: 38px; padding: 0; border: none; cursor: pointer; border-radius: 6px;' } });

        addSection.createEl('div', { text: 'Select Roles / Adventurer Classes:', attr: { style: 'font-weight: 600; font-size: 0.86rem; margin-bottom: 8px; color: var(--text-muted);' } });
        const roleGrid = addSection.createDiv({ attr: { style: 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;' } });

        const selectedRoles = new Set(['Paladin']);
        const renderRoleSelector = () => {
            roleGrid.empty();
            ADVENTURER_CLASSES.forEach(c => {
                const isSel = selectedRoles.has(c.id);
                const pill = roleGrid.createEl('span', {
                    text: `${c.icon} ${c.id}`,
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isSel ? 'true' : 'false',
                        style: `
                            padding: 5px 12px;
                            border-radius: 16px;
                            font-size: 0.82rem;
                            font-weight: 600;
                            cursor: pointer;
                            border: 1px solid ${isSel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
                            background: ${isSel ? 'var(--interactive-accent)' : 'var(--background-primary)'};
                            color: ${isSel ? 'var(--text-on-accent)' : 'var(--text-normal)'};
                        `
                    }
                });

                const toggleRole = () => {
                    if (isSel && selectedRoles.size > 1) selectedRoles.delete(c.id);
                    else selectedRoles.add(c.id);
                    renderRoleSelector();
                };

                pill.addEventListener('click', toggleRole);
                pill.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRole();
                    }
                });
            });
        };
        renderRoleSelector();

        const submitBtn = addSection.createEl('button', {
            text: '⚔️ Recruit Adventurer into Party',
            attr: {
                role: 'button',
                tabindex: '0',
                style: 'padding: 10px 20px; border-radius: 8px; background: var(--interactive-accent); color: var(--text-on-accent); font-weight: 700; border: none; cursor: pointer;'
            }
        });

        const handleAddMember = async () => {
            const name = nameInput.value.trim();
            if (!name) {
                new Notice('Please enter a valid member name.');
                return;
            }
            if (this.plugin.settings.teamMembers.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                new Notice('That adventurer is already in the party!');
                return;
            }

            const rolesArr = Array.from(selectedRoles);
            const computed = computeRolesDisplay(rolesArr);

            this.plugin.settings.teamMembers.push({
                name: name,
                roles: rolesArr,
                classTitle: computed.classTitle,
                icon: computed.icon,
                color: colorInput.value
            });

            await this.plugin.saveSettings();
            nameInput.value = '';
            new Notice(`${computed.icon} ${name} recruited to the party!`);
            this.renderTeamList(listContainerEl);
        };

        submitBtn.addEventListener('click', handleAddMember);
        submitBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAddMember();
            }
        });
    }

    renderTeamList(containerEl) {
        if (!containerEl) return;
        containerEl.empty();

        const members = (this.plugin.settings.teamMembers || []).filter(m => {
            if (!this.searchQuery) return true;
            return m.name.toLowerCase().includes(this.searchQuery) || (m.classTitle && m.classTitle.toLowerCase().includes(this.searchQuery));
        });

        if (members.length === 0) {
            containerEl.createEl('div', { text: 'No adventurers found matching query.', attr: { style: 'padding: 16px; text-align: center; color: var(--text-muted); font-style: italic;' } });
            return;
        }

        const totalPages = Math.ceil(members.length / this.pageSize) || 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.pageSize;
        const pageMembers = members.slice(startIdx, startIdx + this.pageSize);

        const cardsWrap = containerEl.createDiv({ attr: { style: 'display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;' } });

        pageMembers.forEach(member => {
            const card = cardsWrap.createDiv({ attr: { style: 'display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 10px; background: var(--background-primary); border: 1px solid var(--background-modifier-border);' } });

            const info = card.createDiv({ attr: { style: 'display: flex; align-items: center; gap: 12px;' } });
            const iconBadge = info.createDiv({
                text: member.icon || '👤',
                attr: { style: `width: 38px; height: 38px; border-radius: 10px; background: rgba(59, 130, 246, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; border: 1.5px solid ${member.color || '#3b82f6'};` }
            });

            const details = info.createDiv();
            details.createDiv({ text: member.name, attr: { style: 'font-weight: 700; font-size: 0.96rem; color: var(--text-normal);' } });

            // Render Role Badges
            const rolesList = details.createDiv({ attr: { style: 'display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;' } });
            const rolesArr = member.roles || (member.classTitle ? member.classTitle.split(' ') : ['Paladin']);
            rolesArr.forEach(r => {
                rolesList.createEl('span', {
                    text: r,
                    attr: { style: `padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.12); color: ${member.color || '#3b82f6'}; border: 1px solid ${member.color || '#3b82f6'};` }
                });
            });

            const delBtn = card.createEl('button', {
                text: '🗑️ Remove',
                attr: {
                    role: 'button',
                    tabindex: '0',
                    style: 'padding: 6px 12px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); color: var(--text-error); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.82rem; cursor: pointer;'
                }
            });

            const handleRemove = async () => {
                this.plugin.settings.teamMembers = this.plugin.settings.teamMembers.filter(m => m.name !== member.name);
                await this.plugin.saveSettings();
                new Notice(`${member.name} removed from party.`);
                this.renderTeamList(containerEl);
            };

            delBtn.addEventListener('click', handleRemove);
            delBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRemove();
                }
            });
        });

        // Pagination Controls
        if (totalPages > 1) {
            const pag = containerEl.createDiv({ attr: { style: 'display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; color: var(--text-muted); font-size: 0.84rem;' } });
            pag.createEl('span', { text: `Page ${this.currentPage} of ${totalPages} (${members.length} total members)` });

            const btns = pag.createDiv({ attr: { style: 'display: flex; gap: 8px;' } });
            const prev = btns.createEl('button', { text: '◄ Prev', attr: { style: 'padding: 4px 10px; border-radius: 6px; cursor: pointer;', disabled: this.currentPage === 1 ? 'true' : null } });
            const next = btns.createEl('button', { text: 'Next ►', attr: { style: 'padding: 4px 10px; border-radius: 6px; cursor: pointer;', disabled: this.currentPage === totalPages ? 'true' : null } });

            prev.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTeamList(containerEl);
                }
            });

            next.addEventListener('click', () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderTeamList(containerEl);
                }
            });
        }
    }
}
