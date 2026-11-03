
const TW=20,TD=12;
const $=s=>document.getElementById(s);
const ARMAZ=(()=>{
  const arq=typeof window!=='undefined'&&window.bqArquivo;
  const ls=()=>{try{return localStorage}catch(e){return null}};
  if(!arq)return{getItem:k=>{const l=ls();return l?l.getItem(k):null},setItem:(k,v)=>{const l=ls();if(l)l.setItem(k,v)},removeItem:k=>{const l=ls();if(l)l.removeItem(k)}};
  const dados=arq.ler()||{};
  if(!Object.keys(dados).length){const l=ls();if(l)for(const k of['bq-perfil','bq-partida','bq-mudo']){const v=l.getItem(k);if(v!==null)dados[k]=v}if(Object.keys(dados).length)arq.gravar(dados)}
  return{getItem:k=>k in dados?dados[k]:null,setItem:(k,v)=>{dados[k]=String(v);arq.gravar(dados)},removeItem:k=>{delete dados[k];arq.gravar(dados)}};
})();
const rnd=a=>(Math.random()-.5)*2*a;
const RNG={s:0,ativo:false,next(){let t=(this.s+=0x6D2B79F5)>>>0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const R=()=>RNG.ativo?RNG.next():Math.random();
const pick=a=>a[Math.floor(R()*a.length)];
let uid=1;
const MAO_INICIAL=3,MAO_MAX=5,CUSTO_PUXAR=2;

