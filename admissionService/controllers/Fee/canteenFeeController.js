const {canteenfeecollection , canteefeecollectiondetail, StudentFeeGroupDetailPrice, sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const asyncHandler = require('express-async-handler');
function pickFeeRecordMonthlyPayload(r, fee_table_id) {
  if (!r || typeof r !== 'object') return null;
  const { id, fee_head, ...rest } = r;
  const feeheadid = rest.feeheadid ?? fee_head;
  if (feeheadid != null) rest.feeheadid = feeheadid;
  rest.fee_table_id = fee_table_id;
  return rest;
}

function pickStudentFeeGroupDetailUpdatePayload(r) {
    if (!r || typeof r !== 'object') return null;
    const { reg_no, feeheadid, fee_head, id, createdAt, updatedAt, ...rest } = r;
    // allow fee_head alias, but don't let it slip into update payload
    void fee_head;
    return { reg_no, feeheadid: feeheadid ?? fee_head, update: rest };
  }

exports.createStudentFeeCollection = asyncHandler(async (req, res) => {
  const {
    filteredstudentfees = [],
    feerecordmothlydata = [],
    feecollection
  } = req.body || {};

  const monthlyRows = feerecordmothlydata;
  console.log('monthlyRows are*********************************:',monthlyRows)

  const result = await sequelize.transaction(async (transaction) => {
    const createdFeeCollection = await canteenfeecollection.create(feecollection, { transaction });
    const fee_table_id = createdFeeCollection.id;

    const sanitizedMonthly = monthlyRows
      .map((r) => pickFeeRecordMonthlyPayload(r, fee_table_id))
      .filter(Boolean);

    const createdMonthly = await canteefeecollectiondetail.bulkCreate(sanitizedMonthly, { transaction });

    let updatedCount = 0;
    const notFound = [];

    for (let i = 0; i < filteredstudentfees.length; i++) {
      const parsed = pickStudentFeeGroupDetailUpdatePayload(filteredstudentfees[i]);
      if (!parsed) continue;

      const regNo = parsed.reg_no;
      const feeheadid = parsed.feeheadid;

      const [affected] = await StudentFeeGroupDetailPrice.update(parsed.update, {
        where: { reg_no: regNo, feeheadid },
        transaction
      });

      if (affected === 0) {
        notFound.push({ reg_no: regNo, feeheadid });
      } else {
        updatedCount += affected;
      }
    }

    return {
      createdFeeCollection,
      fee_table_id,
      createdMonthlyCount: createdMonthly.length,
      updatedCount,
      notFound
    };
  });

  return res.status(201).json({
    success: true,
    message: 'Fee collection created',
    data: {
      canteenfeecollection: result.createdFeeCollection,
      fee_table_id: result.fee_table_id,
      canteenfeecollectiondetail_created_count: result.createdMonthlyCount,
      studentfeegroupdetailprice_updated_count: result.updatedCount,
      studentfeegroupdetailprice_not_found: result.notFound
    }
  });
});
exports.getAllFees = asyncHandler(async (req, res) => {
  const draw = parseInt(req.query.draw) || 1;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const search = req.query['search[value]'] || req.query.search?.value || '';
  const fromDate = req.query['filter[fromDate]'] || '';
  const toDate = req.query['filter[toDate]'] || '';
  const className = req.query['filter[className]'] || '';
  const paymentStatus = req.query['filter[paymentStatus]'] || '';


  const whereClause = [];
  if (fromDate && toDate) {
    whereClause.push(`DATE(fc.\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`);
  } else if (fromDate) {
    whereClause.push(`DATE(fc.\`date\`) >= '${fromDate}'`);
  } else if (toDate) {
    whereClause.push(`DATE(fc.\`date\`) <= '${toDate}'`);
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
  const query = `select fc.*, p.first_name,p.class,p.division, c.class_name as className from canteenfeecollections as fc join par_student_personal_informations as p on fc.reg_no=p.reg_no
join class_masters as c on c.id=p.class
${whereSql}
    
      LIMIT ${length} OFFSET ${start}

`;


  const result = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true
  });
  return res.status(200).json({
    success: true,
    data: result,
    draw: draw,
  });
});