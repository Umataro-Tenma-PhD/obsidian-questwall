/**
 * @file src/services/MenuService.js
 * @description Deterministic, zero-polling context menu interceptor that cleanly injects options into Obsidian Kanban column menus.
 * @author Antigravity Engineering
 */

export class MenuService {
    /**
     * @param {object} plugin - Reference to the main QuestwallPlugin instance
     */
    constructor(plugin) {
        this.plugin = plugin;
        this._lastClickedLane = null;
        this._hoveredLane = null;
        this._bodyObserver = null;
        this._activeMenuObservers = new WeakMap();
    }

    /**
     * Starts listening for pointer/context events and body mutations.
     */
    init() {
        // Track active lane from pointer events
        ['pointerover', 'mouseover'].forEach(evt => {
            this.plugin.registerDomEvent(document, evt, (e) => {
                const lane = this.getClosestLane(e.target);
                if (lane) this._hoveredLane = lane;
            }, true);
        });

        ['pointerdown', 'mousedown', 'click', 'contextmenu'].forEach(evt => {
            this.plugin.registerDomEvent(document, evt, (e) => {
                const lane = this.getClosestLane(e.target);
                if (lane) {
                    this._lastClickedLane = lane;
                    this.checkAndInjectOpenMenus();
                }
            }, true);
        });

        // Observe document.body for newly opened menus
        this._bodyObserver = new MutationObserver((mutations) => {
            let hasMenuAdded = false;
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && (node.classList?.contains('menu') || node.querySelector?.('.menu'))) {
                        hasMenuAdded = true;
                        break;
                    }
                }
                if (hasMenuAdded) break;
            }
            if (hasMenuAdded || document.querySelector('.menu')) {
                this.checkAndInjectOpenMenus();
            }
        });
        this._bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Traverses up from a DOM target to locate the parent Kanban column lane.
     * @param {EventTarget} target
     * @returns {HTMLElement|null}
     */
    getClosestLane(target) {
        if (!target || !target.closest) return null;
        return target.closest('.kanban-plugin__lane');
    }

    /**
     * Scans currently open menus and attaches scoped observers or injects option directly.
     */
    checkAndInjectOpenMenus() {
        const menus = document.querySelectorAll('.menu');
        menus.forEach(menuEl => {
            if (menuEl.querySelector('.qw-lane-color-menu-item')) return;

            // Check if items are already present
            const text = menuEl.textContent || '';
            const isKanbanLaneMenu = text.includes('Edit list') || text.includes('Archive cards') || text.includes('Delete list') || text.includes('Archive list');

            const targetLane = this._lastClickedLane || this._hoveredLane;
            if (!targetLane) return;

            if (isKanbanLaneMenu) {
                this.injectLaneColorItem(targetLane, menuEl);
            } else if (!this._activeMenuObservers.has(menuEl)) {
                // Attach a scoped observer directly on the menu to intercept microtask population
                const scopedObserver = new MutationObserver(() => {
                    const currentText = menuEl.textContent || '';
                    if (currentText.includes('Edit list') || currentText.includes('Archive cards') || currentText.includes('Delete list')) {
                        this.injectLaneColorItem(targetLane, menuEl);
                        scopedObserver.disconnect();
                        this._activeMenuObservers.delete(menuEl);
                    }
                });
                scopedObserver.observe(menuEl, { childList: true, subtree: true });
                this._activeMenuObservers.set(menuEl, scopedObserver);
            }
        });
    }

    /**
     * Injects the accessible "🎨 Change List Color..." item directly after "Edit list".
     * @param {HTMLElement} lane
     * @param {HTMLElement} menuEl
     */
    injectLaneColorItem(lane, menuEl) {
        if (!lane || !menuEl || menuEl.querySelector('.qw-lane-color-menu-item')) return;

        const item = document.createElement('div');
        item.className = 'menu-item qw-lane-color-menu-item';
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '0');
        
        const iconEl = document.createElement('div');
        iconEl.className = 'menu-item-icon';
        iconEl.innerHTML = '🎨';
        item.appendChild(iconEl);

        const titleEl = document.createElement('div');
        titleEl.className = 'menu-item-title';
        titleEl.textContent = 'Change List Color...';
        item.appendChild(titleEl);

        const triggerModal = () => {
            // Close the native menu cleanly
            const bg = document.querySelector('.menu-bg');
            if (bg) bg.click();
            else menuEl.remove();

            // Lazy load modal to avoid circular dependencies
            import('../ui/Modals.js').then(({ LaneColorModal }) => {
                new LaneColorModal(this.plugin.app, (colorKey) => {
                    const laneTitle = this.plugin.themeService.getLaneTitle(lane);
                    if (laneTitle) {
                        if (!this.plugin.settings.laneTintMap) this.plugin.settings.laneTintMap = {};
                        if (colorKey === 'reset' || !colorKey) {
                            delete this.plugin.settings.laneTintMap[laneTitle];
                        } else {
                            this.plugin.settings.laneTintMap[laneTitle] = colorKey;
                        }
                        this.plugin.saveSettings();
                    }
                }).open();
            });
        };

        item.addEventListener('click', triggerModal);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerModal();
            }
        });

        // Locate 'Edit list' item to insert directly underneath
        const editItem = Array.from(menuEl.querySelectorAll('.menu-item')).find(el => el.textContent && el.textContent.includes('Edit list'));
        if (editItem && editItem.nextSibling) {
            menuEl.insertBefore(item, editItem.nextSibling);
        } else if (editItem) {
            menuEl.appendChild(item);
        } else {
            menuEl.insertBefore(item, menuEl.firstChild);
        }
    }

    /**
     * Cleans up observers on unload.
     */
    cleanup() {
        if (this._bodyObserver) {
            this._bodyObserver.disconnect();
            this._bodyObserver = null;
        }
    }
}
