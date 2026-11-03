const reduzir=matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOEDA_VOO=`<svg viewBox="0 0 24 24"><path fill="#e3b64a" stroke="#6b4a10" stroke-width="1" fill-rule="evenodd" d="${PATHS.ouro}"/></svg>`;
const SOM=(()=>{
  let ctx=null,mestre=null,ruido=null,mudo=false,ultBatida=0;
  try{mudo=ARMAZ.getItem('bq-mudo')==='1'}catch(e){}
  const iniciar=()=>{
    if(typeof MUS!=='undefined')MUS.iniciar();
    if(ctx){if(ctx.state==='suspended')ctx.resume();return}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    ctx=new AC();mestre=ctx.createGain();mestre.gain.value=mudo?0:OPCOES.volume/100;
    const comp=ctx.createDynamicsCompressor();mestre.connect(comp);comp.connect(ctx.destination);
    ruido=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=ruido.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  };
  const ok=()=>ctx&&!mudo&&ctx.state==='running';
  const env=(g,t,a,pico,dec)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,pico),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec)};
  const tom=(freq,{tipo='sine',t=0,a=.005,dec=.2,vol=.3,ate=null}={})=>{
    if(!ok())return;const t0=ctx.currentTime+t;const o=ctx.createOscillator();o.type=tipo;o.frequency.setValueAtTime(freq,t0);
    if(ate)o.frequency.exponentialRampToValueAtTime(ate,t0+a+dec);
    const g=ctx.createGain();env(g,t0,a,vol,dec);o.connect(g);g.connect(mestre);o.start(t0);o.stop(t0+a+dec+.05);
  };
  const chiado=({t=0,dec=.08,vol=.3,f=2500,q=1,tipo='bandpass',ate=null}={})=>{
    if(!ok())return;const t0=ctx.currentTime+t;const s=ctx.createBufferSource();s.buffer=ruido;
    const fl=ctx.createBiquadFilter();fl.type=tipo;fl.frequency.setValueAtTime(f,t0);if(ate)fl.frequency.exponentialRampToValueAtTime(ate,t0+dec);fl.Q.value=q;
    const g=ctx.createGain();env(g,t0,.002,vol,dec);s.connect(fl);fl.connect(g);g.connect(mestre);s.start(t0,Math.random()*.5);s.stop(t0+dec+.05);
  };
  const ESC=[0,2,4,7,9,12,14,16,19,21,24,26,28,31];
  const nota=i=>261.63*Math.pow(2,ESC[Math.min(ESC.length-1,Math.max(0,i))]/12);
  return{
    iniciar,
    get mudo(){return mudo},
    alternar(){mudo=!mudo;try{ARMAZ.setItem('bq-mudo',mudo?'1':'0')}catch(e){}if(mestre)mestre.gain.value=mudo?0:OPCOES.volume/100;if(typeof MUS!=='undefined')MUS.aplicarVolume();return mudo},
    aplicarVolume(){if(mestre)mestre.gain.value=mudo?0:OPCOES.volume/100},
    batida(v,metal,vol=1){
      if(!ok())return;const agora=ctx.currentTime;if(agora-ultBatida<.022)return;ultBatida=agora;
      const i=Math.min(1,v/12)*vol;
      if(metal){[2350,3720,5410].forEach((f,k)=>tom(f*(.97+Math.random()*.06),{dec:.25+k*.08,vol:.07*i}));chiado({dec:.03,vol:.12*i,f:6000})}
      else{chiado({dec:.035+.02*i,vol:.4*i,f:1800+Math.random()*1800,q:2.5});tom(420+Math.random()*200,{dec:.04,vol:.13*i,ate:220,tipo:'triangle'})}
    },
    whoosh(){chiado({dec:.28,vol:.16,f:500,ate:2600,q:.8})},
    tok(v){tom(190,{dec:.12,vol:.35,ate:90});tom(nota(Math.round(v/2)),{t:.03,dec:.35,vol:.15,tipo:'triangle'})},
    tick(i){tom(nota(i%14)*2,{dec:.05,vol:.06,tipo:'square'})},
    acerto(){tom(110,{dec:.45,vol:.6,ate:38});chiado({dec:.2,vol:.45,f:900,tipo:'lowpass',ate:200});[0,4,7,12].forEach((n,k)=>tom(261.63*Math.pow(2,n/12),{t:.06+k*.05,dec:.5,vol:.12,tipo:'triangle'}))},
    dano(){tom(80,{dec:.5,vol:.55,ate:35,tipo:'sawtooth'});chiado({dec:.25,vol:.35,f:400,tipo:'lowpass'});tom(233,{t:.05,dec:.4,vol:.09,tipo:'square',ate:180})},
    ouro(n=3){for(let k=0;k<Math.min(n,6);k++){const r=1+Math.random()*.08;tom(1568*r*(1+k*.06),{t:k*.06,dec:.18,vol:.09});tom(2349*r*(1+k*.06),{t:k*.06+.01,dec:.12,vol:.05})}},
    cura(){[0,4,7,11].forEach((n,k)=>tom(523*Math.pow(2,n/12),{t:k*.07,dec:.4,vol:.1}))},
    fogo(){chiado({dec:.4,vol:.4,f:300,tipo:'lowpass',ate:3000});tom(150,{dec:.3,vol:.22,ate:60,tipo:'sawtooth'})},
    veneno(){[0,1,2].forEach(k=>tom(600-k*120,{t:k*.08,dec:.12,vol:.12,ate:300-k*60}))},
    escudo(){[880,1320,1980].forEach((f,k)=>tom(f,{dec:.5-k*.1,vol:.1}));chiado({dec:.05,vol:.2,f:4000})},
    dobro(){tom(nota(7),{dec:.15,vol:.12,tipo:'square'});tom(nota(12),{t:.08,dec:.25,vol:.12,tipo:'square'})},
    puxar(){chiado({dec:.22,vol:.25,f:900,q:.6,ate:1800});tom(520,{t:.12,dec:.08,vol:.16,ate:780})},
    guardar(){chiado({dec:.2,vol:.22,f:1600,q:.6,ate:700});tom(620,{t:.08,dec:.08,vol:.14,ate:380})},
    compra(){tom(1318,{dec:.12,vol:.12});tom(1760,{t:.07,dec:.3,vol:.12});chiado({dec:.06,vol:.15,f:5000})},
    grava(){tom(2637,{dec:.5,vol:.1});tom(3951,{t:.02,dec:.35,vol:.06});chiado({dec:.04,vol:.2,f:7000})},
    vitoria(){[0,4,7,12,16].forEach((n,k)=>tom(392*Math.pow(2,n/12),{t:k*.09,dec:.6,vol:.13,tipo:'triangle'}))},
    derrota(){[0,-3,-7,-12].forEach((n,k)=>tom(330*Math.pow(2,n/12),{t:k*.18,dec:.7,vol:.14,tipo:'triangle'}))},
    item(){[0,7,12].forEach((n,k)=>tom(784*Math.pow(2,n/12),{t:k*.05,dec:.25,vol:.08,tipo:'triangle'}));chiado({dec:.05,vol:.1,f:6000})},
    traco(){tom(147,{dec:.35,vol:.3,ate:110,tipo:'triangle'});tom(220,{t:.06,dec:.3,vol:.12,tipo:'square',ate:196})},
    combo(){[0,4,7,11,14].forEach((n,k)=>tom(523*Math.pow(2,n/12),{t:k*.045,dec:.3,vol:.1,tipo:'triangle'}));tom(2093,{t:.24,dec:.5,vol:.07});chiado({t:.2,dec:.08,vol:.12,f:7000})},
    papel(v=1){chiado({dec:.32,vol:.16*v,f:1300,q:.5,ate:500});chiado({t:.06,dec:.18,vol:.08*v,f:3200,q:.8})},
    carimbo(){tom(95,{dec:.28,vol:.55,ate:48});chiado({dec:.06,vol:.35,f:600,tipo:'lowpass'});tom(1400,{t:.02,dec:.05,vol:.05})},
    pena(){for(let k=0;k<6;k++)chiado({t:k*.075,dec:.05,vol:.09,f:2600+Math.random()*1600,q:3})},
    tensao(){tom(nota(4),{dec:.1,vol:.07,tipo:'square'})}
  };
})();
document.addEventListener('pointerdown',()=>SOM.iniciar(),true);
document.addEventListener('keydown',()=>SOM.iniciar(),true);
function botaoSom(){$('btnSom').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/>${SOM.mudo?'<path d="M17 9 L22 14 M22 9 L17 14"/>':'<path d="M17 8.5 C18.5 10 18.5 14 17 15.5 M19.5 6 C22.5 9 22.5 15 19.5 18"/>'}</svg>${SOM.mudo?'Som desligado':'Som ligado'}`;$('btnSom').setAttribute('aria-pressed',String(!SOM.mudo))}
$('btnSom').addEventListener('click',()=>{SOM.iniciar();SOM.alternar();botaoSom()});
$('btnMenu').addEventListener('click',()=>{if(runAtiva())S.pausado=true;telaInicial()});
botaoSom();

let tremor=0,hitStop=0;const camBase=new THREE.Vector3();const efeitos=[];let texBrilho=null;
function tremer(n){if(!reduzir)tremor=Math.max(tremor,n)}
function brilho(){
  if(texBrilho)return texBrilho;
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);return texBrilho=new THREE.CanvasTexture(c);
}
function anel(pos,cor){
  if(reduzir)return;
  const m=new THREE.Mesh(new THREE.RingGeometry(.5,.64,48),new THREE.MeshBasicMaterial({color:cor,transparent:true,opacity:.9,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(pos.x,.03,pos.z);scene.add(m);
  efeitos.push({m,t:0,dur:.6,upd:(e,k)=>{const s=1+k*2.6;e.m.scale.set(s,s,s);e.m.material.opacity=.9*(1-k)*(1-k)}});
}
function faiscas(pos,cor,n=18,forca=4,sobe=5){
  if(reduzir)return;
  for(let i=0;i<n;i++){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:brilho(),color:cor,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    const tam=.25+Math.random()*.35;s.scale.set(tam,tam,1);s.position.set(pos.x,pos.y+.3,pos.z);scene.add(s);
    efeitos.push({m:s,t:0,dur:.6+Math.random()*.6,tam,v:new THREE.Vector3(rnd(forca),sobe*(.5+Math.random()),rnd(forca)),upd:(e,k,dt)=>{
      e.v.y-=14*dt;e.m.position.addScaledVector(e.v,dt);if(e.m.position.y<.06){e.m.position.y=.06;e.v.y*=-.4;e.v.x*=.7;e.v.z*=.7}
      const q=e.tam*(1-k*.7);e.m.scale.set(q,q,1);e.m.material.opacity=1-k;
    }});
  }
}
function atualizarEfeitos(dt){
  for(let i=efeitos.length-1;i>=0;i--){
    const e=efeitos[i];e.t+=dt;const k=Math.min(1,e.t/e.dur);e.upd(e,k,dt);
    if(k>=1){scene.remove(e.m);if(!e.m.isSprite)e.m.geometry.dispose();e.m.material.dispose();efeitos.splice(i,1)}
  }
  for(const t of lancados)if(t.punch>0){t.punch=Math.max(0,t.punch-dt*3.2);t.mesh.scale.setScalar((t.escala||1)*(1+Math.sin(Math.min(1,t.punch)*Math.PI)*.3*t.punch))}
  for(const f of MESA.fichas){
    if(f.cai>0){f.cai=Math.max(0,f.cai-dt*2.4);const c=Math.min(1,f.cai);f.mesh.position.y=f.y0+c*c*3;if(f.cai===0)SOM.batida(5,false,.6)}
    else if(f.pulso>0){f.pulso=Math.max(0,f.pulso-dt*1.5);f.mesh.position.y=f.y0+Math.sin(f.pulso*Math.PI)*.55;f.mesh.rotation.y+=dt*14*f.pulso;f.topos.forEach(mt=>mt.emissive.setRGB(f.pulso*.55,f.pulso*.42,f.pulso*.15))}
  }
  for(const a of auras3D){a.t+=dt;const s=Math.min(1,a.t*3.5),e=1-Math.pow(1-s,3);a.g.scale.setScalar(.01+e*.99);a.aro.material.opacity=.5+Math.sin(a.t*3)*.2;a.disco.material.opacity=.08+Math.sin(a.t*3)*.03}
  if(MESA.vela){const s=performance.now()/1000,tz=CLIMA.t,f=.86+Math.sin(s*(13+tz*10))*.06*(1+tz)+Math.sin(s*7.3)*.05+Math.random()*.05*(1+tz);MESA.vela.luz.intensity=(1.2+tz*1.1)*f;MESA.vela.chama.scale.set(.42*f*(1+tz*.3),.7*(2-f)*(1+tz*.4),1)}
  passoClima(dt);
  if(MESA.bolsa&&MESA.bolsaPulso>0){MESA.bolsaPulso=Math.max(0,MESA.bolsaPulso-dt*2.2);const k=MESA.bolsaPulso,s=Math.sin(k*Math.PI*3)*.2*k;MESA.bolsa.scale.set(.95*(1+s),.95*(1-s),.95*(1+s))}
  if(tremor>.002){camera.position.set(camBase.x+rnd(tremor),camBase.y+rnd(tremor)*.4,camBase.z+rnd(tremor));tremor*=Math.pow(.015,dt)}
  else if(tremor){tremor=0;camera.position.copy(camBase)}
}
function telaDe(p){const r=$('mesa').getBoundingClientRect();const v=p.clone();v.project(camera);return{x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height}}
function pulsar(el,cls='bump'){if(!el)return;if(el.id==='bolsa'&&B.saco)B.saco.pulso=Math.max(B.saco.pulso,.8);if(CONT&&CONT.mostr[el.id])CONT.mostr[el.id].punch=1;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
function voar(html,de,paraEl,{cls='',atraso=0,dur=650,aoChegar}={}){
  const el=document.createElement('div');el.className='voo '+cls;el.innerHTML=html;document.body.appendChild(el);
  const r=paraEl.getBoundingClientRect();const dx=r.left+r.width/2-de.x,dy=r.top+r.height/2-de.y;
  el.style.left=de.x+'px';el.style.top=de.y+'px';
  const arco=-60-Math.random()*40,lado=rnd(30);
  const a=el.animate([
    {transform:'translate(-50%,-50%) scale(.3)',opacity:0},
    {transform:`translate(calc(-50% + ${dx*.25+lado}px),calc(-50% + ${dy*.25+arco}px)) scale(1.25)`,opacity:1,offset:.3},
    {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.55)`,opacity:.95}
  ],{duration:reduzir?1:dur,delay:reduzir?0:atraso,easing:'cubic-bezier(.35,.1,.45,1)',fill:'both'});
  a.onfinish=()=>{el.remove();if(aoChegar)aoChegar()};
}
function numeroFlutuante(txt,el,cor){
  const r=el.getBoundingClientRect();const n=document.createElement('div');n.className='flut';n.textContent=txt;n.style.color=cor;
  n.style.left=(r.left+r.width/2+rnd(24))+'px';n.style.top=(r.top+r.height/2+20)+'px';document.body.appendChild(n);
  n.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:0},{transform:'translate(-50%,-50%) scale(1.35)',opacity:1,offset:.15},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.35},{transform:'translate(-50%,-160%) scale(.9)',opacity:0}],{duration:reduzir?600:1200,easing:'ease-out'}).onfinish=()=>n.remove();
}
function vinheta(cor){const v=$('vinheta');v.style.setProperty('--cor',cor);v.animate([{opacity:0},{opacity:1,offset:.12},{opacity:0}],{duration:650})}
const contagens=new Map();
function contar(el,alvo,comSom){
  const ini=el.dataset.v==null?+el.textContent||0:+el.dataset.v;
  if(contagens.has(el))cancelAnimationFrame(contagens.get(el));
  if(ini===alvo){el.textContent=alvo;el.dataset.v=alvo;contagens.delete(el);return}
  const dur=reduzir?0:Math.min(650,140+Math.abs(alvo-ini)*45),t0=performance.now();let ult=ini;
  pulsar(el);
  const f=agora=>{
    const k=dur?Math.min(1,(agora-t0)/dur):1;const v=Math.round(ini+(alvo-ini)*(1-Math.pow(1-k,3)));
    if(v!==ult){ult=v;if(comSom)SOM.tick(Math.abs(v))}
    el.textContent=v;el.dataset.v=v;
    if(k<1)contagens.set(el,requestAnimationFrame(f));else contagens.delete(el);
  };
  contagens.set(el,requestAnimationFrame(f));
}

