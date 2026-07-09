/**
 * @file src/services/FilterService.js
 * @description Manages interactive board toolbars, multi-dimensional filtering, focus mode dimming, and comprehensive card sorting.
 * @author Antigravity Engineering
 */

import { cleanRawTagId } from '../constants/defaults.js';

export class FilterService {
    /**
     * @param {object} plugin - Reference to the main QuestwallPlugin instance
     */
    constructor(plugin) {
        this.plugin = plugin;
        this.activeFilters = {
            assignees: new Set(),
            priorities: new Set(),
            types: new Set(),
            search: '',
            sortBy: 'default'
        };
    }

    /**
     * Scans for active Kanban boards and injects toolbars if not already present.
     */
    scanAndInjectToolbars() {
        if (!this.plugin || !this.plugin.app) return;
        this.plugin.themeService.applyBodyTheme();

        const kanbanBoards = document.querySelectorAll('.kanban-plugin__board');
        kanbanBoards.forEach(board => {
            const container = board.parentElement;
            if (!container) return;

            if (!container.querySelector('.questwall-toolbar')) {
                this.injectToolbar(container, board);
            }

            // Decorate lanes and cards
            if (this.plugin.cardService) {
                this.plugin.cardService.injectQuickAssignTriggers(board);
                this.plugin.cardService.syncBoardBadges(board);
            }
            if (this.plugin.themeService) {
                this.plugin.themeService.applyLaneColorsToBoard(board);
            }
        });
    }

    /**
     * Builds and injects the interactive filtering and comprehensive sorting toolbar above a Kanban board.
     * @param {HTMLElement} container
     * @param {HTMLElement} board
     */
    injectToolbar(container, board) {
        if (!container || !board || container.querySelector('.questwall-toolbar')) return;

        const toolbar = document.createElement('div');
        toolbar.className = 'questwall-toolbar';
        const theme = (this.plugin.settings && this.plugin.settings.theme) || 'sleek';
        const isGuild = theme === 'guild';

        const labels = {
            assignee: isGuild ? '🗡️ Party:' : 'Team:',
            priority: isGuild ? '🔥 Threat:' : 'Priority:',
            type: isGuild ? '📜 Contract:' : 'Type:',
            sort: isGuild ? '⚖️ Order By:' : 'Sort By:'
        };

        // Helper to create sections
        const createDivider = () => {
            const div = document.createElement('div');
            div.className = 'questwall-toolbar-divider';
            return div;
        };

        // 1. Assignees / Team Members Section
        const assigneesSec = document.createElement('div');
        assigneesSec.className = 'questwall-toolbar-section';
        const assigneeLabel = document.createElement('span');
        assigneeLabel.className = 'questwall-toolbar-label';
        assigneeLabel.innerText = labels.assignee;
        assigneesSec.appendChild(assigneeLabel);

        const discoveredNames = new Set();
        board.querySelectorAll('.kanban-plugin__item').forEach(item => {
            const tags = item.querySelectorAll('a.tag, a.internal-link[href*="@"], a.internal-link[data-href*="@"], span.cm-hashtag');
            tags.forEach(t => {
                const raw = t.dataset.qwCleanTag || t.getAttribute('href') || t.getAttribute('data-href') || t.innerText || '';
                const clean = cleanRawTagId(raw);
                if (clean && !['bug', 'feature', 'task', 'P1', 'P2', 'P3', 'security', 'tech-debt'].includes(clean)) {
                    if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(clean)) {
                        discoveredNames.add(clean);
                    }
                }
            });
        });

        const allMembers = [];
        if (this.plugin.settings && Array.isArray(this.plugin.settings.teamMembers)) {
            this.plugin.settings.teamMembers.forEach(m => {
                if (m.name && m.name.trim()) allMembers.push(m);
            });
        }
        discoveredNames.forEach(dName => {
            if (!allMembers.some(m => m.name.toLowerCase() === dName.toLowerCase())) {
                allMembers.push({ name: dName, icon: '👤', classTitle: 'Team Member', color: '#3b82f6' });
            }
        });

        allMembers.forEach(member => {
            const name = member.name.trim();
            const icon = member.icon || '👤';
            const color = member.color || '#3b82f6';
            const rgb = this.plugin.themeService.hexToRgb(color);

            const btn = document.createElement('span');
            btn.className = 'questwall-filter-btn qw-badge-assignee';
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.dataset.type = 'assignee';
            btn.dataset.value = name;
            btn.innerHTML = `${icon} ${name}`;
            btn.style.border = `1.5px solid ${color}`;
            btn.style.backgroundColor = `rgba(${rgb}, 0.15)`;
            btn.style.borderRadius = '16px';
            btn.style.padding = '3px 12px';
            btn.style.fontWeight = '600';
            btn.style.fontSize = '0.82rem';

            if (this.activeFilters.assignees.has(name)) {
                btn.classList.add('is-active');
                btn.style.backgroundColor = `rgba(${rgb}, 0.45)`;
                btn.style.boxShadow = `0 0 10px rgba(${rgb}, 0.4)`;
            }

            const toggleAssignee = () => {
                if (this.activeFilters.assignees.has(name)) {
                    this.activeFilters.assignees.delete(name);
                    btn.classList.remove('is-active');
                    btn.style.backgroundColor = `rgba(${rgb}, 0.15)`;
                    btn.style.boxShadow = 'none';
                } else {
                    this.activeFilters.assignees.add(name);
                    btn.classList.add('is-active');
                    btn.style.backgroundColor = `rgba(${rgb}, 0.45)`;
                    btn.style.boxShadow = `0 0 10px rgba(${rgb}, 0.4)`;
                }
                this.applyFiltersAndSort(board);
            };

            btn.addEventListener('click', toggleAssignee);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAssignee();
                }
            });

            assigneesSec.appendChild(btn);
        });
        toolbar.appendChild(assigneesSec);
        toolbar.appendChild(createDivider());

        // 2. Priority / Threat Rank Section
        const prioritySec = document.createElement('div');
        prioritySec.className = 'questwall-toolbar-section';
        const priorityLabel = document.createElement('span');
        priorityLabel.className = 'questwall-toolbar-label';
        priorityLabel.innerText = labels.priority;
        prioritySec.appendChild(priorityLabel);

        const priorities = isGuild ? [
            { id: 'P1', label: '🐉 S-Rank (#P1)', color: '#f87171' },
            { id: 'P2', label: '⚔️ A-Rank (#P2)', color: '#fbbf24' },
            { id: 'P3', label: '🌱 B-Rank (#P3)', color: '#4ade80' }
        ] : [
            { id: 'P1', label: '🔴 P1 (High)', color: '#ef4444' },
            { id: 'P2', label: '🟡 P2 (Med)', color: '#f59e0b' },
            { id: 'P3', label: '🟢 P3 (Low)', color: '#10b981' }
        ];

        priorities.forEach(p => {
            const btn = document.createElement('span');
            btn.className = 'questwall-filter-btn qw-badge-priority';
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.dataset.type = 'priority';
            btn.dataset.value = p.id;
            btn.innerHTML = p.label;

            if (this.activeFilters.priorities.has(p.id)) {
                btn.classList.add('is-active');
            }

            const togglePrio = () => {
                if (this.activeFilters.priorities.has(p.id)) {
                    this.activeFilters.priorities.delete(p.id);
                    btn.classList.remove('is-active');
                } else {
                    this.activeFilters.priorities.add(p.id);
                    btn.classList.add('is-active');
                }
                this.applyFiltersAndSort(board);
            };

            btn.addEventListener('click', togglePrio);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePrio();
                }
            });

            prioritySec.appendChild(btn);
        });
        toolbar.appendChild(prioritySec);
        toolbar.appendChild(createDivider());

        // 3. Quest / Task Types Section
        const typeSec = document.createElement('div');
        typeSec.className = 'questwall-toolbar-section';
        const typeLabel = document.createElement('span');
        typeLabel.className = 'questwall-toolbar-label';
        typeLabel.innerText = labels.type;
        typeSec.appendChild(typeLabel);

        const types = isGuild ? [
            { id: 'bug', label: '🕷️ Monster (#bug)' },
            { id: 'feature', label: '💎 Artifact (#feature)' },
            { id: 'task', label: '📜 Commission (#task)' }
        ] : [
            { id: 'bug', label: '🐞 Bug' },
            { id: 'feature', label: '✨ Feature' },
            { id: 'task', label: '📋 Task' }
        ];

        types.forEach(t => {
            const btn = document.createElement('span');
            btn.className = 'questwall-filter-btn qw-badge-type';
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.dataset.type = 'type';
            btn.dataset.value = t.id;
            btn.innerHTML = t.label;

            if (this.activeFilters.types.has(t.id)) {
                btn.classList.add('is-active');
            }

            const toggleType = () => {
                if (this.activeFilters.types.has(t.id)) {
                    this.activeFilters.types.delete(t.id);
                    btn.classList.remove('is-active');
                } else {
                    this.activeFilters.types.add(t.id);
                    btn.classList.add('is-active');
                }
                this.applyFiltersAndSort(board);
            };

            btn.addEventListener('click', toggleType);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleType();
                }
            });

            typeSec.appendChild(btn);
        });
        toolbar.appendChild(typeSec);
        toolbar.appendChild(createDivider());

        // 4. Search & Comprehensive Sorting Controls
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'questwall-search-input';
        searchInput.placeholder = isGuild ? '🔍 Search Quests...' : '🔍 Search board tasks...';
        searchInput.value = this.activeFilters.search;
        searchInput.addEventListener('input', (e) => {
            this.activeFilters.search = e.target.value.toLowerCase().trim();
            this.applyFiltersAndSort(board);
        });
        toolbar.appendChild(searchInput);

        const sortSec = document.createElement('div');
        sortSec.className = 'questwall-toolbar-section';
        const sortLabel = document.createElement('span');
        sortLabel.className = 'questwall-toolbar-label';
        sortLabel.innerText = labels.sort;
        sortSec.appendChild(sortLabel);

        const sortSelect = document.createElement('select');
        sortSelect.className = 'questwall-sort-select';
        sortSelect.style.padding = '5px 10px';
        sortSelect.style.borderRadius = '8px';
        sortSelect.style.border = '1px solid var(--background-modifier-border)';
        sortSelect.style.fontWeight = '600';

        const sortOptions = [
            { value: 'default', label: 'Default (Manual Drag & Drop)' },
            { value: 'priority-desc', label: isGuild ? 'Threat: Highest First (S → B)' : 'Priority: Highest First (P1 → P3)' },
            { value: 'priority-asc', label: isGuild ? 'Threat: Lowest First (B → S)' : 'Priority: Lowest First (P3 → P1)' },
            { value: 'assignee', label: 'Assignee / Team Member (A-Z)' },
            { value: 'type', label: isGuild ? 'Contract Type (Monster → Commission)' : 'Task Type (Bug → Feature → Task)' },
            { value: 'title-asc', label: 'Card Title (A → Z)' },
            { value: 'title-desc', label: 'Card Title (Z → A)' }
        ];
        sortOptions.forEach(opt => {
            const opEl = document.createElement('option');
            opEl.value = opt.value;
            opEl.innerText = opt.label;
            if (this.activeFilters.sortBy === opt.value) opEl.selected = true;
            sortSelect.appendChild(opEl);
        });
        sortSelect.addEventListener('change', (e) => {
            this.activeFilters.sortBy = e.target.value;
            this.applyFiltersAndSort(board);
        });
        sortSec.appendChild(sortSelect);

        // Reset Button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'questwall-reset-btn';
        resetBtn.innerText = 'Reset All';
        resetBtn.addEventListener('click', () => {
            this.activeFilters.assignees.clear();
            this.activeFilters.priorities.clear();
            this.activeFilters.types.clear();
            this.activeFilters.search = '';
            this.activeFilters.sortBy = 'default';
            searchInput.value = '';
            sortSelect.value = 'default';
            toolbar.querySelectorAll('.questwall-filter-btn.is-active').forEach(b => b.classList.remove('is-active'));
            this.applyFiltersAndSort(board);
        });
        toolbar.appendChild(resetBtn);

        // Theme Switcher Button
        const themeBtn = document.createElement('span');
        themeBtn.className = 'questwall-theme-btn';
        themeBtn.setAttribute('role', 'button');
        themeBtn.setAttribute('tabindex', '0');
        themeBtn.innerHTML = isGuild ? '✨ Switch to Default (Sleek Glass)' : '⚔️ Switch to Guild RPG Theme';
        
        const toggleTheme = async () => {
            this.plugin.settings.theme = isGuild ? 'sleek' : 'guild';
            await this.plugin.saveSettings();
        };

        themeBtn.addEventListener('click', toggleTheme);
        themeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
        toolbar.appendChild(themeBtn);

        container.insertBefore(toolbar, board);
    }

    /**
     * Filters and sorts cards inside each column lane based on active criteria.
     * @param {HTMLElement} board
     */
    applyFiltersAndSort(board) {
        if (!board) return;
        const { assignees, priorities, types, search, sortBy } = this.activeFilters;
        const hasFilters = assignees.size > 0 || priorities.size > 0 || types.size > 0 || search.length > 0;

        board.querySelectorAll('.kanban-plugin__lane').forEach(lane => {
            const laneItemsContainer = lane.querySelector('.kanban-plugin__lane-items');
            if (!laneItemsContainer) return;

            const items = Array.from(laneItemsContainer.querySelectorAll('.kanban-plugin__item'));

            items.forEach(item => {
                const text = item.innerText || '';
                const lowerText = text.toLowerCase();

                let matchesAssignee = assignees.size === 0 || Array.from(assignees).some(a => lowerText.includes(a.toLowerCase()));
                let matchesPriority = priorities.size === 0 || Array.from(priorities).some(p => lowerText.includes(p.toLowerCase()));
                let matchesType = types.size === 0 || Array.from(types).some(t => lowerText.includes(t.toLowerCase()));
                let matchesSearch = search.length === 0 || lowerText.includes(search);

                const isMatch = matchesAssignee && matchesPriority && matchesType && matchesSearch;

                if (hasFilters && !isMatch) {
                    item.classList.add('is-filtered-dimmed');
                } else {
                    item.classList.remove('is-filtered-dimmed');
                }
            });

            if (sortBy !== 'default' || hasFilters) {
                items.sort((a, b) => {
                    const aDimmed = a.classList.contains('is-filtered-dimmed');
                    const bDimmed = b.classList.contains('is-filtered-dimmed');

                    if (hasFilters && aDimmed !== bDimmed) {
                        return aDimmed ? 1 : -1;
                    }

                    if (sortBy === 'priority-desc' || sortBy === 'priority-asc') {
                        const getPrioScore = (el) => {
                            let prio = 0;
                            el.querySelectorAll('.qw-badge-priority, a.tag, span.cm-hashtag').forEach(t => {
                                const raw = (t.dataset.qwCleanTag || t.innerText || '').toUpperCase();
                                if (raw.includes('P1') || raw.includes('S-RANK') || raw.includes('HIGH')) prio = Math.max(prio, 3);
                                else if (raw.includes('P2') || raw.includes('A-RANK') || raw.includes('MEDIUM')) prio = Math.max(prio, 2);
                                else if (raw.includes('P3') || raw.includes('B-RANK') || raw.includes('LOW')) prio = Math.max(prio, 1);
                            });
                            return prio;
                        };
                        const scoreA = getPrioScore(a);
                        const scoreB = getPrioScore(b);
                        return sortBy === 'priority-desc' ? scoreB - scoreA : scoreA - scoreB;
                    }

                    if (sortBy === 'assignee') {
                        const getAssignee = (el) => {
                            let ass = 'zzz';
                            el.querySelectorAll('.qw-badge-assignee, a.tag, a.internal-link[href*="@"], span.cm-hashtag').forEach(t => {
                                const raw = t.dataset.qwCleanTag || t.getAttribute('href') || t.innerText || '';
                                const clean = cleanRawTagId(raw);
                                if (clean && !['bug', 'feature', 'task', 'P1', 'P2', 'P3'].includes(clean)) {
                                    ass = clean.toLowerCase();
                                }
                            });
                            return ass;
                        };
                        return getAssignee(a).localeCompare(getAssignee(b));
                    }

                    if (sortBy === 'type') {
                        const getTypeScore = (el) => {
                            let tScore = 3;
                            const txt = (el.innerText || '').toLowerCase();
                            if (txt.includes('#bug') || txt.includes('monster')) tScore = 1;
                            else if (txt.includes('#feature') || txt.includes('artifact')) tScore = 2;
                            else if (txt.includes('#task') || txt.includes('commission')) tScore = 3;
                            return tScore;
                        };
                        return getTypeScore(a) - getTypeScore(b);
                    }

                    if (sortBy === 'title-asc' || sortBy === 'title-desc') {
                        const titleA = (a.querySelector('.kanban-plugin__item-title') || a).innerText.trim();
                        const titleB = (b.querySelector('.kanban-plugin__item-title') || b).innerText.trim();
                        const cmp = titleA.localeCompare(titleB);
                        return sortBy === 'title-asc' ? cmp : -cmp;
                    }

                    return 0;
                });

                const addBtnWrapper = laneItemsContainer.querySelector('.kanban-plugin__item-button-wrapper');
                items.forEach(item => {
                    if (addBtnWrapper) {
                        laneItemsContainer.insertBefore(item, addBtnWrapper);
                    } else {
                        laneItemsContainer.appendChild(item);
                    }
                });
            }
        });

        if (this.plugin.cardService) {
            this.plugin.cardService.syncBoardBadges(board);
        }
    }
}
