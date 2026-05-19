/**
 * JCOS Permission Engine — RBAC + ABAC hybrid
 * 
 * Role baselines now loaded from DB (role_capabilities table)
 * Falls back to hardcoded defaults if DB unavailable
 * 
 * Usage:
 *   const perms = buildPermissions(user, profile, policies);
 *   if (perms.can('products.edit')) { ... }
 */

// ── FALLBACK role capabilities (if DB not available) ─────────
const DEFAULT_ROLE_CAPABILITIES = {
  super_admin:      { '*': true },  // all capabilities
  admin:            { '*': true, 'settings.manage': false, 'users.manage': false },
  boutique_manager: { 'dashboard.view':true,'products.view':true,'products.create':true,'products.edit':true,'diamonds.view':true,'inventory.view':true,'inventory.manage':true,'orders.view':true,'orders.manage':true,'orders.approve':true,'enquiries.view':true,'enquiries.manage':true,'appointments.view':true,'appointments.manage':true,'customers.view':true,'customers.edit':true,'reports.view':true,'gold_rates.view':true },
  sales_staff:      { 'dashboard.view':true,'products.view':true,'diamonds.view':true,'enquiries.view':true,'enquiries.manage':true,'appointments.view':true,'appointments.create':true,'customers.view':true,'customers.create':true,'customers.edit':true,'orders.view':true,'orders.create':true,'gold_rates.view':true },
  inventory_staff:  { 'dashboard.view':true,'products.view':true,'products.create':true,'products.edit':true,'diamonds.view':true,'diamonds.create':true,'diamonds.edit':true,'gemstones.view':true,'gemstones.create':true,'gemstones.edit':true,'inventory.view':true,'inventory.manage':true,'inventory.import':true,'suppliers.view':true,'media.view':true,'media.manage':true,'gold_rates.view':true },
  marketing_staff:  { 'dashboard.view':true,'products.view':true,'marketing.view':true,'marketing.manage':true,'blog.view':true,'blog.manage':true,'media.view':true,'media.manage':true,'builder.view':true,'builder.manage':true },
  crm_staff:        { 'dashboard.view':true,'enquiries.view':true,'enquiries.manage':true,'appointments.view':true,'appointments.create':true,'customers.view':true,'customers.create':true,'customers.edit':true,'orders.view':true,'gold_rates.view':true },
  accountant:       { 'dashboard.view':true,'orders.view':true,'payments.view':true,'reports.view':true,'reports.export':true,'customers.view':true,'gold_rates.view':true },
  viewer:           { 'dashboard.view':true,'products.view':true,'diamonds.view':true,'orders.view':true,'enquiries.view':true,'customers.view':true,'reports.view':true,'gold_rates.view':true },
};

// Cache for DB-loaded role capabilities
let _roleCapCache = null;
let _roleCapCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min cache

async function loadRoleCapabilities() {
  if (_roleCapCache && Date.now() - _roleCapCacheAt < CACHE_TTL) return _roleCapCache;
  try {
    const db = require('../config/db.pool');
    const [rows] = await db.query('SELECT role, capabilities FROM role_capabilities WHERE is_system=true OR is_system=false');
    const map = {};
    rows.forEach(r => { map[r.role] = r.capabilities; });
    _roleCapCache = map;
    _roleCapCacheAt = Date.now();
    return map;
  } catch {
    return DEFAULT_ROLE_CAPABILITIES;
  }
}

// Invalidate cache (call after role capabilities are updated)
function invalidateRoleCache() {
  _roleCapCache = null;
  _roleCapCacheAt = 0;
}

/**
 * Build synchronous permission checker
 * Role capabilities must be pre-loaded and passed in
 */
function buildPermissions(user, profile = null, policies = [], roleCapabilities = null) {
  const role = profile?.role || user?.role || 'viewer';
  const roleCaps = roleCapabilities || DEFAULT_ROLE_CAPABILITIES;

  // Handle wildcard super_admin
  const isSuper = role === 'super_admin';

  // Start with role baseline
  const base = isSuper ? {} : { ...(roleCaps[role] || roleCaps.viewer || {}) };

  // Layer 1: Apply assigned policies (ABAC)
  for (const policy of (policies || [])) {
    const caps = policy.capabilities || {};
    for (const [cap, value] of Object.entries(caps)) {
      if (value === true)  base[cap] = true;
      if (value === false) delete base[cap];
    }
  }

  // Layer 2: Per-user overrides
  const overrides = profile?.capability_overrides || {};
  for (const [cap, value] of Object.entries(overrides)) {
    if (value === true)  base[cap] = true;
    if (value === false) delete base[cap];
  }

  const branch_id = profile?.branch_id || null;

  function can(capability, context = {}) {
    if (isSuper) return true;
    if (!base[capability]) return false;

    // Branch restriction check
    if (context.branch_id && branch_id) {
      const branchRestricted = (policies||[]).some(p => p.conditions?.branch_scope === 'assigned');
      if (branchRestricted && context.branch_id !== branch_id) return false;
    }

    // Amount limit check
    if (context.amount !== undefined) {
      const limit = (policies||[]).reduce((max, p) => {
        const l = p.conditions?.amount_limit;
        return l ? Math.max(max, l) : max;
      }, Infinity);
      if (context.amount > limit) return false;
    }

    return true;
  }

  return {
    can,
    cannot: (cap, ctx) => !can(cap, ctx),
    assertCan: (cap, ctx) => {
      if (!can(cap, ctx)) {
        const e = new Error(`Insufficient permissions: ${cap}`);
        e.status = 403; e.capability = cap;
        throw e;
      }
    },
    capabilities: isSuper ? { _super: true } : base,
    role,
    branch_id,
    isSuperAdmin: isSuper,
    isAdmin: isSuper || role === 'admin',
  };
}

module.exports = { buildPermissions, loadRoleCapabilities, invalidateRoleCache, DEFAULT_ROLE_CAPABILITIES };
