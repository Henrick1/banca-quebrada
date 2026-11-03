const MOEDA=`<svg viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="${PATHS.ouro}"/></svg>`;
const BOLSA_MAX=8,BOLSA_MIN=4;
const RARIDADE={comum:{nome:'Comum',cor:'#cdbf9f'},incomum:{nome:'Incomum',cor:'#6fb7e0'},raro:{nome:'Raro',cor:'#f0bf4a'}};
const RAR_CONS={tonico:'comum',peso:'comum',faca:'incomum',frasco:'incomum',martelo:'incomum',maoLeve:'raro'};
function raridadeOferta(o){
  const k=o.kind;
  if(k==='dado')return o.tipo==='d20'?'raro':o.tipo==='d10'?'incomum':'comum';
  if(k==='bonus')return o.n>=3?'raro':o.n===2?'incomum':'comum';
  if(k==='fx')return o.fx.k==='dobro'?'raro':(o.fx.k==='fogo'||o.fx.k==='veneno')?'incomum':'comum';
  if(k==='polir')return'raro';
  if(k==='pacto'||k==='sombria')return'incomum';
  if(k==='item'){const p=ITENS[o.chave].preco;return p>=12?'raro':p>=10?'incomum':'comum'}
  if(k==='encanto'){const p=ENCANTOS[o.chave].preco;return p>=9?'raro':p>=8?'incomum':'comum'}
  if(k==='cons')return RAR_CONS[o.chave]||'comum';
  return null;
}
function pesoRaridade(r,bonus=0){
  const p=Math.min(1,Math.max(0,(S.linha||0)/(MAPA_LINHAS-1)))+bonus;
  return r==='raro'?6+22*p:r==='incomum'?26+12*p:r==='comum'?68-34*p:30;
}
function sortear(lista,n,bonus=0){
  const pool=lista.slice(),out=[];
  while(out.length<n&&pool.length){
    const ws=pool.map(o=>pesoRaridade(raridadeOferta(o),bonus)),tot=ws.reduce((a,b)=>a+b,0);
    let r=R()*tot,i=0;while(i<ws.length-1&&(r-=ws[i])>0)i++;
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}
const htmlRaridade=o=>{const r=raridadeOferta(o);return r?`<b class="rar" style="color:${RARIDADE[r].cor}">${RARIDADE[r].nome}</b> · `:''};
function embaralhar(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function poolGravacoes(){
  const k=Math.floor(S.andar/3);
  return[
    {kind:'bonus',n:1,preco:3},{kind:'bonus',n:2,preco:5},{kind:'bonus',n:3+k,preco:8},
    {kind:'fx',fx:{k:'dobro'},preco:8},{kind:'fx',fx:{k:'escudo',n:3+k},preco:5},{kind:'fx',fx:{k:'cura',n:3+k},preco:5},
    {kind:'fx',fx:{k:'veneno',n:2+k},preco:6},{kind:'fx',fx:{k:'fogo',n:4+k},preco:6},{kind:'fx',fx:{k:'ouro',n:2+k},preco:4},{kind:'pacto',preco:4},{kind:'sombria',preco:6},{kind:'polir',preco:9},{kind:'polir',preco:9}
  ];
}
function ofertaCons(k,gratis){return{kind:'cons',chave:k,preco:CONSUMIVEIS[k].preco,id:uid++,gratis}}
function ofertaDado(t,gratis){return{kind:'dado',tipo:t,preco:DIE[t].preco,id:uid++,gratis}}
function tiposDado(n,bonus=0){return sortear(['coin','d6','d10','d20'].map(t=>({kind:'dado',tipo:t})),n,bonus).map(o=>o.tipo)}
function gerarEstoque(){
  const L=S.loja;
  L.dados=tiposDado(3).map(t=>ofertaDado(t,false));
  L.grav=sortear(poolGravacoes(),4).map(o=>({...o,id:uid++}));
  L.reliq=ofertasReliquia(2,false);
  L.cons=sortear(Object.keys(CONSUMIVEIS).map(k=>({kind:'cons',chave:k})),2).map(o=>ofertaCons(o.chave,false));
  L.enc=sortear(Object.keys(ENCANTOS).map(k=>({kind:'encanto',chave:k,preco:ENCANTOS[k].preco})),3).map(o=>({...o,id:uid++,gratis:false}));
  L.serv.forEach(o=>{if(o.kind!=='renovar')o.feito=false});
}
function montarLoja(op){
  S.fase='loja';S.retomar=renderLoja;
  const esp=op.espolio||[];
  S.loja={titulo:op.titulo,sub:op.sub,ganho:op.ganho||0,espolio:esp,pegou:!esp.length,pulou:false,podeTrocar:!!op.podeTrocar,mercador:!!op.mercador,
    dados:[],grav:[],reliq:[],enc:[],cons:[],serv:op.mercador?[{kind:'cura',n:12,preco:5,id:uid++},{kind:'queimar',preco:4,id:uid++},{kind:'fundir',preco:7,id:uid++},{kind:'renovar',id:uid++}]:[],renov:0,sel:null,foco:null};
  if(op.mercador)gerarEstoque();
  renderLoja();
}
function abrirRecompensa(ganho,elite){
  const bonus=elite?.35:0;
  const esp=sortear(poolGravacoes().filter(o=>o.kind!=='pacto'&&o.kind!=='sombria'),2,bonus).map(o=>({...o,id:uid++,gratis:true}));
  const extra=elite?ofertasReliquia(1,true,bonus)[0]:null;
  esp.splice(Math.floor(R()*3),0,extra||ofertaDado(tiposDado(1,bonus)[0],true));
  if(elite||R()<.4)esp.splice(esp.findIndex(o=>o.kind!=='item'&&o.kind!=='dado'),1,ofertaCons(sortear(Object.keys(CONSUMIVEIS).map(k=>({kind:'cons',chave:k})),1,bonus)[0].chave,true));
  montarLoja({titulo:S.ini&&S.ini.chefe?`Fim do ${['primeiro','segundo','terceiro'][atoDe(S.linha)]} ato`:elite?'Elite derrotado':'Vitória',sub:`${S.ini.nome} pagou ${ganho} de ouro. Leve um item do espólio${elite?': uma relíquia está garantida':''}.`,ganho,espolio:esp,podeTrocar:true});
}
function abrirMercado(){montarLoja({titulo:'Mercador',sub:'Gaste seu ouro no balcão. Encantamentos e gravações você aplica no dado que escolher.',mercador:true})}
function precoDe(o){return o.kind==='renovar'?2+S.loja.renov:o.preco}
function mediaDado(d){return(d.faces.reduce((s,f)=>s+valorFace(f),0)/d.faces.length).toFixed(1).replace('.',',')}
function iconeFx(k,cor){return`<svg viewBox="0 0 24 24"><path fill="${cor}" fill-rule="evenodd" d="${PATHS[k]}"/></svg>`}
function infoOferta(o){
  if(o.kind==='encanto'){const en=ENCANTOS[o.chave];return{tipo:'Encantamento · você escolhe o dado',tit:`${en.nome}: ${en.combo}`,desc:`Só a moldura: depois de comprar, você escolhe um dado da sua bolsa para receber as bordas de ${en.nome.toLowerCase()}. ${en.desc} Troca o encantamento que o dado já tiver.`,ic:`<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="${en.cor}" stroke-width="3.2"/><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#0006" stroke-width=".8"/></svg>`}}
  if(o.kind==='cons'){const c=CONSUMIVEIS[o.chave];return{tipo:`Consumível · vai para o bolso, usa uma vez na luta (${(S.cons||[]).length}/${consMax()})`,tit:c.nome,desc:c.desc,ic:svgPath(o.chave,c.cor)}}
  if(o.kind==='item'){const it=ITENS[o.chave];return{tipo:'Relíquia · fica na mesa',tit:it.nome,desc:it.desc+' '+htmlConjunto(o.chave),ic:svgPath(ITEM_ICONE[o.chave]||o.chave,it.cor)}}
  if(o.kind==='dado'){
    const d=DIE[o.tipo];const fake=novoDado(o.tipo);
    const faces=d.faces.length<=6?`<span class="faces">${fake.faces.map((_,i)=>chip(fake,i)).join('')}</span>`:`Faces de 1 a ${d.faces.length}.`;
    return{tipo:'Dado novo',tit:d.nome,desc:`Média ${mediaDado(fake)}. ${faces}`,ic:svgTipo(o.tipo)};
  }
  if(o.kind==='bonus')return{tipo:'Gravação · 1 face',tit:`+${o.n} numa face`,desc:`A face escolhida passa a valer ${o.n} a mais. Soma com bônus anteriores.`,ic:iconeFx('cura','#d4a94f')};
  if(o.kind==='fx'){
    const f=FX[o.fx.k];const d=f.desc(o.fx.n);
    return{tipo:'Gravação · 1 face',tit:`${f.nome}${o.fx.n?' '+o.fx.n:''}`,desc:`Quando essa face cair: ${d}. Troca o efeito que a face já tiver.`,ic:o.fx.k==='dobro'?'<b class="x2">×2</b>':iconeFx(o.fx.k,f.cor)};
  }
  if(o.kind==='polir')return{tipo:'Polimento · você escolhe o dado',tit:'+1 em todas as faces',desc:'Escolha um dado da bolsa: todas as faces dele passam a valer 1 a mais.',ic:iconeFx('cura','#f2c661')};
  if(o.kind==='pacto')return{tipo:'Gravação maldita · 1 face',tit:'Pacto de Sangue',desc:'A face ganha +5, mas sempre que ela cair você perde 2 de vida.',ic:iconeFx('pacto','#d9334a')};
  if(o.kind==='sombria')return{tipo:'Gravação maldita · 1 face',tit:'Face Sombria',desc:'A face passa a valer −3, mas ganha Fogo 10. Ótima para não estourar no modo Estouro.',ic:iconeFx('fogo','#9b6fe0')};
  if(o.kind==='fundir')return{tipo:'Serviço',tit:'Fundir dois dados',desc:'Escolha dois dados do mesmo tipo. O novo dado fica com o melhor de cada face, +1 em todas e o encantamento de um deles.',ic:svgPath('dupla','#d9774a')};
  if(o.kind==='cura')return{tipo:'Serviço',tit:'Curativo',desc:`Recupera ${o.n} de vida agora.`,ic:iconeFx('cura','#86c48f')};
  if(o.kind==='queimar')return{tipo:'Serviço',tit:'Queimar um dado',desc:'Tira um dado da bolsa para sempre. Bolsa menor, sorteios mais previsíveis.',ic:iconeFx('fogo','#e5803f')};
  return{tipo:'Serviço',tit:'Renovar estoque',desc:'Troca os dados e as gravações à venda. Fica mais caro a cada uso.',ic:`<svg viewBox="0 0 24 24"><path fill="none" stroke="#d4a94f" stroke-width="2.4" stroke-linecap="round" d="M19 8 A8 8 0 1 0 20 13 M19 3 V8 H14"/></svg>`};
}
function estadoOferta(o){
  const L=S.loja,p=precoDe(o);
  if(o.feito)return{txt:o.gratis?'Escolhido':'Comprado',cls:'feito',trava:true};
  if(o.gratis&&L.pegou)return{txt:L.pulou?'Espólio trocado por ouro':'Você já escolheu outro',trava:true};
  if(o.kind==='fundir'&&!paresFundiveis().length&&!o.feito)return{txt:'Você não tem dois dados iguais',trava:true};
  if(L.sel===o)return{txt:o.kind==='fundir'?'Escolha os dois dados na bolsa':(o.kind==='queimar'||o.kind==='encanto'||o.kind==='polir')?'Clique no dado na bolsa':'Clique na face na bolsa',cls:'ok'};
  if(o.kind==='dado'&&S.dados.length>=bolsaMax())return{txt:'Bolsa cheia',trava:true};
  if(o.kind==='item'&&temItem(o.chave)&&!S.teste)return{txt:'Você já tem',trava:true};
  if(o.kind==='cons'&&(S.cons||[]).length>=consMax())return{txt:'Bolso cheio',trava:true};
  if(o.kind==='item'&&S.itens.length>=itensMax())return{txt:'Canto da mesa cheio',trava:true};
  if(o.kind==='cura'&&S.hp>=S.max)return{txt:'Vida cheia',trava:true};
  if(o.kind==='queimar'&&S.dados.length<=BOLSA_MIN)return{txt:`Mínimo de ${BOLSA_MIN} dados`,trava:true};
  if(!o.gratis&&S.ouro<p)return{txt:`Faltam ${p-S.ouro} de ouro`,trava:true};
  return{txt:'',trava:false};
}
function cartaOferta(o){
  const x=infoOferta(o),e=estadoOferta(o),sel=S.loja.sel===o;
  const preco=o.gratis?'<span class="o-preco gratis">Grátis</span>':`<span class="o-preco">${MOEDA}${precoDe(o)}</span>`;
  return`<button class="oferta${sel?' sel':''}" data-o="${o.id}" ${e.trava?'disabled':''} aria-pressed="${sel}">
    <span class="o-ic">${x.ic}</span>
    <span class="o-corpo"><span class="o-tipo">${x.tipo}</span><span class="o-tit">${x.tit}</span><span class="o-desc">${x.desc}</span>${e.txt?`<span class="o-motivo ${e.cls||''}">${e.txt}</span>`:''}</span>
    ${preco}</button>`;
}
let LJ=null;
const LJ_SECOES=[['espolio','Espólio','#5a1f24'],['reliq','Relíquias','#1f2f4a'],['cons','Consumíveis','#3d2a18'],['dados','Dados','#1e4a46'],['enc','Encantamentos','#35234a'],['grav','Gravações','#4a3520'],['serv','Serviços','#2c2a28']];
function renderLoja(){
  const L=S.loja;
  if(!$('lojaShell'))criarShellLoja();
  if(!L.foco)L.foco=L.espolio.find(o=>!o.feito)||L.espolio[0]||L.dados[0]||L.serv[0];
  if(L.flash&&L.flash.die)L.verDado=L.flash.die;
  if(!S.dados.some(d=>d.id===L.verDado))L.verDado=S.dados[0]&&S.dados[0].id;
  const prox=INIMIGOS[S.andar];
  $('ljTopo').innerHTML=`<div><h2>${L.titulo}</h2><p class="sub">${L.sub}</p></div>
    <div class="status"><span class="pilula"><small>Vida</small>${S.hp}/${S.max}</span><span class="pilula ouro">${MOEDA}${S.ouro}</span></div>`;
  renderBolsaLoja();renderDetalhe();
  $('ljRodape').innerHTML=`<div class="proximo"><svg class="tipo" viewBox="0 0 24 24"><path fill="#d4a94f" fill-rule="evenodd" d="${PATHS.baralho}"/></svg><div><small>Andar ${(S.linha||0)+1} de ${MAPA_LINHAS}</small><strong>${L.titulo}</strong></div></div>
    <div class="acoes">${L.mercador||L.pegou?'<button class="btn" data-acao="mapa">Voltar ao mapa</button>':'<span class="pendente">Escolha um item do espólio ou troque por ouro</span>'}</div>`;
  sincronizarLoja3D();
  L.flash=null;
  salvarPartida();
  if(L.ouroVisto!=null&&L.ouroVisto!==S.ouro)pulsar(document.querySelector('.pilula.ouro'));
  L.ouroVisto=S.ouro;
}
function criarShellLoja(){
  $('overlay').innerHTML=`<div class="loja" id="lojaShell">
    <div class="loja-topo" id="ljTopo"></div>
    <div class="loja-corpo">
      <aside class="loja-bolsa" id="ljBolsa"></aside>
      <div class="balcao"><div class="balcao-cena" id="ljCenaBox"><canvas id="lojaCena"></canvas></div><div class="detalhe" id="ljDetalhe" aria-live="polite"></div></div>
    </div>
    <footer class="loja-rodape" id="ljRodape"></footer>
  </div>`;
  $('overlay').hidden=false;$('overlay').scrollTop=0;
  try{iniciarLoja3D()}catch(e){console.error(e)}
}
function renderBolsaLoja(){
  const L=S.loja,sel=L.sel,el=$('ljBolsa');if(!el)return;
  const modoFace=sel&&['bonus','fx','pacto','sombria'].includes(sel.kind),modoEncanto=sel&&(sel.kind==='encanto'||sel.kind==='polir'),modoFundir=sel&&sel.kind==='fundir',modoQueimar=sel&&(sel.kind==='queimar'||modoEncanto||modoFundir);
  const pares=modoFundir?paresFundiveis():[],dA=modoFundir&&L.fundirA&&S.dados.find(x=>x.id===L.fundirA);
  const guia=modoFace?`<p class="guia ativa">Aplicando <b>${infoOferta(sel).tit}</b>. Escolha o dado e clique na face. Esc cancela.<span id="previa">Passe o mouse numa face para ver o resultado.</span></p>`
    :modoFundir?`<p class="guia ativa">${dA?`Agora escolha outro <b>${DIE[dA.type].nome}</b> para fundir.`:'Escolha o primeiro dos dois dados iguais.'} O novo dado fica com o melhor de cada face e +1 em todas. Esc cancela.</p>`
    :modoEncanto?`<p class="guia ativa">Clique no dado que vai receber <b>${sel.kind==='polir'?'+1 em todas as faces':ENCANTOS[sel.chave].nome}</b>. Esc cancela.</p>`
    :modoQueimar?`<p class="guia ativa">Clique no dado que vai sair da bolsa para sempre. Esc cancela.</p>`:'';
  const tiles=S.dados.map(d=>{
    const en=d.encanto&&ENCANTOS[d.encanto],ver=d.id===L.verDado,novo=L.flash&&L.flash.die===d.id&&L.flash.face==null?' novo':'';
    const alvo=modoFundir?`data-fundir="${d.id}"`:modoQueimar?`data-queimar="${d.id}"`:`data-dsel="${d.id}"`;
    const off=modoFundir&&(dA?d.type!==dA.type:!pares.includes(d.type))?' off':'',selF=modoFundir&&dA&&dA.id===d.id;
    return`<button class="tile${(ver&&!modoQueimar)||selF?' sel':''}${novo}${off}${d.fundido?' fundido':''}" ${alvo} style="--c:${en?en.ui:'transparent'}" title="${DIE[d.type].nome}${en?' · '+en.nome:''} · média ${mediaDado(d)}">${svgTipo(d.type)}<small>${mediaDado(d)}</small></button>`;
  }).join('');
  const d=S.dados.find(x=>x.id===L.verDado);
  let ver='';
  if(d&&!modoQueimar){
    const en=d.encanto&&ENCANTOS[d.encanto];
    ver=`<div class="dado-ver"><div class="n"><span>${svgTipo(d.type)} ${DIE[d.type].nome}${d.fundido?' fundido':''}${en?`<span class="enc-tag" style="--c:${en.ui}">${en.nome}</span>`:''}</span><span class="m">média ${mediaDado(d)}</span></div>
      <span class="faces">${d.faces.map((_,i)=>modoFace?chip(d,i,`role="button" tabindex="0" data-d="${d.id}" data-f="${i}"`,'alvo'):chip(d,i,'',L.flash&&L.flash.die===d.id&&L.flash.face===i?'gravada':'')).join('')}</span>
      ${en?`<p class="nota" style="color:${en.ui}"><b>${en.combo}:</b> ${en.desc}</p>`:''}</div>`;
  }
  el.className='loja-bolsa'+(modoFace||modoQueimar?' ativa':'');
  el.innerHTML=`<div class="lb-sec"><h3>Relíquias <span>${S.itens.length}/${itensMax()}</span></h3>
      <div class="reliq-lista">${S.itens.length?[...new Set(S.itens)].map(k=>`<span class="reliq${L.flash&&L.flash.item===k?' nova':''}" title="${ITENS[k].nome}: ${ITENS[k].desc}">${svgPath(ITEM_ICONE[k]||k,ITENS[k].cor)}</span>`).join(''):'<small>Nenhuma ainda.</small>'}</div></div>
    <div class="lb-sec"><h3>Sua bolsa <span>${S.dados.length}/${bolsaMax()}</span></h3>${guia}
      <div class="grade-dados">${tiles}</div>${ver}</div>`;
}
function renderDetalhe(){
  const el=$('ljDetalhe');if(!el||!S.loja)return;
  const L=S.loja,o=L.sel||L.foco;
  if(!o){el.innerHTML='<p class="det-dica">Toque num item do balcão para ver o que ele faz.</p>';return}
  const x=infoOferta(o),e=estadoOferta(o),p=precoDe(o),sel=L.sel===o,fixo=true;
  const rot=sel?'Cancelar':o.gratis?'Pegar grátis':o.kind==='renovar'?`Renovar · ${p} de ouro`:`Comprar · ${p} de ouro`;
  el.innerHTML=`<div class="det-ic">${x.ic}</div>
    <div class="det-corpo"><span class="o-tipo">${htmlRaridade(o)}${x.tipo}${o.gratis?' · espólio':''}</span><b class="det-tit">${x.tit}</b><p>${x.desc}</p>${e.txt?`<span class="o-motivo ${e.cls||''}">${e.txt}</span>`:''}</div>
    <div class="det-acao">${fixo?`<button class="btn" data-o="${o.id}" ${e.trava&&!sel?'disabled':''}>${rot}</button>`:'<small class="det-nota">Clique no item para escolher</small>'}${fixo&&o.gratis&&!L.pegou&&L.podeTrocar?'<button class="btn sec fino" data-acao="pular">Trocar espólio por 3 de ouro</button>':''}</div>`;
}
function iniciarLoja3D(){
  if(LJ){cancelAnimationFrame(LJ.raf);if(LJ.ro)LJ.ro.disconnect();LJ.r.dispose();LJ=null}
  const cv=$('lojaCena');
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  r.setPixelRatio(pxQualidade());r.shadowMap.enabled=qualidade().sombra;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;
  const sc=new THREE.Scene();sc.background=new THREE.Color('#120c08');sc.fog=new THREE.Fog('#120c08',40,80);
  const cam=new THREE.PerspectiveCamera(34,1,.1,200);
  sc.add(new THREE.HemisphereLight(lin('#f6e7c9'),lin('#1a110b'),.5));
  const sol=new THREE.SpotLight('#ffdcaa',2.3,120,Math.PI/3.6,.8,1);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);sol.shadow.bias=-.0005;sc.add(sol,sol.target);
  const fill=new THREE.DirectionalLight('#9fb2d6',.25);fill.position.set(8,10,-8);sc.add(fill);
  const balcao=new THREE.Mesh(new THREE.PlaneGeometry(90,70),matMadeira(5,4,'#ad8566',{rough:.6,relevo:.04}));balcao.rotation.x=-Math.PI/2;balcao.receiveShadow=true;sc.add(balcao);
  const anel=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,10,64),new THREE.MeshBasicMaterial({color:'#f2c661',transparent:true,opacity:.95}));anel.rotation.x=-Math.PI/2;anel.position.y=.09;anel.visible=false;sc.add(anel);
  LJ={r,sc,cam,sol,anel,mapa:new Map(),deco:[],assin:'',hover:null,t:0,raf:0,ray:new THREE.Raycaster(),part:[],modo:null,iniciado:false};
  LJ.ro=new ResizeObserver(ajustarLoja3D);LJ.ro.observe($('ljCenaBox'));ajustarLoja3D();
  const achar=e=>{
    const rc=cv.getBoundingClientRect();
    LJ.ray.setFromCamera(new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1),LJ.cam);
    const h=LJ.ray.intersectObjects([...LJ.mapa.values()].filter(g=>!g.userData.fora),true);
    for(const x of h){let o=x.object;while(o&&!(o.userData&&o.userData.oferta))o=o.parent;if(o&&!o.userData.indisp)return o.userData.oferta}
    return null;
  };
  cv.addEventListener('pointermove',e=>{
    if(!LJ)return;const o=achar(e);if(o===LJ.hover)return;
    LJ.hover=o;$('ljCenaBox').classList.toggle('mao',!!o);clearTimeout(LJ.tFoco);
    if(o&&S.loja&&S.loja.foco!==o){S.loja.foco=o;SOM.batida(2.5,false,.4);renderDetalhe()}
  });
  cv.addEventListener('pointerleave',()=>{if(LJ){clearTimeout(LJ.tFoco);LJ.hover=null;$('ljCenaBox').classList.remove('mao')}});
  cv.addEventListener('click',e=>{if(!LJ)return;const o=achar(e);if(!o)return;S.loja.foco=o;SOM.batida(6,o.kind==='item'||o.kind==='bonus'||o.kind==='fx');const g=LJ.mapa.get(o.id);if(g)g.userData.pulo=1;renderDetalhe()});
  let ult=performance.now();
  const loop=t=>{
    if(!LJ)return;
    if(!$('lojaCena')||S.fase!=='loja'){if(LJ.ro)LJ.ro.disconnect();LJ.r.dispose();LJ=null;return}
    const dt=Math.min(.05,(t-ult)/1000);ult=t;animarLoja3D(dt);LJ.r.render(LJ.sc,LJ.cam);LJ.raf=requestAnimationFrame(loop);
  };
  LJ.raf=requestAnimationFrame(loop);
}
function ajustarLoja3D(){
  if(!LJ)return;const box=$('ljCenaBox');if(!box)return;const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;
  if(w===LJ.w&&h===LJ.h)return;LJ.w=w;LJ.h=h;
  LJ.r.setSize(w,h,false);LJ.cam.aspect=w/h;
  LJ.modo=w/h;if(S.loja)sincronizarLoja3D();
  enquadrarLoja();
}
function enquadrarLoja(){
  const b=LJ&&LJ.limites;if(!b)return;
  const el=.98,t=Math.tan(THREE.MathUtils.degToRad(LJ.cam.fov/2));
  const hw=(b.x1-b.x0)/2+.7,hd=(b.z1-b.z0)/2,cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2;
  const d=Math.max(hw/(t*LJ.cam.aspect),(hd*Math.sin(el)+.9)/t)+1.5;
  LJ.cam.position.set(cx,d*Math.sin(el),cz+d*Math.cos(el));LJ.cam.lookAt(cx,.35,cz);LJ.cam.updateProjectionMatrix();
  LJ.sol.position.set(cx-7,24,cz+9);LJ.sol.target.position.set(cx,0,cz);
}
function layoutLoja(secs,grupos,aspecto,SP,GAP,PZ){
  const larg=l=>l.reduce((a,x)=>a+x.itens.length*SP,0)+GAP*(l.length-1);
  const custo=ls=>Math.max((Math.max(...ls.map(larg))/2+.7)/aspecto,(ls.length*PZ/2)*Math.sin(.98)+.9);
  const fixo=grupos.map(gr=>secs.filter(x=>gr.includes(x.k))).filter(l=>l.length);
  let melhor=fixo,mc=custo(fixo);
  const limites=[...new Set(secs.map(x=>x.itens.length*SP).concat(fixo.map(larg)))];
  for(let a=0;a<secs.length;a++)for(let b=a;b<secs.length;b++)limites.push(larg(secs.slice(a,b+1)));
  for(const L of limites){
    const ls=[];let cur=[];
    for(const x of secs){if(cur.length&&larg([...cur,x])>L+1e-6){ls.push(cur);cur=[]}cur.push(x)}
    if(cur.length)ls.push(cur);
    const c=custo(ls);if(c<mc-1e-6){mc=c;melhor=ls}
  }
  return melhor;
}
function sincronizarLoja3D(){
  if(!LJ||!S.loja)return;const L=S.loja;
  const secs=LJ_SECOES.map(([k,nome,cor])=>({k,nome,cor,itens:L[k]||[]})).filter(x=>x.itens.length);
  const grupos=[['espolio','reliq','cons'],['dados','enc'],['grav','serv']];
  const SP=1.9,GAP=1.1,PZ=3.15,pos=new Map(),decos=[];
  const linhas=layoutLoja(secs,grupos,typeof LJ.modo==='number'?LJ.modo:1.6,SP,GAP,PZ);
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  linhas.forEach((lin,ri)=>{
    const z=(ri-(linhas.length-1)/2)*PZ;
    const larg=lin.reduce((a,x)=>a+x.itens.length*SP,0)+GAP*(lin.length-1);
    let x=-larg/2;
    lin.forEach(sec=>{
      const w=sec.itens.length*SP;decos.push({nome:sec.nome,cor:sec.cor,cx:x+w/2,z,w});
      sec.itens.forEach((o,i)=>pos.set(o.id,{x:x+SP/2+i*SP,z}));
      x+=w+GAP;
    });
    x0=Math.min(x0,-larg/2);x1=Math.max(x1,larg/2);z0=Math.min(z0,z-1.55);z1=Math.max(z1,z+1.4);
  });
  LJ.limites={x0,x1,z0,z1};
  const assin=decos.map(d=>d.nome+d.w+d.z).join(',');
  if(assin!==LJ.assin){
    LJ.assin=assin;
    LJ.deco.forEach(m=>{LJ.sc.remove(m);m.geometry.dispose();if(m.material.map)m.material.map.dispose();if(m.material.bumpMap)m.material.bumpMap.dispose();m.material.dispose()});LJ.deco=[];
    decos.forEach(criarSecaoLoja);enquadrarLoja();
  }
  const todas=todasOfertas(),vivos=new Set();
  for(const [id,p] of pos){
    const o=todas.find(x=>x.id===id);if(!o)continue;vivos.add(id);
    let g=LJ.mapa.get(id);
    if(!g){g=criarItemLoja(o);g.position.set(p.x,reduzir?0:4+(LJ.iniciado?Math.random()*2:LJ.mapa.size*.45),p.z);g.userData.caindo=!reduzir;LJ.sc.add(g);LJ.mapa.set(id,g)}
    g.userData.alvo=p;g.userData.oferta=o;
    atualizarItemLoja(g);
  }
  for(const [id,g] of LJ.mapa)if(!vivos.has(id)&&!g.userData.fora){g.userData.fora=true;g.userData.t0=LJ.t}
  LJ.iniciado=true;
}
function texturaTapete(cor,w,h,franja){
  const px=140,W=Math.round((w+franja*2)*px),H=Math.round(h*px),F=Math.round(franja*px);
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const base=new THREE.Color(cor),hsl={};base.getHSL(hsl);
  const tom=(dl,ds=0)=>`hsl(${hsl.h*360},${Math.min(100,(hsl.s+ds)*100)}%,${Math.max(0,Math.min(100,(hsl.l+dl)*100))}%)`;
  const ouro='#d9ad55',ouroE='#8a6424';
  x.strokeStyle='#e8d6a6';x.lineCap='round';
  for(const lado of[0,1]){
    const x0=lado?W-F:0;
    for(let y=10;y<H-8;y+=7){
      const len=F*(.78+Math.random()*.22);x.lineWidth=2.6;x.globalAlpha=.85+Math.random()*.15;
      x.strokeStyle=Math.random()<.5?'#e3cf9c':'#cdb27a';
      x.beginPath();if(lado){x.moveTo(x0,y);x.lineTo(x0+len,y+(Math.random()-.5)*4)}else{x.moveTo(F,y);x.lineTo(F-len,y+(Math.random()-.5)*4)}x.stroke();
    }
  }
  x.globalAlpha=1;
  const rx=F,rw=W-F*2;
  x.fillStyle=tom(0,.05);x.fillRect(rx,0,rw,H);
  const img=x.getImageData(rx,0,rw,H),dd=img.data;
  const bc=document.createElement('canvas');bc.width=W;bc.height=H;const bx=bc.getContext('2d');bx.fillStyle='#808080';bx.fillRect(0,0,W,H);
  const bimg=bx.getImageData(rx,0,rw,H),bd=bimg.data,T=5;
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<rw;xx++){
    const cx=Math.floor(xx/T),cy=Math.floor(yy/T),u=(xx%T)/T,v=(yy%T)/T,trama=(cx+cy)%2===0;
    const fio=trama?Math.sin(v*Math.PI):Math.sin(u*Math.PI);
    const pelo=(Math.random()-.5)*22,n=(fio-.5)*30+pelo,i=(yy*rw+xx)*4;
    dd[i]+=n;dd[i+1]+=n;dd[i+2]+=n;
    const h=128+(fio-.5)*150+pelo*1.5;bd[i]=bd[i+1]=bd[i+2]=h;
  }
  x.putImageData(img,rx,0);bx.putImageData(bimg,rx,0);
  const g=x.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,Math.max(rw,H)*.75);g.addColorStop(0,'rgba(255,235,200,.08)');g.addColorStop(1,'rgba(0,0,0,.28)');x.fillStyle=g;x.fillRect(rx,0,rw,H);
  const m=H*.07;
  x.strokeStyle=ouroE;x.lineWidth=5;x.strokeRect(rx+m,m,rw-m*2,H-m*2);
  x.strokeStyle=ouro;x.lineWidth=2.6;x.strokeRect(rx+m,m,rw-m*2,H-m*2);
  const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const relevo=new THREE.CanvasTexture(bc);relevo.anisotropy=8;
  return{tex,relevo};
}
function criarSecaoLoja(d){
  const tw=d.w+.2,td=2.55,franja=.22;
  const tt=texturaTapete(d.cor,tw,td,franja);
  const pano=new THREE.Mesh(new THREE.PlaneGeometry(tw+franja*2,td),new THREE.MeshStandardMaterial({map:tt.tex,bumpMap:tt.relevo,bumpScale:.035,transparent:true,alphaTest:.4,roughness:.96}));
  pano.rotation.x=-Math.PI/2;pano.position.set(d.cx,.006,d.z+.12);pano.receiveShadow=true;LJ.sc.add(pano);LJ.deco.push(pano);
  const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,512,96);g.addColorStop(0,'#a77a2e');g.addColorStop(.5,'#e6c06a');g.addColorStop(1,'#a77a2e');
  x.fillStyle=g;x.beginPath();x.roundRect?x.roundRect(4,8,504,80,14):x.rect(4,8,504,80);x.fill();
  x.strokeStyle='rgba(60,36,10,.7)';x.lineWidth=3;x.stroke();
  x.font='800 40px "Alegreya Sans",sans-serif';x.textAlign='center';x.textBaseline='middle';
  const txt=d.nome.toUpperCase().split('').join(' ');
  x.fillStyle='rgba(255,240,200,.5)';x.fillText(txt,257,50);x.fillStyle='#3a2208';x.fillText(txt,256,49);
  const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const larg=Math.min(Math.max(d.w-.3,2.4),3.4);
  const placa=new THREE.Mesh(new THREE.PlaneGeometry(larg,larg*96/512),new THREE.MeshStandardMaterial({map:tex,transparent:true,metalness:.3,roughness:.45}));
  placa.rotation.x=-Math.PI/2;placa.position.set(d.cx,.012,d.z-1.38);LJ.sc.add(placa);LJ.deco.push(placa);
}
function medalhaoLoja(o){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const g=x.createRadialGradient(96,86,10,128,128,130);g.addColorStop(0,'#ffe9a8');g.addColorStop(.6,'#d4a94f');g.addColorStop(1,'#7a5520');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  x.strokeStyle='rgba(60,36,12,.85)';x.lineWidth=6;x.beginPath();x.arc(128,128,112,0,Math.PI*2);x.stroke();
  x.fillStyle='#24170c';x.beginPath();x.arc(128,128,104,0,Math.PI*2);x.fill();
  const ic=(k,cor,cy=128,sz=120)=>{x.save();x.translate(128-sz/2,cy-sz/2);x.scale(sz/24,sz/24);x.fillStyle=cor;x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1;const p=new Path2D(PATHS[k]);x.stroke(p);x.fill(p,'evenodd');x.restore()};
  x.textAlign='center';x.textBaseline='middle';
  if(o.kind==='bonus'){x.fillStyle='#f2c661';x.font='600 104px "IBM Plex Mono",monospace';x.fillText(`+${o.n}`,128,134)}
  else if(o.kind==='fx'){
    if(o.fx.k==='dobro'){x.fillStyle=FX.dobro.cor;x.font='800 112px "Alegreya Sans",sans-serif';x.fillText('×2',128,136)}
    else{ic(o.fx.k,FX[o.fx.k].cor,108,96);x.fillStyle='#efe6cf';x.font='600 54px "IBM Plex Mono",monospace';x.fillText(String(o.fx.n),128,190)}
  }
  else if(o.kind==='pacto'){ic('pacto','#d9334a',100,90);x.fillStyle='#efe6cf';x.font='600 52px "IBM Plex Mono",monospace';x.fillText('+5',128,190)}
  else if(o.kind==='sombria'){x.fillStyle='#b98ae6';x.font='600 84px "IBM Plex Mono",monospace';x.fillText('−3',128,112);ic('fogo','#e5803f',184,58)}
  else if(o.kind==='fundir')ic('dupla','#d9774a',128,120);
  else if(o.kind==='polir'){x.fillStyle='#f2c661';x.font='600 70px "IBM Plex Mono",monospace';x.fillText('+1',128,110);x.font='800 26px "Alegreya Sans",sans-serif';x.fillText('TODAS',128,176)}
  else if(o.kind==='cura')ic('cura','#86c48f',128,124);
  else if(o.kind==='cons')ic(o.chave,CONSUMIVEIS[o.chave].cor,128,128);
  else if(o.kind==='queimar')ic('fogo','#e5803f',128,124);
  else{x.save();x.translate(128-62,128-62);x.scale(124/24,124/24);x.strokeStyle='#f2c661';x.lineWidth=2.6;x.lineCap='round';x.stroke(new Path2D('M19 8 A8 8 0 1 0 20 13 M19 3 V8 H14'));x.restore()}
  const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const lado=new THREE.MeshStandardMaterial({color:lin('#b8893a'),metalness:.7,roughness:.35});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.6,.63,.2,48),[lado,new THREE.MeshStandardMaterial({map:tex,metalness:.35,roughness:.4}),lado]);
  return m;
}
function criarItemLoja(o){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.74,.8,.07,40),new THREE.MeshStandardMaterial({color:lin('#1a120c'),roughness:.6}));base.position.y=.035;base.receiveShadow=true;g.add(base);
  const rar=raridadeOferta(o);
  if(rar==='incomum'||rar==='raro'){const c=RARIDADE[rar].cor;const aro=new THREE.Mesh(new THREE.TorusGeometry(.79,.035,8,48),new THREE.MeshStandardMaterial({color:lin(c),emissive:new THREE.Color(c),emissiveIntensity:rar==='raro'?.9:.45,metalness:.5,roughness:.35}));aro.rotation.x=-Math.PI/2;aro.position.y=.075;g.add(aro);g.userData.aroRaro=rar==='raro'?aro:null}
  let obj,altura;
  if(o.kind==='dado'){obj=criarMalha(novoDado(o.tipo),false);altura=.95}
  else if(o.kind==='encanto'){
    const en=ENCANTOS[o.chave];obj=new THREE.Group();
    bordasDado({type:'d6',encanto:o.chave},obj);
    const fant=new THREE.Mesh(new THREE.BoxGeometry(1.08,1.08,1.08),new THREE.MeshStandardMaterial({color:lin(en.ui),emissive:new THREE.Color(en.ui),emissiveIntensity:.35,transparent:true,opacity:.13,depthWrite:false}));
    obj.add(fant);
    const brilhoC=new THREE.Sprite(new THREE.SpriteMaterial({map:brilho(),color:en.ui,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));brilhoC.scale.set(.9,.9,1);obj.add(brilhoC);
    altura=.95;
  }
  else if(o.kind==='item'){obj=criarFicha(pathItem(o.chave),ITENS[o.chave].cor,false,rarItem(o.chave));obj.scale.setScalar(1.55);altura=.18}
  else if(o.kind==='cons'){obj=modeloCons(o.chave);obj.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.userData.mapaComum=true}});obj.scale.multiplyScalar(1.3);altura=.07}
  else{obj=medalhaoLoja(o);altura=.17}
  obj.position.y=altura;obj.traverse(m=>{if(m.isMesh)m.castShadow=true});
  if(altura>.5)obj.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
  g.add(obj);
  const cv=document.createElement('canvas');cv.width=320;cv.height=112;const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.51),new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.8}));
  tag.rotation.x=-Math.PI/2;tag.position.set(0,.02,1.08);g.add(tag);
  g.userData={oferta:o,obj,altura,base0:obj.scale.x,flutua:altura>.5,tag:{cv,ctx:cv.getContext('2d'),tex,chave:null},lift:0,s:1,pulo:0,fase:Math.random()*6};
  return g;
}
function atualizarItemLoja(g){
  const u=g.userData,o=u.oferta,L=S.loja,p=precoDe(o);
  u.indisp=!!(o.feito||(o.gratis&&L.pegou));
  let txt,cor,borda='#6b5428';
  if(o.feito){txt=o.gratis?'ESCOLHIDO':'VENDIDO';cor='#8a7a64';borda='#3a2c22'}
  else if(o.gratis&&L.pegou){txt='—';cor='#6b5a48';borda='#3a2c22'}
  else if(L.sel===o){txt='APLICANDO';cor='#9fe09f';borda='#4f7a4f'}
  else if(o.gratis){txt='GRÁTIS';cor='#9fe09f';borda='#4f7a4f'}
  else{txt=String(p);cor=S.ouro<p?'#f08a7e':'#f2c661'}
  const chave=txt+cor+borda,t=u.tag;if(t.chave===chave)return;t.chave=chave;
  const x=t.ctx,W=320,H=112;x.clearRect(0,0,W,H);
  x.fillStyle='rgba(20,13,8,.92)';x.strokeStyle=borda;x.lineWidth=5;x.beginPath();x.roundRect?x.roundRect(6,6,W-12,H-12,50):x.rect(6,6,W-12,H-12);x.fill();x.stroke();
  x.textBaseline='middle';x.textAlign='center';x.fillStyle=cor;
  if(/^\d+$/.test(txt)){
    const mx=W/2-46,my=H/2,mg=x.createRadialGradient(mx-8,my-9,3,mx,my,28);mg.addColorStop(0,'#fff1c4');mg.addColorStop(.6,'#e3b64a');mg.addColorStop(1,'#8a6324');
    x.fillStyle=mg;x.beginPath();x.arc(mx,my,27,0,Math.PI*2);x.fill();x.strokeStyle='rgba(60,36,12,.7)';x.lineWidth=3;x.beginPath();x.arc(mx,my,17,0,Math.PI*2);x.stroke();
    x.fillStyle=cor;x.font='600 66px "IBM Plex Mono",monospace';x.fillText(txt,W/2+26,H/2+3);
  }else{x.font=`800 ${txt.length>8?40:50}px "Alegreya Sans",sans-serif`;x.fillText(txt,W/2,H/2+3)}
  t.tex.needsUpdate=true;
}
function descartarLoja(g){g.traverse(m=>{if(m.isMesh){m.geometry.dispose();(Array.isArray(m.material)?m.material:[m.material]).forEach(mt=>{if(mt.map&&!mt.userData.mapaComum)mt.map.dispose();mt.dispose()})}})}
function faiscasLoja(pos,cor,n=20){
  if(reduzir||!LJ)return;
  for(let i=0;i<n;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:brilho(),color:cor,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    const tam=.25+Math.random()*.3;sp.scale.set(tam,tam,1);sp.position.set(pos.x,pos.y+.6,pos.z);LJ.sc.add(sp);
    LJ.part.push({sp,t:0,dur:.6+Math.random()*.5,tam,v:new THREE.Vector3(rnd(3.5),3+Math.random()*5,rnd(3.5))});
  }
}
function animarLoja3D(dt){
  LJ.t+=dt;const L=S.loja,foco=L&&(L.sel||L.foco);
  for(const [id,g] of LJ.mapa){
    const u=g.userData,a=u.alvo||{x:g.position.x,z:g.position.z};
    if(u.fora){const k=(LJ.t-u.t0)/.45;g.position.y+=dt*9;g.scale.setScalar(Math.max(.001,1-k));if(k>=1){LJ.sc.remove(g);descartarLoja(g);LJ.mapa.delete(id)}continue}
    g.position.x+=(a.x-g.position.x)*Math.min(1,dt*10);g.position.z+=(a.z-g.position.z)*Math.min(1,dt*10);
    if(u.aroRaro)u.aroRaro.material.emissiveIntensity=.7+.35*Math.sin(LJ.t*3+id);
    if(u.caindo){u.vy=(u.vy||0)-32*dt;g.position.y+=u.vy*dt;if(g.position.y<=0){g.position.y=0;if(Math.abs(u.vy)>3){SOM.batida(Math.abs(u.vy)*.6,false,.5);u.vy*=-.32}else{u.vy=0;u.caindo=false}}}
    const hov=!u.indisp&&(LJ.hover===u.oferta||foco===u.oferta);
    u.lift+=((hov?.38:0)-u.lift)*Math.min(1,dt*10);
    if(u.pulo>0)u.pulo=Math.max(0,u.pulo-dt*3);
    u.s+=((u.indisp?0:1)-u.s)*Math.min(1,dt*(u.indisp?5:10));
    u.obj.scale.setScalar(Math.max(.001,u.s*u.base0));
    u.obj.position.y=u.altura+u.lift+Math.sin(u.pulo*Math.PI)*.45+(u.flutua?Math.sin(LJ.t*2+u.fase)*.08:0)+(1-u.s)*1.4;
    u.obj.rotation.y+=dt*(u.flutua?(hov?1.8:.5):(hov?1.4:0));
  }
  const gf=foco&&LJ.mapa.get(foco.id);
  if(gf&&!gf.userData.indisp){LJ.anel.visible=true;LJ.anel.position.x=gf.position.x;LJ.anel.position.z=gf.position.z;const s=1+Math.sin(LJ.t*4)*.05;LJ.anel.scale.set(s,s,s);LJ.anel.material.color.set(L.sel===foco?'#9fe09f':'#f2c661')}
  else LJ.anel.visible=false;
  for(let i=LJ.part.length-1;i>=0;i--){
    const p=LJ.part[i];p.t+=dt;const k=p.t/p.dur;p.v.y-=14*dt;p.sp.position.addScaledVector(p.v,dt);
    p.sp.material.opacity=Math.max(0,1-k);const q=p.tam*(1-k*.6);p.sp.scale.set(q,q,1);
    if(k>=1){LJ.sc.remove(p.sp);p.sp.material.dispose();LJ.part.splice(i,1)}
  }
}
function telaDeLoja(o){
  if(!LJ)return null;const g=LJ.mapa.get(o.id);if(!g)return null;
  const v=g.position.clone();v.y+=.8;v.project(LJ.cam);const r=$('lojaCena').getBoundingClientRect();
  return{x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height,g};
}
function moedasParaItem(o,qtd){
  const alvo=telaDeLoja(o),pil=document.querySelector('.pilula.ouro');if(!alvo||!pil||reduzir)return;
  const anc=document.createElement('div');anc.style.cssText=`position:fixed;left:${alvo.x}px;top:${alvo.y}px;width:2px;height:2px;pointer-events:none`;document.body.appendChild(anc);
  const r=pil.getBoundingClientRect();
  for(let i=0;i<Math.min(qtd,7);i++)voar(MOEDA_VOO,{x:r.left+r.width/2,y:r.top+r.height/2},anc,{atraso:i*70,dur:520,aoChegar:()=>SOM.ouro(1)});
  setTimeout(()=>anc.remove(),1600);
}
function efeitoCompra(o){
  const a=telaDeLoja(o);if(!a)return;
  const cor=o.kind==='encanto'?ENCANTOS[o.chave].ui:o.kind==='item'?ITENS[o.chave].cor:o.kind==='fx'?FX[o.fx.k].cor:o.gratis?'#9fe09f':'#f2c661';
  faiscasLoja(a.g.position,cor,26);a.g.userData.pulo=1;
}
function concluirOferta(o){
  const L=S.loja;
  if(o.kind!=='renovar')o.feito=true;
  if(o.gratis)L.pegou=true;else{const p=precoDe(o);S.ouro-=p;moedasParaItem(o,p)}
  efeitoCompra(o);
  L.sel=null;L.fundirA=null;hud();renderLoja();
  autoSairLoja();
}
function autoSairLoja(){
  const L=S.loja;if(!L||L.mercador||!L.pegou)return;
  setTimeout(()=>{if(S.loja===L&&S.fase==='loja'){const t=$('lojaShell');if(t){t.style.transition='opacity .3s';t.style.opacity='0'}setTimeout(()=>{if(S.loja===L&&S.fase==='loja'){S.loja=null;telaMapa()}},reduzir?0:300)}},reduzir?300:1000);
}
function todasOfertas(){const L=S.loja;return[...L.espolio,...L.enc,...L.reliq,...(L.cons||[]),...L.dados,...L.grav,...L.serv]}
function previaFace(el){
  const L=S.loja,o=L&&L.sel,p=$('previa');if(!o||!p)return;
  const d=S.dados.find(x=>x.id===+el.dataset.d),i=+el.dataset.f,f=d.faces[i];
  const novo={...f},f0=f;{const f=novo;if(o.kind==='bonus')f.bonus+=o.n;else if(o.kind==='pacto'){f.bonus+=5;f.fx={k:'pacto',n:2}}else if(o.kind==='sombria'){f.bonus=-(f.v+3);f.fx={k:'fogo',n:10}}else f.fx={...o.fx};}
  const nome=DIE[d.type].rot?DIE[d.type].rot[i]:'Face '+(f.v+f.bonus);
  const troca=o.kind==='fx'&&f.fx&&f.fx.k!==o.fx.k?` · perde ${FX[f.fx.k].nome}`:'';
  p.textContent=`${DIE[d.type].curto}, ${nome}: vale ${valorFace(f)} → ${valorFace(novo)}${troca}`;
}
$('overlay').addEventListener('pointerover',e=>{const f=e.target.closest('[data-f]');if(f)previaFace(f);});
$('overlay').addEventListener('focusin',e=>{const no=e.target.closest('[data-no]');if(no&&S.fase==='mapa')infoMapa(no.dataset.no)});
$('overlay').addEventListener('focusin',e=>{const f=e.target.closest('[data-f]');if(f)previaFace(f)});
