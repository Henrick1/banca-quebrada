const CLIMA={t:0,alvo:0,fumaca:[],tex:null};
function tensaoAlvo(){
  if(!S.ini||S.fase==='mapa'||S.fase==='loja'||S.fase==='evento'||S.fase==='fim')return S.hp<S.max*.3?.35:0;
  let t=0;const v=S.hp/S.max;
  if(v<.6)t+=(.6-v)/.6*.6;
  if(S.ini.chefe||(S.no&&S.no.tipo==='chefe'))t+=.35;else if(S.ini.elite)t+=.15;
  t+=Math.min(.25,pressaoLuta()*.08);
  if(S.ini.hp<S.ini.max*.25)t-=.1;
  return Math.max(0,Math.min(1,t));
}
function texturaFumaca(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  for(let i=0;i<9;i++){const px=40+Math.random()*48,py=40+Math.random()*48,r=22+Math.random()*26,g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
  return new THREE.CanvasTexture(c);
}
function iniciarClima(){
  if(CLIMA.fumaca.length||!scene)return;
  CLIMA.tex=texturaFumaca();
  for(let i=0;i<14;i++){
    const m=new THREE.Sprite(new THREE.SpriteMaterial({map:CLIMA.tex,color:'#d8c8b0',transparent:true,opacity:0,depthWrite:false}));
    const s=6+Math.random()*7;m.scale.set(s,s*.7,1);
    m.position.set(rnd(TW*.7),4+Math.random()*5,rnd(TD*.8));
    m.userData={vx:rnd(.25),vz:rnd(.12),fase:Math.random()*6.28,op:.09+Math.random()*.08,gira:rnd(.08)};
    scene.add(m);CLIMA.fumaca.push(m);
  }
  CLIMA.base={fundo:scene.background.clone(),foco:MESA.luzes?MESA.luzes.foco.color.clone():null,hemi:MESA.luzes?MESA.luzes.hemi.color.clone():null};
}
const COR_CALMA=new THREE.Color('#d8c8b0'),COR_TENSA=new THREE.Color('#c0503a'),FUNDO_TENSO=new THREE.Color('#1c0604'),FOCO_TENSO=lin('#ff9a7a'),HEMI_TENSO=lin('#ffb0a0'),VELA_CALMA=new THREE.Color('#ff9a3c'),VELA_TENSA=new THREE.Color('#ff4a24');
function passoClima(dt){
  if(!scene)return;iniciarClima();
  CLIMA.alvo=tensaoAlvo();CLIMA.t+=(CLIMA.alvo-CLIMA.t)*Math.min(1,dt*.8);
  const t=CLIMA.t,s=performance.now()/1000,cor=COR_CALMA.clone().lerp(COR_TENSA,t);
  CLIMA.fumaca.forEach(m=>{
    const u=m.userData;m.position.x+=(u.vx*(1+t*1.5))*dt;m.position.z+=u.vz*dt;m.position.y+=Math.sin(s*.3+u.fase)*.002;
    if(m.position.x>TW*.75)m.position.x=-TW*.75;if(m.position.x<-TW*.75)m.position.x=TW*.75;if(Math.abs(m.position.z)>TD*.9)u.vz*=-1;
    m.material.rotation+=u.gira*dt;m.material.color.copy(cor);
    m.material.opacity=(u.op*(1+t*1.4))*(.75+.25*Math.sin(s*.4+u.fase));
  });
  if(CLIMA.base){
    scene.background.copy(CLIMA.base.fundo).lerp(FUNDO_TENSO,t*.8);
    if(MESA.luzes){MESA.luzes.foco.color.copy(CLIMA.base.foco).lerp(FOCO_TENSO,t*.55);MESA.luzes.hemi.color.copy(CLIMA.base.hemi).lerp(HEMI_TENSO,t*.4)}
  }
  if(MESA.vela)MESA.vela.luz.color.copy(VELA_CALMA).lerp(VELA_TENSA,t);
  if(CLIMA.soma&&CONT&&S.ini&&S.fase!=='resolvendo'){
    CLIMA.tFaisca=(CLIMA.tFaisca||0)-dt;
    if(CLIMA.tFaisca<=0){CLIMA.tFaisca=CLIMA.soma===2?.09:.2;const p=CONT.mostr.soma.w.getWorldPosition(new THREE.Vector3());p.x+=rnd(.9);p.y+=.3;faiscas(p,CLIMA.soma===2?0xffb04a:0xff7a2a,CLIMA.soma===2?6:3,1.5,3.5)}
  }
}
function golpeQuente(d){
  if(d<20)return;
  const nivel=d>=60?3:d>=35?2:1,el=document.createElement('div');
  el.className='golpe g'+nivel;el.innerHTML=`<b>${d}</b><small>${nivel===3?'Inferno!':nivel===2?'Em chamas!':'Golpe quente!'}</small>`;
  $('mesa').appendChild(el);
  const p=new THREE.Vector3(TW/2-3,.4,0);
  faiscas(p,0xff8a2a,24+nivel*20,4+nivel,8+nivel*3);faiscas(p,0xffd27a,10+nivel*10,3,6);
  if(nivel>=2){vinheta('#ff7a2a');SOM.fogo()}
  if(nivel===3){setTimeout(()=>{faiscas(new THREE.Vector3(0,.4,0),0xff5a1a,60,8,14);tremer(.9);SOM.fogo()},180)}
  el.animate([{transform:'translate(-50%,-50%) scale(.3) rotate(-8deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.25) rotate(3deg)',opacity:1,offset:.18},{transform:'translate(-50%,-50%) scale(1) rotate(-1deg)',opacity:1,offset:.32},{transform:'translate(-50%,-50%) scale(1.04)',opacity:1,offset:.75},{transform:'translate(-50%,-90%) scale(.9)',opacity:0}],{duration:reduzir?700:1700,easing:'ease-out'}).onfinish=()=>el.remove();
}
