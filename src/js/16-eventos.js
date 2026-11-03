function paresFundiveis(){const c={};S.dados.forEach(d=>c[d.type]=(c[d.type]||0)+1);return Object.keys(c).filter(t=>c[t]>=2)}
function fundir(a,b){
  const n=novoDado(a.type);
  n.faces.forEach((f,i)=>{const fa=a.faces[i],fb=b.faces[i];f.bonus=Math.max(fa.bonus,fb.bonus)+1;const fx=fa.fx||fb.fx;f.fx=fx?{...fx}:null});
  n.encanto=a.encanto||b.encanto;n.fundido=Math.max(a.fundido||0,b.fundido||0)+1;
  S.dados=S.dados.filter(d=>d!==a&&d!==b);S.dados.push(n);conquistar('fusao');return n;
}
function relRandom(){const l=Object.keys(ITENS).filter(k=>!temItem(k));return l.length?l[Math.floor(R()*l.length)]:null}
function amaldicoar(){const d=pick(S.dados),f=pick(d.faces);f.bonus+=5;f.fx={k:'pacto',n:2};return d}
const mediaNum=d=>d.faces.reduce((s,f)=>s+valorFace(f),0)/d.faces.length;
const EVENTOS=[
 {id:'bebado',titulo:'O Bêbado e o Dado',ic:'rum',cor:'#d9a83e',texto:'Um velho cambaleia até a sua mesa com um dado lascado. "Dobro ou nada, forasteiro. Eu nunca perco."',
  opcoes:()=>[
   {rot:'Apostar 10 de ouro',desc:'Metade das vezes você volta com 20.',trava:S.ouro<10&&'Você não tem 10 de ouro',acao:()=>{if(R()<.5){S.ouro+=10;SOM.ouro(5);return{titulo:'Ele perdeu',texto:'O velho resmunga e paga. Você ganhou 10 de ouro.',bom:true}}S.ouro-=10;SOM.derrota();return{titulo:'Ele nunca perde',texto:'O dado dele parece ter dois seis. Você perdeu 10 de ouro.',bom:false}}},
   {rot:'Apostar tudo',desc:`Seus ${S.ouro} de ouro. 45% de chance de dobrar.`,trava:S.ouro<=0&&'Seu bolso está vazio',acao:()=>{const v=S.ouro;if(R()<.45){S.ouro+=v;SOM.ouro(6);chuvaMoedas();return{titulo:'Dobrou!',texto:`A taverna inteira grita. Você ganhou ${v} de ouro.`,bom:true}}S.ouro=0;SOM.derrota();return{titulo:'Nada',texto:`O velho guarda suas ${v} moedas e some na fumaça.`,bom:false}}},
   {rot:'Ir embora',desc:'Nenhuma aposta hoje.',acao:()=>({titulo:'Você seguiu em frente',texto:'O velho já está apostando com outra mesa.'})}]},
 {id:'ferreira',titulo:'A Ferreira de Dados',ic:'lamina',cor:'#c99a6a',texto:'Uma ferreira de braços queimados lima as arestas de dados alheios. "Afio qualquer coisa. O preço é que varia."',
  opcoes:()=>[
   {rot:'Pagar 6 de vida',desc:'+2 em três faces aleatórias da sua bolsa.',trava:S.hp<=6&&'Vida baixa demais',acao:()=>{S.hp-=6;const al=[];for(let i=0;i<3;i++){const d=pick(S.dados),f=pick(d.faces);f.bonus+=2;al.push(`${DIE[d.type].curto} (face ${f.v})`)}SOM.grava();return{titulo:'Afiado no sangue',texto:`Você perdeu 6 de vida. Ganharam +2: ${al.join(', ')}.`,bom:true}}},
   {rot:'Pagar 8 de ouro',desc:'+3 numa face que você escolhe.',trava:S.ouro<8&&'Você não tem 8 de ouro',acao:()=>{S.ouro-=8;SOM.ouro(3);montarLoja({titulo:'A Ferreira',sub:'Escolha a face que vai receber +3.',espolio:[{kind:'bonus',n:3,gratis:true,id:uid++}]})}},
   {rot:'Recusar',desc:'Seus dados ficam como estão.',acao:()=>({titulo:'Talvez outra hora',texto:'A ferreira volta a bater o martelo.'})}]},
 {id:'maldita',titulo:'A Relíquia Amaldiçoada',ic:'grimorio',cor:'#9b6fe0',texto:'Num baú esquecido atrás do balcão, uma relíquia pulsa. Quem tocou nela antes nunca mais jogou limpo.',
  opcoes:()=>{const k=relRandom();return[
   {rot:'Pegar a relíquia',desc:k?`Ganha ${ITENS[k].nome}. Uma face de um dado seu vira Pacto: +5, mas custa 2 de vida ao cair.`:'Não sobrou nenhuma relíquia.',trava:!k&&'Nenhuma relíquia disponível',acao:()=>{ganharItem(k);const d=amaldicoar();SOM.item();return{titulo:ITENS[k].nome,texto:`${ITENS[k].desc} Seu ${DIE[d.type].nome} ganhou uma face de Pacto.`,bom:true}}},
   {rot:'Fechar o baú',desc:'Melhor não.',acao:()=>({titulo:'Baú fechado',texto:'O pulsar some aos poucos.'})}]}},
 {id:'fonte',titulo:'A Fonte dos Desejos',ic:'medalhao',cor:'#5b8fe0',texto:'No pátio dos fundos, uma fonte de pedra está cheia de dados e moedas. Dizem que ela atende quem dá algo de valor.',
  opcoes:()=>{const pior=[...S.dados].sort((a,b)=>mediaNum(a)-mediaNum(b))[0];return[
   {rot:'Jogar seu pior dado',desc:pior?`Perde o ${DIE[pior.type].nome} de média ${mediaDado(pior)}. Ganha 15 de ouro e 10 de vida.`:'',trava:S.dados.length<=BOLSA_MIN&&`Você precisa de mais de ${BOLSA_MIN} dados`,acao:()=>{S.dados=S.dados.filter(d=>d!==pior);S.ouro+=15;S.hp=Math.min(S.max,S.hp+cm(10));SOM.cura();return{titulo:'A fonte aceitou',texto:'A água borbulha e devolve 15 moedas. Você recupera 10 de vida.',bom:true}}},
   {rot:'Jogar 5 de ouro',desc:'Recupera 8 de vida.',trava:S.ouro<5&&'Você não tem 5 de ouro',acao:()=>{S.ouro-=5;S.hp=Math.min(S.max,S.hp+cm(8));SOM.cura();return{titulo:'Um desejo pequeno',texto:'Você recupera 8 de vida.',bom:true}}},
   {rot:'Seguir',desc:'Desejos são para os fracos.',acao:()=>({titulo:'Você seguiu',texto:'A fonte continua borbulhando.'})}]}},
 {id:'mascate',titulo:'O Mascate',ic:'algibeira',cor:'#c08a55',texto:'Um mascate abre a capa cheia de bolsos. "Troco relíquia por relíquia. Sem perguntas, sem devoluções."',
  opcoes:()=>{const tem=[...new Set(S.itens)];return[
   {rot:'Trocar uma por duas',desc:'Perde uma relíquia sua aleatória e ganha duas aleatórias.',trava:!tem.length&&'Você não tem relíquias',acao:()=>{const k=pick(tem);S.itens.splice(S.itens.indexOf(k),1);if(k==='medalhao'){S.max-=10;S.hp=Math.min(S.hp,S.max)}const a=relRandom();if(a)ganharItem(a);const b=relRandom();if(b)ganharItem(b);SOM.item();return{titulo:'Negócio feito',texto:`Você entregou ${ITENS[k].nome} e levou ${[a,b].filter(Boolean).map(x=>ITENS[x].nome).join(' e ')||'nada'}.`,bom:true}}},
   {rot:'Comprar uma por 14 de ouro',desc:'Uma relíquia aleatória.',trava:(S.ouro<14&&'Você não tem 14 de ouro')||(!relRandom()&&'Nada para vender'),acao:()=>{S.ouro-=14;const a=relRandom();ganharItem(a);SOM.compra();return{titulo:ITENS[a].nome,texto:ITENS[a].desc,bom:true}}},
   {rot:'Dispensar',desc:'Você já tem bugigangas demais.',acao:()=>({titulo:'O mascate sumiu',texto:'Nem deu para ver para onde ele foi.'})}]}},
 {id:'ladrao',titulo:'Mão Leve',ic:'luva',cor:'#9a8a70',texto:'Você sente uma mão no seu bolso. O ladrão percebe que foi visto e sorri.',
  opcoes:()=>[
   {rot:'Entregar 8 de ouro',desc:'Evita confusão.',acao:()=>{const v=Math.min(8,S.ouro);S.ouro-=v;SOM.ouro(2);return{titulo:'Ele agradece',texto:`Você entregou ${v} de ouro.`,bom:false}}},
   {rot:'Reagir',desc:'Perde 7 de vida, mas toma 12 de ouro dele.',trava:S.hp<=7&&'Vida baixa demais',acao:()=>{S.hp-=7;S.ouro+=12;SOM.dano();setTimeout(()=>SOM.ouro(4),300);return{titulo:'Briga de taverna',texto:'Você leva uns socos, mas sai com 12 moedas dele.',bom:true}}}]},
 {id:'monge',titulo:'O Monge dos Dados',ic:'fichaSorte',cor:'#f2c661',texto:'Um monge silencioso abençoa dados em troca de nada. Só pede que você escolha com calma.',
  opcoes:()=>[
   {rot:'Receber um dado abençoado',desc:'Um D6 com Dobro no 6 e Cura 3 no 1.',trava:S.dados.length>=bolsaMax()&&'Bolsa cheia',acao:()=>{const d=novoDado('d6');d.faces[5].fx={k:'dobro'};d.faces[0].fx={k:'cura',n:3};S.dados.push(d);SOM.grava();return{titulo:'Dado abençoado',texto:'Um D6 novo entrou na sua bolsa.',bom:true}}},
   {rot:'Receber cura',desc:'Recupera 15 de vida.',acao:()=>{S.hp=Math.min(S.max,S.hp+cm(15));SOM.cura();return{titulo:'Em paz',texto:'Você recupera 15 de vida.',bom:true}}}]},
 {id:'beco',titulo:'Duelo no Beco',ic:'espinho',cor:'#e0574a',texto:'Um apostador mal-encarado bloqueia o beco. "Uma partida. Quem perder entrega o que tem de mais valioso."',
  opcoes:()=>[
   {rot:'Aceitar o duelo',desc:'Luta contra um elite. Vencer garante uma relíquia.',acao:()=>{const t=Math.min(6,Math.max(1,Math.floor(S.linha*.7)+1));const b=INIMIGOS[t];S.no={tipo:'elite',inimigo:t,r:S.linha,extra:pick(EXTRAS_ELITE.filter(x=>!b.tracos.includes(x)))};novaLuta()}},
   {rot:'Recusar',desc:'Dar a volta pela rua de trás.',acao:()=>({titulo:'Você deu a volta',texto:'O apostador ri, mas deixa você passar.'})}]},
 {id:'fundicao',titulo:'Fundição Clandestina',ic:'dupla',cor:'#d9774a',texto:'No porão, um forno derrete dados velhos e molda dados novos. O fundidor não cobra de quem traz dois iguais.',
  opcoes:()=>[
   {rot:'Fundir dois dados',desc:'De graça. O novo dado fica com o melhor de cada face e +1 em todas.',trava:!paresFundiveis().length&&'Você não tem dois dados do mesmo tipo',acao:()=>{montarLoja({titulo:'Fundição',sub:'Escolha dois dados do mesmo tipo.',espolio:[{kind:'fundir',gratis:true,id:uid++}]})}},
   {rot:'Sair',desc:'Está quente demais aqui.',acao:()=>({titulo:'Você subiu a escada',texto:'O calor fica para trás.'})}]}
];
const DESCANSO={id:'descanso',titulo:'Quarto nos Fundos',ic:'rum',cor:'#86c48f',texto:'Uma cama de palha e uma lamparina. Dá para fazer uma coisa antes de voltar à mesa.',
  opcoes:()=>{const c=Math.round(S.max*.35)+10*qtdItem('cantil');return[
   {rot:'Dormir',desc:`Recupera ${c} de vida.`,trava:S.hp>=S.max&&'Vida cheia',acao:()=>{S.hp=Math.min(S.max,S.hp+cm(c));SOM.cura();return{titulo:'Bem descansado',texto:`Você recuperou ${c} de vida.`,bom:true}}},
   {rot:'Afiar um dado',desc:'+3 numa face que você escolhe, de graça.',acao:()=>{montarLoja({titulo:'Afiar',sub:'Escolha a face que vai receber +3.',espolio:[{kind:'bonus',n:3,gratis:true,id:uid++}]})}},
   {rot:'Fundir dois dados',desc:'Junta dois dados iguais num só, mais forte.',trava:!paresFundiveis().length&&'Você não tem dois dados do mesmo tipo',acao:()=>{montarLoja({titulo:'Fundir',sub:'Escolha dois dados do mesmo tipo.',espolio:[{kind:'fundir',gratis:true,id:uid++}]})}}]}};
function abrirEvento(){const v=S.evVistos||(S.evVistos=[]);let l=EVENTOS.filter(e=>!v.includes(e.id));if(!l.length)l=EVENTOS;const ev=l[Math.floor(R()*l.length)];v.push(ev.id);telaEvento(ev)}
function abrirDescanso(){telaEvento(DESCANSO)}
function statusRun(){return`<div class="status"><span class="pilula"><small>Vida</small>${S.hp}/${S.max}</span><span class="pilula ouro">${MOEDA}${S.ouro}</span><span class="pilula"><small>Dados</small>${S.dados.length}</span></div>`}
function telaEvento(ev){
  S.fase='evento';S.retomar=()=>telaEvento(ev);S.evAtual=ev.id;salvarPartida();
  const ops=ev.opcoes();S.evOps=ops;
  abrirTela(`<div class="evento">
    <div class="ev-topo"><div class="ev-selo" style="--c:${ev.cor}">${svgPath(ev.ic,'#2a1a0c')}</div><div><p class="menu-sobre">${ev===DESCANSO?'Descanso':'Evento'} · andar ${(S.linha||0)+1}</p><h2>${ev.titulo}</h2></div></div>
    <p class="ev-texto">${ev.texto}</p>
    <div class="ev-ops">${ops.map((o,i)=>`<button class="ev-op" data-acao="ev" data-i="${i}" ${o.trava?'disabled':''}><b>${o.rot}</b><span>${o.desc||''}</span>${o.trava?`<em>${o.trava}</em>`:''}</button>`).join('')}</div>
    ${statusRun()}
  </div>`);
}
function resultadoEvento(r){
  hud();
  if(S.hp<=0){fim(false);return}
  S.fase='evento';S.retomar=()=>resultadoEvento(r);S.evAtual=null;salvarPartida();
  const cor=r.bom===false?'#e0574a':r.bom?'#86c48f':'#b3a68c';
  abrirTela(`<div class="evento">
    <div class="ev-topo"><div class="ev-selo" style="--c:${cor}">${svgPath(r.bom===false?'espinho':'fichaSorte','#2a1a0c')}</div><div><p class="menu-sobre">Resultado</p><h2>${r.titulo}</h2></div></div>
    <p class="ev-texto">${r.texto}</p>
    ${statusRun()}
    <div class="acoes"><button class="btn" data-acao="mapa">Voltar ao mapa</button></div>
  </div>`);
  if(r.bom)setTimeout(()=>{const s=document.querySelector('.ev-selo');if(s)pulsar(s)},50);
}

