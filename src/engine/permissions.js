/**
 * JCOS Permission Engine — RBAC + ABAC hybrid
 * 
 * Usage:
 *   const { can, cannot, assertCan } = buildPermissions(user, profile, policies);
 *   if (can('products.edit')) { ... }
 *   if (can('orders.approve', { amount: 5000 })) { ... }
 * 
 * Never use: if(role === 'admin')
 * Always use: if(can('resource.action'))
 */

// ── ALL CAPABILITIES IN THE SYSTEM ──────────────────────────
const ALL_CAPABILITIES = [
  // Dashboard
  'dashboard.view',
  // Products
  'products.view', 'products.create', 'products.edit', 'products.delete', 'products.publish',
  // Diamonds
  'diamonds.view', 'diamonds.create', 'diamonds.edit', 'diamonds.delete',
  // Gemstones
  'gemstones.view', 'gemstones.create', 'gemstones.edit', 'gemstones.delete',
  // Inventory
  'inventory.view', 'inventory.manage', 'inventory.import',
  // Orders
  'orders.view', 'orders.create', 'orders.manage', 'orders.approve',
  // Enquiries
  'enquiries.view', 'enquiries.manage', 'enquiries.assign',
  // Appointments
  'appointments.view', 'appointments.create', 'appointments.manage',
  // Customers
  'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
  // Exhibitions
  'exhibitions.view', 'exhibitions.manage',
  // Marketing
  'marketing.view', 'marketing.manage',
  // Blog
  'blog.view', 'blog.manage',
  // Media
  'media.view', 'media.manage',
  // Builder
  'builder.view', 'builder.manage',
  // Settings
  'settings.view', 'settings.manage',
  // Users / Workforce
  'users.view', 'users.manage',
  'workforce.view', 'workforce.manage',
  // Reports
  'reports.view', 'reports.export',
  // Suppliers
  'suppliers.view', 'suppliers.manage',
  // ERP
  'erp.view', 'erp.manage',
  // Payments
  'payments.view', 'payments.manage',
];

// ── ROLE BASELINE CAPABILITIES ───────────────────────────────
// What each role gets by default (RBAC layer)
const ROLE_CAPABILITIES = {
  super_admin: Object.fromEntries(ALL_CAPABILITIES.map(c => [c, true])),

  admin: Object.fromEntries(ALL_CAPABILITIES.filter(c =>
    !c.startsWith('users.manage') && c !== 'settings.manage'
  ).map(c => [c, true])),

  boutique_manager: {
    'dashboard.view': true,
    'products.view': true, 'products.create': true, 'products.edit': true,
    'diamonds.view': true, 'diamonds.create': true, 'diamonds.edit': true,
    'inventory.view': true, 'inventory.manage': true,
    'orders.view': true, 'orders.manage': true, 'orders.approve': true,
    'enquiries.view': true, 'enquiries.manage': true, 'enquiries.assign': true,
    'appointments.view': true, 'appointments.manage': true,
    'customers.view': true, 'customers.edit': true,
    'reports.view': true,
    'marketing.view': true,
    'media.view': true, 'media.manage': true,
  },

  sales_staff: {
    'dashboard.view': true,
    'products.view': true,
    'diamonds.view': true,
    'enquiries.view': true, 'enquiries.manage': true,
    'appointments.view': true, 'appointments.create': true,
    'customers.view': true, 'customers.create': true, 'customers.edit': true,
    'orders.view': true, 'orders.create': true,
  },

  inventory_staff: {
    'dashboard.view': true,
    'products.view': true, 'products.create': true, 'products.edit': true,
    'diamonds.view': true, 'diamonds.create': true, 'diamonds.edit': true,
    'gemstones.view': true, 'gemstones.create': true, 'gemstones.edit': true,
    'inventory.view': true, 'inventory.manage': true, 'inventory.import': true,
    'suppliers.view': true,
    'media.view': true, 'media.manage': true,
  },

  marketing_staff: {
    'dashboard.view': true,
    'products.view': true,
    'marketing.view': true, 'marketing.manage': true,
    'blog.view': true, 'blog.manage': true,
    'media.view': true, 'media.manage': true,
    'builder.view': true, 'builder.manage': true,
  },

  crm_staff: {
    'dashboard.view': true,
    'enquiries.view': true, 'enquiries.manage': true,
    'appointments.view': true, 'appointments.create': true,
    'customers.view': true, 'customers.create': true, 'customers.edit': true,
    'orders.view': true,
  },

  accountant: {
    'dashboard.view': true,
    'orders.view': true,
    'payments.view': true,
    'reports.view': true, 'reports.export': true,
    'customers.view': true,
  },

  viewer: {
    'dashboard.view': true,
    'products.view': true,
    'diamonds.view': true,
    'orders.view': true,
    'enquiries.view': true,
    'customers.view': true,
    'reports.view': true,
  },
};

/**
 * Build permission checker for a user session
 * 
 * @param {Object} user - from users table
 * @param {Object} profile - from workforce_profiles table (nullable)
 * @param {Array} policies - array of permission_policy rows
 * @returns {{ can, cannot, assertCan, capabilities, branch_id }}
 */
function buildPermissions(user, profile = null, policies = []) {
  // Start with role baseline (RBAC)
  const role = profile?.role || user?.role || 'viewer';
  const base = { ...(ROLE_CAPABILITIES[role] || ROLE_CAPABILITIES.viewer) };

  // Layer 1: Apply assigned policies (ABAC)
  for (const policy of policies) {
    const caps = policy.capabilities || {};
    for (const [cap, value] of Object.entries(caps)) {
      if (value === true)  base[cap] = true;
      if (value === false) delete base[cap];  // policy can revoke
    }
  }

  // Layer 2: Apply per-user overrides (ABAC)
  const overrides = profile?.capability_overrides || {};
  for (const [cap, value] of Object.entries(overrides)) {
    if (value === true)  base[cap] = true;
    if (value === false) delete base[cap];
  }

  const branch_id = profile?.branch_id || null;

  /**
   * Check capability with optional ABAC conditions
   * @param {string} capability - e.g. 'products.edit'
   * @param {Object} context - e.g. { branch_id: 'xyz', amount: 5000 }
   */
  function can(capability, context = {}) {
    if (!base[capability]) return false;

    // ABAC: branch restriction
    if (context.branch_id && branch_id && context.branch_id !== branch_id) {
      // Check if user is restricted to their branch
      const branchRestricted = policies.some(p => p.conditions?.branch_scope === 'assigned');
      if (branchRestricted) return false;
    }

    // ABAC: amount limit
    if (context.amount !== undefined) {
      const limit = policies.reduce((max, p) => {
        const l = p.conditions?.amount_limit;
        return l ? Math.max(max, l) : max;
      }, Infinity);
      if (context.amount > limit) return false;
    }

    return true;
  }

  function cannot(capability, context = {}) {
    return !can(capability, context);
  }

  function assertCan(capability, context = {}) {
    if (!can(capability, context)) {
      const err = new Error(`Insufficient permissions: ${capability}`);
      err.status = 403;
      err.capability = capability;
      throw err;
    }
  }

  return {
    can,
    cannot,
    assertCan,
    capabilities: base,
    role,
    branch_id,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'super_admin' || role === 'admin',
  };
}

module.exports = { buildPermissions, ROLE_CAPABILITIES, ALL_CAPABILITIES };
