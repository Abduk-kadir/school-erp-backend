const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const { othercrousal } = require('../../models');
const { OTHERCARSOSLIDE_UPLOAD_ROOT } = require('../../middlewares/multerConfig');

function saveOthercrousalImageWithId(file, othercrousalId) {
  if (!file) return null;

  const originalName = file.originalname.replace(/\s+/g, '_');
  const newName = `${othercrousalId}-${originalName}`;
  const oldPath = path.join(OTHERCARSOSLIDE_UPLOAD_ROOT, file.filename);
  const newPath = path.join(OTHERCARSOSLIDE_UPLOAD_ROOT, newName);

  try {
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    console.error('Failed to rename othercrousal image:', err.message);
    return `/uploads/othercarsoslide/${file.filename}`;
  }

  return `/uploads/othercarsoslide/${newName}`;
}

function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const imagePath = path.join(OTHERCARSOSLIDE_UPLOAD_ROOT, path.basename(imageUrl));
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Failed to delete othercrousal image:', err.message);
      }
    });
  }
}

const othercrousalController = {
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
      const record = await othercrousal.create({
        image_url: null,
        title: title || null,
        heading: heading || null,
        subheading: subheading || null,
      });

      const image_url = saveOthercrousalImageWithId(file, record.id);
      await record.update({ image_url });
      data.push(record);
    }

    return res.status(201).json({
      success: true,
      message: 'Othercrousal slides created',
      count: data.length,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await othercrousal.findAll({
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

    const record = await othercrousal.findByPk(id);
    if (!record) {
      const err = new Error('Othercrousal slide not found');
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
      updates.image_url = saveOthercrousalImageWithId(file, record.id);
    }

    await record.update(updates);

    if (updates.image_url && oldImageUrl) {
      deleteImageFile(oldImageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Othercrousal slide updated',
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await othercrousal.findByPk(id);
    if (!record) {
      const err = new Error('Othercrousal slide not found');
      err.statusCode = 404;
      throw err;
    }

    const imageUrl = record.image_url;
    await record.destroy();
    deleteImageFile(imageUrl);

    return res.status(200).json({
      success: true,
      message: 'Othercrousal slide deleted',
    });
  }),
};

module.exports = othercrousalController;
