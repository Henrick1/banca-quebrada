const MAPA_LINHAS=12;
const NOS={
  luta:{nome:'Luta',cor:'#d9b07a',ic:'lamina',desc:'Um apostador comum. Vença para ganhar ouro e escolher um espólio.'},
  elite:{nome:'Elite',cor:'#e0574a',ic:'coroa',desc:'25% mais vida e um traço extra. Vencer paga 50% a mais e garante uma relíquia.'},
  loja:{nome:'Mercador',cor:'#e3b64a',ic:'ouro',desc:'Compre dados, gravações, encantamentos, relíquias e serviços.'},
  evento:{nome:'Evento',cor:'#b98ae6',ic:'baralho',desc:'Algo acontece na taverna. Escolhas com risco e recompensa.'},
  descanso:{nome:'Descanso',cor:'#86c48f',ic:'rum',desc:'Durma para curar, afie uma face ou funda dois dados.'},
  chefe:{nome:'Chefe',cor:'#b48cff',ic:'coroa',desc:'O dono da taverna em pessoa.'}
};
const EXTRAS_ELITE=['pele','ganancia','vinganca','regen','armadura','cobrador','congela'];
function gerarMapa(){
  const RL=MAPA_LINHAS,C=4,nos={},lig={},k=(r,c)=>r+':'+c,ligar=(a,b)=>{(lig[a]=lig[a]||[]);if(!lig[a].includes(b))lig[a].push(b)};
  const chefe=k(RL-1,1.5);
  for(let p=0;p<4;p++){
    let c=p===0?0:p===1?C-1:Math.floor(R()*C);
    for(let r=0;r<RL-1;r++){
      nos[k(r,c)]=nos[k(r,c)]||{r,c};
      if(r<RL-2){const nc=Math.max(0,Math.min(C-1,c+Math.floor(R()*3)-1));ligar(k(r,c),k(r+1,nc));c=nc}
      else ligar(k(r,c),chefe);
    }
  }
  nos[chefe]={r:RL-1,c:1.5};
  for(const id in nos){
    const n=nos[id];n.id=id;
    if(n.r===RL-1)n.tipo='chefe';
    else if(n.r===0)n.tipo='luta';
    else if(n.r===RL-2)n.tipo='descanso';
    else if(n.r===6)n.tipo=R()<.5?'loja':'evento';
    else{const x=R();n.tipo=x<.42?'luta':x<.64?'evento':x<.78?'loja':(n.r>=3&&x<.92)?'elite':n.r>=2?'descanso':'luta'}
    if(n.tipo==='luta'||n.tipo==='elite'){
      const t=Math.min(6,Math.max(0,Math.floor(n.r*.7)-(R()<.3?1:0)));
      n.inimigo=n.tipo==='elite'?Math.min(6,t+1):t;
      if(n.tipo==='elite'){const b=INIMIGOS[n.inimigo];n.extra=pick(EXTRAS_ELITE.filter(x=>!b.tracos.includes(x)))}
    }
    if(n.tipo==='chefe')n.inimigo=INIMIGOS.length-1;
  }
  const ini=k(0,1.5),seg=new Set();
  for(const id of Object.keys(nos))if(nos[id].r===0){(lig[id]||[]).forEach(b=>seg.add(b));delete nos[id];delete lig[id]}
  nos[ini]={id:ini,r:0,c:1.5,tipo:'luta',inimigo:0};lig[ini]=[...seg];
  return{nos,lig,atual:null,feitos:[],inicio:ini};
}
const selo=k=>`<span class="selo" style="background:${NOS[k].cor}">${svgPath(NOS[k].ic,'#2a1a0c')}</span>`;
let MP=null;
const MAPA_W=640,MAPA_GAP=104;
const mapaH=()=>MAPA_LINHAS*MAPA_GAP+130;
const mapaPos=n=>({x:92+n.c*152,y:mapaH()-70-n.r*MAPA_GAP});
const curvaMapa=(p,q)=>`M${p.x} ${p.y} Q${(p.x+q.x)/2+((p.x*7+q.y)%17-8)} ${(p.y+q.y)/2} ${q.x} ${q.y}`;
function mapaDisponiveis(){const M=S.mapa;return new Set(M.atual?(M.lig[M.atual]||[]):[M.inicio])}
function telaMapa(){
  hud();
  S.fase='mapa';S.retomar=telaMapa;S.loja=null;S.pausado=false;
  const M=S.mapa,R=MAPA_LINHAS,W=MAPA_W,H=mapaH(),disp=mapaDisponiveis(),feitos=new Set(M.feitos);
  let linhas='',nos='';
  for(const a in M.lig)for(const b of M.lig[a]){
    const feita=feitos.has(a)&&feitos.has(b)&&M.feitos.indexOf(b)===M.feitos.indexOf(a)+1,prox=M.atual===a;
    linhas+=`<path d="${curvaMapa(mapaPos(M.nos[a]),mapaPos(M.nos[b]))}" class="mp-linha${feita?' feita':''}${prox?' prox':''}"/>`;
  }
  for(const n of Object.values(M.nos)){
    const p=mapaPos(n),t=NOS[n.tipo],R0=n.tipo==='chefe'?38:25,est=feitos.has(n.id)?'feito':disp.has(n.id)?'disp':'';
    nos+=`<g class="mp-no ${est}" data-no="${n.id}" transform="translate(${p.x} ${p.y})" ${est==='disp'?'tabindex="0" role="button"':''} aria-label="${t.nome}, andar ${n.r+1}">
      <circle r="${R0+8}" class="mp-halo"/><ellipse rx="${R0}" ry="${R0*.32}" cy="${R0*.82}" class="mp-sombra"/>
      <g class="mp-corpo"><circle r="${R0}" fill="${t.cor}" class="mp-selo"/><circle r="${R0*.78}" class="mp-borda"/>
      <g transform="translate(${-R0*.56} ${-R0*.56}) scale(${R0*1.12/24})" pointer-events="none"><path d="${PATHS[t.ic]}" fill="#2a1a0c" fill-rule="evenodd"/></g>
      ${feitos.has(n.id)&&M.atual!==n.id?`<path d="M${-R0*.5} 0 L${-R0*.1} ${R0*.4} L${R0*.55} ${-R0*.45}" class="mp-check"/>`:''}</g>
    </g>`;
  }
  const at=M.atual?M.nos[M.atual]:M.nos[M.inicio],pp=mapaPos(at);
  const peao=`<g id="mpPeao" transform="translate(${pp.x} ${pp.y-6})" pointer-events="none"><ellipse rx="15" ry="5" cy="6" fill="#0006"/><g class="peao-corpo"><rect x="-15" y="-46" width="30" height="30" rx="7" fill="#efe6cf" stroke="#3a2410" stroke-width="2.5"/><rect x="-15" y="-46" width="30" height="9" rx="7" fill="#fff8e6" opacity=".6"/><circle cx="-7" cy="-38" r="2.8" fill="#2b211a"/><circle cx="0" cy="-31" r="2.8" fill="#2b211a"/><circle cx="7" cy="-24" r="2.8" fill="#2b211a"/></g></g>`;
  const andar=M.atual?M.nos[M.atual].r+1:0;
  abrirTela(`<div class="mapa-tela">
    <div class="mapa-vista" id="mapaVista" tabindex="0" aria-label="Mapa. Use as setas para rolar">
      <div class="mapa-trilho" id="mapaTrilho"><svg viewBox="0 0 ${W} ${H}" class="mapa-svg" id="mapaSvg" role="group" aria-label="Mapa da taverna">
        <text x="${W/2}" y="40" class="mp-titulo">A Taverna</text>
        ${linhas}<g id="mpTinta"></g>${nos}${peao}</svg></div>
      <div class="rolo cima" id="roloC"></div><div class="rolo baixo" id="roloB"></div>
      <div class="mapa-dica" id="mapaDica" hidden></div>
      <div class="mapa-guia">Arraste para ver o mapa</div>
    </div>
    <aside class="mapa-lado">
      <div><p class="menu-sobre">Andar ${andar} de ${R} · Bolsa ${S.build||'Apostador'}</p><h2>A Taverna</h2></div>
      <div class="status"><span class="pilula"><small>Vida</small>${S.hp}/${S.max}</span><span class="pilula ouro">${MOEDA}${S.ouro}</span><span class="pilula"><small>Dados</small>${S.dados.length}</span><span class="pilula"><small>Relíquias</small>${new Set(S.itens).size}</span></div>
      <div class="cartao" id="mapaInfo"></div>
      <div class="legenda">${['luta','elite','evento','loja','descanso','chefe'].map(k=>`<span>${selo(k)}${NOS[k].nome}</span>`).join('')}</div>
    </aside>
  </div>`);
  infoMapa(null);
  S.evAtual=null;salvarPartida();
  iniciarMapaInterativo();
}
function iniciarMapaInterativo(){
  if(MP)cancelAnimationFrame(MP.raf);
  const vista=$('mapaVista'),trilho=$('mapaTrilho'),svg=$('mapaSvg'),M=S.mapa;
  MP={pan:0,vel:0,alvo:null,arr:null,arrastou:false,movendo:false,hover:null,raf:0,ult:performance.now(),escala:1,hv:1,ht:1};
  const medir=()=>{MP.hv=vista.clientHeight;MP.escala=svg.getBoundingClientRect().width/MAPA_W;MP.ht=mapaH()*MP.escala};
  medir();
  const limites=()=>[Math.min(0,MP.hv-MP.ht),0];
  const centroDe=id=>MP.hv*.58-mapaPos(M.nos[id]).y*MP.escala;
  const disp=[...mapaDisponiveis()];
  const foco=disp.length?disp.map(id=>mapaPos(M.nos[id]).y).reduce((a,b)=>a+b,0)/disp.length:mapaPos(M.nos[M.atual||M.inicio]).y;
  const [lo,hi]=limites();
  const alvoIni=Math.max(lo,Math.min(hi,MP.hv*.5-foco*MP.escala));
  MP.pan=M.pan!=null?M.pan:hi;MP.alvo=alvoIni;
  SOM.papel();
  const ro=new ResizeObserver(()=>{const k=MP.pan/(MP.escala||1);medir();MP.pan=k*MP.escala});ro.observe(vista);
  vista.addEventListener('pointerdown',e=>{
    if(MP.movendo)return;
    const alvoNo=e.target.closest&&e.target.closest('[data-no]');
    MP.arr={y:e.clientY,y0:e.clientY,pan0:MP.pan,t:performance.now(),no:alvoNo?alvoNo.dataset.no:null};MP.arrastou=false;MP.vel=0;MP.alvo=null;
    vista.setPointerCapture(e.pointerId);
  });
  vista.addEventListener('pointermove',e=>{
    const a=MP.arr;
    if(a){
      const dy=e.clientY-a.y0;
      if(!MP.arrastou&&Math.abs(dy)>6){MP.arrastou=true;vista.classList.add('arrastando');SOM.papel(.6);esconderDica()}
      if(MP.arrastou){
        const agora=performance.now(),dt=Math.max(1,agora-a.t);
        MP.vel=(e.clientY-a.y)/dt*1000*.8+MP.vel*.2;a.y=e.clientY;a.t=agora;
        const [lo,hi]=limites();let p=a.pan0+dy;
        if(p>hi)p=hi+(p-hi)*.35;if(p<lo)p=lo+(p-lo)*.35;MP.pan=p;
      }
      return;
    }
    const no=e.target.closest&&e.target.closest('[data-no]');
    const id=no?no.dataset.no:null;
    if(id!==MP.hover){MP.hover=id;if(id){mostrarDica(id);infoMapa(id);if(no.classList.contains('disp'))SOM.batida(2.5,false,.4)}else esconderDica()}
  });
  const soltar=e=>{
    if(!MP.arr)return;
    const foi=MP.arrastou,no=MP.arr.no;MP.arr=null;vista.classList.remove('arrastando');
    if(!foi&&no){MP.arrastou=false;escolherNo(no)}
    setTimeout(()=>{if(MP)MP.arrastou=false},0);
  };
  vista.addEventListener('pointerup',soltar);
  vista.addEventListener('pointercancel',()=>{if(MP){MP.arr=null;vista.classList.remove('arrastando')}});
  vista.addEventListener('pointerleave',()=>{if(MP&&!MP.arr){MP.hover=null;esconderDica()}});
  vista.addEventListener('wheel',e=>{e.preventDefault();if(MP.movendo)return;MP.alvo=null;MP.vel=0;const [lo,hi]=limites();MP.pan=Math.max(lo-40,Math.min(hi+40,MP.pan-e.deltaY*.9))},{passive:false});
  vista.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){MP.alvo=Math.min(limites()[1],(MP.alvo??MP.pan)+140);e.preventDefault()}if(e.key==='ArrowDown'){MP.alvo=Math.max(limites()[0],(MP.alvo??MP.pan)-140);e.preventDefault()}});
  MP.centroDe=centroDe;MP.limites=limites;MP.ro=ro;
  const loop=t=>{
    if(!MP)return;
    if(!$('mapaVista')||S.fase!=='mapa'){ro.disconnect();MP=null;return}
    const dt=Math.min(.05,(t-MP.ult)/1000);MP.ult=t;
    const [lo,hi]=limites();
    if(!MP.arr){
      if(MP.alvo!=null){MP.pan+=(MP.alvo-MP.pan)*Math.min(1,dt*(reduzir?30:4.5));if(Math.abs(MP.alvo-MP.pan)<.5){MP.pan=MP.alvo;MP.alvo=null}}
      else{
        MP.pan+=MP.vel*dt;MP.vel*=Math.pow(.05,dt);
        if(MP.pan>hi){MP.pan+=(hi-MP.pan)*Math.min(1,dt*12);MP.vel*=.5}
        if(MP.pan<lo){MP.pan+=(lo-MP.pan)*Math.min(1,dt*12);MP.vel*=.5}
        if(Math.abs(MP.vel)<5)MP.vel=0;
      }
    }
    M.pan=MP.pan;
    trilho.style.transform=`translate(-50%,${MP.pan}px)`;
    $('roloC').style.backgroundPositionY=$('roloB').style.backgroundPositionY=`0,${MP.pan*.6}px`;
    if(MP.hover)posicionarDica(MP.hover);
    MP.raf=requestAnimationFrame(loop);
  };
  MP.raf=requestAnimationFrame(loop);
}
function mostrarDica(id){
  const el=$('mapaDica');if(!el)return;const n=S.mapa.nos[id],t=NOS[n.tipo],disp=mapaDisponiveis().has(id);
  let sub=t.desc;
  if(n.inimigo!=null){const b=INIMIGOS[n.inimigo],v=Math.round(b.hp*(n.tipo==='elite'?1.25:1));sub=`${b.nome} · vida ${v} · base ${b.base}${n.extra?` · ${TRACOS[n.extra].nome}`:''}`}
  el.innerHTML=`<b style="color:${t.cor}">${t.nome}</b><span>${sub}</span><em>${disp?'Clique para viajar':S.mapa.feitos.includes(id)?'Já visitado':'Fora do seu caminho'}</em>`;
  el.hidden=false;posicionarDica(id);
}
function posicionarDica(id){
  const el=$('mapaDica');if(!el||el.hidden||!MP)return;
  const p=mapaPos(S.mapa.nos[id]),v=$('mapaVista'),tr=$('mapaSvg').getBoundingClientRect(),vr=v.getBoundingClientRect();
  let x=tr.left-vr.left+p.x*MP.escala,y=MP.pan+p.y*MP.escala-34*MP.escala;
  const baixo=y<110;
  x=Math.max(130,Math.min(vr.width-130,x));
  el.style.left=x+'px';el.style.top=(baixo?y+80*MP.escala:y)+'px';el.classList.toggle('baixo',baixo);
}
function esconderDica(){const el=$('mapaDica');if(el)el.hidden=true}
function escolherNo(id){
  if(!MP||MP.movendo||MP.arrastou)return;
  const M=S.mapa,n=M.nos[id],g=document.querySelector(`.mp-no[data-no="${id}"]`);
  if(!mapaDisponiveis().has(id)){if(g){g.classList.remove('nao');void g.getBoundingClientRect();g.classList.add('nao')}SOM.batida(3,false);mostrarDica(id);return}
  MP.movendo=true;esconderDica();
  const [lo,hi]=MP.limites();MP.alvo=Math.max(lo,Math.min(hi,MP.centroDe(id)));
  g.classList.add('carimbo');SOM.carimbo();
  const de=M.atual?M.nos[M.atual]:null,svgNS='http://www.w3.org/2000/svg',tinta=$('mpTinta'),peao=$('mpPeao');
  const fim=()=>{
    const p=mapaPos(n),anel=document.createElementNS(svgNS,'circle');anel.setAttribute('cx',p.x);anel.setAttribute('cy',p.y);anel.setAttribute('class','mp-onda');anel.setAttribute('r','20');$('mapaSvg').appendChild(anel);
    anel.animate([{r:20,opacity:.9},{r:90,opacity:0}],{duration:600,easing:'ease-out'});
    SOM.batida(8,false);
    setTimeout(()=>{const tela=document.querySelector('.mapa-tela');if(tela)tela.classList.add('saindo');setTimeout(()=>irPara(id),reduzir?0:260)},reduzir?0:420);
  };
  if(!de||reduzir){fim();return}
  const path=document.createElementNS(svgNS,'path');path.setAttribute('d',curvaMapa(mapaPos(de),mapaPos(n)));path.setAttribute('class','mp-tinta');tinta.appendChild(path);
  const L=path.getTotalLength();path.style.strokeDasharray=L;path.style.strokeDashoffset=L;
  setTimeout(()=>{SOM.pena();path.animate([{strokeDashoffset:L},{strokeDashoffset:0}],{duration:520,easing:'ease-in-out',fill:'forwards'})},180);
  setTimeout(()=>{
    const t0=performance.now(),dur=720;
    const passo=t=>{
      const k=Math.min(1,(t-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,pt=path.getPointAtLength(e*L),pulo=Math.sin(k*Math.PI*3)*(1-k)*14+Math.sin(k*Math.PI)*10;
      peao.setAttribute('transform',`translate(${pt.x} ${pt.y-6-Math.abs(pulo)})`);
      if(k<1)requestAnimationFrame(passo);else fim();
    };
    requestAnimationFrame(passo);SOM.batida(4,false);
  },420);
}
function infoMapa(id){
  const el=$('mapaInfo');if(!el)return;const M=S.mapa;
  if(!id||!M.nos[id]){el.innerHTML=`<h3>Escolha o caminho</h3><p>Os selos que pulsam são os próximos destinos. Passe o mouse para ver o que espera em cada um.</p>`;return}
  const n=M.nos[id],t=NOS[n.tipo];
  let corpo=`<p>${t.desc}</p>`;
  if(n.inimigo!=null){
    const b=INIMIGOS[n.inimigo],tr=[...b.tracos,...(n.extra?[n.extra]:[])],vida=Math.round(b.hp*(n.tipo==='elite'?1.25:1));
    corpo=`<strong class="cartao-tit">${b.nome}</strong><p>${t.desc}</p>
      <div class="mini"><span>Vida <b>${vida}</b></span><span>Base <b>${b.base}</b></span><span>Bolsa <b>${b.bolsa.length} dados</b></span></div>
      <p class="nota">Rodadas: ${(b.modos||['classico']).map(k=>MODOS[k].nome).join(', ')}</p>
      ${tr.length?`<ul class="tracos">${tr.map(k=>`<li><b style="color:${TRACOS[k].cor}">${TRACOS[k].nome}${k===n.extra?' (elite)':''}</b> ${TRACOS[k].desc}</li>`).join('')}</ul>`:''}`;
  }
  el.innerHTML=`<h3>${t.nome} · andar ${n.r+1}</h3>${corpo}`;
}
function irPara(id){
  const M=S.mapa,n=M.nos[id];if(!n)return;
  M.atual=id;M.feitos.push(id);S.linha=n.r;SOM.batida(8,false);SOM.tensao();
  if(n.tipo==='luta'||n.tipo==='elite'||n.tipo==='chefe'){S.no=n;novaLuta()}
  else if(n.tipo==='loja')abrirMercado();
  else if(n.tipo==='evento')abrirEvento();
  else abrirDescanso();
}
