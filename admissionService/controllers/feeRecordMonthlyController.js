const { QueryTypes, Op} = require('sequelize');
const ExcelJS=require('exceljs');
const stringify = require('csv-stringify');


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
    console.log('feetable id********************',fee_table_id)
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
          as: 'feeHead',
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

    const requiredFields = ['reg_no', 'feeheadid', 'fee_table_id'];
    for (let i = 0; i < records.length; i++) {
      for (const field of requiredFields) {
        // backward-compat: allow fee_head in payload, map to feeheadid
        if (field === 'feeheadid' && records[i].feeheadid == null && records[i].fee_head != null) {
          records[i].feeheadid = records[i].fee_head;
          delete records[i].fee_head;
        }
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
    const { feeheadid, fee_head, class: classFilter } = req.query;
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
    const feeheadFilter =
      feeheadid != null && String(feeheadid).trim() !== ''
        ? String(feeheadid)
        : fee_head != null && String(fee_head).trim() !== ''
          ? String(fee_head)
          : null;
    if (feeheadFilter != null) {
      parts.push(`AND fr.\`feeheadid\` = ?`);
      replacements.push(feeheadFilter);
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
          feeheadid: feeheadFilter,
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
          as: 'feeHead',
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
        feeheadid: feeheadFilter,
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
const getLatestFeeExcel = async (req, res) => {
  try {
    const { fromDate, toDate, paymentStatus, className } = req.query;

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(fm.\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(fm.\`date\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(fm.\`date\`) <= '${toDate}'`);
    }

    if (className !== undefined && className !== null && String(className).trim() !== '') {
      const classId = parseInt(className, 10);
      if (!Number.isNaN(classId)) {
        whereClause.push(`p.\`class\` = ${classId}`);
      }
    }
    if (paymentStatus) {
      const safe = String(paymentStatus).replace(/'/g, "''");
      whereClause.push(`\`payment_mode\`='${safe}'`);
    }

    const query = `
      SELECT 
        p.first_name,
        fh.fee_head_name,
        fm.jan_total, fm.jan_paid, fm.feb_total, fm.feb_paid, fm.mar_total, fm.mar_paid, fm.apr_total, fm.apr_paid,
        fm.may_total,fm.may_paid, fm.jun_total, fm.jun_paid, fm.jul_total, fm.jul_paid, fm.aug_total, fm.aug_paid,
        fm.sep_total,fm.sep_paid, fm.oct_total, fm.oct_paid, fm.nov_total, fm.nov_paid, fm.dec_total, fm.dec_paid
      FROM personalinformations AS p
      JOIN feecollections AS fc ON fc.id = (
        SELECT MAX(id) FROM feecollections WHERE reg_no = p.reg_no
      )
      JOIN feerecordmonthlies AS fm ON fc.id = fm.fee_table_id
      JOIN feeheads AS fh ON fm.feeheadid = fh.id
      ORDER BY p.reg_no, fh.fee_head_name`;
     const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=head_wise_fee_collection.xlsx');

    // Stream must attach after headers; commit() ends the zip → finishes res (do not call res.end() after).
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useSharedStrings: true,
      useStyles: false
    });

    const sheet = workbook.addWorksheet('head wise fee collection');

    sheet.columns = [
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Fee Head', key: 'fee_head_name', width: 25 },
      { header: 'January', key: 'jan_total', width: 12 },
      {header:"Jan Paid", key:"jan_paid", width: 12 },

      { header: 'February', key: 'feb_total', width: 12 },
      {header:"Feb Paid", key:"feb_paid", width: 12 },

      { header: 'March', key: 'mar_total', width: 12 },
      {header:"Mar Paid", key:"mar_paid", width: 12 },

      { header: 'April', key: 'apr_total', width: 12 },
      {header:"Apr Paid", key:"apr_paid", width: 12 },

      { header: 'May', key: 'may_total', width: 12 },
      {header:"May Paid", key:"may_paid", width: 12 },

      { header: 'June', key: 'jun_total', width: 12 },
      {header:"Jun Paid", key:"jun_paid", width: 12 },

      { header: 'July', key: 'jul_total', width: 12 },
      {header:"Jul Paid", key:"jul_paid", width: 12 },

      { header: 'August', key: 'aug_total', width: 12 },
      {header:"Aug Paid", key:"aug_paid", width: 12 },

      { header: 'September', key: 'sep_total', width: 12 },
      {header:"Sep Paid", key:"sep_paid", width: 12 },

      { header: 'October', key: 'oct_total', width: 12 },
      {header:"Oct Paid", key:"oct_paid", width: 12 },

      { header: 'November', key: 'nov_total', width: 12 },
      {header:"Nov Paid", key:"nov_paid", width: 12 },

      { header: 'December', key: 'dec_total', width: 12 },
      {header:"Dec Paid", key:"dec_paid", width: 12 },
    ];

    // Fetch and write row by row (or in small batches)
    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true
    });

    const BATCH_SIZE = 1000;   // Adjust if needed

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      for (const row of batch) {
        sheet.addRow(row).commit();   // commit releases memory
      }
    }

    await workbook.commit();   // Finalize and send file

  } catch (error) {
    console.error("Excel generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
}

const getLatestFeeCSV = async (req, res) => {
  try {
    const { fromDate, toDate, paymentStatus, className } = req.query;

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(fm.\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(fm.\`date\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(fm.\`date\`) <= '${toDate}'`);
    }

    if (className !== undefined && className !== null && String(className).trim() !== '') {
      const classId = parseInt(className, 10);
      if (!Number.isNaN(classId)) {
        whereClause.push(`p.\`class\` = ${classId}`);
      }
    }
    if (paymentStatus) {
      const safe = String(paymentStatus).replace(/'/g, "''");
      whereClause.push(`fc.payment_mode='${safe}'`);
    }

    

    const query = `
      SELECT 
        p.first_name,
        fh.fee_head_name,
        fm.jan_total, fm.jan_paid, fm.feb_total, fm.feb_paid, fm.mar_total, fm.mar_paid, 
        fm.apr_total, fm.apr_paid, fm.may_total, fm.may_paid, fm.jun_total, fm.jun_paid, 
        fm.jul_total, fm.jul_paid, fm.aug_total, fm.aug_paid, fm.sep_total, fm.sep_paid, 
        fm.oct_total, fm.oct_paid, fm.nov_total, fm.nov_paid, fm.dec_total, fm.dec_paid
      FROM personalinformations AS p
      JOIN feecollections AS fc ON fc.id = (
        SELECT MAX(id) FROM feecollections WHERE reg_no = p.reg_no
      )
      JOIN feerecordmonthlies AS fm ON fc.id = fm.fee_table_id
      JOIN feeheads AS fh ON fm.feeheadid = fh.id
      ORDER BY p.reg_no, fh.fee_head_name`;
      const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true
    });

    // csv-stringify needs { key, header } — keys must match SQL column aliases (first_name, jan_total, …)
    const csvColumns = [
      { key: 'first_name', header: 'First Name' },
      { key: 'fee_head_name', header: 'Fee Head' },
      { key: 'jan_total', header: 'January' },
      { key: 'jan_paid', header: 'Jan Paid' },
      { key: 'feb_total', header: 'February' },
      { key: 'feb_paid', header: 'Feb Paid' },
      { key: 'mar_total', header: 'March' },
      { key: 'mar_paid', header: 'Mar Paid' },
      { key: 'apr_total', header: 'April' },
      { key: 'apr_paid', header: 'Apr Paid' },
      { key: 'may_total', header: 'May' },
      { key: 'may_paid', header: 'May Paid' },
      { key: 'jun_total', header: 'June' },
      { key: 'jun_paid', header: 'Jun Paid' },
      { key: 'jul_total', header: 'July' },
      { key: 'jul_paid', header: 'Jul Paid' },
      { key: 'aug_total', header: 'August' },
      { key: 'aug_paid', header: 'Aug Paid' },
      { key: 'sep_total', header: 'September' },
      { key: 'sep_paid', header: 'Sep Paid' },
      { key: 'oct_total', header: 'October' },
      { key: 'oct_paid', header: 'Oct Paid' },
      { key: 'nov_total', header: 'November' },
      { key: 'nov_paid', header: 'Nov Paid' },
      { key: 'dec_total', header: 'December' },
      { key: 'dec_paid', header: 'Dec Paid' }
    ];

    const output = await new Promise((resolve, reject) => {
      stringify.stringify(
        results,
        {
          header: true,
          columns: csvColumns,
          quoted: true,
          bom: true
        },
        (err, csv) => {
          if (err) reject(err);
          else resolve(csv);
        }
      );
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=head_wise_fee_collection.csv');
    res.send(output);
  } catch (error) {
    console.error('CSV generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
};

module.exports = { getFeeRecordByRegNo, createFeeRecordMonthly, getLatestPerFeeTable,getLatestFeeExcel,getLatestFeeCSV };
