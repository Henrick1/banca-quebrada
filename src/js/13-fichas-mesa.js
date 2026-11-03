const MESA={fichas:[],bolsa:null,bolsaPulso:0,hover:null};
function ofertasReliquia(n,gratis,bonus=0){return sortear(Object.keys(ITENS).filter(k=>!temItem(k)).map(k=>({kind:'item',chave:k})),n,bonus).map(o=>({kind:'item',chave:o.chave,preco:ITENS[o.chave].preco,id:uid++,gratis}))}
function texturaFicha(path,cor,inimigo){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const base=inimigo?'#2d2236':'#efe4c8',borda=inimigo?'#7a5a96':'#9a2f2a';
  x.fillStyle=base;x.fillRect(0,0,256,256);
  x.save();x.translate(128,128);x.rotate(-Math.PI/2);
  for(let i=0;i<8;i++){x.save();x.rotate(i*Math.PI/4);x.fillStyle=borda;x.fillRect(-15,-128,30,32);x.restore()}
  x.strokeStyle=borda;x.lineWidth=6;x.beginPath();x.arc(0,0,88,0,Math.PI*2);x.stroke();
  x.fillStyle=inimigo?'#1a1220':'#1f1712';x.beginPath();x.arc(0,0,82,0,Math.PI*2);x.fill();
  x.translate(-60,-60);x.scale(120/24,120/24);x.fillStyle=cor;x.fill(new Path2D(path),'evenodd');
  x.restore();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;
}
function criarFicha(path,cor,inimigo){
  const lado=new THREE.MeshStandardMaterial({color:lin(inimigo?'#4a3560':'#e9dcc0'),roughness:.5});
  const topo=new THREE.MeshStandardMaterial({map:texturaFicha(path,cor,inimigo),roughness:.78});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.14,40),[lado,topo,lado]);m.castShadow=m.receiveShadow=true;return m;
}
function montarFichas(){
  if(!scene)return;
  MESA.fichas.forEach(f=>{scene.remove(f.mesh);f.mesh.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})});
  MESA.fichas=[];
  const z=TD/2+.4,y=.77;
  const pilha=(path,cor,inimigo,q)=>{const g=new THREE.Group(),topos=[];for(let j=0;j<q;j++){const m=criarFicha(path,cor,inimigo);m.position.y=j*.145;m.rotation.y=rnd(.25);g.add(m);topos.push(m.material[1])}return{g,topos}};
  const unicos=[...new Set(S.itens)],porLinha=10;
  MESA.linhas=Math.max(1,Math.ceil(unicos.length/porLinha));
  unicos.forEach((k,i)=>{const it=ITENS[k];const {g,topos}=pilha(pathItem(k),it.cor,false,qtdItem(k));const lin=Math.floor(i/porLinha),col=i%porLinha;const yl=lin?-.44:y;g.position.set(-TW/2+.25+col*.95,yl+3,z+lin*1.0+(lin?.35:0));scene.add(g);MESA.fichas.push({mesh:g,topos,tipo:'item',chave:k,y0:yl,pulso:0,cai:1+i*.08})});
  (S.ini?S.ini.tracos:[]).forEach((k,i)=>{const tr=TRACOS[k];const {g,topos}=pilha(PATHS[tr.ic],tr.cor,true,1);g.position.set(TW/2-1.15-i*.95,y+3,-TD/2-.4);scene.add(g);MESA.fichas.push({mesh:g,topos,tipo:'traco',chave:k,y0:y,pulso:0,cai:1.4+i*.25})});
  ajustar();
}
function criarBolsaCasa(){
  const pts=[[0,0],[.5,.04],[.66,.25],[.66,.55],[.52,.82],[.3,.98],[.24,1.04],[.3,1.12],[.42,1.28],[.3,1.34],[0,1.3]].map(p=>new THREE.Vector2(p[0],p[1]));
  const g=new THREE.Group();
  const corpo=new THREE.Mesh(new THREE.LatheGeometry(pts,28),new THREE.MeshStandardMaterial({color:lin('#5a3462'),roughness:.85,side:THREE.DoubleSide}));
  corpo.castShadow=corpo.receiveShadow=true;g.add(corpo);
  const laco=new THREE.Mesh(new THREE.TorusGeometry(.26,.05,10,24),new THREE.MeshStandardMaterial({color:'#d4a94f',metalness:.6,roughness:.35}));
  laco.rotation.x=Math.PI/2;laco.position.y=1.03;g.add(laco);
  g.position.set(TW/2+.4,.76,-TD/2-.4);g.scale.setScalar(.95);
  scene.add(g);MESA.bolsa=g;
}
function infoEm(html,x,y){
  const el=$('info');el.innerHTML=html;el.hidden=false;
  const r=el.getBoundingClientRect();
  let left=x+18;if(left+r.width>innerWidth-12)left=x-18-r.width;
  const top=Math.max(12,Math.min(innerHeight-r.height-12,y-r.height/2));
  el.style.left=Math.max(12,left)+'px';el.style.top=top+'px';
}
function htmlMesa(a){
  if(a.tipo==='alavanca')return`<h4>Alavanca<small>${podeParar()?'Pronta':'Travada'}</small></h4><ul><li>Para seus lances e conta a soma agora. Só destrava depois que a casa lança, no modo Estouro.</li><li>Teto desta rodada: <b>${Number.isFinite(tetoAtual())&&casaRestantes()===0?tetoAtual():'?'}</b></li></ul>`;
  if(a.tipo==='item'){const it=ITENS[a.chave],q=qtdItem(a.chave);return`<h4>${it.nome}<small>${q>1?`${q} na pilha · efeito acumula`:'Sua relíquia'}</small></h4><ul><li>${it.desc}</li></ul>${htmlConjunto(a.chave)?`<p class="nota">${htmlConjunto(a.chave)}</p>`:''}`}
  if(a.tipo==='traco'){const tr=TRACOS[a.chave];return`<h4>${tr.nome}<small>Traço da casa</small></h4><ul><li>${tr.desc}</li></ul>`}
  if(!S.ini)return'<h4>Bolsa da casa</h4>';
  const lupa=temItem('lupa')&&S.proxCasa&&S.fase!=='resolvendo'?S.proxCasa:[];
  return`<h4>Bolsa da casa<small>${S.ini.bolsa.length} dados</small></h4>
    <p class="nota">A casa sorteia ${temTraco('duplo')?'2 dados':'1 dado'} desta bolsa a cada rodada.</p>
    ${S.ini.bolsa.map(d=>`<div class="dc${lupa.includes(d)?' prox':''}">${svgTipo(d.type,d.cor||CASA.cor)}<b>${d.nome}</b>${lupa.includes(d)?'<em>Vai sair</em>':'<span></span>'}<span class="faces">${d.faces.map((_,i)=>chip(d,i)).join('')}</span>${d.area?`<span class="nota" style="grid-column:1/-1;color:${d.area.cor}"><b>${d.area.nome}:</b> ${descArea(d.area)}</span>`:''}</div>`).join('')}
    ${temItem('lupa')?'':'<p class="nota">Com a Lupa do Trapaceiro você vê qual dado vai sair.</p>'}`;
}
function iniciarHoverMesa(){
  const cv=$('cena'),ray=new THREE.Raycaster();
  const achar=e=>{
    const r=cv.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
    const h=ray.intersectObjects([...MESA.fichas.map(f=>f.mesh),MESA.bolsa,...(CONT?[CONT.alav]:[])],true);if(!h.length)return null;
    let o=h[0].object;
    for(let q=o;q;q=q.parent)if(CONT&&q===CONT.alav&&CONT.alav.scale.x>.5)return{tipo:'alavanca'};
    while(o&&o!==MESA.bolsa&&!MESA.fichas.some(f=>f.mesh===o))o=o.parent;
    if(o===MESA.bolsa)return{tipo:'bolsa'};
    return MESA.fichas.find(f=>f.mesh===o)||null;
  };
  const mostrar=(a,e)=>{
    if(!a){if(MESA.hover){MESA.hover=null;esconderInfo();cv.style.cursor=''}return}
    MESA.hover=a;cv.style.cursor='help';infoEm(htmlMesa(a),e.clientX,e.clientY);
  };
  cv.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')mostrar(achar(e),e)});
  cv.addEventListener('pointerleave',()=>mostrar(null));
  cv.addEventListener('pointerdown',e=>{
    const a=achar(e);
    if(!a){if(MESA.hover)mostrar(null);return}
    mostrar(a,e);
    if(a.tipo==='alavanca'){if(podeParar())parar();else{CONT.alav.tranco=1;SOM.batida(4,true)}return}
    if(a.tipo==='bolsa'){MESA.bolsaPulso=.6;SOM.guardar()}else{a.pulso=.7;SOM.batida(5,false)}
  });
}
function rotuloMesa(txt,pos,cor){
  const p=telaDe(new THREE.Vector3(pos.x,pos.y+.6,pos.z));
  const n=document.createElement('div');n.className='flut mini';n.textContent=txt;n.style.color=cor;n.style.left=p.x+'px';n.style.top=p.y+'px';document.body.appendChild(n);
  n.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:0},{transform:'translate(-50%,-80%) scale(1.2)',opacity:1,offset:.2},{transform:'translate(-50%,-260%) scale(1)',opacity:0}],{duration:reduzir?600:1300,easing:'ease-out'}).onfinish=()=>n.remove();
}
function dispararItem(k,txt){const f=MESA.fichas.find(x=>x.tipo==='item'&&x.chave===k);SOM.item();if(!f)return;f.pulso=1;rotuloMesa(txt,f.mesh.position,ITENS[k].cor)}
function dispararTraco(k,txt){const f=MESA.fichas.find(x=>x.tipo==='traco'&&x.chave===k);SOM.traco();if(!f)return;f.pulso=1;rotuloMesa(txt,f.mesh.position,TRACOS[k].cor)}

