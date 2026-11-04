const PERFIL=(()=>{
  const base={partidas:0,vitorias:0,melhorAndar:0,vistos:{itens:[],encantos:[]},build:'apostador',reserva:'d6',desafio:0,desafioMax:0,conquistas:[],segredos:[],mendigo:0};
  try{const p=JSON.parse(ARMAZ.getItem('bq-perfil')||'{}');return{...base,...p,vistos:{...base.vistos,...(p.vistos||{})}}}catch(e){return base}
})();
function salvarPerfil(){try{ARMAZ.setItem('bq-perfil',JSON.stringify(PERFIL))}catch(e){}}
function registrarVisto(tipo,k){if(S.teste)return;const l=PERFIL.vistos[tipo];if(!l.includes(k)){l.push(k);salvarPerfil()}}
const cm=n=>(S.desafio||0)>=5?Math.ceil(n/2):n;
const DESAFIOS=[
  {nome:'Normal',desc:'O jogo como ele é.'},
  {nome:'Desafio 1',desc:'Inimigos com 15% a mais de vida.'},
  {nome:'Desafio 2',desc:'E a base dos inimigos sobe 1.'},
  {nome:'Desafio 3',desc:'E você ganha 25% menos ouro nas lutas.'},
  {nome:'Desafio 4',desc:'E elites ganham dois traços extras; o chefe ganha Armadura.'},
  {nome:'Desafio 5',desc:'E você começa com 35 de vida; toda cura rende metade.'}
];
const CONQUISTAS={
  vitoria:{nome:'Banca Quebrada',desc:'Vença uma partida.'},
  ato1:{nome:'Adega Limpa',desc:'Derrote o Taberneiro Caolho.'},
  ato2:{nome:'Dívida Quitada',desc:'Derrote a Viúva das Apostas.'},
  desafio3:{nome:'Apostador Calejado',desc:'Vença no Desafio 3 ou acima.'},
  desafio5:{nome:'Dono da Taverna',desc:'Vença no Desafio 5.'},
  mosca:{nome:'Na Mosca',desc:'Acerte o teto exato no modo Estouro.'},
  estouro:{nome:'Ganância',desc:'Estoure no modo Estouro.'},
  combo3:{nome:'Reação em Cadeia',desc:'Ative 3 combos na mesma rodada.'},
  golpe60:{nome:'Golpe Certeiro',desc:'Cause 60 de dano num único acerto.'},
  fusao:{nome:'Fundidor',desc:'Funda dois dados.'},
  conjunto:{nome:'Colecionador',desc:'Complete um conjunto de relíquias.'},
  elites:{nome:'Caçador de Elites',desc:'Vença 3 elites na mesma partida.'},
  rico:{nome:'Bolso Cheio',desc:'Tenha 100 de ouro ao mesmo tempo.'},
  porUmFio:{nome:'Por um Fio',desc:'Vença uma luta com 3 de vida ou menos.'},
  maosLimpas:{nome:'Mãos Limpas',desc:'Vença o chefe sem nenhuma relíquia.'}
};
const SEGREDOS={
  benfeitor:{nome:'Bolsa O Benfeitor'},
  herdeiro:{nome:'Bolsa Herdeiro da Casa'}
};
function temSegredo(k){return(PERFIL.segredos||[]).includes(k)}
function revelarSegredo(k){
  if(S.teste||!SEGREDOS[k]||temSegredo(k))return;
  (PERFIL.segredos=PERFIL.segredos||[]).push(k);salvarPerfil();
  setTimeout(()=>{toast(`<b>Segredo descoberto</b>${SEGREDOS[k].nome} liberada`,'#d9a0ff');SOM.traco();setTimeout(()=>SOM.combo(),250);vinheta('#9b6fe0')},700);
}
function conquistar(k){
  if(S.teste||!CONQUISTAS[k]||PERFIL.conquistas.includes(k))return;
  PERFIL.conquistas.push(k);salvarPerfil();
  setTimeout(()=>{toast(`<b>Conquista</b>${CONQUISTAS[k].nome} · ${CONQUISTAS[k].desc}`,'#9fe09f');SOM.combo()},600);
}
const SAVE_KEY='bq-partida';
function temSalvo(){try{return!!ARMAZ.getItem(SAVE_KEY)}catch(e){return false}}
function apagarSalvo(){try{ARMAZ.removeItem(SAVE_KEY)}catch(e){}}
function salvarPartida(){
  if(!S.mapa||S.fase==='fim')return;
  const onde=S.fase==='loja'?'loja':S.fase==='evento'&&S.evAtual?'evento':S.fase==='mapa'||S.fase==='evento'?'mapa':'luta';
  const L=S.loja;
  const d={v:1,uid,onde,hp:onde==='luta'?(S.hpLuta??S.hp):S.hp,max:S.max,ouro:onde==='luta'?(S.ouroLuta??S.ouro):S.ouro,cons:onde==='luta'?(S.consLuta??S.cons):S.cons,andar:S.andar,linha:S.linha,itens:S.itens,dados:S.dados,build:S.build,stats:S.stats,
    mapa:S.mapa,evVistos:S.evVistos,teste:S.teste,desafio:S.desafio||0,proxLuta:S.proxLuta||null,rng:RNG.ativo?RNG.s:null,no:S.no,elitesVencidos:S.elitesVencidos||0,
    loja:onde==='loja'&&L?{...L,sel:null,foco:null,fundirA:null,flash:null}:null,evento:onde==='evento'?S.evAtual:null};
  try{ARMAZ.setItem(SAVE_KEY,JSON.stringify(d))}catch(e){}
}
function carregarPartida(){
  let d=null;try{d=JSON.parse(ARMAZ.getItem(SAVE_KEY)||'null')}catch(e){}
  if(!d||!d.mapa){apagarSalvo();return false}
  Object.assign(S,{hp:d.hp,max:d.max,ouro:d.ouro,cons:d.cons||[],andar:d.andar,linha:d.linha,itens:d.itens,dados:d.dados,build:d.build,stats:d.stats,mapa:d.mapa,evVistos:d.evVistos||[],
    teste:!!d.teste,desafio:d.desafio||0,proxLuta:d.proxLuta||null,no:d.no,elitesVencidos:d.elitesVencidos||0,pausado:false,ini:null,loja:null,evAtual:null});
  uid=Math.max(uid,d.uid||0)+1;
  if(S.mapa&&S.mapa.nos)Object.values(S.mapa.nos).forEach(n=>{if(n.tipo==='chefe')n.inimigo=ATOS[n.ato??atoDe(n.r)].chefe});
  if(S.no&&S.no.tipo==='chefe')S.no.inimigo=ATOS[S.no.ato??atoDe(S.no.r)].chefe;
  RNG.ativo=d.rng!=null;if(RNG.ativo)RNG.s=d.rng;
  if(d.onde==='luta'&&S.no)novaLuta();
  else if(d.onde==='loja'&&d.loja){S.loja=d.loja;S.loja.cons=(S.loja.cons||[]).filter(o=>o.kind!=='bau');S.fase='loja';S.retomar=renderLoja;renderLoja()}
  else if(d.onde==='evento'&&d.evento){const ev=d.evento==='descanso'?DESCANSO:EVENTOS.find(e=>e.id===d.evento);if(ev)telaEvento(ev);else telaMapa()}
  else telaMapa();
  hud();
  return true;
}
const comEncanto=(d,k)=>{d.encanto=k;return d};
const gravado=(d,mods)=>{for(const i in mods)Object.assign(d.faces[i],mods[i]);return d};
const BUILDS={
  apostador:{nome:'Apostador',desc:'A bolsa clássica: três dados e uma moeda para arriscar.',req:null,
    montar:()=>({dados:[novoDado('d6'),novoDado('d6'),novoDado('d6'),novoDado('coin')],itens:[],ouro:0})},
  numerologo:{nome:'Numerólogo',desc:'Dados encantados que gostam de números primos e de números vizinhos.',req:{andar:3,txt:'Chegue ao andar 3'},
    montar:()=>({dados:[comEncanto(novoDado('d6'),'onix'),comEncanto(novoDado('d6'),'rubi'),novoDado('d10'),novoDado('coin')],itens:[],ouro:0})},
  alquimista:{nome:'Alquimista',desc:'Começa envenenando e se curando.',req:{andar:5,txt:'Chegue ao andar 5'},
    montar:()=>({dados:[gravado(novoDado('d6'),{5:{fx:{k:'veneno',n:2}}}),gravado(novoDado('d6'),{5:{fx:{k:'cura',n:3}}}),novoDado('d6'),novoDado('coin')],itens:['peconha'],ouro:0})},
  trapaceiro:{nome:'Trapaceiro',desc:'Sabe o que a casa vai tirar e ainda marca as cartas.',req:{partidas:5,txt:'Jogue 5 partidas'},
    montar:()=>({dados:[novoDado('d6'),novoDado('d6'),novoDado('d6'),novoDado('d6')],itens:['lupa','baralho'],ouro:0})},
  ourives:{nome:'Ourives',desc:'Ouro chama ouro. Começa rico e com gêmeos dourados.',req:{vitorias:1,txt:'Vença uma partida'},
    montar:()=>({dados:[comEncanto(gravado(novoDado('d6'),{5:{fx:{k:'ouro',n:3}}}),'ouro'),comEncanto(novoDado('d6'),'ouro'),novoDado('coin'),novoDado('coin')],itens:['coroa'],ouro:10})},
  moedeiro:{nome:'Cara ou Coroa',desc:'Quatro moedas de chumbo e um D6. Cada moeda é 1 ou 6, e qualquer melhoria pesa o dobro.',req:{partidas:3,txt:'Jogue 3 partidas'},
    montar:()=>({dados:[novoDado('coin'),novoDado('coin'),novoDado('coin'),novoDado('coin'),novoDado('d6')],itens:['moedaPesada'],ouro:0})},
  viciado:{nome:'Ossos Viciados',desc:'D6 de osso que transformam o 1 em 6, e um deles já vem com Fogo no 6.',req:{andar:6,txt:'Chegue ao andar 6'},
    montar:()=>({dados:[gravado(novoDado('d6'),{5:{fx:{k:'fogo',n:3}}}),novoDado('d6'),novoDado('d6'),novoDado('coin')],itens:['dadoOsso'],ouro:0})},
  gigante:{nome:'Pedra Grande',desc:'Poucos dados e muito alcance: um D20 com Grimório e um D10. Tudo ou nada.',req:{andar:9,txt:'Chegue ao Cofre (andar 9)'},
    montar:()=>({dados:[novoDado('d20'),novoDado('d10'),novoDado('coin'),novoDado('coin')],itens:['grimorio'],ouro:0})},
  benfeitor:{nome:'O Benfeitor',desc:'Quem dá, recebe. Começa com ouro, a Algibeira e um dado abençoado pelo velho da porta.',req:{segredo:'benfeitor',txt:'Segredo'},dica:'Quem dá três vezes na porta, um dia é recebido à mesa.',
    montar:()=>({dados:[gravado(novoDado('d6'),{0:{fx:{k:'cura',n:3}},5:{fx:{k:'dobro'}}}),novoDado('d6'),novoDado('d6'),novoDado('coin')],itens:['algibeira'],ouro:15})},
  herdeiro:{nome:'Herdeiro da Casa',desc:'A bolsa do próprio Dono: um D20 viciado e o baralho marcado da casa.',req:{segredo:'herdeiro',txt:'Segredo'},dica:'O Dono só mostra o rosto para quem nunca perdeu uma rodada para ele.',
    montar:()=>({dados:[gravado(novoDado('d20'),{0:{bonus:7},19:{fx:{k:'dobro'}}}),novoDado('d10'),novoDado('d6'),novoDado('coin')],itens:['baralho'],ouro:5})}
};
const RESERVAS={
  d6:{nome:'D6 de reserva',tipo:'d6',req:null},
  coin:{nome:'Moeda de reserva',tipo:'coin',req:null},
  d10:{nome:'D10 de reserva',tipo:'d10',req:{andar:4,txt:'Chegue ao andar 4'}},
  d20:{nome:'D20 de reserva',tipo:'d20',req:{vitorias:1,txt:'Vença uma partida'}}
};
function liberado(req){return!req||((!req.segredo||temSegredo(req.segredo))&&(!req.andar||PERFIL.melhorAndar>=req.andar)&&(!req.vitorias||PERFIL.vitorias>=req.vitorias)&&(!req.partidas||PERFIL.partidas>=req.partidas))}
function listaLiberados(){return[...Object.values(BUILDS).filter(b=>liberado(b.req)).map(b=>`Bolsa ${b.nome}`),...Object.values(RESERVAS).filter(r=>liberado(r.req)).map(r=>r.nome)]}
const runAtiva=()=>!!(S.stats&&S.mapa&&S.fase!=='fim');
const podeContinuar=()=>runAtiva()||temSalvo();
function resumoSalvo(){try{const d=JSON.parse(ARMAZ.getItem(SAVE_KEY)||'null');return d?`Andar ${(d.linha||0)+1} · partida salva`:''}catch(e){return''}}
const miniDado=d=>`<span class="mini-dado" style="--c:${d.encanto?ENCANTOS[d.encanto].ui:'transparent'}" title="${DIE[d.type].nome}${d.encanto?' · '+ENCANTOS[d.encanto].nome:''}">${svgTipo(d.type)}</span>`;
const miniReliq=k=>`<span class="reliq" title="${ITENS[k].nome}: ${ITENS[k].desc}">${svgPath(ITEM_ICONE[k]||k,ITENS[k].cor)}</span>`;
function abrirTela(html){const o=$('overlay');o.classList.remove('ov-menu');document.body.classList.remove('em-menu');if(MESA.orbita){MESA.orbita=false;MESA.voltarCam=true}o.innerHTML=html;o.hidden=false;o.scrollTop=0}

const DICAS_MENU=[
  'Guardar um dado de volta na bolsa é de graça. Puxar um a mais custa no alvo.',
  'No modo Estouro, puxe a alavanca do contador para parar antes de passar do teto.',
  'Completar 3 relíquias de um conjunto vira uma estatueta com um bônus extra.',
  'Encantamentos só mudam a moldura do dado. Passe o mouse para ver o combo.',
  'O Martelo quebra o dado mais forte da casa. Guarde para o chefe.',
  'Juntar ouro também é estratégia: o Mercador tem relíquias raras.',
  'Cada chefe tem uma regra própria. Leia o cartão antes de sentar à mesa.',
  'Errar o alvo por pouco dói pouco. Errar por muito dói muito.'
];
const iconeMenu=k=>`<span class="mi-ic"><svg viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="${PATHS[k]}"/></svg></span>`;
function telaInicial(){
  const b=BUILDS[PERFIL.build]||BUILDS.apostador,r=RESERVAS[PERFIL.reserva]||RESERVAS.d6,kit=b.montar(),ativa=podeContinuar(),viva=runAtiva();
  const des=Math.min(PERFIL.desafio||0,PERFIL.desafioMax||0);
  const vistos=PERFIL.vistos.itens.length+PERFIL.vistos.encantos.length,tot=Object.keys(ITENS).length+encantosAtivos().length;
  const item=(acao,ic,tit,sub,cls='')=>`<button class="menu-item${cls}" data-acao="${acao}">${iconeMenu(ic)}<span class="mi-txt"><b>${tit}</b>${sub?`<small>${sub}</small>`:''}</span><span class="mi-seta">›</span></button>`;
  abrirTela(`<div class="menu">
    <div class="menu-esq">
      <h1 class="menu-titulo"><span>Banca</span><span>Quebrada</span></h1>
      <div class="menu-orn"><i></i>${svgPath('dadoMenu','#d4a94f')}<i></i></div>
      <nav class="menu-nav">
        ${ativa?item('continuar','dadoMenu','Continuar',viva?`Andar ${(S.linha||0)+1} · ${S.fase==='mapa'?'no mapa':S.fase==='loja'?'na loja':S.fase==='evento'?'num evento':S.ini?S.ini.nome:''}`:resumoSalvo(),' principal')+item('nova','espinho','Nova partida','abandona a atual'):item('nova','dadoMenu','Jogar',des?DESAFIOS[des].nome:'',' principal')}
        <div class="menu-grade">
          ${item('colecao','grimorio','Coleção',`${vistos} de ${tot}`)}
          ${item('historico','relogio','Histórico',(PERFIL.historico||[]).length?`${(PERFIL.historico||[]).length} partidas`:'vazio')}
          ${item('regras','pergaminho','Como jogar','regras e combos')}
          ${item('opcoes','engrenagem','Opções','tela, som, velocidade')}
        </div>
        <button class="menu-link" data-acao="teste">Partida de teste · tudo liberado</button>
      </nav>
    </div>
    <aside class="menu-dir">
      <div class="cartao menu-bolsa">
        <p class="cartao-rot">Sua bolsa</p>
        <strong class="cartao-tit">${b.nome}</strong><p>${b.desc}</p>
        <div class="kit">${kit.dados.map(miniDado).join('')}<span class="mini-dado mais" title="${r.nome}">${svgTipo(r.tipo)}</span>${kit.itens.map(miniReliq).join('')}</div>
        <button class="btn sec fino" data-acao="builds">Trocar bolsa e dificuldade</button>
      </div>
      <div class="cartao menu-stats">
        <div class="ms"><b>${PERFIL.vitorias}</b><small>Vitórias</small></div>
        <div class="ms"><b>${PERFIL.melhorAndar}</b><small>Melhor andar</small></div>
        <div class="ms"><b>${PERFIL.partidas}</b><small>Partidas</small></div>
        <div class="ms"><b>${PERFIL.conquistas.length}</b><small>Conquistas</small></div>
        <p class="ms-des">Dificuldade <b>${DESAFIOS[des].nome}</b>${PERFIL.desafioMax?` · até ${DESAFIOS[PERFIL.desafioMax].nome}`:''}</p>
      </div>
      <p class="menu-dica" id="menuDica"><b>Dica</b><span>${DICAS_MENU[Math.floor(Math.random()*DICAS_MENU.length)]}</span></p>
    </aside>
  </div>`);
  $('overlay').classList.add('ov-menu');document.body.classList.add('em-menu');MESA.orbita=true;if(typeof ajustar==='function'&&renderer)ajustar();
}
function telaBuilds(){
  const cartaB=([k,b])=>{
    const ok=liberado(b.req),kit=b.montar(),sel=PERFIL.build===k;
    if(!ok&&b.req.segredo)return`<button class="build trancado segredo" data-acao="build" data-k="${k}" aria-disabled="true"><b>???</b><p>${b.dica}</p><div class="kit">${kit.dados.map(()=>'<span class="mini-dado">?</span>').join('')}</div><span class="cadeado">${svgPath('lupa','#d9a0ff')}Segredo</span></button>`;
    return`<button class="build${sel?' sel':''}${ok?'':' trancado'}" data-acao="build" data-k="${k}" ${ok?'':'aria-disabled="true"'}>
      ${sel?'<span class="selo">Escolhida</span>':''}
      <b>${b.nome}</b><p>${b.desc}</p>
      <div class="kit">${kit.dados.map(miniDado).join('')}${kit.itens.map(miniReliq).join('')}</div>
      ${kit.ouro?`<p class="ouro-ini">Começa com ${kit.ouro} de ouro</p>`:''}
      ${ok?'':`<span class="cadeado">${svgPath('lupa','#f0b07e')}${b.req.txt}</span>`}
    </button>`;
  };
  const cartaR=([k,r])=>{
    const ok=liberado(r.req),sel=PERFIL.reserva===k;
    return`<button class="build pequeno${sel?' sel':''}${ok?'':' trancado'}" data-acao="reserva" data-k="${k}">
      ${sel?'<span class="selo">Escolhido</span>':''}
      <span class="kit"><span class="mini-dado">${svgTipo(r.tipo)}</span><b>${r.nome}</b></span>
      ${ok?'':`<span class="cadeado">${r.req.txt}</span>`}
    </button>`;
  };
  abrirTela(`<div class="tela">
    <div class="tela-topo"><div><p class="menu-sobre">Antes de sentar à mesa</p><h2>Preparar partida</h2></div><button class="btn sec" data-acao="menu">Voltar</button></div>
    <section class="bloco"><h3>Escolha a bolsa</h3><div class="grade-builds">${Object.entries(BUILDS).map(cartaB).join('')}</div></section>
    <section class="bloco"><h3>Dado de reserva · entra junto com a bolsa</h3><div class="grade-builds">${Object.entries(RESERVAS).map(cartaR).join('')}</div></section>
    <section class="bloco"><h3>Dificuldade · cada nível soma ao anterior</h3><div class="grade-builds">${DESAFIOS.map((d,k)=>{const ok=k<=(PERFIL.desafioMax||0),sel=Math.min(PERFIL.desafio||0,PERFIL.desafioMax||0)===k;return`<button class="build pequeno${sel?' sel':''}${ok?'':' trancado'}" data-acao="desafio" data-k="${k}">${sel?'<span class="selo">Escolhida</span>':''}<b>${d.nome}</b><p>${d.desc}</p>${ok?'':`<span class="cadeado">Vença no ${DESAFIOS[k-1].nome}</span>`}</button>`}).join('')}</div></section>
    <div class="acoes"><button class="btn" data-acao="nova">Jogar com esta bolsa</button></div>
  </div>`);
}
function telaColecao(){
  const vi=PERFIL.vistos.itens,ve=PERFIL.vistos.encantos;
  const pecaI=k=>{const ok=vi.includes(k),it=ITENS[k];return`<div class="peca${ok?'':' oculta'}" title="${ok?it.desc:'Ainda não encontrada'}">${ok?miniReliq(k):`<span class="reliq">${svgPath(ITEM_ICONE[k]||k,'#3a2c22')}</span>`}<span>${ok?it.nome:'???'}</span></div>`};
  const pecaE=k=>{const ok=ve.includes(k),en=ENCANTOS[k];return`<div class="peca${ok?'':' oculta'}" title="${ok?en.desc:'Ainda não encontrado'}"><span class="mini-dado" style="--c:${ok?en.ui:'#3a2c22'}">${svgTipo('d6',ok?'#e9e0cb':'#3a2c22')}</span><span>${ok?`${en.nome}<small>${en.combo}</small>`:'???'}</span></div>`};
  abrirTela(`<div class="tela">
    <div class="tela-topo"><div><p class="menu-sobre">Tudo o que você já encontrou</p><h2>Coleção</h2></div><button class="btn sec" data-acao="menu">Voltar</button></div>
    <section class="bloco"><h3>Relíquias · ${vi.length} de ${Object.keys(ITENS).length}</h3><div class="grade-colecao">${Object.keys(ITENS).map(pecaI).join('')}</div></section>
    <section class="bloco"><h3>Encantamentos · ${ve.filter(k=>ENCANTOS[k]&&!ENCANTOS[k].antigo).length} de ${encantosAtivos().length}</h3><div class="grade-colecao">${encantosAtivos().map(pecaE).join('')}</div></section>
    <section class="bloco"><h3>Conquistas · ${PERFIL.conquistas.length} de ${Object.keys(CONQUISTAS).length}</h3><div class="grade-colecao">${Object.entries(CONQUISTAS).map(([k,c])=>{const ok=PERFIL.conquistas.includes(k);return`<div class="peca${ok?'':' oculta'}" title="${c.desc}"><span class="reliq">${svgPath(ok?'fichaSorte':'cadeado',ok?'#f2c661':'#5a4a3c')}</span><span>${c.nome}<small>${c.desc}</small></span></div>`}).join('')}</div></section>
  </div>`);
}
function telaHistorico(){
  const H=PERFIL.historico||[];
  const dur=ms=>{const m=Math.round(ms/60000);return m<1?'menos de 1 min':m<60?`${m} min`:`${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`};
  const quando=t=>{const d=(Date.now()-t)/1000;if(d<3600)return`há ${Math.max(1,Math.round(d/60))} min`;if(d<86400)return`há ${Math.round(d/3600)} h`;if(d<86400*7)return`há ${Math.round(d/86400)} dia${Math.round(d/86400)>1?'s':''}`;return new Date(t).toLocaleDateString('pt-BR')};
  const melhor=H.reduce((m,h)=>!m||h.andar>m.andar||(h.andar===m.andar&&h.maior>m.maior)?h:m,null);
  const vit=H.filter(h=>h.venceu).length,golpe=H.reduce((m,h)=>Math.max(m,h.maior),0),algoz={};
  H.forEach(h=>{if(h.por){const n=h.por.replace(' (Elite)','');algoz[n]=(algoz[n]||0)+1}});
  const pior=Object.entries(algoz).sort((a,b)=>b[1]-a[1])[0];
  const linha=h=>`<div class="hist${h.venceu?' venceu':''}">
    <span class="hist-res">${h.venceu?'Vitória':'Derrota'}</span>
    <div class="hist-corpo"><b>Andar ${h.andar} de ${MAPA_LINHAS} · ${ATOS[Math.min(ATOS.length-1,h.ato||0)].nome}</b>
      <span>Bolsa ${h.bolsa} · ${DESAFIOS[h.desafio]?DESAFIOS[h.desafio].nome:'Normal'}${h.por?` · derrotado por ${h.por}`:''}</span></div>
    <div class="hist-num"><span><b>${h.maior}</b>maior golpe</span><span><b>${h.rodadas}</b>rodadas</span><span><b>${h.reliq}</b>relíquias</span></div>
    <small class="hist-quando">${quando(h.data)} · ${dur(h.dur)}</small>
  </div>`;
  abrirTela(`<div class="tela">
    <div class="tela-topo"><div><p class="menu-sobre">Suas últimas partidas</p><h2>Histórico</h2></div><button class="btn sec" data-acao="menu">Voltar</button></div>
    ${H.length?`<div class="progresso hist-resumo"><div><b>${vit}/${H.length}</b><small>Vitórias</small></div><div><b>${melhor?melhor.andar:0}</b><small>Melhor andar</small></div><div><b>${golpe}</b><small>Maior golpe</small></div><div><b>${pior?pior[1]:0}</b><small>${pior?'Vezes contra '+pior[0]:'Sem derrotas'}</small></div></div>
    <section class="bloco"><div class="hist-lista">${H.map(linha).join('')}</div></section>`:`<p class="op-nota">Nenhuma partida terminada ainda. Jogue uma e ela aparece aqui.</p>`}
  </div>`);
}
function telaRegras(){
  abrirTela(`<div class="tela">
    <div class="tela-topo"><div><p class="menu-sobre">Três atos entre você e o dono da taverna</p><h2>Como jogar</h2></div><button class="btn sec" data-acao="menu">Voltar</button></div>
    <div class="regras">
      <div class="regra"><b>Os atos</b><p>A taverna tem três atos: a Adega, o Salão e o Cofre. Cada um termina num chefe com uma regra própria. Vencer um chefe recupera 15 de vida e garante uma relíquia.</p></div>
      <div class="regra"><b>O bolso</b><p>Consumíveis ficam no bolso, embaixo da bandeja, até 3 por vez. Cada um se usa uma vez durante a luta: o Martelo quebra o dado da casa, o Tônico cura, a Faca fere direto. Você começa com um Martelo.</p></div>
      <div class="regra"><b>A rodada</b><p>Cada inimigo alterna roteiros: Clássico, Duelo, Às Cegas, Desafio Aberto e Estouro. As lâmpadas do contador mostram a ordem dos lances.</p></div>
      <div class="regra"><b>Pressão</b><p>A cada 3 rodadas na mesma luta a base sobe 1 e os erros doem mais. A cada 12 rodadas na partida, a taverna esquenta e tudo fica 1 mais difícil, até +3.</p></div>
      <div class="regra"><b>Estouro</b><p>Fique entre o alvo e o teto. Passou do teto, estourou e o dano é seu. Puxe a alavanca do contador para parar a tempo.</p></div>
      <div class="regra"><b>O alvo</b><p>Alvo é a base do inimigo mais o dado da casa. Bateu? Sua soma vira dano. Não bateu? A diferença fere você.</p></div>
      <div class="regra"><b>A bolsa</b><p>Cada rodada a mão é completada com 3 dados sorteados da bolsa. Puxar mais um custa +${CUSTO_PUXAR} no alvo da rodada. Guardar um dado na bolsa é de graça.</p></div>
      <div class="regra"><b>Combos</b><p>Encantamentos deixam um dado especial, com bordas de metal ou pedra. Cada um ativa um combo: mesmo número, primo, dados próximos, áreas na mesa.</p></div>
      <div class="regra"><b>Áreas</b><p>Alguns dados criam um círculo na mesa ao parar. Tudo que cair dentro sofre o efeito, inclusive os dados da casa contra você.</p></div>
      <div class="regra"><b>A mesa</b><p>Suas relíquias ficam no canto da mesa, os traços do inimigo na borda de cima. Passe o mouse na bolsa da casa para ver os dados dela.</p></div>
      <div class="regra"><b>As faces</b><p>Entre lutas, grave bônus e efeitos nas faces: Dobro, Escudo, Cura, Veneno, Fogo e Ouro.</p></div>
      <div class="regra"><b>Os dados</b><p>Moeda tem 2 faces, então cada melhoria pesa muito. D20 é forte, mas cada face sai menos.</p></div>
    </div>
  </div>`);
}
function chuvaMoedas(){
  if(reduzir)return;
  const c=document.createElement('div');c.className='chuva';document.body.appendChild(c);
  for(let i=0;i<46;i++){
    const m=document.createElement('div');m.innerHTML=MOEDA_VOO;const sv=m.firstChild;sv.style.left=Math.random()*100+'vw';c.appendChild(sv);
    const d=2200+Math.random()*1800,gira=(Math.random()<.5?-1:1)*(360+Math.random()*720);
    sv.animate([{transform:'translateY(0) rotate(0) scale(1,1)'},{transform:`translateY(115vh) rotate(${gira}deg) scale(${Math.random()<.5?-1:1},1)`}],{duration:d,delay:Math.random()*1600,easing:'cubic-bezier(.4,0,.8,.6)',fill:'both'});
    if(i%6===0)setTimeout(()=>SOM.ouro(1),600+Math.random()*2200);
  }
  setTimeout(()=>c.remove(),5200);
}
function fim(venceu){
  S.fase='fim';S.pausado=false;
  const andarAlc=venceu?MAPA_LINHAS:(S.linha||0)+1,antes=listaLiberados();S.retomar=null;
  apagarSalvo();RNG.ativo=false;
  let novoDesafio=false;
  if(!S.teste){
    PERFIL.partidas++;if(venceu)PERFIL.vitorias++;PERFIL.melhorAndar=Math.max(PERFIL.melhorAndar,andarAlc);
    const st=S.stats||{};
    (PERFIL.historico=PERFIL.historico||[]).unshift({data:Date.now(),venceu,andar:andarAlc,ato:atoDe((S.linha||0)),bolsa:S.build||'Apostador',desafio:S.desafio||0,por:venceu?null:(S.ini?S.ini.nome:null),maior:st.maior||0,dano:st.dano||0,rodadas:st.rodadas||0,combos:st.combos||0,dur:st.inicio?Date.now()-st.inicio:0,reliq:new Set(S.itens).size,dados:S.dados.length});
    PERFIL.historico=PERFIL.historico.slice(0,25);
    if(venceu&&(S.desafio||0)>=(PERFIL.desafioMax||0)&&(PERFIL.desafioMax||0)<DESAFIOS.length-1){PERFIL.desafioMax=(PERFIL.desafioMax||0)+1;novoDesafio=true}
    salvarPerfil();
    if(venceu){conquistar('vitoria');if((S.desafio||0)>=3)conquistar('desafio3');if((S.desafio||0)>=5)conquistar('desafio5');if(!S.itens.length)conquistar('maosLimpas')}
  }
  const novos=listaLiberados().filter(x=>!antes.includes(x));if(novoDesafio)novos.push(DESAFIOS[PERFIL.desafioMax].nome);
  if(venceu){SOM.vitoria();setTimeout(()=>SOM.vitoria(),700)}else{SOM.derrota();vinheta('#7a1f14')}
  const st=S.stats||{},seg=Math.round((Date.now()-(st.inicio||Date.now()))/1000),tempo=`${Math.floor(seg/60)}:${String(seg%60).padStart(2,'0')}`;
  const stat=(v,nome,dest)=>`<div class="stat${dest?' destaque':''}"><b data-alvo="${v}">0</b><small>${nome}</small></div>`;
  abrirTela(`<div class="fim${venceu?'':' derrota'}">
    <p class="menu-sobre">${venceu?`Os ${MAPA_LINHAS} andares vencidos`:`Andar ${andarAlc} de ${MAPA_LINHAS}`} · Bolsa ${S.build||'Apostador'}${S.desafio?' · '+DESAFIOS[S.desafio].nome:''}${S.teste?' · teste':''}</p>
    <h1>${venceu?'Você quebrou a banca':'A casa sempre ganha'}</h1>
    <p class="fim-texto">${venceu?`${INIMIGOS[ATOS[ATOS.length-1].chefe].nome} caiu, e a taverna inteira viu. A banca agora é sua.`:`${S.ini?S.ini.nome:'A taverna'} te derrubou. Junte suas fichas e tente outra vez.`}</p>
    <div class="fim-stats">
      ${stat(st.dano||0,'Dano causado',true)}${stat(st.maior||0,'Maior acerto')}${stat(st.combos||0,'Combos')}${stat(st.rodadas||0,'Rodadas')}${stat(S.ouro,'Ouro no bolso')}
      <div class="stat"><b>${tempo}</b><small>Tempo</small></div>
    </div>
    ${novos.length?`<div class="desbloqueio">${svgPath('fichaSorte','#f2c661')}<div><b>Desbloqueado</b><span>${novos.join(' · ')}</span></div></div>`:''}
    <div class="fim-linha"><h3>Relíquias · ${new Set(S.itens).size}</h3><div class="kit">${S.itens.length?[...new Set(S.itens)].map(miniReliq).join(''):'<small>Nenhuma relíquia nesta partida.</small>'}</div></div>
    <div class="fim-linha"><h3>Dados · ${S.dados.length}</h3><div class="kit">${S.dados.map(miniDado).join('')}</div></div>
    <div class="acoes"><button class="btn" data-acao="nova">Jogar de novo</button><button class="btn sec" data-acao="menu">Voltar ao menu</button></div>
  </div>`);
  document.querySelectorAll('.stat b[data-alvo]').forEach((b,i)=>setTimeout(()=>contar(b,+b.dataset.alvo,true),400+i*180));
  if(venceu)chuvaMoedas();
}
function menuAcao(ac,el){
  if(ac==='nova'){novaPartida();return true}
  if(ac==='continuar'){S.pausado=false;if(runAtiva()){if(S.retomar)S.retomar();else fecharOverlay()}else if(!carregarPartida())telaInicial();return true}
  if(ac==='desafio'){const k=+el.dataset.k;if(k<=(PERFIL.desafioMax||0)){PERFIL.desafio=k;salvarPerfil();SOM.compra();telaBuilds()}else SOM.traco();return true}
  if(ac==='menu'){telaInicial();return true}
  if(ac==='builds'){telaBuilds();return true}
  if(ac==='colecao'){telaColecao();return true}
  if(ac==='regras'){telaRegras();return true}
  if(ac==='historico'){telaHistorico();return true}
  if(opcoesAcao(ac,el))return true;
  if(ac==='build'){const k=el.dataset.k;if(liberado(BUILDS[k].req)){PERFIL.build=k;salvarPerfil();SOM.compra();telaBuilds()}else SOM.traco();return true}
  if(ac==='reserva'){const k=el.dataset.k;if(liberado(RESERVAS[k].req)){PERFIL.reserva=k;salvarPerfil();SOM.batida(6,k==='coin');telaBuilds()}else SOM.traco();return true}
  return false;
}

