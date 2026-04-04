const { QueryTypes, Op } = require('sequelize');
const {
  FeeRecordMonthly,
  PersonalInformation,
  FeeHead,
  sequelize,
  FeeCollection,
  class_master
} = require('../models');

const LATEST_PER_FEE_TABLE_MIN = 1;
const LATEST_PER_FEE_TABLE_DEFAULT = 100;
const LATEST_PER_FEE_TABLE_MAX = 10000;

const getFeeRecordByRegNo = async (req, res) => {
  try {
    const { reg_no } = req.params;

    if (!reg_no) {
      return res.status(400).json({ success: false, message: 'reg_no is required' });
    }

    const feeCollection = await FeeCollection.findOne({
      where: { reg_no },
      order: [['id', 'DESC']]
    });

    if (!feeCollection) {
      return res.status(404).json({ success: false, message: 'no fee record found' });
    }

    const fee_table_id = feeCollection.id;
    const fee_records = await FeeRecordMonthly.findAll({
      where: { fee_table_id },
      include: [
        {
          model: PersonalInformation,
          as: 'student',
          attributes: ['first_name', 'last_name', 'father_name', 'class', 'division', 'email', 'contact_number']
        },
        {
          model: FeeHead,
          as: 'feeHeadInfo',
          attributes: ['id', 'fee_head_name', 'is_refundable', 'status']
        }
      ]
    });

    return res.status(200).json({ success: true, data: {fee_records } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createFeeRecordMonthly = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'records must be a non-empty array' });
    }

    const requiredFields = ['reg_no', 'fee_head', 'fee_table_id'];
    for (let i = 0; i < records.length; i++) {
      for (const field of requiredFields) {
        if (records[i][field] == null) {
          return res.status(400).json({
            success: false,
            message: `records[${i}] is missing required field: ${field}`
          });
        }
      }
    }

    const sanitizedRecords = records.map(({ id, ...rest }) => rest);
    const data = await FeeRecordMonthly.bulkCreate(sanitizedRecords, { transaction });
    await transaction.commit();

    return res.status(201).json({ success: true, message: `${data.length} record(s) created`, data });
  } catch (error) {
    await transaction.rollback();
    console.error('createFeeRecordMonthly error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Latest FeeRecordMonthly row per fee_table_id (MAX id), with student + class_master + fee head.
 * GET /latest-by-table
 * Query: limit (default 100, max 10000), fee_head (optional), class (optional — PersonalInformation.class).
 */
const getLatestPerFeeTable = async (req, res) => {
  try {
    const { fee_head, class: classFilter } = req.query;
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, LATEST_PER_FEE_TABLE_MIN), LATEST_PER_FEE_TABLE_MAX)
      : LATEST_PER_FEE_TABLE_DEFAULT;

    const frTable = FeeRecordMonthly.getTableName();
    const piTable = PersonalInformation.getTableName();

    const parts = [
      `SELECT fr.\`id\``,
      `FROM \`${frTable}\` fr`,
      `INNER JOIN (`,
      `  SELECT MAX(\`s\`.\`id\`) AS \`id\` FROM \`${frTable}\` AS \`s\` GROUP BY \`s\`.\`fee_table_id\``,
      `) latest ON fr.\`id\` = latest.\`id\``
    ];
    const replacements = [];

    if (classFilter != null && String(classFilter).trim() !== '') {
      parts.push(
        `INNER JOIN \`${piTable}\` p ON fr.\`reg_no\` = p.\`reg_no\` AND p.\`class\` = ?`
      );
      replacements.push(String(classFilter));
    }

    parts.push(`WHERE 1=1`);
    if (fee_head != null && String(fee_head).trim() !== '') {
      parts.push(`AND fr.\`fee_head\` = ?`);
      replacements.push(String(fee_head));
    }

    parts.push(`ORDER BY fr.\`fee_table_id\` ASC, fr.\`id\` ASC`);
    parts.push(`LIMIT ?`);
    replacements.push(limit);

    const idRows = await sequelize.query(parts.join('\n'), {
      replacements,
      type: QueryTypes.SELECT
    });

    const ids = idRows.map((r) => r.id).filter((id) => id != null);
    if (ids.length === 0) {
      return res.status(200).json({
        success: true,
        limit,
        filters: {
          fee_head: fee_head != null && String(fee_head).trim() !== '' ? String(fee_head) : null,
          class: classFilter != null && String(classFilter).trim() !== '' ? String(classFilter) : null
        },
        count: 0,
        fee_table_ids: [],
        data: []
      });
    }

    const data = await FeeRecordMonthly.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        {
          model: PersonalInformation,
          as: 'student',
          attributes: ['first_name', 'last_name', 'class', 'division', 'reg_no'],
          include: [
            {
              model: class_master,
              as: 'classInfo',
              attributes: ['id', 'class_name', 'class_code', 'fall_in_category', 'status'],
              required: false
            }
          ]
        },
        {
          model: FeeHead,
          as: 'feeHeadInfo',
          attributes: ['id', 'fee_head_name', 'is_refundable', 'status']
        }
      ],
      order: [
        ['fee_table_id', 'ASC'],
        ['id', 'ASC']
      ]
    });

    const fee_table_ids = [...new Set(data.map((row) => row.fee_table_id).filter((id) => id != null))];

    return res.status(200).json({
      success: true,
      limit,
      filters: {
        fee_head: fee_head != null && String(fee_head).trim() !== '' ? String(fee_head) : null,
        class: classFilter != null && String(classFilter).trim() !== '' ? String(classFilter) : null
      },
      count: data.length,
      fee_table_ids,
      data
    });
  } catch (error) {
    console.error('getLatestPerFeeTable error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getFeeRecordByRegNo, createFeeRecordMonthly, getLatestPerFeeTable };
