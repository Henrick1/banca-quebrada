let COPOS=null;
function pararCopos(){if(!COPOS)return;cancelAnimationFrame(COPOS.raf);COPOS.r.dispose();COPOS.sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});COPOS=null}
function telaCopos(){
  pararCopos();
  S.fase='evento';S.retomar=()=>telaCopos();salvarPartida();
  abrirTela(`<div class="evento copos-ev">
    <div class="ev-topo"><div class="ev-selo" style="--c:#c08a55">${svgPath('copo','#2a1a0c')}</div><div><p class="menu-sobre">Evento · andar ${(S.linha||0)+1}</p><h2>O Jogo dos Copos</h2></div></div>
    <div class="copos-cena"><canvas id="coposCena"></canvas></div>
    <p class="ev-texto copos-msg" id="coposMsg">Olho na moeda...</p>
    ${statusRun()}
  </div>`);
  const cv=$('coposCena');
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  r.setPixelRatio(pxQualidade());r.shadowMap.enabled=qualidade().sombra;r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.setClearColor(0,0);
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,2,.1,50);cam.position.set(0,3.4,4.6);cam.lookAt(0,.25,0);
  sc.add(new THREE.HemisphereLight(lin('#f6e7c9'),lin('#1a110b'),.6));
  const sol=new THREE.SpotLight('#ffdcaa',2.4,30,Math.PI/5,.6,1);sol.position.set(0,6,2.5);sol.target.position.set(0,0,0);sol.castShadow=true;sol.shadow.mapSize.set(1024,1024);sc.add(sol,sol.target);
  const feltro=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.MeshStandardMaterial({color:lin("#1e4a46"),roughness:.95}));feltro.rotation.x=-Math.PI/2;feltro.receiveShadow=true;sc.add(feltro);
  const aro=new THREE.Mesh(new THREE.RingGeometry(2.6,2.66,64),new THREE.MeshBasicMaterial({color:lin('#d4a94f'),transparent:true,opacity:.35}));aro.rotation.x=-Math.PI/2;aro.position.y=.005;aro.scale.set(1.3,1,.62);sc.add(aro);
  const pts=[[0,1.02],[.3,1.02],[.36,.99],[.39,.93],[.46,.12],[.5,.03],[.5,0],[.45,0],[.41,.1],[.35,.93],[0,.95]].map(p=>new THREE.Vector2(p[0],p[1]));
  const couro=new THREE.MeshStandardMaterial({map:texturaBolsa({couro:'#6e3d22',fio:'#d9bf86'}),roughness:.75,side:THREE.DoubleSide,emissive:lin('#ffb04a'),emissiveIntensity:0});
  const latao=new THREE.MeshStandardMaterial({color:lin('#d4a94f'),metalness:.8,roughness:.3});
  const X=[-1.45,0,1.45];
  const copos=X.map((x,i)=>{
    const g=new THREE.Group(),m=new THREE.Mesh(new THREE.LatheGeometry(pts,40),couro.clone());m.castShadow=true;g.add(m);
    const fx=new THREE.Mesh(new THREE.TorusGeometry(.48,.025,8,40),latao);fx.rotation.x=Math.PI/2;fx.position.y=.08;g.add(fx);
    g.position.set(x,1,0);g.userData={slot:i,mat:m.material};sc.add(g);return g;
  });
  const moeda=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.05,32),new THREE.MeshStandardMaterial({color:lin('#e6b94a'),metalness:.85,roughness:.25,emissive:lin('#6a4a10'),emissiveIntensity:.3}));
  moeda.castShadow=true;sc.add(moeda);
  let comMoeda=Math.floor(R()*3),pode=false,hover=null,fim=false;
  moeda.position.set(X[copos[comMoeda].userData.slot],.03,0);
  const ray=new THREE.Raycaster();
  const sob=e=>{const rc=cv.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1),cam);const h=ray.intersectObjects(copos,true)[0];if(!h)return null;let o=h.object;while(o&&!copos.includes(o))o=o.parent;return o};
  cv.addEventListener('pointermove',e=>{hover=pode?sob(e):null;cv.style.cursor=hover?'pointer':'default'});
  const msg=t=>{const el=$('coposMsg');if(el)el.textContent=t};
  const anims=[];
  const anim=(dur,fn)=>new Promise(res=>anims.push({t:0,dur,fn,res}));
  const espera=ms=>new Promise(res=>setTimeout(res,ms));
  const nivel=S.linha||0,trocas=5+Math.min(9,Math.floor(nivel*.8)),dur=Math.max(.2,.52-nivel*.028);
  async function roteiro(){
    await espera(900);
    msg('Os copos descem...');
    await anim(.45,t=>copos.forEach(c=>c.position.y=1*(1-t*t)));SOM.batida(5,false);
    await espera(350);msg('Siga a moeda!');
    for(let k=0;k<trocas;k++){
      if(!COPOS)return;
      const a=Math.floor(R()*3);let b=Math.floor(R()*2);if(b>=a)b++;
      const A=copos.find(c=>c.userData.slot===a),B=copos.find(c=>c.userData.slot===b),xa=X[a],xb=X[b];
      SOM.batida(3,false);
      await anim(dur,t=>{const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;A.position.x=xa+(xb-xa)*e;A.position.z=Math.sin(e*Math.PI)*.7;B.position.x=xb+(xa-xb)*e;B.position.z=-Math.sin(e*Math.PI)*.7});
      A.userData.slot=b;B.userData.slot=a;
    }
    moeda.position.x=copos[comMoeda].position.x;
    msg('Onde está a moeda? Clique num copo.');pode=true;
  }
  cv.addEventListener('click',async e=>{
    if(!pode||fim)return;const c=sob(e);if(!c)return;
    fim=true;pode=false;hover=null;
    const acertou=copos.indexOf(c)===comMoeda;
    SOM.batida(6,false);
    await anim(.35,t=>c.position.y=.9*t);
    if(acertou){SOM.ouro(6);SOM.combo();faiscas3(moeda.position)}else SOM.dano();
    await espera(500);
    const outros=copos.filter(x=>x!==c);await anim(.35,t=>outros.forEach(x=>x.position.y=.9*t));
    await espera(900);
    pararCopos();
    if(acertou){
      S.ouro+=14;
      if(!S.teste){PERFIL.copos=(PERFIL.copos||0)+1;salvarPerfil();if(PERFIL.copos>=5)revelarSegredo('olho')}
      resultadoEvento({titulo:'Achou a moeda!',texto:'O trapaceiro fecha a cara e paga 14 de ouro.',bom:true});
    }else resultadoEvento({titulo:'Copo vazio',texto:'A moeda estava em outro copo. Ele sorri e guarda os seus 4 de ouro.',bom:false});
  });
  function faiscas3(p){for(let i=0;i<20;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.03,6,4),new THREE.MeshBasicMaterial({color:'#ffd86a'}));s.position.copy(p);s.userData.v=new THREE.Vector3(rnd(2),2+Math.random()*2,rnd(2));sc.add(s);brilhos.push(s)}}
  const brilhos=[];
  let antes=performance.now(),tt=0;
  const quadro=()=>{
    if(!document.body.contains(cv)){pararCopos();return}
    COPOS.raf=requestAnimationFrame(quadro);
    const agora=performance.now(),dt=Math.min(.05,(agora-antes)/1000);antes=agora;tt+=dt;
    for(let i=anims.length-1;i>=0;i--){const a=anims[i];a.t=Math.min(1,a.t+dt/a.dur);a.fn(a.t);if(a.t>=1){anims.splice(i,1);a.res()}}
    copos.forEach(c=>{c.userData.mat.emissiveIntensity+=((c===hover?.25:0)-c.userData.mat.emissiveIntensity)*Math.min(1,dt*12)});
    moeda.rotation.y+=dt*.6;
    for(let i=brilhos.length-1;i>=0;i--){const s=brilhos[i];s.userData.v.y-=dt*6;s.position.addScaledVector(s.userData.v,dt);if(s.position.y<0){sc.remove(s);s.geometry.dispose();s.material.dispose();brilhos.splice(i,1)}}
    const w=cv.clientWidth,h=cv.clientHeight;
    if(w&&h&&(cv.width!==Math.floor(w*r.getPixelRatio())||cv.height!==Math.floor(h*r.getPixelRatio()))){r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    r.render(sc,cam);
  };
  COPOS={r,sc,raf:0};quadro();roteiro();
}
