const { studentFcmtoken } = require('../models');

/**
 * Saves an FCM token for a student without overwriting other devices.
 * - Same token again: keep/update that row (no duplicate)
 * - New token: insert a new row for the same student
 */
async function saveStudentFcmToken(studentid, token) {
  if (!studentid || !token) return;

  const existingByToken = await studentFcmtoken.findOne({
    where: { token },
  });

  if (existingByToken) {
    if (existingByToken.studentid !== studentid) {
      await existingByToken.update({ studentid });
    }
    return;
  }

  await studentFcmtoken.create({ studentid, token });
}

module.exports = saveStudentFcmToken;
