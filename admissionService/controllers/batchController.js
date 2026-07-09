const asyncHandler = require('express-async-handler');
const { batch, batchmaster, class_master, division_master, sequelize, Sequelize } = require('../models');

function toNullIfEmpty(value) {
  return value === '' || value == null ? null : value;
}

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.batchmasters)) return body.batchmasters;
  if (body && Array.isArray(body.batchMasters)) return body.batchMasters;
  return null;
}

const batchController = {
  create: asyncHandler(async (req, res) => {
    const { batch_name, starttime, endtime, personname, contactperson } = req.body;

    if (!batch_name) {
      return res.status(400).json({
        success: false,
        message: 'batch_name is required',
      });
    }

    const rows = getRowsFromBody(req.body);
    if (rows && rows.length > 0) {
      const invalidRow = rows.find((r) => {
        const classid = r.classid ?? r.classId ?? r.class;
        return !classid;
      });
      if (invalidRow) {
        const err = new Error('Each batchmaster row requires classid/classId/class');
        err.statusCode = 400;
        throw err;
      }
    }

    const result = await sequelize.transaction(async (t) => {
      const newBatch = await batch.create(
        {
          batch_name,
          starttime: toNullIfEmpty(starttime),
          endtime: toNullIfEmpty(endtime),
          personname: toNullIfEmpty(personname),
          contactperson: toNullIfEmpty(contactperson),
        },
        { transaction: t }
      );

      if (rows && rows.length > 0) {
        const payload = rows.map((r) => {
          const classid = r.classid ?? r.classId ?? r.class;
          const divisionid = r.divisionid ?? r.divisionId ?? r.division ?? r.div ?? r.divId;
          return {
            batchid: newBatch.id,
            classid,
            divisionid: divisionid ?? null,
          };
        });

        await batchmaster.bulkCreate(payload, { validate: true, transaction: t });
      }

      return { newBatch };
    });

    return res.status(201).json({
      success: true,
      message: 'Batch created',
      data: result.newBatch,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const query = `
      SELECT
        bt.id,
        bt.batch_name,
        bt.starttime,
        bt.endtime,
        bt.personname,
        bt.contactperson,
        GROUP_CONCAT(DISTINCT cl.class_name ORDER BY cl.class_name SEPARATOR ', ') AS class_names,
        GROUP_CONCAT(DISTINCT d.division_name ORDER BY d.division_name SEPARATOR ', ') AS division_names
      FROM batch_masters AS bm
      JOIN class_masters AS cl
        ON bm.classid = cl.id
      LEFT JOIN division_masters AS d
        ON d.id = bm.divisionid
      JOIN batches AS bt
        ON bt.id = bm.batchid
      GROUP BY
        bt.id,
        bt.batch_name,
        bt.starttime,
        bt.endtime,
        bt.personname,
        bt.contactperson
      ORDER BY bt.id ASC
    `;

    const batches = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existingBatch = await batch.findByPk(id);
    if (!existingBatch) {
      const err = new Error('Batch not found');
      err.statusCode = 404;
      throw err;
    }

    await sequelize.transaction(async (t) => {
      await batchmaster.destroy({ where: { batchid: id }, transaction: t });
      await existingBatch.destroy({ transaction: t });
    });

    return res.status(200).json({
      success: true,
      message: 'Batch deleted',
    });
  }),

  

  getBatchRelations: asyncHandler(async (req, res) => {
    const batchId = req.params.batchId ?? req.params.id;
    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'batchId is required in route params',
      });
    }

    const rows = await batchmaster.findAll({
      where: { batchid: batchId },
      include: [
        { model: batch, as: 'batchInfo', attributes: ['id', 'batch_name'] },
        { model: class_master, as: 'classInfo', attributes: ['id', 'class_name', 'class_code'] },
        {
          model: division_master,
          as: 'divisionInfo',
          attributes: ['id', 'division_name', 'division_code'],
        },
      ],
      order: [['id', 'ASC']],
    });

    const batchInfo = rows[0]?.batchInfo ?? null;

    const classMap = new Map();
    const divisionMap = new Map();

    for (const r of rows) {
      if (r.classInfo) classMap.set(r.classInfo.id, r.classInfo);
      if (r.divisionInfo) divisionMap.set(r.divisionInfo.id, r.divisionInfo);
    }

    return res.status(200).json({
      success: true,
      batch: batchInfo,
      division: Array.from(divisionMap.values()),
      class: Array.from(classMap.values()),
    });
  }),
};

module.exports = batchController;
