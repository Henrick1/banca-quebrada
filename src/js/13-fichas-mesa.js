const MESA={fichas:[],bolsa:null,bolsaPulso:0,hover:null};
function ofertasReliquia(n,gratis,bonus=0){return sortear(Object.keys(ITENS).filter(k=>!temItem(k)).map(k=>({kind:'item',chave:k})),n,bonus).map(o=>({kind:'item',chave:o.chave,preco:ITENS[o.chave].preco,id:uid++,gratis}))}
const RAR_FICHA={comum:{borda:'#9a2f2a',lado:'#e9dcc0'},incomum:{borda:'#2f6f9a',lado:'#dfe6ea'},raro:{borda:'#b8862a',lado:'#e8c46a'}};
const rarItem=k=>raridadeOferta({kind:'item',chave:k})||'comum';
function texturaFicha(path,cor,inimigo,rar='comum'){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const base=inimigo?'#2d2236':'#efe4c8',borda=inimigo?'#7a5a96':RAR_FICHA[rar].borda;
  x.fillStyle=base;x.fillRect(0,0,256,256);
  x.save();x.translate(128,128);x.rotate(-Math.PI/2);
  for(let i=0;i<8;i++){x.save();x.rotate(i*Math.PI/4);x.fillStyle=borda;x.fillRect(-15,-128,30,32);x.restore()}
  x.strokeStyle=borda;x.lineWidth=6;x.beginPath();x.arc(0,0,88,0,Math.PI*2);x.stroke();
  x.fillStyle=inimigo?'#1a1220':'#1f1712';x.beginPath();x.arc(0,0,82,0,Math.PI*2);x.fill();
  x.translate(-60,-60);x.scale(120/24,120/24);x.fillStyle=cor;x.fill(new Path2D(path),'evenodd');
  x.restore();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;
}
function criarFicha(path,cor,inimigo,rar='comum'){
  const lado=new THREE.MeshStandardMaterial({color:lin(inimigo?'#4a3560':RAR_FICHA[rar].lado),roughness:rar==='raro'?.35:.5,metalness:rar==='raro'?.5:0});
  const topo=new THREE.MeshStandardMaterial({map:texturaFicha(path,cor,inimigo,rar),roughness:.78});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.14,40),[lado,topo,lado]);m.castShadow=m.receiveShadow=true;return m;
}
function montarFichas(){
  if(!scene)return;
  MESA.fichas.forEach(f=>{scene.remove(f.mesh);f.mesh.traverse(o=>{if(o.isMesh){o.geometry.dispose();[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})});
  MESA.fichas=[];
  const z=TD/2+.4,y=.77;
  const pilha=(path,cor,inimigo,q,rar)=>{const g=new THREE.Group(),topos=[];for(let j=0;j<q;j++){const m=criarFicha(path,cor,inimigo,rar);m.position.y=j*.145;m.rotation.y=rnd(.25);g.add(m);topos.push(m.material[1])}return{g,topos}};
  const sets=Object.keys(CONJUNTOS).filter(conjAtivo),emSet=new Set(sets.flatMap(c=>CONJUNTOS[c].pecas));
  const slots=[...new Set(S.itens)].filter(k=>!emSet.has(k)),porLinha=10;
  MESA.linhas=Math.max(1,Math.ceil(slots.length/porLinha));
  slots.forEach((k,i)=>{
    const lin=Math.floor(i/porLinha),col=i%porLinha,yl=lin?-.44:y,it=ITENS[k];
    const {g,topos}=pilha(pathItem(k),it.cor,false,qtdItem(k),rarItem(k));
    g.position.set(-TW/2+.25+col*.95,yl+3,z+lin*1.0+(lin?.35:0));scene.add(g);
    MESA.fichas.push({mesh:g,topos,tipo:'item',chave:k,y0:yl,pulso:0,cai:1+i*.08});
  });
  sets.forEach((c,i)=>{
    const g=estatuetaConjunto(c),topos=[];g.scale.setScalar(1.44);g.traverse(o=>{if(o.isMesh&&o.material.emissive&&o.material.userData.brilha)topos.push(o.material)});
    const p=posEstatua(i);g.position.set(p.x,p.y+3,p.z);scene.add(g);
    MESA.fichas.push({mesh:g,topos,tipo:'estatua',chave:c,y0:p.y,pulso:0,cai:1.2+i*.15,ord:i});
  });
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
  if(a.tipo==='estatua'){const c=CONJUNTOS[a.chave];return`<h4>Estatueta ${c.nome}<small>Conjunto completo</small></h4><p class="nota" style="color:#f2c661">${c.desc}</p><ul>${c.pecas.map(k=>`<li><b>${ITENS[k].nome}${qtdItem(k)>1?` ×${qtdItem(k)}`:''}:</b> ${ITENS[k].desc}</li>`).join('')}</ul>`}
  if(a.tipo==='item'){const it=ITENS[a.chave],q=qtdItem(a.chave),r=rarItem(a.chave);return`<h4>${it.nome}<small><span style="color:${RARIDADE[r].cor}">${RARIDADE[r].nome}</span> · ${q>1?`${q} na pilha · efeito acumula`:'sua relíquia'}</small></h4><ul><li>${it.desc}</li></ul>${htmlConjunto(a.chave)?`<p class="nota">${htmlConjunto(a.chave)}</p>`:''}`}
  if(a.tipo==='traco'){const tr=TRACOS[a.chave];return`<h4>${tr.nome}<small>Traço da casa</small></h4><ul><li>${tr.desc}</li></ul>`}
  if(!S.ini)return'<h4>Bolsa da casa</h4>';
  const lupa=temItem('lupa')&&S.proxCasa&&S.fase!=='resolvendo'?S.proxCasa:[];
  return`<h4>Bolsa da casa<small>${S.ini.bolsa.length} dados${temaCasa()?' · '+temaCasa().nome.toLowerCase():''}</small></h4>
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
function dispararItem(k,txt){const f=MESA.fichas.find(x=>x.tipo==='item'&&x.chave===k)||MESA.fichas.find(x=>x.tipo==='estatua'&&CONJUNTOS[x.chave].pecas.includes(k));SOM.item();if(!f)return;f.pulso=1;rotuloMesa(txt,f.mesh.position,ITENS[k].cor)}
function dispararTraco(k,txt){const f=MESA.fichas.find(x=>x.tipo==='traco'&&x.chave===k);SOM.traco();if(!f)return;f.pulso=1;rotuloMesa(txt,f.mesh.position,TRACOS[k].cor)}

function posEstatua(i){
  const y=-.51,passo=1.45,col=i%4,lin=Math.floor(i/4);
  if(camera&&camera.aspect<.85)return{x:TW/2+2.1+lin*1.5,y,z:CW/2+1+col*passo};
  return{x:-CW/2-1.1-col*passo-lin*.7,y,z:-TD/2-.8-1.75+.65-lin*1.45};
}
function reposicionarEstatuas(){MESA.fichas.forEach(f=>{if(f.tipo!=='estatua')return;const p=posEstatua(f.ord);f.mesh.position.x=p.x;f.mesh.position.z=p.z})}
function estatuetaConjunto(k){
  const g=new THREE.Group(),H=Math.PI/2;
  const ouro=new THREE.MeshStandardMaterial({color:lin('#d9a840'),metalness:.9,roughness:.28,emissive:new THREE.Color(0,0,0)});ouro.userData.brilha=true;
  const bronze=new THREE.MeshStandardMaterial({color:lin('#6e4a1e'),metalness:.75,roughness:.4});
  const escuro=new THREE.MeshStandardMaterial({color:lin('#2a1c12'),roughness:.6});
  const brilho=(cor)=>new THREE.MeshStandardMaterial({color:lin(cor),emissive:new THREE.Color(cor),emissiveIntensity:.8,roughness:.3});
  const add=(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
  add(new THREE.CylinderGeometry(.4,.43,.09,32),bronze,0,.045);
  add(new THREE.CylinderGeometry(.32,.36,.1,32),escuro,0,.14);
  add(new THREE.TorusGeometry(.34,.018,8,40),ouro,0,.19,0,H);
  const y=.19,base=g.children.length;
  if(k==='trapaceiro'){
    add(new THREE.BoxGeometry(.36,.02,.5),ouro,0,y+.02,0,0,.3,0);
    add(new THREE.BoxGeometry(.36,.02,.5),bronze,.04,y+.045,.02,0,-.2,0);
    const d=add(new THREE.BoxGeometry(.24,.24,.24),ouro,0,y+.2,0,.5,.6,.3);
    [[.121,0,0],[0,.121,0],[0,0,.121]].forEach(([a,b,c])=>{const p=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),escuro);p.position.set(a,b,c);d.add(p)});
  }else if(k==='alquimista'){
    add(new THREE.SphereGeometry(.2,24,16),new THREE.MeshStandardMaterial({color:lin('#cfe9dc'),transparent:true,opacity:.35,roughness:.08,depthWrite:false}),0,y+.22);
    add(new THREE.SphereGeometry(.16,20,14),brilho('#8fd14a'),0,y+.22);
    add(new THREE.CylinderGeometry(.05,.07,.22,14),ouro,0,y+.5);
    add(new THREE.CylinderGeometry(.075,.075,.04,14),ouro,0,y+.62);
  }else if(k==='tesoureiro'){
    for(let i=0;i<4;i++)add(new THREE.CylinderGeometry(.19,.19,.06,28),ouro,(i%2?.02:-.02),y+.035+i*.065,0);
    const cy=y+.33;add(new THREE.CylinderGeometry(.15,.15,.07,20,1,true),ouro,0,cy);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(new THREE.ConeGeometry(.035,.1,8),ouro,Math.cos(a)*.15,cy+.08,Math.sin(a)*.15)}
    add(new THREE.SphereGeometry(.035,10,8),brilho('#e0574a'),0,cy,.152);
  }else if(k==='guerreiro'){
    add(new THREE.CylinderGeometry(.22,.22,.04,28),new THREE.MeshStandardMaterial({color:lin('#9a2f2a'),roughness:.5}),0,y+.26,-.06,H,0,0);
    add(new THREE.TorusGeometry(.22,.025,8,28),ouro,0,y+.26,-.035);
    add(new THREE.BoxGeometry(.07,.52,.03),new THREE.MeshStandardMaterial({color:lin('#e6e9ef'),metalness:.6,roughness:.25}),0,y+.36,.03);
    add(new THREE.BoxGeometry(.24,.04,.05),ouro,0,y+.1,.03);
    add(new THREE.CylinderGeometry(.025,.025,.1,10),escuro,0,y+.04,.03);
  }else if(k==='relojoeiro'){
    add(new THREE.ConeGeometry(.16,.24,20),new THREE.MeshStandardMaterial({color:lin('#e8d9a8'),transparent:true,opacity:.55,roughness:.1}),0,y+.42,0,Math.PI);
    add(new THREE.ConeGeometry(.16,.24,20),new THREE.MeshStandardMaterial({color:lin('#e8d9a8'),transparent:true,opacity:.55,roughness:.1}),0,y+.18);
    add(new THREE.ConeGeometry(.11,.09,16),brilho('#f0c36a'),0,y+.1);
    add(new THREE.CylinderGeometry(.2,.2,.04,20),ouro,0,y+.04);add(new THREE.CylinderGeometry(.2,.2,.04,20),ouro,0,y+.56);
    [0,1,2].forEach(i=>{const a=i/3*Math.PI*2;add(new THREE.CylinderGeometry(.018,.018,.52,8),ouro,Math.cos(a)*.18,y+.3,Math.sin(a)*.18)});
  }else if(k==='viciado'){
    const osso=new THREE.MeshStandardMaterial({color:lin('#efe3c6'),roughness:.45});
    add(new THREE.BoxGeometry(.24,.24,.24),osso,-.03,y+.12,0,0,.4,0);
    add(new THREE.BoxGeometry(.2,.2,.2),ouro,.03,y+.34,.01,.3,1,.2);
    add(new THREE.SphereGeometry(.035,8,6),escuro,-.03,y+.245,0);
  }else if(k==='andarilho'){
    add(new THREE.CylinderGeometry(.14,.16,.05,6),ouro,0,y+.03);
    add(new THREE.CylinderGeometry(.12,.12,.28,6,1,true),new THREE.MeshStandardMaterial({color:lin('#ffd98a'),transparent:true,opacity:.4,side:THREE.DoubleSide}),0,y+.2);
    add(new THREE.SphereGeometry(.06,12,10),brilho('#ffb347'),0,y+.2);
    [0,1,2,3,4,5].forEach(i=>{const a=i/6*Math.PI*2;add(new THREE.CylinderGeometry(.012,.012,.28,6),ouro,Math.cos(a)*.13,y+.2,Math.sin(a)*.13)});
    add(new THREE.ConeGeometry(.15,.1,6),ouro,0,y+.39);
    add(new THREE.TorusGeometry(.07,.014,6,16),ouro,0,y+.49,0,0,0,0);
  }
  const fig=new THREE.Group();fig.position.y=y;g.children.slice(base).forEach(m=>{m.position.y-=y;fig.add(m)});
  fig.rotation.x=-.6;fig.scale.setScalar(1.3);g.add(fig);
  return g;
}
