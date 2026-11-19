import * as THREE from 'three';

// Low-poly interpretation of the supplied references: warm timber, a central
// altar, paired offerings and meditation cushions. The central aisle is clear.
// Footprint: x -7..7, z -15.8..-3.9; altar x -2.4..2.4, z -15.5..-13.5.
export function createInterior(scene, buddhaImage) {
  const root=new THREE.Group();scene.add(root);
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
  const floor=material('#533629'),floorLine=material('#39281f'),wood=material('#603126'),woodLight=material('#84513a'),gold=material('#c6a060',{metalness:.35}),matRed=material('#7b2827'),cushion=material('#aa8657'),porcelain=material('#6f9990'),lotus=material('#f0c5c3'),leaf=material('#527950'),wax=material('#eee3c5');
  const geometry={box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(1,1,1,16),sphere:new THREE.SphereGeometry(1,12,8),cone:new THREE.ConeGeometry(1,1,10)};
  function item(geo,mat,x,y,z,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);root.add(mesh);return mesh}
  const box=(mat,x,y,z,w,h,d)=>item(geometry.box,mat,x,y,z,w,h,d);
  const cyl=(mat,x,y,z,r,h)=>item(geometry.cylinder,mat,x,y,z,r,h,r);
  // A single wooden floor and fine seams; heights are separated to avoid z-fighting.
  box(floor,0,.13,-9.85,13.65,.1,11.55);
  for(let z=-15.3;z<-4.2;z+=.72)box(floorLine,0,.185,z,13.5,.008,.018);
  for(let x=-6.5;x<=6.5;x+=1.45)box(floorLine,x,.186,-9.8,.018,.008,11.4);
  // Structural timber stays near the walls, clear of the central walkway.
  for(const x of [-6.35,6.35])for(const z of [-5.2,-9.8,-14.7]){
    cyl(wood,x,2.42,z,.19,4.45);cyl(gold,x,.28,z,.29,.16);cyl(gold,x,4.52,z,.25,.12);
  }
  for(const x of [-6.35,6.35])box(wood,x,4.48,-9.9,.25,.3,10.6);
  for(const z of [-5.2,-9.8,-14.7])box(wood,0,4.5,z,12.9,.27,.24);
  // Altar, trim, rear frame and image supplied by the user.
  box(wood,0,.58,-14.45,4.8,1.05,1.8);box(woodLight,0,1.14,-14.45,5.05,.16,1.95);
  for(const x of [-1.6,0,1.6]){box(gold,x,.58,-13.535,1.32,.72,.025);box(wood,x,.58,-13.505,1.18,.58,.025)}
  box(wood,0,2.85,-15.55,3.4,3.55,.12);box(gold,0,2.85,-15.47,3.16,3.31,.04);
  new THREE.TextureLoader().load(buddhaImage,texture=>{texture.colorSpace=THREE.SRGBColorSpace;const picture=new THREE.Mesh(new THREE.PlaneGeometry(2.32,3.08),new THREE.MeshBasicMaterial({map:texture}));picture.position.set(0,2.85,-15.43);root.add(picture)});
  for(const x of [-1.22,1.22])box(gold,x,2.85,-15.37,.08,3.12,.055);
  for(const y of [1.31,4.39])box(gold,0,y,-15.37,2.48,.08,.055);
  // Incense bowl, candles and lotus vases sit on the altar instead of the aisle.
  cyl(woodLight,0,1.32,-13.92,.25,.25);for(const x of [-.11,0,.11]){const stick=cyl(matRed,x,1.68,-13.92,.012,.55);stick.rotation.z=x*.25}
  for(const side of [-1,1]){
    cyl(gold,side*1.94,1.28,-13.85,.16,.18);cyl(wax,side*1.94,1.62,-13.85,.065,.55);
    const flame=item(geometry.cone,new THREE.MeshBasicMaterial({color:'#ffd389'}),side*1.94,1.97,-13.85,.07,.2,.07);flame.rotation.z=.08*side;
    const vase=item(geometry.sphere,porcelain,side*1.22,1.4,-14.05,.22,.28,.22);vase.scale.y=.27;
    for(let i=-1;i<=1;i++){const x=side*1.22+i*.1;cyl(leaf,x,1.78,-14.05,.015,.48);item(geometry.sphere,lotus,x,2.06,-14.05,.09,.15,.09)}
  }
  // Two rows of mats on each side; low-profile so they remain walkable.
  for(const x of [-4.8,-2.5,2.5,4.8])for(const z of [-5.8,-8,-10.2,-12.3]){
    box(gold,x,.199,z,1.45,.025,1.3);box(matRed,x,.215,z,1.32,.025,1.17);
    const seat=cyl(cushion,x,.28,z,.48,.12);seat.scale.z=.83;
  }
  // Warm light is local to the sanctuary and adds depth without shadow maps.
  const lamp=new THREE.PointLight('#ffcf84',9,13,2);lamp.position.set(0,3.8,-12.5);root.add(lamp);
  return root;
}
