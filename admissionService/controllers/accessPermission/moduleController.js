const asyncHandler = require('express-async-handler');
const { Module } = require('../../models');
const {
  ACTIONS,
  normalizeAllowedActions,
  parseAllowedActions,
  clearPermissionCache,
} = require('../../utils/accessPermission');

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.modules)) return body.modules;
  if (body && body.module_key) return [body];
  return null;
}

function toResponse(record) {
  const json = record.toJSON();
  return { ...json, allowed_actions: parseAllowedActions(json.allowed_actions) };
}

const moduleController = {
  /** Accepts a single module object or an array of modules. */
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Send a module object or an array of modules',
      });
    }

    const payload = [];
    for (const row of rows) {
      const module_key = String(row?.module_key || '').trim().toLowerCase();
      const module_name = String(row?.module_name || '').trim();
      if (!module_key || !module_name) {
        return res.status(400).json({
          success: false,
          message: 'Each module requires module_key and module_name',
        });
      }
      const allowed_actions = normalizeAllowedActions(row.allowed_actions);
      if (!allowed_actions) {
        return res.status(400).json({
          success: false,
          message: `allowed_actions for "${module_key}" must only contain: ${ACTIONS.join(', ')}`,
        });
      }
      payload.push({
        module_key,
        module_name,
        group_name: row.group_name ?? null,
        parent_id: row.parent_id ?? null,
        sort_order: Number(row.sort_order) || 0,
        allowed_actions,
        is_active: row.is_active === undefined ? true : Boolean(row.is_active),
      });
    }

    const keys = payload.map((p) => p.module_key);
    if (new Set(keys).size !== keys.length) {
      return res.status(400).json({ success: false, message: 'Duplicate module_key in request' });
    }
    const existing = await Module.findAll({ where: { module_key: keys }, attributes: ['module_key'] });
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `module_key already exists: ${existing.map((e) => e.module_key).join(', ')}`,
      });
    }

    const records = await Module.bulkCreate(payload, { validate: true });
    await clearPermissionCache();

    return res.status(201).json({
      success: true,
      message: 'Modules created',
      count: records.length,
      data: records.map(toResponse),
    });
  }),

  /** Returns every module (no pagination) because the permission grid needs all rows. */
  getAll: asyncHandler(async (req, res) => {
    const where = {};
    if (req.query.group) where.group_name = req.query.group;
    if (req.query.active !== undefined) where.is_active = req.query.active === 'true' || req.query.active === '1';

    const records = await Module.findAll({
      where,
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records.map(toResponse),
    });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await Module.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const body = req.body || {};
    const updates = {};

    if (body.module_key !== undefined) {
      const module_key = String(body.module_key).trim().toLowerCase();
      if (!module_key) {
        return res.status(400).json({ success: false, message: 'module_key cannot be empty' });
      }
      const duplicate = await Module.findOne({ where: { module_key } });
      if (duplicate && duplicate.id !== record.id) {
        return res.status(409).json({ success: false, message: 'module_key already exists' });
      }
      updates.module_key = module_key;
    }
    if (body.module_name !== undefined) {
      const module_name = String(body.module_name).trim();
      if (!module_name) {
        return res.status(400).json({ success: false, message: 'module_name cannot be empty' });
      }
      updates.module_name = module_name;
    }
    if (body.allowed_actions !== undefined) {
      const allowed_actions = normalizeAllowedActions(body.allowed_actions);
      if (!allowed_actions) {
        return res.status(400).json({
          success: false,
          message: `allowed_actions must only contain: ${ACTIONS.join(', ')}`,
        });
      }
      updates.allowed_actions = allowed_actions;
    }
    if (body.group_name !== undefined) updates.group_name = body.group_name;
    if (body.parent_id !== undefined) updates.parent_id = body.parent_id;
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order) || 0;
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

    await record.update(updates);
    await clearPermissionCache();

    return res.status(200).json({ success: true, message: 'Module updated', data: toResponse(record) });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await Module.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    await record.destroy();
    await clearPermissionCache();

    return res.status(200).json({ success: true, message: 'Module deleted' });
  }),
};

module.exports = moduleController;
