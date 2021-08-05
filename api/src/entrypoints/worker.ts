import { Db } from '../db';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { JOBS } from '../jobs';
import { JobServer } from '../server';
import { Logger } from '../util';

(async () => {
  const db = container.get<Db>(TYPES.Db);
  await db.init();

  const logger = container.get<Logger>(TYPES.Logger);
  const jobs = Object.values(JOBS);
  await Promise.all(jobs.map((job) => job.startWorking()));

  logger.info('job worker started');

  const server = container.get<JobServer>(TYPES.WorkerServer);
  server.start(jobs);
})();
