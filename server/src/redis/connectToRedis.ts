import Redis from 'ioredis';
import { Config } from '../config';

export const connectToRedis = (config: Config): Redis.Redis => {
  const host = config.REDIS_HOST;
  const port = parseInt(config.REDIS_PORT, 10);
  return new Redis(port, host);
};
