const emLuta=()=>!!(S.ini&&S.ini.hp>0&&S.hp>0&&['jogador','casa','intro'].includes(S.fase));
function dadosCasaQuebraveis(){return lancados.filter(t=>t.dono==='casa'&&t.pronto&&!t.quebrado&&t.valor>0)}
function dadoCasaQuebravel(){return dadosCasaQuebraveis()[0]||null}
const MIRA={i:-1,marcas:[],hover:null};
function mirarMartelo(i){
  MIRA.i=i;document.body.classList.add('mirando');
  avisar('Clique no dado da casa que o martelo vai quebrar. Esc cancela');SOM.batida(9,true);banner('Escolha o dado da casa','bom');
}
function pararMira(msg){
  if(MIRA.i<0)return;
  MIRA.i=-1;MIRA.hover=null;document.body.classList.remove('mirando');
  MIRA.marcas.forEach(m=>{scene.remove(m);m.geometry.dispose();m.material.dispose()});MIRA.marcas=[];
  if(msg)avisar(msg);
}
function passoMira(){
  if(MIRA.i<0)return;
  const alvos=dadosCasaQuebraveis();
  if(!emLuta()||!alvos.length||(S.cons||[])[MIRA.i]!=='martelo'){pararMira();return}
  while(MIRA.marcas.length<alvos.length){const m=new THREE.Mesh(new THREE.RingGeometry(.85,1.05,40),new THREE.MeshBasicMaterial({color:0xe0574a,transparent:true,opacity:.8,depthWrite:false}));m.rotation.x=-Math.PI/2;scene.add(m);MIRA.marcas.push(m)}
  while(MIRA.marcas.length>alvos.length){const m=MIRA.marcas.pop();scene.remove(m);m.geometry.dispose();m.material.dispose()}
  const t=performance.now()/1000;
  alvos.forEach((d,j)=>{const m=MIRA.marcas[j],h=d===MIRA.hover;m.position.set(d.mesh.position.x,.04,d.mesh.position.z);m.scale.setScalar((h?1.25:1)+Math.sin(t*6+j)*.06);m.material.color.set(h?0xffd27a:0xe0574a);m.material.opacity=h?1:.65+Math.sin(t*6+j)*.2});
}
function dadoCasaSob(e){
  const cv=$('cena'),r=cv.getBoundingClientRect(),ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
  const alvos=dadosCasaQuebraveis(),h=ray.intersectObjects(alvos.map(t=>t.mesh),true)[0];
  if(h){let o=h.object;while(o&&!alvos.some(t=>t.mesh===o))o=o.parent;return alvos.find(t=>t.mesh===o)||null}
  const p=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.5),new THREE.Vector3());
  if(!p)return null;let melhor=null,dm=1.1;
  alvos.forEach(t=>{const d=Math.hypot(t.mesh.position.x-p.x,t.mesh.position.z-p.z);if(d<dm){dm=d;melhor=t}});return melhor;
}
function quebrarComMartelo(t){
  const i=MIRA.i;pararMira();
  if((S.cons||[])[i]!=='martelo')return;
  S.cons.splice(i,1);
  const v=t.valor;t.valor=0;S.rolagem=valorCasa();quebrarDado(t,v);
  if(S.stats)S.stats.consumiveis=(S.stats.consumiveis||0)+1;
  avisar(`O dado da casa quebrou e perdeu ${v}`);hud();placar();renderCons();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&MIRA.i>=0)pararMira('Martelo guardado')});
$('cena').addEventListener('pointermove',e=>{if(MIRA.i<0)return;e.stopImmediatePropagation();MIRA.hover=dadoCasaSob(e);$('cena').style.cursor=MIRA.hover?'pointer':'crosshair'},true);
$('cena').addEventListener('pointerdown',e=>{if(MIRA.i<0)return;e.stopImmediatePropagation();const t=dadoCasaSob(e);if(t)quebrarComMartelo(t);else{SOM.batida(4,true);avisar('Clique num dado da casa, marcado em vermelho. Esc cancela')}},true);
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
  if(k==='martelo'){if(MIRA.i===i)pararMira('Martelo guardado');else mirarMartelo(i);return}
  const c=CONSUMIVEIS[k],slot=document.querySelector(`[data-cons="${i}"]`),de=slot?slot.getBoundingClientRect():null;
  S.cons.splice(i,1);
  const efeito={
    tonico(){const q=cm(12);S.hp=Math.min(S.max,S.hp+q);SOM.cura();pulsar($('barraJ'),'flash');numeroFlutuante(`+${q}`,$('barraJ'),c.cor)},
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
