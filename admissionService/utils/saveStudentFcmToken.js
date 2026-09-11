const { studentFcmtoken } = require('../models');

/**
 * Saves an FCM token for a student without overwriting other devices
 * or other siblings sharing the same device token.
 * - Same studentid + token: no-op
 * - New pair: insert a new row
 */
async function saveStudentFcmToken(studentid, token) {
  if (!studentid || !token) return;

  const existing = await studentFcmtoken.findOne({
    where: { studentid, token },
  });
  if (existing) return;

  await studentFcmtoken.create({ studentid, token });
}

module.exports = saveStudentFcmToken;
