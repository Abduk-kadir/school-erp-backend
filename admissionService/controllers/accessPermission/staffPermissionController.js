const asyncHandler = require('express-async-handler');
const {
  StaffRegistration,
  Role,
  Module,
  RolePermission,
  StaffPermission,
  sequelize,
} = require('../../models');
const {
  ACTIONS,
  parseAllowedActions,
  parseTriState,
  readAction,
  isOverrideActive,
  getEffectivePermissions,
} = require('../../utils/accessPermission');

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.permissions)) return body.permissions;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

async function findStaffWithRole(staffId) {
  return StaffRegistration.findByPk(staffId, {
    attributes: ['id', 'firstname', 'surname', 'role_id'],
    include: [{ model: Role, as: 'roleInfo' }],
  });
}

/**
 * One row per active module showing: what the role gives, the staff override
 * (true / false / null = inherit) and the final result.
 */
async function buildStaffGrid(staff) {
  const role = staff.roleInfo && staff.roleInfo.is_active ? staff.roleInfo : null;
  const isSuperAdmin = Boolean(role?.is_super_admin);

  const [modules, roleRows, overrides] = await Promise.all([
    Module.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    }),
    role ? RolePermission.findAll({ where: { role_id: role.id } }) : [],
    StaffPermission.findAll({ where: { staff_id: staff.id } }),
  ]);
  const roleByModule = new Map(roleRows.map((r) => [r.module_id, r]));
  const overrideByModule = new Map(overrides.map((o) => [o.module_id, o]));

  return modules.map((m) => {
    const allowed = parseAllowedActions(m.allowed_actions);
    const rolePerm = roleByModule.get(m.id);
    const override = overrideByModule.get(m.id);
    const active = isOverrideActive(override);

    const fromRole = {};
    const overrideValues = {};
    const effective = {};
    for (const action of ACTIONS) {
      const key = `can_${action}`;
      if (!allowed.includes(action)) {
        fromRole[action] = null;
        overrideValues[action] = null;
        effective[action] = null;
        continue;
      }
      fromRole[action] = isSuperAdmin ? true : Boolean(rolePerm?.[key]);
      overrideValues[action] = override ? override[key] : null;
      effective[action] =
        !isSuperAdmin && active && overrideValues[action] !== null
          ? Boolean(overrideValues[action])
          : fromRole[action];
    }

    return {
      module_id: m.id,
      module_key: m.module_key,
      module_name: m.module_name,
      group_name: m.group_name,
      allowed_actions: allowed,
      role: fromRole,
      override: overrideValues,
      effective,
      reason: override?.reason ?? null,
      expires_at: override?.expires_at ?? null,
      override_active: Boolean(override) && active,
    };
  });
}

function staffSummary(staff) {
  const role = staff.roleInfo;
  return {
    id: staff.id,
    name: [staff.firstname, staff.surname].filter(Boolean).join(' '),
    role: role
      ? { id: role.id, role_name: role.role_name, is_super_admin: role.is_super_admin, is_active: role.is_active }
      : null,
  };
}

const staffPermissionController = {
  getByStaff: asyncHandler(async (req, res) => {
    const staff = await findStaffWithRole(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const data = await buildStaffGrid(staff);

    return res.status(200).json({
      success: true,
      staff: staffSummary(staff),
      count: data.length,
      data,
    });
  }),

  /**
   * Saves per-staff overrides.
   * body: [{ module_id, display: true|false|null, add, ..., reason, expires_at }, ...]
   * null / missing = inherit from role. A row with every action null removes the override.
   */
  saveForStaff: asyncHandler(async (req, res) => {
    const staff = await findStaffWithRole(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Body must be a non-empty array (or { permissions: [...] })',
      });
    }

    const moduleIds = [...new Set(rows.map((r) => Number(r?.module_id)))];
    if (moduleIds.some((id) => !Number.isInteger(id))) {
      return res.status(400).json({ success: false, message: 'Each row requires a numeric module_id' });
    }

    const modules = await Module.findAll({ where: { id: moduleIds } });
    const moduleById = new Map(modules.map((m) => [m.id, m]));
    const missing = moduleIds.filter((id) => !moduleById.has(id));
    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Unknown module_id: ${missing.join(', ')}` });
    }

    const grantedBy = Number(req.staff) || Number(req.body?.granted_by) || null;
    const toUpsert = [];
    const toRemove = [];

    for (const row of rows) {
      const moduleId = Number(row.module_id);
      const allowed = parseAllowedActions(moduleById.get(moduleId).allowed_actions);
      const record = { staff_id: staff.id, module_id: moduleId };
      let hasOverride = false;

      for (const action of ACTIONS) {
        const value = parseTriState(readAction(row, action));
        if (value === undefined) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for "${action}" on module_id ${moduleId} (use true, false or null)`,
          });
        }
        record[`can_${action}`] = allowed.includes(action) ? value : null;
        if (record[`can_${action}`] !== null) hasOverride = true;
      }

      if (!hasOverride) {
        toRemove.push(moduleId);
        continue;
      }

      let expiresAt = null;
      if (row.expires_at) {
        expiresAt = new Date(row.expires_at);
        if (Number.isNaN(expiresAt.getTime())) {
          return res.status(400).json({
            success: false,
            message: `Invalid expires_at on module_id ${moduleId}`,
          });
        }
      }

      record.reason = row.reason ?? null;
      record.expires_at = expiresAt;
      record.granted_by = grantedBy;
      toUpsert.push(record);
    }

    await sequelize.transaction(async (transaction) => {
      if (toRemove.length > 0) {
        await StaffPermission.destroy({
          where: { staff_id: staff.id, module_id: toRemove },
          transaction,
        });
      }
      if (toUpsert.length > 0) {
        await StaffPermission.bulkCreate(toUpsert, {
          transaction,
          updateOnDuplicate: ACTIONS.map((a) => `can_${a}`).concat([
            'reason',
            'expires_at',
            'granted_by',
            'updatedAt',
          ]),
        });
      }
    });

    const data = await buildStaffGrid(staff);

    return res.status(200).json({
      success: true,
      message: 'Staff permissions saved',
      staff: staffSummary(staff),
      saved: toUpsert.length,
      removed: toRemove.length,
      count: data.length,
      data,
    });
  }),

  /** Final permissions of the logged-in staff (requires verifystaff). */
  getMine: asyncHandler(async (req, res) => {
    const result = await getEffectivePermissions(req.staff);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    return res.status(200).json({ success: true, data: result });
  }),

  /** Final permissions keyed by module_key, e.g. { subject: { display: true, add: false, ... } } */
  getEffective: asyncHandler(async (req, res) => {
    const result = await getEffectivePermissions(req.params.staffId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    return res.status(200).json({ success: true, data: result });
  }),
};

module.exports = staffPermissionController;
