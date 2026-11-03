let CONT=null;
const CW=9.4,CD=2.7,CH=1.05,JAN_X=2.45,JAN_Z=-.05,JAN_W=2.2,JAN_H=1.1,LAMP_Z=.92;
const lampX=(i,n)=>(i-(n-1)/2)*(n<=5?1.05:.9);
const ROT_LAMP={j:'VOCÊ',c:'CASA',r:'PAGA'};
function placaContador(seq='jjcj',nome='',prox=null){
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*CD/CW);const x=c.getContext('2d'),W=c.width,H=c.height;
  const px=v=>(v+CW/2)/CW*W,pz=v=>(v+CD/2)/CD*H,u=W/CW;
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#c99a45');g.addColorStop(.45,'#e6c06a');g.addColorStop(.55,'#d6a955');g.addColorStop(1,'#a77a2e');
  x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<900;i++){x.fillStyle=`rgba(${Math.random()<.5?'255,240,200':'80,50,10'},${Math.random()*.08})`;x.fillRect(0,Math.random()*H,W,1)}
  x.strokeStyle='rgba(70,44,10,.55)';x.lineWidth=3;x.strokeRect(10,10,W-20,H-20);
  x.strokeStyle='rgba(255,236,190,.35)';x.lineWidth=1.5;x.strokeRect(14,14,W-28,H-28);
  [[24,24],[W-24,24],[24,H-24],[W-24,H-24]].forEach(([a,b])=>{const r=x.createRadialGradient(a-2,b-2,1,a,b,8);r.addColorStop(0,'#fff1c4');r.addColorStop(1,'#6e4a14');x.fillStyle=r;x.beginPath();x.arc(a,b,7,0,Math.PI*2);x.fill()});
  const grav=(txt,cx,cy,font)=>{x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(255,240,200,.45)';x.fillText(txt,cx+1,cy+1.5);x.fillStyle='rgba(58,34,6,.85)';x.fillText(txt,cx,cy)};
  const rotY=JAN_Z-JAN_H/2-.22;
  grav('SUA SOMA',px(-JAN_X),pz(rotY),'800 25px "Alegreya Sans",sans-serif');
  grav('ALVO DA CASA',px(JAN_X),pz(rotY),'800 25px "Alegreya Sans",sans-serif');
  if(nome){grav(nome,px(0),pz(JAN_Z-.12),`${nome.length>10?32:40}px "Pirata One",serif`);grav('contra',px(0),pz(JAN_Z+.28),'italic 600 17px "Alegreya Sans",sans-serif');if(prox)grav(`a seguir: ${prox}`,px(0),pz(JAN_Z+.55),'700 13px "Alegreya Sans",sans-serif')}
  else grav('contra',px(0),pz(JAN_Z),'48px "Pirata One",serif');
  grav('PARAR',px(-4.12),pz(JAN_Z+.55),'800 13px "Alegreya Sans",sans-serif');
  [-JAN_X,JAN_X].forEach(cx=>{x.fillStyle='#1a120b';const m=.09;x.fillRect(px(cx-JAN_W/2-m),pz(JAN_Z-JAN_H/2-m),(JAN_W+2*m)*u,(JAN_H+2*m)*u)});
  const nomes=[...seq,'r'],n=nomes.length;
  nomes.forEach((k,i)=>grav(ROT_LAMP[k],px(lampX(i,n)),pz(LAMP_Z+.3),'800 15px "Alegreya Sans",sans-serif'));
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}
function criarMostrador(n,tinta){
  const cv=document.createElement('canvas');cv.width=128*n;cv.height=192;
  const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  return{n,cv,ctx:cv.getContext('2d'),tex,tinta,v:0,alvo:0,desenhado:-1,punch:0,cor:tinta};
}
function desenharMostrador(m){
  const x=m.ctx,W=m.cv.width,H=m.cv.height,cw=W/m.n,v=Math.max(0,m.v);
  x.fillStyle='#efe6cf';x.fillRect(0,0,W,H);
  x.font='600 150px "IBM Plex Mono",ui-monospace,monospace';x.textAlign='center';x.textBaseline='alphabetic';
  const asc=x.measureText('0').actualBoundingBoxAscent||105;
  for(let i=0;i<m.n;i++){
    const p=Math.pow(10,m.n-1-i);
    let pos=p===1?v:Math.floor(v/p)+Math.max(0,(v%p)-(p-1));
    const dF=pos%10,d0=Math.floor(dF),fr=dF-d0,d1=(d0+1)%10,cx=cw*i+cw/2,base=H/2+asc/2;
    const lider=p>1&&v<p-.001;
    x.fillStyle=m.cor;x.globalAlpha=lider?.22:1;
    x.fillText(String(d0),cx,base-fr*H);
    x.fillText(String(d1),cx,base+(1-fr)*H);
    x.globalAlpha=1;
    if(i)x.fillStyle='#2a1c12',x.fillRect(cw*i-3,0,6,H);
  }
  const s=x.createLinearGradient(0,0,0,H);s.addColorStop(0,'rgba(20,10,4,.78)');s.addColorStop(.28,'rgba(20,10,4,0)');s.addColorStop(.55,'rgba(255,250,235,.12)');s.addColorStop(.72,'rgba(20,10,4,0)');s.addColorStop(1,'rgba(20,10,4,.78)');
  x.fillStyle=s;x.fillRect(0,0,W,H);
  m.tex.needsUpdate=true;m.desenhado=m.v;
}
function desenharBandeira(b,txt){
  if(b.txt===txt)return;b.txt=txt;
  const x=b.ctx,W=b.cv.width,H=b.cv.height;x.clearRect(0,0,W,H);
  x.fillStyle='#2a1c12';x.beginPath();x.moveTo(14,6);x.lineTo(W-6,6);x.lineTo(W-6,H-6);x.lineTo(14,H-6);x.lineTo(2,H/2);x.closePath();x.fill();
  x.fillStyle='#efe6cf';x.font=`600 ${txt.length>3?44:56}px "IBM Plex Mono",ui-monospace,monospace`;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,W/2+6,H/2+3);
  b.tex.needsUpdate=true;
}
function criarContador(latao){
  const g=new THREE.Group();scene.add(g);
  const caixa=new THREE.Mesh(new THREE.BoxGeometry(CW,CH,CD),matMadeira(1.2,.4,'#9c6a45',{rough:.55,relevo:.03}));
  caixa.position.y=CH/2;caixa.castShadow=caixa.receiveShadow=true;g.add(caixa);
  const pe=new THREE.Mesh(new THREE.BoxGeometry(CW+.2,.14,CD+.2),latao);pe.position.y=.07;pe.castShadow=pe.receiveShadow=true;g.add(pe);
  const placaMat=new THREE.MeshStandardMaterial({map:placaContador(),metalness:.35,roughness:.42});
  const placa=new THREE.Mesh(new THREE.PlaneGeometry(CW-.24,CD-.24),placaMat);
  placa.rotation.x=-Math.PI/2;placa.position.y=CH+.006;placa.receiveShadow=true;g.add(placa);
  const topo=CH+.01,mostr={};
  [['soma',-JAN_X,'#2b211a'],['alvo',JAN_X,'#3b2350']].forEach(([id,cx,tinta])=>{
    const m=criarMostrador(3,tinta),w=new THREE.Group();w.position.set(cx,topo,JAN_Z);g.add(w);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(JAN_W,JAN_H),new THREE.MeshStandardMaterial({map:m.tex,roughness:.55}));pl.rotation.x=-Math.PI/2;w.add(pl);
    const b=.09,hb=.09;
    [[0,-JAN_H/2-b/2,JAN_W+2*b,b],[0,JAN_H/2+b/2,JAN_W+2*b,b],[-JAN_W/2-b/2,0,b,JAN_H],[JAN_W/2+b/2,0,b,JAN_H]].forEach(([bx,bz,bw,bd])=>{
      const aro=new THREE.Mesh(new THREE.BoxGeometry(bw,hb,bd),latao);aro.position.set(bx,hb/2,bz);aro.castShadow=true;w.add(aro);
    });
    const vidro=new THREE.Mesh(new THREE.PlaneGeometry(JAN_W,JAN_H),new THREE.MeshStandardMaterial({color:'#ffffff',transparent:true,opacity:.07,roughness:.05,metalness:.2,depthWrite:false}));
    vidro.rotation.x=-Math.PI/2;vidro.position.y=hb*.8;w.add(vidro);
    m.w=w;mostr[id]=m;desenharMostrador(m);
  });
  const bcv=document.createElement('canvas');bcv.width=176;bcv.height=96;
  const btex=new THREE.CanvasTexture(bcv);btex.encoding=THREE.sRGBEncoding;
  const band={cv:bcv,ctx:bcv.getContext('2d'),tex:btex,txt:null,s:0};
  band.mesh=new THREE.Mesh(new THREE.PlaneGeometry(.95,.52),new THREE.MeshStandardMaterial({map:btex,transparent:true,roughness:.6}));
  band.mesh.rotation.x=-Math.PI/2;band.mesh.position.set(JAN_X+JAN_W/2+.68,topo+.02,JAN_Z);g.add(band.mesh);
  desenharBandeira(band,'+?');
  const alav=new THREE.Group();alav.position.set(-4.12,topo,JAN_Z-.05);g.add(alav);
  const bloco=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.62),latao);bloco.position.y=.09;bloco.castShadow=true;alav.add(bloco);
  const fenda=new THREE.Mesh(new THREE.BoxGeometry(.1,.02,.5),new THREE.MeshStandardMaterial({color:'#120c08'}));fenda.position.y=.185;alav.add(fenda);
  const braco=new THREE.Group();braco.position.y=.18;alav.add(braco);
  const haste=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.8,12),latao);haste.position.y=.4;haste.castShadow=true;braco.add(haste);
  const knobMat=new THREE.MeshStandardMaterial({color:lin('#a0241c'),roughness:.25,emissive:new THREE.Color('#ff4a2a'),emissiveIntensity:0});
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.17,20,14),knobMat);knob.position.y=.82;knob.castShadow=true;braco.add(knob);
  alav.scale.setScalar(.001);
  Object.assign(alav,{braco,knobMat,puxada:0,tranco:0,ang:-1.15});
  CONT={g,mostr,band,lampadas:[],t:0,latao,placaMat,alav};
  montarLampadas('jjcj');
}
function montarLampadas(seq){
  const C=CONT;C.lampadas.forEach(l=>{C.g.remove(l.mesh,l.aro,l.sp);l.mesh.geometry.dispose();l.aro.geometry.dispose();l.mat.dispose();l.sp.material.dispose()});
  const topo=CH+.01,itens=[...seq,'r'],n=itens.length,cor={j:'#ffb84a',c:'#b48cff',r:'#fff1d0'};
  C.lampadas=itens.map((k,i)=>{
    const x=lampX(i,n),mat=new THREE.MeshStandardMaterial({color:lin('#2a1c12'),emissive:new THREE.Color(cor[k]),emissiveIntensity:0,roughness:.3});
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.15,.17,.12,24),mat);mesh.position.set(x,topo+.06,LAMP_Z-.06);mesh.castShadow=true;
    const aro=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.05,24),C.latao);aro.position.set(x,topo+.025,LAMP_Z-.06);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:brilho(),color:cor[k],transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    sp.position.set(x,topo+.3,LAMP_Z-.06);sp.scale.set(1.1,1.1,1);
    C.g.add(mesh,aro,sp);
    return{mat,mesh,aro,sp,i:0};
  });
}
function prepararContador(){
  const C=CONT,velho=C.placaMat.map;
  C.placaMat.map=placaContador(S.modo.seq,S.modo.nome,S.modoProx&&S.modoProx.nome);C.placaMat.needsUpdate=true;if(velho)velho.dispose();
  montarLampadas(S.modo.seq);
  C.alav.puxada=0;
}
function atualizarContador(dt){
  if(!CONT)return;
  CONT.t+=dt;
  const ms=CONT.mostr,anc=$('soma');
  const soma=+(anc.dataset.v??anc.textContent)||0;
  const fechado=!!S.ini&&casaRestantes()===0;
  const alvo=S.ini?alvoAtual():0,maxT=S.ini?tetoAtual():Infinity;
  ms.soma.alvo=soma;ms.alvo.alvo=alvo;
  ms.soma.cor=fechado&&S.soma>maxT?'#9a2418':fechado&&S.soma>=alvo&&S.soma>0?'#24652f':'#2b211a';
  for(const k in ms){
    const m=ms[k],antes=m.v;
    if(reduzir||Math.abs(m.alvo-m.v)<.003)m.v=m.alvo;else m.v+=(m.alvo-m.v)*Math.min(1,dt*7);
    if(k==='alvo'&&Math.floor(m.v+.001)!==Math.floor(antes+.001))SOM.tick(Math.floor(m.v));
    if(m.v!==m.desenhado||m.corDesenhada!==m.cor){m.corDesenhada=m.cor;desenharMostrador(m)}
    if(m.punch>0){m.punch=Math.max(0,m.punch-dt*3);const s=1+Math.sin(m.punch*Math.PI)*.08;m.w.scale.set(s,1+m.punch*.6,s)}
  }
  const b=CONT.band,ativo=!!S.ini&&S.fase!=='fim'&&S.fase!=='loja';
  const mostra=ativo&&(!fechado||Number.isFinite(maxT));
  if(mostra)desenharBandeira(b,!fechado?(temItem('lupa')&&S.proxCasa?'+'+S.proxCasa.map(d=>DIE[d.type].curto).join('|'):casaRestantes()>1?Array(casaRestantes()).fill("+?").join(" "):'+?'):`≤${maxT}`);
  const al=CONT.alav,temAl=ativo&&!!(S.modo&&S.modo.parar),pronta=podeParar();
  const sa=al.scale.x+((temAl?1:0)-al.scale.x)*Math.min(1,dt*8);al.scale.setScalar(Math.max(.001,sa));
  al.puxada=Math.max(0,al.puxada-(al.puxada>0&&S.fase!=='resolvendo'?dt*.6:0));
  const alvoAng=S.fase==='resolvendo'&&al.puxada>0?1.15:-1.15;
  al.ang+=(alvoAng-al.ang)*Math.min(1,dt*(alvoAng>0?16:4));
  if(al.tranco>0){al.tranco=Math.max(0,al.tranco-dt*4)}
  al.braco.rotation.x=al.ang+Math.sin(al.tranco*Math.PI*3)*.12*al.tranco;
  al.knobMat.emissiveIntensity=pronta?.6+Math.sin(CONT.t*7)*.35:0;
  b.s+=((mostra?1:0)-b.s)*Math.min(1,dt*10);b.mesh.scale.setScalar(Math.max(.001,b.s));
  const etapa=S.ini&&S.fase!=='loja'&&S.fase!=='fim'&&S.fase!=='intro'?(S.etapa??0):-1;
  CONT.lampadas.forEach((l,i)=>{
    const alvoI=etapa<0?0:i<etapa?.4:i===etapa?1.1+Math.sin(CONT.t*6)*.35:0;
    l.i+=(alvoI-l.i)*Math.min(1,dt*8);
    l.mat.emissiveIntensity=l.i;l.sp.material.opacity=i===etapa?Math.min(.9,l.i*.6):l.i*.25;
  });
}
function posicionarAncoras(){
  if(!CONT)return;
  const r=$('mesa').getBoundingClientRect(),v=new THREE.Vector3();
  for(const k in CONT.mostr){
    CONT.mostr[k].w.getWorldPosition(v);v.project(camera);
    const el=$(k);el.style.left=((v.x+1)/2*r.width)+'px';el.style.top=((1-v.y)/2*r.height)+'px';
  }
}
