const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const { carsoul } = require('../../models');
const { CARSOSLIDE_UPLOAD_ROOT } = require('../../middlewares/multerConfig');

function saveCarsoulImageWithId(file, carsoulId) {
  if (!file) return null;

  const originalName = file.originalname.replace(/\s+/g, '_');
  const newName = `${carsoulId}-${originalName}`;
  const oldPath = path.join(CARSOSLIDE_UPLOAD_ROOT, file.filename);
  const newPath = path.join(CARSOSLIDE_UPLOAD_ROOT, newName);

  try {
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    console.error('Failed to rename carsoul image:', err.message);
    return `/uploads/carsoslide/${file.filename}`;
  }

  return `/uploads/carsoslide/${newName}`;
}

function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const imagePath = path.join(CARSOSLIDE_UPLOAD_ROOT, path.basename(imageUrl));
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Failed to delete carsoul image:', err.message);
      }
    });
  }
}

const carsoulController = {
  create: asyncHandler(async (req, res) => {
    const { title, heading, subheading } = req.body || {};
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required (field name: images)',
      });
    }

    const data = [];

    for (const file of files) {
      const record = await carsoul.create({
        image_url: null,
        title: title || null,
        heading: heading || null,
        subheading: subheading || null,
      });

      const image_url = saveCarsoulImageWithId(file, record.id);
      await record.update({ image_url });
      data.push(record);
    }

    return res.status(201).json({
      success: true,
      message: 'Carsoul slides created',
      count: data.length,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await carsoul.findAll({
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, heading, subheading } = req.body || {};

    const record = await carsoul.findByPk(id);
    if (!record) {
      const err = new Error('Carsoul slide not found');
      err.statusCode = 404;
      throw err;
    }

    const oldImageUrl = record.image_url;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (heading !== undefined) updates.heading = heading;
    if (subheading !== undefined) updates.subheading = subheading;

    const file = (req.files && req.files[0]) || req.file || null;
    if (file) {
      updates.image_url = saveCarsoulImageWithId(file, record.id);
    }

    await record.update(updates);

    if (updates.image_url && oldImageUrl) {
      deleteImageFile(oldImageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Carsoul slide updated',
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await carsoul.findByPk(id);
    if (!record) {
      const err = new Error('Carsoul slide not found');
      err.statusCode = 404;
      throw err;
    }

    const imageUrl = record.image_url;
    await record.destroy();
    deleteImageFile(imageUrl);

    return res.status(200).json({
      success: true,
      message: 'Carsoul slide deleted',
    });
  }),
};

module.exports = carsoulController;
