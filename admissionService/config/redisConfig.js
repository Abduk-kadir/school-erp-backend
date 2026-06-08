const { Redis } = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // Performance tweaks for high load
  lazyConnect: true,
  reconnectOnError: (err) => {
    console.error('Redis Error:', err);
    return true;
  }
});

module.exports = redis;