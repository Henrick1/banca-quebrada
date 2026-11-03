const emLuta=()=>!!(S.ini&&S.ini.hp>0&&S.hp>0&&['jogador','casa','intro'].includes(S.fase));
function dadoCasaQuebravel(){
  return lancados.filter(t=>t.dono==='casa'&&t.pronto&&!t.quebrado&&t.valor>0).sort((a,b)=>b.valor-a.valor)[0]||null;
}
function quebrarDado(t,v){
  t.quebrado=true;
  faiscas(t.mesh.position,0xd9dde6,34,5,9);faiscas(t.mesh.position,0x9a8a70,18,3,6);
  if(t.body)world.remove(t.body);t.mesh.visible=false;
  if(t.rotulo){t.rotulo.style.opacity=.35;t.rotulo.style.textDecoration='line-through'}
  tremer(.5);hitStop=.08;SOM.batida(12,true);setTimeout(()=>SOM.batida(8,false),70);
  rotuloMesa(v?`Quebrado! −${v}`:'Quebrado!',t.mesh.position,CONSUMIVEIS.martelo.cor);pulsar($('alvo'));
}
function travaCons(k){
  if(!emLuta())return'Só durante a luta';
  if(k==='martelo'&&!dadoCasaQuebravel()&&S.marteloProx)return'O martelo já espera o próximo dado da casa';
  if(k==='tonico'&&S.hp>=S.max)return'Vida cheia';
  if(k==='frasco'&&temTraco('imune'))return'A casa é imune a veneno';
  if(k==='peso'&&S.pesoProx)return'O peso já está no próximo dado';
  if(k==='maoLeve'&&(S.fase!=='jogador'||!S.bolsa.length||S.mao.length>=maoMax()))return S.fase!=='jogador'?'Só na sua vez de lançar':!S.bolsa.length?'Bolsa vazia':'Mão cheia';
  return'';
}
function renderCons(){
  const el=$('cons');if(!el)return;
  const l=S.cons||[],n=consMax();
  el.hidden=!S.ini;
  el.innerHTML=`<span class="cons-tit">Bolso</span>`+Array.from({length:n},(_,i)=>{
    const k=l[i];if(!k)return`<span class="cons-slot vazio" aria-hidden="true"></span>`;
    const c=CONSUMIVEIS[k],tr=travaCons(k),desc=k==='martelo'&&S.ini&&!dadoCasaQuebravel()?'Sem dado da casa na mesa agora: quebra o próximo que ela lançar.':c.desc;
    return`<button class="cons-slot${tr?' trava':''}" type="button" data-cons="${i}" style="--c:${c.cor}" aria-label="${c.nome}: ${desc}${tr?' ('+tr+')':''}"><svg viewBox="0 0 24 24"><path fill="${c.cor}" fill-rule="evenodd" d="${PATHS[k]}"/></svg><span class="cons-dica"><b>${c.nome}</b>${desc}${tr?`<em>${tr}</em>`:'<em class="ok">Clique para usar</em>'}</span></button>`;
  }).join('');
}
function usarCons(i){
  const k=(S.cons||[])[i];if(!k)return;
  const tr=travaCons(k);
  if(tr){avisar(tr);SOM.batida(4,true);pulsar($('cons'),'treme');return}
  const c=CONSUMIVEIS[k],slot=document.querySelector(`[data-cons="${i}"]`),de=slot?slot.getBoundingClientRect():null;
  S.cons.splice(i,1);
  const efeito={
    martelo(){
      const t=dadoCasaQuebravel();
      if(!t){S.marteloProx=true;SOM.batida(10,true);avisar('O martelo vai quebrar o próximo dado da casa');return}
      const v=t.valor;t.valor=0;S.rolagem=valorCasa();quebrarDado(t,v);
    },
    tonico(){const q=cm(12);S.hp=Math.min(S.max,S.hp+q);SOM.cura();pulsar($('barraJ'),'flash');numeroFlutuante(`+${q}`,$('barraJ'),c.cor)},
    faca(){
      S.ini.hp-=8;S.stats.dano+=8;SOM.dano();tremer(.3);pulsar($('barraI'),'flash');pulsar($('barraI'),'treme');numeroFlutuante('-8',$('barraI'),'#ffd27a');
      if(de)voar(svgPath('faca',c.cor),{x:de.left+de.width/2,y:de.top+de.height/2},$('barraI'),{dur:380});
    },
    frasco(){$('efVeneno').hidden=false;S.veneno+=5;SOM.veneno();pulsar($('veneno'));numeroFlutuante('Veneno 5',$('barraI'),c.cor)},
    peso(){S.pesoProx=6;SOM.batida(10,true);avisar('O próximo dado que parar vale +6')},
    maoLeve(){let n=0;for(let j=0;j<2;j++)if(S.bolsa.length&&S.mao.length<maoMax())puxar(n++*170);bandeja()}
  };
  efeito[k]();
  if(S.stats)S.stats.consumiveis=(S.stats.consumiveis||0)+1;
  banner(c.nome,'bom');hud();placar();renderCons();
  if(S.ini.hp<=0&&S.voando===0&&S.fase!=='resolvendo')avancar();
}
$('cons').addEventListener('click',e=>{const b=e.target.closest('[data-cons]');if(b)usarCons(+b.dataset.cons)});
