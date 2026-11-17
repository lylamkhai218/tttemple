import { runSample, ITERATIONS } from './pbkdf2-benchmark.mjs';

const samples=[];
for(let i=0;i<3;i++)samples.push((await runSample()).wall_ms);
console.log(JSON.stringify({environment:'local-node',node:process.version,algorithm:'PBKDF2-HMAC-SHA-256',iterations:ITERATIONS,samples_wall_ms:samples,conclusion:'Local wall time only; Cloudflare CPU and limits have not been measured.'},null,2));
