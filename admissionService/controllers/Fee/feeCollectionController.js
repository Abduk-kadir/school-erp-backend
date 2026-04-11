const ExcelJS = require('exceljs');
const { FeeCollection, PersonalInformation, class_master, sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const { academicOnlineAndOfflinePayDataTable } = require('../../helpers/academicOnlineAndOfflinePayHelper');
const { academicSummaryPayDataTable } = require('../../helpers/academicSummaryPayHelper');

const FEE_EXPORT_COLUMNS = [
  { header: 'Reg No', key: 'reg_no' },
  { header: 'Client Txt ID', key: 'client_txt_id' },
  { header: 'First_name', key: 'first_name' },
  { header: 'Class Name', key: 'class_name' },
  { header: 'Division', key: 'division' },
  { header: 'Receipt No', key: 'reciept_no' },
  { header: 'Transaction No', key: 'transaction_no' },
  { header: 'Failure Message', key: 'failure_message' },
  { header: 'Card Name', key: 'card_name' },
  { header: 'Payment Mode', key: 'payment_mode' },
  { header: 'Added By', key: 'added_by' },
  { header: 'Role ID', key: 'role_id' },
  { header: 'Fine', key: 'fine' },
  { header: 'Concession', key: 'consession' },
  { header: 'Concession Amount', key: 'consessionamount' },
  { header: 'Discount Type', key: 'discount_type_id' },
  { header: 'Total', key: 'total' },
  { header: 'Total Paid', key: 'total_paid' },
  { header: 'Payment', key: 'payment' },
  { header: 'Balance', key: 'balance' },
  { header: 'Remark', key: 'remark' },
  { header: 'Payment Type', key: 'payment_type' },
  { header: 'DD Number', key: 'dd_number' },
  { header: 'DD Date', key: 'dd_date' },
  { header: 'Check No', key: 'check_no' },
  { header: 'Ref No', key: 'ref_no' },
  { header: 'Check Date', key: 'check_date' },
  { header: 'Check Name', key: 'check_name' },
  { header: 'Bank ID', key: 'bank_id' },
  { header: 'Start Month', key: 'start_month' },
  { header: 'Paid/Unpaid Month', key: 'paid_and_unpai_month' },
  { header: 'Extra Fee', key: 'extra_fee' },
  { header: 'Date', key: 'date' },
  { header: 'Split Flag', key: 'split_flag' },
  { header: 'Raw Data', key: 'raw_data' },
  { header: 'Installment', key: 'installment' },
  { header: 'Split Response', key: 'split_response' },
  { header: 'Created At', key: 'createdAt' },
  { header: 'Updated At', key: 'updatedAt' }
];

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ✅ CREATE
exports.createFee = async (req, res) => {
  try {
    const data = await FeeCollection.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Fee created successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET ALL (DataTable with filters: fromDate, toDate, batchId, divisionId, paymentStatus)
exports.getAllFees = async (req, res) => {
  try {
    const searchFields = ['reg_no', 'reciept_no', 'payment_mode'];
    const classFilter = req.query['filter[className]'] || '';
  

    const include = [
      {
        model: PersonalInformation,
        as: 'PeronalInformation',
        required: !!(classFilter),
        include: [
          {
            model: class_master,
            as: 'classInfo',
            attributes: ['id', 'class_name'],
            required: false
          }
        ]
      }
    ];

    const result = await academicOnlineAndOfflinePayDataTable(
      req,
      FeeCollection,
      searchFields,
      {},
      include
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Query: fromDate, toDate, paymentStatus, className. Returns an .xlsx download.
 */
exports.getAllFeesInExcel = async (req, res) => {
  try {
    const { fromDate, toDate, paymentStatus, className } = req.query;

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(f.\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(f.\`date\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(f.\`date\`) <= '${toDate}'`);
    }

    if (className !== undefined && className !== null && String(className).trim() !== '') {
      const classId = parseInt(className, 10);
      if (!Number.isNaN(classId)) {
        whereClause.push(`p.\`class\` = ${classId}`);
      }
    }
    if (paymentStatus) {
      const safe = String(paymentStatus).replace(/'/g, "''");
      whereClause.push(`f.\`payment_mode\`='${safe}'`);
    }

    const query = `select * from feecollections  as f 
     join personalInformations p on f.reg_no=p.reg_no
     join class_masters as c on p.class=c.id`;
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';

    const result = await sequelize.query(query + whereSql, {
      type: QueryTypes.SELECT
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Fee Collection");
    sheet.columns = FEE_EXPORT_COLUMNS;
   sheet.addRows(result)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=feeCollection.xlsx"
    );

    
   await workbook.xlsx.write(res);

    res.end();
   
   
  

   
  } catch (error) {
    console.error('getAllFeesInExcel:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

/**
 * Same query params as GET .../excel: fromDate, toDate, paymentStatus, className. Returns a .csv download.
 */
exports.getAllFeesInCsv = async (req, res) => {
  try {
    const { fromDate, toDate, paymentStatus, className } = req.query;

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(f.\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(f.\`date\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(f.\`date\`) <= '${toDate}'`);
    }

    if (className !== undefined && className !== null && String(className).trim() !== '') {
      const classId = parseInt(className, 10);
      if (!Number.isNaN(classId)) {
        whereClause.push(`p.\`class\` = ${classId}`);
      }
    }
    if (paymentStatus) {
      const safe = String(paymentStatus).replace(/'/g, "''");
      whereClause.push(`f.\`payment_mode\`='${safe}'`);
    }

    const query = `select * from feecollections  as f 
     join personalInformations p on f.reg_no=p.reg_no
     join class_masters as c on p.class=c.id`;
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';

    const result = await sequelize.query(query + whereSql, {
      type: QueryTypes.SELECT
    });

    const keys = FEE_EXPORT_COLUMNS.map((c) => c.key);
    const headerLine = FEE_EXPORT_COLUMNS.map((c) => escapeCsvField(c.header)).join(',');
    const dataLines = result.map((row) =>
      keys.map((k) => escapeCsvField(row[k])).join(',')
    );
    const csv = [headerLine, ...dataLines].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=feeCollection.csv');
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error('getAllFeesInCsv:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

/** @deprecated Use getAllFeesInExcel — same handler */
exports.getAllFeesInExcelFormat = exports.getAllFeesInExcel;



exports.getSummaryFeeCollection = async (req, res) => {
  try {
    const searchFields = ['reg_no', 'reciept_no', 'payment_mode'];
    const classFilter = req.query['filter[className]'] || '';

    const include = [
      {
        model: PersonalInformation,
        as: 'PeronalInformation',
        required: true,
        attributes: ['class'],
        include: [
          {
            model: class_master,
            as: 'classInfo',
            attributes: ['id', 'class_name'],
            required: false
          }
        ]
      }
    ];

    const result = await academicSummaryPayDataTable(
      req,
      FeeCollection,
      searchFields,
      {},
      include
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET LATEST FEE ROW FOR A STUDENT (by registration number; multiple rows per reg_no)
exports.getFeeById = async (req, res) => {
  try {
    const { reg_no } = req.params;

    if (reg_no == null || String(reg_no).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'reg_no is required'
      });
    }

    const data = await FeeCollection.findOne({
      where: { reg_no: String(reg_no).trim() },
      order: [['id', 'DESC']]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No fee record found for this registration number'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ UPDATE
exports.updateFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await FeeCollection.findByPk(id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found"
      });
    }

    await fee.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Fee updated successfully",
      data: fee
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ DELETE
exports.deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await FeeCollection.findByPk(id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found"
      });
    }

    await fee.destroy();

    return res.status(200).json({
      success: true,
      message: "Fee deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};