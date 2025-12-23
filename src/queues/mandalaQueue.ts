import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import { createMandala } from '../workers/mandalaWorker';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

export const mandalaQueue = new Queue('mandala', { connection });
export const mandalaScheduler = new QueueScheduler('mandala', { connection });

export function startMandalaWorker() {
  const worker = new Worker('mandala', async job => {
    // job.data: { prompt, seed, userId, tier }
    const { prompt, seed, userId } = job.data;
    const result = await createMandala({ prompt, seed, userId });
    return result;
  }, { connection, concurrency: 2 });

  worker.on('completed', (job) => {
    console.log(`Mandala job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Mandala job ${job?.id} failed`, err);
  });
}

