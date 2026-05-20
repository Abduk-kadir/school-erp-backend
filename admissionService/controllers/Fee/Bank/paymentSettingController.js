const asyncHandler = require('express-async-handler');
const { PaymentSetting, class_master, FeesType } = require('../../../models');

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.paymentSettings)) return body.paymentSettings;
  return null;
}

function mapPaymentSettingRow(row) {
  const classid = row.classid ?? row.class ?? null;
  return {
    paymentGateway: row.paymentGateway ?? null,
    classid,
    merchantId: row.merchantId ?? null,
    key: row.key ?? null,
    accessCode: row.accessCode ?? null,
    feetype: row.feetype ?? null,
    isSplit: row.isSplit ?? false,
  };
}

const paymentSettingController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Request body must be a non-empty array (or { rows: [...] } / { data: [...] })',
      });
    }

    const payload = rows.map(mapPaymentSettingRow);
    const created = await PaymentSetting.bulkCreate(payload, {
      validate: true,
      returning: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment settings created',
      count: created.length,
      data: created,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const paymentSettings = await PaymentSetting.findAll({
      include: [
        {
          model: class_master,
          as: 'class',
          attributes: ['id', 'class_name', 'class_code'],
        },
        {
          model: FeesType,
          as: 'feeType',
          attributes: ['id', 'name'],
        },
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: paymentSettings.length,
      data: paymentSettings,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const paymentSetting = await PaymentSetting.findByPk(id);

    if (!paymentSetting) {
      return res.status(404).json({
        success: false,
        message: 'Payment setting not found',
      });
    }

    await paymentSetting.destroy();

    return res.status(200).json({
      success: true,
      message: 'Payment setting deleted successfully',
    });
  }),
};

module.exports = paymentSettingController;
