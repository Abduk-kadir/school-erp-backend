const { Queue } = require('bullmq');
const redis = require('../config/redisConfig.js');

const rfidQueue = new Queue('rfid-attendance', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

module.exports = { rfidQueue };
