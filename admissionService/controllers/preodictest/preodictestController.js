const asyncHandler = require('express-async-handler');
const { QueryTypes } = require('sequelize');
const {
  preodictest,
  class_master,
  division_master,
  Subject,
  StaffRegistration,
  sequelize,
} = require('../../models');

const includeRelations = [
  { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
  { model: division_master, as: 'divisionInfo', attributes: ['id', 'division_name'] },
  { model: Subject, as: 'subjectInfo', attributes: ['id', 'value'] },
  {
    model: StaffRegistration,
    as: 'staffInfo',
    attributes: ['id', 'surname', 'firstname'],
  },
];

const preodictestController = {
  create: asyncHandler(async (req, res) => {
    const exam_name = req.body.exam_name ?? req.body.examName;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId ?? req.body.div;
    const subject = req.body.subject ?? req.body.subjectId;
    const staffid = req.body.staffid ?? req.body.staffId ?? req.body.staff;
    const date = req.body.date;
    const total_marks = req.body.total_marks ?? req.body.totalMarks;
    const topics = req.body.topics;

    if (
      !exam_name ||
      !classId ||
      !division ||
      !subject ||
      !date ||
      total_marks === undefined ||
      total_marks === null ||
      total_marks === ''
    ) {
      return res.status(400).json({
        success: false,
        message:
          'exam_name, class, division, subject, date, and total_marks are required',
      });
    }

    const record = await preodictest.create({
      exam_name,
      class: classId,
      division,
      subject,
      staffid: staffid || null,
      date,
      total_marks,
      topics: topics || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Periodic test created',
      data: record,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const query = `SELECT
      pt.id,
      pt.exam_name,
      pt.date,
      pt.total_marks,
      pt.topics,
      pt.createdAt,
      pt.updatedAt,
      cm.class_name,
      dv.division_name,
      sb.value AS subject_name,
      CONCAT_WS(' ', sf.surname, sf.firstname) AS staff_name
    FROM preodictests AS pt
    JOIN class_masters AS cm ON pt.class = cm.id
    JOIN division_masters AS dv ON pt.division = dv.id
    JOIN Subjects AS sb ON pt.subject = sb.id
    LEFT JOIN StaffRegistrations AS sf ON pt.staffid = sf.id
    ORDER BY pt.id DESC`;

    const records = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await preodictest.findByPk(id, {
      include: includeRelations,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Periodic test not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await preodictest.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Periodic test not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Periodic test deleted',
    });
  }),
};

module.exports = preodictestController;
