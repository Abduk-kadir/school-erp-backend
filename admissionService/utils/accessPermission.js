const { StaffRegistration, Role, Module, RolePermission, StaffPermission } = require('../models');
const redis = require('../config/redisConfig');
// Kept short so expired staff overrides and direct DB edits take effect quickly.
const CACHE_SECONDS = 60 * 5;
const ACTIONS = ['display', 'add', 'edit', 'delete', 'view', 'import', 'export','is_assign_permissions'];

function parseAllowedActions(value) {
  if (value == null || value === '') return [...ACTIONS];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list
    .map((a) => String(a).trim().toLowerCase())
    .filter((a) => ACTIONS.includes(a));
}

/** Returns a normalized comma string, or null if the input has an unknown action. */
function normalizeAllowedActions(value) {
  if (value == null || value === '') return ACTIONS.join(',');
  const list = (Array.isArray(value) ? value : String(value).split(','))
    .map((a) => String(a).trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0 || list.some((a) => !ACTIONS.includes(a))) return null;
  return ACTIONS.filter((a) => list.includes(a)).join(',');
}

/** true/false/null parser; returns undefined for values it cannot interpret. */
function parseTriState(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 1 || value === '1' || value === 'true') return true;
  if (value === false || value === 0 || value === '0' || value === 'false') return false;
  return undefined;
}

/** Reads an action from a request row, accepting both `add` and `can_add`. */
function readAction(row, action) {
  if (row == null) return undefined;
  if (Object.prototype.hasOwnProperty.call(row, action)) return row[action];
  return row[`can_${action}`];
}

function isOverrideActive(override) {
  if (!override) return false;
  if (!override.expires_at) return true;
  return new Date(override.expires_at) > new Date();
}
async function getEffectivePermissionsCached(staffId) {
  const key = `perm:staff:${staffId}`;
  try {
    console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::')
    const saved = await redis.get(key);
    console.log('redis data found**************************::::::::::::::',saved)
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Permission cache read failed:', e.message);
  }
  const result = await getEffectivePermissions(staffId);
  if (result) {
    redis.set(key, JSON.stringify(result), 'EX', CACHE_SECONDS).catch(() => {});
  }
  return result;
}
/** Clears one staff member's cached permissions, or everyone's when staffId is omitted. */
async function clearPermissionCache(staffId) {
  try {
    if (staffId) {
      await redis.del(`perm:staff:${staffId}`);
      return;
    }
    const keys = await redis.keys('perm:staff:*');
    if (keys.length > 0) await redis.del(...keys);
  } catch (e) {
    console.error('Permission cache clear failed:', e.message);
  }
}

async function getEffectivePermissions(staffId) {
  const staff = await StaffRegistration.findByPk(staffId, {
    attributes: ['id', 'role_id'],
    include: [{ model: Role, as: 'roleInfo' }],
  });
  if (!staff) return null;

  const role = staff.roleInfo && staff.roleInfo.is_active ? staff.roleInfo : null;
  const isSuperAdmin = Boolean(role?.is_super_admin);

  const [modules, roleRows, overrides] = await Promise.all([
    Module.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    }),
    role ? RolePermission.findAll({ where: { role_id: role.id } }) : [],
    StaffPermission.findAll({ where: { staff_id: staffId } }),
  ]);

  const roleByModule = new Map(roleRows.map((r) => [r.module_id, r]));
  const overrideByModule = new Map(
    overrides.filter(isOverrideActive).map((o) => [o.module_id, o])
  );

  const permissions = {};
  for (const m of modules) {
    const allowed = parseAllowedActions(m.allowed_actions);
    const rolePerm = roleByModule.get(m.id);
    const override = overrideByModule.get(m.id);
    const result = {};

    for (const action of ACTIONS) {
      const key = `can_${action}`;
      if (!allowed.includes(action)) {
        result[action] = false;
      } else if (isSuperAdmin) {
        result[action] = true;
      } else if (override && override[key] !== null && override[key] !== undefined) {
        result[action] = Boolean(override[key]);
      } else {
        result[action] = Boolean(rolePerm?.[key]);
      }
    }
    permissions[m.module_key] = result;
  }

  return {
    staff_id: staff.id,
    role: role
      ? { id: role.id, role_name: role.role_name, is_super_admin: role.is_super_admin }
      : null,
    permissions,
  };
}

module.exports = {
  ACTIONS,
  parseAllowedActions,
  normalizeAllowedActions,
  parseTriState,
  readAction,
  isOverrideActive,
  getEffectivePermissions,
  getEffectivePermissionsCached,
  clearPermissionCache,
};
