/**
 * @file src/ui/Modals.js
 * @description Interactive Obsidian Modals for quick quest assignment, multi-role editing, and agile workflow setup.
 * @author Antigravity Engineering
 */

import { Modal, Notice } from 'obsidian';
import { ADVENTURER_CLASSES, computeRolesDisplay, LANE_COLORS, RESERVED_TAGS } from '../constants/defaults.js';

export class QuickAssignModal extends Modal {
    /**
     * @param {object} app
     * @param {object} settings
     * @param {HTMLElement} cardItem
     * @param {string} cleanTitle
     * @param {function} onSave
     */
    constructor(app, settings, cardItem, cleanTitle, plugin, onSave) {
        super(app);
        this.settings = settings || {};
        this.cardItem = cardItem;
        this.cleanTitle = cleanTitle || 'Untitled Quest';
        this.plugin = plugin;
        if (typeof plugin === 'function' && !onSave) {
            this.onSave = plugin;
            this.plugin = null;
        } else {
            this.onSave = onSave;
        }

        this.selectedAssignee = null;
        if (cardItem) {
            const assigneeTags = cardItem.querySelectorAll('.qw-badge-assignee, a.tag, a.internal-link[href*="@"], a.internal-link[data-href*="@"], span.cm-hashtag');
            assigneeTags.forEach(t => {
                const raw = t.dataset.qwCleanTag || t.getAttribute('href') || t.getAttribute('data-href') || t.innerText || '';
                const clean = raw.replace(/^[#@]+/, '').replace(/^(?:assignee\/)/i, '').trim();
                if (clean && !RESERVED_TAGS.has(clean) && !RESERVED_TAGS.has(clean.toLowerCase())) {
                    if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(clean)) {
                        this.selectedAssignee = `[[@${clean}]]`;
                    }
                }
            });
        }

        this.selectedPriority = null;
        this.selectedType = null;

        if (cardItem) {
            cardItem.querySelectorAll('.qw-badge-priority, a.tag, span.cm-hashtag').forEach(t => {
                const raw = (t.dataset.qwCleanTag || t.innerText || '').toUpperCase().replace(/^#/, '');
                if (raw === 'P1' || raw.includes('S-RANK') || raw.includes('HIGH')) this.selectedPriority = '#P1';
                else if (raw === 'P2' || raw.includes('A-RANK') || raw.includes('MEDIUM')) this.selectedPriority = '#P2';
                else if (raw === 'P3' || raw.includes('B-RANK') || raw.includes('LOW')) this.selectedPriority = '#P3';
            });

            cardItem.querySelectorAll('.qw-badge-type, a.tag, span.cm-hashtag').forEach(t => {
                const raw = (t.dataset.qwCleanTag || t.innerText || '').toLowerCase().replace(/^#/, '');
                if (raw === 'bug' || raw.includes('monster')) this.selectedType = '#bug';
                else if (raw === 'feature' || raw.includes('artifact')) this.selectedType = '#feature';
                else if (raw === 'task' || raw.includes('commission')) this.selectedType = '#task';
            });
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

        contentEl.createEl('h4', { text: isGuild ? '🗡️ Select Party Member' : 'Assignee / Team Member', attr: { style: 'margin-bottom: 8px; font-size: 0.92rem;' } });
        const assigneeContainer = contentEl.createDiv({ attr: { style: 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px;' } });

        const members = Array.isArray(this.settings.teamMembers) ? this.settings.teamMembers.filter(m => m.name && m.name.trim()) : [];
        const renderAssigneeButtons = () => {
            assigneeContainer.empty();
            members.forEach(m => {
                const name = m.name.trim();
                const icon = isGuild ? (m.icon || '👤') : '👤';
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

            addWriteInBtn.addEventListener('click', async () => {
                const name = window.prompt('Enter new person\'s name:');
                if (name && name.trim()) {
                    const cleanName = name.trim();
                    if (!members.some(m => m.name.toLowerCase() === cleanName.toLowerCase())) {
                        members.push({ name: cleanName, icon: '👤', classTitle: 'Team Member', color: '#3b82f6' });
                        if (this.settings && Array.isArray(this.settings.teamMembers)) {
                            this.settings.teamMembers.push({ name: cleanName, icon: '👤', classTitle: 'Team Member', color: '#3b82f6' });
                            if (this.plugin && typeof this.plugin.saveSettings === 'function') {
                                await this.plugin.saveSettings();
                            }
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
            { id: '#P1', label: '🐉 S-Rank' },
            { id: '#P2', label: '⚔️ A-Rank' },
            { id: '#P3', label: '🌱 B-Rank' }
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
                            transition: all 0.2s ease;
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

        contentEl.createEl('h4', { text: isGuild ? '📜 Contract / Quest Type' : 'Task Type', attr: { style: 'margin-bottom: 8px; font-size: 0.92rem;' } });
        const typeContainer = contentEl.createDiv({ attr: { style: 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px;' } });
        const typeOptions = isGuild ? [
            { id: '#bug', label: '🕷️ Monster' },
            { id: '#feature', label: '💎 Artifact' },
            { id: '#task', label: '📜 Commission' }
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
                            transition: all 0.2s ease;
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

        const previewContainer = contentEl.createDiv({ attr: { style: 'padding: 12px 14px; border-radius: 8px; background: var(--background-secondary); border: 1px solid var(--background-modifier-border); margin-bottom: 20px; font-size: 0.84rem;' } });
        this.previewEl = previewContainer.createDiv();
        this.updatePreview();

        const actions = contentEl.createDiv({ attr: { style: 'display: flex; justify-content: flex-end; gap: 10px;' } });
        const cancelBtn = actions.createEl('button', { text: 'Cancel', attr: { style: 'padding: 8px 16px; border-radius: 8px; cursor: pointer;' } });
        cancelBtn.addEventListener('click', () => this.close());

        const saveBtn = actions.createEl('button', {
            text: isGuild ? '⚡ Dispatch Quest' : '💾 Save Changes',
            attr: {
                role: 'button',
                tabindex: '0',
                style: 'padding: 8px 20px; border-radius: 8px; background: var(--interactive-accent); color: var(--text-on-accent); font-weight: 700; border: none; cursor: pointer;'
            }
        });

        const triggerSave = () => {
            const tags = [this.selectedAssignee, this.selectedPriority, this.selectedType].filter(Boolean).join(' ');
            if (this.onSave) this.onSave(tags);
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
        this.previewEl.empty();
        const tags = [this.selectedAssignee, this.selectedPriority, this.selectedType].filter(Boolean).join(' ');
        
        const labelEl = this.previewEl.createDiv({ attr: { style: 'font-weight: bold; margin-bottom: 4px;' } });
        labelEl.textContent = 'Card Note Line:';
        
        const lineEl = this.previewEl.createDiv();
        lineEl.createSpan({ text: `- [ ] ${this.cleanTitle} ` });
        if (tags) {
            lineEl.createSpan({ text: tags, attr: { style: 'color: var(--interactive-accent); font-weight: bold;' } });
        }
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

        const theme = (this.plugin.settings && this.plugin.settings.theme) || 'sleek';
        const isGuild = theme === 'guild';

        contentEl.createEl('h3', { text: `✏️ Edit Team Member: "${this.member.name}"`, attr: { style: 'margin-top: 0; margin-bottom: 18px; font-weight: 700;' } });

        // Name & Color
        const topRow = contentEl.createDiv({ attr: { style: 'display: flex; gap: 12px; align-items: center; margin-bottom: 20px;' } });
        topRow.createEl('label', { text: 'Name:', attr: { style: 'font-weight: 600;' } });
        const nameInput = topRow.createEl('input', { type: 'text', value: this.member.name, attr: { style: 'flex: 1; padding: 8px 12px; border-radius: 8px;' } });
        topRow.createEl('label', { text: 'Badge Color:', attr: { style: 'font-weight: 600; margin-left: 12px;' } });
        const colorInput = topRow.createEl('input', { type: 'color', value: this.member.color || '#3b82f6', attr: { style: 'width: 46px; height: 38px; padding: 0; border: none; cursor: pointer; border-radius: 6px;' } });

        // Role Selector strictly adapting to Default (pure corporate) vs Guild
        contentEl.createEl('div', { text: isGuild ? 'Select Adventurer Classes / Roles:' : 'Select Engineering & Product Roles:', attr: { style: 'font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; color: var(--text-normal);' } });
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
                top.createDiv({ text: isGuild ? c.label : c.corpLabel, attr: { style: `font-weight: 700; font-size: 0.86rem; color: ${isSel ? 'var(--interactive-accent)' : 'var(--text-normal)'};` } });
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
            if (!newName) {
                new Notice('Name cannot be empty.');
                return;
            }

            if (newName.toLowerCase() !== this.member.name.toLowerCase() &&
                this.plugin.settings.teamMembers.some(m => m.name.toLowerCase() === newName.toLowerCase())) {
                new Notice('Another team member already has this name.');
                return;
            }

            const rolesArr = Array.from(this.selectedRoles);
            const computed = computeRolesDisplay(rolesArr, isGuild);

            const idx = this.plugin.settings.teamMembers.findIndex(m => m.name === this.member.name);
            if (idx === -1) {
                new Notice('Could not locate team member to update.');
                return;
            }

            this.plugin.settings.teamMembers[idx] = {
                name: newName,
                roles: rolesArr,
                classTitle: computed.classTitle,
                icon: computed.icon,
                color: colorInput.value
            };

            await this.plugin.saveSettings();
            new Notice(`Roles updated for ${newName}!`);
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

        setTimeout(() => saveBtn.focus(), 50);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


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
        contentEl.style.padding = '22px';
        contentEl.style.maxWidth = '420px';

        contentEl.createEl('h3', { text: '🎨 Change Column Lane Color', attr: { style: 'margin-top: 0; margin-bottom: 18px; font-weight: 700;' } });
        contentEl.createEl('p', { text: 'Select a subtle background and border tint for this Kanban column:', attr: { style: 'font-size: 0.86rem; color: var(--text-muted); margin-bottom: 16px;' } });

        const grid = contentEl.createDiv({ attr: { style: 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;' } });

        Object.entries(LANE_COLORS).forEach(([key, color]) => {
            const btn = grid.createDiv({
                attr: {
                    role: 'button',
                    tabindex: '0',
                    style: `
                        padding: 10px 14px;
                        border-radius: 8px;
                        border: 1.5px solid ${color.border};
                        background: ${color.bg};
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.88rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        transition: all 0.2s ease;
                    `
                }
            });
            btn.createSpan({ text: color.label });
            btn.createSpan({ attr: { style: `width: 16px; height: 16px; border-radius: 50%; background: ${color.border}; display: inline-block;` } });

            const chooseColor = () => {
                if (this.onSelect) this.onSelect(key);
                this.close();
            };
            btn.addEventListener('click', chooseColor);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    chooseColor();
                }
            });
        });

        const resetBtn = grid.createDiv({
            attr: {
                role: 'button',
                tabindex: '0',
                style: `
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1.5px dashed var(--background-modifier-border);
                    background: transparent;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.88rem;
                    text-align: center;
                    color: var(--text-muted);
                    transition: all 0.2s ease;
                `
            }
        });
        resetBtn.textContent = '✖ Reset to Default Color';
        const chooseReset = () => {
            if (this.onSelect) this.onSelect('reset');
            this.close();
        };
        resetBtn.addEventListener('click', chooseReset);
        resetBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                chooseReset();
            }
        });

        const cancelContainer = contentEl.createDiv({ attr: { style: 'display: flex; justify-content: flex-end;' } });
        const cancelBtn = cancelContainer.createEl('button', { text: 'Cancel', attr: { style: 'padding: 6px 14px; border-radius: 6px; cursor: pointer;' } });
        cancelBtn.addEventListener('click', () => this.close());
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
