function iniciar3D(){
  const canvas=$('cena');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(pxQualidade());
  renderer.shadowMap.enabled=qualidade().sombra;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  scene=new THREE.Scene();scene.background=new THREE.Color('#0c0908');
  camera=new THREE.PerspectiveCamera(36,1,.1,200);
  scene.background=new THREE.Color('#070504');
  scene.add(new THREE.HemisphereLight(lin('#f6e7c9'),lin('#1a110b'),.32));
  const foco=new THREE.SpotLight('#ffdcaa',2,80,Math.PI/4.3,.85,1.1);foco.position.set(-9,25,-6);foco.target.position.set(0,0,-.5);
  foco.castShadow=true;foco.shadow.mapSize.set(2048,2048);foco.shadow.bias=-.0005;foco.shadow.camera.near=8;foco.shadow.camera.far=60;
  scene.add(foco,foco.target);
  const preench=new THREE.DirectionalLight('#9fb2d6',.16);preench.position.set(8,10,-6);scene.add(preench);
  const janela=new THREE.DirectionalLight('#ffd9a8',.6);janela.position.set(5,16,15);janela.castShadow=true;
  janela.shadow.mapSize.set(2048,2048);janela.shadow.bias=-.0006;janela.shadow.radius=3;
  Object.assign(janela.shadow.camera,{left:-15,right:15,top:12,bottom:-12,near:1,far:60});
  scene.add(janela,janela.target);
  const feltro=new THREE.Mesh(new THREE.PlaneGeometry(TW,TD),new THREE.MeshStandardMaterial({map:texturaFeltro(),roughness:.95}));
  feltro.rotation.x=-Math.PI/2;feltro.receiveShadow=true;scene.add(feltro);MESA.feltro=feltro;MESA.feltroAto=0;
  const madeira=matMadeira(2,.35,'#c99d76',{rough:.5,relevo:.03});
  const madeiraV=matMadeira(2,.35,'#c99d76',{rough:.5,relevo:.03,rot:Math.PI/2});
  const borda=(w,d,x,z,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,.7,d),m);b.position.set(x,.35,z);b.castShadow=true;b.receiveShadow=true;scene.add(b)};
  borda(TW+1.6,.8,0,-TD/2-.4,madeira);borda(TW+1.6,.8,0,TD/2+.4,madeira);borda(.8,TD,-TW/2-.4,0,madeiraV);borda(.8,TD,TW/2+.4,0,madeiraV);
  const base=new THREE.Mesh(new THREE.BoxGeometry(TW+2.3,.5,TD+2.3),matMadeira(3,1.5,'#7a543b',{rough:.55,relevo:.03}));
  base.position.y=-.26;base.castShadow=base.receiveShadow=true;scene.add(base);
  const latao=new THREE.MeshStandardMaterial({color:lin('#b8893a'),metalness:.75,roughness:.32});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const c=new THREE.Mesh(new THREE.BoxGeometry(.92,.76,.92),latao);c.position.set(sx*(TW/2+.4),.38,sz*(TD/2+.4));c.castShadow=c.receiveShadow=true;scene.add(c)});
  const chao=new THREE.Mesh(new THREE.PlaneGeometry(90,64),matMadeira(4,3,'#ad8566',{rough:.6,res:2048,relevo:.06}));
  chao.rotation.x=-Math.PI/2;chao.position.y=-.51;chao.receiveShadow=true;scene.add(chao);
  criarAderecos(latao);
  criarContador(latao);

  world=new CANNON.World();world.gravity.set(0,-32,0);world.broadphase=new CANNON.NaiveBroadphase();world.solver.iterations=14;
  mDado=new CANNON.Material('dado');const mMesa=new CANNON.Material('mesa'),mParede=new CANNON.Material('parede');
  world.addContactMaterial(new CANNON.ContactMaterial(mDado,mMesa,{friction:.32,restitution:.34}));
  world.addContactMaterial(new CANNON.ContactMaterial(mDado,mParede,{friction:.05,restitution:.62}));
  world.addContactMaterial(new CANNON.ContactMaterial(mDado,mDado,{friction:.2,restitution:.4}));
  const plano=(mat,px,py,pz,ax,ay,az,ang)=>{const b=new CANNON.Body({mass:0,material:mat});b.addShape(new CANNON.Plane());b.position.set(px,py,pz);b.quaternion.setFromAxisAngle(new CANNON.Vec3(ax,ay,az),ang);world.addBody(b)};
  plano(mMesa,0,0,0,1,0,0,-Math.PI/2);
  plano(mParede,-TW/2,0,0,0,1,0,Math.PI/2);
  plano(mParede,TW/2,0,0,0,1,0,-Math.PI/2);
  plano(mParede,0,0,-TD/2,0,1,0,0);
  plano(mParede,0,0,TD/2,0,1,0,Math.PI);
  plano(mParede,0,8,0,1,0,0,Math.PI/2);

  new ResizeObserver(ajustar).observe($('mesa'));ajustar();
  iniciarBandeja();
  criarBolsaCasa();iniciarHoverMesa();
  let ult=performance.now();
  const loop=t=>{const dt=Math.min(.05,(t-ult)/1000);ult=t;passo(dt);atualizarEfeitos(dt);atualizarContador(dt);passoBandeja(dt);renderer.render(scene,camera);posicionarRotulos();posicionarAncoras();requestAnimationFrame(loop)};
  requestAnimationFrame(loop);
}
function ajustar(){
  const r=$('mesa').getBoundingClientRect();if(!r.width||!r.height)return;
  renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;
  const t=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const extra=MESA.linhas>1?(MESA.linhas-1)+.35:0;
  if(camera.aspect<.85){
    const d=Math.max((TW/2+3.9)/t,(TD/2+1.3+extra/2)/(t*camera.aspect));
    const tilt=.2,olhaX=2.1;camera.position.set(olhaX-d*Math.sin(tilt),d*Math.cos(tilt),extra/2);camera.lookAt(olhaX,0,extra/2);
    if(CONT){CONT.g.position.set(TW/2+.8+1.75,-.51,extra/2);CONT.g.rotation.y=-Math.PI/2}
  }else{
    const d=Math.max((TD/2+3.5+extra/2)/t,(TW/2+1.3)/(t*camera.aspect));
    const tilt=.26,olhaZ=-1.55+extra/2;camera.position.set(0,d*Math.cos(tilt),extra/2-.65+d*Math.sin(tilt));camera.lookAt(0,0,olhaZ);
    if(CONT){CONT.g.position.set(0,-.51,-TD/2-.8-1.75);CONT.g.rotation.y=0}
  }
  camera.updateProjectionMatrix();camBase.copy(camera.position);
}

function lancar(die,dono,z,forca=1){
  const casa=dono==='casa';
  const mesh=criarMalha(die,casa);scene.add(mesh);
  const body=new CANNON.Body({mass:1,material:mDado});body.addShape(shapeFisica(die.type));
  const lado=casa?1:-1;
  body.position.set(lado*(TW/2-1.3),2.2+Math.random(),z??rnd(TD*.28));
  body.quaternion.setFromEuler(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28);
  body.velocity.set(-lado*(9+Math.random()*6)*forca,2+Math.random()*3,rnd(2.5)-body.position.z*.5);
  body.angularVelocity.set(rnd(24),rnd(24),rnd(24));
  body.linearDamping=.12;body.angularDamping=.14;
  world.addBody(body);
  const metal=!casa&&DIE[die.type].metal;
  body.addEventListener('collide',e=>{const v=Math.abs(e.contact.getImpactVelocityAlongNormal());if(v>1){SOM.batida(v,metal);if(v>9)tremer(.05)}});
  SOM.whoosh();
  mesh.position.copy(body.position);mesh.quaternion.copy(body.quaternion);
  lancados.push({die,dono,mesh,body,sd:forma(die.type),parado:0,tempo:0,cutucadas:0,pronto:false,rotulo:null,punch:0});
}
function passo(dt){
  if(!world)return;
  if(S.pausado)return;
  if(hitStop>0){hitStop-=dt;return}
  world.step(1/120,dt,8);
  for(const t of lancados){
    if(t.body.position.y<-3){t.body.position.set(0,3,0);t.body.velocity.set(0,0,0)}
    t.mesh.position.copy(t.body.position);t.mesh.quaternion.copy(t.body.quaternion);
    if(t.pronto)continue;
    t.tempo+=dt;
    const v=t.body.velocity.length(),a=t.body.angularVelocity.length();
    if(v<.07&&a<.14)t.parado+=dt;else t.parado=0;
    if(t.parado>.3||t.tempo>8)avaliar(t);
  }
}
function avaliar(t){
  let melhor=-2,k=0;
  t.sd.vf.forEach((fi,i)=>{const y=t.sd.N[fi].clone().applyQuaternion(t.mesh.quaternion).y;if(y>melhor){melhor=y;k=i}});
  if(melhor<.9&&t.cutucadas<5){t.cutucadas++;t.parado=0;t.tempo=Math.min(t.tempo,6);t.body.velocity.set(rnd(1.5),5,rnd(1.5));t.body.angularVelocity.set(rnd(9),rnd(9),rnd(9));return}
  t.pronto=true;t.face=k;aoParar(t);
}
function posicionarRotulos(){
  const r=$('mesa').getBoundingClientRect();const v=new THREE.Vector3();
  for(const t of lancados){
    if(!t.rotulo)continue;
    v.copy(t.mesh.position);v.y+=.95;v.project(camera);
    t.rotulo.style.left=((v.x+1)/2*r.width)+'px';t.rotulo.style.top=((1-v.y)/2*r.height)+'px';
  }
}
function limparMesa(){
  for(const t of lancados){
    scene.remove(t.mesh);world.remove(t.body);t.mesh.geometry.dispose();t.mesh.children.forEach(c=>c.geometry.dispose());
    t.mesh.material.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});
    if(t.rotulo)t.rotulo.remove();
  }
  lancados.length=0;
  auras3D.forEach(a=>{scene.remove(a.g);a.g.children.forEach(m=>{m.geometry.dispose();m.material.dispose()})});
  auras3D.length=0;areas.length=0;
}

function trocarFeltro(ato){
  if(!MESA.feltro||MESA.feltroAto===ato||!ATOS[ato])return;
  const m=MESA.feltro.material;if(m.map)m.map.dispose();
  m.map=texturaFeltro(ATOS[ato].feltro);m.needsUpdate=true;MESA.feltroAto=ato;
}
