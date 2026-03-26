const { FeeRecordMonthly, PersonalInformation, FeeHead, sequelize } = require('../models');

const getFeeRecordByRegNo = async (req, res) => {
  try {
    const { reg_no } = req.params;

    if (!reg_no) {
      return res.status(400).json({ success: false, message: 'reg_no is required' });
    }

    const data = await FeeRecordMonthly.findAll({
      where: { reg_no },
      include: [
        {
          model: PersonalInformation,
          as: 'student',
          attributes: ['first_name', 'last_name', 'father_name', 'class', 'division', 'email', 'contact_number']
        },
        {
          model: FeeHead,
          as: 'feeHeadInfo',
          attributes: ['id','fee_head_name', 'is_refundable', 'status']
        }
      ]
    });

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'No fee records found for this reg_no' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getFeeRecordByRegNo error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getFeeRecordByRegNo };
