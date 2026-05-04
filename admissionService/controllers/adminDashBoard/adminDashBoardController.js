const asyncHandler = require('express-async-handler');
const { par_student_personal_information, FeeCollection } = require('../../models');

const adminDashBoardController = {
  totalStudent: asyncHandler(async (req, res) => {
    const totalStudent = await par_student_personal_information.count();
    res.status(200).json({ data:totalStudent,success:true });
  }),

  totalFeeCollected: asyncHandler(async (req, res) => {
    const totalFeeCollected = (await FeeCollection.sum('payment')) ?? 0;
    res.status(200).json({ data:totalFeeCollected ,success:true});
  }),
};

module.exports = adminDashBoardController;
