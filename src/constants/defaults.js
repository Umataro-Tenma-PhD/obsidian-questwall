/**
 * @file src/constants/defaults.js
 * @description Single source of truth for Questwall configuration, engineering role definitions, color palettes, and string sanitization rules.
 * @author Antigravity Engineering
 */

export const DEFAULT_SETTINGS = {
    theme: 'sleek', // 'sleek' (Default Modern Glassmorphism) | 'guild' (Optional RPG Guild Theme)
    laneTintMap: {}, // Persistent mapping of column title -> color key (e.g. { 'Done': 'emerald' })
    teamMembers: [
        { name: 'James', roles: ['Paladin', 'Archmage'], classTitle: 'Paladin Archmage', icon: '🛡️🧙‍♂️', color: '#3b82f6' },
        { name: 'Unmol', roles: ['Archmage', 'Sorcerer'], classTitle: 'Archmage Sorcerer', icon: '🧙‍♂️🔥', color: '#9333ea' },
        { name: 'Sumeet', roles: ['Ranger', 'Knight'], classTitle: 'Ranger Knight', icon: '⚔️🐴', color: '#10b981' },
        { name: 'Pavin', roles: ['Rogue', 'Artificer'], classTitle: 'Rogue Artificer', icon: '🗡️⚙️', color: '#f97316' }
    ]
};

// Curated Engineering & Product Role Registry with Industry-Standard Descriptions and Corporate/Guild Mappings
export const ADVENTURER_CLASSES = [
    { id: 'Archmage', corpTitle: 'AI Architect', corpLabel: 'AI Architect & LLM Systems', label: '🧙‍♂️ Archmage — AI Architect & LLM Systems', desc: 'Agent orchestration, prompt architecture, and AI pipeline integration.', icon: '🧙‍♂️' },
    { id: 'Paladin', corpTitle: 'SRE / DevOps', corpLabel: 'Site Reliability & DevOps', label: '🛡️ Paladin — Site Reliability & DevOps', desc: 'Infrastructure resilience, high-availability uptime, and system alignment.', icon: '🛡️' },
    { id: 'Sorcerer', corpTitle: 'Backend API', corpLabel: 'Core Backend API & Distributed Systems', label: '🔥 Sorcerer — Core Backend API & Distributed Systems', desc: 'Microservices, API prototyping, and scalable database architecture.', icon: '🔥' },
    { id: 'Knight', corpTitle: 'Security & Governance', corpLabel: 'Security, Governance & Risk', label: '🐴 Knight — Security, Governance & Risk', desc: 'Code security auditing, IAM access policies, and enterprise compliance.', icon: '🐴' },
    { id: 'Artificer', corpTitle: 'Systems Engineering', corpLabel: 'Systems Engineering & Tooling', label: '⚙️ Artificer — Systems Engineering & Tooling', desc: 'CI/CD deployment pipelines, developer experience, and cloud build tools.', icon: '⚙️' },
    { id: 'Ranger', corpTitle: 'Full-Stack Automation', corpLabel: 'Full-Stack Velocity & Workflow Automation', label: '⚔️ Ranger — Full-Stack Velocity & Workflow Automation', desc: 'End-to-end feature exploration, cross-cutting workflows, and rapid delivery.', icon: '⚔️' },
    { id: 'Alchemist', corpTitle: 'Data Engineering', corpLabel: 'Data Engineering & RAG Pipelines', label: '🧪 Alchemist — Data Engineering & RAG Pipelines', desc: 'Vector databases, ETL transformations, ML pipelines, and analytics.', icon: '🧪' },
    { id: 'Druid', corpTitle: 'Agile Scrum Mastery', corpLabel: 'Product Ownership & Agile Scrum Mastery', label: '🌿 Druid — Product Ownership & Agile Scrum Mastery', desc: 'Sprint planning, backlog grooming, roadmap priorities, and team velocity.', icon: '🌿' },
    { id: 'Rogue', corpTitle: 'Performance Optimization', corpLabel: 'Performance Optimization & Debugging', label: '🗡️ Rogue — Performance Optimization & Debugging', desc: 'Memory leak profiling, latency reduction, and red-team vulnerability testing.', icon: '🗡️' },
    { id: 'Bard', corpTitle: 'UX/UI Design', corpLabel: 'UX/UI Design & Product Synthesis', label: '🪕 Bard — UX/UI Design & Product Synthesis', desc: 'Design systems, interactive user flows, component libraries, and documentation.', icon: '🪕' },
    { id: 'Cleric', corpTitle: 'QA Engineering', corpLabel: 'QA Engineering & Test Automation', label: '✨ Cleric — QA Engineering & Test Automation', desc: 'Test automation frameworks, regression prevention, and continuous telemetry.', icon: '✨' },
    { id: 'Monk', corpTitle: 'Frontend Core', corpLabel: 'Frontend Core & State Architecture', label: '🥊 Monk — Frontend Core & State Architecture', desc: 'Modern web frameworks, responsive layouts, and deterministic state management.', icon: '🥊' },
    { id: 'Necromancer', corpTitle: 'Legacy Modernization', corpLabel: 'Legacy Code Modernization & Refactoring', label: '💀 Necromancer — Legacy Code Modernization & Refactoring', desc: 'Technical debt elimination, codebase migrations, and clean refactoring.', icon: '💀' }
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
 * Computes consolidated roles, class titles, and icons from a role array depending on active theme.
 * @param {string[]|string} rolesArray
 * @param {boolean} isGuild
 * @returns {{ roles: string[], classTitle: string, icon: string }}
 */
export const RESERVED_TAGS = new Set([
    'bug', 'feature', 'task', 'P1', 'P2', 'P3', 'security', 'tech-debt',
    's-rank', 'a-rank', 'b-rank', 'monster', 'artifact', 'commission'
]);

/**
 * Computes consolidated roles, class titles, and icons from a role array depending on active theme.
 * @param {string[]|string} rolesArray
 * @param {boolean} isGuild
 * @returns {{ roles: string[], classTitle: string, icon: string }}
 */
export function computeRolesDisplay(rolesArray, isGuild = true) {
    const roles = (Array.isArray(rolesArray) ? rolesArray : [rolesArray]).filter(Boolean);
    if (!roles || !roles.length) {
        return { roles: isGuild ? ['Paladin'] : ['SRE / DevOps'], classTitle: isGuild ? 'Paladin' : 'SRE / DevOps', icon: isGuild ? '🛡️' : '👤' };
    }
    const titles = [];
    const icons = [];
    roles.forEach(r => {
        const found = ADVENTURER_CLASSES.find(c => c.id === r);
        if (found) {
            titles.push(isGuild ? found.id : found.corpTitle);
            if (isGuild) icons.push(found.icon);
        } else if (r) {
            titles.push(r);
        }
    });
    return {
        roles: roles,
        classTitle: titles.join(', ') || 'Team Member',
        icon: icons.join('') || '👤'
    };
}

/**
 * Strips all internal tags, emojis, priority rankings, and quest badges to produce clean, pristine titles for comparisons and modals.
 * @param {string} text
 * @returns {string}
 */
export function getPureCardTitle(text) {
    if (!text || typeof text !== 'string') return String(text || '').trim();
    return text
        .replace(/#(?:assignee\/|priority\/|type\/)?[\w-/]+/gi, '')
        .replace(/\[\[@[^\]]+\]\]/gi, '')
        .replace(/@[A-Za-z0-9_-]+/g, '')
        .replace(/\b(🐞\s*)+Bug\b|\b(🔴\s*)+P1(\s*\(High\))?\b|\b(🟡\s*)+P2(\s*\(Med\))?\b|\b(🟢\s*)+P3(\s*\(Low\))?\b|\b(✨\s*\+?\s*)+Feature\b|\b(📋\s*)+Task\b/gi, '')
        .replace(/🐉\s*S-Rank(\s*\(#P1\))?|⚔️\s*A-Rank(\s*\(#P2\))?|[🌱🛡️]\s*B-Rank(\s*\(#P3\))?|🕷️\s*Monster(\s*\(#bug\))?|💎\s*Artifact(\s*\(#feature\))?|📜\s*Commission(\s*\(#task\))?/gi, '')
        .replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes raw hashtag or internal link strings to derive consistent tag IDs.
 * @param {string} raw
 * @returns {string}
 */
export function cleanRawTagId(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let clean = raw.trim();
    if (clean.startsWith('[[') && clean.endsWith(']]')) {
        clean = clean.slice(2, -2).split('|')[0].trim();
    }
    clean = clean.replace(/^[#@]+/, '').replace(/^(?:assignee\/|priority\/|type\/)/i, '');
    return clean.replace(/[\/?:*"<>|]+/g, '-').replace(/\s+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-').trim();
}

