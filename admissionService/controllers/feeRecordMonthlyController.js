const { QueryTypes, Op } = require('sequelize');
const ExcelJS = require('exceljs');
const stringify = require('csv-stringify');
const PDFDocument = require('pdfkit-table');


const {
  FeeRecordMonthly,
  PersonalInformation,
  FeeHead,
  sequelize,
  FeeCollection,
  class_master
} = require('../models');


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
    console.log('feetable id********************', fee_table_id)
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

    return res.status(200).json({ success: true, data: { fee_records } });
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
   
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const fromDate = req.query['filter[fromDate]'] || '';
    const toDate = req.query['filter[toDate]'] || '';
    const className = req.query['filter[className]'] || '';
    const paymentStatus=req.query['filter[paymentStatus]']||'';
  
    const whereClause = [];
    if(search){
      whereClause.push(`p.first_name LIKE '%${search}%'  OR p.class LIKE '%${search}%' OR p.reg_no LIKE '%${search}%' OR fh.fee_head_name LIKE '%${search}%'`);
    }
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
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
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
      ${whereSql}
      ORDER BY p.reg_no, fh.fee_head_name
      LIMIT ${length} OFFSET ${start}`;
    
    
   const result=await sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true
   });
   return res.status(200).json({
    success: true,
    data: result,
    draw: draw,
    
   });
  
    
  } catch (error) {
    console.error('getLatestPerFeeTable error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const HEAD_WISE_FEE_PDF_HEADERS = [
  'Name',
  'Fee Head',
  'January',
  'Jan Paid',
  'February',
  'Feb Paid',
  'March',
  'Mar Paid',
  'April',
  'Apr Paid',
  'May',
  'May Paid',
  'June',
  'Jun Paid',
  'July',
  'Jul Paid',
  'August',
  'Aug Paid',
  'September',
  'Sep Paid',
  'October',
  'Oct Paid',
  'November',
  'Nov Paid',
  'December',
  'Dec Paid',
];

function feeRecordRowToPdfCells(r) {
  const c = (v) => (v != null && v !== '' ? String(v) : '');
  return [
    c(r.first_name),
    c(r.fee_head_name),
    c(r.jan_total),
    c(r.jan_paid),
    c(r.feb_total),
    c(r.feb_paid),
    c(r.mar_total),
    c(r.mar_paid),
    c(r.apr_total),
    c(r.apr_paid),
    c(r.may_total),
    c(r.may_paid),
    c(r.jun_total),
    c(r.jun_paid),
    c(r.jul_total),
    c(r.jul_paid),
    c(r.aug_total),
    c(r.aug_paid),
    c(r.sep_total),
    c(r.sep_paid),
    c(r.oct_total),
    c(r.oct_paid),
    c(r.nov_total),
    c(r.nov_paid),
    c(r.dec_total),
    c(r.dec_paid),
  ];
}

const getLatestFeePDF = async (req, res) => {
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
        p.class,
        fh.fee_head_name,
        fm.jan_total, fm.jan_paid, fm.feb_total, fm.feb_paid, fm.mar_total, fm.mar_paid, fm.apr_total, fm.apr_paid,
        fm.may_total,fm.may_paid, fm.jun_total, fm.jun_paid, fm.jul_total, fm.jul_paid, fm.aug_total, fm.aug_paid,
        fm.sep_total,fm.sep_paid, fm.oct_total, fm.oct_paid, fm.nov_total, fm.nov_paid, fm.dec_total, fm.dec_paid
      FROM personalinformations AS p
      JOIN feecollections AS fc ON fc.id = (
        SELECT MAX(id) FROM feecollections WHERE reg_no = p.reg_no
      )
      JOIN feerecordmonthlies AS fm ON fc.id = fm.fee_table_id
      JOIN feeheads AS fh ON fm.feeheadid = fh.id`;
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';

    const results = await sequelize.query(query + whereSql, {
      type: QueryTypes.SELECT,
      raw: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=head_wise_fee_collection.pdf');

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 16,
    });

    doc.pipe(res);

    doc.fontSize(10).text('Head Wise Fee Collection Report', { align: 'center' });
    doc.moveDown(0.35);

    if (!results.length) {
      doc.fontSize(9).text('No records found.', { align: 'left' });
      doc.end();
      return;
    }

    const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colCount = HEAD_WISE_FEE_PDF_HEADERS.length;
    const columnsSize = Array(colCount).fill(tableWidth / colCount);

    const tableOptions = {
      width: tableWidth,
      columnsSize,
      padding: [5, 4],        // top/bottom, left/right
      columnSpacing: 3,
    
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(6.5),
    
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(6);
    
        const { x, y, width, height } = rectCell;
    
        // Draw clean border for every cell
        doc
          .lineWidth(0.75)
          .strokeColor('#222222')
          .rect(x, y, width, height)
          .stroke();
      },
    
      divider: {
        header: { disabled: true },
        horizontal: { disabled: true },
      }
    };

    const rows = results.map(feeRecordRowToPdfCells);
    await doc.table({ headers: HEAD_WISE_FEE_PDF_HEADERS, rows }, tableOptions);

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
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
      { header: "Jan Paid", key: "jan_paid", width: 12 },

      { header: 'February', key: 'feb_total', width: 12 },
      { header: "Feb Paid", key: "feb_paid", width: 12 },

      { header: 'March', key: 'mar_total', width: 12 },
      { header: "Mar Paid", key: "mar_paid", width: 12 },

      { header: 'April', key: 'apr_total', width: 12 },
      { header: "Apr Paid", key: "apr_paid", width: 12 },

      { header: 'May', key: 'may_total', width: 12 },
      { header: "May Paid", key: "may_paid", width: 12 },

      { header: 'June', key: 'jun_total', width: 12 },
      { header: "Jun Paid", key: "jun_paid", width: 12 },

      { header: 'July', key: 'jul_total', width: 12 },
      { header: "Jul Paid", key: "jul_paid", width: 12 },

      { header: 'August', key: 'aug_total', width: 12 },
      { header: "Aug Paid", key: "aug_paid", width: 12 },

      { header: 'September', key: 'sep_total', width: 12 },
      { header: "Sep Paid", key: "sep_paid", width: 12 },

      { header: 'October', key: 'oct_total', width: 12 },
      { header: "Oct Paid", key: "oct_paid", width: 12 },

      { header: 'November', key: 'nov_total', width: 12 },
      { header: "Nov Paid", key: "nov_paid", width: 12 },

      { header: 'December', key: 'dec_total', width: 12 },
      { header: "Dec Paid", key: "dec_paid", width: 12 },
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

module.exports = { getFeeRecordByRegNo, createFeeRecordMonthly, getLatestPerFeeTable, getLatestFeeExcel, getLatestFeeCSV, getLatestFeePDF };
