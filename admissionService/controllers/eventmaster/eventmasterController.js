const asyncHandler = require('express-async-handler');
const { eventmaster, class_master, division_master, par_student_personal_information, sequelize, Sequelize } = require('../../models');
function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

function mapEventRow(row) {
  return {
    class: row.class ?? row.classId ?? row.classid,
    division: row.division ?? row.divisionId ?? row.divisionid,
    date: row.date,
    event: row.event ?? null,
  };
}

const eventmasterController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    const payload = rows ? rows.map(mapEventRow) : [mapEventRow(req.body)];

    const invalid = payload.find((r) => !r.class || !r.division || !r.date);
    if (invalid) {
      const err = new Error('Each row requires class, division, and date');
      err.statusCode = 400;
      throw err;
    }

    const data =
      payload.length === 1
        ? await eventmaster.create(payload[0])
        : await eventmaster.bulkCreate(payload, { validate: true });

    return res.status(201).json({
      success: true,
      message: 'Event created',
      count: Array.isArray(data) ? data.length : 1,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await eventmaster.findAll({
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
  getEventMasterStudent: asyncHandler(async (req, res) => {
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
      SELECT em.*, cm.class_name, dv.division_name
      FROM event_masters AS em
      JOIN class_masters AS cm ON em.class = cm.id
      JOIN division_masters AS dv ON em.division = dv.id
      WHERE em.class = :classId AND em.division = :division
      ORDER BY em.date DESC, em.id ASC
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

module.exports = eventmasterController;
