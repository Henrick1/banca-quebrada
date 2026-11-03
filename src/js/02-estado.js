const S={modo:MODOS.classico,passos:[],passoI:-1,cTotal:0,cFeitos:0,etapa:0,hp:40,max:40,ouro:0,andar:0,dados:[],ini:null,fase:'parado',restam:0,lancados:0,bolsa:[],mao:[],naMesa:[],aposta:0,itens:[],escudoIni:0,rolagens:[],rodada:0,proxCasa:null,soma:0,rolagem:null,escudo:0,veneno:0,voando:0,loja:null};

function novoDado(tipo){return{id:uid++,type:tipo,faces:DIE[tipo].faces.map(v=>({v,bonus:0,fx:null}))}}
function valorFace(f){return(f.v+f.bonus)*(f.fx&&f.fx.k==='dobro'?2:1)}
function svgTipo(t,cor){return`<svg class="tipo" viewBox="0 0 24 24" fill="${cor||DIE[t].cor}" stroke="#0008" stroke-width="1.2">${ICONE_TIPO[t]}</svg>`}
function icone(fx){
  if(!fx)return'';
  if(fx.k==='dobro')return'<b class="x2">×2</b>';
  return`<svg viewBox="0 0 24 24"><path fill="${FX[fx.k].cor}" fill-rule="evenodd" d="${PATHS[fx.k]}"/></svg>`;
}
function chip(d,i,extra='',cls=''){
  const f=d.faces[i];const r=DIE[d.type].rot;
  const t=(r?r[i]+' ':'')+(f.v+f.bonus)+(f.fx?' · '+FX[f.fx.k].nome+(f.fx.n?' '+f.fx.n:''):'');
  return`<span class="face${f.bonus?' up':''}${cls?' '+cls:''}" title="${t}" ${extra}>${r?r[i][0]+' ':''}${f.v+f.bonus}${icone(f.fx)}</span>`;
}

