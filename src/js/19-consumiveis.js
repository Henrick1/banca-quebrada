const emLuta=()=>!!(S.ini&&S.ini.hp>0&&S.hp>0&&['jogador','casa','intro'].includes(S.fase));
function dadosCasaQuebraveis(){return lancados.filter(t=>t.dono==='casa'&&t.pronto&&!t.quebrado&&t.valor>0)}
function dadoCasaQuebravel(){return dadosCasaQuebraveis()[0]||null}
const MIRA={i:-1,k:null,marcas:[],hover:null,ponto:null,fantasma:null};
const TEXTO_MIRA={martelo:['Clique no dado da casa que o martelo vai quebrar. Esc cancela','Escolha o dado da casa'],estilingue:['Clique em qualquer dado parado na mesa para atingir. Esc cancela','Escolha um dado para atingir'],mel:['Clique num dado seu na mesa para grudar. Esc cancela','Escolha um dado seu'],semente:['Clique num ponto da mesa para plantar. Esc cancela','Escolha onde plantar']};
function alvosMira(){
  if(MIRA.k==='martelo')return dadosCasaQuebraveis();
  if(MIRA.k==='estilingue')return lancados.filter(t=>t.pronto&&!t.quebrado&&!t.mel);
  if(MIRA.k==='mel')return lancados.filter(t=>t.dono==='jogador'&&t.pronto&&!t.mel&&!t.quebrado);
  return[];
}
function mirarCons(i,k){
  pararMira();MIRA.i=i;MIRA.k=k;document.body.classList.add('mirando');
  avisar(TEXTO_MIRA[k][0]);SOM.batida(9,true);banner(TEXTO_MIRA[k][1],'bom');
}
function pararMira(msg){
  if(MIRA.i<0)return;
  MIRA.i=-1;MIRA.k=null;MIRA.hover=null;MIRA.ponto=null;document.body.classList.remove('mirando');
  MIRA.marcas.forEach(m=>{scene.remove(m);m.geometry.dispose();m.material.dispose()});MIRA.marcas=[];
  if(MIRA.fantasma){scene.remove(MIRA.fantasma);MIRA.fantasma.geometry.dispose();MIRA.fantasma.material.dispose();MIRA.fantasma=null}
  if(msg)avisar(msg);
}
function passoMira(){
  if(MIRA.i<0)return;
  if(!emLuta()||(S.cons||[])[MIRA.i]!==MIRA.k){pararMira();return}
  if(MIRA.k==='semente'){
    if(!MIRA.fantasma){MIRA.fantasma=new THREE.Mesh(new THREE.RingGeometry(2.05,2.2,48),new THREE.MeshBasicMaterial({color:'#9fe07a',transparent:true,opacity:.6,depthWrite:false}));MIRA.fantasma.rotation.x=-Math.PI/2;scene.add(MIRA.fantasma)}
    const p=MIRA.ponto;MIRA.fantasma.visible=!!p;if(p)MIRA.fantasma.position.set(p.x,.03,p.z);return;
  }
  const alvos=alvosMira();
  if(!alvos.length){pararMira();return}
  const cor=MIRA.k==='martelo'?0xe0574a:MIRA.k==='mel'?0xe3a83a:0xc08a55;
  while(MIRA.marcas.length<alvos.length){const m=new THREE.Mesh(new THREE.RingGeometry(.85,1.05,40),new THREE.MeshBasicMaterial({color:cor,transparent:true,opacity:.8,depthWrite:false}));m.rotation.x=-Math.PI/2;scene.add(m);MIRA.marcas.push(m)}
  while(MIRA.marcas.length>alvos.length){const m=MIRA.marcas.pop();scene.remove(m);m.geometry.dispose();m.material.dispose()}
  const t=performance.now()/1000;
  alvos.forEach((d,j)=>{const m=MIRA.marcas[j],h=d===MIRA.hover;m.position.set(d.mesh.position.x,.04,d.mesh.position.z);m.scale.setScalar(((h?1.25:1)+Math.sin(t*6+j)*.06)*(d.escala||1));m.material.color.set(h?0xffd27a:cor);m.material.opacity=h?1:.65+Math.sin(t*6+j)*.2});
}
function raioCena(e){const cv=$('cena'),r=cv.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return ray}
function dadoSob(e,alvos){
  const ray=raioCena(e),h=ray.intersectObjects(alvos.map(t=>t.mesh),true)[0];
  if(h){let o=h.object;while(o&&!alvos.some(t=>t.mesh===o))o=o.parent;return alvos.find(t=>t.mesh===o)||null}
  const p=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.5),new THREE.Vector3());
  if(!p)return null;let melhor=null,dm=1.1;
  alvos.forEach(t=>{const d=Math.hypot(t.mesh.position.x-p.x,t.mesh.position.z-p.z);if(d<dm){dm=d;melhor=t}});return melhor;
}
function pontoMesa(e){const p=raioCena(e).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());if(!p||Math.abs(p.x)>TW/2-.6||Math.abs(p.z)>TD/2-.6)return null;return p}
function dadoCasaSob(e){return dadoSob(e,dadosCasaQuebraveis())}
function gastarMira(){const i=MIRA.i,k=MIRA.k;pararMira();if((S.cons||[])[i]!==k)return false;S.cons.splice(i,1);if(S.stats)S.stats.consumiveis=(S.stats.consumiveis||0)+1;return true}
function quebrarComMartelo(t){
  if(!gastarMira())return;
  const v=t.valor;t.valor=0;S.rolagem=valorCasa();quebrarDado(t,v);
  avisar(`O dado da casa quebrou e perdeu ${v}`);hud();placar();renderCons();
}
function atirarEstilingue(t){
  if(!gastarMira())return;
  const p=t.mesh.position.clone();faiscas(p,0xc08a55,20,3,6);anel(p,0xc08a55);SOM.batida(10,false);tremer(.15);rotuloMesa('Pedrada!',p,'#e0b080');
  rerolar(t,{x:rnd(3),y:7.5,z:rnd(3)});banner(CONSUMIVEIS.estilingue.nome,'bom');hud();placar();renderCons();
}
function grudarMel(t){
  if(!gastarMira())return;
  t.mel=true;
  const gota=new THREE.Mesh(new THREE.SphereGeometry(.32,16,10),new THREE.MeshStandardMaterial({color:lin('#e3a83a'),roughness:.15,transparent:true,opacity:.85,emissive:lin('#6a4010'),emissiveIntensity:.3}));
  gota.scale.set(1.3,.45,1.3);const w=t.mesh.position.clone().add(new THREE.Vector3(0,.55*(t.escala||1),0));t.mesh.worldToLocal(w);gota.position.copy(w);gota.quaternion.copy(t.mesh.quaternion.clone().invert());t.mesh.add(gota);
  faiscas(t.mesh.position,0xe3a83a,18,2,4);SOM.cura();rotuloMesa('Grudado no mel',t.mesh.position,'#e3a83a');banner(CONSUMIVEIS.mel.nome,'bom');renderCons();
}
function plantarSemente(p){if(!gastarMira())return;plantarBroto(p);banner(CONSUMIVEIS.semente.nome,'bom');renderCons()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&MIRA.i>=0)pararMira(`${CONSUMIVEIS[MIRA.k].nome} guardado`)});
$('cena').addEventListener('pointermove',e=>{if(MIRA.i<0)return;e.stopImmediatePropagation();
  if(MIRA.k==='semente'){MIRA.ponto=pontoMesa(e);$('cena').style.cursor=MIRA.ponto?'pointer':'not-allowed';return}
  MIRA.hover=dadoSob(e,alvosMira());$('cena').style.cursor=MIRA.hover?'pointer':'crosshair'},true);
$('cena').addEventListener('pointerdown',e=>{if(MIRA.i<0)return;e.stopImmediatePropagation();
  if(MIRA.k==='semente'){const p=pontoMesa(e);if(p)plantarSemente(p);else{SOM.batida(4,true);avisar('Clique dentro da mesa. Esc cancela')}return}
  const t=dadoSob(e,alvosMira());
  if(!t){SOM.batida(4,true);avisar(TEXTO_MIRA[MIRA.k][0]);return}
  if(MIRA.k==='martelo')quebrarComMartelo(t);else if(MIRA.k==='estilingue')atirarEstilingue(t);else if(MIRA.k==='mel')grudarMel(t)},true);
function quebrarDado(t,v){
  t.quebrado=true;
  faiscas(t.mesh.position,0xd9dde6,34,5,9);faiscas(t.mesh.position,0x9a8a70,18,3,6);
  if(t.body)world.remove(t.body);t.mesh.visible=false;
  if(t.rotulo){t.rotulo.style.opacity=.35;t.rotulo.style.textDecoration='line-through'}
  tremer(.5);hitStop=.08;SOM.batida(12,true);setTimeout(()=>SOM.batida(8,false),70);
  rotuloMesa(v?`Quebrado! −${v}`:'Quebrado!',t.mesh.position,CONSUMIVEIS.martelo.cor);pulsar($('alvo'));
}
function travaCons(k){
  if(!emLuta())return'Só durante a luta';
  if(k==='martelo'&&!dadoCasaQuebravel())return'Nenhum dado da casa na mesa. Espere a casa lançar';
  if((k==='estilingue'||k==='mel')&&(S.fase!=='jogador'||S.voando>0))return'Só na sua vez, com os dados parados';
  if(k==='estilingue'&&!lancados.some(t=>t.pronto&&!t.quebrado&&!t.mel))return'Nenhum dado parado na mesa';
  if(k==='mel'&&!lancados.some(t=>t.dono==='jogador'&&t.pronto&&!t.mel))return'Nenhum dado seu na mesa';
  if(k==='tonico'&&S.hp>=S.max)return'Vida cheia';
  if(k==='frasco'&&temTraco('imune'))return'A casa é imune a veneno';
  if(k==='peso'&&S.pesoProx)return'O peso já está no próximo dado';
  if(k==='maoLeve'&&(S.fase!=='jogador'||!S.bolsa.length||S.mao.length>=maoMax()))return S.fase!=='jogador'?'Só na sua vez de lançar':!S.bolsa.length?'Bolsa vazia':'Mão cheia';
  return'';
}
function renderCons(){
  const el=$('cons');if(!el)return;
  el.hidden=!S.ini;
  if(!el.hidden&&typeof THREE!=='undefined'){sincronizarBolso();dicaBolso()}
}
function usarCons(i){
  const k=(S.cons||[])[i];if(!k)return;
  const tr=travaCons(k);
  if(tr){avisar(tr);SOM.batida(4,true);pulsar($('cons'),'treme');return}
  if(['martelo','estilingue','mel','semente'].includes(k)){if(MIRA.i===i)pararMira(`${CONSUMIVEIS[k].nome} guardado`);else mirarCons(i,k);return}
  const c=CONSUMIVEIS[k],slot=document.querySelector(`[data-cons="${i}"]`),de=slot?slot.getBoundingClientRect():null;
  S.cons.splice(i,1);
  const efeito={
    tonico(){const q=cm(10);S.hp=Math.min(S.max,S.hp+q);SOM.cura();pulsar($('barraJ'),'flash');numeroFlutuante(`+${q}`,$('barraJ'),c.cor)},
    faca(){
      S.ini.hp-=8;S.stats.dano+=8;SOM.dano();tremer(.3);pulsar($('barraI'),'flash');pulsar($('barraI'),'treme');numeroFlutuante('-8',$('barraI'),'#ffd27a');
      if(de)voar(svgPath('faca',c.cor),{x:de.left+de.width/2,y:de.top+de.height/2},$('barraI'),{dur:380});
    },
    frasco(){$('efVeneno').hidden=false;S.veneno+=5;SOM.veneno();pulsar($('veneno'));numeroFlutuante('Veneno 5',$('barraI'),c.cor)},
    peso(){S.pesoProx=6;SOM.batida(10,true);avisar('O próximo dado que parar vale +6')},
    maoLeve(){let n=0;for(let j=0;j<2;j++)if(S.bolsa.length&&S.mao.length<maoMax())puxar(n++*170);bandeja()}
  };
  efeito[k]();
  if(S.stats)S.stats.consumiveis=(S.stats.consumiveis||0)+1;
  banner(c.nome,'bom');hud();placar();renderCons();
  if(S.ini.hp<=0&&S.voando===0&&S.fase!=='resolvendo')avancar();
}
