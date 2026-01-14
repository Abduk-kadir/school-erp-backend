const { Role_Master } = require('../models');

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    if (!role_name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    // Check if role already exists (optional)
    const existingRole = await Role_Master.findOne({ where: { role_name } });
    if (existingRole) {
      return res.status(409).json({ message: 'Role already exists', success:false});
    }

    const role = await Role_Master.create({ role_name });
    res.status(201).json({ message: 'Role created', data: role,success:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message,success:false });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role_Master.findAll();
    res.status(200).json({ data: roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role_Master.findByPk(id);

    if (!role) return res.status(404).json({ message: 'Role not found' });

    res.status(200).json({ data: role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update role by ID
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name } = req.body;

    const role = await Role_Master.findByPk(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    await role.update({ role_name });
    res.status(200).json({ message: 'Role updated', data: role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete role by ID
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role_Master.findByPk(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    await role.destroy();
    res.status(200).json({ message: 'Role deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
