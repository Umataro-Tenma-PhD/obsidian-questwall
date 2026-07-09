/**
 * @file src/constants/defaults.js
 * @description Single source of truth for Questwall configuration, role definitions, color palettes, and string sanitization rules.
 * @author Antigravity Engineering
 */

export const DEFAULT_SETTINGS = {
    theme: 'guild', // 'guild' (Adventure Guild RPG) | 'sleek' (Glassmorphism Modern)
    laneTintMap: {}, // Persistent mapping of column title -> color key (e.g. { 'Done': 'emerald' })
    teamMembers: [
        { name: 'James', roles: ['Paladin', 'Archmage'], classTitle: 'Paladin Archmage', icon: '🛡️🧙‍♂️', color: '#3b82f6' },
        { name: 'Unmol', roles: ['Archmage', 'Sorcerer'], classTitle: 'Archmage Sorcerer', icon: '🧙‍♂️🔥', color: '#9333ea' },
        { name: 'Sumeet', roles: ['Ranger', 'Knight'], classTitle: 'Ranger Knight', icon: '⚔️🐴', color: '#10b981' },
        { name: 'Pavin', roles: ['Rogue', 'Artificer'], classTitle: 'Rogue Artificer', icon: '🗡️⚙️', color: '#f97316' }
    ]
};

// Curated Role Registry (Simple, Clean & Descriptive)
export const ADVENTURER_CLASSES = [
    { id: 'Archmage', label: '🧙‍♂️ Archmage (AI Orchestration & Agentic Systems)', icon: '🧙‍♂️' },
    { id: 'Paladin', label: '🛡️ Paladin (System Resilience, Security & Alignment)', icon: '🛡️' },
    { id: 'Sorcerer', label: '🔥 Sorcerer (Rapid Prototyping & Product Velocity)', icon: '🔥' },
    { id: 'Knight', label: '🐴 Knight (Full-Stack User Experience & Interface Design)', icon: '🐴' },
    { id: 'Artificer', label: '⚙️ Artificer (Cloud Infrastructure & Tooling)', icon: '⚙️' },
    { id: 'Ranger', label: '⚔️ Ranger (Autonomous Workflows & Full-Scope Exploration)', icon: '⚔️' },
    { id: 'Alchemist', label: '🧪 Alchemist (Data Engineering, RAG & Vector Pipelines)', icon: '🧪' },
    { id: 'Druid', label: '🌿 Druid (Ecosystem, API Integrations & Platform Growth)', icon: '🌿' },
    { id: 'Rogue', label: '🗡️ Rogue (Vulnerability Assessment & Red Teaming)', icon: '🗡️' },
    { id: 'Bard', label: '🪕 Bard (Product Synthesis & Design Systems)', icon: '🪕' },
    { id: 'Cleric', label: '✨ Cleric (SRE, Telemetry & Continuous Health)', icon: '✨' },
    { id: 'Monk', label: '🥊 Monk (Core Optimization & Latency Reduction)', icon: '🥊' },
    { id: 'Necromancer', label: '💀 Necromancer (Legacy Code Transformation & Migration)', icon: '💀' }
];

export const LANE_COLORS = {
    'slate': { bg: 'rgba(100, 116, 139, 0.08)', border: 'rgba(100, 116, 139, 0.3)', label: 'Slate Gray' },
    'blue': { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)', label: 'Sapphire Blue' },
    'purple': { bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.3)', label: 'Amethyst Purple' },
    'red': { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', label: 'Crimson Red' },
    'emerald': { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', label: 'Emerald Green' },
    'orange': { bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.3)', label: 'Amber Orange' }
};

/**
 * Computes consolidated roles, class titles, and icons from a role array.
 * @param {string[]|string} rolesArray
 * @returns {{ roles: string[], classTitle: string, icon: string }}
 */
export function computeRolesDisplay(rolesArray) {
    const roles = Array.isArray(rolesArray) ? rolesArray : [rolesArray].filter(Boolean);
    if (!roles || !roles.length) {
        return { roles: ['Paladin'], classTitle: 'Paladin', icon: '🛡️' };
    }
    const titles = [];
    const icons = [];
    roles.forEach(r => {
        const found = ADVENTURER_CLASSES.find(c => c.id === r);
        if (found) {
            titles.push(found.id);
            icons.push(found.icon);
        } else if (r) {
            titles.push(r);
        }
    });
    return {
        roles: roles,
        classTitle: titles.join(' ') || 'Team Member',
        icon: icons.join('') || '👤'
    };
}

/**
 * Strips all internal tags, emojis, priority rankings, and quest badges to produce clean, pristine titles for comparisons and modals.
 * @param {string} text
 * @returns {string}
 */
export function getPureCardTitle(text) {
    if (!text) return '';
    return text
        .replace(/#(?:assignee\/|priority\/|type\/)?[\w-/]+/gi, '')
        .replace(/\[\[@[^\]]+\]\]/gi, '')
        .replace(/@[A-Za-z0-9_-]+/g, '')
        .replace(/\b(🐞\s*)+Bug\b/gi, '')
        .replace(/\b(🔴\s*)+P1\b/gi, '')
        .replace(/\b(🟡\s*)+P2\b/gi, '')
        .replace(/\b(🟢\s*)+P3\b/gi, '')
        .replace(/\b(✨\s*\+?\s*)+Feature\b/gi, '')
        .replace(/\b(📋\s*)+Task\b/gi, '')
        .replace(/🐉\s*S-Rank(\s*\(#P1\))?/gi, '')
        .replace(/⚔️\s*A-Rank(\s*\(#P2\))?/gi, '')
        .replace(/[🌱🛡️]\s*B-Rank(\s*\(#P3\))?/gi, '')
        .replace(/🕷️\s*Monster(\s*\(#bug\))?/gi, '')
        .replace(/💎\s*Artifact(\s*\(#feature\))?/gi, '')
        .replace(/📜\s*Commission(\s*\(#task\))?/gi, '')
        .replace(/(\s*[🐞🔴🟡🟢✨📋🐉⚔️🌱🛡️🧙‍♂️🔥🐴🗡️⚙️🧪🌿👤⚡🎨+]{2,}\s*)/g, ' ')
        .replace(/\[\[|\]\]/g, '')
        .replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes raw hashtag or internal link strings to derive consistent tag IDs.
 * @param {string} raw
 * @returns {string}
 */
export function cleanRawTagId(raw) {
    if (!raw) return '';
    let clean = raw.trim();
    if (clean.startsWith('[[') && clean.endsWith(']]')) {
        clean = clean.slice(2, -2).split('|')[0].trim();
    }
    clean = clean.replace(/^[#@]+/, '').replace(/^(?:assignee\/|priority\/|type\/)/i, '');
    clean = clean.replace(/[\/?:*"<>|]+/g, '-').replace(/\s+/g, '-').trim();
    return clean;
}
