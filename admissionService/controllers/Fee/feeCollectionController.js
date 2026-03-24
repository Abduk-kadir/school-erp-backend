const { FeeCollection, PersonalInformation, class_master } = require('../../models');
const { academicOnlineAndOfflinePayDataTable } = require('../../helpers/academicOnlineAndOfflinePayHelper');
const { academicSummaryPayDataTable } = require('../../helpers/academicSummaryPayHelper');

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

// ✅ GET SINGLE
exports.getFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FeeCollection.findByPk(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Fee not found"
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