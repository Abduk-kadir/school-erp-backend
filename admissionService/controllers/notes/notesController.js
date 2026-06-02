const asyncHandler = require('express-async-handler');
const { QueryTypes } = require('sequelize');
const { notes, sequelize } = require('../../models');

const notesController = {
  create: asyncHandler(async (req, res) => {
    const batchId = req.body.batch ?? req.body.batchId;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId;
    const subject = req.body.subject ?? req.body.subjectId;
    const { topic, chapter, url } = req.body;

    if (!classId || !batchId || !division || !subject || !topic || !chapter || !url) {
      return res.status(400).json({
        success: false,
        message:
          'class/classId, batch/batchId, division/divisionId, subject/subjectId, topic, chapter, and url are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Notes file is required (field name: notes)',
      });
    }

    const notes_url = `/uploads/notes/${req.file.filename}`;

    const newNotes = await notes.create({
      class: classId,
      batch: batchId,
      division,
      subject,
      topic,
      chapter,
      url,
      notes_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Notes created',
      data: newNotes,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const fromDate = req.query['filter[fromDate]'] || '';
    const toDate = req.query['filter[toDate]'] || '';
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[divisionId]'] || '';
    const batch = req.query['filter[batchId]'] || '';

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(nt.\`createdAt\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(nt.\`createdAt\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(nt.\`createdAt\`) <= '${toDate}'`);
    }
    if (className) {
      whereClause.push(`nt.\`class\` = ${className}`);
    }
    if (division) {
      whereClause.push(`nt.\`division\` = ${division}`);
    }
    if (batch) {
      whereClause.push(`nt.\`batch\` = ${batch}`);
    }
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
    const query = `select nt.*, bt.batch_name, cm.class_name, dv.division_name, sb.value as subject_name from notes
   as nt join batches as bt on nt.batch=bt.id
   join division_masters as dv on nt.division= dv.id
   join class_masters as cm on nt.class = cm.id
   join Subjects as sb on nt.subject = sb.id
   ${whereSql}
   LIMIT ${length} OFFSET ${start}`;

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      draw,
    });
  }),
};

module.exports = notesController;
