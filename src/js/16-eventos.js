function paresFundiveis(){const c={};S.dados.forEach(d=>c[d.type]=(c[d.type]||0)+1);return Object.keys(c).filter(t=>c[t]>=2)}
function fundir(a,b){
  const n=novoDado(a.type);
  n.faces.forEach((f,i)=>{const fa=a.faces[i],fb=b.faces[i];f.bonus=Math.max(fa.bonus,fb.bonus)+1;const fx=fa.fx||fb.fx;f.fx=fx?{...fx}:null});
  n.encanto=a.encanto||b.encanto;n.fundido=Math.max(a.fundido||0,b.fundido||0)+1;
  S.dados=S.dados.filter(d=>d!==a&&d!==b);S.dados.push(n);conquistar('fusao');return n;
}
function relRandom(){const l=Object.keys(ITENS).filter(k=>!temItem(k)&&itemDisponivel(k));return l.length?l[Math.floor(R()*l.length)]:null}
function amaldicoar(){const d=pick(S.dados),f=pick(d.faces);f.bonus+=5;f.fx={k:'pacto',n:2};return d}
const mediaNum=d=>d.faces.reduce((s,f)=>s+valorFace(f),0)/d.faces.length;
const EVENTOS=[
 {id:'mendigo',titulo:'O Mendigo da Porta',ic:'luva',cor:'#9a8a70',
  texto:()=>{const n=PERFIL.mendigo||0;return temSegredo('benfeitor')?'O velho da porta continua ali, de capa rasgada. Só você sabe quem ele é de verdade. Ele pisca quando você passa.':n>=2?'O velho está à sua espera. "Você de novo", ele diz, e a voz não parece de mendigo.':n===1?'O mesmo velho da porta. Ele levanta os olhos quando você passa, como se te reconhecesse.':'Encolhido na porta da taverna, um velho de capa rasgada estende a mão. Ninguém olha para ele.'},
  opcoes:()=>[
   {rot:'Dar 5 de ouro',desc:'Uma moeda não vai fazer falta. Ou vai?',trava:S.ouro<5&&'Você não tem 5 de ouro',acao:()=>{
     S.ouro-=5;SOM.ouro(2);
     if(temSegredo('benfeitor')){S.hp=Math.min(S.max,S.hp+cm(8));SOM.cura();return{titulo:'Um velho amigo',texto:'Ele devolve a moeda com uma piscadela e um gole do cantil dele. Você recuperou 8 de vida.',bom:true}}
     if(!S.teste){PERFIL.mendigo=(PERFIL.mendigo||0)+1;salvarPerfil()}
     const n=PERFIL.mendigo||0;
     if(n>=3){S.ouro+=20;revelarSegredo('benfeitor');chuvaMoedas();return{titulo:'O mendigo tira o capuz',texto:'Por baixo da capa, um anel de ouro e um sorriso conhecido: é o antigo dono da banca. "Quem dá sem esperar nada merece sentar à minha mesa." Ele deixa 20 de ouro na sua mão e some na fumaça.',bom:true}}
     return n===2?{titulo:'Ele guarda a moeda com cuidado',texto:'"Eu vou lembrar de você", ele diz, sem tirar os olhos dos seus.',bom:true}:{titulo:'Ele agradece baixinho',texto:'"Que os dados caiam a seu favor."',bom:true}}},
   {rot:'Passar reto',desc:'Você tem os seus próprios problemas.',acao:()=>({titulo:'Você entrou',texto:'Ele nem levanta a cabeça.'})},
   {rot:'Chutar o pote dele',desc:'Umas moedas rolam pela calçada.',acao:()=>{S.ouro+=4;SOM.ouro(3);if(!S.teste&&!temSegredo('benfeitor')){PERFIL.mendigo=0;salvarPerfil()}return{titulo:'Você pegou 4 de ouro',texto:'O velho só observa. Alguma coisa nos olhos dele se apaga.',bom:false}}}]},
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
   S.ouro>0?{rot:S.ouro>=8?'Entregar 8 de ouro':`Entregar seus ${S.ouro} de ouro`,desc:'Evita confusão.',acao:()=>{const v=Math.min(8,S.ouro);S.ouro-=v;SOM.ouro(2);return{titulo:'Ele agradece',texto:`Você entregou ${v} de ouro.`,bom:false}}}
   :{rot:'Mostrar o bolso vazio',desc:'Ele não acredita e te dá um soco: perde 3 de vida.',acao:()=>{S.hp-=3;SOM.dano();return{titulo:'Bolso vazio',texto:'Ele confere, resmunga e vai embora depois de um soco.',bom:false}}},
   {rot:'Reagir',desc:'Perde 7 de vida, mas toma 12 de ouro dele.',trava:S.hp<=7&&'Vida baixa demais',acao:()=>{S.hp-=7;S.ouro+=12;SOM.dano();setTimeout(()=>SOM.ouro(4),300);return{titulo:'Briga de taverna',texto:'Você leva uns socos, mas sai com 12 moedas dele.',bom:true}}}]},
 {id:'monge',titulo:'O Monge dos Dados',ic:'fichaSorte',cor:'#f2c661',texto:'Um monge silencioso abençoa dados em troca de nada. Só pede que você escolha com calma.',
  opcoes:()=>[
   {rot:'Receber um dado abençoado',desc:'Um D6 com Dobro no 6 e Cura 3 no 1.',trava:S.dados.length>=bolsaMax()&&'Bolsa cheia',acao:()=>{const d=novoDado('d6');d.faces[5].fx={k:'dobro'};d.faces[0].fx={k:'cura',n:3};S.dados.push(d);SOM.grava();return{titulo:'Dado abençoado',texto:'Um D6 novo entrou na sua bolsa.',bom:true}}},
   {rot:'Receber cura',desc:'Recupera 15 de vida.',acao:()=>{S.hp=Math.min(S.max,S.hp+cm(15));SOM.cura();return{titulo:'Em paz',texto:'Você recupera 15 de vida.',bom:true}}}]},
 {id:'beco',titulo:'Duelo no Beco',ic:'espinho',cor:'#e0574a',texto:'Um apostador mal-encarado bloqueia o beco. "Uma partida. Quem perder entrega o que tem de mais valioso."',
  opcoes:()=>[
   {rot:'Aceitar o duelo',desc:'Luta contra um elite. Vencer garante uma relíquia.',acao:()=>{const t=inimigoDoNivel(Math.min(6,Math.max(1,Math.floor(S.linha*.7)+1)));const b=INIMIGOS[t];S.no={tipo:'elite',inimigo:t,r:S.linha,extra:pick(EXTRAS_ELITE.filter(x=>!b.tracos.includes(x)))};novaLuta()}},
   {rot:'Recusar',desc:'Dar a volta pela rua de trás.',acao:()=>({titulo:'Você deu a volta',texto:'O apostador ri, mas deixa você passar.'})}]},
 {id:'fundicao',titulo:'Fundição Clandestina',ic:'dupla',cor:'#d9774a',texto:'No porão, um forno derrete dados velhos e molda dados novos. O fundidor não cobra de quem traz dois iguais.',
  opcoes:()=>[
   {rot:'Fundir dois dados',desc:'De graça. O novo dado fica com o melhor de cada face e +1 em todas.',trava:!paresFundiveis().length&&'Você não tem dois dados do mesmo tipo',acao:()=>{montarLoja({titulo:'Fundição',sub:'Escolha dois dados do mesmo tipo.',espolio:[{kind:'fundir',gratis:true,id:uid++}]})}},
   {rot:'Sair',desc:'Está quente demais aqui.',acao:()=>({titulo:'Você subiu a escada',texto:'O calor fica para trás.'})}]},
 {id:'cartomante',titulo:'A Cartomante',ic:'baralho',cor:'#b98ae6',texto:'Uma mulher de véu vira três cartas sobre a mesa. "Eu vejo o seu próximo adversário. Por um preço, ele chega cansado."',
  opcoes:()=>[
   {rot:'Pagar 6 de ouro',desc:'O próximo inimigo começa com 30% a menos de vida.',trava:S.ouro<6&&'Você não tem 6 de ouro',acao:()=>{S.ouro-=6;SOM.ouro(3);S.proxLuta={...(S.proxLuta||{}),vida:.7};return{titulo:'A carta da Torre',texto:'Ela sorri. "Ele vai tropeçar antes mesmo de sentar."',bom:true}}},
   {rot:'Pedir uma leitura de graça',desc:'Ela lê de má vontade: o próximo inimigo ganha um traço extra, mas você ganha 10 de ouro.',acao:()=>{S.ouro+=10;SOM.ouro(4);S.proxLuta={...(S.proxLuta||{}),extra:true};return{titulo:'A carta do Diabo',texto:'"Você pediu." Ela empurra umas moedas e some atrás da cortina.',bom:false}}},
   {rot:'Ir embora',desc:'Futuro é coisa de quem tem tempo.',acao:()=>({titulo:'Sem leitura',texto:'As cartas ficam viradas para baixo.',bom:true})}]},
 {id:'barril',titulo:'O Barril Esquecido',ic:'rum',cor:'#c08a4a',texto:'Um barril lacrado num canto escuro do porão. Alguém escreveu "NÃO ABRA" com giz.',
  opcoes:()=>{const cheio=(S.cons||[]).length>=consMax();return[
   {rot:'Abrir',desc:'Metade das vezes tem um consumível dentro. Na outra metade, vapor venenoso: perde 6 de vida.',trava:(S.hp<=6&&'Vida baixa demais')||(cheio&&'Seu bolso está cheio'),acao:()=>{if(R()<.5){const k=sortear(Object.keys(CONSUMIVEIS).map(k=>({kind:'cons',chave:k})),1,.3)[0].chave;S.cons.push(k);SOM.combo();return{titulo:'Achado!',texto:`Dentro, embrulhado em palha: ${CONSUMIVEIS[k].nome}.`,bom:true}}S.hp-=6;SOM.dano();return{titulo:'Vapor verde',texto:'Você tosse até ver estrelas. Perdeu 6 de vida.',bom:false}}},
   {rot:'Rolar até o taverneiro',desc:'Ele paga 7 de ouro pelo barril fechado.',acao:()=>{S.ouro+=7;SOM.ouro(3);return{titulo:'Negócio fechado',texto:'O taverneiro nem pergunta de onde veio.',bom:true}}}]}},
 {id:'braco',titulo:'Queda de Braço',ic:'lamina',cor:'#e0574a',texto:'Um estivador enorme bate o cotovelo na mesa. "Quem perder paga a rodada."',
  opcoes:()=>[
   {rot:'Aceitar',desc:'Você perde 5 de vida no esforço. 60% de chance de ganhar 16 de ouro.',trava:S.hp<=5&&'Vida baixa demais',acao:()=>{S.hp-=5;SOM.dano();if(R()<.6){S.ouro+=16;setTimeout(()=>SOM.ouro(5),250);return{titulo:'Braço de ferro',texto:'A mesa inteira grita quando o braço dele bate na madeira. Você leva 16 de ouro.',bom:true}}return{titulo:'Ele venceu',texto:'Seu ombro estala. Pelo menos ninguém riu muito.',bom:false}}},
   {rot:'Recusar',desc:'Você não precisa provar nada.',acao:()=>({titulo:'Covarde, mas inteiro',texto:'Ele dá de ombros e procura outro.',bom:true})}]},
 {id:'altar',titulo:'O Altar dos Dados',ic:'fichaSorte',cor:'#f2c661',texto:'Uma pedra lisa coberta de cera de vela. Em cima, um dado partido ao meio. Dizem que o altar troca o fraco pelo forte.',
  opcoes:()=>{const pode=S.dados.length>BOLSA_MIN;return[
   {rot:'Sacrificar o pior dado',desc:'O dado mais fraco da sua bolsa some. O mais forte ganha +1 em todas as faces.',trava:!pode&&`Você precisa de mais de ${BOLSA_MIN} dados`,acao:()=>{const ord=S.dados.slice().sort((a,b)=>mediaNum(a)-mediaNum(b)),pior=ord[0],melhor=ord[ord.length-1];S.dados=S.dados.filter(d=>d!==pior);melhor.faces.forEach(f=>f.bonus+=1);SOM.grava();setTimeout(()=>SOM.combo(),150);return{titulo:'O altar aceitou',texto:`${DIE[pior.type].nome} virou pó. Seu ${DIE[melhor.type].nome} brilha com +1 em todas as faces.`,bom:true}}},
   {rot:'Acender uma vela',desc:'Recupera 6 de vida.',trava:S.hp>=S.max&&'Vida cheia',acao:()=>{S.hp=Math.min(S.max,S.hp+cm(6));SOM.cura();return{titulo:'Um pouco de paz',texto:'O cheiro de cera acalma. Você recuperou 6 de vida.',bom:true}}}]}},
 {id:'copos',titulo:'O Jogo dos Copos',ic:'copo',cor:'#c08a55',texto:'Um trapaceiro mostra uma moeda e cobre com um de três copos de couro. "Siga a moeda com o olho. Acertou, leva 14. Custa só 4."',
  opcoes:()=>[
   {rot:'Jogar',desc:'4 de ouro. Acompanhe o copo da moeda enquanto ele embaralha.',trava:S.ouro<4&&'Você não tem 4 de ouro',acao:()=>{S.ouro-=4;SOM.ouro(2);hud();telaCopos()}},
   {rot:'Ir embora',desc:'Ninguém ganha desse sujeito.',acao:()=>({titulo:'Você seguiu em frente',texto:'Ele dá de ombros e procura outro otário.'})}]},
 {id:'mapa',titulo:'O Mapa Rabiscado',ic:'lupa',cor:'#e3c27a',texto:'Num guardanapo manchado, alguém desenhou o caminho até o cofre de um apostador. Só que ele está de olho em você.',
  opcoes:()=>{const k=relRandom();return[
   {rot:'Seguir o mapa',desc:k?`Ganha ${ITENS[k].nome} agora. O próximo inimigo vem com um traço extra.`:'Não sobrou nenhuma relíquia.',trava:!k&&'Nenhuma relíquia disponível',acao:()=>{ganharItem(k);SOM.item();S.proxLuta={...(S.proxLuta||{}),extra:true};return{titulo:'Achou o esconderijo',texto:`Atrás de um tijolo solto: ${ITENS[k].nome}. Mas alguém viu você saindo.`,bom:true}}},
   {rot:'Vender o mapa',desc:'Um curioso paga 8 de ouro.',acao:()=>{S.ouro+=8;SOM.ouro(4);return{titulo:'Problema de outro',texto:'Você embolsa 8 de ouro e o guardanapo vai embora.',bom:true}}}]}},
 {id:'bardo',titulo:'O Bardo Desafinado',ic:'sino',cor:'#86c48f',texto:'Um bardo canta a sua última partida, errando todas as rimas. Mesmo assim, a taverna inteira para para ouvir.',
  opcoes:()=>[
   {rot:'Pagar 5 por uma canção',desc:'Recupera 14 de vida.',trava:(S.ouro<5&&'Você não tem 5 de ouro')||(S.hp>=S.max&&'Vida cheia'),acao:()=>{S.ouro-=5;S.hp=Math.min(S.max,S.hp+cm(14));SOM.cura();return{titulo:'Uma balada sobre você',texto:'É horrível e maravilhosa. Recuperou 14 de vida.',bom:true}}},
   {rot:'Cantar junto',desc:'De graça. Recupera 5 de vida e ganha 3 de ouro de gorjeta.',acao:()=>{S.hp=Math.min(S.max,S.hp+cm(5));S.ouro+=3;SOM.cura();return{titulo:'Dueto improvável',texto:'Alguém joga moedas. Ninguém sabe se foi por pena.',bom:true}}}]},
];
const DESCANSO={id:'descanso',titulo:'Quarto nos Fundos',ic:'rum',cor:'#86c48f',texto:'Uma cama de palha e uma lamparina. Dá para fazer uma coisa antes de voltar à mesa.',
  opcoes:()=>{const c=Math.round(S.max*.35)+10*qtdItem('cantil');return[
   {rot:'Dormir',desc:`Recupera ${c} de vida.`,trava:S.hp>=S.max&&'Vida cheia',acao:()=>{S.hp=Math.min(S.max,S.hp+cm(c));SOM.cura();return{titulo:'Bem descansado',texto:`Você recuperou ${c} de vida.`,bom:true}}},
   {rot:'Afiar um dado',desc:'+3 numa face que você escolhe, de graça.',acao:()=>{montarLoja({titulo:'Afiar',sub:'Escolha a face que vai receber +3.',espolio:[{kind:'bonus',n:3,gratis:true,id:uid++}]})}},
   {rot:'Fundir dois dados',desc:'Junta dois dados iguais num só, mais forte.',trava:!paresFundiveis().length&&'Você não tem dois dados do mesmo tipo',acao:()=>{montarLoja({titulo:'Fundir',sub:'Escolha dois dados do mesmo tipo.',espolio:[{kind:'fundir',gratis:true,id:uid++}]})}}]}};
function abrirEvento(){const v=S.evVistos||(S.evVistos=[]);let l=EVENTOS.filter(e=>!v.includes(e.id));if(!l.length)l=EVENTOS;let ev=l[Math.floor(R()*l.length)];if(!v.includes('mendigo')&&!temSegredo('benfeitor')&&R()<.25)ev=EVENTOS.find(e=>e.id==='mendigo');v.push(ev.id);telaEvento(ev)}
function abrirDescanso(){telaEvento(DESCANSO)}
function statusRun(){return`<div class="status"><span class="pilula"><small>Vida</small>${S.hp}/${S.max}</span><span class="pilula ouro">${MOEDA}${S.ouro}</span><span class="pilula"><small>Dados</small>${S.dados.length}</span></div>`}
function telaEvento(ev){
  S.fase='evento';S.retomar=()=>telaEvento(ev);S.evAtual=ev.id;salvarPartida();
  const ops=ev.opcoes();S.evOps=ops;
  abrirTela(`<div class="evento">
    <div class="ev-topo"><div class="ev-selo" style="--c:${ev.cor}">${svgPath(ev.ic,'#2a1a0c')}</div><div><p class="menu-sobre">${ev===DESCANSO?'Descanso':'Evento'} · andar ${(S.linha||0)+1}</p><h2>${ev.titulo}</h2></div></div>
    <p class="ev-texto">${typeof ev.texto==='function'?ev.texto():ev.texto}</p>
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

