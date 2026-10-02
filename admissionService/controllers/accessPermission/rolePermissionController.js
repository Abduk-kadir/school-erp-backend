const asyncHandler = require('express-async-handler');
const { Role, Module, RolePermission, sequelize } = require('../../models');
const { ACTIONS, parseAllowedActions, parseTriState, readAction } = require('../../utils/accessPermission');

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.permissions)) return body.permissions;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

/** One row per active module; actions not in allowed_actions come back as null (shown as "-"). */
async function buildRoleGrid(roleId) {
  const [modules, rows] = await Promise.all([
    Module.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    }),
    RolePermission.findAll({ where: { role_id: roleId } }),
  ]);
  const byModule = new Map(rows.map((r) => [r.module_id, r]));

  return modules.map((m) => {
    const allowed = parseAllowedActions(m.allowed_actions);
    const row = byModule.get(m.id);
    const permissions = {};
    for (const action of ACTIONS) {
      permissions[action] = allowed.includes(action) ? Boolean(row?.[`can_${action}`]) : null;
    }
    return {
      module_id: m.id,
      module_key: m.module_key,
      module_name: m.module_name,
      group_name: m.group_name,
      allowed_actions: allowed,
      permissions,
    };
  });
}

const rolePermissionController = {
  getByRole: asyncHandler(async (req, res) => {
    const role = await Role.findByPk(req.params.roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    console.log('role id',role.id)
    const data = await buildRoleGrid(role.id);

    return res.status(200).json({
      success: true,
      role: { id: role.id, role_name: role.role_name, is_super_admin: role.is_super_admin },
      count: data.length,
      data,
    });
  }),

  /**
   * Saves the grid for a role.
   * body: [{ module_id, display, add, edit, delete, view, import, export }, ...]
   * (also accepts can_display, can_add, ... keys). Missing actions are saved as false.
   */
  saveForRole: asyncHandler(async (req, res) => {
    const role = await Role.findByPk(req.params.roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const rows = getRowsFromBody(req.body);
    console.log('rows******************************',rows)
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

    const payload = [];
    for (const row of rows) {
      const moduleId = Number(row.module_id);
      const allowed = parseAllowedActions(moduleById.get(moduleId).allowed_actions);
      const record = { role_id: role.id, module_id: moduleId };

      for (const action of ACTIONS) {
        const value = parseTriState(readAction(row, action));
        if (value === undefined) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for "${action}" on module_id ${moduleId}`,
          });
        }
        record[`can_${action}`] = allowed.includes(action) ? value === true : false;
      }
      payload.push(record);
    }
    console.log('payload**************************************',payload)
    await sequelize.transaction(async (transaction) => {
      await RolePermission.bulkCreate(payload, {
        transaction,
        updateOnDuplicate: ACTIONS.map((a) => `can_${a}`).concat('updatedAt'),
      });
    });

    const data = await buildRoleGrid(role.id);

    return res.status(200).json({
      success: true,
      message: 'Role permissions saved',
      role: { id: role.id, role_name: role.role_name, is_super_admin: role.is_super_admin },
      count: data.length,
      data,
    });
  }),
};

module.exports = rolePermissionController;
