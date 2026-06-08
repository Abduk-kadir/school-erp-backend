const { notificationQueue } = require('../queues/notificationQueue.js');

const sendBulkNotification = async (students, title, body, extraData = {}) => {
  const tokens = students
    .map(student => student.token)
    .filter(token => token && token.length > 20);

  if (tokens.length === 0) return { success: false, message: "No FCM tokens found" };

  // Add job to queue
  await notificationQueue.add('send-push', {
    title,
    body,
    tokens,
    data: extraData
  });

  return { success: true, message: `${tokens.length} notifications queued` };
};
module.exports={sendBulkNotification}