
const TW=20,TD=12;
const $=s=>document.getElementById(s);
const rnd=a=>(Math.random()-.5)*2*a;
const RNG={s:0,ativo:false,next(){let t=(this.s+=0x6D2B79F5)>>>0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const R=()=>RNG.ativo?RNG.next():Math.random();
const pick=a=>a[Math.floor(R()*a.length)];
let uid=1;
const MAO_INICIAL=3,MAO_MAX=5,CUSTO_PUXAR=2;

