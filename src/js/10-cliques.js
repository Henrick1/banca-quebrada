$('overlay').addEventListener('click',e=>{
  const a=e.target.closest('[data-acao]');
  if(a){
    const ac=a.dataset.acao;
    if(menuAcao(ac,a))return;
    if(ac==='comecar'||ac==='denovo')novaPartida();
    if(ac==='teste')novaPartida(true);
    if(ac==='seguir'||ac==='mapa'){S.loja=null;telaMapa()}
    if(ac==='ev'){const op=S.evOps&&S.evOps[+a.dataset.i];if(op&&!op.trava){const r=op.acao();if(r)resultadoEvento(r)}return}
    if(ac==='pular'&&!S.loja.pegou){S.loja.pegou=S.loja.pulou=true;S.ouro+=3;S.loja.sel=null;SOM.ouro(3);hud();renderLoja();autoSairLoja()}
    return;
  }
  const no=e.target.closest('[data-no]');
  if(no&&S.fase==='mapa')return;
  const L=S.loja;if(!L)return;
  const fc=e.target.closest('[data-f]');
  if(fc&&L.sel){
    const o=L.sel,d=S.dados.find(x=>x.id===+fc.dataset.d),f=d.faces[+fc.dataset.f];
    if(o.kind==='bonus')f.bonus+=o.n;else if(o.kind==='pacto'){f.bonus+=5;f.fx={k:'pacto',n:2}}else if(o.kind==='sombria'){f.bonus=-(f.v+3);f.fx={k:'fogo',n:10}}else f.fx={...o.fx};
    L.flash={die:d.id,face:+fc.dataset.f};SOM.grava();
    concluirOferta(o);return;
  }
  const q=e.target.closest('[data-queimar]');
  if(q&&L.sel&&L.sel.kind==='polir'){
    const o=L.sel,d=S.dados.find(x=>x.id===+q.dataset.queimar);d.faces.forEach(f=>f.bonus+=1);L.flash={die:d.id};SOM.grava();setTimeout(()=>SOM.combo(),120);
    concluirOferta(o);return;
  }
  if(q&&L.sel&&L.sel.kind==='encanto'){
    const o=L.sel,d=S.dados.find(x=>x.id===+q.dataset.queimar);d.encanto=o.chave;registrarVisto('encantos',o.chave);
    L.flash={die:d.id};SOM.grava();setTimeout(()=>SOM.combo(),120);
    concluirOferta(o);return;
  }
  if(q&&L.sel&&L.sel.kind==='queimar'){
    const alvoEl=q,o=L.sel;SOM.fogo();
    alvoEl.animate([{transform:'none',opacity:1,filter:'none'},{transform:'scale(.9) translateY(-6px)',opacity:.7,filter:'sepia(1) saturate(4) hue-rotate(-20deg) brightness(1.4)',offset:.4},{transform:'scale(.6) translateY(-20px)',opacity:0,filter:'brightness(3)'}],{duration:reduzir?1:520,easing:'ease-in'}).onfinish=()=>{S.dados=S.dados.filter(d=>d.id!==+q.dataset.queimar);concluirOferta(o)};
    return;
  }
  const fz=e.target.closest('[data-fundir]');
  if(fz&&L.sel&&L.sel.kind==='fundir'){
    const d=S.dados.find(x=>x.id===+fz.dataset.fundir);if(!d)return;
    if(!L.fundirA){if(!paresFundiveis().includes(d.type)){SOM.batida(3,false);return}L.fundirA=d.id;SOM.batida(5,false);renderBolsaLoja();return}
    if(L.fundirA===d.id){L.fundirA=null;renderBolsaLoja();return}
    const a=S.dados.find(x=>x.id===L.fundirA);if(!a||a.type!==d.type){SOM.batida(3,false);return}
    const o=L.sel,n=fundir(a,d);L.fundirA=null;L.flash={die:n.id};SOM.grava();setTimeout(()=>SOM.combo(),150);
    concluirOferta(o);return;
  }
  const ds=e.target.closest('[data-dsel]');
  if(ds){L.verDado=+ds.dataset.dsel;SOM.batida(4,false);renderBolsaLoja();return}
  const ob=e.target.closest('[data-o]');
  if(!ob||ob.disabled)return;
  const o=todasOfertas().find(x=>x.id===+ob.dataset.o);
  if(L.sel===o){L.sel=null;renderLoja();return}
  if(o.kind==='item'){ganharItem(o.chave);SOM.compra();SOM.item();L.flash={item:o.chave};concluirOferta(o);return}
  if(o.kind==='dado'){const nd=novoDado(o.tipo);S.dados.push(nd);L.flash={die:nd.id};SOM.compra();setTimeout(()=>SOM.batida(6,DIE[o.tipo].metal),120);concluirOferta(o)}
  else if(o.kind==='cura'){S.hp=Math.min(S.max,S.hp+cm(o.n));SOM.cura();concluirOferta(o)}
  else if(o.kind==='renovar'){moedasParaItem(o,precoDe(o));efeitoCompra(o);S.ouro-=precoDe(o);L.renov++;L.sel=null;gerarEstoque();SOM.puxar();hud();renderLoja();document.querySelectorAll('.mercador .oferta').forEach((c,i)=>c.animate([{transform:'rotateY(90deg)',opacity:0},{transform:'none',opacity:1}],{duration:reduzir?1:320,delay:i*45,easing:'cubic-bezier(.2,.9,.3,1.2)',fill:'backwards'}))}
  else{L.sel=o;renderLoja();if(innerWidth<=760)document.querySelector('.loja-bolsa').scrollIntoView({behavior:'smooth',block:'start'})}
});
$('overlay').addEventListener('keydown',e=>{const no=e.target.closest&&e.target.closest('[data-no]');if((e.key==='Enter'||e.key===' ')&&no&&no.classList.contains('disp')){e.preventDefault();escolherNo(no.dataset.no);return}if((e.key==='Enter'||e.key===' ')&&e.target.dataset.f){e.preventDefault();e.target.click()}});
document.addEventListener('keydown',e=>{if((e.key==='p'||e.key==='P')&&podeParar())parar()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.fase==='loja'&&S.loja&&S.loja.sel){S.loja.sel=null;S.loja.fundirA=null;renderLoja()}});

function fecharOverlay(){$('overlay').hidden=true;$('overlay').innerHTML=''}
