const ExcelJS = require('exceljs');
const { FeeCollection, PersonalInformation,par_student_personal_information, class_master, sequelize,classWiseSchool } = require('../../models');
const { QueryTypes } = require('sequelize');
const { academicOnlineAndOfflinePayDataTable } = require('../../helpers/academicOnlineAndOfflinePayHelper');
const { academicSummaryPayDataTable } = require('../../helpers/academicSummaryPayHelper');
const PDFDocument = require('pdfkit-table');
const puppeteer = require('puppeteer');
  const ejs = require('ejs');
  const path = require('path');


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
/** pdfkit-table uses string headers, or objects with `label` (not `header`). */
const FEE_COLLECTION_PDF_HEADERS = [
  'Name',
  'Class Name',
  'Division',
  'Receipt No',
  'Transaction No',
  'Failure Message',
  'Card Name',
  'Payment Mode',
  'Added By',
  'Role ID',
  'Fine',
  'Concession',
  'Concession Amount',
];



function feeRecordRowToPdfCells(r) {
  const c = (v) => (v != null && v !== '' ? String(v) : '');
  return [
    c(r.first_name),
    c(r.class_name),
    c(r.division),
    c(r.reciept_no),
    c(r.transaction_no),
    c(r.failure_message),
    c(r.card_name),
    c(r.payment_mode),
    c(r.added_by),
    c(r.role_id),
    c(r.fine),
    c(r.consession),
    c(r.consessionamount),
  ];
  };
   




  
  
  exports.feeRecieptPDF = async (req, res) => {
    console.log('feeRecieptPDF is called***********************',req.body)
      let browser;
      try {
          const { student,feerecords } = req.body;
  
        
          let classid = student.class
          let classwiseinst = await classWiseSchool.findOne({
              where: {
                  class_id: classid
              },
              raw: true
  
          })
  
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          classwiseinst.logo = classwiseinst?.logo ? `${baseUrl}${classwiseinst.logo}` : null;
          console.log('classwise inst*************************', classwiseinst)
         
        
          const renderData = {
             data:feerecords,
             student:student,
             classwiseSchool: classwiseinst

  
          };
  
  
  
          const templatePath = path.join(__dirname, '../../views/printfeereciept.ejs');
  
          // 2. Render EJS → get HTML string
          const html = await ejs.renderFile(templatePath, renderData, {
              // Helps EJS find partials if you use <%- include('partial.ejs') %>
              views: [path.join(__dirname, '../../views')],
          });
  
          // 3. Launch puppeteer
          browser = await puppeteer.launch({
              headless: true,
              args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--font-render-hinting=medium',
              ],
          });
  
          const page = await browser.newPage();
  
          // 4. Load HTML into page
          await page.setContent(html, {
              waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
              timeout: 45000,
          });
  
          // Wait for fonts (especially if using Devanagari/Marathi fonts)
          await page.evaluate(() => document.fonts.ready);
  
          // 5. Generate PDF
          const pdfBuffer = await page.pdf({
              format: 'A4',
              printBackground: true,       // Very important → shows borders, colors, images
              margin: { top: '8mm', right: '6mm', bottom: '8mm', left: '6mm' },
              scale: 0.92,                 // Tiny shrink often fixes overflow in dense forms
              preferCSSPageSize: true,
          });
  
          await browser.close();
  
         
          // 6. Send PDF to frontend
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader(
              'Content-Disposition',
              `attachment; filename="admission-student-${student.frist_name || ''}.pdf"`
          );
          res.setHeader('Content-Length', pdfBuffer.length);
  
          // Send raw buffer and end response
          res.end(pdfBuffer);
  
      } catch (err) {
          if (browser) await browser.close().catch(() => { });
          console.error('PDF Error:', err);
          return res.status(500).json({
              success: false,
              message: 'PDF generation failed',
              error: err.message,
          });
      }
  };







exports.studentCopyFromPersonalToParPersonal=async(req,res)=>{
  let transaction=await sequelize.transaction()
  try{
   
  let {reg_no}=req.body
  let student=await par_student_personal_information.findOne({where:{reg_no:reg_no}})
  if(!student){
   let per=await PersonalInformation.findOne({where:{reg_no:reg_no}})
   if(!per){
    await transaction.rollback()
    return res.status(404).json({success:false,message:'Personal information not found for this reg_no'})
   }
   const classNum = per.class != null && String(per.class).trim() !== '' ? parseInt(per.class, 10) : null
   const divisionNum = per.division != null && String(per.division).trim() !== '' ? parseInt(per.division, 10) : null
   await par_student_personal_information.create({
    reg_no,
    first_name: per.first_name,
    last_name: per.last_name,
    father_name: per.father_name,
    class: Number.isNaN(classNum) ? null : classNum,
    division: Number.isNaN(divisionNum) ? null : divisionNum,
    contact_number: per.contact_number,
    dob: per.dob,
    blood_groop: per.blood_group,
    feegroupid: per.groupid,
    password: per.password
   },{transaction})
   await PersonalInformation.destroy({where:{reg_no:reg_no}, transaction})
  }
  await transaction.commit()
  return res.status(200).json({success:true,message:'student copied from personal to par personal successfully'})
  }
  catch(error){
    await transaction.rollback()
    return res.status(500).json({success:false,message:error.message})
  }
}










  
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

exports.getAllFeesPDF = async (req, res) => {
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

   const results = await sequelize.query(query + whereSql, {
     type: QueryTypes.SELECT
   });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=fee_collections_report.pdf'
  );

   const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 16,
  });

  doc.pipe(res);

  doc.fontSize(13).text('Online and offline  Report', { align: 'center' });
  doc.moveDown(0.4);

    if (!results.length) {
      doc.fontSize(10).text('No records found.', { align: 'left' });
      doc.end();
      return;
    }

    const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colCount = FEE_COLLECTION_PDF_HEADERS.length;
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

    const BATCH_SIZE = 500;
    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      if (i > 0) {
        doc.addPage();
      }

      const table = {
        headers: FEE_COLLECTION_PDF_HEADERS,
        rows: batch.map(feeRecordRowToPdfCells),
      };

      await doc.table(table, tableOptions);
    }

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


exports.getAllFeeById = async (req, res) => {
  try {
    const { reg_no } = req.params;

    if (reg_no == null || String(reg_no).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'reg_no is required'
      });
    }

    const data = await FeeCollection.findAll({
      where: { reg_no: String(reg_no).trim() },
      
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