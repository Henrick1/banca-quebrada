const MUS=(()=>{
  let ctx=null,saida,musG,ambG,eco,ruido,prox=0,passo=0,timer=null,drone=null,murm=null;
  const intervalo=(f,ms)=>setInterval(f,ms);
  const hz=m=>440*Math.pow(2,(m-69)/12);
  const PROG={
    calma:[[50,53,57],[48,52,55],[46,50,53],[48,52,55]],
    tensa:[[50,53,57],[51,55,58],[50,53,57],[49,52,55]]
  };
  const ESCALA={calma:[62,64,65,67,69,71,72,74,76],tensa:[62,63,65,67,69,70,72,74,75]};
  const humor=()=>{
    const t=typeof CLIMA!=='undefined'?CLIMA.t:0,luta=!!(S.ini&&['intro','jogador','casa','resolvendo'].includes(S.fase));
    const chefe=!!(luta&&S.ini&&S.ini.chefe);
    return{t:luta?t:Math.min(t,.2),luta,chefe};
  };
  function iniciar(){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    if(ctx){if(ctx.state==='suspended')ctx.resume();return}
    ctx=new AC();
    saida=ctx.createGain();saida.connect(ctx.destination);
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.connect(saida);
    musG=ctx.createGain();ambG=ctx.createGain();musG.connect(comp);ambG.connect(comp);
    eco=ctx.createDelay(1);eco.delayTime.value=.32;const fb=ctx.createGain();fb.gain.value=.28;const ef=ctx.createBiquadFilter();ef.type='lowpass';ef.frequency.value=1800;
    eco.connect(ef);ef.connect(fb);fb.connect(eco);const ecoG=ctx.createGain();ecoG.gain.value=.35;ef.connect(ecoG);ecoG.connect(musG);
    ruido=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=ruido.getChannelData(0);let ult=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;ult=(ult+.02*w)/1.02;d[i]=ult*3.5}
    ambiente();aplicarVolume();
    prox=ctx.currentTime+.2;timer=intervalo(agendar,90);
    document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else ctx.resume()});
  }
  function ambiente(){
    const s=ctx.createBufferSource();s.buffer=ruido;s.loop=true;
    const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=420;bp.Q.value=.6;
    const g=ctx.createGain();g.gain.value=.18;
    const lfo=ctx.createOscillator();lfo.frequency.value=.13;const lg=ctx.createGain();lg.gain.value=.08;lfo.connect(lg);lg.connect(g.gain);
    const lfo2=ctx.createOscillator();lfo2.frequency.value=.07;const lg2=ctx.createGain();lg2.gain.value=140;lfo2.connect(lg2);lg2.connect(bp.frequency);
    s.connect(bp);bp.connect(g);g.connect(ambG);s.start();lfo.start();lfo2.start();murm=g;
  }
  function estalo(t){
    const s=ctx.createBufferSource();s.buffer=ruido;const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=1800+Math.random()*2500;
    const g=ctx.createGain(),v=.05+Math.random()*.12;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.03+Math.random()*.05);
    s.connect(hp);hp.connect(g);g.connect(ambG);s.start(t,Math.random()*1.5);s.stop(t+.12);
  }
  function env(g,t,a,pico,dec){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,pico),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec)}
  function cordaDedilhada(m,t,vol,brilho=2600){
    const f=hz(m),g=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(brilho,t);lp.frequency.exponentialRampToValueAtTime(500,t+.5);lp.Q.value=2;
    [['triangle',0],['sawtooth',6]].forEach(([tp,det],i)=>{const o=ctx.createOscillator();o.type=tp;o.frequency.value=f;o.detune.value=det;const og=ctx.createGain();og.gain.value=i?.35:.8;o.connect(og);og.connect(lp);o.start(t);o.stop(t+1.2)});
    env(g,t,.004,vol,.9);lp.connect(g);g.connect(musG);g.connect(eco);
  }
  function baixo(m,t,vol){
    const g=ctx.createGain(),o=ctx.createOscillator(),o2=ctx.createOscillator();o.type='sine';o2.type='triangle';o.frequency.value=hz(m);o2.frequency.value=hz(m);
    const g2=ctx.createGain();g2.gain.value=.3;o2.connect(g2);g2.connect(g);o.connect(g);env(g,t,.01,vol,1.3);g.connect(musG);o.start(t);o2.start(t);o.stop(t+1.5);o2.stop(t+1.5);
  }
  function flauta(m,t,vol,dur){
    const g=ctx.createGain(),o=ctx.createOscillator(),vib=ctx.createOscillator(),vg=ctx.createGain();
    o.type='sine';o.frequency.value=hz(m);vib.frequency.value=5.2;vg.gain.value=3.5;vib.connect(vg);vg.connect(o.detune);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.06);g.gain.setValueAtTime(vol,t+dur*.6);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(musG);g.connect(eco);o.start(t);vib.start(t);o.stop(t+dur+.05);vib.stop(t+dur+.05);
  }
  function tambor(t,vol,grave=true){
    if(grave){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.25);env(g,t,.003,vol,.32);o.connect(g);g.connect(musG);o.start(t);o.stop(t+.4)}
    const s=ctx.createBufferSource();s.buffer=ruido;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=grave?300:2200;bp.Q.value=grave?1:.8;
    const g=ctx.createGain();env(g,t,.002,vol*(grave?.5:.35),grave?.12:.05);s.connect(bp);bp.connect(g);g.connect(musG);s.start(t,Math.random());s.stop(t+.2);
  }
  function ajustarDrone(h,t){
    const quer=h.chefe?.05:h.t>.55?.025:0;
    if(quer&&!drone){
      const o=ctx.createOscillator(),o2=ctx.createOscillator(),lp=ctx.createBiquadFilter(),g=ctx.createGain();
      o.type='sawtooth';o2.type='sawtooth';o.frequency.value=hz(38);o2.frequency.value=hz(38)*1.003;lp.type='lowpass';lp.frequency.value=260;g.gain.value=.0001;
      o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(musG);o.start();o2.start();drone={o,o2,g};
    }
    if(drone)drone.g.gain.setTargetAtTime(Math.max(.0001,quer),t,1.2);
  }
  function agendar(){
    if(!ctx||ctx.state!=='running')return;
    const h=humor(),bpm=h.luta?80+h.t*34+(h.chefe?8:0):70,colcheia=60/bpm/2;
    ajustarDrone(h,ctx.currentTime);
    if(murm)murm.gain.setTargetAtTime(h.luta?.14:.2,ctx.currentTime,2);
    while(prox<ctx.currentTime+.3){
      const t=prox,c=passo%8,comp=Math.floor(passo/8),tensa=h.t>.45||h.chefe;
      const prog=tensa?PROG.tensa:PROG.calma,ac=prog[comp%prog.length],esc=tensa?ESCALA.tensa:ESCALA.calma;
      const arp=[0,1,2,1,0,2,1,2][c],v=h.luta?.07:.05;
      if(!(c%2)||h.luta)cordaDedilhada(ac[arp]+12,t,v*(c===0?1.25:1),tensa?1900:2700);
      if(c===0)baixo(ac[0]-12,t,.18);
      if(c===4&&h.luta)baixo(ac[c%2?1:0]-12,t,.11);
      if((c===2||c===6)&&Math.random()<(h.luta?.32:.22))flauta(esc[Math.floor(Math.random()*esc.length)],t,.045,colcheia*(Math.random()<.5?3:2));
      if(h.luta&&h.t>.4){if(c===0||c===4)tambor(t,.22+h.t*.18,true);if(c===2||c===6)tambor(t,.1+h.t*.1,false)}
      if(h.chefe&&(c===3||c===7))tambor(t,.08,false);
      if(Math.random()<.12)estalo(t+Math.random()*colcheia);
      prox+=colcheia;passo++;
    }
  }
  function aplicarVolume(){
    if(!ctx)return;
    const mudo=typeof SOM!=='undefined'&&SOM.mudo,v=(OPCOES.musica??45)/100;
    saida.gain.setTargetAtTime(mudo?0:1,ctx.currentTime,.1);
    musG.gain.setTargetAtTime(v*.9,ctx.currentTime,.2);ambG.gain.setTargetAtTime(v*.8,ctx.currentTime,.2);
  }
  return{iniciar,aplicarVolume};
})();
