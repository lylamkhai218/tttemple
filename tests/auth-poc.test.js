import test from 'node:test';
import assert from 'node:assert/strict';
import {runSample, ITERATIONS} from '../poc/auth/pbkdf2-benchmark.mjs';

test('synthetic benchmark uses the documented algorithm and returns only timing', async () => {
  const calls=[];let tick=0;
  const fake={getRandomValues(array){calls.push(['salt',array.length]);return array},subtle:{async importKey(...args){calls.push(['import',args[2],args[4]]);return 'key'},async deriveBits(options,key,length){calls.push(['derive',options.hash,options.iterations,options.salt.length,key,length]);return new ArrayBuffer(32)}}};
  const result=await runSample(fake,{now(){tick+=12;return tick}});
  assert.deepEqual(result,{wall_ms:12});
  assert.equal(ITERATIONS,600_000);
  assert.deepEqual(calls,[['salt',16],['import','PBKDF2',['deriveBits']],['derive','SHA-256',600_000,16,'key',256]]);
});
test('rejects missing crypto and unexpected output',async()=>{
  await assert.rejects(runSample(null,{now(){return 0}}));
  const fake={getRandomValues(x){return x},subtle:{async importKey(){return 'key'},async deriveBits(){return new ArrayBuffer(1)}}};
  await assert.rejects(runSample(fake,{now(){return 0}}),/Unexpected derived length/);
});
