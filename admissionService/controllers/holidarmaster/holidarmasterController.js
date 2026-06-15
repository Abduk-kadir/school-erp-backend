const asyncHandler = require('express-async-handler');
const { holidarmaster, class_master, division_master, par_student_personal_information, sequelize, Sequelize } = require('../../models');
function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

function mapHolidayRow(row) {
  return {
    class: row.class ?? row.classId ?? row.classid,
    division: row.division ?? row.divisionId ?? row.divisionid,
    date: row.date,
    holiday: row.holiday ?? null,
  };
}

const holidarmasterController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    const payload = rows ? rows.map(mapHolidayRow) : [mapHolidayRow(req.body)];

    const invalid = payload.find((r) => !r.class || !r.division || !r.date);
    if (invalid) {
      const err = new Error('Each row requires class, division, and date');
      err.statusCode = 400;
      throw err;
    }

    const data =
      payload.length === 1
        ? await holidarmaster.create(payload[0])
        : await holidarmaster.bulkCreate(payload, { validate: true });

    return res.status(201).json({
      success: true,
      message: 'Holiday created',
      count: Array.isArray(data) ? data.length : 1,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await holidarmaster.findAll({
      include: [
        {
          model: class_master,
          as: 'classInfo',
          attributes: ['id', 'class_name', 'class_code'],
        },
        {
          model: division_master,
          as: 'divisionInfo',
          attributes: ['id', 'division_name', 'division_code'],
        },
      ],
      order: [
        ['date', 'DESC'],
        ['id', 'ASC'],
      ],
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  }),

  getHolidayMasterStudent: asyncHandler(async (req, res) => {
    const reg_no = Number(req.params.reg_no);
    if (!Number.isFinite(reg_no)) {
      const err = new Error('reg_no is required (numeric)');
      err.statusCode = 400;
      throw err;
    }

    const student = await par_student_personal_information.findOne({
      where: { reg_no },
      raw: true,
    });

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    const query = `
      SELECT hm.*, cm.class_name, dv.division_name
      FROM holidar_masters AS hm
      JOIN class_masters AS cm ON hm.class = cm.id
      JOIN division_masters AS dv ON hm.division = dv.id
      WHERE hm.class = :classId AND hm.division = :division
      ORDER BY hm.date DESC, hm.id ASC
    `;

    const data = await sequelize.query(query, {
      replacements: {
        classId: student.class,
        division: student.division,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  }),
};
module.exports = holidarmasterController;
