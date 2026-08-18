const asyncHandler = require('express-async-handler');
const { class_div_map_master, class_master, division_master } = require('../models');
const { getDataTable } = require('../helper');

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

function mapRow(row) {
  return {
    classid: row.classid ?? row.classId ?? row.class,
    divisionid: row.divisionid ?? row.divisionId ?? row.division,
  };
}

const classDivMapMasterController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    const payload = rows ? rows.map(mapRow) : [mapRow(req.body)];

    const invalid = payload.find((r) => !r.classid || !r.divisionid);
    if (invalid) {
      return res.status(400).json({
        success: false,
        message: 'classid and divisionid are required',
      });
    }

    const data =
      payload.length === 1
        ? await class_div_map_master.create(payload[0])
        : await class_div_map_master.bulkCreate(payload, { validate: true });

    return res.status(201).json({
      success: true,
      message: 'Class division map created',
      count: Array.isArray(data) ? data.length : 1,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
   

    const result = await getDataTable(
      req,
      class_div_map_master,
        [],
        {},
        [
          {
            model: class_master,
            as: 'classInfo',
            attributes: ['id', 'class_name', 'class_code'],
          },
          {
            model: division_master,
            as: 'divisionInfo',
            attributes: ['id', 'division_name', 'division_code'],
          }
          
        ]);
      res.json(result);
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await class_div_map_master.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Class division map not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Class division map deleted',
    });
  }),
};

module.exports = classDivMapMasterController;
