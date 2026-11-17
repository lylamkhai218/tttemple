import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { EVENT_FIELDS } from '../src/telemetry/contract.js';

// Exercise the same inline rendering code used when the AP is opened as a file.
async function renderAP() {
  const html = await readFile(new URL('../docs/AP-TTTemple.html', import.meta.url), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'AP must contain its inline rendering script');
  const elements = new Map();
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { innerHTML:'', addEventListener(){}, setAttribute(){}, classList:{toggle(){return false},remove(){}} });
    return elements.get(id);
  }};
  const data = runInNewContext(`${match[1]}\n;({flows,krs,events,phases,opens})`, {document,innerWidth:1024});
  return {html, elements, data};
}

test('AP renders all planned flows, metrics, events and phases with stable IDs', async () => {
  const {elements,data} = await renderAP();
  assert.equal(data.flows.length, 12);
  assert.equal(data.krs.length, 9);
  assert.equal(data.phases.length, 11);
  assert.equal(data.opens.length, 10);
  assert.deepEqual([...data.events.map(row => row[0])].sort(), Object.keys(EVENT_FIELDS).sort());
  for (const [id] of data.flows) assert.match(elements.get('flow-list').innerHTML, new RegExp(`id="${id}"`));
  for (const [id] of data.krs) assert.match(elements.get('kr-list').innerHTML, new RegExp(`id="${id}"`));
});

test('every flow references a defined event and local anchors resolve', async () => {
  const {html,elements,data} = await renderAP();
  const defined = new Set(data.events.map(row => row[0]));
  for (const [id,,,,event] of data.flows) {
    for (const name of event.split(',').map(value => value.trim())) assert.ok(defined.has(name), `${id} references missing event ${name}`);
  }
  const rendered = html + [...elements.values()].map(el => el.innerHTML).join('');
  const ids = new Set([...rendered.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, anchor] of rendered.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(anchor), `Missing anchor: ${anchor}`);
});
