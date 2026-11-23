const asyncHandler = require('express-async-handler');
const { AllRfid } = require('../../models');
const { rfidQueue } = require('../../queues/rfidQueue');

const saveattendancebyrfid = asyncHandler(async (req, res) => {
  const rawData = req.query.Data;

  if (!rawData) {
    return res.status(400).json({ message: 'Data query param is required' });
  }

  const allRows = rawData
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!allRows.length) {
    return res.status(400).json({ message: 'Data query param is empty' });
  }

  // Durable first: machine gets Done only after MySQL save
  await AllRfid.bulkCreate(
    allRows.map((data) => ({ data })),
    { validate: false }
  );

  // Attendance / notify — async; raw punch already safe in AllRfids
  try {
    await rfidQueue.add('process-rfid-batch', { rows: allRows });
  } catch (err) {
    console.error('RFID queue add failed (AllRfid already saved):', err.message);
  }

  return res.send('Done');
});

module.exports = {
  saveattendancebyrfid,
};
