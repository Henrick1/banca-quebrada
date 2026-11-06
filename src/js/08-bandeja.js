const B={itens:[],w:4,d:9,paredes:[],bordas:[],arr:null,hover:null};
function texturaCouro(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle='#3b2416';x.fillRect(0,0,512,512);
  const img=x.getImageData(0,0,512,512),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*16;d[i]+=n;d[i+1]+=n*.8;d[i+2]+=n*.6}
  x.putImageData(img,0,0);
  const g=x.createRadialGradient(256,256,60,256,256,380);g.addColorStop(0,'rgba(255,220,170,.06)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fillRect(0,0,512,512);
  x.strokeStyle='rgba(212,169,79,.3)';x.setLineDash([6,8]);x.lineWidth=3;x.strokeRect(16,16,480,480);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
}
function iniciarBandeja(){
  const cv=$('cenaBandeja');
  B.r=new THREE.WebGLRenderer({canvas:cv,antialias:true});B.r.setPixelRatio(pxPequeno());
  B.r.shadowMap.enabled=qualidade().sombra;B.r.shadowMap.type=THREE.PCFSoftShadowMap;B.r.outputEncoding=THREE.sRGBEncoding;B.r.toneMapping=THREE.ACESFilmicToneMapping;
  B.scene=new THREE.Scene();B.scene.background=new THREE.Color('#140d09');
  B.cam=new THREE.PerspectiveCamera(32,1,.1,100);
  B.scene.add(new THREE.HemisphereLight('#f6e7c9','#1a110b',.6));
  const l=new THREE.DirectionalLight('#ffe1ae',1.2);l.position.set(-3,14,5);l.castShadow=true;l.shadow.mapSize.set(1024,1024);
  Object.assign(l.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:40});l.shadow.bias=-.0006;B.scene.add(l);
  B.fundo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({map:texturaCouro(),roughness:.9}));
  B.fundo.rotation.x=-Math.PI/2;B.fundo.receiveShadow=true;B.scene.add(B.fundo);
  const mad=matMadeira(1.5,.3,'#c99d76',{rough:.5,relevo:.03});
  for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,.6,1),mad);m.castShadow=m.receiveShadow=true;B.scene.add(m);B.bordas.push(m)}
  B.world=new CANNON.World();B.world.gravity.set(0,-32,0);B.world.broadphase=new CANNON.NaiveBroadphase();B.world.solver.iterations=10;
  B.md=new CANNON.Material('d');const mf=new CANNON.Material('f');
  B.world.addContactMaterial(new CANNON.ContactMaterial(B.md,mf,{friction:.4,restitution:.2}));
  B.world.addContactMaterial(new CANNON.ContactMaterial(B.md,B.md,{friction:.3,restitution:.2}));
  const chao=new CANNON.Body({mass:0,material:mf});chao.addShape(new CANNON.Plane());chao.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);B.world.addBody(chao);
  [Math.PI/2,-Math.PI/2,0,Math.PI].forEach(an=>{const b=new CANNON.Body({mass:0,material:mf});b.addShape(new CANNON.Plane());b.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),an);B.world.addBody(b);B.paredes.push(b)});
  criarSaco();
  new ResizeObserver(ajustarBandeja).observe($('bandejaCena'));ajustarBandeja();

  const ray=new THREE.Raycaster(),plano=new THREE.Plane(new THREE.Vector3(0,1,0),-1.1);
  const ndc=e=>{const r=cv.getBoundingClientRect();return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1)};
  const pegar=e=>{ray.setFromCamera(ndc(e),B.cam);const h=ray.intersectObjects(B.itens.map(i=>i.mesh));return h.length?B.itens.find(i=>i.mesh===h[0].object):null};
  const noSaco=e=>{ray.setFromCamera(ndc(e),B.cam);return ray.intersectObjects([B.saco.g,B.saco.tag],true).length>0};
  const destino=e=>{
    const a=B.arr;if(a&&a.cru&&Math.hypot(a.cru.x-B.saco.g.position.x,a.cru.z-B.saco.g.position.z)<1.25)return'bolsa';
    const el=document.elementFromPoint(e.clientX,e.clientY);if(!el)return null;if(el.closest('#mesa'))return'mesa';return null};
  cv.addEventListener('pointerdown',e=>{
    const it=pegar(e);
    if(!it){
      if(!noSaco(e))return;
      cv.setPointerCapture(e.pointerId);
      const a=B.arr={saco:true,x:e.clientX,y:e.clientY,modo:'press',lx:e.clientX,ly:e.clientY};
      a.timer=setTimeout(()=>{if(B.arr===a){a.modo='info';infoSaco(a.lx,a.ly)}},380);
      B.saco.aperto=1;return;
    }
    cv.setPointerCapture(e.pointerId);
    const a=B.arr={it,x:e.clientX,y:e.clientY,modo:'press',vx:0,vy:0,lx:e.clientX,ly:e.clientY,lt:performance.now()};
    a.timer=setTimeout(()=>{if(B.arr===a&&a.modo==='press'){a.modo='info';mostrarInfo(it.die,a.lx,a.ly)}},380);
    marcar();
  });
  cv.addEventListener('pointermove',e=>{
    const a=B.arr;
    if(!a){B.hover=pegar(e);B.saco.hover=!B.hover&&noSaco(e);marcar();return}
    if(a.saco){a.lx=e.clientX;a.ly=e.clientY;if(Math.hypot(e.clientX-a.x,e.clientY-a.y)>10){clearTimeout(a.timer);a.modo='cancelado';esconderInfo()}return}
    const now=performance.now(),dtm=Math.max(1,now-a.lt);
    a.vx=(e.clientX-a.lx)/dtm;a.vy=(e.clientY-a.ly)/dtm;a.lx=e.clientX;a.ly=e.clientY;a.lt=now;
    if((a.modo==='press'||a.modo==='info')&&Math.hypot(e.clientX-a.x,e.clientY-a.y)>6){
      clearTimeout(a.timer);esconderInfo();a.modo='drag';a.it.body.type=CANNON.Body.KINEMATIC;a.it.body.angularVelocity.set(0,0,0);marcar();
    }
    if(a.modo==='drag'){
      ray.setFromCamera(ndc(e),B.cam);const p=new THREE.Vector3();
      if(ray.ray.intersectPlane(plano,p)){a.cru=p.clone();p.x=Math.max(-B.w/2+.6,Math.min(B.w/2-.6,p.x));p.z=Math.max(-B.d/2+.6,Math.min(B.d/2-.6,p.z));a.alvo=p}
      marcarDestino(destino(e));
    }
  });
  const soltar=(e,cancel)=>{
    const a=B.arr;if(!a)return;
    clearTimeout(a.timer);B.arr=null;esconderInfo();marcarDestino(null);
    if(a.saco){if(a.modo==='press'&&!cancel){if(podePuxar())puxarPago();else{B.saco.pulso=.5;SOM.batida(3,false);avisar(motivoSaco())}}marcar();return}
    if(a.modo==='press'&&!cancel)lancarDaBandeja(a.it,1);
    else if(a.modo==='drag'){
      const it=a.it;it.body.type=CANNON.Body.DYNAMIC;it.body.velocity.set(0,0,0);it.body.wakeUp();
      const dst=cancel?null:destino(e);
      if(dst==='mesa')lancarDaBandeja(it,Math.min(1.35,Math.max(.75,Math.hypot(a.vx,a.vy)*.9)));
      else if(dst==='bolsa')guardarNaBolsa(it);
    }
    marcar();
  };
  cv.addEventListener('pointerup',e=>soltar(e,false));
  cv.addEventListener('pointercancel',e=>soltar(e,true));
  cv.addEventListener('pointerleave',()=>{if(!B.arr){B.hover=null;B.saco.hover=false;marcar()}});
}
function ajustarBandeja(){
  const r=$('bandejaCena').getBoundingClientRect();if(!r.width||!r.height)return;
  B.r.setSize(r.width,r.height,false);const a=r.width/r.height;B.cam.aspect=a;
  const ow=a<1?4.6:4.6*a,od=a<1?4.6/a:4.6,faixa=2.1;
  B.alto=a<1;
  B.w=ow-.7-(B.alto?0:faixa);B.d=od-.7-(B.alto?faixa:0);
  B.offX=B.alto?0:faixa/2;B.offZ=B.alto?faixa/2:0;
  B.fundo.scale.set(B.w,B.d,1);
  const e=.35,h=.3;
  B.bordas[0].scale.set(e,1,B.d+2*e);B.bordas[0].position.set(-B.w/2-e/2,h,0);
  B.bordas[1].scale.set(e,1,B.d+2*e);B.bordas[1].position.set(B.w/2+e/2,h,0);
  B.bordas[2].scale.set(B.w,1,e);B.bordas[2].position.set(0,h,-B.d/2-e/2);
  B.bordas[3].scale.set(B.w,1,e);B.bordas[3].position.set(0,h,B.d/2+e/2);
  B.paredes[0].position.set(-B.w/2,0,0);B.paredes[1].position.set(B.w/2,0,0);
  B.paredes[2].position.set(0,0,-B.d/2);B.paredes[3].position.set(0,0,B.d/2);
  const t=Math.tan(THREE.MathUtils.degToRad(B.cam.fov/2));
  const dist=Math.max((od/2+.35)/t,(ow/2+.2)/(t*a));const tilt=.16;
  B.cam.position.set(B.offX,dist*Math.cos(tilt),B.offZ+dist*Math.sin(tilt));B.cam.lookAt(B.offX,0,B.offZ);B.cam.updateProjectionMatrix();
  posicionarSaco();
  for(const it of B.itens){const p=it.body.position;p.x=Math.max(-B.w/2+.6,Math.min(B.w/2-.6,p.x));p.z=Math.max(-B.d/2+.6,Math.min(B.d/2-.6,p.z))}
}
function addBandeja(die){
  const mesh=criarMalha(die,false);B.scene.add(mesh);
  const body=new CANNON.Body({mass:1,material:B.md});body.addShape(shapeFisica(die.type));
  if(B.saco){
    const sp=B.saco.g.position;
    const ex=B.alto?rnd(B.w/2-.8):B.w/2-.6,ez=B.alto?B.d/2-.6:rnd(B.d/2-.8);
    body.position.set(ex,2.2,ez);
    const dx=-ex,dz=-ez,L=Math.hypot(dx,dz)||1;
    body.velocity.set(dx/L*(3+Math.random()*3)+rnd(.8),2+Math.random()*2,dz/L*(3+Math.random()*3)+rnd(.8));
    B.saco.pulso=1;
  }else body.position.set(rnd(B.w/2-.7),2.5+Math.random()*1.5,rnd(B.d/2-.7));
  body.quaternion.setFromEuler(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28);
  body.angularVelocity.set(rnd(10),rnd(10),rnd(10));body.linearDamping=.25;body.angularDamping=.3;
  B.world.addBody(body);mesh.position.copy(body.position);mesh.quaternion.copy(body.quaternion);
  body.addEventListener('collide',e=>{const v=Math.abs(e.contact.getImpactVelocityAlongNormal());if(v>1.2)SOM.batida(v*1.4,DIE[die.type].metal,.7)});
  B.itens.push({die,mesh,body});
}
function tirarBandeja(it){
  B.itens.splice(B.itens.indexOf(it),1);B.scene.remove(it.mesh);B.world.remove(it.body);
  it.mesh.geometry.dispose();it.mesh.children.forEach(c=>c.geometry.dispose());it.mesh.material.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});
  if(B.hover===it)B.hover=null;
}
function limparBandeja(){[...B.itens].forEach(tirarBandeja)}
function passoBandeja(dt){
  if(!B.world)return;
  const a=B.arr;
  if(a&&a.modo==='drag'&&a.alvo){const p=a.it.body.position;a.it.body.velocity.set((a.alvo.x-p.x)*16,(1.1-p.y)*16,(a.alvo.z-p.z)*16)}
  B.world.step(1/90,dt,6);
  for(const it of B.itens){
    it.mesh.position.copy(it.body.position);it.mesh.quaternion.copy(it.body.quaternion);
    it.lift=(it.lift||0)+(((B.hover===it&&!B.arr)?.22:0)-(it.lift||0))*Math.min(1,dt*14);
    it.mesh.position.y+=it.lift;
  }
  animarSaco(dt);sincronizarCorrente();
  const b=B.saco,ativo=B.arr||B.hover||(b&&(b.pulso>0||b.aperto>0||b.alvo||b.hover))||B.itens.some(it=>it.body.velocity.lengthSquared()>.0004||it.body.angularVelocity.lengthSquared()>.0004||Math.abs(it.lift||0)>.002);
  B.ocioso=ativo?0:(B.ocioso||0)+1;
  if(B.ocioso%6===0)B.r.render(B.scene,B.cam);
}
function criarCorrente(){
  const g=new THREE.Group(),aco=new THREE.MeshStandardMaterial({color:lin('#9aa2ac'),metalness:.9,roughness:.32}),elo=new THREE.TorusGeometry(.1,.032,8,16);
  const voltas=new THREE.Group();g.add(voltas);
  [0,Math.PI/2].forEach(ry=>{const v=new THREE.Group();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,m=new THREE.Mesh(elo,aco);m.position.set(Math.cos(a),Math.sin(a),0);m.rotation.z=a+Math.PI/2;m.rotation.x=i%2?Math.PI/2:0;m.castShadow=true;v.add(m)}v.rotation.y=ry;v.scale.setScalar(ry?1.04:1);voltas.add(v)});
  const cad=new THREE.Group(),latao=new THREE.MeshStandardMaterial({color:lin('#c9a24a'),metalness:.85,roughness:.3});
  const corpo=new THREE.Mesh(new THREE.BoxGeometry(.3,.26,.12),latao);corpo.castShadow=true;cad.add(corpo);
  const arco=new THREE.Mesh(new THREE.TorusGeometry(.095,.03,10,20,Math.PI),aco);arco.position.y=.13;cad.add(arco);
  const fur=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.02,12),new THREE.MeshBasicMaterial({color:'#1a120b'}));fur.rotation.x=Math.PI/2;fur.position.set(0,-.02,.061);cad.add(fur);
  g.add(cad);g.visible=false;B.scene.add(g);B.corrente={g,voltas,cad,id:null,t:0};
}
function sincronizarCorrente(){
  if(!B.scene)return;if(!B.corrente)criarCorrente();
  const c=B.corrente,it=S.congelado?B.itens.find(x=>x.die.id===S.congelado):null;
  if(!it){c.g.visible=false;c.id=null;return}
  if(c.id!==it.die.id){c.id=it.die.id;c.t=0;if(!it.mesh.geometry.boundingSphere)it.mesh.geometry.computeBoundingSphere();c.raio=it.mesh.geometry.boundingSphere.radius*.86;SOM.batida(7,true)}
  c.t=Math.min(1,c.t+.05);const s=c.raio*(1.6-.6*c.t);
  c.g.visible=true;c.g.position.copy(it.mesh.position);c.voltas.quaternion.copy(it.mesh.quaternion);c.voltas.scale.setScalar(s);
  c.cad.position.set(0,c.raio*.9+.12,c.raio*.6+.12);c.cad.rotation.set(-1.05,0,Math.sin(performance.now()/260)*.12);c.cad.scale.setScalar(1.25*(.6+.4*c.t));
}
function marcar(){
  const ativo=B.arr?B.arr.it:B.hover;
  for(const it of B.itens)it.mesh.material.forEach(m=>m.emissive.setHex(it===ativo?0x2a1c08:it.die.id===S.congelado?0x1a4a80:0));
  const cv=$('cenaBandeja');
  cv.classList.toggle('mao',(!!B.hover||(B.saco&&B.saco.hover))&&!B.arr);
  cv.classList.toggle('pegando',!!B.arr&&B.arr.modo==='drag');
}
function marcarDestino(d){
  $('mesa').classList.toggle('alvo',d==='mesa'&&podeLancar());
  if(B.saco)B.saco.alvo=d==='bolsa';
}
function mostrarInfo(die,x,y){
  const def=DIE[die.type],el=$('info');
  const media=(die.faces.reduce((s,f)=>s+valorFace(f),0)/die.faces.length).toFixed(1).replace('.',',');
  const mexidas=die.faces.map((f,i)=>({f,i})).filter(o=>o.f.fx||o.f.bonus);
  el.innerHTML=`<h4>${def.nome}<small>média ${media}</small></h4>
    <div class="faces">${die.faces.map((_,i)=>chip(die,i)).join('')}</div>
    ${die.encanto?`<p class="nota" style="color:${ENCANTOS[die.encanto].ui}"><b>${ENCANTOS[die.encanto].nome} · ${ENCANTOS[die.encanto].combo}:</b> ${ENCANTOS[die.encanto].desc}</p>`:''}
    <ul>${mexidas.length?mexidas.map(({f,i})=>`<li><b>${def.rot?def.rot[i]:'Face '+f.v}</b> vale ${valorFace(f)}${f.bonus?` (+${f.bonus})`:''}${f.fx?` · ${FX[f.fx.k].nome}${f.fx.n?' '+f.fx.n:''}: ${FX[f.fx.k].desc(f.fx.n)}`:''}</li>`).join(''):'<li>Nenhuma face melhorada ainda.</li>'}</ul>`;
  el.hidden=false;
  const r=el.getBoundingClientRect();
  let left=x+18;if(left+r.width>innerWidth-12)left=x-18-r.width;
  let top=y-r.height/2;top=Math.max(12,Math.min(innerHeight-r.height-12,top));
  el.style.left=Math.max(12,left)+'px';el.style.top=top+'px';
}
function esconderInfo(){$('info').hidden=true}
function texturaSaco(){
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  x.fillStyle='#7a4526';x.fillRect(0,0,512,256);
  const img=x.getImageData(0,0,512,256),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*26;d[i]+=n;d[i+1]+=n*.75;d[i+2]+=n*.5}
  x.putImageData(img,0,0);
  for(let i=0;i<70;i++){x.strokeStyle=`rgba(40,18,6,${.12+Math.random()*.18})`;x.lineWidth=1+Math.random()*2;x.beginPath();const px=Math.random()*512,py=Math.random()*256;x.moveTo(px,py);x.quadraticCurveTo(px+rnd(30),py+rnd(20),px+rnd(60),py+rnd(30));x.stroke()}
  const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.35,'rgba(255,220,170,.06)');g.addColorStop(.8,'rgba(0,0,0,.05)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fillRect(0,0,512,256);
  for(let k=0;k<4;k++){const sx=k*128+64;x.strokeStyle='rgba(30,14,4,.55)';x.lineWidth=5;x.beginPath();x.moveTo(sx,40);x.lineTo(sx,240);x.stroke();
    x.strokeStyle='rgba(226,201,142,.85)';x.lineWidth=2.4;x.setLineDash([7,7]);x.beginPath();x.moveTo(sx+4,44);x.lineTo(sx+4,236);x.stroke();x.setLineDash([])}
  x.strokeStyle='rgba(226,201,142,.7)';x.lineWidth=2.4;x.setLineDash([7,7]);x.beginPath();x.moveTo(0,232);x.lineTo(512,232);x.stroke();x.setLineDash([]);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;return t;
}
function criarSaco(){
  const pts=[[0,0],[.4,.02],[.58,.16],[.64,.38],[.58,.62],[.42,.8],[.24,.9],[.18,.95],[.2,1.0],[.3,1.08],[.4,1.16],[.42,1.19],[.38,1.2]].map(p=>new THREE.Vector2(p[0],p[1]));
  const g=new THREE.Group();
  const couro=new THREE.MeshStandardMaterial({map:texturaSaco(),color:lin('#ffffff'),roughness:.82,side:THREE.DoubleSide,emissive:new THREE.Color('#ffb04a'),emissiveIntensity:0});
  const geo=new THREE.LatheGeometry(pts,48),pa=geo.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),a=Math.atan2(z,x);let f=1+.045*Math.sin(a*6+y*3)+.03*Math.sin(a*11);if(y>.97)f*=1+.2*Math.sin(a*10)*Math.min(1,(y-.97)/.12);pa.setXYZ(i,x*f,y-(y<.5?.02*Math.sin(a*3):0),z*f*.92)}
  geo.computeVertexNormals();
  const corpo=new THREE.Mesh(geo,couro);corpo.castShadow=corpo.receiveShadow=true;
  const latao=new THREE.MeshStandardMaterial({color:lin('#d4a94f'),metalness:.75,roughness:.3});
  const cordaM=new THREE.MeshStandardMaterial({color:lin('#d9bf86'),roughness:.85});
  const cord=new THREE.Mesh(new THREE.TorusGeometry(.2,.04,10,28),cordaM);cord.rotation.x=Math.PI/2;cord.position.y=.94;
  const corpoG=new THREE.Group();corpoG.add(corpo,cord);
  [[.16,.5,-.4],[.24,.42,.35]].forEach(([dx,len,rz],i)=>{
    const f=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,len,8),cordaM);f.position.set(dx,.94-len/2+.02,.16+i*.05);f.rotation.z=rz;f.castShadow=true;corpoG.add(f);
    const b=new THREE.Mesh(new THREE.SphereGeometry(.065,14,10),latao);b.position.set(dx+Math.sin(-rz)*len*.5*-1,.94-len*Math.cos(rz)+.04,.17+i*.05);b.castShadow=true;corpoG.add(b);
  });
  const med=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.04,28),latao);med.rotation.x=Math.PI/2;med.position.set(0,.42,.6);corpoG.add(med);
  const cvM=document.createElement('canvas');cvM.width=cvM.height=128;const xm=cvM.getContext('2d');
  xm.fillStyle='#c99a3f';xm.fillRect(0,0,128,128);xm.strokeStyle='#7a5520';xm.lineWidth=6;xm.beginPath();xm.arc(64,64,54,0,Math.PI*2);xm.stroke();
  xm.fillStyle='#3a2410';[[44,44],[84,44],[64,64],[44,84],[84,84]].forEach(([a,b])=>{xm.beginPath();xm.arc(a,b,9,0,Math.PI*2);xm.fill()});
  const texM=new THREE.CanvasTexture(cvM);texM.encoding=THREE.sRGBEncoding;
  const face=new THREE.Mesh(new THREE.CircleGeometry(.15,28),new THREE.MeshStandardMaterial({map:texM,metalness:.6,roughness:.35}));face.position.set(0,.42,.621);corpoG.add(face);
  const osso=new THREE.MeshStandardMaterial({color:lin('#efe6cf'),roughness:.45});
  const d1=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.2),osso);d1.position.set(-.06,1.08,.02);d1.rotation.set(.5,.7,.3);d1.castShadow=true;corpoG.add(d1);
  const d2=new THREE.Mesh(new THREE.BoxGeometry(.17,.17,.17),latao);d2.position.set(.1,1.05,-.06);d2.rotation.set(.2,1.2,.6);d2.castShadow=true;corpoG.add(d2);
  corpoG.rotation.x=-.42;g.add(corpoG);
  const cv=document.createElement('canvas');cv.width=256;cv.height=112;
  const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));tag.scale.set(1.5,.66,1);B.scene.add(tag);corpoG.scale.setScalar(1.25);
  B.scene.add(g);
  B.mesaFora=new THREE.Mesh(new THREE.PlaneGeometry(40,40),matMadeira(5,5,'#ad8566',{rough:.6,relevo:.04}));
  B.mesaFora.rotation.x=-Math.PI/2;B.mesaFora.receiveShadow=true;B.scene.add(B.mesaFora);
  const body=new CANNON.Body({mass:0,material:B.md});body.addShape(new CANNON.Sphere(.6));body.position.set(0,-50,0);B.world.addBody(body);
  B.saco={g,corpoG,couro,tag,cv,ctx:cv.getContext('2d'),tex,body,pulso:0,aperto:0,hover:false,alvo:false,txt:null,t:0};
  desenharEtiqueta();
}
function posicionarSaco(){
  if(!B.saco)return;
  const x=B.alto?0:B.w/2+.35+1.05,z=B.alto?B.d/2+.35+1.05:0;
  const bx=B.alto?x-1.15:x,bz=B.alto?z:z-.75;
  B.saco.g.position.set(bx,0,bz);B.saco.body.position.set(bx,-50,bz);
  B.saco.tag.position.set(B.alto?x+1.12:x,.35,B.alto?z:z+1.15);B.saco.tagBase=B.alto?2.25:1.95;
  if(B.mesaFora){B.mesaFora.position.set(B.offX,-.02,B.offZ)}
}
function motivoSaco(){
  if(!S.bolsa.length)return'A bolsa está vazia';
  if(S.mao.length>=maoMax())return'Sua mão está cheia';
  if(!podeLancar())return'Só dá para puxar na sua vez';
  return'';
}
function desenharEtiqueta(){
  const b=B.saco;if(!b)return;
  const n=S.bolsa.length,pode=podePuxar();
  const titulo=!n?'Vazia':pode?'Puxar':S.mao.length>=maoMax()?'Mão cheia':'Bolsa';
  const tipos=S.bolsa.map(id=>{const d=S.dados.find(x=>x.id===id);return d?d.type:'d6'});
  const chave=titulo+'|'+tipos.join(',')+'|'+pode+'|'+custoPuxar();if(chave===b.txt)return;b.txt=chave;
  if(b.cv.width!==512){b.cv.width=512;b.cv.height=224}
  const x=b.ctx,W=512,H=224;x.clearRect(0,0,W,H);
  const forma=()=>{x.beginPath();x.moveTo(64,14);x.lineTo(W-18,14);x.quadraticCurveTo(W-6,14,W-6,26);x.lineTo(W-6,H-26);x.quadraticCurveTo(W-6,H-14,W-18,H-14);x.lineTo(64,H-14);x.lineTo(10,H/2);x.closePath()};
  x.save();x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=14;x.shadowOffsetY=5;
  const pg=x.createLinearGradient(0,0,0,H);pg.addColorStop(0,'#f3e6c8');pg.addColorStop(1,'#d8c194');x.fillStyle=pg;forma();x.fill();x.restore();
  for(let i=0;i<500;i++){x.fillStyle=`rgba(120,80,30,${Math.random()*.05})`;x.fillRect(10+Math.random()*(W-20),14+Math.random()*(H-28),2+Math.random()*4,1)}
  x.strokeStyle='#5a3a1e';x.lineWidth=5;forma();x.stroke();
  x.save();x.setLineDash([9,7]);x.strokeStyle='rgba(90,58,30,.55)';x.lineWidth=2;
  x.beginPath();x.moveTo(70,28);x.lineTo(W-20,28);x.lineTo(W-20,H-28);x.lineTo(70,H-28);x.lineTo(28,H/2);x.closePath();x.stroke();x.restore();
  const ilho=x.createRadialGradient(52,H/2,4,52,H/2,17);ilho.addColorStop(0,'#2a1a0e');ilho.addColorStop(.55,'#2a1a0e');ilho.addColorStop(.6,'#e6c06a');ilho.addColorStop(1,'#8a6324');
  x.fillStyle=ilho;x.beginPath();x.arc(52,H/2,17,0,Math.PI*2);x.fill();
  x.fillStyle=pode?'#3a2414':'#6b5640';x.font=`${titulo.length>6?66:100}px "Pirata One",serif`;x.textAlign='left';x.textBaseline='alphabetic';
  x.fillText(titulo,84,112);
  const cor={d6:['#efe6cf','#2b211a'],coin:['#d9a83e','#6b4a10'],d10:['#2e6a6c','#f1e8d4'],d20:['#8a2d37','#f3e9d5'],d4:['#d07a34','#fff3e0'],d8:['#2f5590','#eef2fa'],d12:['#5b3a7e','#f3e9fb']};
  const q=Math.min(tipos.length,5),R=19;
  tipos.slice(0,q).forEach((t,i)=>{
    const cx=104+i*46,cy=166,[f,l]=cor[t];x.fillStyle=f;x.strokeStyle='rgba(40,24,10,.75)';x.lineWidth=3;
    x.beginPath();
    if(t==='coin')x.arc(cx,cy,R,0,Math.PI*2);
    else if(t==='d20'){for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;x.lineTo(cx+R*1.08*Math.cos(a),cy+R*1.08*Math.sin(a))}x.closePath()}
    else if(t==='d4'){x.moveTo(cx,cy-R*1.15);x.lineTo(cx+R*1.15,cy+R*.85);x.lineTo(cx-R*1.15,cy+R*.85);x.closePath()}
    else if(t==='d8'){x.moveTo(cx,cy-R*1.15);x.lineTo(cx+R*.95,cy);x.lineTo(cx,cy+R*1.15);x.lineTo(cx-R*.95,cy);x.closePath()}
    else if(t==='d12'){for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*2/5;x.lineTo(cx+R*1.12*Math.cos(a),cy+R*1.12*Math.sin(a))}x.closePath()}
    else if(t==='d10'){x.moveTo(cx,cy-R*1.15);x.lineTo(cx+R*1.05,cy-2);x.lineTo(cx,cy+R*1.15);x.lineTo(cx-R*1.05,cy-2);x.closePath()}
    else x.roundRect?x.roundRect(cx-R,cy-R,R*2,R*2,7):x.rect(cx-R,cy-R,R*2,R*2);
    x.fill();x.stroke();x.fillStyle=l;x.beginPath();x.arc(cx,cy,4.5,0,Math.PI*2);x.fill();
  });
  x.fillStyle='#5a3a1e';x.font='800 36px "Alegreya Sans",sans-serif';x.textBaseline='middle';
  if(tipos.length>q)x.fillText(`+${tipos.length-q}`,104+q*46-12,168);
  if(!n)x.fillText('nada aqui',86,168);
  const mx=W-80,my=H/2;
  const md=x.createRadialGradient(mx-14,my-16,4,mx,my,64);md.addColorStop(0,pode?'#ffe9a8':'#cdb98e');md.addColorStop(.7,pode?'#d4a94f':'#9c8a66');md.addColorStop(1,pode?'#8a6324':'#5e5240');
  x.fillStyle=md;x.beginPath();x.arc(mx,my,62,0,Math.PI*2);x.fill();
  x.strokeStyle='rgba(60,36,12,.8)';x.lineWidth=3;x.stroke();
  x.strokeStyle='rgba(255,240,200,.5)';x.lineWidth=2;x.beginPath();x.arc(mx,my,53,0,Math.PI*2);x.stroke();
  x.fillStyle='#3a2410';x.textAlign='center';x.textBaseline='middle';
  if(pode){x.font='600 54px "IBM Plex Mono",monospace';x.fillText(`+${custoPuxar()}`,mx,my-6);x.font='800 20px "Alegreya Sans",sans-serif';x.fillText('NO ALVO',mx,my+33)}
  else{x.font='600 58px "IBM Plex Mono",monospace';x.fillText(String(n),mx,my-4);x.font='800 18px "Alegreya Sans",sans-serif';x.fillText(n===1?'DADO':'DADOS',mx,my+34)}
  b.tex.needsUpdate=true;
}
function animarSaco(dt){
  const b=B.saco;if(!b)return;b.t+=dt;
  desenharEtiqueta();
  if(b.pulso>0)b.pulso=Math.max(0,b.pulso-dt*2.2);
  if(b.aperto>0)b.aperto=Math.max(0,b.aperto-dt*3);
  const k=b.pulso,sq=Math.sin(k*Math.PI*3)*.22*k-b.aperto*.12;
  b.corpoG.scale.set(1.25*(1+sq),1.25*(1-sq*1.2),1.25*(1+sq));
  const quer=b.alvo?.45:(b.hover&&podePuxar())?.25:podePuxar()?.06+Math.sin(b.t*3)*.04:0;
  b.couro.emissiveIntensity+=(quer-b.couro.emissiveIntensity)*Math.min(1,dt*10);
  const ts=(b.tagBase||2)*(1+(b.alvo?.1:0));b.tag.scale.set(ts,ts*.4375,1);
}
function infoSaco(x,y){
  const nomes=S.bolsa.map(id=>S.dados.find(d=>d.id===id)).filter(Boolean);
  infoEm(`<h4>Sua bolsa<small>${nomes.length} dado${nomes.length===1?'':'s'}</small></h4>
    <p class="nota">Toque para puxar um dado às cegas. Cada puxão soma +${custoPuxar()} ao alvo desta rodada. Arraste um dado da bandeja até aqui para guardar de graça.</p>
    <div class="kit">${nomes.map(miniDado).join('')||'<small>Vazia.</small>'}</div>
    ${motivoSaco()?`<p class="nota" style="color:#f0b07e">${motivoSaco()}</p>`:''}`,x,y);
}

