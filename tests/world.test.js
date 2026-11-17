import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveMovement,insideSanctuary,groundHeight} from '../src/world.js';
test('door blocks when closed and permits entry and exit when open',()=>{
  assert.equal(resolveMovement({x:0,z:-3.4},{x:0,z:-.5},false).z,-3.4);
  assert.equal(resolveMovement({x:0,z:-3.4},{x:0,z:-.8},true).z,-4.2);
  assert.equal(resolveMovement({x:0,z:-4.4},{x:0,z:1},true).z,-3.4000000000000004);
});
test('perimeter wall has a usable opening aligned with the path',()=>{
  assert.ok(resolveMovement({x:0,z:20.5},{x:0,z:.5},true).z>20.5);
  assert.equal(resolveMovement({x:5,z:20.5},{x:0,z:.5},true).z,20.5);
});
test('walls, incense and pond block entry while paths outside remain open',()=>{
  assert.equal(resolveMovement({x:3,z:-3.4},{x:0,z:-.5},true).z,-3.4);
  assert.equal(resolveMovement({x:-2.5,z:1},{x:0,z:-1},true).z,1);
  assert.equal(resolveMovement({x:-12,z:-5},{x:0,z:-1},true).z,-5);
  assert.equal(resolveMovement({x:4,z:3},{x:0,z:-1.2},true).z,3);
  assert.ok(resolveMovement({x:10,z:-3.4},{x:0,z:-.5},false).z<-3.4);
  assert.equal(insideSanctuary(0,-6),true);assert.equal(insideSanctuary(10,-6),false);
  assert.equal(insideSanctuary(6,-10),true);
  assert.equal(resolveMovement({x:0,z:-13},{x:0,z:-.5},true).z,-13);
});
test('stairs rise towards the raised hall and return to ground outside',()=>{
  assert.equal(groundHeight(0,0),0);
  assert.equal(groundHeight(0,-2.2),.18);
  assert.equal(groundHeight(0,-2.7),.36);
  assert.equal(groundHeight(0,-3.6),.72);
  assert.equal(groundHeight(0,-5),.72);
  assert.equal(groundHeight(4,-2.7),0);
});
