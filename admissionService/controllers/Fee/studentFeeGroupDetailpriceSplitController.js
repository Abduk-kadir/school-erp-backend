const asyncHandler = require('express-async-handler');
const { studentfeegroupDetailpriceSplit, sequelize, Sequelize } = require('../../models');

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.splits)) return body.splits;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

const studentFeeGroupDetailpriceSplitController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array (or { rows: [...] })',
      });
    }

    const created = await studentfeegroupDetailpriceSplit.bulkCreate(rows, {
      validate: true,
      returning: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Split amounts created',
      count: created.length,
      data: created,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const regNoParam = req.params.reg_no ?? req.params.regNo ?? req.params.regno;
    const reg_no = String(regNoParam ?? '').trim();

    if (!reg_no || !/^\d+$/.test(reg_no)) {
      return res.status(400).json({
        success: false,
        message: 'reg_no is required in route params (digits only)',
      });
    }

    const feeForParam = req.params.fee_for ?? req.params.feeFor;
    const fee_for = Number(feeForParam);

    if (!Number.isFinite(fee_for)) {
      return res.status(400).json({
        success: false,
        message: 'fee_for is required in route params (numeric)',
      });
    }

    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];
    const parentMonthTotals = months.map((m) => `p.${m}_total`).join(',\n          ');

    const splitMonthCols = months
      .map(
        (m) =>
          `spl.${m}_total AS split_${m}_total,
      spl.${m}_split1,
      spl.${m}_split2,
      spl.is_${m}_pay`
      )
      .join(',\n      ');

    const sql = `
        SELECT
          p.id,
          p.reg_no,
          p.feegroupdetailpriceid,
          p.feeheadid,
          fgd.fee_for,
          ${parentMonthTotals},
          fh.fee_head_name,
          spl.id AS split_id,
          spl.student_installment_id AS split_student_installment_id,
          spl.remark AS split_remark,
      ${splitMonthCols},
          spl.created_at AS split_created_at,
          spl.updated_at AS split_updated_at
        FROM studentfeegroupdetailprices AS p
        LEFT JOIN feeheads AS fh ON fh.id = p.feeheadid
        INNER JOIN feegroupdetailprices AS fgdp ON fgdp.id = p.feegroupdetailpriceid
        INNER JOIN feegroupdetails AS fgd ON fgd.id = fgdp.groupdetailid
        LEFT JOIN (
          SELECT spl2.*
          FROM studentfeegroupdetailpricesplits AS spl2
          INNER JOIN (
            SELECT student_installment_id, MAX(id) AS max_id
            FROM studentfeegroupdetailpricesplits
            GROUP BY student_installment_id
          ) AS latest
            ON latest.student_installment_id = spl2.student_installment_id
            AND latest.max_id = spl2.id
        ) AS spl ON spl.student_installment_id = p.id
        WHERE p.reg_no = :reg_no
          AND fgd.fee_for = :fee_for
        ORDER BY p.id ASC
      `;

    const rows = await sequelize.query(sql, {
      replacements: { reg_no, fee_for },
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({ success: true, count: rows.length, data: rows });
  }),
};

module.exports = studentFeeGroupDetailpriceSplitController;
