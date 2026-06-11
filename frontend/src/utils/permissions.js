/**
 * Checks if the currently logged in user has the required permission for a specific module and action.
 * 
 * @param {string} module - The ERP module name (e.g. 'students', 'teachers', 'finance')
 * @param {string} action - The action type (e.g. 'view', 'create', 'edit', 'delete', 'approve', 'publish', 'export', 'import', 'manage-settings')
 * @returns {boolean} - True if access is permitted, false otherwise.
 */
export function hasPermission(module, action) {
  const role = sessionStorage.getItem('portal_role') || sessionStorage.getItem('role');
  
  // Developer Admin and Super Admins (Main Admin, Admin Dashboard, Principal) have absolute access
  if (
    role === 'Developer Admin' || 
    role === 'Main Admin' || 
    role === 'Admin Dashboard' ||
    role === 'Principal'
  ) {
    return true;
  }

  // Parse permissions from session storage
  let permissions = {};
  let overrides = {};
  
  try {
    const rawPermissions = sessionStorage.getItem('permissions');
    if (rawPermissions) {
      permissions = JSON.parse(rawPermissions);
    }
  } catch (e) {
    console.error('Failed to parse permissions from sessionStorage:', e);
  }

  try {
    const rawOverrides = sessionStorage.getItem('overrides');
    if (rawOverrides) {
      overrides = JSON.parse(rawOverrides);
    }
  } catch (e) {
    console.error('Failed to parse overrides from sessionStorage:', e);
  }

  // 1. Check permission overrides (takes priority over role permissions)
  if (overrides && overrides[module] && overrides[module][action] !== undefined) {
    return !!overrides[module][action];
  }

  // 2. Check standard role permissions
  if (permissions && permissions[module] && permissions[module][action] !== undefined) {
    return !!permissions[module][action];
  }

  // Default to access denied for security
  return false;
}

/**
 * Checks if the logged in user is a Super Admin (Main Admin, Admin Dashboard, Developer Admin, or Principal)
 * @returns {boolean}
 */
export function isSuperAdmin() {
  const role = sessionStorage.getItem('portal_role') || sessionStorage.getItem('role');
  return role === 'Developer Admin' || role === 'Main Admin' || role === 'Admin Dashboard' || role === 'Principal';
}
