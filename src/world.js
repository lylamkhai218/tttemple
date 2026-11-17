// 2D collision footprints for the prototype. Positions are in world units.
const radius = .28;
const walls = [
  {minX:-7.15,maxX:-6.85,minZ:-16,maxZ:-3.8},
  {minX:6.85,maxX:7.15,minZ:-16,maxZ:-3.8},
  {minX:-7.15,maxX:7.15,minZ:-16,maxZ:-15.55},
  {minX:-7.15,maxX:-1.3,minZ:-4.05,maxZ:-3.75},
  {minX:1.3,maxX:7.15,minZ:-4.05,maxZ:-3.75},
  {minX:-2.4,maxX:2.4,minZ:-15.55,maxZ:-13.5},
  {minX:-21.25,maxX:21.25,minZ:-21.25,maxZ:-20.75},
  {minX:-21.25,maxX:-20.75,minZ:-21,maxZ:21},
  {minX:20.75,maxX:21.25,minZ:-21,maxZ:21},
  {minX:-21,maxX:-3,minZ:20.75,maxZ:21.25},
  {minX:3,maxX:21,minZ:20.75,maxZ:21.25},
];
const doorway={minX:-1.3,maxX:1.3,minZ:-4.05,maxZ:-3.75};
const obstacles=[{x:-2.5,z:-1,r:1.34},{x:-12,z:-9,r:3.55},{x:-4,z:1,r:.9},{x:4,z:1,r:.9},{x:4,z:6,r:.9}];
const within=(x,z,b)=>x>b.minX-radius&&x<b.maxX+radius&&z>b.minZ-radius&&z<b.maxZ+radius;
export function insideSanctuary(x,z){return x>-6.85&&x<6.85&&z<-4.05&&z>-15.55}
export function groundHeight(x,z){
  if(insideSanctuary(x,z))return .72;
  if(Math.abs(x)<2.9&&z<=-2&&z>=-4.05)return Math.min(.72,(Math.floor((-z-2)/.48)+1)*.18);
  return 0;
}
export function resolveMovement(position,delta,doorOpen){
  const blocked=(x,z)=>Math.abs(x)>25||Math.abs(z)>25||walls.some(w=>within(x,z,w))||(!doorOpen&&within(x,z,doorway))||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r);
  let x=position.x,z=position.z;const nextX=x+delta.x,nextZ=z+delta.z;
  if(!blocked(nextX,z))x=nextX;
  if(!blocked(x,nextZ))z=nextZ;
  return {x,z};
}
