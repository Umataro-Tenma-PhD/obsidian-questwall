/**
 * @file src/ui/SettingsTab.js
 * @description Plugin settings interface featuring multi-role team management, search/pagination, sorting, dynamic theme adaptation, and role mapping.
 * @author Antigravity Engineering
 */

import { PluginSettingTab, Notice } from 'obsidian';
import { ADVENTURER_CLASSES, computeRolesDisplay } from '../constants/defaults.js';
import { EditMemberModal } from './Modals.js';

export class QuestwallSettingTab extends PluginSettingTab {
    /**
     * @param {object} app
     * @param {object} plugin
     */
    constructor(app, plugin) {
        super(app, plugin);
        this.searchQuery = '';
        this.sortBy = 'name-asc';
        this.currentPage = 1;
        this.pageSize = 5;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        const theme = (this.plugin.settings && this.plugin.settings.theme) || 'sleek';
        const isGuild = theme === 'guild';

        containerEl.createEl('h2', { text: isGuild ? 'Questwall — Guild Board & Agile Supercharger' : 'Questwall — Agile Team & Kanban Supercharger' });

        // 1. Theme Selection
        const themeSection = containerEl.createDiv({ attr: { style: 'padding: 16px; border-radius: 12px; background: var(--background-secondary); border: 1px solid var(--background-modifier-border); margin-bottom: 20px;' } });
        themeSection.createEl('h4', { text: isGuild ? 'Guild World & Board Aesthetics' : 'Board Aesthetics & Theme', attr: { style: 'margin-top: 0; margin-bottom: 6px;' } });
        themeSection.createEl('p', { text: isGuild ? 'You have entered the Guild world! Adventurer classes, threat ranks, and quest contracts are revealed across your Kanban boards.' : 'Select your Kanban board visual theme. Default provides a modern sleek glassmorphism command center; Guild reveals an optional gamified RPG world.', attr: { style: 'font-size: 0.84rem; color: var(--text-muted); margin-bottom: 12px;' } });

        const themeSelect = themeSection.createEl('select', { attr: { style: 'padding: 6px 12px; border-radius: 8px; font-weight: 600;' } });
        ['sleek', 'guild'].forEach(opt => {
            const el = themeSelect.createEl('option', { value: opt, text: opt === 'sleek' ? 'Default (Modern Sleek Glassmorphism)' : 'Guild (Gamified RPG Theme)' });
            if (this.plugin.settings.theme === opt) el.selected = true;
        });

        themeSelect.addEventListener('change', async (e) => {
            this.plugin.settings.theme = e.target.value;
            await this.plugin.saveSettings();
            this.display(); // Instantly adapt all Settings UI wording
        });

        // 2. Team Member & Multi-Role Management Header & Toolbar
        const teamSection = containerEl.createDiv({ attr: { style: 'margin-bottom: 24px;' } });
        const teamHeader = teamSection.createDiv({ attr: { style: 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;' } });
        
        teamHeader.createEl('h3', { text: isGuild ? '🛡️ Guild Roster & Party Management' : '👥 Team & Role Management', attr: { style: 'margin: 0;' } });

        const toolbar = teamHeader.createDiv({ attr: { style: 'display: flex; gap: 10px; align-items: center; flex-wrap: wrap;' } });
        
        const searchInput = toolbar.createEl('input', {
            type: 'text',
            placeholder: isGuild ? '🔍 Search party members...' : '🔍 Search team member...',
            value: this.searchQuery,
            attr: { style: 'padding: 6px 12px; border-radius: 8px; border: 1px solid var(--background-modifier-border); font-size: 0.84rem; min-width: 180px;' }
        });
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.currentPage = 1;
            this.renderTeamList(listContainerEl);
        });

        const sortSelect = toolbar.createEl('select', { attr: { style: 'padding: 6px 10px; border-radius: 8px; border: 1px solid var(--background-modifier-border); font-size: 0.84rem; font-weight: 600;' } });
        const sortOpts = [
            { val: 'name-asc', label: 'Sort: Name (A → Z)' },
            { val: 'name-desc', label: 'Sort: Name (Z → A)' },
            { val: 'role', label: isGuild ? 'Sort: Adventurer Class' : 'Sort: Engineering Role' }
        ];
        sortOpts.forEach(o => {
            const opEl = sortSelect.createEl('option', { value: o.val, text: o.label });
            if (this.sortBy === o.val) opEl.selected = true;
        });
        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.currentPage = 1;
            this.renderTeamList(listContainerEl);
        });

        const listContainerEl = teamSection.createDiv();
        this.renderTeamList(listContainerEl);

        // 3. Add New Team Member Box
        const addSection = containerEl.createDiv({ attr: { style: 'padding: 18px; border-radius: 12px; background: var(--background-secondary); border: 1px solid var(--background-modifier-border); margin-bottom: 24px;' } });
        addSection.createEl('h4', { text: isGuild ? '⚔️ Recruit New Adventurer into Party' : '➕ Add New Team Member', attr: { style: 'margin-top: 0; margin-bottom: 14px;' } });

        const addGrid = addSection.createDiv({ attr: { style: 'display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px;' } });

        const nameInput = addGrid.createEl('input', { type: 'text', placeholder: isGuild ? 'Adventurer Name...' : 'Name (e.g. James)', attr: { style: 'flex: 1; min-width: 160px; padding: 8px 12px; border-radius: 8px;' } });
        const colorInput = addGrid.createEl('input', { type: 'color', value: '#3b82f6', attr: { style: 'width: 44px; height: 38px; padding: 0; border: none; cursor: pointer; border-radius: 6px;' } });

        addSection.createEl('div', { text: isGuild ? 'Select Adventurer Classes / Roles:' : 'Select Engineering & Product Roles:', attr: { style: 'font-weight: 600; font-size: 0.86rem; margin-bottom: 8px; color: var(--text-normal);' } });
        const roleGrid = addSection.createDiv({ attr: { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 6px; margin-bottom: 16px;' } });

        const selectedRoles = new Set(['Paladin']);
        const renderRoleSelector = () => {
            roleGrid.empty();
            ADVENTURER_CLASSES.forEach(c => {
                const isSel = selectedRoles.has(c.id);
                const pill = roleGrid.createDiv({
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isSel ? 'true' : 'false',
                        style: `
                            padding: 8px 12px;
                            border-radius: 10px;
                            cursor: pointer;
                            border: 1px solid ${isSel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
                            background: ${isSel ? 'rgba(59, 130, 246, 0.12)' : 'var(--background-primary)'};
                            transition: all 0.2s ease;
                        `
                    }
                });

                const top = pill.createDiv({ attr: { style: 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;' } });
                top.createDiv({ text: isGuild ? c.label : c.corpLabel, attr: { style: `font-weight: 700; font-size: 0.82rem; color: ${isSel ? 'var(--interactive-accent)' : 'var(--text-normal)'};` } });
                top.createSpan({ text: isSel ? '✓' : '+', attr: { style: `font-weight: bold; color: ${isSel ? 'var(--interactive-accent)' : 'var(--text-muted)'};` } });

                pill.createDiv({ text: c.desc, attr: { style: 'font-size: 0.74rem; color: var(--text-muted); line-height: 1.25;' } });

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
            text: isGuild ? '⚔️ Recruit Adventurer into Party' : '➕ Add Team Member',
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
                new Notice('That person is already on the team!');
                return;
            }

            const rolesArr = Array.from(selectedRoles);
            const computed = computeRolesDisplay(rolesArr, isGuild);

            this.plugin.settings.teamMembers.push({
                name: name,
                roles: rolesArr,
                classTitle: computed.classTitle,
                icon: computed.icon,
                color: colorInput.value
            });

            await this.plugin.saveSettings();
            nameInput.value = '';
            new Notice(isGuild ? `${computed.icon} ${name} recruited!` : `${name} added to the team!`);
            this.renderTeamList(listContainerEl);
        };

        submitBtn.addEventListener('click', handleAddMember);
        submitBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAddMember();
            }
        });

        // 4. Role Mapping Legend
        const guideSection = containerEl.createDiv({ attr: { style: 'padding: 16px; border-radius: 12px; background: var(--background-primary-alt); border: 1px solid var(--background-modifier-border);' } });
        guideSection.createEl('h4', { text: isGuild ? '📖 Adventurer Class to Engineering Discipline Legend' : '📖 Engineering & Product Discipline Guide', attr: { style: 'margin-top: 0; margin-bottom: 10px; font-weight: 700; color: var(--text-normal);' } });
        guideSection.createEl('p', { text: isGuild ? 'To maintain clean alignment between your RPG party badges and standard engineering org structures, each Adventurer Class maps directly to an industry discipline:' : 'To maintain clean alignment across agile engineering org structures and team badges, each role maps directly to an industry discipline:', attr: { style: 'font-size: 0.84rem; color: var(--text-muted); margin-bottom: 14px;' } });

        const guideGrid = guideSection.createDiv({ attr: { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px;' } });
        ADVENTURER_CLASSES.forEach(c => {
            const row = guideGrid.createDiv({ attr: { style: 'padding: 8px 10px; border-radius: 8px; background: var(--background-primary); border: 1px solid var(--background-modifier-border);' } });
            row.createDiv({ text: isGuild ? c.label : c.corpLabel, attr: { style: 'font-weight: 700; font-size: 0.82rem; color: var(--text-normal); margin-bottom: 2px;' } });
            row.createDiv({ text: c.desc, attr: { style: 'font-size: 0.74rem; color: var(--text-muted); line-height: 1.25;' } });
        });
    }

    renderTeamList(containerEl) {
        if (!containerEl) return;
        containerEl.empty();

        const theme = (this.plugin.settings && this.plugin.settings.theme) || 'sleek';
        const isGuild = theme === 'guild';

        let members = (this.plugin.settings.teamMembers || []).filter(m => {
            if (!this.searchQuery) return true;
            return m.name.toLowerCase().includes(this.searchQuery) || (m.classTitle && m.classTitle.toLowerCase().includes(this.searchQuery));
        });

        if (this.sortBy === 'name-asc') {
            members.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.sortBy === 'name-desc') {
            members.sort((a, b) => b.name.localeCompare(a.name));
        } else if (this.sortBy === 'role') {
            members.sort((a, b) => (a.classTitle || '').localeCompare(b.classTitle || ''));
        }

        if (members.length === 0) {
            containerEl.createEl('div', { text: 'No team members found matching criteria.', attr: { style: 'padding: 16px; text-align: center; color: var(--text-muted); font-style: italic;' } });
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
                text: isGuild ? (member.icon || '👤') : '👤',
                attr: { style: `width: 38px; height: 38px; border-radius: 10px; background: rgba(59, 130, 246, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; border: 1.5px solid ${member.color || '#3b82f6'};` }
            });

            const details = info.createDiv();
            details.createDiv({ text: member.name, attr: { style: 'font-weight: 700; font-size: 0.96rem; color: var(--text-normal);' } });

            // Render Role Badges: strictly pure corporate under Default, full mapping under Guild
            const rolesList = details.createDiv({ attr: { style: 'display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;' } });
            const rolesArr = member.roles || (member.classTitle ? member.classTitle.split(' ') : ['Paladin']);
            rolesArr.forEach(r => {
                const found = ADVENTURER_CLASSES.find(c => c.id === r);
                const displayText = found ? (isGuild ? r : found.corpTitle) : r;
                const tooltipText = found ? (isGuild ? `${found.label} — ${found.desc}` : `${found.corpLabel} — ${found.desc}`) : r;
                rolesList.createEl('span', {
                    text: displayText,
                    attr: {
                        title: tooltipText,
                        style: `padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.12); color: ${member.color || '#3b82f6'}; border: 1px solid ${member.color || '#3b82f6'}; cursor: help;`
                    }
                });
            });

            // Action buttons: Edit & Remove
            const cardActions = card.createDiv({ attr: { style: 'display: flex; gap: 8px; align-items: center;' } });

            const editBtn = cardActions.createEl('button', {
                text: '✏️ Edit Roles',
                attr: {
                    role: 'button',
                    tabindex: '0',
                    style: 'padding: 6px 12px; border-radius: 8px; background: rgba(59, 130, 246, 0.12); color: var(--interactive-accent); border: 1px solid rgba(59, 130, 246, 0.35); font-size: 0.82rem; font-weight: 600; cursor: pointer;'
                }
            });

            const handleEdit = () => {
                new EditMemberModal(this.app, member, this.plugin, () => {
                    this.renderTeamList(containerEl);
                }).open();
            };

            editBtn.addEventListener('click', handleEdit);
            editBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEdit();
                }
            });

            const delBtn = cardActions.createEl('button', {
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
                new Notice(`${member.name} removed from team.`);
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
