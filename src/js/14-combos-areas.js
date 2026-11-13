const matsBorda={};
function matBorda(k){
  if(matsBorda[k])return matsBorda[k];
  const e=ENCANTOS[k],metal=['bronze','prata','ouro','cobre','mercurio','magnetita'].includes(k),gema=['rubi','esmeralda','ametista','ambar','safira','granada','cinabrio'].includes(k);
  return matsBorda[k]=new THREE.MeshStandardMaterial({color:lin(e.cor),metalness:metal?.85:gema?.3:.1,roughness:metal?.3:k==='onix'?.2:.4,emissive:gema?lin(e.cor).multiplyScalar(.3):new THREE.Color(0)});
}
function bordasDado(die,mesh,matOver){
  const sd=forma(die.type),faces=die.type==='coin'?sd.vf.map(i=>sd.F[i]):sd.F;
  const vistos=new Set(),r=die.type==='coin'?.045:.055,mat=matOver||matBorda(die.encanto),cima=new THREE.Vector3(0,1,0);
  for(const f of faces)for(let i=0;i<f.length;i++){
    const a=f[i],b=f[(i+1)%f.length],chave=a<b?a+'-'+b:b+'-'+a;
    if(vistos.has(chave))continue;vistos.add(chave);
    const A=new THREE.Vector3(...sd.V[a]),Bv=new THREE.Vector3(...sd.V[b]),len=A.distanceTo(Bv);
    const cil=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len+r*1.2,6),mat);
    cil.position.copy(A).add(Bv).multiplyScalar(.5);
    cil.quaternion.setFromUnitVectors(cima,Bv.clone().sub(A).normalize());
    cil.castShadow=true;mesh.add(cil);
  }
}
const ehPrimo=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const distMesa=(a,b)=>Math.hypot(a.mesh.position.x-b.mesh.position.x,a.mesh.position.z-b.mesh.position.z);
function checarCombos(){
  const meus=lancados.filter(t=>t.dono==='jogador'&&t.pronto&&t.valor!=null);
  const casa=lancados.filter(t=>t.dono==='casa'&&t.pronto);
  for(const t of meus){
    const e=t.die.encanto;if(!e||t.combo)continue;
    const outros=meus.filter(o=>o!==t);let par=null,bonus=0,casaMenos=0;
    if(e==='bronze'){par=outros.find(o=>o.die.type===t.die.type);bonus=4}
    if(e==='prata'){par=outros.find(o=>distMesa(o,t)<2.6);bonus=5}
    if(e==='ouro'){par=outros.find(o=>o.num===t.num);bonus=t.valor}
    if(e==='onix'&&ehPrimo(t.num)){par=t;bonus=5}
    if(e==='marfim'&&t.num%3===0){par=t;bonus=6}
    if(e==='rubi'){par=outros.find(o=>Math.abs(o.num-t.num)===1);bonus=4}
    if(e==='esmeralda'){par=casa.find(o=>distMesa(o,t)<2.6);casaMenos=3}
    if(e==='ametista'&&Math.hypot(t.mesh.position.x,t.mesh.position.z)<2){par=t;bonus=8}
    if(!par)continue;
    t.combo=true;dispararCombo(t,par,bonus,casaMenos);
  }
  aplicarAreas();
}
const areas=[],auras3D=[];
const valorCasa=()=>{const c=lancados.filter(t=>t.dono==='casa'&&t.pronto&&t.valor!=null);if(!c.length)return null;const g={};c.forEach(t=>{const k=t.passoC??0;g[k]=temTraco('enxame')?(g[k]??0)+t.valor:Math.max(g[k]??-Infinity,t.valor)});return Object.values(g).reduce((a,b)=>a+b,0)};
function descArea(a){
  const q=Math.abs(a.delta),v=a.delta>0?`ganham +${q}`:`perdem ${q}`;
  if(a.tipo==='raio')return`${a.alvo==='casa'?'Dados da casa':'Seus dados'} no círculo em volta dele ${v}.`;
  return`Os ${a.n} dados seus mais próximos dele ${v} cada.`;
}
function criarArea(t,def){
  areas.push({...def,orig:t,afetados:new Set()});
  const p=t.mesh.position;
  if(def.tipo==='raio'){
    const g=new THREE.Group();
    const disco=new THREE.Mesh(new THREE.CircleGeometry(def.r,64),new THREE.MeshBasicMaterial({color:def.cor,transparent:true,opacity:.1,depthWrite:false}));
    const aro=new THREE.Mesh(new THREE.RingGeometry(def.r-.08,def.r,72),new THREE.MeshBasicMaterial({color:def.cor,transparent:true,opacity:.7,depthWrite:false}));
    [disco,aro].forEach(m=>{m.rotation.x=-Math.PI/2;g.add(m)});
    g.position.set(p.x,.025,p.z);g.scale.setScalar(.01);scene.add(g);
    auras3D.push({g,disco,aro,t:0});
  }
  setTimeout(()=>{rotuloMesa(def.nome,new THREE.Vector3(p.x,p.y+.5,p.z),def.cor);if(def.delta>0)SOM.combo();else SOM.traco()},150);
}
function aplicarAreas(){
  const prontos=lancados.filter(t=>t.pronto&&t.valor!=null);
  for(const a of areas){
    const cand=prontos.filter(t=>t.dono===a.alvo&&t!==a.orig&&!a.afetados.has(t)).map(t=>({t,d:distMesa(t,a.orig)}));
    const escolhidos=a.tipo==='raio'?cand.filter(c=>c.d<=a.r):cand.sort((x,y)=>x.d-y.d).slice(0,Math.max(0,a.n-a.afetados.size));
    escolhidos.forEach(c=>{a.afetados.add(c.t);aplicarDelta(a,c.t)});
  }
}
function aplicarDelta(a,t){
  const d=Math.max(a.delta,-t.valor);
  t.valor+=d;
  if(t.dono==='jogador')S.soma+=d;else S.rolagem=valorCasa();
  setTimeout(()=>{
    const p=t.mesh.position,txt=`${d>=0?'+':'−'}${Math.abs(d)}`;
    t.punch=1;faiscas(p,a.cor,12,2,5);
    if(a.tipo==='proximos')raio(a.orig.mesh.position,p,a.cor);
    rotuloMesa(`${a.nome} ${txt}`,p,a.cor);
    if(a.delta<0&&t.dono==='jogador'){SOM.traco();tremer(.1)}
    if(t.dono==='jogador')voar(txt,telaDe(p),$('soma'),{cls:'pontos',atraso:150,aoChegar:()=>contar($('soma'),S.soma,true)});
    else{pulsar($('alvo'));placar()}
    if(t.rotulo)t.rotulo.insertAdjacentHTML('beforeend',`<small style="color:${a.cor}">${txt}</small>`);
  },reduzir?0:450);
}
function raio(a,b,cor){
  if(reduzir)return;
  const curva=new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x,.8,a.z),new THREE.Vector3((a.x+b.x)/2,2.2,(a.z+b.z)/2),new THREE.Vector3(b.x,.8,b.z));
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curva.getPoints(24)),new THREE.LineBasicMaterial({color:cor,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene.add(l);efeitos.push({m:l,t:0,dur:1.1,upd:(e,k)=>{e.m.material.opacity=k<.2?k*5:1-(k-.2)/.8}});
  for(let i=0;i<=8;i++){const p=curva.getPoint(i/8);faiscas(p,cor,2,1,2)}
}
function dispararCombo(t,par,bonus,casaMenos){
  const en=ENCANTOS[t.die.encanto],p=t.mesh.position;
  S.stats.combos++;S.combosRodada=(S.combosRodada||0)+1;if(S.combosRodada>=3)conquistar('combo3');
  if(bonus){S.soma+=bonus;t.valor+=bonus}
  if(casaMenos)S.descontoCasa+=casaMenos;
  setTimeout(()=>{
    SOM.combo();tremer(.18);hitStop=Math.max(hitStop,.06);t.punch=1.35;if(par!==t)par.punch=1;
    faiscas(p,en.ui,26,3,8);anel(p,en.ui);
    if(par!==t){raio(p,par.mesh.position,en.ui);faiscas(par.mesh.position,en.ui,12,2,5);anel(par.mesh.position,en.ui)}
    rotuloMesa(`${en.combo}! ${bonus?'+'+bonus:'Casa −'+casaMenos}`,p,en.ui);
    if(bonus)voar(`+${bonus}`,telaDe(p),$('soma'),{cls:'pontos',atraso:200,aoChegar:()=>contar($('soma'),S.soma,true)});
    if(casaMenos){pulsar($('alvo'));placar()}
    if(t.rotulo)t.rotulo.insertAdjacentHTML('beforeend',`<small style="color:${en.ui}">${en.combo} ${bonus?'+'+bonus:'−'+casaMenos}</small>`);
  },reduzir?0:350);
}


