const asyncHandler = require('express-async-handler');
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
    console.log("allRows",allRows);
  // Fast ACK for machines — heavy work runs in rfidWorker
  await rfidQueue.add('process-rfid-batch', { rows: allRows });
  return res.send('Done');
});

module.exports = {
  saveattendancebyrfid,
};
