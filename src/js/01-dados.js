const DIE={
  d6:{nome:'Dado de 6',curto:'D6',faces:[1,2,3,4,5,6],cor:'#e9e0cb',tinta:'#2b211a',up:'#9a640e',preco:6,txt:.5},
  coin:{nome:'Moeda',curto:'Moeda',faces:[4,1],rot:['Cara','Coroa'],cor:'#c89838',tinta:'#3a280b',up:'#7a1f14',preco:4,txt:.46,metal:true},
  d10:{nome:'Dado de 10',curto:'D10',faces:[1,2,3,4,5,6,7,8,9,10],cor:'#2e6a6c',tinta:'#f1e8d4',up:'#f0c35e',preco:11,txt:.4},
  d20:{nome:'Dado de 20',curto:'D20',faces:Array.from({length:20},(_,i)=>i+1),cor:'#8a2d37',tinta:'#f3e9d5',up:'#f2c661',preco:18,txt:.34}
};
const CASA={cor:'#2a2830',tinta:'#e8d8ae'};
const TEMAS_CASA={
  'Rato da Adega':{nome:'Osso roído',base:'#d6c9aa',mix:.78,tinta:'#3a2a1a',rough:.78,grao:22},
  'Batedor de Bolsos':{nome:'Madeira gasta',base:'#6e4b2a',mix:.62,tinta:'#f0dcb0',rough:.62,grao:16,veios:true},
  'Crupiê Trapaceiro':{nome:'Marfim de cassino',base:'#1e5a3c',mix:.5,tinta:'#f2d68a',rough:.24,borda:'#d4a94f'},
  'Guarda Endividado':{nome:'Ferro amassado',base:'#6a7179',mix:.62,tinta:'#16161a',rough:.42,metal:.35,grao:10},
  'Bruxa das Fichas':{nome:'Vidro encantado',base:'#5a2a80',mix:.6,tinta:'#d8f07a',rough:.12,vidro:true,brilho:'#7a3ab0'},
  'Cavaleiro Falido':{nome:'Aço com friso',base:'#9aa3ad',mix:.56,tinta:'#24180c',rough:.3,metal:.45,borda:'#c99a3f'},
  'Ogro Apostador':{nome:'Pedra lascada',base:'#6c6a60',mix:.68,tinta:'#ece4cc',rough:.92,grao:30},
  'O Dono da Casa':{nome:'Ouro maciço',base:'#c9a040',mix:.72,tinta:'#1a1208',rough:.3,metal:.5,borda:'#2a1c10'},
  'O Taberneiro Caolho':{nome:'Tampa de barril',base:'#4e2e18',mix:.66,tinta:'#ecca8c',rough:.58,grao:14,veios:true,borda:'#8a8f96'},
  'Bêbado da Esquina':{nome:'Caneca de estanho',base:'#8e9196',mix:.6,tinta:'#2a2418',rough:.45,metal:.3,grao:12},
  'Aprendiz de Crupiê':{nome:'Baralho velho',base:'#a8322e',mix:.55,tinta:'#f4ead0',rough:.55,grao:8,borda:'#f0e6cc'},
  'Contrabandista do Porto':{nome:'Âmbar do porto',base:'#b8741e',mix:.6,tinta:'#2a1606',rough:.2,vidro:true,brilho:'#7a3a06'},
  'Mercenária de Aluguel':{nome:'Couro cravejado',base:'#4a2c1c',mix:.66,tinta:'#e8d2a0',rough:.7,grao:18,borda:'#b9bfc7'},
  'Alquimista Louco':{nome:'Vidro verde',base:'#2e7a3a',mix:.6,tinta:'#f2ff9a',rough:.12,vidro:true,brilho:'#3a9a2a'},
  'Agiota de Capuz':{nome:'Prata manchada',base:'#8a8e96',mix:.6,tinta:'#3a0e14',rough:.32,metal:.4,grao:14},
  'Capitão da Guarda':{nome:'Bronze polido',base:'#9a6a2a',mix:.65,tinta:'#1a0e04',rough:.28,metal:.45,borda:'#e0c070'},
  'A Viúva das Apostas':{nome:'Ônix de luto',base:'#151017',mix:.78,tinta:'#e6a6c4',rough:.16,borda:'#b6bfcc'}
};
const temaCasa=()=>S.ini&&S.ini.tema?TEMAS_CASA[S.ini.tema]:null;
function corCasa(die){const T=temaCasa(),c=die.cor||CASA.cor;if(!T)return c;return '#'+new THREE.Color(c).lerp(new THREE.Color(T.base),T.mix).getHexString()}
const ICONE_TIPO={
  d6:'<rect x="4" y="4" width="16" height="16" rx="3"/>',
  coin:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5" fill="none"/>',
  d10:'<path d="M12 2 L21 10 L12 22 L3 10 Z"/><path d="M3 10 L12 13 L21 10 M12 13 V22" fill="none"/>',
  d20:'<path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z"/><path d="M12 6 L17.5 15 H6.5 Z" fill="none"/>'
};
const PATHS={
  escudo:'M12 2 L20 5 V11 C20 16.5 16.5 20.5 12 22 C7.5 20.5 4 16.5 4 11 V5 Z',
  cura:'M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z',
  veneno:'M12 2 C12 2 5 10.5 5 15 A7 7 0 0 0 19 15 C19 10.5 12 2 12 2 Z',
  fogo:'M12 2 C13 6 18 8.5 18 14.5 A6 6 0 0 1 6 14.5 C6 11 8 9.5 9 7 C10 10 11.5 10.5 12 9.5 C12.8 7.5 12 4.5 12 2 Z',
  ouro:'M12 3 A9 9 0 1 1 11.99 3 Z M12 7 A5 5 0 1 0 12.01 7 Z',
  espinho:'M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z',
  roubo:'M12 1 L14.5 13 L12 15.5 L9.5 13 Z M6 14.5 H18 V17 H13.5 V23 H10.5 V17 H6 Z',
  ferradura:'M5 3 C1 10 3 20 12 22 C21 20 23 10 19 3 L15.5 4.5 C18.5 10 17 16.5 12 17.5 C7 16.5 5.5 10 8.5 4.5 Z',
  copo:'M4 3 H20 L17.5 21 H6.5 Z M7 6 L8.5 18 H10 L9 6 Z',
  bolsaFunda:'M8 2 C9 4.5 15 4.5 16 2 L14 7 C19 9 21.5 13 21.5 16.5 C21.5 20.5 17.5 22.5 12 22.5 C6.5 22.5 2.5 20.5 2.5 16.5 C2.5 13 5 9 10 7 Z',
  lamina:'M21 1 L23 3 L10 16 L8 14 Z M3.5 13.5 L10.5 20.5 L8.5 22.5 L6.5 20.5 L3 24 L0 21 L3.5 17.5 L1.5 15.5 Z',
  calice:'M5 2 H19 C19 8.5 15.5 12 13.2 12 V18.5 H17.5 V22 H6.5 V18.5 H10.8 V12 C8.5 12 5 8.5 5 2 Z',
  dadoOuro:'M3 3 H21 V21 H3 Z M9.5 8 A1.8 1.8 0 1 0 5.9 8 A1.8 1.8 0 1 0 9.5 8 Z M13.8 12 A1.8 1.8 0 1 0 10.2 12 A1.8 1.8 0 1 0 13.8 12 Z M18.1 16 A1.8 1.8 0 1 0 14.5 16 A1.8 1.8 0 1 0 18.1 16 Z',
  espelho:'M12 1.5 C17.5 1.5 19.5 6 19.5 10 C19.5 14.5 16.5 17.5 13.3 17.8 V22.5 H10.7 V17.8 C7.5 17.5 4.5 14.5 4.5 10 C4.5 6 6.5 1.5 12 1.5 Z M11 5 L9 9 L12 10 L10 14 L14 9 L11 8 L13 5 Z',
  lupa:'M9.5 1.5 A8 8 0 1 0 9.51 1.5 Z M9.5 4.5 A5 5 0 1 1 9.49 4.5 Z M14.5 16.5 L16.5 14.5 L23 21 L21 23 Z',
  coroa:'M2 7 L7 12 L12 3 L17 12 L22 7 L20 20 H4 Z',
  subir:'M12 1.5 L22 12 H15.5 V22.5 H8.5 V12 H2 Z',
  dupla:'M1.5 8.5 H12.5 V19.5 H1.5 Z M9.5 3.5 H22.5 V16.5 H15 V6.5 H9.5 Z',
  cadeado:'M7 10 V7 A5 5 0 0 1 17 7 V10 H19 V22 H5 V10 Z M9.5 10 H14.5 V7 A2.5 2.5 0 0 0 9.5 7 Z',
  pacto:'M12 2 C12 2 5 10.5 5 15 A7 7 0 0 0 19 15 C19 10.5 12 2 12 2 Z',
  pena:'M20.5 1.5 C10 4 5 12 4 20 L3 23 L5 22 C7 16 11 11 16 8 C13 12 10 16 8 20 C16.5 17 21.5 10 20.5 1.5 Z',
  trevo:'M12 12 C8 16 3 13 5 9 C2 6 6 2 9 4 C11 1 15 2 15 5 C19 4 22 8 19 11 C22 15 17 19 14 16 L16.5 22.5 H14 L12 16 Z',
  ampulheta:'M5 1.5 H19 V4 C19 8 14 10 14 12 C14 14 19 16 19 20 V22.5 H5 V20 C5 16 10 14 10 12 C10 10 5 8 5 4 Z',
  ima:'M3.5 2.5 H9 V12 A3 3 0 0 0 15 12 V2.5 H20.5 V12 A8.5 8.5 0 0 1 3.5 12 Z M3.5 5 H9 V6.5 H3.5 Z M15 5 H20.5 V6.5 H15 Z',
  peconha:'M9 1.5 H15 V4 H14 V9 L20 19 C21 21 20 22.5 18 22.5 H6 C4 22.5 3 21 4 19 L10 9 V4 H9 Z',
  balsamo:'M7 1.5 H17 V5 H7 Z M5 6 H19 L18 22.5 H6 Z M10 11 H14 V13 H16 V17 H14 V19 H10 V17 H8 V13 H10 Z',
  broquel:'M12 1.5 A10.5 10.5 0 1 1 11.99 1.5 Z M12 8 A4 4 0 1 0 12.01 8 Z',
  baralho:'M2.5 5 L13 3 L16 19.5 L5.5 21.5 Z M14.5 3.5 L21.5 6 L18 21.5 L16.8 19.5 Z',
  relogio:'M10 .5 H14 V2.5 H13 V3.6 A9.5 9.5 0 1 1 11 3.6 V2.5 H10 Z M12 6.5 A6.5 6.5 0 1 0 12.01 6.5 Z M11.2 8.5 H12.8 V12.6 L15.4 14.8 L14.3 16 L11.2 13.4 Z',
  brasa:'M4 18 C4 14.5 8 12.5 12 12.5 C16 12.5 20 14.5 20 18 C20 20.2 17 21.2 12 21.2 C7 21.2 4 20.2 4 18 Z M12 2.5 C13.2 5.5 15.5 6.8 15.5 9.4 A3.5 3.5 0 0 1 8.5 9.4 C8.5 7.8 9.6 6.8 10.2 5.8 C10.8 7.4 11.8 7.6 12 6.6 C12.3 5.4 12 4 12 2.5 Z',
  cachimbo:'M2.5 9 H11.5 V12.2 C11.5 15.4 9.4 17.5 6.9 17.5 C4.3 17.5 2.5 15.7 2.5 13.2 Z M11 10 L21 6 L21.9 8.1 L12 12.2 Z M4.5 5.5 C5.5 4.5 5.5 3.5 4.8 2.5 L6 2 C7 3.3 7 4.8 5.7 6.2 Z',
  tabua:'M4 3 H20 V21 H4 Z M6.8 6 V18 H8.4 V6 Z M10.2 6 V18 H11.8 V6 Z M13.6 6 V18 H15.2 V6 Z',
  velaNegra:'M8.5 9 H15.5 V21.5 H8.5 Z M12 1.8 C13.6 3.9 14.2 5 14.2 6.1 A2.2 2.2 0 0 1 9.8 6.1 C9.8 5 10.4 3.9 12 1.8 Z',
  moedaPesada:'M12 2.5 A9.5 9.5 0 1 1 11.99 2.5 Z M9 9 H15 V15 H9 Z',
  dadoOsso:'M5.5 3 H18.5 A2.5 2.5 0 0 1 21 5.5 V18.5 A2.5 2.5 0 0 1 18.5 21 H5.5 A2.5 2.5 0 0 1 3 18.5 V5.5 A2.5 2.5 0 0 1 5.5 3 Z M12 9.2 A2.8 2.8 0 1 0 12.01 9.2 Z',
  cantil:'M10 1.5 H14 V5 H10 Z M12 4.5 A8.5 8.5 0 1 1 11.99 4.5 Z M12 9 A4 4 0 1 0 12.01 9 Z',
  martelo:'M2.5 7.5 L7.5 2.5 L12.5 7.5 L10.6 9.4 L21 19.8 L19.8 21 L9.4 10.6 L7.5 12.5 Z',
  tonico:'M10 2 H14 V4 H13.5 V8 C17 9 19 11.5 19 15 A7 7 0 0 1 5 15 C5 11.5 7 9 10.5 8 V4 H10 Z M8 15 A4 4 0 0 0 16 15 Z',
  faca:'M4 20 L15.5 8.5 C17.5 6.5 20 3.5 21.5 2.5 C20.5 4 17.5 6.5 15.5 8.5 L17 10 L5.5 21.5 Z M2.5 21.5 L4 20 L5.5 21.5 L4 23 Z',
  frasco:'M10 2 H14 V7 C17.5 8.2 20 11.2 20 15 A8 7 0 0 1 4 15 C4 11.2 6.5 8.2 10 7 Z M7 15 C7 18 9 19.5 12 19.5 C15 19.5 17 18 17 15 Z',
  peso:'M9 3 H15 V6 H17 L20 21 H4 L7 6 H9 Z M10.5 4.4 V6 H13.5 V4.4 Z',
  maoLeve:'M7 11 V5 A1.5 1.5 0 0 1 10 5 V10 V3.5 A1.5 1.5 0 0 1 13 3.5 V10 V4.5 A1.5 1.5 0 0 1 16 4.5 V11 V7.5 A1.5 1.5 0 0 1 19 7.5 V14 C19 18.5 16 21.5 12 21.5 C8.5 21.5 6.5 19.5 5 16.5 L3 12.5 A1.5 1.5 0 0 1 5.6 11 Z',
  fichaSorte:'M12 1.5 L15.2 8.6 L22.8 9.1 L17 14 L18.8 21.5 L12 17.4 L5.2 21.5 L7 14 L1.2 9.1 L8.8 8.6 Z',
  sino:'M12 1.5 C13 1.5 13.6 2.1 13.6 3 C17.2 3.9 18.7 7 18.7 11 V16 L21.2 19 H2.8 L5.3 16 V11 C5.3 7 6.8 3.9 10.4 3 C10.4 2.1 11 1.5 12 1.5 Z M9.6 20 H14.4 A2.4 2.4 0 0 1 9.6 20 Z',
  pergaminho:'M5 2.5 H17 A3 3 0 0 1 20 5.5 V19 A3 3 0 0 1 17 22 H7 A3 3 0 0 1 4 19 V16.5 H7 V5.5 A3 3 0 0 0 5 2.5 Z M10 8 H17 V9.5 H10 Z M10 12 H17 V13.5 H10 Z',
  grimorio:'M4 2.5 H18 A2 2 0 0 1 20 4.5 V21.5 H6 A2 2 0 0 1 4 19.5 Z M8 6.5 H16 V9 H8 Z M11 12 L13.5 15 L11 18 L8.5 15 Z',
  algibeira:'M6 8 H18 L20.5 20 C20.5 21.6 19.5 22.5 18 22.5 H6 C4.5 22.5 3.5 21.6 3.5 20 Z M8.6 8 C8.6 3 15.4 3 15.4 8 H13.4 C13.4 5.5 10.6 5.5 10.6 8 Z',
  medalhao:'M12 21.5 C5 15.5 1.5 11.7 1.5 8 A5.2 5.2 0 0 1 12 5.5 A5.2 5.2 0 0 1 22.5 8 C22.5 11.7 19 15.5 12 21.5 Z',
  rum:'M10 1.5 H14 V7 C17 8 18 10 18 13 V21.5 C18 22.1 17.6 22.5 17 22.5 H7 C6.4 22.5 6 22.1 6 21.5 V13 C6 10 7 8 10 7 Z M8 14 H16 V18 H8 Z',
  luva:'M 10.4 19.6 C 9.1 17.8 7.6 15.9 6.4 14 C 5.7 12.9 6.8 11.6 7.9 12.3 L 9.8 13.6 V 5.4 A 0.7 0.7 0 0 1 11.2 5.4 V 10.6 H 11.4 V 3.6 A 0.7 0.7 0 0 1 12.8 3.6 V 10.4 H 13 V 3.1 A 0.7 0.7 0 0 1 14.4 3.1 V 10.4 H 14.6 V 4.4 A 0.7 0.7 0 0 1 16 4.4 V 11 H 16.2 V 7 A 0.7 0.7 0 0 1 17.6 7 V 14.2 C 17.6 16.8 17 18.4 16.2 19.6 Z M 9.8 20.3 H 16.8 V 23 H 9.8 Z',
  azarao:'M2.5 2.5 H21.5 V21.5 H2.5 Z M9 5 L13 11 L9.5 18.5 L11.5 18.5 L15 11 L11 5 Z'
};
const FX={
  dobro:{nome:'Dobro',cor:'#d58ad1',desc:()=>'dobra o valor desta face'},
  escudo:{nome:'Escudo',cor:'#8fb3d9',desc:n=>`bloqueia ${n} de dano na rodada`},
  cura:{nome:'Cura',cor:'#86c48f',desc:n=>`recupera ${n} de vida`},
  veneno:{nome:'Veneno',cor:'#a7c25c',desc:n=>`aplica ${n} de veneno: dano no fim de cada rodada, que cai 1 por vez`},
  fogo:{nome:'Fogo',cor:'#e5803f',desc:n=>`causa ${n} de dano direto no inimigo`},
  ouro:{nome:'Ouro',cor:'#e3b64a',desc:n=>`ganha ${n} de ouro`},
  espinho:{nome:'Espinho',cor:'#e0574a',desc:n=>`você perde ${n} de vida na hora`},
  roubo:{nome:'Furto',cor:'#d9b04a',desc:n=>`rouba ${n} do seu ouro`},
  pacto:{nome:'Pacto',cor:'#d9334a',desc:n=>`você perde ${n} de vida`}
};
const INIMIGOS=[
  {nome:'Rato da Adega',modos:['classico'],hp:14,base:4,dado:'d6',bolsa:['comum6','comum6'],tracos:[]},
  {nome:'Batedor de Bolsos',modos:['classico','cego'],hp:20,base:5,dado:'d6',bolsa:['comum6','furtiva'],tracos:['ganancia']},
  {nome:'Crupiê Trapaceiro',modos:['classico','aberto','estouro'],hp:24,base:4,dado:'d10',bolsa:['comum10','viciado','sombrio'],tracos:['crescente']},
  {nome:'Guarda Endividado',modos:['classico','duelo'],hp:30,base:5,dado:'d6',bolsa:['comum6','muralha','chumbo'],tracos:['pele']},
  {nome:'Bruxa das Fichas',modos:['cego','estouro','classico'],hp:36,base:5,dado:'d10',bolsa:['comum10','sanguessuga','espinhoso','sombrio'],tracos:['imune','regen']},
  {nome:'Cavaleiro Falido',modos:['duelo','classico','estouro'],hp:42,base:5,dado:'d10',bolsa:['comum10','muralha','espinho10','corrente'],tracos:['pele','vinganca']},
  {nome:'Ogro Apostador',modos:['duelo','cego','aberto'],hp:48,base:3,dado:'d20',bolsa:['comum20','chumbo','espinhoso','sombrio','corrente'],tracos:['vinganca','regen','armadura']},
  {nome:'O Dono da Casa',chefe:true,tier:7,modos:['estouro','duelo','cego','classico'],hp:52,base:3,dado:'d20',bolsa:['comum20','vicD20','espinho10','sombrio','corrente'],tracos:['ganancia','congela','furia']},
  {nome:'O Taberneiro Caolho',chefe:true,tier:2,modos:['classico','aberto','cego'],hp:38,base:5,dado:'d10',bolsa:['comum6','comum10','viciado','muralha'],tracos:['barril']},
  {nome:'Bêbado da Esquina',tier:0,modos:['classico','aberto'],hp:13,base:3,dado:'d6',bolsa:['comum6','furtiva'],tracos:[]},
  {nome:'Aprendiz de Crupiê',tier:1,modos:['cego','classico'],hp:19,base:5,dado:'d6',bolsa:['comum6','viciado'],tracos:[]},
  {nome:'Contrabandista do Porto',tier:2,modos:['aberto','classico','estouro'],hp:25,base:4,dado:'d10',bolsa:['comum10','furtiva','chumbo'],tracos:['cobrador']},
  {nome:'Mercenária de Aluguel',tier:3,modos:['duelo','classico'],hp:31,base:5,dado:'d10',bolsa:['comum10','muralha','espinhoso'],tracos:['vinganca']},
  {nome:'Alquimista Louco',tier:4,modos:['cego','estouro','aberto'],hp:35,base:4,dado:'d10',bolsa:['comum10','sanguessuga','sombrio','espinho10'],tracos:['regen','crescente']},
  {nome:'Agiota de Capuz',tier:5,modos:['classico','duelo','aberto'],hp:41,base:5,dado:'d10',bolsa:['comum10','corrente','furtiva','espinho10'],tracos:['ganancia','pele']},
  {nome:'Capitão da Guarda',tier:6,modos:['duelo','classico','estouro'],hp:44,base:4,dado:'d20',bolsa:['comum20','muralha','chumbo','corrente','espinhoso'],tracos:['armadura','congela']},
  {nome:'A Viúva das Apostas',chefe:true,tier:5,modos:['duelo','estouro','classico'],hp:54,base:5,dado:'d10',bolsa:['comum10','viciado','sanguessuga','espinho10','sombrio'],tracos:['divida','ganancia']}
];
const ATOS=[
  {nome:'A Adega',num:'I',chefe:8,feltro:'#1e4a46'},
  {nome:'O Salão',num:'II',chefe:16,feltro:'#4a1a22'},
  {nome:'O Cofre',num:'III',chefe:7,feltro:'#1a2744'}
];
const atoDe=r=>Math.min(ATOS.length-1,Math.floor((r||0)/4));
const tierDe=k=>INIMIGOS[k].tier??k;
const inimigoDoNivel=t=>{const ops=INIMIGOS.map((b,i)=>i).filter(i=>!INIMIGOS[i].chefe&&tierDe(i)===t);return ops.length?pick(ops):t};
const MODOS={
  classico:{nome:'Clássico',seq:'jjcj',desc:'Dois lances seus, a casa lança, e o seu último lance.'},
  duelo:{nome:'Duelo',seq:'jcjcj',base:-3,desc:'Vocês alternam. A casa lança duas vezes, mas a base cai 3.'},
  cego:{nome:'Às Cegas',seq:'jjjc',mult:1.5,desc:'Seus três lances vêm antes da casa. Acertar dá 50% a mais de dano.'},
  aberto:{nome:'Desafio Aberto',seq:'cjj',desc:'A casa lança primeiro. Você vê o alvo, mas tem só dois lances.'},
  estouro:{nome:'Estouro',seq:'jcjjj',teto:6,parar:true,desc:'Fique entre o alvo e o teto. Passou do teto, estourou. Puxe a alavanca para parar.'}
};
function dCasa(tipo,nome,{cor,faces,mods,area}={}){
  const d={type:tipo,nome,cor,area,especial:!!cor,faces:(faces||DIE[tipo].faces).map(v=>({v,bonus:0,fx:null}))};
  if(mods)for(const i in mods)Object.assign(d.faces[i],mods[i]);
  return d;
}
const DADOS_CASA={
  comum6:()=>dCasa('d6','Dado da Casa'),
  comum10:()=>dCasa('d10','D10 da Casa'),
  comum20:()=>dCasa('d20','D20 da Casa'),
  viciado:()=>dCasa('d6','Dado Viciado',{cor:'#5a1d22',faces:[3,4,4,5,5,6]}),
  furtiva:()=>dCasa('coin','Moeda Furtiva',{cor:'#4a3a1a',mods:{0:{fx:{k:'roubo',n:2}}}}),
  espinhoso:()=>dCasa('d6','Dado Espinhoso',{cor:'#3a1416',mods:{4:{fx:{k:'espinho',n:2}},5:{fx:{k:'espinho',n:3}}}}),
  muralha:()=>dCasa('d6','Dado Muralha',{cor:'#23303d',mods:{0:{fx:{k:'escudo',n:4}},1:{fx:{k:'escudo',n:3}}}}),
  sanguessuga:()=>dCasa('d10','D10 Sanguessuga',{cor:'#25361b',mods:{8:{fx:{k:'cura',n:4}},9:{fx:{k:'cura',n:5}}}}),
  chumbo:()=>dCasa('d6','Dado de Chumbo',{cor:'#3b3d42',faces:[4,4,5,5,6,6]}),
  vicD20:()=>dCasa('d20','D20 Viciado',{cor:'#4a1420',mods:{0:{v:8},19:{fx:{k:'dobro'}}}}),
  espinho10:()=>dCasa('d10','D10 Espinhoso',{cor:'#3a1416',mods:{9:{fx:{k:'espinho',n:4}}}}),
  sombrio:()=>dCasa('d6','Dado Sombrio',{cor:'#1a1426',area:{tipo:'raio',r:3,alvo:'jogador',delta:-2,cor:'#9b6fe0',nome:'Névoa Sombria'}}),
  corrente:()=>dCasa('d10','D10 Acorrentado',{cor:'#1d2636',area:{tipo:'proximos',n:2,alvo:'jogador',delta:-3,cor:'#6f9ad9',nome:'Correntes'}})
};
const ITENS={
  ferradura:{nome:'Ferradura Torta',desc:'Faces que valem 1 passam a valer 3.',cor:'#c9cdd6',preco:10},
  copo:{nome:'Copo de Couro',desc:'Puxar da bolsa custa +1 no alvo em vez de +2.',cor:'#c08a55',preco:9},
  bolsaFunda:{nome:'Bolsa Funda',desc:'A mão começa cada rodada com 4 dados.',cor:'#b07a48',preco:14},
  lamina:{nome:'Lâmina Afiada',desc:'Seus acertos causam +3 de dano.',cor:'#d9dde6',preco:12},
  escudo:{nome:'Gibão de Couro',desc:'Começa cada rodada com 2 de escudo.',cor:'#8fb3d9',preco:11},
  calice:{nome:'Cálice Rubro',desc:'Ao vencer uma rodada, recupera 2 de vida.',cor:'#e06a5c',preco:10},
  dadoOuro:{nome:'Dado Dourado',desc:'Ganha 1 de ouro quando um dado seu cai na face mais alta.',cor:'#e3b64a',preco:9},
  espelho:{nome:'Espelho Rachado',desc:'Se a soma for exatamente igual ao alvo, o dano dobra.',cor:'#a9d4e0',preco:11},
  lupa:{nome:'Lupa do Trapaceiro',desc:'Mostra qual dado a casa vai lançar nesta rodada.',cor:'#efe0b6',preco:8},
  fogo:{nome:'Tocha',desc:'Faces de Fogo causam +2 de dano.',cor:'#e5803f',preco:8},
  coroa:{nome:'Coroa Velha',desc:'Ganha 50% a mais de ouro ao vencer uma luta.',cor:'#f2c661',preco:13},
  pena:{nome:'Pena de Corvo',desc:'O primeiro dado que você lança em cada rodada vale +2.',cor:'#8f9bb3',preco:9},
  trevo:{nome:'Trevo Seco',desc:'Suas moedas valem +2 em qualquer face.',cor:'#86c48f',preco:8},
  ampulheta:{nome:'Ampulheta',desc:'Se você errar o alvo por 2 ou menos, não perde vida.',cor:'#e3c27a',preco:12},
  ima:{nome:'Ímã de Ferro',desc:'Faces de Ouro dão +2 de ouro.',cor:'#d9574b',preco:7},
  peconha:{nome:'Frasco de Peçonha',desc:'Faces de Veneno aplicam +2 de veneno.',cor:'#a7c25c',preco:9},
  balsamo:{nome:'Pote de Bálsamo',desc:'Faces de Cura curam +2.',cor:'#86c48f',preco:8},
  broquel:{nome:'Broquel',desc:'Faces de Escudo dão +2 de escudo.',cor:'#8fb3d9',preco:8},
  baralho:{nome:'Baralho Marcado',desc:'O dado da casa vale 1 a menos.',cor:'#d9b3a0',preco:13},
  relogio:{nome:'Relógio de Bolso',desc:'Na primeira rodada de cada luta, a mão tem +2 dados.',cor:'#d4a94f',preco:9},
  fichaSorte:{nome:'Ficha da Sorte',desc:'Dados que caem na face mais alta valem +3.',cor:'#f2c661',preco:11},
  sino:{nome:'Sino de Bronze',desc:'Seus D6 valem +1.',cor:'#c99a3c',preco:10},
  pergaminho:{nome:'Pergaminho',desc:'Seus D10 valem +1.',cor:'#e9dcc0',preco:9},
  grimorio:{nome:'Grimório',desc:'Seus D20 valem +2.',cor:'#b8a6d6',preco:10},
  algibeira:{nome:'Algibeira',desc:'Ganha 3 de ouro no início de cada luta.',cor:'#c08a55',preco:7},
  medalhao:{nome:'Medalhão',desc:'+10 de vida máxima.',cor:'#e06a5c',preco:10},
  rum:{nome:'Garrafa de Rum',desc:'Ao vencer uma luta, recupera 8 de vida.',cor:'#b07a48',preco:8},
  punhal:{nome:'Punhal Envenenado',desc:'Seus acertos aplicam 2 de veneno.',cor:'#a7c25c',preco:11},
  luva:{nome:'Luva de Ladrão',desc:'Ao vencer uma rodada, rouba 2 de ouro da casa.',cor:'#9a8a70',preco:9},
  azarao:{nome:'Dado do Azarão',desc:'Se você errar o alvo por 5 ou mais, a casa leva 5 de dano mesmo assim.',cor:'#d9574b',preco:11},
  brasa:{nome:'Carvão em Brasa',desc:'Seus acertos causam +1 de dano para cada dado seu na mesa.',cor:'#ef7a3a',preco:11},
  cachimbo:{nome:'Cachimbo de Barro',desc:'Quando você erra o alvo, a próxima rodada começa com 4 de escudo.',cor:'#c4a07a',preco:9},
  tabua:{nome:'Tábua de Contas',desc:'Cada acerto seguido na mesma luta causa +2 de dano a mais que o anterior. Errar zera a conta.',cor:'#c9a26a',preco:12},
  velaNegra:{nome:'Vela Negra',desc:'Chefes e elites começam a luta com 15% a menos de vida.',cor:'#8c7aa8',preco:12},
  moedaPesada:{nome:'Moeda de Chumbo',desc:'Suas moedas que caem no 2 valem 6.',cor:'#9aa3ad',preco:9},
  dadoOsso:{nome:'Dado de Osso',desc:'Seus D6 que caem no 1 valem 6.',cor:'#efe3c6',preco:9},
  cantil:{nome:'Cantil de Couro',desc:'Dormir no descanso cura 10 a mais.',cor:'#a8794a',preco:7}
};
const CONSUMIVEIS={
  martelo:{nome:'Martelo',desc:'Escolha um dado da casa que está na mesa: ele quebra e passa a valer 0 nesta rodada.',cor:'#c9cdd6',preco:8},
  tonico:{nome:'Tônico',desc:'Recupera 10 de vida na hora.',cor:'#86c48f',preco:6},
  faca:{nome:'Faca de Arremesso',desc:'Causa 8 de dano direto na casa, sem precisar acertar o alvo.',cor:'#d9dde6',preco:7},
  frasco:{nome:'Frasco de Veneno',desc:'Aplica 5 de veneno na casa.',cor:'#a7c25c',preco:7},
  peso:{nome:'Peso de Chumbo',desc:'O próximo dado seu que parar na mesa nesta rodada vale +6.',cor:'#9aa3ad',preco:6},
  maoLeve:{nome:'Mão Leve',desc:'Puxa 2 dados da bolsa para a mão sem aumentar o alvo.',cor:'#d9b07a',preco:8}
};
const CONS_MAX=3;
const consMax=()=>S.teste?6:CONS_MAX;
const ITEM_ICONE={escudo:'escudo',fogo:'fogo',punhal:'roubo'};
const CONJUNTOS={
  trapaceiro:{nome:'Trapaceiro',pecas:['lupa','baralho','luva'],desc:'Todos os seus dados valem +1.'},
  alquimista:{nome:'Alquimista',pecas:['peconha','balsamo','punhal'],desc:'O veneno no inimigo causa o dobro de dano.'},
  tesoureiro:{nome:'Tesoureiro',pecas:['coroa','ima','algibeira'],desc:'Acertos causam +1 de dano para cada 10 de ouro que você tem.'},
  guerreiro:{nome:'Guerreiro',pecas:['lamina','fogo','broquel'],desc:'Acertos causam +5 de dano.'},
  relojoeiro:{nome:'Relojoeiro',pecas:['ampulheta','relogio','pena'],desc:'Na primeira rodada de cada luta, a base da casa cai 3.'},
  viciado:{nome:'Viciado',pecas:['dadoOsso','moedaPesada','ferradura'],desc:'Seus dados valem +2 nas duas faces mais baixas.'},
  andarilho:{nome:'Andarilho',pecas:['cachimbo','cantil','velaNegra'],desc:'Vencer um chefe ou elite recupera 10 de vida.'}
};
const conjAtivo=k=>CONJUNTOS[k].pecas.every(p=>S.itens.includes(p));
const conjuntoDe=item=>{const e=Object.entries(CONJUNTOS).find(([k,c])=>c.pecas.includes(item));return e?{k:e[0],...e[1],tem:e[1].pecas.filter(p=>S.itens.includes(p)).length}:null};
const htmlConjunto=item=>{const c=conjuntoDe(item);if(!c)return'';return`<span class="conj${c.tem===3?' ativo':''}">Conjunto ${c.nome} ${c.tem}/3 · ${c.pecas.map(p=>ITENS[p].nome).join(', ')}. Completo: ${c.desc}</span>`};
function ganharItem(k){
  const antes=Object.keys(CONJUNTOS).filter(conjAtivo);
  S.itens.push(k);registrarVisto('itens',k);if(k==='medalhao'){S.max+=10;S.hp+=10}
  const novo=Object.keys(CONJUNTOS).find(c=>conjAtivo(c)&&!antes.includes(c));
  if(novo)conquistar('conjunto');
  if(novo&&!S.teste)setTimeout(()=>{toast(`<b>Conjunto ${CONJUNTOS[novo].nome}</b>${CONJUNTOS[novo].desc}`);SOM.combo()},400);
}
function toast(html,cor='#f2c661'){
  const t=document.createElement('div');t.className='toast';t.style.setProperty('--c',cor);t.innerHTML=html;document.body.appendChild(t);
  t.animate([{opacity:0,transform:'translate(-50%,-20px)'},{opacity:1,transform:'translate(-50%,0)',offset:.1},{opacity:1,transform:'translate(-50%,0)',offset:.85},{opacity:0,transform:'translate(-50%,-10px)'}],{duration:reduzir?2500:3800,easing:'ease-out'}).onfinish=()=>t.remove();
}
function bonusFace(t,f){
  let b=0;const tipo=t.die.type,q=qtdItem;
  if(conjAtivo('trapaceiro'))b+=1;
  if(q('pena')&&!S.primeiroFeito){S.primeiroFeito=true;b+=2*q('pena');dispararItem('pena',`+${2*q('pena')}`)}
  if(q('trevo')&&tipo==='coin'){b+=2*q('trevo');dispararItem('trevo',`+${2*q('trevo')}`)}
  if(q('sino')&&tipo==='d6'){b+=q('sino');dispararItem('sino',`+${q('sino')}`)}
  if(q('pergaminho')&&tipo==='d10'){b+=q('pergaminho');dispararItem('pergaminho',`+${q('pergaminho')}`)}
  if(q('grimorio')&&tipo==='d20'){b+=2*q('grimorio');dispararItem('grimorio',`+${2*q('grimorio')}`)}
  if(q('moedaPesada')&&tipo==='coin'&&f.v===2){b+=4*q('moedaPesada');dispararItem('moedaPesada',`Chumbo +${4*q('moedaPesada')}`)}
  if(q('dadoOsso')&&tipo==='d6'&&f.v===1){b+=5*q('dadoOsso');dispararItem('dadoOsso',`Osso +${5*q('dadoOsso')}`)}
  if(conjAtivo('viciado')&&[...DIE[tipo].faces].sort((a,b)=>a-b).slice(0,2).includes(f.v))b+=2;
  if(q('fichaSorte')&&f.v===Math.max(...DIE[tipo].faces)){b+=3*q('fichaSorte');dispararItem('fichaSorte',`+${3*q('fichaSorte')}`)}
  return b;
}
function bonusFx(k){
  const m={ouro:'ima',veneno:'peconha',cura:'balsamo',escudo:'broquel'}[k];
  if(!m||!temItem(m))return 0;
  const b=2*qtdItem(m);dispararItem(m,`+${b} ${FX[k].nome.toLowerCase()}`);return b;
}
const TRACOS={
  pele:{nome:'Pele Grossa',desc:'Recebe 2 a menos de dano em cada acerto seu.',cor:'#b9a888',ic:'escudo'},
  ganancia:{nome:'Ganancioso',desc:'Quando você erra o alvo, rouba 2 do seu ouro.',cor:'#e3b64a',ic:'roubo'},
  vinganca:{nome:'Vingativo',desc:'Quando você erra o alvo, causa +2 de dano.',cor:'#e0574a',ic:'espinho'},
  regen:{nome:'Regeneração',desc:'Recupera 3 de vida no fim de cada rodada.',cor:'#86c48f',ic:'cura'},
  crescente:{nome:'Banca Crescente',desc:'A base do alvo sobe 1 a cada rodada.',cor:'#d4a94f',ic:'subir'},
  imune:{nome:'Sangue Frio',desc:'Imune a veneno.',cor:'#a7c25c',ic:'veneno'},
  duplo:{nome:'Mão Dupla',desc:'Lança 2 dados da bolsa e fica com o maior.',cor:'#b8a6d6',ic:'dupla'},
  congela:{nome:'Mão de Ferro',desc:'A cada rodada, um dado da sua mão fica preso e não pode ser lançado.',cor:'#8fb3d9',ic:'cadeado'},
  armadura:{nome:'Armadura',desc:'Absorve o dano dos seus acertos. Recarrega a cada 3 rodadas. Fogo e veneno passam direto.',cor:'#b9c2cc',ic:'escudo'},
  barril:{nome:'Barril de Reserva',desc:'Na primeira vez que fica abaixo da metade da vida, bebe do barril: recupera 12 de vida e ganha Pele Grossa.',cor:'#c08a4a',ic:'rum'},
  divida:{nome:'Livro de Dívidas',desc:'Cada erro seu sobe a base dela em 2 até o fim da luta. Cada acerto seu tira 1, até a base original.',cor:'#c97bd9',ic:'subir'},
  furia:{nome:'Fúria do Dono',desc:'Abaixo da metade da vida, perde a paciência: a base sobe 2 e ele passa a lançar 2 dados e ficar com o maior.',cor:'#ff6a4a',ic:'coroa'},
  cobrador:{nome:'Cobrador',desc:'A partir do terceiro dado que você lança na rodada, cada um custa 2 de vida.',cor:'#e0574a',ic:'espinho'}
};
const ITENS_MAX=6;
const ENCANTOS={
  bronze:{antigo:true,nome:'Bronze',combo:'Parceiro',desc:'+4 se outro dado seu do mesmo tipo estiver na mesa nesta rodada.',cor:'#b0703a',ui:'#d08a4e',preco:6},
  prata:{nome:'Prata',combo:'Atração',desc:'+5 se parar perto de outro dado seu.',cor:'#cfd6de',ui:'#cfd6de',preco:7},
  ouro:{nome:'Ouro',combo:'Gêmeos',desc:'Valor dobrado se outro dado seu cair no mesmo número.',cor:'#e6b94a',ui:'#e6b94a',preco:9},
  onix:{nome:'Ônix',combo:'Primo',desc:'+5 se cair num número primo (2, 3, 5, 7, 11, 13, 17, 19).',cor:'#1c1820',ui:'#a99bc0',preco:7},
  marfim:{antigo:true,nome:'Marfim',combo:'Trinca',desc:'+6 se cair num múltiplo de 3.',cor:'#f3ecdc',ui:'#f3ecdc',preco:7},
  rubi:{nome:'Rubi',combo:'Escada',desc:'+4 se cair num número vizinho (um a mais ou um a menos) de outro dado seu.',cor:'#b3263a',ui:'#e0566a',preco:8},
  esmeralda:{nome:'Esmeralda',combo:'Encosto',desc:'Se parar perto do dado da casa, o dado da casa vale 3 a menos.',cor:'#2f9e6b',ui:'#4fc28c',preco:8},
  ametista:{nome:'Ametista',combo:'Centro',desc:'+8 se parar dentro do círculo central da mesa.',cor:'#7d45b8',ui:'#b98ae6',preco:8},
  ambar:{nome:'Âmbar',combo:'Aura',desc:'Cria um círculo na mesa. Seus outros dados dentro dele ganham +2, inclusive os que caírem depois.',cor:'#d98c1f',ui:'#f0a43a',preco:9,area:{tipo:'raio',r:3,alvo:'jogador',delta:2,cor:'#f0a43a',nome:'Aura de Âmbar'}},
  safira:{nome:'Safira',combo:'Corrente',desc:'Os 2 dados seus mais próximos dele ganham +3 cada.',cor:'#2d5fb8',ui:'#5b8fe0',preco:9,area:{tipo:'proximos',n:2,alvo:'jogador',delta:3,cor:'#5b8fe0',nome:'Corrente de Safira'}},
  mercurio:{nome:'Mercúrio',combo:'Eco',desc:'Se cair na face mais alta, solta uma cópia menor de si que também é lançada e soma. A cópia pode se copiar de novo, até 3 vezes.',cor:'#7f9bb0',ui:'#bfe3f0',preco:10},
  magnetita:{nome:'Magnetita',combo:'Ímã',desc:'Ao parar, puxa o dado da casa mais próximo para junto dele, e esse dado da casa passa a valer metade.',cor:'#3b4048',ui:'#9aa4b4',preco:9},
  granada:{nome:'Granada',combo:'Sangria',desc:'Se cair no número mais baixo, rola de novo sozinho. Soma as duas vezes, e a segunda ganha +2.',cor:'#7a1426',ui:'#d8405a',preco:8},
  obsidiana:{nome:'Obsidiana',combo:'Sombra',desc:'Se parar antes da casa terminar de lançar, fica escondido. Quando a casa termina, ele se revela e vale +4.',cor:'#120e16',ui:'#8a76b8',preco:9},
  cinabrio:{nome:'Cinábrio',combo:'Fênix',desc:'Se cair no número mais baixo, queima e volta para a sua mão. Você lança de novo, e esse lance não conta. Uma vez por rodada.',cor:'#c9442a',ui:'#ff7a4a',preco:9},
  cobre:{nome:'Cobre',combo:'Repulsão',desc:'Cria um círculo na mesa. Dados da casa dentro dele valem 2 a menos.',cor:'#b5582e',ui:'#d9774a',preco:8,area:{tipo:'raio',r:3,alvo:'casa',delta:-2,cor:'#d9774a',nome:'Repulsão de Cobre'}}
};
const encantosAtivos=()=>Object.keys(ENCANTOS).filter(k=>!ENCANTOS[k].antigo);
const temItem=k=>S.itens.includes(k);
const temTraco=k=>!!(S.ini&&S.ini.tracos.includes(k));
const qtdItem=k=>S.itens.filter(x=>x===k).length;
const custoPuxar=()=>Math.max(0,CUSTO_PUXAR-qtdItem('copo'));
const custoAtual=()=>S.mao.length+S.lancados+(S.congelado?-1:0)<(S.lancesGratis||0)?0:custoPuxar();
const maoInicial=()=>S.teste?20:MAO_INICIAL+qtdItem('bolsaFunda')+(S.rodada===1?2*qtdItem('relogio'):0);
const maoMax=()=>S.teste?24:MAO_MAX;
const bolsaMax=()=>S.teste?40:BOLSA_MAX;
const itensMax=()=>S.teste?40:ITENS_MAX;
const pathItem=k=>PATHS[ITEM_ICONE[k]||k];
const svgPath=(k,cor)=>`<svg viewBox="0 0 24 24"><path fill="${cor}" fill-rule="evenodd" d="${PATHS[k]}"/></svg>`;

