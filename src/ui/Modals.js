/**
 * @file src/ui/Modals.js
 * @description Accessible, WCAG 2.1 AA compliant modal dialogs for color tinting and quest assignment.
 * @author Antigravity Engineering
 */

import { Modal } from 'obsidian';
import { LANE_COLORS, ADVENTURER_CLASSES } from '../constants/defaults.js';

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

        // Reset option
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

        // Focus first button for keyboard accessibility
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

        // Discover initial tags
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

        const theme = this.settings.theme || 'guild';
        const isGuild = theme === 'guild';

        contentEl.createEl('h3', { text: `⚡ Quick Assign Quest: "${this.cleanTitle}"`, attr: { style: 'margin-top: 0; margin-bottom: 18px; font-weight: 700;' } });

        // 1. Assignee / Team Member
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

            // Add Write-in Member button
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
                        members.push({ name: cleanName, icon: '👤', classTitle: 'Adventurer', color: '#3b82f6' });
                        if (this.settings && Array.isArray(this.settings.teamMembers)) {
                            this.settings.teamMembers.push({ name: cleanName, icon: '👤', classTitle: 'Adventurer', color: '#3b82f6' });
                        }
                    }
                    this.selectedAssignee = `[[@${cleanName}]]`;
                    renderAssigneeButtons();
                    this.updatePreview();
                }
            });
        };
        renderAssigneeButtons();

        // 2. Priority / Threat Rank
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

        // 3. Quest Type
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

        // 4. Live Preview Box
        this.previewEl = contentEl.createDiv({ attr: { style: 'padding: 12px 16px; border-radius: 10px; background: var(--background-primary-alt); border: 1px solid var(--background-modifier-border); margin-bottom: 20px; font-size: 0.9rem; font-family: monospace;' } });
        this.updatePreview();

        // 5. Actions
        const actions = contentEl.createDiv({ attr: { style: 'display: flex; justify-content: flex-end; gap: 10px;' } });
        const cancelBtn = actions.createEl('button', { text: 'Cancel', attr: { style: 'padding: 8px 16px; border-radius: 8px; cursor: pointer;' } });
        cancelBtn.addEventListener('click', () => this.close());

        const saveBtn = actions.createEl('button', {
            text: '💾 Save Quest Assignment',
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
        this.previewEl.innerHTML = `<strong>Final Card Note Line:</strong><br/>- [ ] ${this.cleanTitle} <span style="color: var(--interactive-accent); font-weight: bold;">${tags}</span>`;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
