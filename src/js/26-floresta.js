const FL={grupo:null,vagalumes:null,folhas:[],orig:null,t:0};
function texturaGrama(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle='#3d5a26';x.fillRect(0,0,512,512);
  const img=x.getImageData(0,0,512,512),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*30;d[i]+=n*.6;d[i+1]+=n;d[i+2]+=n*.4}
  x.putImageData(img,0,0);
  for(let i=0;i<2600;i++){const px=Math.random()*512,py=Math.random()*512,l=4+Math.random()*9,a=-Math.PI/2+rnd(.6),g=90+Math.random()*90;
    x.strokeStyle=`rgba(${40+Math.random()*40},${g},${30+Math.random()*30},${.5+Math.random()*.5})`;x.lineWidth=1+Math.random();x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
  for(let i=0;i<70;i++){x.fillStyle=`rgba(${110+Math.random()*50},${70+Math.random()*30},${30},.55)`;x.beginPath();x.ellipse(Math.random()*512,Math.random()*512,3+Math.random()*5,2+Math.random()*3,Math.random()*3,0,Math.PI*2);x.fill()}
  for(let i=0;i<30;i++){x.fillStyle=['#f3e98a','#ffffff','#e8a0c8'][i%3];x.beginPath();x.arc(Math.random()*512,Math.random()*512,1.6,0,Math.PI*2);x.fill()}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,7);t.anisotropy=8;return t;
}
function texturaTabuleiro(cor='#8a6a42',ato=0){
  const W=1200,H=720,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle=cor;x.fillRect(0,0,W,H);
  const tabua=120;
  for(let y=0;y<H;y+=tabua){
    const tom=(Math.random()-.5)*26;x.fillStyle=`rgba(${tom>0?255:0},${tom>0?230:0},${tom>0?180:0},${Math.abs(tom)/220})`;x.fillRect(0,y,W,tabua);
    for(let k=0;k<26;k++){x.strokeStyle=`rgba(40,22,8,${.06+Math.random()*.12})`;x.lineWidth=1+Math.random()*2;x.beginPath();const yy=y+Math.random()*tabua;x.moveTo(0,yy);for(let xx=0;xx<=W;xx+=60)x.lineTo(xx,yy+Math.sin(xx/140+k)*4+rnd(1.5));x.stroke()}
    if(Math.random()<.7){const nx=100+Math.random()*(W-200),ny=y+20+Math.random()*(tabua-40);x.fillStyle='rgba(50,28,10,.45)';x.beginPath();x.ellipse(nx,ny,14,8,0,0,Math.PI*2);x.fill();x.strokeStyle='rgba(50,28,10,.3)';x.lineWidth=2;x.beginPath();x.ellipse(nx,ny,24,12,0,0,Math.PI*2);x.stroke()}
    x.fillStyle='rgba(20,10,4,.55)';x.fillRect(0,y,W,3);x.fillStyle='rgba(255,230,180,.08)';x.fillRect(0,y+3,W,2);
  }
  const g=x.createRadialGradient(W/2,H/2,80,W/2,H/2,760);g.addColorStop(0,'rgba(255,240,200,.08)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fillRect(0,0,W,H);
  const entalhe=(desenha,lw)=>{x.save();x.lineWidth=lw;x.strokeStyle='rgba(255,236,190,.22)';x.translate(1.5,1.5);desenha();x.restore();x.save();x.lineWidth=lw;x.strokeStyle='rgba(30,14,4,.6)';desenha();x.restore()};
  entalhe(()=>x.strokeRect(40,40,W-80,H-80),5);
  entalhe(()=>{x.beginPath();x.arc(W/2,H/2,120,0,Math.PI*2);x.stroke()},4);
  x.setLineDash([12,12]);
  entalhe(()=>{x.beginPath();x.moveTo(170,70);x.lineTo(170,H-70);x.stroke();x.beginPath();x.moveTo(W-170,70);x.lineTo(W-170,H-70);x.stroke()},3);
  x.setLineDash([]);
  const texto=(t,px,py,rot,font)=>{x.save();x.translate(px,py);x.rotate(rot);x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(255,236,190,.2)';x.fillText(t,1.5,1.5);x.fillStyle='rgba(30,14,4,.62)';x.fillText(t,0,0);x.restore()};
  texto('A Mata Cobra',W/2,H/2,0,'46px "Pirata One",serif');
  texto('SEUS LANCES',110,H/2,-Math.PI/2,'700 18px "Alegreya Sans",sans-serif');
  texto('LANCE DA CASA',W-110,H/2,Math.PI/2,'700 18px "Alegreya Sans",sans-serif');
  const musgo=(px,py,r)=>{for(let i=0;i<90;i++){const a=Math.random()*Math.PI*2,d=Math.random()*r;x.fillStyle=`rgba(${60+Math.random()*40},${110+Math.random()*60},${40},${.25+Math.random()*.35})`;x.beginPath();x.arc(px+Math.cos(a)*d,py+Math.sin(a)*d*.8,3+Math.random()*7,0,Math.PI*2);x.fill()}};
  musgo(30,30,90);musgo(W-30,H-30,110);musgo(W-40,20,60);musgo(20,H-30,70);
  if(ato>=1)musgo(W*.35,H-10,50);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}
function texturaCasca(){
  const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');
  x.fillStyle='#4a3322';x.fillRect(0,0,256,512);
  for(let i=0;i<70;i++){const px=Math.random()*256;x.strokeStyle=`rgba(${20+Math.random()*30},${12+Math.random()*16},6,${.4+Math.random()*.4})`;x.lineWidth=2+Math.random()*5;x.beginPath();x.moveTo(px,0);for(let y=0;y<=512;y+=32)x.lineTo(px+Math.sin(y/50+i)*6,y);x.stroke()}
  for(let i=0;i<40;i++){x.fillStyle=`rgba(${70+Math.random()*40},${110+Math.random()*40},40,.35)`;x.beginPath();x.arc(Math.random()*256,380+Math.random()*130,4+Math.random()*10,0,Math.PI*2);x.fill()}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function texturaFolha(cor){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  x.fillStyle=cor;x.beginPath();x.moveTo(32,2);x.quadraticCurveTo(62,30,32,62);x.quadraticCurveTo(2,30,32,2);x.fill();
  x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=2;x.beginPath();x.moveTo(32,6);x.lineTo(32,58);x.stroke();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
}
function montarFloresta(){
  if(FL.grupo)return;
  const G=new THREE.Group();G.visible=false;scene.add(G);FL.grupo=G;
  const add=(geo,mat,x,y,z,sombra=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=sombra;m.receiveShadow=true;G.add(m);return m};
  const chao=new THREE.Mesh(new THREE.PlaneGeometry(110,80),new THREE.MeshStandardMaterial({map:texturaGrama(),roughness:.95}));chao.rotation.x=-Math.PI/2;chao.position.y=-.51;chao.receiveShadow=true;G.add(chao);
  const terra=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshStandardMaterial({color:lin('#4a3622'),roughness:1,transparent:true,opacity:.8}));terra.rotation.x=-Math.PI/2;terra.scale.set(TW/2+3.5,TD/2+3,1);terra.position.y=-.505;terra.receiveShadow=true;G.add(terra);
  const casca=new THREE.MeshStandardMaterial({map:texturaCasca(),roughness:.9});
  const anel=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#b98a56';x.fillRect(0,0,128,128);for(let r=4;r<62;r+=4+Math.random()*3){x.strokeStyle=`rgba(90,55,25,${.3+Math.random()*.3})`;x.lineWidth=1.5;x.beginPath();x.arc(64+rnd(1),64+rnd(1),r,0,Math.PI*2);x.stroke()}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t})();
  const topoToco=new THREE.MeshStandardMaterial({map:anel,roughness:.8});
  const toco=(x,z,r,h)=>{const m=add(new THREE.CylinderGeometry(r,r*1.15,h,18),[casca,topoToco,casca],x,-.51+h/2,z);m.rotation.y=Math.random()*6;
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.random(),rz=add(new THREE.ConeGeometry(r*.28,r*1.2,8),casca,x+Math.cos(a)*r*1.05,-.45,z+Math.sin(a)*r*1.05);rz.rotation.set(Math.sin(a)*1.2,0,-Math.cos(a)*1.2)}};
  toco(-TW/2-3.6,TD/2+1.2,1.1,1.1);toco(TW/2+4.2,TD/2+2.4,.8,.7);toco(-TW/2-5.5,-TD/2-3,1.4,1.6);
  [[-TW/2-9,-TD/2-7,2.2],[TW/2+8,-TD/2-6,2.6],[TW/2+11,TD/2+5,2],[-TW/2-12,TD/2+6,2.4]].forEach(([x,z,r])=>{const m=add(new THREE.CylinderGeometry(r*.85,r*1.1,34,20),casca,x,16.5,z);m.material=casca;
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2,rz=add(new THREE.ConeGeometry(r*.4,r*2.2,8),casca,x+Math.cos(a)*r*1.1,-.2,z+Math.sin(a)*r*1.1);rz.rotation.set(Math.sin(a)*1.25,0,-Math.cos(a)*1.25)}});
  const verdes=['#2f5a22','#3c6e2a','#4a7a30','#28501e'].map(c=>new THREE.MeshStandardMaterial({color:lin(c),roughness:.85,flatShading:true}));
  const moita=(x,z,s)=>{for(let i=0;i<5;i++){const m=add(new THREE.IcosahedronGeometry(s*(.6+Math.random()*.5),1),verdes[i%4],x+rnd(s*.9),-.3+s*.3+Math.random()*s*.3,z+rnd(s*.9));m.scale.y=.75}};
  [[-TW/2-2.6,-TD/2-2.2,1.2],[TW/2+2.8,-TD/2-2.6,1.4],[TW/2+5.5,0,1.6],[-TW/2-6,1,1.5],[0,TD/2+4,1.3],[-6,-TD/2-4.5,1.4],[7,TD/2+4.5,1.2],[TW/2+3,TD/2+5.5,1.2]].forEach(([x,z,s])=>moita(x,z,s));
  const pedra=new THREE.MeshStandardMaterial({color:lin('#7a7c74'),roughness:.9,flatShading:true});
  [[TW/2+2.2,TD/2+1.6,.6],[-TW/2-2,-1.5,.5],[TW/2+3.4,-3,.8],[-3,TD/2+2.6,.45],[4,-TD/2-2.4,.55]].forEach(([x,z,s])=>{const m=add(new THREE.DodecahedronGeometry(s,0),pedra,x,-.51+s*.45,z);m.scale.y=.6;m.rotation.set(Math.random(),Math.random()*6,Math.random())});
  const capV=new THREE.MeshStandardMaterial({color:lin('#c0392b'),roughness:.45}),capM=new THREE.MeshStandardMaterial({color:lin('#a87a4a'),roughness:.6}),haste=new THREE.MeshStandardMaterial({color:lin('#f1e6cc'),roughness:.7}),bolinha=new THREE.MeshStandardMaterial({color:lin('#fff8ec'),roughness:.6});
  const cogumelo=(x,z,s,vermelho)=>{add(new THREE.CylinderGeometry(.08*s,.11*s,.5*s,10),haste,x,-.51+.25*s,z);const cap=add(new THREE.SphereGeometry(.3*s,16,10,0,Math.PI*2,0,Math.PI/2),vermelho?capV:capM,x,-.51+.48*s,z);cap.scale.y=.75;
    if(vermelho)for(let i=0;i<4;i++){const a=Math.random()*6,r=.16*s;add(new THREE.SphereGeometry(.035*s,6,4),bolinha,x+Math.cos(a)*r,-.51+.48*s+.13*s,z+Math.sin(a)*r,false).receiveShadow=false}};
  [[-TW/2-1.9,TD/2+.4],[-TW/2-2.3,TD/2-.2],[TW/2+2,-TD/2-1.4],[TW/2+2.4,-TD/2-1],[2.5,TD/2+2.2],[-TW/2-3.4,TD/2+2.5],[TW/2+4.3,TD/2+1.5]].forEach(([x,z],i)=>cogumelo(x,z,1+Math.random()*.8,i%3!==1));
  const tora=add(new THREE.CylinderGeometry(.55,.6,7,16),casca,-2,-.1,-TD/2-3.6);tora.rotation.z=Math.PI/2;tora.rotation.y=.25;
  const corF=['#c9762a','#a8441e','#d4a23a','#7a8a2a'];
  const folhaGeo=new THREE.PlaneGeometry(.45,.45),folhaMats=corF.map(c=>new THREE.MeshStandardMaterial({map:texturaFolha(c),transparent:true,alphaTest:.4,side:THREE.DoubleSide,roughness:.8}));
  const dummy=new THREE.Object3D();folhaMats.forEach(mat=>{const im=new THREE.InstancedMesh(folhaGeo,mat,18);for(let i=0;i<18;i++){let x,z;do{x=rnd(TW/2+9);z=rnd(TD/2+7)}while(Math.abs(x)<TW/2+1.3&&Math.abs(z)<TD/2+1.3);dummy.position.set(x,-.5,z);dummy.rotation.set(-Math.PI/2,0,Math.random()*6);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix)}im.receiveShadow=true;G.add(im)});
  const sombraMat=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:THREE.DoubleSide});
  const cp=[];for(let i=0;i<110;i++){const r=.18+Math.random()*.5,cx=rnd(TW/2+5),cy=11+Math.random()*2,cz=rnd(TD/2+4);for(let k=0;k<12;k++){const a0=k/12*Math.PI*2,a1=(k+1)/12*Math.PI*2;cp.push(cx,cy,cz,cx+Math.cos(a1)*r,cy,cz+Math.sin(a1)*r,cx+Math.cos(a0)*r,cy,cz+Math.sin(a0)*r)}}
  const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));cg.computeVertexNormals();const copa=new THREE.Mesh(cg,sombraMat);copa.castShadow=true;G.add(copa);
  const n=60,pos=new Float32Array(n*3),base=[];
  for(let i=0;i<n;i++){const p=[rnd(TW/2+8),.4+Math.random()*4,rnd(TD/2+6)];base.push(p);pos.set(p,i*3)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const vm=new THREE.Points(geo,new THREE.PointsMaterial({map:brilho(),color:'#d8ff7a',size:.42,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.0}));G.add(vm);FL.vagalumes={pts:vm,base,fase:base.map(()=>Math.random()*6)};
  for(let i=0;i<10;i++){const m=new THREE.Mesh(folhaGeo,folhaMats[i%4]);m.userData={v:.6+Math.random()*.6,ph:Math.random()*6};m.position.set(rnd(TW/2+4),Math.random()*14,rnd(TD/2+4));G.add(m);FL.folhas.push(m)}
  FL.matBorda=matMadeira(2,.35,'#6e4a2c',{rough:.75,relevo:.05});FL.matBordaV=matMadeira(2,.35,'#6e4a2c',{rough:.75,relevo:.05,rot:Math.PI/2});
  FL.matBase=new THREE.MeshStandardMaterial({map:texturaCasca(),roughness:.9});
}
const CENAS={
  taverna:null,
  floresta:[
    {fundo:'#0e1a12',foco:'#ffe1b0',fi:2.1,hemiC:'#d8ecc8',hemiG:'#2a361a',hi:.55,jan:'#ffe9c0',ji:.75,vag:.15},
    {fundo:'#1a1012',foco:'#ffab6a',fi:1.85,hemiC:'#c8a8d0',hemiG:'#2a1e14',hi:.42,jan:'#ff9a5a',ji:.6,vag:.55},
    {fundo:'#060a12',foco:'#b4c8ff',fi:1.6,hemiC:'#7c94c4',hemiG:'#121c14',hi:.42,jan:'#8aa4e0',ji:.4,vag:1}
  ]
};
function luzDoAto(ato){
  if((S.reino||0)!==1||!MESA.luzes)return;
  const L=CENAS.floresta[Math.min(2,ato||0)],{hemi,foco}=MESA.luzes;
  scene.background=new THREE.Color(L.fundo);foco.color.set(L.foco);foco.intensity=L.fi;hemi.color.set(L.hemiC);hemi.groundColor.set(L.hemiG);hemi.intensity=L.hi;
  if(MESA.janela){MESA.janela.color.set(L.jan);MESA.janela.intensity=L.ji}
  FL.vagAlvo=L.vag;
  if(typeof CLIMA!=='undefined'&&CLIMA.base)CLIMA.base={fundo:scene.background.clone(),foco:foco.color.clone(),hemi:hemi.color.clone()};
}
function trocarCena(r){
  if(typeof scene==='undefined'||!scene||!MESA.luzes)return;
  r=r||0;
  if(!FL.orig){const {hemi,foco}=MESA.luzes;FL.orig={fundo:scene.background.clone(),foco:foco.color.clone(),fi:foco.intensity,hemi:hemi.color.clone(),hemiG:hemi.groundColor.clone(),hi:hemi.intensity,jan:MESA.janela?MESA.janela.color.clone():null,ji:MESA.janela?MESA.janela.intensity:0,borda:MESA.madeiras.madeira,bordaV:MESA.madeiras.madeiraV,base:MESA.base.material}}
  if(r===1)montarFloresta();
  const flor=r===1;
  (MESA.taverna||[]).forEach(o=>o.visible=!flor);
  (MESA.cantos||[]).forEach(o=>o.visible=!flor);
  if(MESA.vela)MESA.vela.luz.visible=!flor;
  if(FL.grupo)FL.grupo.visible=flor;
  MESA.bordas.forEach((b,i)=>b.material=flor?(i<2?FL.matBorda:FL.matBordaV):(i<2?FL.orig.borda:FL.orig.bordaV));
  MESA.base.material=flor?FL.matBase:FL.orig.base;
  const {hemi,foco}=MESA.luzes;
  if(!flor){scene.background=FL.orig.fundo.clone();foco.color.copy(FL.orig.foco);foco.intensity=FL.orig.fi;hemi.color.copy(FL.orig.hemi);hemi.groundColor.copy(FL.orig.hemiG);hemi.intensity=FL.orig.hi;if(MESA.janela){MESA.janela.color.copy(FL.orig.jan);MESA.janela.intensity=FL.orig.ji}
    if(typeof CLIMA!=='undefined')CLIMA.base={fundo:scene.background.clone(),foco:foco.color.clone(),hemi:hemi.color.clone()}}
  MESA.feltroAto=-1;trocarFeltro(0);
  document.body.classList.toggle('reino-floresta',flor);
}
function passoCena(dt){
  if(!FL.grupo||!FL.grupo.visible)return;
  FL.t+=dt;
  const V=FL.vagalumes;
  if(V){const p=V.pts.geometry.attributes.position;V.base.forEach((b,i)=>{const f=V.fase[i]+FL.t*.6;p.setXYZ(i,b[0]+Math.sin(f)*1.2,b[1]+Math.sin(f*1.7)*.5,b[2]+Math.cos(f*.8)*1.2)});p.needsUpdate=true;
    const alvo=(FL.vagAlvo??.2)*(.75+Math.sin(FL.t*3)*.25);V.pts.material.opacity+=(alvo-V.pts.material.opacity)*Math.min(1,dt*2)}
  FL.folhas.forEach(m=>{const u=m.userData;m.position.y-=u.v*dt;m.position.x+=Math.sin(FL.t*1.3+u.ph)*dt*.8;m.rotation.set(FL.t*u.v+u.ph,FL.t*.7,FL.t*u.v*.6);if(m.position.y<-.4){m.position.set(rnd(TW/2+4),12+Math.random()*4,rnd(TD/2+4))}});
}
function transicaoReino(){
  const prox=S.proxReino||1,R=REINOS[prox];
  const el=document.createElement('div');el.className='chefe-intro reino-intro';
  el.innerHTML=`<div class="ci-caixa"><p class="ci-ato">Fim do mapa ${['I','II','III'][prox-1]} · ${REINOS[prox-1].nome}</p><h2 class="ci-nome">${R.nome}</h2><p class="ci-titulo">O Dono foge pela porta dos fundos</p>
    <p class="ri-texto">Você segue as moedas que ele deixa cair pela trilha, até onde a taverna acaba e a mata começa. Lá, os dados se jogam sobre a madeira e a grama, e quem dá as cartas são os bichos.</p>
    <div class="ci-regras"><div class="ci-regra" style="--c:#86c48f">${svgPath('cura','#86c48f')}<div><b>Descansou na trilha</b><span>Sua vida foi recuperada por completo.</span></div></div>
    <div class="ci-regra" style="--c:#7fbf5a">${svgPath('folha','#7fbf5a')}<div><b>Coisas novas na mata</b><span>Dados, relíquias e consumíveis da floresta começam a aparecer nas lojas e espólios.</span></div></div></div>
    <p class="ci-dica">Clique para entrar na floresta</p></div>`;
  document.body.appendChild(el);SOM.tensao();setTimeout(()=>SOM.combo(),300);
  let foi=false;
  const seguir=()=>{if(foi)return;foi=true;el.classList.add('sai');setTimeout(()=>el.remove(),450);
    definirReino(prox);S.proxReino=null;S.hp=S.max;trocarCena(S.reino);
    S.mapa=gerarMapa();S.linha=0;S.no=null;S.evVistos=[];S.ini=null;salvarPartida();
    irPara(S.mapa.inicio)};
  setTimeout(()=>el.addEventListener('click',seguir),900);
}
