const { FeeCollection, FeeRecordMonthly, StudentFeeGroupDetailPrice, sequelize } = require('../../models');

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

/**
 * Body shape:
 * {
 *   filteredstudentfees: Array<...StudentFeeGroupDetailPrice updates...>,
 *   feerecordmothlydata: Array<...FeeRecordMonthly rows...>,
 *   feecollection: { ...FeeCollection fields... }
 * }
 *
 * Creates one FeeCollection, bulk creates FeeRecordMonthly linked by fee_table_id,
 * and updates StudentFeeGroupDetailPrice by (reg_no, feeheadid).
 */
exports.createStudentFeeCollection = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      filteredstudentfees = [],
      feerecordmothlydata = [],
      feecollection
    } = req.body || {};

    const monthlyRows = feerecordmothlydata;

    const createdFeeCollection = await FeeCollection.create(feecollection, { transaction });
    const fee_table_id = createdFeeCollection.id;

    const sanitizedMonthly = monthlyRows
      .map((r) => pickFeeRecordMonthlyPayload(r, fee_table_id))
      .filter(Boolean);

    const createdMonthly = await FeeRecordMonthly.bulkCreate(sanitizedMonthly, { transaction });

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

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Fee collection created',
      data: {
        feecollection: createdFeeCollection,
        fee_table_id,
        feerecordmonthly_created_count: createdMonthly.length,
        studentfeegroupdetailprice_updated_count: updatedCount,
        studentfeegroupdetailprice_not_found: notFound
      }
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};
