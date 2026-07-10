/**
 * @file src/services/CardService.js
 * @description Card badge decorator, tag parsing engine, and safe markdown vault modifier for quick quest assignment.
 * @author Antigravity Engineering
 */

import { Notice } from 'obsidian';
import { cleanRawTagId, getPureCardTitle, computeRolesDisplay } from '../constants/defaults.js';

export class CardService {
    /**
     * @param {object} plugin - Reference to the main QuestwallPlugin instance
     */
    constructor(plugin) {
        this.plugin = plugin;
    }

    /**
     * Synchronizes and decorates card badges across an entire Kanban board.
     * @param {HTMLElement} board
     */
    syncBoardBadges(board) {
        if (!board) return;
        const theme = (this.plugin.settings && this.plugin.settings.theme) || 'sleek';
        const isGuild = theme === 'guild';

        board.querySelectorAll('.kanban-plugin__item').forEach(item => {
            const titleEl = item.querySelector('.kanban-plugin__item-title');
            if (!titleEl) return;

            // 1. Process Assignee / Team Member tags and internal links
            const tagsAndLinks = item.querySelectorAll('a.tag, a.internal-link[href*="@"], a.internal-link[data-href*="@"], span.cm-hashtag, .qw-badge-assignee');
            tagsAndLinks.forEach(el => {
                const raw = el.dataset.qwCleanTag || el.getAttribute('data-qw-assignee') || el.getAttribute('href') || el.getAttribute('data-href') || el.innerText || '';
                const clean = cleanRawTagId(raw);
                if (!clean) return;

                if (['bug', 'feature', 'task', 'P1', 'P2', 'P3', 'security', 'tech-debt', 's-rank', 'a-rank', 'b-rank', 'monster', 'artifact', 'commission'].includes(clean.toLowerCase())) {
                    return; // Handled by priority/type processors
                }

                const isExplicitAssignee = raw.startsWith('@') || raw.startsWith('#assignee/') || raw.startsWith('[[@') || el.classList.contains('qw-badge-assignee');
                let member = null;
                if (this.plugin.settings && Array.isArray(this.plugin.settings.teamMembers)) {
                    member = this.plugin.settings.teamMembers.find(m => m.name.toLowerCase() === clean.toLowerCase());
                }
                if (!isExplicitAssignee && !member) return;

                if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(clean)) {
                    const icon = (isGuild && member) ? (member.icon || '👤') : '👤';
                    const label = member ? member.name : clean;
                    
                    let rolesStr = '';
                    if (member && member.roles && member.roles.length) {
                        const computed = computeRolesDisplay(member.roles, isGuild);
                        rolesStr = ` • ${computed.classTitle}`;
                    } else if (member && member.classTitle) {
                        rolesStr = ` • ${member.classTitle}`;
                    }

                    el.textContent = `${icon} ${label}${rolesStr}`;
                    el.classList.add('qw-card-badge', 'qw-badge-assignee');
                    el.setAttribute('data-qw-assignee', clean);
                    el.dataset.qwCleanTag = clean;

                    if (member && member.color) {
                        el.style.border = `1.5px solid ${member.color}`;
                    }
                }
            });

            // 2. Process Priority Rankings (#P1, #P2, #P3) - NO parentheses mapping under Guild!
            item.querySelectorAll('a.tag, span.cm-hashtag, .qw-badge-priority').forEach(el => {
                const text = (el.dataset.qwCleanTag || el.innerText || '').trim();
                if (text.match(/^(?:#(?:priority\/)?)?P1$|^S-Rank$|^🔴 P1(?:\s*\(High\))?$/i)) {
                    el.textContent = isGuild ? '🐉 S-Rank' : '🔴 P1 (High)';
                    el.classList.add('qw-card-badge', 'qw-badge-priority');
                    el.style.background = isGuild ? 'linear-gradient(135deg, #7f1d1d, #450a0a)' : 'rgba(239, 68, 68, 0.18)';
                    el.style.border = isGuild ? '1.5px solid #f87171' : '1px solid rgba(239, 68, 68, 0.4)';
                    el.style.color = isGuild ? '#fca5a5' : '#ef4444';
                    el.dataset.qwCleanTag = 'P1';
                } else if (text.match(/^(?:#(?:priority\/)?)?P2$|^A-Rank$|^🟡 P2(?:\s*\(Med\))?$/i)) {
                    el.textContent = isGuild ? '⚔️ A-Rank' : '🟡 P2 (Med)';
                    el.classList.add('qw-card-badge', 'qw-badge-priority');
                    el.style.background = isGuild ? 'linear-gradient(135deg, #78350f, #451a03)' : 'rgba(245, 158, 11, 0.18)';
                    el.style.border = isGuild ? '1.5px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.4)';
                    el.style.color = isGuild ? '#fde047' : '#f59e0b';
                    el.dataset.qwCleanTag = 'P2';
                } else if (text.match(/^(?:#(?:priority\/)?)?P3$|^B-Rank$|^🟢 P3(?:\s*\(Low\))?$/i)) {
                    el.textContent = isGuild ? '🌱 B-Rank' : '🟢 P3 (Low)';
                    el.classList.add('qw-card-badge', 'qw-badge-priority');
                    el.style.background = isGuild ? 'linear-gradient(135deg, #14532d, #052e16)' : 'rgba(16, 185, 129, 0.18)';
                    el.style.border = isGuild ? '1.5px solid #4ade80' : '1px solid rgba(16, 185, 129, 0.4)';
                    el.style.color = isGuild ? '#86efac' : '#10b981';
                    el.dataset.qwCleanTag = 'P3';
                }
            });

            // 3. Process Quest / Task Types (#bug, #feature, #task) - NO parentheses mapping under Guild!
            item.querySelectorAll('a.tag, span.cm-hashtag, .qw-badge-type').forEach(el => {
                const text = (el.dataset.qwCleanTag || el.innerText || '').trim();
                if (text.match(/^(?:#(?:type\/)?)?bug$|^Monster$|^🐞 Bug$/i)) {
                    el.textContent = isGuild ? '🕷️ Monster' : '🐞 Bug';
                    el.classList.add('qw-card-badge', 'qw-badge-type');
                    el.style.background = isGuild ? 'linear-gradient(135deg, #581c87, #2e1065)' : 'rgba(168, 85, 247, 0.18)';
                    el.style.border = isGuild ? '1.5px solid #c084fc' : '1px solid rgba(168, 85, 247, 0.4)';
                    el.style.color = isGuild ? '#e9d5ff' : '#a855f7';
                    el.dataset.qwCleanTag = 'bug';
                } else if (text.match(/^(?:#(?:type\/)?)?feature$|^Artifact$|^✨ Feature$/i)) {
                    el.textContent = isGuild ? '💎 Artifact' : '✨ Feature';
                    el.classList.add('qw-card-badge', 'qw-badge-type');
                    el.style.background = isGuild ? 'linear-gradient(135deg, #1e3a8a, #172554)' : 'rgba(59, 130, 246, 0.18)';
                    el.style.border = isGuild ? '1.5px solid #60a5fa' : '1px solid rgba(59, 130, 246, 0.4)';
                    el.style.color = isGuild ? '#bfdbfe' : '#3b82f6';
                    el.dataset.qwCleanTag = 'feature';
                } else if (text.match(/^(?:#(?:type\/)?)?task$|^Commission$|^📋 Task$/i)) {
                    el.textContent = isGuild ? '📜 Commission' : '📋 Task';
                    el.classList.add('qw-card-badge', 'qw-badge-type');
                    el.style.background = isGuild ? 'linear-gradient(135deg, #334155, #0f172a)' : 'rgba(100, 116, 139, 0.18)';
                    el.style.border = isGuild ? '1.5px solid #94a3b8' : '1px solid rgba(100, 116, 139, 0.4)';
                    el.style.color = isGuild ? '#e2e8f0' : '#64748b';
                    el.dataset.qwCleanTag = 'task';
                }
            });
        });
    }

    /**
     * Injects quick-assign lightning button (`⚡`) onto cards and connects safe note tag updating.
     * @param {HTMLElement} board
     */
    injectQuickAssignTriggers(board) {
        if (!board) return;

        board.querySelectorAll('.kanban-plugin__item-content-wrapper').forEach(cardWrapper => {
            if (cardWrapper.querySelector('.qw-quick-assign-trigger')) return;

            const trigger = document.createElement('span');
            trigger.className = 'qw-quick-assign-trigger';
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('aria-label', 'Quick Assign Quest Tags');
            trigger.textContent = '⚡';
            trigger.title = 'Quest Assign & Tag';

            const openModal = (e) => {
                if (e) e.stopPropagation();
                const cardItem = cardWrapper.closest('.kanban-plugin__item');
                const titleEl = cardWrapper.querySelector('.kanban-plugin__item-title') || cardWrapper;

                const clone = titleEl.cloneNode(true);
                clone.querySelectorAll('.qw-card-badge, a.tag, [class*="tag"], .qw-quick-assign-trigger, .kanban-plugin__item-tags, button, a.internal-link[href*="@"]').forEach(el => el.remove());
                const cleanTitle = getPureCardTitle(clone.textContent);

                import('../ui/Modals.js').then(({ QuickAssignModal }) => {
                    new QuickAssignModal(this.plugin.app, this.plugin.settings, cardItem, cleanTitle, this.plugin, async (updatedTags) => {
                        await this.updateCardTagsInFile(cleanTitle, updatedTags, board);
                    }).open();
                });
            };

            trigger.addEventListener('click', openModal);
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(e);
                }
            });

            cardWrapper.appendChild(trigger);
        });
    }

    /**
     * Safely locates the card line inside the active markdown note and appends updated tags.
     * @param {string} cleanTitle
     * @param {string} updatedTags
     * @param {HTMLElement} board
     */
    async updateCardTagsInFile(cleanTitle, updatedTags, board) {
        let targetFile = null;
        const leaves = this.plugin.app.workspace.getLeavesOfType('markdown');
        for (const leaf of leaves) {
            if (leaf.view && leaf.view.contentEl && leaf.view.contentEl.contains(board)) {
                targetFile = leaf.view.file;
                break;
            }
        }
        if (!targetFile) targetFile = this.plugin.app.workspace.getActiveFile();
        if (!targetFile || targetFile.extension !== 'md') {
            new Notice('Cannot update tags: Could not locate backing markdown note.');
            return;
        }

        let content = await this.plugin.app.vault.read(targetFile);
        const lines = content.split('\n');
        let updated = false;
        const targetPure = getPureCardTitle(cleanTitle).toLowerCase();

        const cleanLineTokens = (lineContent) => {
            return lineContent
                .replace(/#(?:assignee\/|priority\/|type\/)?(?:P1|P2|P3|bug|feature|task)\b/gi, '')
                .replace(/\[\[@[^\]]+\]\]/gi, '')
                .replace(/@[A-Za-z0-9_-]+/g, '')
                .replace(/\b(?:S-Rank|A-Rank|B-Rank|Monster|Artifact|Commission)\b/gi, '')
                .replace(/\s+/g, ' ').trim();
        };

        // Pass 1: Look for exact or regex boundary matches of the card title
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const prefixMatch = line.match(/^\s*-\s*(\[[ xX]\]\s*)?/);
            if (prefixMatch) {
                const prefix = prefixMatch[0];
                const lineContent = line.substring(prefix.length);
                const linePure = getPureCardTitle(lineContent).toLowerCase();

                if (linePure === targetPure || (targetPure.length > 0 && new RegExp('^([\\s\\[\\(]*)' + targetPure.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([\\s\\]\\)]*)$', 'i').test(linePure))) {
                    const preservedContent = cleanLineTokens(lineContent);
                    lines[i] = `${prefix}${preservedContent} ${updatedTags}`.replace(/\s+/g, ' ').trim();
                    updated = true;
                    break;
                }
            }
        }

        // Pass 2: Fallback to substring inclusion if exact comparison didn't match
        if (!updated && targetPure.length >= 3) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const prefixMatch = line.match(/^\s*-\s*(\[[ xX]\]\s*)?/);
                if (prefixMatch) {
                    const prefix = prefixMatch[0];
                    const lineContent = line.substring(prefix.length);
                    const linePure = getPureCardTitle(lineContent).toLowerCase();
                    if (linePure.includes(targetPure)) {
                        const preservedContent = cleanLineTokens(lineContent);
                        lines[i] = `${prefix}${preservedContent} ${updatedTags}`.replace(/\s+/g, ' ').trim();
                        updated = true;
                        break;
                    }
                }
            }
        }

        if (updated) {
            await this.plugin.app.vault.modify(targetFile, lines.join('\n'));
            const isGuild = (this.plugin.settings && this.plugin.settings.theme === 'guild');
            new Notice(isGuild ? 'Quest updated on the Guild Board!' : 'Task updated on Kanban board!');
            if (this.plugin.filterService) {
                setTimeout(() => this.plugin.filterService.applyFiltersAndSort(board), 350);
            }
        } else {
            new Notice('Could not find exact card line in active file.');
        }
    }
}
