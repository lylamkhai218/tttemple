import { parentPort, workerData } from 'node:worker_threads';
import { createSessionExperiment } from './session-poc.mjs';

const sessions = createSessionExperiment(workerData.path);
parentPort.postMessage({ ready: true });
parentPort.once('message', () => {
  try { parentPort.postMessage({ token: sessions.issue('synthetic-a', 1000, 100) }); }
  catch (error) { parentPort.postMessage({ error: error.message }); }
  finally { sessions.close(); }
});
