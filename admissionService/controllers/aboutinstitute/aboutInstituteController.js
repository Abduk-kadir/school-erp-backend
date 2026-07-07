const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const { aboutInstitute, aboutinstituteimage } = require('../../models');
const aboutInstituteController = {
  create: asyncHandler(async (req, res) => {
    const { text } = req.body;
    const record = await aboutInstitute.create({ text });

    const imageRecords = (req.files || []).map((file) => ({
      aboutinstId: record.id,
      image: `/uploads/aboutInstituteImage/${file.filename}`,
    }));

    const images = await aboutinstituteimage.bulkCreate(imageRecords);

    return res.status(201).json({
      success: true,
      data: { ...record.toJSON(), images },
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await aboutInstitute.findAll({
      include: [{ model: aboutinstituteimage, as: 'images' }],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await aboutInstitute.findByPk(id, {
      include: [{ model: aboutinstituteimage, as: 'images' }],
    });

    if (!record) {
      const err = new Error('About institute not found');
      err.statusCode = 404;
      throw err;
    }

    const imagePaths = (record.images || []).map((img) =>
      path.join('E:\\aboutInstituteImage', path.basename(img.image))
    );

    await record.destroy();

    for (const imagePath of imagePaths) {
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Failed to delete about institute image:', err.message);
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'About institute deleted',
    });
  }),
};
module.exports = aboutInstituteController;
