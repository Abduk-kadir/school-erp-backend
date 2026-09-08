const { staffFcmtoken } = require('../models');

/**
 * Saves an FCM token for a staff member without overwriting other devices.
 */
async function saveStaffFcmToken(staffid, token) {
  if (!staffid || !token) return;

  const existingByToken = await staffFcmtoken.findOne({
    where: { token },
  });

  if (existingByToken) {
    if (existingByToken.staffid !== staffid) {
      await existingByToken.update({ staffid });
    }
    return;
  }

  await staffFcmtoken.create({ staffid, token });
}

module.exports = saveStaffFcmToken;
