const { createClient } = require('redis');
const logger = require('./logger');

let client = null;

const getRedis = async () => {
  if (client && client.isOpen) return client;
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASS || undefined,
  });
  client.on('error', (err) => logger.error('Redis Client Error', err));
  await client.connect();
  logger.info('Redis connected');
  return client;
};

const cache = {
  get: async (key) => {
    try {
      const r = await getRedis();
      const val = await r.get(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: async (key, value, ttlSeconds = 300) => {
    try {
      const r = await getRedis();
      await r.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (e) { logger.error('Cache set error', e); }
  },
  del: async (key) => {
    try {
      const r = await getRedis();
      await r.del(key);
    } catch (e) { logger.error('Cache del error', e); }
  },
  delPattern: async (pattern) => {
    try {
      const r = await getRedis();
      const keys = await r.keys(pattern);
      if (keys.length) await r.del(keys);
    } catch (e) { logger.error('Cache delPattern error', e); }
  },
};

module.exports = { getRedis, cache };
