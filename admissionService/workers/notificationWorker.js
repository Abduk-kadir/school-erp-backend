const { Worker } = require('bullmq');
const redis = require('../config/redisConfig.js');
const { messaging } = require('../config/firebase.js');

const worker = new Worker('student-notifications', async (job) => {
  const { title, body, tokens, data = {} } = job.data;
  const batchSize = 500;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);

    const message = {
      tokens: batch,
      notification: {
        title,
        body: `${body} (#${job.id})`,
      },
      data: {
        ...data,
        notificationId: String(job.id)
      }
    };
    
    

    try {
      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${response.successCount} sent, ${response.failureCount} failed`);

      // Log failed tokens
      response.responses.forEach((result, index) => {
        if (result.error) {
          console.error(`FCM failed for token ${batch[index]?.slice(0, 15)}...`, 
            result.error.code, result.error.message);
        }
      });

    } catch (error) {
      console.error("FCM Batch Error:", error);
      throw error; // Let BullMQ retry
    }
  }
}, {
  connection: redis,
  concurrency: 3,
});

module.exports = worker;