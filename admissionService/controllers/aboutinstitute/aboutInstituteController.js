const asyncHandler = require('express-async-handler');
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
};

module.exports = aboutInstituteController;
