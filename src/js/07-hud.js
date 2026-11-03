let timerBanner;
function banner(t,tipo){const b=$('banner');b.textContent=t;b.innerHTML=b.innerHTML;b.className='on '+tipo;clearTimeout(timerBanner);timerBanner=setTimeout(()=>b.className='',1800)}

function hud(){
  if(S.ouro>=100&&S.mapa)conquistar('rico');
  const pj=Math.max(0,S.hp/S.max*100)+'%';$('hpJ').style.width=pj;$('hpJf').style.width=pj;$('hpJt').textContent=`${Math.max(0,S.hp)} / ${S.max}`;
  contar($('ouro'),S.ouro);contar($('escudo'),S.escudo);
  $('efEscudo').hidden=S.escudo<=0;
  $('efArmadura').hidden=!(S.ini&&S.ini.armadura>0);$('armadura').textContent=S.ini&&S.ini.armadura||0;
  $('efVeneno').hidden=!(S.ini&&S.veneno>0);$('efEscudoIni').hidden=!(S.ini&&S.escudoIni>0);$('escudoIni').textContent=S.escudoIni;
  $('andar').innerHTML=`<small>Andar</small>${(S.linha||0)+1} de ${MAPA_LINHAS}`;
  if(S.ini){
    $('iniNome').textContent=S.ini.nome;
    const pi=Math.max(0,S.ini.hp/S.ini.max*100)+'%';
    if(S.barraSemAnim){S.barraSemAnim=false;[$('hpI'),$('hpIf')].forEach(b=>{b.style.transition='none';b.style.width=pi;void b.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>{b.style.transition=''}))})}
    $('hpI').style.width=pi;$('hpIf').style.width=pi;$('hpIt').textContent=`${Math.max(0,S.ini.hp)} / ${S.ini.max}`;
    $('iniInfo').innerHTML=`Base <b>${baseAtual()}</b> · Bolsa <b>${S.ini.bolsa.length} dados</b>`;
    $('veneno').textContent=S.veneno;
  }
  if(typeof renderCons==='function')renderCons();
}
function bandeja(){
  $('contagem').textContent=`${S.mao.length}/${maoMax()} na mão`;
  const n=S.bolsa.length;
  $('bolsa').disabled=!podePuxar();
  $('bolsaAcao').textContent=!n?'Vazia':S.mao.length>=maoMax()?'Mão cheia':podeLancar()?(custoAtual()?`Puxar: alvo +${custoAtual()}`:'Puxar: grátis'):`${n} dado${n>1?'s':''}`;
  $('bolsaConteudo').innerHTML=S.bolsa.map(id=>svgTipo(S.dados.find(d=>d.id===id).type)).join('');
}
function placar(){
  if(S.ini){const a=alvoAtual();CLIMA.soma=S.fase!=='resolvendo'&&S.soma>=Math.max(15,a*1.4)&&!(S.modo&&S.modo.teto&&S.soma>tetoAtual())?(S.soma>=Math.max(30,a*2.2)?2:1):0}
  if(S.soma===0){$('soma').textContent=0;$('soma').dataset.v=0}
  if(S.ini)$('alvo').textContent=String(alvoAtual());
  let ins='';
  if(S.fase==='jogador')ins=S.restam?`Lance ${S.restam} dado${S.restam>1?'s':''} da sua bandeja`:'Esperando os dados pararem';
  else if(S.fase==='casa')ins='A casa está lançando';
  else if(S.fase==='resolvendo')ins='Contando os pontos';
  $('instrucao').textContent=ins;
}
$('bolsa').addEventListener('click',puxarPago);

