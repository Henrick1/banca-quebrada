const noApp=()=>typeof window!=='undefined'&&!!window.bqArquivo&&!!window.bqArquivo.telaCheia;
function eTelaCheia(){return noApp()?window.bqArquivo.eTelaCheia():!!document.fullscreenElement}
function alternarTelaCheia(){
  if(noApp())window.bqArquivo.telaCheia();
  else if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  else if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
  setTimeout(()=>{if($('opTela'))$('opTela').textContent=eTelaCheia()?'Sair da tela cheia':'Entrar em tela cheia'},350);
}
function aplicarQualidade(){
  const q=qualidade();
  const pares=[[typeof renderer!=='undefined'&&renderer,typeof scene!=='undefined'&&scene],[B&&B.r,B&&B.scene],[typeof LJ!=='undefined'&&LJ&&LJ.r,typeof LJ!=='undefined'&&LJ&&LJ.sc],[BOL.r,BOL.sc]];
  for(const[r,sc]of pares){
    if(!r)continue;
    r.setPixelRatio(r===renderer||(typeof LJ!=='undefined'&&LJ&&r===LJ.r)?pxQualidade():pxPequeno());
    if(r.shadowMap.enabled!==q.sombra){r.shadowMap.enabled=q.sombra;r.shadowMap.needsUpdate=true;if(sc)sc.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
  }
  if(typeof ajustar==='function'&&renderer)ajustar();
  if(B&&B.r)ajustarBandeja();
  if(typeof LJ!=='undefined'&&LJ){LJ.w=0;ajustarLoja3D()}
  ajustarBolso();
}
function telaOpcoes(){
  const app=noApp();
  abrirTela(`<div class="tela">
    <div class="tela-topo"><div><p class="menu-sobre">Do seu jeito</p><h2>Opções</h2></div><button class="btn sec" data-acao="menu">Voltar</button></div>
    <section class="bloco"><h3>Tela</h3>
      <div class="op-linha"><span><b>Tela cheia</b><small>${app?'Atalho: F11':'Atalho: F11 no navegador'}</small></span><button class="btn sec fino" id="opTela" data-acao="telacheia">${eTelaCheia()?'Sair da tela cheia':'Entrar em tela cheia'}</button></div>
    </section>
    <section class="bloco"><h3>Velocidade</h3>
      <div class="grade-builds">${[[1,'Normal','O ritmo pensado para o jogo'],[2,'Rápida','Rolagens e pausas pela metade'],[4,'Turbo','Para quem já sabe o que está fazendo']].map(([v,n,d])=>`<button class="build pequeno${velJogo()===v?' sel':''}" data-acao="vel" data-k="${v}">${velJogo()===v?'<span class="selo">Atual</span>':''}<b>${n} · ${v}×</b><p>${d}</p></button>`).join('')}</div>
    </section>
    <section class="bloco"><h3>Som</h3>
      <label class="op-linha"><span><b>Efeitos</b><small id="opVolTxt">${OPCOES.volume}%</small></span><input class="op-slider" id="opVol" type="range" min="0" max="100" step="5" value="${OPCOES.volume}"></label>
      <label class="op-linha"><span><b>Música e ambiente</b><small id="opMusTxt">${OPCOES.musica??45}%</small></span><input class="op-slider" id="opMus" type="range" min="0" max="100" step="5" value="${OPCOES.musica??45}"></label>
      <div class="op-linha"><span><b>Som ligado</b><small>${SOM.mudo?'Desligado':'Ligado'}</small></span><button class="btn sec fino" data-acao="opsom">${SOM.mudo?'Ligar som':'Desligar som'}</button></div>
    </section>
    <section class="bloco"><h3>Qualidade gráfica</h3>
      <div class="grade-builds">${Object.entries(QUALIDADE).map(([k,q])=>`<button class="build pequeno${OPCOES.qualidade===k?' sel':''}" data-acao="qual" data-k="${k}">${OPCOES.qualidade===k?'<span class="selo">Atual</span>':''}<b>${q.nome}</b><p>${q.desc}</p></button>`).join('')}</div>
    </section>
    ${app?`<section class="bloco"><h3>Sobre</h3><p class="op-nota">Versão ${window.bqArquivo.versao()} · o jogo se atualiza sozinho quando há versão nova.<br>Seu progresso fica em <code>${window.bqArquivo.pasta()}\\save.json</code></p></section>`:''}
  </div>`);
}
function opcoesAcao(ac,el){
  if(ac==='opcoes'){telaOpcoes();return true}
  if(ac==='telacheia'){alternarTelaCheia();return true}
  if(ac==='opsom'){SOM.iniciar();SOM.alternar();botaoSom();telaOpcoes();return true}
  if(ac==='vel'){OPCOES.velocidade=+el.dataset.k;salvarOpcoes();SOM.compra();telaOpcoes();return true}
  if(ac==='qual'){const k=el.dataset.k;if(QUALIDADE[k]&&OPCOES.qualidade!==k){OPCOES.qualidade=k;salvarOpcoes();aplicarQualidade()}SOM.compra();telaOpcoes();return true}
  return false;
}
$('overlay').addEventListener('input',e=>{
  if(e.target.id==='opMus'){OPCOES.musica=+e.target.value;$('opMusTxt').textContent=OPCOES.musica+'%';SOM.iniciar();MUS.aplicarVolume();salvarOpcoes();return}
  if(e.target.id!=='opVol')return;
  OPCOES.volume=+e.target.value;$('opVolTxt').textContent=OPCOES.volume+'%';SOM.iniciar();SOM.aplicarVolume();salvarOpcoes();
});
$('overlay').addEventListener('change',e=>{if(e.target.id==='opVol')SOM.batida(8,true)});
