/**
 * @file src/ui/Modals.js
 * @description Accessible, WCAG 2.1 AA compliant modal dialogs for color tinting, task assignment, and team member editing.
 * @author Antigravity Engineering
 */

import { Modal, Notice } from 'obsidian';
import { LANE_COLORS, ADVENTURER_CLASSES, computeRolesDisplay } from '../constants/defaults.js';

export class LaneColorModal extends Modal {
    /**
     * @param {object} app
     * @param {function} onSelect
     */
    constructor(app, onSelect) {
        super(app);
        this.onSelect = onSelect;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.style.padding = '24px';
        contentEl.style.maxWidth = '420px';

        contentEl.createEl('h3', { text: '🎨 Select List Tint Color', attr: { style: 'margin-top: 0; margin-bottom: 16px; font-weight: 700;' } });

        const grid = contentEl.createDiv({ attr: { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' } });

        Object.keys(LANE_COLORS).forEach(key => {
            const colorInfo = LANE_COLORS[key];
            const btn = grid.createEl('button', {
                attr: {
                    role: 'button',
                    tabindex: '0',
                    'aria-label': `Select ${colorInfo.label}`,
                    style: `
                        padding: 14px 12px;
                        border-radius: 12px;
                        border: 2px solid ${colorInfo.border};
                        background: ${colorInfo.bg};
                        color: var(--text-normal);
                        font-weight: 600;
                        font-size: 0.9rem;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    `
                }
            });
            btn.innerHTML = `<span>●</span> <span>${colorInfo.label}</span>`;

            const selectThisColor = () => {
                this.onSelect(key);
                this.close();
            };

            btn.addEventListener('click', selectThisColor);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectThisColor();
                }
            });
        });

        const resetBtn = contentEl.createEl('button', {
            text: '🔄 Reset to Default / Clear Tint',
            attr: {
                role: 'button',
                tabindex: '0',
                style: 'margin-top: 18px; width: 100%; padding: 10px; border-radius: 10px; background: rgba(239, 68, 68, 0.12); color: var(--text-error); border: 1px solid rgba(239, 68, 68, 0.35); font-weight: 600; cursor: pointer;'
            }
        });

        const selectReset = () => {
            this.onSelect('reset');
            this.close();
        };

        resetBtn.addEventListener('click', selectReset);
        resetBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectReset();
            }
        });

        const firstBtn = grid.querySelector('button');
        if (firstBtn) setTimeout(() => firstBtn.focus(), 50);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


export class QuickAssignModal extends Modal {
    /**
     * @param {object} app
     * @param {object} settings
     * @param {HTMLElement} cardItem
     * @param {string} cleanTitle
     * @param {function} onSave
     */
    constructor(app, settings, cardItem, cleanTitle, onSave) {
        super(app);
        this.settings = settings || {};
        this.cardItem = cardItem;
        this.cleanTitle = cleanTitle;
        this.onSave = onSave;

        this.selectedAssignee = null;
        this.selectedPriority = null;
        this.selectedType = null;

        if (cardItem) {
            const text = cardItem.innerText || '';
            if (text.match(/#P1\b/i)) this.selectedPriority = '#P1';
            else if (text.match(/#P2\b/i)) this.selectedPriority = '#P2';
            else if (text.match(/#P3\b/i)) this.selectedPriority = '#P3';

            if (text.match(/#bug\b/i)) this.selectedType = '#bug';
            else if (text.match(/#feature\b/i)) this.selectedType = '#feature';
            else if (text.match(/#task\b/i)) this.selectedType = '#task';
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.style.padding = '22px';
        contentEl.style.maxWidth = '500px';

        const theme = this.settings.theme || 'sleek';
        const isGuild = theme === 'guild';

        contentEl.createEl('h3', { text: `⚡ Quick Assign: "${this.cleanTitle}"`, attr: { style: 'margin-top: 0; margin-bottom: 18px; font-weight: 700;' } });

        contentEl.createEl('h4', { text: isGuild ? '🗡️ Select Adventurer / Party Member' : 'Assignee / Team Member', attr: { style: 'margin-bottom: 8px; font-size: 0.92rem;' } });
        const assigneeContainer = contentEl.createDiv({ attr: { style: 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px;' } });

        const members = Array.isArray(this.settings.teamMembers) ? this.settings.teamMembers.filter(m => m.name && m.name.trim()) : [];
        const renderAssigneeButtons = () => {
            assigneeContainer.empty();
            members.forEach(m => {
                const name = m.name.trim();
                const icon = m.icon || '👤';
                const tag = `[[@${name}]]`;
                const isSel = this.selectedAssignee === tag;

                const pill = assigneeContainer.createEl('span', {
                    text: `${icon} ${name}`,
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isSel ? 'true' : 'false',
                        style: `
                            padding: 6px 14px;
                            border-radius: 16px;
                            font-size: 0.86rem;
                            font-weight: 600;
                            cursor: pointer;
                            border: 1.5px solid ${isSel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
                            background: ${isSel ? 'var(--interactive-accent)' : 'var(--background-secondary)'};
                            color: ${isSel ? 'var(--text-on-accent)' : 'var(--text-normal)'};
                            transition: all 0.2s ease;
                        `
                    }
                });

                const selectAssignee = () => {
                    this.selectedAssignee = isSel ? null : tag;
                    renderAssigneeButtons();
                    this.updatePreview();
                };

                pill.addEventListener('click', selectAssignee);
                pill.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectAssignee();
                    }
                });
            });

            const addWriteInBtn = assigneeContainer.createEl('span', {
                text: '+ Add New Person...',
                attr: {
                    role: 'button',
                    tabindex: '0',
                    style: 'padding: 6px 14px; border-radius: 16px; font-size: 0.86rem; font-weight: 600; cursor: pointer; border: 1px dashed var(--text-muted); background: transparent; color: var(--text-muted); transition: all 0.2s ease;'
                }
            });

            addWriteInBtn.addEventListener('click', () => {
                const name = window.prompt('Enter new person\'s name:');
                if (name && name.trim()) {
                    const cleanName = name.trim();
                    if (!members.some(m => m.name.toLowerCase() === cleanName.toLowerCase())) {
                        members.push({ name: cleanName, icon: '👤', classTitle: 'Team Member', color: '#3b82f6' });
                        if (this.settings && Array.isArray(this.settings.teamMembers)) {
                            this.settings.teamMembers.push({ name: cleanName, icon: '👤', classTitle: 'Team Member', color: '#3b82f6' });
                        }
                    }
                    this.selectedAssignee = `[[@${cleanName}]]`;
                    renderAssigneeButtons();
                    this.updatePreview();
                }
            });
        };
        renderAssigneeButtons();

        contentEl.createEl('h4', { text: isGuild ? '🔥 Threat Level / Rank' : 'Priority Level', attr: { style: 'margin-bottom: 8px; font-size: 0.92rem;' } });
        const prioContainer = contentEl.createDiv({ attr: { style: 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px;' } });
        const prioOptions = isGuild ? [
            { id: '#P1', label: '🐉 S-Rank (#P1)' },
            { id: '#P2', label: '⚔️ A-Rank (#P2)' },
            { id: '#P3', label: '🌱 B-Rank (#P3)' }
        ] : [
            { id: '#P1', label: '🔴 P1 (High)' },
            { id: '#P2', label: '🟡 P2 (Med)' },
            { id: '#P3', label: '🟢 P3 (Low)' }
        ];

        const renderPrioButtons = () => {
            prioContainer.empty();
            prioOptions.forEach(p => {
                const isSel = this.selectedPriority === p.id;
                const pill = prioContainer.createEl('span', {
                    text: p.label,
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isSel ? 'true' : 'false',
                        style: `
                            padding: 6px 14px;
                            border-radius: 16px;
                            font-size: 0.86rem;
                            font-weight: 600;
                            cursor: pointer;
                            border: 1.5px solid ${isSel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
                            background: ${isSel ? 'var(--interactive-accent)' : 'var(--background-secondary)'};
                            color: ${isSel ? 'var(--text-on-accent)' : 'var(--text-normal)'};
                        `
                    }
                });

                const selectPrio = () => {
                    this.selectedPriority = isSel ? null : p.id;
                    renderPrioButtons();
                    this.updatePreview();
                };

                pill.addEventListener('click', selectPrio);
                pill.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectPrio();
                    }
                });
            });
        };
        renderPrioButtons();

        contentEl.createEl('h4', { text: isGuild ? '📜 Quest Type / Contract' : 'Task Type', attr: { style: 'margin-bottom: 8px; font-size: 0.92rem;' } });
        const typeContainer = contentEl.createDiv({ attr: { style: 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px;' } });
        const typeOptions = isGuild ? [
            { id: '#bug', label: '🕷️ Monster (#bug)' },
            { id: '#feature', label: '💎 Artifact (#feature)' },
            { id: '#task', label: '📜 Commission (#task)' }
        ] : [
            { id: '#bug', label: '🐞 Bug' },
            { id: '#feature', label: '✨ Feature' },
            { id: '#task', label: '📋 Task' }
        ];

        const renderTypeButtons = () => {
            typeContainer.empty();
            typeOptions.forEach(t => {
                const isSel = this.selectedType === t.id;
                const pill = typeContainer.createEl('span', {
                    text: t.label,
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isSel ? 'true' : 'false',
                        style: `
                            padding: 6px 14px;
                            border-radius: 16px;
                            font-size: 0.86rem;
                            font-weight: 600;
                            cursor: pointer;
                            border: 1.5px solid ${isSel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
                            background: ${isSel ? 'var(--interactive-accent)' : 'var(--background-secondary)'};
                            color: ${isSel ? 'var(--text-on-accent)' : 'var(--text-normal)'};
                        `
                    }
                });

                const selectType = () => {
                    this.selectedType = isSel ? null : t.id;
                    renderTypeButtons();
                    this.updatePreview();
                };

                pill.addEventListener('click', selectType);
                pill.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectType();
                    }
                });
            });
        };
        renderTypeButtons();

        this.previewEl = contentEl.createDiv({ attr: { style: 'padding: 12px 16px; border-radius: 10px; background: var(--background-primary-alt); border: 1px solid var(--background-modifier-border); margin-bottom: 20px; font-size: 0.9rem; font-family: monospace;' } });
        this.updatePreview();

        const actions = contentEl.createDiv({ attr: { style: 'display: flex; justify-content: flex-end; gap: 10px;' } });
        const cancelBtn = actions.createEl('button', { text: 'Cancel', attr: { style: 'padding: 8px 16px; border-radius: 8px; cursor: pointer;' } });
        cancelBtn.addEventListener('click', () => this.close());

        const saveBtn = actions.createEl('button', {
            text: '💾 Save Assignment',
            attr: {
                role: 'button',
                tabindex: '0',
                style: 'padding: 8px 18px; border-radius: 8px; background: var(--interactive-accent); color: var(--text-on-accent); font-weight: 700; border: none; cursor: pointer;'
            }
        });

        const triggerSave = () => {
            const tags = [this.selectedAssignee, this.selectedPriority, this.selectedType].filter(Boolean).join(' ');
            this.onSave(tags);
            this.close();
        };

        saveBtn.addEventListener('click', triggerSave);
        saveBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerSave();
            }
        });

        setTimeout(() => saveBtn.focus(), 50);
    }

    updatePreview() {
        if (!this.previewEl) return;
        const tags = [this.selectedAssignee, this.selectedPriority, this.selectedType].filter(Boolean).join(' ');
        this.previewEl.innerHTML = `<strong>Card Note Line:</strong><br/>- [ ] ${this.cleanTitle} <span style="color: var(--interactive-accent); font-weight: bold;">${tags}</span>`;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


export class EditMemberModal extends Modal {
    /**
     * @param {object} app
     * @param {object} member
     * @param {object} plugin
     * @param {function} onSave
     */
    constructor(app, member, plugin, onSave) {
        super(app);
        this.member = member;
        this.plugin = plugin;
        this.onSave = onSave;
        this.selectedRoles = new Set(member.roles || (member.classTitle ? member.classTitle.split(' ') : ['Paladin']));
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.style.padding = '24px';
        contentEl.style.maxWidth = '640px';

        contentEl.createEl('h3', { text: `✏️ Edit Team Member: "${this.member.name}"`, attr: { style: 'margin-top: 0; margin-bottom: 18px; font-weight: 700;' } });

        // Name & Color
        const topRow = contentEl.createDiv({ attr: { style: 'display: flex; gap: 12px; align-items: center; margin-bottom: 20px;' } });
        topRow.createEl('label', { text: 'Name:', attr: { style: 'font-weight: 600;' } });
        const nameInput = topRow.createEl('input', { type: 'text', value: this.member.name, attr: { style: 'flex: 1; padding: 8px 12px; border-radius: 8px;' } });
        topRow.createEl('label', { text: 'Badge Color:', attr: { style: 'font-weight: 600; margin-left: 12px;' } });
        const colorInput = topRow.createEl('input', { type: 'color', value: this.member.color || '#3b82f6', attr: { style: 'width: 46px; height: 38px; padding: 0; border: none; cursor: pointer; border-radius: 6px;' } });

        // Role Selector with Industry Standard Descriptions
        contentEl.createEl('div', { text: 'Select Engineering & Product Roles:', attr: { style: 'font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; color: var(--text-normal);' } });
        const roleGrid = contentEl.createDiv({ attr: { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 6px; margin-bottom: 22px;' } });

        const renderRoleGrid = () => {
            roleGrid.empty();
            ADVENTURER_CLASSES.forEach(c => {
                const isSel = this.selectedRoles.has(c.id);
                const item = roleGrid.createDiv({
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isSel ? 'true' : 'false',
                        style: `
                            padding: 10px 12px;
                            border-radius: 10px;
                            cursor: pointer;
                            border: 1.5px solid ${isSel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
                            background: ${isSel ? 'rgba(59, 130, 246, 0.12)' : 'var(--background-secondary)'};
                            transition: all 0.2s ease;
                        `
                    }
                });

                const top = item.createDiv({ attr: { style: 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;' } });
                top.createDiv({ text: c.label, attr: { style: `font-weight: 700; font-size: 0.86rem; color: ${isSel ? 'var(--interactive-accent)' : 'var(--text-normal)'};` } });
                const check = top.createSpan({ text: isSel ? '✓' : '+', attr: { style: `font-weight: bold; color: ${isSel ? 'var(--interactive-accent)' : 'var(--text-muted)'};` } });

                item.createDiv({ text: c.desc, attr: { style: 'font-size: 0.78rem; color: var(--text-muted); line-height: 1.3;' } });

                const toggleRole = () => {
                    if (isSel && this.selectedRoles.size > 1) this.selectedRoles.delete(c.id);
                    else this.selectedRoles.add(c.id);
                    renderRoleGrid();
                };

                item.addEventListener('click', toggleRole);
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRole();
                    }
                });
            });
        };
        renderRoleGrid();

        const actions = contentEl.createDiv({ attr: { style: 'display: flex; justify-content: flex-end; gap: 10px;' } });
        const cancelBtn = actions.createEl('button', { text: 'Cancel', attr: { style: 'padding: 8px 16px; border-radius: 8px; cursor: pointer;' } });
        cancelBtn.addEventListener('click', () => this.close());

        const saveBtn = actions.createEl('button', {
            text: '💾 Save Member Roles',
            attr: {
                role: 'button',
                tabindex: '0',
                style: 'padding: 8px 20px; border-radius: 8px; background: var(--interactive-accent); color: var(--text-on-accent); font-weight: 700; border: none; cursor: pointer;'
            }
        });

        const triggerSave = async () => {
            const newName = nameInput.value.trim();
            if (!name) {
                new Notice('Name cannot be empty.');
                return;
            }

            // Check if name changed and conflicts
            if (newName.toLowerCase() !== this.member.name.toLowerCase() &&
                this.plugin.settings.teamMembers.some(m => m.name.toLowerCase() === newName.toLowerCase())) {
                new Notice('Another team member already has this name.');
                return;
            }

            const rolesArr = Array.from(this.selectedRoles);
            const computed = computeRolesDisplay(rolesArr);

            // Update member object in settings array
            const idx = this.plugin.settings.teamMembers.findIndex(m => m.name === this.member.name);
            if (idx !== -1) {
                this.plugin.settings.teamMembers[idx] = {
                    name: newName,
                    roles: rolesArr,
                    classTitle: computed.classTitle,
                    icon: computed.icon,
                    color: colorInput.value
                };
            }

            await this.plugin.saveSettings();
            new Notice(`Updated ${computed.icon} ${newName}'s roles successfully!`);
            if (this.onSave) this.onSave();
            this.close();
        };

        saveBtn.addEventListener('click', triggerSave);
        saveBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerSave();
            }
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
