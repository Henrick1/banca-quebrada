function aoParar(t){
  const f=t.die.faces[t.face];const def=DIE[t.die.type];
  const el=document.createElement('div');el.className='rotulo'+(t.dono==='casa'?' casa':'');
  const tela=telaDe(t.mesh.position);
  t.punch=1;
  if(t.dono==='casa'){
    let v=valorFace(f);
    if(temItem('baralho')&&v>0){const q=Math.min(v,qtdItem('baralho'));v-=q;dispararItem('baralho',`Casa −${q}`)}
    let quebrou=false;if(S.marteloProx){S.marteloProx=false;quebrou=v||true;v=0}
    t.valor=v;S.rolagens.push(v);S.rolagem=valorCasa();
    if(quebrou){setTimeout(()=>quebrarDado(t,quebrou===true?0:quebrou),80);renderCons()}
    let extra='';
    anel(t.mesh.position,f.fx?FX[f.fx.k].cor:0xa596bd);SOM.tok(v);SOM.tensao();
    voar(`${v}`,tela,$('alvo'),{cls:'pontos',aoChegar:()=>pulsar($('alvo'))});
    if(f.fx){
      const n=f.fx.n,k=f.fx.k,cor=FX[k].cor,p=t.mesh.position;
      faiscas(p,cor,18,3,6);
      if(k==='espinho'){S.hp-=n;SOM.dano();tremer(.25);vinheta('#c9473c');voar(svgPath('espinho',cor),tela,$('barraJ'),{atraso:120,dur:420,aoChegar:()=>{pulsar($('barraJ'),'flash');pulsar($('barraJ'),'treme');numeroFlutuante(`-${n}`,$('barraJ'),cor);hud()}})}
      if(k==='roubo'){const r=Math.min(n,S.ouro);S.ouro-=r;SOM.ouro(2);const de=$('ouro').getBoundingClientRect();for(let i=0;i<r;i++)voar(MOEDA_VOO,{x:de.left+de.width/2,y:de.top+de.height/2},$('barraI'),{atraso:i*90});numeroFlutuante(r?`-${r} ouro`:'Bolso vazio',$('ouro'),cor)}
      if(k==='escudo'){S.escudoIni+=n;hud();SOM.escudo();numeroFlutuante(`Escudo ${n}`,$('barraI'),cor)}
      if(k==='cura'){S.ini.hp=Math.min(S.ini.max,S.ini.hp+n);SOM.cura();pulsar($('barraI'),'flash');numeroFlutuante(`+${n}`,$('barraI'),cor)}
      if(k==='dobro'){t.punch=1.4;SOM.dobro()}
      extra=`<small style="color:${cor}">${FX[k].nome}${n?' '+n:''}</small>`;
    }
    el.innerHTML=`${def.rot?`<small>${def.rot[t.face]}</small>`:''}${v}${extra}`;
  }else{
    let val=valorFace(f);
    if(temItem('ferradura')&&f.v+f.bonus===1){val=3*(f.fx&&f.fx.k==='dobro'?2:1);dispararItem('ferradura','1 vale 3')}
    if(temItem('dadoOuro')&&f.v===Math.max(...DIE[t.die.type].faces)){const q=qtdItem('dadoOuro');S.ouro+=q;dispararItem('dadoOuro',`+${q} ouro`)}
    val+=bonusFace(t,f);
    if(S.pesoProx){const q=S.pesoProx;val+=q;S.pesoProx=0;numeroFlutuante(`Chumbo +${q}`,$('soma'),CONSUMIVEIS.peso.cor);faiscas(t.mesh.position,0x9aa3ad,14,3,5);renderCons()}
    S.soma+=val;t.num=f.v+f.bonus;t.valor=val;
    let extra='';
    anel(t.mesh.position,f.fx?FX[f.fx.k].cor:0xd4a94f);SOM.tok(val);tremer(.04);
    voar(`+${val}`,tela,$('soma'),{cls:'pontos',aoChegar:()=>contar($('soma'),S.soma,true)});
    if(f.fx){
      const k=f.fx.k,n=(f.fx.n||0)+bonusFx(k),cor=FX[k].cor,p=t.mesh.position;
      const ic=k==='dobro'?'<b>×2</b>':iconeFx(k,cor);
      if(k==='escudo'){$('efEscudo').hidden=false;S.escudo+=n;faiscas(p,cor,14,2,6);SOM.escudo();voar(`${ic}${n}`,tela,$('escudo'),{atraso:150,aoChegar:()=>pulsar($('escudo'))})}
      if(k==='cura'){S.hp=Math.min(S.max,S.hp+cm(n));faiscas(p,cor,16,2.5,7);SOM.cura();voar(`${ic}${n}`,tela,$('barraJ'),{atraso:150,aoChegar:()=>{pulsar($('barraJ'),'flash');hud()}})}
      if(k==='veneno'){if(temTraco('imune')){dispararTraco('imune','Imune');numeroFlutuante('Imune',$('barraI'),cor)}else{$('efVeneno').hidden=false;S.veneno+=n;faiscas(p,cor,16,3,4);SOM.veneno();voar(`${ic}${n}`,tela,$('veneno'),{atraso:150,aoChegar:()=>pulsar($('veneno'))})}}
      if(k==='fogo'){const nf=n+2*qtdItem('fogo');if(nf>n)dispararItem('fogo',`+${nf-n} fogo`);S.ini.hp-=nf;S.stats.dano+=nf;faiscas(p,cor,30,4,8);SOM.fogo();tremer(.18);voar(ic,tela,$('barraI'),{atraso:100,dur:450,aoChegar:()=>{pulsar($('barraI'),'flash');pulsar($('barraI'),'treme');numeroFlutuante(`-${nf}`,$('barraI'),cor);hud()}})}
      if(k==='ouro'){S.ouro+=n;faiscas(p,cor,18,3,7);for(let i=0;i<Math.min(n,6);i++)voar(MOEDA_VOO,tela,$('ouro'),{atraso:i*70,aoChegar:()=>{SOM.ouro(1);hud()}})}
      if(k==='dobro'){t.punch=1.4;faiscas(p,cor,20,3,6);SOM.dobro();anel(p,cor)}
      if(k==='pacto'){S.hp-=n;faiscas(p,cor,16,2,5);SOM.dano();tremer(.15);vinheta('#c9473c');voar(svgPath('pacto',cor),tela,$('barraJ'),{atraso:120,dur:420,aoChegar:()=>{pulsar($('barraJ'),'flash');numeroFlutuante(`-${n}`,$('barraJ'),cor);hud()}})}
      extra=`<small style="color:${cor}">${FX[k].nome}${k!=='dobro'&&n?' '+n:''}</small>`;
    }
    el.innerHTML=`${def.rot?`<small>${def.rot[t.face]}</small>`:''}${val}${extra}`;
  }
  t.rotulo=el;$('rotulos').appendChild(el);
  const areaDef=t.dono==='casa'?t.die.area:(t.die.encanto&&ENCANTOS[t.die.encanto].area);
  if(areaDef)criarArea(t,areaDef);
  checarCombos();
  S.voando--;hud();placar();
  if(S.voando===0)avancar();
}

function kitDeTeste(){
  S.teste=true;S.ouro=60;S.cons=Object.keys(CONSUMIVEIS);
  S.itens=[];Object.keys(ITENS).forEach(ganharItem);
  const g=(tipo,mods)=>{const d=novoDado(tipo);for(const i in mods)Object.assign(d.faces[i],mods[i]);return d};
  S.dados=[
    g('d6',{0:{bonus:2},5:{fx:{k:'fogo',n:4}}}),
    g('d6',{0:{fx:{k:'escudo',n:3}},1:{fx:{k:'cura',n:3}}}),
    g('d6',{}),
    g('coin',{0:{fx:{k:'dobro'}},1:{bonus:1,fx:{k:'ouro',n:3}}}),
    g('d10',{0:{fx:{k:'veneno',n:3}},1:{fx:{k:'veneno',n:2}},9:{fx:{k:'dobro'}}}),
    g('d20',{0:{fx:{k:'fogo',n:5}},9:{bonus:3,fx:{k:'cura',n:4}},19:{fx:{k:'ouro',n:4}}})
  ];
  const tipos=['d6','d6','d10','d20','coin'],efs=['fogo','escudo','cura','veneno','ouro','dobro'];
  for(let i=0;i<17;i++){
    const d=novoDado(tipos[i%tipos.length]);
    for(let j=0;j<2;j++){const f=pick(d.faces);const k=pick(efs);f.fx=k==='dobro'?{k}:{k,n:2+Math.floor(Math.random()*3)};if(Math.random()<.4)f.bonus+=1+Math.floor(Math.random()*2)}
    S.dados.push(d);
  }
  Object.keys(ENCANTOS).forEach((k,i)=>{S.dados[i].encanto=k});
}
function novaPartida(teste,diaria){
  apagarSalvo();
  RNG.ativo=!!diaria;if(diaria)RNG.s=sementeDe('banca-'+hojeISO());
  const b=diaria?BUILDS.apostador:BUILDS[PERFIL.build]&&liberado(BUILDS[PERFIL.build].req)?BUILDS[PERFIL.build]:BUILDS.apostador,kit=b.montar();
  const des=diaria||teste?0:Math.min(PERFIL.desafio||0,PERFIL.desafioMax||0),vida=des>=5?35:45;
  Object.assign(S,{teste:false,pausado:false,hp:vida,max:vida,ouro:kit.ouro,andar:0,itens:[],cons:['martelo'],dados:kit.dados,build:b.nome,desafio:des,diaria:diaria?{data:hojeISO()}:null,elitesVencidos:0,evAtual:null,
    stats:{dano:0,maior:0,combos:0,rodadas:0,inicio:Date.now()}});
  kit.itens.forEach(ganharItem);
  const r=diaria?RESERVAS.d6:RESERVAS[PERFIL.reserva];if(r&&(diaria||liberado(r.req)))S.dados.push(novoDado(r.tipo));
  S.dados.forEach(d=>{if(d.encanto)registrarVisto('encantos',d.encanto)});
  if(teste)kitDeTeste();
  S.mapa=gerarMapa();S.linha=0;S.no=null;S.evVistos=[];S.ini=null;
  irPara(S.mapa.inicio);
}
function novaLuta(){
  const n=S.no||{tipo:'luta',inimigo:Math.min(S.andar,INIMIGOS.length-1)},b=INIMIGOS[n.inimigo],elite=n.tipo==='elite';
  S.andar=tierDe(n.inimigo);S.retomar=null;S.fase='intro';trocarFeltro(atoDe(S.linha));
  const des=S.desafio||0,vida=Math.round(b.hp*(elite?1.25:1)*(des>=1?1.15:1));
  S.ini={...b,nome:elite?`${b.nome} (Elite)`:b.nome,elite,hp:vida,max:vida,tracos:[...b.tracos,...(elite&&n.extra&&!b.tracos.includes(n.extra)?[n.extra]:[])],bolsa:b.bolsa.map(k=>DADOS_CASA[k]())};
  if(des>=4){
    if(elite){const mais=EXTRAS_ELITE.filter(x=>!S.ini.tracos.includes(x));if(mais.length)S.ini.tracos.push(pick(mais))}
    if(n.tipo==='chefe'&&!S.ini.tracos.includes('armadura'))S.ini.tracos.push('armadura');
  }
  S.ini.base0=S.ini.base;S.serie=0;S.escudoProx=0;S.marteloProx=false;
  if((elite||n.tipo==='chefe')&&temItem('velaNegra')){S.ini.max=S.ini.hp=Math.round(S.ini.max*Math.pow(.85,qtdItem('velaNegra')));setTimeout(()=>dispararItem('velaNegra','−15% de vida'),900)}
  if(S.ini.tracos.includes('armadura')){S.ini.armaduraMax=6+S.andar;S.ini.armadura=S.ini.armaduraMax}
  S.hpLuta=S.hp;S.ouroLuta=S.ouro;S.consLuta=[...(S.cons||[])];
  S.veneno=0;S.rodada=0;
  if(temItem('algibeira')){const q=3*qtdItem('algibeira');S.ouro+=q;setTimeout(()=>{dispararItem('algibeira',`+${q} ouro`);SOM.ouro(3);hud()},900)}
  montarFichas();
  limparBandeja();S.bolsa=S.dados.map(d=>d.id);S.mao=[];S.naMesa=[];
  fecharOverlay();salvarPartida();novaRodada();
}
function novaRodada(){
  limparMesa();S.bolsa.push(...S.naMesa);S.naMesa=[];
  Object.assign(S,{pesoProx:0,primeiroFeito:false,descontoCasa:0,soma:0,escudo:0,escudoIni:0,rolagem:null,rolagens:[],aposta:0,fase:'intro',restam:0,lancados:0,voando:0,etapa:0});
  const pAntes=S.ini.rodada0?pressaoLuta():0,cAntes=calorTaverna();
  S.rodada++;S.stats.rodadas++;S.combosRodada=0;S.ini.rodada0=true;
  const subiuP=pressaoLuta()>pAntes,subiuC=calorTaverna()>cAntes;
  const lista=S.ini.modos||['classico'];
  S.modo=MODOS[lista[(S.rodada-1)%lista.length]];S.modoProx=lista.length>1?MODOS[lista[S.rodada%lista.length]]:null;
  S.passos=dividirPassos(S.modo.seq);S.passoI=-1;S.cTotal=S.passos.filter(p=>p.t==='c').length;S.cFeitos=0;S.cPasso=-1;
  faseChefe();
  S.proxCasa=sortearCasa();
  if(CONT)prepararContador();
  anunciarModo(subiuP,subiuC);
  if(S.rodada>1&&temTraco('crescente')){S.ini.base++;setTimeout(()=>dispararTraco('crescente','Base +1'),300)}
  if(temItem('escudo')){S.escudo=2*qtdItem('escudo');setTimeout(()=>dispararItem('escudo',`+${S.escudo} escudo`),300)}
  if(S.escudoProx){const q=S.escudoProx;S.escudo+=q;S.escudoProx=0;setTimeout(()=>dispararItem('cachimbo',`+${q} escudo`),400)}
  const jTot=S.modo.seq.split('').filter(c=>c==='j').length,alvoMao=Math.max(maoInicial(),S.modo.parar?3:jTot)+(temTraco('congela')?1:0);
  let k=0;while(S.mao.length<alvoMao&&S.bolsa.length)puxar(250+k++*(S.teste?60:170));
  S.congelado=null;
  if(temTraco('congela')&&S.mao.length>1){S.congelado=pick(S.mao);setTimeout(()=>{dispararTraco('congela','Um dado preso');marcar()},1300)}
  if(S.ini.armaduraMax&&S.rodada>1&&(S.rodada-1)%3===0&&S.ini.armadura<S.ini.armaduraMax){S.ini.armadura=S.ini.armaduraMax;setTimeout(()=>{dispararTraco('armadura','Armadura recarregada');SOM.escudo();hud()},700)}
  hud();bandeja();placar();
  const rodadaAtual=S.rodada,lutaAtual=S.ini;setTimeout(()=>{if(S.rodada===rodadaAtual&&S.ini===lutaAtual&&S.fase==='intro')proxPasso()},reduzir?200:1100);
}
function faseChefe(){
  const I=S.ini;if(!I||I.hp<=0||I.hp>=I.max/2)return;
  if(temTraco('barril')&&!I.bebeu){
    I.bebeu=true;I.hp=Math.min(I.max,I.hp+12);if(!I.tracos.includes('pele'))I.tracos.push('pele');montarFichas();
    setTimeout(()=>{dispararTraco('barril','Bebeu do barril! +12 vida');SOM.cura();pulsar($('barraI'),'flash');numeroFlutuante('+12',$('barraI'),TRACOS.barril.cor);banner(`${I.nome} bebe do barril`,'mau');hud()},700);
  }
  if(temTraco('furia')&&!I.furioso){
    I.furioso=true;I.base+=2;if(!I.tracos.includes('duplo'))I.tracos.push('duplo');montarFichas();
    setTimeout(()=>{dispararTraco('furia','Fúria! Base +2 e Mão Dupla');tremer(.6);SOM.traco();vinheta('#ff6a4a');banner(`${I.nome} perdeu a paciência`,'mau');hud()},700);
  }
}
function podeLancar(){return S.fase==='jogador'&&S.restam>0}
function dividirPassos(seq){const ps=[];for(const ch of seq){const u=ps[ps.length-1];if(ch==='j'&&u&&u.t==='j')u.n++;else ps.push({t:ch,n:1})}return ps}
function sortearCasa(){return Array.from({length:temTraco('duplo')?2:1},()=>pick(S.ini.bolsa))}
const casaRestantes=()=>S.cTotal-S.cFeitos;
const pressaoLuta=()=>Math.max(0,Math.floor(((S.rodada||1)-1)/3));
const calorTaverna=()=>Math.min(3,Math.floor(((S.stats&&S.stats.rodadas)||0)/12));
const danoExtra=()=>Math.floor(((S.rodada||1)-1)/3);
const baseAtual=()=>Math.max(0,S.ini.base+((S.desafio||0)>=2?1:0)+(S.modo&&S.modo.base||0)+pressaoLuta()+calorTaverna()-(S.rodada===1&&conjAtivo('relojoeiro')?3:0));
const tetoAtual=()=>S.modo&&S.modo.teto?alvoAtual()+S.modo.teto:Infinity;
const estourou=()=>casaRestantes()===0&&S.soma>tetoAtual();
function podeParar(){return!!(S.modo&&S.modo.parar&&S.fase==='jogador'&&casaRestantes()===0&&S.voando===0&&S.soma>0)}
function parar(){
  if(!podeParar())return;
  if(CONT)CONT.alav.puxada=1;
  SOM.batida(9,true);setTimeout(()=>SOM.tensao(),120);tremer(.12);
  S.restam=0;S.passoI=S.passos.length;resolver();
}
function proxPasso(){
  if(S.hp<=0||S.ini.hp<=0||S.fase==='resolvendo')return;
  if(estourou()){resolver();return}
  S.passoI++;
  const p=S.passos[S.passoI];
  if(!p){resolver();return}
  if(p.t==='j'){
    S.fase='jogador';S.restam=p.n;placar();bandeja();
    if(!S.mao.filter(id=>id!==S.congelado).length&&!S.bolsa.length){S.etapa+=p.n;S.restam=0;setTimeout(proxPasso,300)}
    return;
  }
  S.fase='casa';S.cPasso++;placar();bandeja();
  const lista=S.proxCasa,passoC=S.cPasso;S.voando+=lista.length;
  S.proxCasa=casaRestantes()>1?sortearCasa():null;
  setTimeout(()=>{
    MESA.bolsaPulso=1;SOM.puxar();
    avisar(`A casa tirou ${lista.map(d=>d.nome).join(' e ')}`);
    lista.forEach((d,i)=>setTimeout(()=>{lancar(d,'casa',-TD/2+1.6+i*1.2+passoC*.8);lancados[lancados.length-1].passoC=passoC},220+i*260));
  },450);
}
function anunciarModo(subiuP,subiuC){
  const b=$('banner'),p=pressaoLuta(),c=calorTaverna(),de=danoExtra();
  const extra=[p?`Pressão da luta +${p}`:'',c?`Calor da taverna +${c}`:'',de?`Erros custam +${de}`:''].filter(Boolean).join(' · ');
  b.innerHTML=`<small>Rodada ${S.rodada}</small>${S.modo.nome}<span>${S.modo.desc}</span>${extra?`<em>${extra}</em>`:''}`;
  if(subiuP||subiuC)setTimeout(()=>{if(CONT)rotuloMesa(subiuC?`Calor da taverna! Base +1`:`Pressão! Base +1`,CONT.mostr.alvo.w.getWorldPosition(new THREE.Vector3()),'#f08a7e');pulsar($('alvo'));SOM.traco();tremer(.15)},900);
  b.className='on modo';SOM.tensao();
  clearTimeout(timerBanner);timerBanner=setTimeout(()=>b.className='',reduzir?1600:2400);
}
function podePuxar(){return podeLancar()&&S.bolsa.length>0&&S.mao.length<maoMax()}
function alvoAtual(){return baseAtual()+Math.max(0,(S.rolagem||0)-(S.descontoCasa||0))+S.aposta}
function puxar(atraso=0){
  const i=Math.floor(R()*S.bolsa.length);const id=S.bolsa.splice(i,1)[0];S.mao.push(id);
  const d=S.dados.find(x=>x.id===id),luta=S.ini;
  setTimeout(()=>{if(S.ini!==luta||!S.mao.includes(id))return;addBandeja(d);marcar();SOM.puxar();pulsar($('bolsa'),'sacode')},atraso);
}
function puxarPago(){if(!podePuxar())return;puxar(0);S.aposta+=custoPuxar();if(temItem('copo'))dispararItem('copo',`só +${custoPuxar()}`);bandeja();placar();pulsar($('alvo'));SOM.tensao()}
function lancarDaBandeja(it,forca){
  if(S.congelado&&it.die.id===S.congelado&&podeLancar()){avisar('Esse dado está preso');dispararTraco('congela','Preso!');SOM.batida(6,true);it.body.velocity.set(rnd(1),5,rnd(1));return false}
  if(!podeLancar()){avisar(S.fase==='casa'?'Espere a casa lançar':'Agora não dá para lançar');if(CONT)CONT.lampadas.forEach(l=>l.i=Math.max(l.i,.9));SOM.tensao();return false}
  const zr=Math.max(-1,Math.min(1,camera.aspect<.85?it.body.position.x/(B.w/2):it.body.position.z/(B.d/2)));
  tirarBandeja(it);S.mao=S.mao.filter(i=>i!==it.die.id);S.naMesa.push(it.die.id);
  S.restam--;S.lancados++;S.voando++;S.etapa++;
  if(temTraco('cobrador')&&S.lancados>2){S.hp-=2;S.stats&&0;dispararTraco('cobrador','−2 vida');SOM.dano();pulsar($('barraJ'),'flash');numeroFlutuante('-2',$('barraJ'),'#e0574a');hud()}
  lancar(it.die,'jogador',zr*TD*.3,forca);bandeja();placar();return true;
}
function guardarNaBolsa(it){
  if(S.fase==='loja'||S.fase==='fim')return;
  tirarBandeja(it);S.mao=S.mao.filter(i=>i!==it.die.id);S.bolsa.push(it.die.id);bandeja();
  SOM.guardar();pulsar($('bolsa'),'sacode');
}
function avisar(t){$('instrucao').textContent=t}
function avancar(){
  if(S.hp<=0){S.fase='resolvendo';hud();setTimeout(()=>fim(false),1200);return}
  if(S.ini.hp<=0){S.fase='resolvendo';hud();banner(`${S.ini.nome} caiu!`,'bom');setTimeout(venceuLuta,1500);return}
  if(S.fase==='jogador'){
    if(S.restam>0&&!estourou()){placar();return}
    proxPasso();
  }else if(S.fase==='casa'){
    const grupo=lancados.filter(t=>t.dono==='casa'&&t.passoC===S.cPasso);
    if(grupo.length>1){
      let marcou=false;
      grupo.sort((a,b)=>b.valor-a.valor).forEach(t=>{if(marcou&&t.rotulo){t.rotulo.style.opacity=.35;t.rotulo.style.textDecoration='line-through'}marcou=true});
      dispararTraco('duplo',`Fica com ${grupo[0].valor}`);
    }
    S.cFeitos++;S.etapa++;
    if(casaRestantes()===0&&S.modo.teto)setTimeout(()=>{if(CONT)rotuloMesa(`Teto ${tetoAtual()}`,CONT.band.mesh.getWorldPosition(new THREE.Vector3()),'#f0b07e')},300);
    proxPasso();
  }
}
function resolver(){
  S.fase='resolvendo';S.etapa=S.modo.seq.length;placar();bandeja();
  const alvo=alvoAtual(),maxT=tetoAtual(),estoura=S.soma>maxT;
  pulsar($('soma'));pulsar($('alvo'));SOM.tensao();
  setTimeout(()=>{
    let msg,tipo;
    if(S.soma>=alvo&&!estoura){
      let d=S.soma;
      if(S.modo.mult){d=Math.round(d*S.modo.mult);setTimeout(()=>{if(CONT)rotuloMesa(`${S.modo.nome} ×${S.modo.mult}`,CONT.mostr.soma.w.getWorldPosition(new THREE.Vector3()),'#f2c661')},200)}
      if(S.modo.teto&&S.soma===maxT){d*=2;conquistar('mosca');setTimeout(()=>{if(CONT)rotuloMesa('Na mosca! ×2',CONT.mostr.soma.w.getWorldPosition(new THREE.Vector3()),'#f2c661');SOM.combo()},200)}
      if(temItem('espelho')&&S.soma===alvo){const q=qtdItem('espelho')+1;d*=q;dispararItem('espelho',`Dano ×${q}`)}
      if(temItem('lamina')){const q=3*qtdItem('lamina');d+=q;dispararItem('lamina',`+${q} de dano`)}
      if(temItem('brasa')){const q=S.naMesa.length*qtdItem('brasa');if(q){d+=q;dispararItem('brasa',`+${q} de dano`)}}
      if(temItem('tabua')){S.serie=(S.serie||0)+1;const q=2*(S.serie-1)*qtdItem('tabua');if(q){d+=q;dispararItem('tabua',`Série +${q}`)}}
      if(temItem('punhal')&&!temTraco('imune')){const q=2*qtdItem('punhal');S.veneno+=q;dispararItem('punhal',`+${q} veneno`)}
      if(temItem('luva')){const q=2*qtdItem('luva');S.ouro+=q;setTimeout(()=>{dispararItem('luva',`+${q} ouro`);SOM.ouro(2);hud()},350)}
      if(S.escudoIni){const b=Math.min(d,S.escudoIni);d-=b;numeroFlutuante(`Bloqueou ${b}`,$('barraI'),FX.escudo.cor)}
      if(conjAtivo('guerreiro')){d+=5;dispararItem('lamina','Guerreiro +5')}
      if(conjAtivo('tesoureiro')){const q=Math.floor(S.ouro/10);if(q){d+=q;dispararItem('coroa',`Tesoureiro +${q}`)}}
      if(temTraco('pele')){d=Math.max(0,d-2);dispararTraco('pele','−2 de dano')}
      if(temTraco('divida')&&S.ini.base>S.ini.base0){S.ini.base--;setTimeout(()=>dispararTraco('divida','Dívida −1'),500)}
      if(S.ini.armadura>0&&d>0){const b=Math.min(d,S.ini.armadura);S.ini.armadura-=b;d-=b;dispararTraco('armadura',`Armadura −${b}`);numeroFlutuante(`Armadura ${b}`,$('barraI'),'#b9c2cc')}
      if(temItem('calice')&&S.hp<S.max){const q=2*qtdItem('calice');S.hp=Math.min(S.max,S.hp+cm(q));setTimeout(()=>{dispararItem('calice',`+${q} vida`);SOM.cura();pulsar($('barraJ'),'flash');hud()},500)}
      S.ini.hp-=d;S.stats.dano+=d;S.stats.maior=Math.max(S.stats.maior,d);if(d>=60)conquistar('golpe60');msg=`Acerto! ${d} de dano`;tipo='bom';
      hitStop=.13;tremer(Math.min(.9,.3+d*.025));SOM.acerto();
      pulsar($('barraI'),'flash');pulsar($('barraI'),'treme');numeroFlutuante(`-${d}`,$('barraI'),'#ffd27a');
      lancados.forEach(t=>{if(t.dono==='jogador'){t.punch=1;faiscas(t.mesh.position,0xffc861,10,3,6)}});
      faiscas(new THREE.Vector3(TW/2-2,0,0),0xffb04a,30,5,9);
    }else{
      if(estoura)conquistar('estouro');
      let bruto=(estoura?S.soma-maxT:alvo-S.soma)+Math.floor(S.andar/3)+danoExtra();
      if(temTraco('vinganca')){bruto+=2;dispararTraco('vinganca','+2 de dano')}
      S.serie=0;
      if(temItem('cachimbo')){S.escudoProx=4*qtdItem('cachimbo');setTimeout(()=>dispararItem('cachimbo','Escudo na próxima'),600)}
      if(temTraco('divida')){S.ini.base+=2;setTimeout(()=>{dispararTraco('divida','Dívida +2 na base');pulsar($('alvo'))},500)}
      if(temTraco('ganancia')&&S.ouro>0){const r=Math.min(2,S.ouro);S.ouro-=r;setTimeout(()=>{dispararTraco('ganancia',`-${r} ouro`);SOM.ouro(2);numeroFlutuante(`-${r}`,$('ouro'),'#e3b64a');hud()},450)}
      if(temItem('ampulheta')&&!estoura&&alvo-S.soma<=2){bruto=0;dispararItem('ampulheta','Salvo pela areia')}
      if(temItem('azarao')&&alvo-S.soma>=5){const q=5*qtdItem('azarao');S.ini.hp-=q;dispararItem('azarao',`${q} na casa`);pulsar($('barraI'),'flash');numeroFlutuante(`-${q}`,$('barraI'),ITENS.azarao.cor)}
      const d=Math.max(0,bruto-S.escudo);S.hp-=d;
      msg=estoura?`Estourou por ${S.soma-maxT}! ${d?`Você perde ${d} de vida`:'O escudo segurou'}`:d?`Faltaram ${alvo-S.soma}. Você perde ${d} de vida`:'Faltou pouco, mas o escudo segurou';tipo='mau';
      if(d){hitStop=.1;tremer(.45);SOM.dano();vinheta('#c9473c');pulsar($('barraJ'),'flash');pulsar($('barraJ'),'treme');numeroFlutuante(`-${d}`,$('barraJ'),'#f08a7e')}
      else{SOM.escudo();vinheta('#8fb3d9');numeroFlutuante('Bloqueado',$('barraJ'),'#8fb3d9')}
    }
    banner(msg,tipo);hud();
    if(S.veneno>0&&S.ini.hp>0)setTimeout(()=>{
      const v=S.veneno*(conjAtivo('alquimista')?2:1);S.ini.hp-=v;S.veneno--;SOM.veneno();pulsar($('barraI'),'flash');numeroFlutuante(`-${v}`,$('barraI'),FX.veneno.cor);hud();
    },650);
    if(temTraco('regen'))setTimeout(()=>{
      if(S.ini.hp<=0||S.ini.hp>=S.ini.max)return;
      S.ini.hp=Math.min(S.ini.max,S.ini.hp+3);dispararTraco('regen','+3 vida');SOM.cura();pulsar($('barraI'),'flash');numeroFlutuante('+3',$('barraI'),TRACOS.regen.cor);hud();
    },1150);
    setTimeout(()=>{if(S.hp<=0)fim(false);else if(S.ini.hp<=0)venceuLuta();else novaRodada()},2100);
  },reduzir?0:480);
}
function venceuLuta(){
  let ganho=Math.round((6+S.andar*2)*(S.ini.elite||S.ini.chefe?1.5:1)*((S.desafio||0)>=3?.75:1));const elite=S.ini.elite;
  if(elite){S.elitesVencidos=(S.elitesVencidos||0)+1;if(S.elitesVencidos>=3)conquistar('elites')}
  if(S.hp<=3)conquistar('porUmFio');
  if(temItem('coroa')){const q=qtdItem('coroa');ganho=Math.round(ganho*(1+.5*q));dispararItem('coroa',`+${50*q}% ouro`)}
  if(temItem('rum')&&S.hp<S.max){const q=8*qtdItem('rum');S.hp=Math.min(S.max,S.hp+cm(q));setTimeout(()=>{dispararItem('rum',`+${q} vida`);SOM.cura();pulsar($('barraJ'),'flash');hud()},400)}
  S.fase='resolvendo';SOM.vitoria();tremer(.6);hitStop=.15;
  faiscas(new THREE.Vector3(0,0,0),0xffd27a,40,6,10);
  const de=(()=>{const r=$('barraI').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})();
  const n=Math.min(10,ganho);
  for(let i=0;i<n;i++)voar(MOEDA_VOO,{x:de.x+rnd(30),y:de.y+rnd(10)},$('ouro'),{atraso:250+i*80,dur:700,aoChegar:()=>{S.ouro+=i<n-1?Math.floor(ganho/n):ganho-Math.floor(ganho/n)*(n-1);SOM.ouro(1);hud()}});
  const chefe=S.no&&S.no.tipo==='chefe',final=chefe&&(S.no.final||S.no.r>=MAPA_LINHAS-1);
  if(conjAtivo('andarilho')&&(elite||chefe)&&S.hp<S.max){const q=cm(10);setTimeout(()=>{S.hp=Math.min(S.max,S.hp+q);dispararItem('cantil',`Andarilho +${q}`);SOM.cura();hud()},500)}
  if(chefe&&!final){conquistar('ato'+(S.no.ato+1));const q=cm(15);if(S.hp<S.max)setTimeout(()=>{S.hp=Math.min(S.max,S.hp+q);SOM.cura();pulsar($('barraJ'),'flash');numeroFlutuante(`+${q}`,$('barraJ'),'#86c48f');banner(`Fim do ${['primeiro','segundo','terceiro'][S.no.ato]} ato`,'bom');hud()},600)}
  setTimeout(()=>{if(final){fim(true);return}abrirRecompensa(ganho,elite||chefe)},reduzir?300:1400+n*80);
}
