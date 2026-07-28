const asyncHandler = require('express-async-handler');
const { AllRfid, NotMatchedRfid, RfidUnknown, sequelize } = require('../../models');

const saveattendancebyrfid = asyncHandler(async (req, res) => {
  const rawData = req.query.Data;

  if (!rawData) {
    return res.status(400).json({ message: 'Data query param is required' });
  }

  const allRows = rawData
    .split(';')
    .map(item => item.trim())
    .filter(Boolean);

  for (const row of allRows) {
    await AllRfid.create({ data: row });

    const parts = row.split(',').map(item => item.trim());
    const rfid = parts[1];
    const machineNo = parts[4];

    if (machineNo !== '31') {
      await NotMatchedRfid.create({ data: row });
      continue;
    }

    const [student] = await sequelize.query(
      'SELECT * FROM par_student_personal_informations WHERE rfid = ? LIMIT 1',
      {
        replacements: [rfid],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!student) {
      await RfidUnknown.create({ data: row });
    }
  }

  res.status(200).json({
    success: true,
    message: 'RFID attendance data saved successfully',
    total: allRows.length
  });
});

module.exports = {
  saveattendancebyrfid
};
