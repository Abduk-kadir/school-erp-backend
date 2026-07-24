const asyncHandler = require('express-async-handler');
const { institute } = require('../models');
const path = require('path');
const fs = require('fs');
const { LOGO_UPLOAD_ROOT } = require('../middlewares/multerConfig');

const instituteController = {
  create: asyncHandler(async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'name and code are required' });
    }

    let logoPath = null;

    if (req.file) {
      logoPath = `/uploads/institutes/logos/${req.file.filename}`;
    }
    console.log('path is:', req.file);

    const inst = await institute.create({
      name,
      code,
      logo: logoPath,
    });

    return res.status(201).json({
      message: 'institute created successfully',
      data: inst,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code } = req.body;

    const inst = await institute.findByPk(id);
    if (!inst) {
      const err = new Error('institute not found');
      err.statusCode = 404;
      throw err;
    }

    let logoPath = inst.logo;
    let oldLogoFullPath = null;

    if (req.file) {
      logoPath = `/uploads/institutes/logos/${req.file.filename}`;

      if (inst.logo) {
        oldLogoFullPath = path.join(
          LOGO_UPLOAD_ROOT,
          path.basename(inst.logo)
        );
      }
    }

    await inst.update({
      name: name || inst.name,
      code: code || inst.code,
      logo: logoPath,
    });

    if (oldLogoFullPath && fs.existsSync(oldLogoFullPath)) {
      fs.unlink(oldLogoFullPath, (err) => {
        if (err) {
          console.error('Failed to delete old logo file:', err.message);
        } else {
          console.log('Old logo deleted successfully:', oldLogoFullPath);
        }
      });
    }

    return res.json({ message: 'institute updated', data: inst });
  }),

  getAll: asyncHandler(async (req, res) => {
    const institutes = await institute.findAll();

    return res.json({ success: true, data: institutes });
  }),

  getOne: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const inst = await institute.findByPk(id);
    if (!inst) {
      const err = new Error('institute not found');
      err.statusCode = 404;
      throw err;
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const response = {
      ...inst.toJSON(),
      logo: inst.logo ? `${baseUrl}${inst.logo}` : null,
    };

    return res.json(response);
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const inst = await institute.findByPk(id);
    if (!inst) {
      const err = new Error('institute not found');
      err.statusCode = 404;
      throw err;
    }

    let logoFullPath = null;
    if (inst.logo) {
      logoFullPath = path.join(
        LOGO_UPLOAD_ROOT,
        path.basename(inst.logo)
      );
    }

    await inst.destroy();

    if (logoFullPath && fs.existsSync(logoFullPath)) {
      fs.unlink(logoFullPath, (err) => {
        if (err) {
          console.error('Failed to delete logo file:', err.message);
        } else {
          console.log('Logo deleted successfully:', logoFullPath);
        }
      });
    }

    return res.json({ message: 'institute deleted successfully' });
  }),
};

module.exports = instituteController;
