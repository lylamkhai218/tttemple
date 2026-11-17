import * as THREE from 'three';

// Lightweight, stylised garden; all geometry is local and needs no network assets.
export function createGarden(scene) {
  const material = color => new THREE.MeshStandardMaterial({color,roughness:1});
  const wood=material('#70543b'),bamboo=material('#70894d'),green=material('#537750'),light=material('#74905c');
  const make=(geometry,material,x,y,z)=>{const item=new THREE.Mesh(geometry,material);item.position.set(x,y,z);scene.add(item);return item};
  // Enclosing masonry and distant greenery conceal the edges of the playable ground.
  const brick=material('#a8866b'),cap=material('#d4c0a3');
  // Split the front wall around a six-unit gateway; use thicker posts to avoid coplanar faces.
  for(const [x,z,w,d] of [[0,-21,42.5,.5],[-12,21,18,.5],[12,21,18,.5],[-21,0,.5,41.4],[21,0,.5,41.4]]){make(new THREE.BoxGeometry(w,2.2,d),brick,x,1.1,z);make(new THREE.BoxGeometry(w,.18,d+.04),cap,x,2.3,z)}
  for(let p=-16;p<=16;p+=4){for(const [x,z] of [[p,-21],[-21,p],[21,p]])make(new THREE.BoxGeometry(.8,2.6,.8),cap,x,1.3,z);if(Math.abs(p)>3)make(new THREE.BoxGeometry(.8,2.6,.8),cap,p,1.3,21)}
  for(const x of [-3,3])make(new THREE.BoxGeometry(.8,2.9,.8),cap,x,1.45,21);
  make(new THREE.BoxGeometry(2.8,.08,12.5),material('#c8bea0'),0,.01,17.75);
  const clouds=[];const cloudMaterial=new THREE.MeshBasicMaterial({color:'#f4f7ed'});for(let i=0;i<7;i++){const cloud=new THREE.Group();for(const [x,y,s] of [[0,0,1],[-1.1,-.15,.7],[1.1,-.12,.8],[.3,.3,.8]]){const puff=new THREE.Mesh(new THREE.SphereGeometry(s,9,6),cloudMaterial);puff.position.set(x,y,0);puff.scale.set(1.5,.55,.65);cloud.add(puff)}cloud.position.set(-24+i*8,17+(i%2)*3,-17+(i%3)*12);scene.add(cloud);clouds.push(cloud)}
  const trunk=(x,z,height,r=.2)=>make(new THREE.CylinderGeometry(r*.7,r,height,8),wood,x,height/2,z);
  // Broad-canopy trees evoke bồ đề and đa; layered conifers suggest tùng.
  for(const [x,z,kind] of [[-15,-12,'bode'],[15,-12,'da'],[-17,5,'tung'],[17,5,'tung']]){
    trunk(x,z,3,kind==='da'?.48:.3);
    if(kind==='tung'){for(let i=0;i<3;i++)make(new THREE.ConeGeometry(1.5-i*.2,2,8),i%2?light:green,x,2.7+i*.75,z)}
    else {for(const [dx,dy,dz] of [[0,0,0],[-1,.1,0],[1,.1,0],[0,.55,.5]])make(new THREE.SphereGeometry(kind==='da'?1.5:1.2,10,7),kind==='da'?green:light,x+dx,3.6+dy,z+dz)}
    if(kind==='da')for(const dx of [-.8,.8])make(new THREE.CylinderGeometry(.035,.06,2.6,6),wood,x+dx,1.5,z+.2);
  }
  // Clumps of tre and trúc, placed away from the company gates.
  for(const [x,z] of [[-15,-2],[15,-2],[-15,11],[15,11]])for(let i=0;i<5;i++){const dx=(i-2)*.24,height=2.4+(i%3)*.35;make(new THREE.CylinderGeometry(.045,.06,height,6),bamboo,x+dx,height/2,z+(i%2)*.2);const frond=make(new THREE.ConeGeometry(.38,.8,5),light,x+dx,height,z+(i%2)*.2);frond.rotation.z=dx*.7}
  // Taller bamboo beyond the wall sways gently as a single rooted clump.
  const bambooClumps=[],stemGeometry=new THREE.CylinderGeometry(.045,.065,1,6),leafGeometry=new THREE.ConeGeometry(.34,.8,5);
  for(const [x,z] of [[-23,-17],[-23,-11],[-23,-5],[-23,1],[-23,7],[-23,13],[-23,19],[23,-17],[23,-11],[23,-5],[23,1],[23,7],[23,13],[23,19],[-17,23],[-11,23],[11,23],[17,23],[-15,-23],[-8,-23],[0,-23],[8,-23],[15,-23]]){const group=new THREE.Group();group.position.set(x,0,z);for(let i=0;i<4;i++){const h=3.4+(i%3)*.5,stem=new THREE.Mesh(stemGeometry,bamboo);stem.scale.y=h;stem.position.set((i-1.5)*.23,h/2,(i%2)*.2);group.add(stem);const leaves=new THREE.Mesh(leafGeometry,light);leaves.position.set(stem.position.x,h,stem.position.z);leaves.rotation.z=(i-1.5)*.2;group.add(leaves)}group.userData.phase=x*.3+z*.2;scene.add(group);bambooClumps.push(group)}
  const px=-12,pz=-9;const rim=make(new THREE.CylinderGeometry(3.5,3.5,.22,40),material('#a9aa8d'),px,.02,pz);const water=make(new THREE.CircleGeometry(3.25,40),new THREE.MeshStandardMaterial({color:'#5c9b94',roughness:.3,metalness:.1}),px,.15,pz);water.rotation.x=-Math.PI/2;
  for(let i=0;i<7;i++){const a=i*2.4,r=1.1+(i%3)*.55;const x=px+Math.cos(a)*r,z=pz+Math.sin(a)*r;const pad=make(new THREE.CircleGeometry(.33,12),green,x,.17,z);pad.rotation.x=-Math.PI/2;const flower=make(new THREE.ConeGeometry(.14,.23,8),material(i%2?'#f6d8dc':'#f2b8be'),x,.28,z);flower.rotation.x=Math.PI}
  // Small water cascade and rocks at the pond edge.
  for(const [x,y,z,s] of [[-14.7,.4,-11.2,.7],[-14.2,.65,-11.5,.9],[-13.5,.35,-11.7,.7]]){const rock=make(new THREE.DodecahedronGeometry(s,0),material('#8e9786'),x,y,z);rock.scale.set(1,.65,.8)}
  const stream=make(new THREE.PlaneGeometry(.65,1.1),new THREE.MeshBasicMaterial({color:'#b8e3d9',transparent:true,opacity:.7,side:THREE.DoubleSide}),-14.2,.7,-11.1);stream.rotation.x=-.35;
  const fish=[];for(let i=0;i<5;i++){const f=make(new THREE.SphereGeometry(.18,8,6),material(i%2?'#e8d9b5':'#d67d52'),px,.19,pz);f.scale.set(1.8,.45,.7);f.userData={phase:i*1.25,radius:.7+i*.42,speed:.18+i*.025};fish.push(f)}
  return {update(time){for(const f of fish){const a=time*f.userData.speed+f.userData.phase;f.position.x=px+Math.cos(a)*f.userData.radius;f.position.z=pz+Math.sin(a)*f.userData.radius;f.rotation.y=-a}for(let i=0;i<clouds.length;i++)clouds[i].position.x=-24+((i*8+time*.12)%56);for(const clump of bambooClumps)clump.rotation.z=Math.sin(time*.6+clump.userData.phase)*.035;stream.material.opacity=.48+Math.sin(time*2)*.12;water.material.roughness=.28+Math.sin(time)*.04}};
}
