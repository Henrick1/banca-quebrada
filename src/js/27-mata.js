const MATA={anims:[],bichos:[]};
function animarMata(dur,fn){return new Promise(res=>MATA.anims.push({t:0,dur,fn,res}))}
function passoMata(dt){
  for(let i=MATA.anims.length-1;i>=0;i--){const a=MATA.anims[i];a.t=Math.min(1,a.t+Math.max(dt,.004)/a.dur);if(a.t>.995)a.t=1;try{a.fn(a.t)}catch(e){a.t=1}if(a.t>=1){MATA.anims.splice(i,1);a.res()}}
}
function livre(o){scene.remove(o);o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material&&!m.material.compartilhado)m.material.dispose()})}
function matC(cor,extra={}){return new THREE.MeshStandardMaterial({color:lin(cor),roughness:.6,...extra})}
function modeloSapo(){
  const g=new THREE.Group(),verde=matC('#4f9a34'),claro=matC('#c9e07a'),olho=matC('#f6f0c0',{roughness:.3}),pupila=matC('#111',{roughness:.2});
  const add=(geo,m,x,y,z,s)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(s)o.scale.set(...s);o.castShadow=true;g.add(o);return o};
  add(new THREE.SphereGeometry(.55,20,14),verde,0,.4,0,[1.15,.75,1]);
  add(new THREE.SphereGeometry(.45,16,10),claro,0,.3,.12,[1,.6,.9]);
  [-1,1].forEach(s=>{add(new THREE.SphereGeometry(.17,14,10),olho,s*.28,.78,.18);add(new THREE.SphereGeometry(.08,10,8),pupila,s*.3,.82,.32);
    add(new THREE.SphereGeometry(.2,12,8),verde,s*.55,.18,-.2,[1.6,.6,1]);add(new THREE.SphereGeometry(.14,10,8),verde,s*.4,.1,.42,[1,.5,1.3])});
  return g;
}
function modeloCorvo(){
  const g=new THREE.Group(),preto=matC('#17181f',{roughness:.35}),bico=matC('#e0b040');
  const add=(geo,m,x,y,z,s,r)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(s)o.scale.set(...s);if(r)o.rotation.set(...r);o.castShadow=true;g.add(o);return o};
  add(new THREE.SphereGeometry(.4,16,12),preto,0,0,0,[.8,.7,1.4]);
  add(new THREE.SphereGeometry(.25,14,10),preto,0,.15,.5);
  add(new THREE.ConeGeometry(.08,.35,8),bico,0,.12,.82,null,[Math.PI/2,0,0]);
  const asa=new THREE.BoxGeometry(1.3,.04,.6);
  g.userData.asas=[add(asa,preto,-.7,.05,0),add(asa,preto,.7,.05,0)];
  add(new THREE.BoxGeometry(.35,.03,.6),preto,0,0,-.75);
  return g;
}
function modeloJavali(){
  const g=new THREE.Group(),pelo=matC('#4a3424',{roughness:.9}),presa=matC('#f0e6cc'),esc=matC('#2a1a10');
  const add=(geo,m,x,y,z,s,r)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(s)o.scale.set(...s);if(r)o.rotation.set(...r);o.castShadow=true;g.add(o);return o};
  add(new THREE.SphereGeometry(.8,18,12),pelo,0,.9,0,[1.5,1,1]);
  add(new THREE.SphereGeometry(.5,14,10),pelo,1.25,.85,0,[1.1,.9,.9]);
  add(new THREE.CylinderGeometry(.2,.24,.25,12),esc,1.75,.75,0,null,[0,0,Math.PI/2]);
  [-1,1].forEach(s=>{add(new THREE.ConeGeometry(.06,.45,8),presa,1.7,.9,s*.22,null,[0,0,-.6]);
    [[.6,s*.45],[-.6,s*.45]].forEach(([x,z])=>add(new THREE.CylinderGeometry(.12,.1,.6,8),esc,x,.3,z))});
  return g;
}
function modeloFolha(){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshStandardMaterial({map:texturaFolha('#4f8a2a'),transparent:true,alphaTest:.4,side:THREE.DoubleSide,roughness:.7}));
  m.rotation.x=-Math.PI/2;m.castShadow=true;return m;
}
function poeira(p,cor=0xb9a27a,n=24){faiscas(p,cor,n,3,5)}
function rerolar(t,imp){
  if(!lancados.includes(t)||t.quebrado||!t.pronto)return false;
  if(t.mel){rotuloMesa('Grudado no mel',t.mesh.position,'#e3a83a');return false}
  if(t.dono==='jogador'){if(t.valor!=null)S.soma-=t.valor;t.valor=null;t.oculto=0}
  else{t.valor=null;t.oculto=0;if(t.folhaV){t.folhaV=0;S.folhaUsada=false}S.rolagem=valorCasa();if(t.folha){livre(t.folha);t.folha=null}}
  if(t.rotulo){t.rotulo.remove();t.rotulo=null}
  t.pronto=false;t.parado=0;t.tempo=0;t.cutucadas=0;t.combo=false;t.sapoPulos=t.sapoPulos||0;
  S.voando++;
  t.body.wakeUp&&t.body.wakeUp();
  t.body.velocity.set(imp.x+rnd(1.5),imp.y+Math.random()*2,imp.z+rnd(1.5));t.body.angularVelocity.set(rnd(20),rnd(20),rnd(20));
  return true;
}
function dadosNaMesa(f){return lancados.filter(t=>t.pronto&&!t.quebrado&&(!f||f(t)))}
async function eventoSapo(){
  const sapo=modeloSapo();scene.add(sapo);const de=new THREE.Vector3(-TW/2-2,-.5,TD/2+1.5),ate=new THREE.Vector3(rnd(2),0,rnd(1.5));
  sapo.position.copy(de);sapo.lookAt(ate.x,0,ate.z);
  banner('O sapo pula na mesa!','mau');SOM.batida(5,false);
  await animarMata(.7,t=>{sapo.position.lerpVectors(de,ate,t);sapo.position.y=Math.sin(t*Math.PI)*4;sapo.scale.setScalar(1+Math.sin(t*Math.PI)*.15)});
  tremer(.35);SOM.batida(11,false);poeira(ate,0x6fbf4a,30);anel(ate,0x6fbf4a);
  dadosNaMesa().forEach(t=>{const d=t.mesh.position.clone().sub(ate);d.y=0;d.normalize();rerolar(t,{x:d.x*4,y:7,z:d.z*4})});
  const fim=new THREE.Vector3(TW/2+3,-.5,-TD/2-2);
  animarMata(.8,t=>{sapo.position.lerpVectors(ate,fim,t);sapo.position.y=Math.sin(t*Math.PI)*3.5}).then(()=>livre(sapo));
}
async function eventoPatada(){
  banner('A Mãe Ursa bate na mesa!','mau');SOM.tensao();
  const pata=new THREE.Mesh(new THREE.CircleGeometry(2.4,32),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:0,depthWrite:false}));pata.rotation.x=-Math.PI/2;pata.position.set(rnd(2),.02,rnd(1));scene.add(pata);
  await animarMata(.55,t=>{pata.material.opacity=t*.45;pata.scale.setScalar(1.6-t*.6)});
  tremer(1);hitStop=.12;SOM.batida(14,false);SOM.batida(10,true);poeira(pata.position,0xb9a27a,50);anel(pata.position,0xb9a27a);
  dadosNaMesa().forEach(t=>rerolar(t,{x:0,y:9,z:0}));
  animarMata(.5,t=>pata.material.opacity=.45*(1-t)).then(()=>livre(pata));
}
async function eventoVento(){
  const lado=Math.random()<.5?1:-1;
  banner('Uma rajada de vento!','mau');SOM.whoosh();
  const folhas=[];for(let i=0;i<16;i++){const f=new THREE.Mesh(new THREE.PlaneGeometry(.4,.4),new THREE.MeshBasicMaterial({map:texturaFolha(['#c9762a','#d4a23a','#7a8a2a'][i%3]),transparent:true,alphaTest:.4,side:THREE.DoubleSide}));f.position.set(-lado*(TW/2+3),1+Math.random()*3,rnd(TD/2));f.userData.v=8+Math.random()*6;scene.add(f);folhas.push(f)}
  animarMata(1.4,t=>folhas.forEach((f,i)=>{f.position.x+=lado*f.userData.v*.016;f.rotation.set(t*9+i,t*7,t*5)})).then(()=>folhas.forEach(livre));
  await animarMata(.35,()=>{});
  SOM.whoosh();
  dadosNaMesa().forEach(t=>rerolar(t,{x:lado*(5+Math.random()*3),y:3.5,z:rnd(1)}));
}
async function eventoInvestida(){
  const j=modeloJavali(),z=rnd(TD*.25),lado=Math.random()<.5?1:-1;scene.add(j);
  j.rotation.y=lado>0?0:Math.PI;
  banner(`${S.ini.nome} investe!`,'mau');SOM.tensao();
  const x0=-lado*(TW/2+4),x1=lado*(TW/2+4);let bateu=false;
  await animarMata(1.1,t=>{j.position.set(x0+(x1-x0)*t,Math.abs(Math.sin(t*30))*.15,z);
    if(!bateu&&t>.3){bateu=true;tremer(.8);SOM.batida(13,false);dadosNaMesa().forEach(d=>rerolar(d,{x:lado*(7+Math.random()*4),y:5,z:(d.mesh.position.z-z)*1.5}))}
    if(Math.random()<.4)poeira(new THREE.Vector3(j.position.x,.1,z),0xa08a6a,3)});
  livre(j);
}
async function eventoCorvo(){
  const alvo=pick(dadosNaMesa(t=>t.dono==='jogador'&&!t.mel&&(t.valor||0)>0));if(!alvo)return;
  const c=modeloCorvo();scene.add(c);
  const de=new THREE.Vector3(-TW/2-3,8,-TD/2-3),p=alvo.mesh.position.clone(),ate=p.clone().add(new THREE.Vector3(0,1,0));
  banner('Um corvo vem pegar seu dado!','mau');SOM.whoosh();
  const bater=t=>c.userData.asas.forEach((a,i)=>a.rotation.z=(i?-1:1)*Math.sin(t*60)*.6);
  await animarMata(.8,t=>{c.position.lerpVectors(de,ate,t);c.lookAt(ate.x,ate.y,ate.z+(t<1?1:0));bater(t)});
  if(!lancados.includes(alvo)){livre(c);return}
  SOM.batida(6,false);
  S.soma-=alvo.valor||0;rotuloMesa(`Roubado! −${alvo.valor}`,alvo.mesh.position,'#8a8fa8');
  if(alvo.rotulo){alvo.rotulo.remove();alvo.rotulo=null}
  world.remove(alvo.body);const i=lancados.indexOf(alvo);if(i>=0)lancados.splice(i,1);
  S.naMesa=S.naMesa.filter(id=>id!==alvo.die.id);(S.roubados=S.roubados||[]).push(alvo.die.id);
  dispararTraco('corvo','Dado roubado');contar($('soma'),S.soma,false);pulsar($('soma'));placar();hud();
  const fim=new THREE.Vector3(TW/2+6,10,-TD/2-6);
  await animarMata(1,t=>{c.position.lerpVectors(ate,fim,t);alvo.mesh.position.copy(c.position).add(new THREE.Vector3(0,-.6,0));bater(t)});
  livre(c);scene.remove(alvo.mesh);alvo.mesh.geometry.dispose();
}
function lodoDoPantano(){
  const lodos=dadosNaMesa(t=>t.dono==='casa'&&t.die.lodo&&t.passoC===S.cPasso);if(!lodos.length)return;
  let total=0;
  lodos.forEach(l=>{faiscas(l.mesh.position,0x7fae4a,20,2,4);dadosNaMesa(t=>t.dono==='jogador'&&(t.valor||0)>0&&t.mesh.position.distanceTo(l.mesh.position)<2.6).forEach(t=>{t.valor--;S.soma--;total++;
    rotuloMesa('Lodo −1',t.mesh.position,'#7fae4a');if(t.rotulo){const tx=[...t.rotulo.childNodes].find(x=>x.nodeType===3);if(tx)tx.textContent=String(t.valor)}})});
  if(total){dispararTraco('pantano',`−${total} nos seus dados`);SOM.veneno();contar($('soma'),S.soma,false);placar()}
}
function eventoCasa(){
  if(S.evPasso!==S.cPasso){S.evPasso=S.cPasso;S.evFeitos=[]}
  const F=S.evFeitos,feito=k=>F.includes(k),marca=k=>F.push(k);
  if(!feito('lodo')){marca('lodo');if(temTraco('pantano'))lodoDoPantano()}
  const corre=fn=>{S.voando++;let fim=false;const acabou=()=>{if(fim)return;fim=true;S.voando--;if(S.voando===0)avancar()};Promise.race([fn(),new Promise(r=>setTimeout(r,6000))]).catch(()=>{}).finally(acabou);return true};
  const temDados=dadosNaMesa().length>0;
  if(!feito('fisico')){marca('fisico');
    if(temDados&&temTraco('sapo'))return corre(eventoSapo);
    if(temDados&&temTraco('patada')&&S.rodada%2===0&&casaRestantes()===1)return corre(eventoPatada);
    if(temDados&&temTraco('vento'))return corre(eventoVento);
    if(temDados&&temTraco('investida')&&!S.ini.investiu&&dadosNaMesa(t=>t.dono==='jogador').length>=2){S.ini.investiu=true;return corre(eventoInvestida)}
  }
  if(!feito('corvo')){marca('corvo');if(temTraco('corvo')&&S.corvoRodada!==S.rodada&&(S.corvoRodada=S.rodada)&&dadosNaMesa(t=>t.dono==='jogador'&&!t.mel&&(t.valor||0)>0).length)return corre(eventoCorvo)}
  return false;
}
function cobrirComFolha(t){
  const f=modeloFolha();f.position.copy(t.mesh.position);f.position.y+=.62*(t.escala||1);f.rotation.z=Math.random()*6;scene.add(f);t.folha=f;
  dispararTraco('folhas','Uma folha cobriu o dado');SOM.whoosh();
}
function descobrirFolhas(){
  let algum=false;
  for(const t of lancados){if(t.dono!=='casa'||!t.folhaV)continue;algum=true;
    const v=t.folhaV;t.folhaV=0;t.valor=v;if(t.folha){livre(t.folha);t.folha=null}
    if(t.rotulo){const tx=[...t.rotulo.childNodes].find(x=>x.nodeType===3);if(tx)tx.textContent=String(v)}
    faiscas(t.mesh.position,0x7fbf5a,22,3,6);anel(t.mesh.position,0x7fbf5a);t.punch=1.2;rotuloMesa(`A folha voa: ${v}`,t.mesh.position,'#9fd67a')}
  if(algum){S.rolagem=valorCasa();SOM.tensao();placar();hud()}
}
function plantarBroto(p){
  const g=new THREE.Group(),caule=matC('#5a8a2a'),folha=matC('#7fcf4a',{side:THREE.DoubleSide});
  const c=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,.6,8),caule);c.position.y=.3;g.add(c);
  [-1,1].forEach(s=>{const f=new THREE.Mesh(new THREE.SphereGeometry(.22,10,6),folha);f.scale.set(1,.25,.6);f.position.set(s*.18,.55,0);f.rotation.z=s*.5;f.castShadow=true;g.add(f)});
  const aura=new THREE.Mesh(new THREE.RingGeometry(2.05,2.2,48),new THREE.MeshBasicMaterial({color:'#9fe07a',transparent:true,opacity:.35,depthWrite:false}));aura.rotation.x=-Math.PI/2;aura.position.y=.02;g.add(aura);
  g.position.set(p.x,0,p.z);g.scale.setScalar(.01);scene.add(g);(S.brotos=S.brotos||[]).push(g);
  animarMata(.5,t=>g.scale.setScalar(Math.max(.01,Math.sin(t*Math.PI/2)*1.1)));
  faiscas(g.position,0x9fe07a,24,3,5);SOM.cura();
}
function limparBrotos(){(S.brotos||[]).forEach(livre);S.brotos=[]}
function eventosDadoJogador(t,f,passos,val){
  const v=f.v+f.bonus;
  if(t.die.type==='sapo'&&t.sapoPulos===2&&!t.dobrou){t.dobrou=true;passos.push({v:val,txt:'Sapo ×2',cor:'#8fe06a'});val*=2}
  if(temItem('trevo4')&&!S.trevoUsado&&v===1){S.trevoUsado=true;passos.push({k:'trevo4',v:3,txt:'Trevo: 1 vira 4'});val+=3}
  if(temItem('favo')){const viz=dadosNaMesa(o=>o!==t&&o.dono==='jogador'&&o.mesh.position.distanceTo(t.mesh.position)<1.45*Math.max(t.escala||1,o.escala||1)).length;if(viz){const q=(viz>=2?3:1)*qtdItem('favo');passos.push({k:'favo',v:q,txt:`Favo +${q}`});val+=q}}
  const brotos=(S.brotos||[]).filter(b=>b.position.distanceTo(new THREE.Vector3(t.mesh.position.x,0,t.mesh.position.z))<2.2).length;
  if(brotos){const q=2*brotos;passos.push({v:q,txt:`Broto +${q}`,cor:'#9fe07a'});val+=q}
  return val;
}
function depoisDadoJogador(t,f){
  const v=f.v+f.bonus,d=t.die;
  if(S.marcado&&d.id===S.marcado&&!t.mirado){t.mirado=true;if((t.valor??v)<3){const q=4;S.hp-=q;dispararTraco('mira',`Na mira: −${q}`);SOM.dano();tremer(.2);vinheta('#e0574a');pulsar($('barraJ'),'flash');numeroFlutuante(`-${q}`,$('barraJ'),'#e0574a');hud()}else rotuloMesa('Escapou da mira',t.mesh.position,'#86c48f')}
  if(d.type==='cogumelo'&&!t.eco&&!t.cresceu){t.cresceu=true;
    if(v===1){const real=S.dados.find(x=>x.id===d.id);if(real){S.dados=S.dados.filter(x=>x!==real);S.naMesa=S.naMesa.filter(id=>id!==d.id);rotuloMesa('Colhido! O cogumelo some',t.mesh.position,'#ff8a7a');faiscas(t.mesh.position,0xc0392b,24,3,6)}}
    else{const real=S.dados.find(x=>x.id===d.id);if(real){const i=Math.floor(Math.random()*real.faces.length);real.faces[i].bonus++;rotuloMesa(`Cresceu: face ${real.faces[i].v} +1`,t.mesh.position,'#ffe08a')}}}
  if(d.type==='sapo'&&!t.mel&&(t.sapoPulos||0)<2&&S.fase!=='resolvendo'&&Math.random()<1/3){
    t.sapoPulos=(t.sapoPulos||0)+1;S.voando++;
    setTimeout(()=>{S.voando--;if(!lancados.includes(t)||S.fase==='resolvendo'){if(S.voando===0)avancar();return}rotuloMesa(t.sapoPulos===2?'Pulou de novo! Valor dobrado':'O sapo pulou!',t.mesh.position,'#8fe06a');SOM.batida(5,false);if(!rerolar(t,{x:rnd(3),y:6.5,z:rnd(3)})&&S.voando===0)avancar()},420);
  }
  if(DIE[d.type].ninho&&!t.chocou&&!t.eco){t.chocou=true;chocarNinho(t)}
}
function chocarNinho(t){
  const p=t.mesh.position.clone();S.voando+=3;
  rotuloMesa('Os ovos chocam!',p,'#eef4f0');SOM.combo();
  const grupo={vals:[],n:3};
  for(let i=0;i<3;i++)setTimeout(()=>{if(S.fase==='resolvendo'){S.voando=Math.max(0,S.voando-1);if(S.voando===0)avancar();return}
    const ovo={...novoDado('ovo'),id:'ovo'+(uid++),eco:true};lancar(ovo,'jogador',0,1,{escala:.55,de:p,geracao:9});lancados[lancados.length-1].ninho=grupo},200+i*180);
}
function ovoParou(t){
  const g=t.ninho;if(!g)return;g.vals.push(t.valor||0);
  if(g.vals.length===g.n){const par=g.vals.some((v,i)=>g.vals.indexOf(v)!==i);
    if(par){S.soma+=5;rotuloMesa('Filhote! +5',t.mesh.position,'#ffe08a');SOM.combo();faiscas(t.mesh.position,0xffe08a,30,4,8);setTimeout(()=>{contar($('soma'),S.soma,true);pulsar($('soma'))},250)}}
}
function aoLancarJogador(d){
  (S.lancadosLuta=S.lancadosLuta||new Set()).add(d.id);
  if(temItem('ninhoAve')){S.ninhoConta=(S.ninhoConta||0)+1;if(S.ninhoConta>=5){S.ninhoConta=0;
    if((S.cons||[]).length<consMax()){const ks=Object.keys(CONSUMIVEIS).filter(k=>!CONSUMIVEIS[k].reino||(S.reino||0)>=CONSUMIVEIS[k].reino),k=pick(ks);S.cons.push(k);setTimeout(()=>{dispararItem('ninhoAve',`Chocou: ${CONSUMIVEIS[k].nome}`);renderCons()},600)}
    else setTimeout(()=>dispararItem('ninhoAve','Bolso cheio'),600)}}
}
function fimDeLutaMata(venceu){
  limparBrotos();
  if(!venceu)return;
  if(temItem('coroaFlores')&&S.hp>=(S.hpLuta??0)){const q=2*qtdItem('coroaFlores');S.max+=q;S.hp=Math.min(S.max,S.hp+q);setTimeout(()=>{dispararItem('coroaFlores',`+${q} vida máxima`);SOM.cura();hud()},700)}
  S.dados.forEach(d=>{if(d.type!=='bolota')return;
    if(S.lancadosLuta&&S.lancadosLuta.has(d.id)){d.dormiu=0;return}
    d.dormiu=(d.dormiu||0)+1;
    if(d.dormiu>=3){d.type='d8';d.faces=DIE.d8.faces.map(v=>({v,bonus:0,fx:null}));d.dormiu=0;setTimeout(()=>{toast('<b>A bolota germinou</b>Virou um D8 na sua bolsa','#7fbf5a');SOM.combo()},900)}});
  S.lancadosLuta=new Set();S.roubados=[];
}
function depoisDadoCasa(t){
  if(t.die.sapo&&(t.sapoPulos||0)<1&&S.fase!=='resolvendo'&&Math.random()<1/3){
    t.sapoPulos=1;S.voando++;
    setTimeout(()=>{S.voando--;if(!lancados.includes(t)||S.fase==='resolvendo'){if(S.voando===0)avancar();return}rotuloMesa('O dado sapo pulou!',t.mesh.position,'#8fe06a');SOM.batida(5,false);if(!rerolar(t,{x:rnd(3),y:6.5,z:rnd(3)})&&S.voando===0)avancar()},420);
  }
}
