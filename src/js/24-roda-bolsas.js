const ESTILO_BOLSA={
  apostador:{couro:'#7a4526',fio:'#d9bf86',metal:'#d4a94f',ic:'dadoMenu'},
  numerologo:{couro:'#24345e',fio:'#c9d2e0',metal:'#c9d2e0',ic:'fichaSorte',veludo:true,largo:.94},
  alquimista:{couro:'#2f5a3a',fio:'#b8d48a',metal:'#a7c25c',ic:'peconha',extra:'frasco'},
  trapaceiro:{couro:'#2a1f33',fio:'#9a7fc0',metal:'#c0c6cf',ic:'baralho',extra:'carta',veludo:true},
  ourives:{couro:'#7a1a24',fio:'#f2c661',metal:'#f2c661',ic:'coroa',extra:'moedas',veludo:true,largo:1.06},
  moedeiro:{couro:'#5d5a52',fio:'#c8b88a',metal:'#9aa0a8',ic:'moedaPesada',extra:'moedas'},
  viciado:{couro:'#cdbf9e',fio:'#6a4a2a',metal:'#efe6cf',ic:'dadoOsso',largo:.92},
  gigante:{couro:'#4a4440',fio:'#8a7a62',metal:'#9a8a70',ic:'grimorio',escala:1.2,largo:1.1},
  benfeitor:{couro:'#a8875a',fio:'#e8dcc0',metal:'#c99a3f',ic:'algibeira',remendos:true},
  herdeiro:{couro:'#3a1846',fio:'#d4a94f',metal:'#d4a94f',ic:'coroa',veludo:true,largo:1.04}
};
function texturaBolsa(e){
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  x.fillStyle=e.couro;x.fillRect(0,0,512,256);
  const img=x.getImageData(0,0,512,256),d=img.data,amp=e.veludo?12:26;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amp;d[i]+=n;d[i+1]+=n*.8;d[i+2]+=n*.7}
  x.putImageData(img,0,0);
  if(!e.veludo)for(let i=0;i<60;i++){x.strokeStyle=`rgba(20,10,4,${.1+Math.random()*.15})`;x.lineWidth=1+Math.random()*2;x.beginPath();const px=Math.random()*512,py=Math.random()*256;x.moveTo(px,py);x.quadraticCurveTo(px+rnd(30),py+rnd(20),px+rnd(60),py+rnd(30));x.stroke()}
  else for(let i=0;i<14;i++){const g=x.createLinearGradient(i*40,0,i*40+30,256);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.05)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(i*40,0,40,256)}
  if(e.remendos)[[60,70,90,70,'#7a5a36'],[300,120,80,80,'#8a6a8a'],[420,40,70,60,'#5a6a4a']].forEach(([px,py,w,h,cor])=>{x.fillStyle=cor;x.fillRect(px,py,w,h);x.strokeStyle='rgba(240,225,190,.9)';x.lineWidth=2.5;x.setLineDash([6,6]);x.strokeRect(px+4,py+4,w-8,h-8);x.setLineDash([])});
  const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.4,'rgba(255,230,190,.05)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fillRect(0,0,512,256);
  x.strokeStyle=e.fio;x.globalAlpha=.75;x.lineWidth=2.4;x.setLineDash([7,7]);
  for(let k=0;k<4;k++){x.beginPath();x.moveTo(k*128+68,44);x.lineTo(k*128+68,236);x.stroke()}
  x.beginPath();x.moveTo(0,232);x.lineTo(512,232);x.stroke();x.setLineDash([]);x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;return t;
}
function texturaEmblema(e,ic,fundo){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle=e.metal;x.beginPath();x.arc(64,64,62,0,Math.PI*2);x.fill();
  x.fillStyle=fundo;x.beginPath();x.arc(64,64,52,0,Math.PI*2);x.fill();
  x.save();x.translate(64-36,64-36);x.scale(3,3);x.fillStyle=e.metal;x.fill(new Path2D(PATHS[ic]),'evenodd');x.restore();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
}
function miniDado3D(tipo){
  const def=DIE[tipo],m=new THREE.MeshStandardMaterial({color:lin(def?def.cor:'#efe6cf'),roughness:.4,metalness:tipo==='coin'?.7:0});
  const g=tipo==='coin'?new THREE.CylinderGeometry(.12,.12,.04,20):tipo==='d4'?new THREE.TetrahedronGeometry(.15):tipo==='d8'?new THREE.OctahedronGeometry(.14):tipo==='d10'?new THREE.OctahedronGeometry(.14):tipo==='d12'?new THREE.DodecahedronGeometry(.14):tipo==='d20'?new THREE.IcosahedronGeometry(.15):new THREE.BoxGeometry(.19,.19,.19);
  const d=new THREE.Mesh(g,m);d.castShadow=true;return d;
}
function criarBolsaRoda(k){
  const b=BUILDS[k],e=ESTILO_BOLSA[k]||ESTILO_BOLSA.apostador,ok=liberado(b.req),secreta=!ok&&b.req.segredo,kit=b.montar();
  const L=e.largo||1;
  const pts=[[0,0],[.4,.02],[.58,.16],[.64,.38],[.58,.62],[.42,.8],[.24,.9],[.18,.95],[.2,1.0],[.3,1.08],[.4,1.16],[.42,1.19],[.38,1.2]].map(p=>new THREE.Vector2(p[0]*L,p[1]));
  const geo=new THREE.LatheGeometry(pts,48),pa=geo.attributes.position,sem=k.length;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),a=Math.atan2(z,x);let f=1+.045*Math.sin(a*6+y*3+sem)+.03*Math.sin(a*11+sem);if(y>.97)f*=1+.2*Math.sin(a*10+sem)*Math.min(1,(y-.97)/.12);pa.setXYZ(i,x*f,y,z*f*.92)}
  geo.computeVertexNormals();
  const g=new THREE.Group(),f=new THREE.Group();g.add(f);
  const couro=new THREE.MeshStandardMaterial({map:texturaBolsa(e),roughness:e.veludo?.95:.8,side:THREE.DoubleSide});
  const corpo=new THREE.Mesh(geo,couro);corpo.castShadow=corpo.receiveShadow=true;f.add(corpo);
  const metal=new THREE.MeshStandardMaterial({color:lin(e.metal),metalness:.75,roughness:.3});
  const fio=new THREE.MeshStandardMaterial({color:lin(e.fio),roughness:.8});
  const cord=new THREE.Mesh(new THREE.TorusGeometry(.2*L,.04,10,28),fio);cord.rotation.x=Math.PI/2;cord.position.y=.94;f.add(cord);
  [[.16,.5,-.4],[.24,.42,.35]].forEach(([dx,len,rz],i)=>{
    const c=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,len,8),fio);c.position.set(dx,.94-len/2+.02,.16+i*.05);c.rotation.z=rz;f.add(c);
    const bo=new THREE.Mesh(new THREE.SphereGeometry(.065,14,10),metal);bo.position.set(dx+Math.sin(rz)*len*.5,.94-len*Math.cos(rz)+.04,.17+i*.05);bo.castShadow=true;f.add(bo);
  });
  const med=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.04,32),metal);med.rotation.x=Math.PI/2;med.position.set(0,.42,.6*L);f.add(med);
  const face=new THREE.Mesh(new THREE.CircleGeometry(.17,32),new THREE.MeshStandardMaterial({map:texturaEmblema(e,ok?e.ic:'cadeado',ok?'#1a110a':'#2a1d14'),metalness:.5,roughness:.35}));face.position.set(0,.42,.6*L+.021);f.add(face);
  kit.dados.slice(0,3).forEach((d,i)=>{const m=miniDado3D(d.type);m.position.set(-.1+i*.11,1.08+(i%2)*.03,(i%2?-.05:.03));m.rotation.set(.5+i,.7*i,.3);f.add(m)});
  if(e.extra==='frasco'){const v=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),new THREE.MeshStandardMaterial({color:lin('#7fd18a'),transparent:true,opacity:.75,roughness:.1,emissive:lin('#2a6a30'),emissiveIntensity:.4}));v.position.set(.52*L,.32,.25);f.add(v);const tp=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.12,10),metal);tp.position.set(.52*L,.48,.25);f.add(tp)}
  if(e.extra==='carta'){const ct=new THREE.Mesh(new THREE.BoxGeometry(.24,.34,.01),new THREE.MeshStandardMaterial({color:lin('#f3ecdc'),roughness:.6}));ct.position.set(.12,1.12,.02);ct.rotation.set(.2,.3,-.35);f.add(ct);const n=new THREE.Mesh(new THREE.CircleGeometry(.05,4),new THREE.MeshBasicMaterial({color:'#c9273a'}));n.position.set(.12,1.12,.03);n.rotation.set(.2,.3,-.35);f.add(n)}
  if(e.extra==='moedas'){const mo=new THREE.MeshStandardMaterial({color:lin('#e6b94a'),metalness:.85,roughness:.28});for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.035,22),mo);c.position.set(.55*L+(i%2)*.05,.02+i*.035,.35-(i>2?.18:0));c.rotation.z=(i%3)*.08;c.castShadow=true;f.add(c)}}
  f.rotation.x=-.32;
  if(!ok){
    f.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();
      if(secreta){o.material.map=null;o.material.color=lin('#0b0810');o.material.metalness=0;o.material.roughness=.6;o.material.emissive=lin('#6a3a9a');o.material.emissiveIntensity=.12;o.material.transparent=false;o.material.opacity=1}
      else{o.material.color.multiplyScalar(.22)}});
    if(secreta){const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.font='800 96px "Alegreya Sans",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#d9a0ff';x.shadowColor='#9b6fe0';x.shadowBlur=20;x.fillText('?',64,68);
      const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.setScalar(.7);s.position.set(0,1.75,0);g.add(s);g.userData.interrog=s}
  }
  g.scale.setScalar(e.escala||1);g.userData={...g.userData,k,ok,secreta,base:e.escala||1};
  return g;
}
let RODA=null;
function pararRoda(){if(!RODA)return;cancelAnimationFrame(RODA.raf);RODA.r.dispose();RODA.sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});RODA=null}
function infoRoda(k){
  const b=BUILDS[k],ok=liberado(b.req),sel=PERFIL.build===k,kit=b.montar(),el=$('rodaInfo');if(!el)return;
  if(!ok&&b.req.segredo){el.className='roda-info segredo';el.innerHTML=`<b>???</b>`;return}
  el.className='roda-info'+(ok?'':' trancado')+(sel?' sel':'');
  el.innerHTML=`${sel?'<span class="selo">Escolhida</span>':''}<b>${b.nome}</b><p>${b.desc}</p><div class="kit">${kit.dados.map(miniDado).join('')}${kit.itens.map(miniReliq).join('')}</div>${kit.ouro?`<p class="ouro-ini">Começa com ${kit.ouro} de ouro</p>`:''}${ok?'':`<span class="cadeado">${svgPath('lupa','#f0b07e')}${b.req.txt}</span>`}`;
}
function montarRoda(){
  pararRoda();
  const roda=$('roda'),cv=$('rodaCena');if(!roda||!cv)return;
  const ks=Object.keys(BUILDS),n=ks.length,R=Math.max(3.2,n*.42),passo=Math.PI*2/n;
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  r.setPixelRatio(pxQualidade());r.shadowMap.enabled=qualidade().sombra;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.setClearColor(0x000000,0);
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.1,100);
  cam.position.set(0,2.3,R+5.2);cam.lookAt(0,.75,R-.6);
  sc.add(new THREE.HemisphereLight(lin('#f6e7c9'),lin('#1a110b'),.55));
  const sol=new THREE.SpotLight('#ffdcaa',2.6,40,Math.PI/7,.6,1);sol.position.set(0,7,R+2.5);sol.target.position.set(0,.4,R);sol.castShadow=true;sol.shadow.mapSize.set(1024,1024);sol.shadow.bias=-.0005;sc.add(sol,sol.target);
  const fill=new THREE.DirectionalLight('#9fb2d6',.35);fill.position.set(-6,5,-4);sc.add(fill);
  const T=new THREE.Group();sc.add(T);
  const disco=new THREE.Mesh(new THREE.CylinderGeometry(R+1,R+1.08,.24,72),matMadeira(3,3,'#8a5a3a',{rough:.55,relevo:.03}));disco.position.y=-.12;disco.receiveShadow=true;T.add(disco);
  const aro=new THREE.Mesh(new THREE.TorusGeometry(R+1.04,.05,8,96),new THREE.MeshStandardMaterial({color:lin('#d4a94f'),metalness:.8,roughness:.3}));aro.rotation.x=Math.PI/2;aro.position.y=.01;T.add(aro);
  const bolsas=ks.map((k,i)=>{const g=criarBolsaRoda(k),th=i*passo;g.position.set(Math.sin(th)*R,0,Math.cos(th)*R);g.rotation.y=th;g.userData.th=th;T.add(g);return g});
  let alvo=Math.max(0,ks.indexOf(PERFIL.build)),a=alvo,arr=null,ultimo=-1,t=0;
  const idx=()=>((Math.round(alvo)%n)+n)%n;
  const ray=new THREE.Raycaster();
  const escolher=()=>{
    const i=idx(),k=ks[i];$('rodaCont').textContent=`${i+1} de ${n}`;
    if(i===ultimo)return;ultimo=i;
    if(liberado(BUILDS[k].req)&&PERFIL.build!==k){PERFIL.build=k;salvarPerfil()}
    infoRoda(k);
  };
  const ir=v=>{alvo=Math.round(v);SOM.batida(4,false);escolher()};
  const bolsaSob=e=>{const rc=cv.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1),cam);const h=ray.intersectObjects(bolsas,true)[0];if(!h)return-1;let o=h.object;while(o&&!bolsas.includes(o))o=o.parent;return bolsas.indexOf(o)};
  roda.addEventListener('click',e=>{
    const s=e.target.closest('[data-roda]');if(s){e.stopPropagation();ir(alvo+ +s.dataset.roda);return}
    if(arr&&arr.moveu)return;
    const i=bolsaSob(e);if(i<0)return;
    let d=((i-alvo)%n+n)%n;if(d>n/2)d-=n;
    if(Math.abs(d)>.5)ir(alvo+d);
    else if(!liberado(BUILDS[ks[i]].req)){SOM.traco();bolsas[i].userData.treme=1}
    else{SOM.compra();bolsas[i].userData.pulo=1;infoRoda(ks[i])}
  });
  roda.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){ir(alvo-1);e.preventDefault()}else if(e.key==='ArrowRight'){ir(alvo+1);e.preventDefault()}});
  let trava=0;roda.addEventListener('wheel',e=>{const v=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(v)<4)return;e.preventDefault();const tt=performance.now();if(tt-trava<260)return;trava=tt;ir(alvo+Math.sign(v))},{passive:false});
  roda.addEventListener('pointerdown',e=>{if(e.target.closest('[data-roda]'))return;arr={x:e.clientX,a:alvo,moveu:false,id:e.pointerId}});
  roda.addEventListener('pointermove',e=>{
    if(!arr){const i=bolsaSob(e);cv.style.cursor=i>=0?'pointer':'grab';return}
    const dx=e.clientX-arr.x;if(!arr.moveu&&Math.abs(dx)>6){arr.moveu=true;roda.setPointerCapture(arr.id)}
    if(arr.moveu){alvo=arr.a-dx/160;a=alvo;escolher()}});
  const solta=()=>{if(!arr)return;if(arr.moveu)ir(alvo);setTimeout(()=>{arr=null},0)};
  roda.addEventListener('pointerup',solta);roda.addEventListener('pointercancel',solta);
  let antes=performance.now();
  const quadro=()=>{
    if(!document.body.contains(cv)){pararRoda();return}
    RODA.raf=requestAnimationFrame(quadro);
    const agora=performance.now(),dt=Math.min(.05,(agora-antes)/1000);antes=agora;t+=dt;
    if(!(arr&&arr.moveu))a+=(alvo-a)*Math.min(1,dt*9);
    T.rotation.y=-a*passo;
    bolsas.forEach((g,i)=>{
      let d=((i-a)%n+n)%n;if(d>n/2)d-=n;const ad=Math.abs(d),fr=Math.max(0,1-ad);
      const u=g.userData;u.pulo=Math.max(0,(u.pulo||0)-dt*2.5);u.treme=Math.max(0,(u.treme||0)-dt*3);
      g.scale.setScalar(u.base*(1+.18*fr+.12*Math.sin(u.pulo*Math.PI)));
      g.position.y=fr*(.08+Math.sin(t*2)*.05)+Math.sin(u.pulo*Math.PI)*.4;
      g.children[0].rotation.y=fr*Math.sin(t*.8)*.35+Math.sin(u.treme*30)*u.treme*.15;
      if(u.interrog)u.interrog.position.y=1.75+Math.sin(t*2.4+i)*.08;
    });
    const w=cv.clientWidth,h=cv.clientHeight;
    if(w&&h&&(cv.width!==Math.floor(w*r.getPixelRatio())||cv.height!==Math.floor(h*r.getPixelRatio()))){r.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1.2?40:30;cam.updateProjectionMatrix()}
    r.render(sc,cam);
  };
  RODA={r,sc,raf:0};
  escolher();quadro();
}
