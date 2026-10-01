const asyncHandler = require('express-async-handler');
const { Role, StaffRegistration } = require('../../models');
const { getDataTable } = require('../../helper');

const roleController = {
  create: asyncHandler(async (req, res) => {
    const role_name = String(req.body?.role_name || '').trim();
    if (!role_name) {
      return res.status(400).json({ success: false, message: 'role_name is required' });
    }

    const existing = await Role.findOne({ where: { role_name } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Role already exists' });
    }

    const record = await Role.create({
      role_name,
      description: req.body?.description ?? null,
      is_super_admin: Boolean(req.body?.is_super_admin),
      is_active: req.body?.is_active === undefined ? true : Boolean(req.body.is_active),
    });

    return res.status(201).json({ success: true, message: 'Role created', data: record });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, Role, ['role_name']);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const record = await Role.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    return res.status(200).json({ success: true, data: record });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await Role.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const updates = {};
    if (req.body?.role_name !== undefined) {
      const role_name = String(req.body.role_name).trim();
      if (!role_name) {
        return res.status(400).json({ success: false, message: 'role_name cannot be empty' });
      }
      const duplicate = await Role.findOne({ where: { role_name } });
      if (duplicate && duplicate.id !== record.id) {
        return res.status(409).json({ success: false, message: 'Role already exists' });
      }
      updates.role_name = role_name;
    }
    if (req.body?.description !== undefined) updates.description = req.body.description;
    if (req.body?.is_super_admin !== undefined) updates.is_super_admin = Boolean(req.body.is_super_admin);
    if (req.body?.is_active !== undefined) updates.is_active = Boolean(req.body.is_active);

    await record.update(updates);

    return res.status(200).json({ success: true, message: 'Role updated', data: record });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await Role.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const assigned = await StaffRegistration.count({ where: { role_id: record.id } });
    if (assigned > 0) {
      return res.status(409).json({
        success: false,
        message: `Role is assigned to ${assigned} staff member(s). Reassign them before deleting.`,
      });
    }

    await record.destroy();

    return res.status(200).json({ success: true, message: 'Role deleted' });
  }),

  /** body: { staff_ids: [1, 2, 3] } */
  assignToStaff: asyncHandler(async (req, res) => {
    const record = await Role.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const staffIds = Array.isArray(req.body?.staff_ids)
      ? req.body.staff_ids.map(Number).filter(Number.isInteger)
      : [];
    if (staffIds.length === 0) {
      return res.status(400).json({ success: false, message: 'staff_ids must be a non-empty array of ids' });
    }

    const [updated] = await StaffRegistration.update(
      { role_id: record.id },
      { where: { id: staffIds } }
    );

    return res.status(200).json({
      success: true,
      message: 'Role assigned',
      role_id: record.id,
      updated,
    });
  }),
};

module.exports = roleController;
