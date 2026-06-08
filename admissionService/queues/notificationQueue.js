const { Queue } = require('bullmq');
const redis = require('../config/redisConfig.js');

const notificationQueue = new Queue('student-notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true
  }
});

module.exports = { notificationQueue };
