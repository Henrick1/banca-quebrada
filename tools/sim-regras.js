const CFG=Object.assign({missFlat:0,missTier:3,eliteMult:1.25,vida:45,pressDiv:3,calorDiv:12,calorMax:3,polir:.5,botEsperto:1,armK:6},ARGS);
const sorteia=a=>a[Math.floor(Math.random()*a.length)];
const RAR={d20:'raro',d10:'incomum',d12:'incomum',d8:'comum',d4:'comum',d6:'comum',coin:'comum',tonico:'comum',peso:'comum',faca:'incomum',frasco:'incomum',martelo:'incomum',maoLeve:'raro'};
const pesoR=(r,linha,bonus=0)=>{const p=Math.min(1,linha/11)+bonus;return r==='raro'?6+22*p:r==='incomum'?26+12*p:68-34*p};
const sorteiaR=(lista,linha,bonus=0)=>{if(CFG.semRaridade)return sorteia(lista);const w=lista.map(k=>pesoR(RAR[k]||'comum',linha,bonus)),t=w.reduce((a,b)=>a+b,0);let r=Math.random()*t,i=0;while(i<w.length-1&&(r-=w[i])>0)i++;return lista[i]};
const usa=(P,k)=>{if(CFG.semCons)return false;const i=P.cons.indexOf(k);if(i<0)return false;P.cons.splice(i,1);P.usados=(P.usados||0)+1;return true};
const ganhaCons=(P,linha,bonus)=>{if(CFG.semCons||P.cons.length>=3)return;P.cons.push(sorteiaR(['tonico','peso','faca','frasco','martelo','maoLeve'],linha,bonus))};
const media=d=>d.faces.reduce((s,f)=>s+valorFace(f),0)/d.faces.length+(d.encanto?1.5:0);
function rolar(d){return d.faces[Math.floor(Math.random()*d.faces.length)]}
function luta(P,no,stats){
  const b=INIMIGOS[no.inimigo],elite=no.tipo==='elite',des=CFG.des||0;
  const E={hp:Math.round((CFG.hpTab?CFG.hpTab[no.inimigo]:b.hp)*(elite?(CFG.eliteMult||1.35):1)*(des>=1?1.15:1)*(CFG.hpMult||1)),tracos:[...b.tracos.filter(t=>!(CFG.semTracos||[]).includes(t)),...(elite&&no.extra?[no.extra]:[])],bolsa:(no.tipo==='chefe'&&CFG.bossBolsa?CFG.bossBolsa:b.bolsa).map(k=>DADOS_CASA[k]()),base:(CFG.baseTab?CFG.baseTab[no.inimigo]:b.base)+(CFG.baseAdd||0),veneno:0};
  const tier=tierDe(no.inimigo);E.base0=E.base;
  E.max=E.hp;if(E.tracos.includes('armadura'))E.arm=E.armMax=CFG.armK?CFG.armK+tier:10+tier*2;
  const tem=k=>E.tracos.includes(k);let rod=0;
  const chefe=no.tipo==='chefe'||no.tipo==='elite';
  if(chefe&&usa(P,'frasco')&&!E.tracos.includes('imune'))E.veneno+=5;
  while(P.hp>0&&E.hp>0&&rod<40){
    if(P.hp<P.max*.35&&usa(P,'tonico'))P.hp=Math.min(P.max,P.hp+(des>=5?5:(CFG.tonico??10)));
    if(E.hp<=8&&usa(P,'faca')){E.hp-=8;stats.dano+=8;if(E.hp<=0)break}
    rod++;stats.rodadas++;P.rodTotal++;
    const modos=b.modos||['classico'],m=MODOS[modos[(rod-1)%modos.length]];
    if(rod>1&&tem('crescente'))E.base++;
    if(E.hp<E.max/2){if(tem('barril')&&!E.bebeu){E.bebeu=1;E.hp=Math.min(E.max,E.hp+12);E.tracos.push('pele')}if(tem('furia')&&!E.furia){E.furia=1;E.base+=2;E.tracos.push('duplo')}}
    if(E.armMax&&rod>1&&(rod-1)%3===0)E.arm=E.armMax;
    let base=Math.max(0,E.base+(no.tipo==='chefe'?(CFG.bossBase||0):0)+(m.base||0)+Math.floor((rod-1)/(CFG.pressDiv||2))+Math.min(CFG.calorMax??99,Math.floor(P.rodTotal/(CFG.calorDiv||8)))+(des>=2?1:0)-(rod===1&&P.relog?3:0));
    let mao=[...P.dados].sort(()=>Math.random()-.5).slice(0,Math.max(3+(P.bolsaFunda||0),m.seq.split('j').length-1)+(chefe&&rod===1&&P.cons.includes('maoLeve')&&usa(P,'maoLeve')?2:0));
    let peso=0,pesoUsado=0;
    if((tem('congela')||tem('raizes'))&&mao.length>1)mao.splice(Math.floor(Math.random()*mao.length),1);
    const vals=[];let corvou=0;
    mao.sort((a,b)=>media(b)-media(a));
    let soma=0,casa=0,cFeitos=0,cTot=m.seq.split('').filter(c=>c==='c').length,escudo=P.escudoIni||0,escCasa=0,lancados=0,aposta=0,parou=false;
    const alvo=()=>base+casa+aposta,teto=()=>m.teto?alvo()+m.teto:Infinity;
    for(const ch of m.seq){
      if(parou)break;
      if(ch==='c'){
        const qtd=tem('enxame')?3:tem('duplo')?2:1;let melhor=-1,somaE=0;
        const resto=[...E.bolsa];for(let i=0;i<Math.min(qtd,resto.length);i++){const d=resto.splice(resto.indexOf(sorteia(resto)),1)[0],f=rolar(d);let v=valorFace(f);
          if(d.area){if(d.area.tipo==='raio')soma-=2*Math.min(1,lancados*.5);else soma-=3*Math.min(2,lancados)}
          if(f.fx){if(f.fx.k==='espinho')P.hp-=f.fx.n;if(f.fx.k==='escudo')escCasa+=f.fx.n;if(f.fx.k==='cura')E.hp=Math.min(E.max,E.hp+f.fx.n);if(f.fx.k==='roubo')P.ouro=Math.max(0,P.ouro-f.fx.n)}
          if(d.lodo)soma-=Math.min(vals.length,2);
          melhor=Math.max(melhor,v);somaE+=v}
        if(tem('enxame'))melhor=somaE;
        if(tem('corvo')&&vals.length&&!corvou){corvou=1;const i=Math.floor(Math.random()*vals.length);soma-=vals[i];vals.splice(i,1)}
        let vc=Math.max(0,melhor-(P.baralho||0));if(vc>=6&&usa(P,'martelo'))vc=0;
        casa+=vc;cFeitos++;
      }else{
        if(m.parar&&cFeitos===cTot&&soma>=alvo())break;
        if(!mao.length){if(P.dados.length>mao.length&&cFeitos===cTot&&soma<alvo()){mao=[sorteia(P.dados)];aposta+=CFG.custo??2}else continue}
        let d;
        if(m.parar&&cFeitos===cTot){const falta=teto()-soma;mao.sort((a,b)=>media(b)-media(a));d=mao.find(x=>media(x)<=falta)||mao[mao.length-1]}else d=mao[0];
        mao.splice(mao.indexOf(d),1);
        if(!pesoUsado&&cFeitos===cTot&&!mao.length&&soma+media(d)<alvo()&&soma+media(d)+6>=alvo()&&usa(P,'peso')){peso=6;pesoUsado=1}
        const f=rolar(d);let v=valorFace(f)+(d.encanto&&Math.random()<.4?4:0)+(P.bonusDado||0)+peso;peso=0;
        lancados++;if(tem('cobrador')&&lancados>2)P.hp-=2;
        soma+=v;vals.push(v);
        if(tem('mira')&&lancados===1&&v<3)P.hp-=4;
        if(f.fx){const n=f.fx.n||0;
          if(f.fx.k==='fogo'){E.hp-=n;stats.dano+=n}
          if(f.fx.k==='cura')P.hp=Math.min(P.max,P.hp+(des>=5?Math.ceil(n/2):n));
          if(f.fx.k==='escudo')escudo+=n;
          if(f.fx.k==='veneno'&&!tem('imune'))E.veneno+=n;
          if(f.fx.k==='ouro')P.ouro+=n;
          if(f.fx.k==='pacto')P.hp-=n;}
        if(m.teto&&cFeitos===cTot&&soma>teto())break;
      }
    }
    const a=alvo(),t=teto(),est=soma>t;{const k='T'+no.inimigo;const o=stats.ab||(stats.ab={});const q=o[k]||(o[k]={n:0,s:0,a:0,h:0});q.n++;q.s+=soma;q.a+=a;if(soma>=a&&!est)q.h++}
    if(soma>=a&&!est){let d=soma;if(m.mult)d=Math.round(d*m.mult);if(m.teto&&soma===t)d*=2;d+=P.danoExtra||0;
      if(escCasa)d=Math.max(0,d-escCasa);if(tem('pele'))d=Math.max(0,d-2);if(E.arm){const bb=Math.min(d,E.arm);E.arm-=bb;d-=bb}
      E.hp-=d;stats.dano+=d;stats.acertos++;if(tem('divida')&&E.base>E.base0)E.base--;
    }else{let bruto=(est?soma-t:a-soma)+(CFG.missFlat??1)+Math.floor(tier/(CFG.missTier||2))+Math.floor((rod-1)/3);if(tem('vinganca'))bruto+=2;if(tem('divida'))E.base+=2;if(tem('ganancia'))P.ouro=Math.max(0,P.ouro-2);
      const dd=Math.max(0,bruto-escudo);P.hp-=dd;stats.danoSofrido+=dd;stats.erros++;}
    if(E.veneno>0&&E.hp>0){E.hp-=E.veneno;E.veneno--}
    if(tem('regen')&&E.hp>0)E.hp=Math.min(E.max,E.hp+3);
  }
  return{venceu:E.hp<=0&&P.hp>0,rod};
}
function melhorar(P,n){if(CFG.polir&&Math.random()<CFG.polir){const d=P.dados.slice().sort((a,b)=>media(b)-media(a))[Math.floor(Math.random()*2)];d.faces.forEach(f=>f.bonus+=1);return}const d=P.dados.slice().sort((a,b)=>media(b)-media(a))[0];const f=d.faces.slice().sort((a,b)=>valorFace(a)-valorFace(b))[0];f.bonus+=n}
function partida(){
  const des=CFG.des||0;
  const V=CFG.vida||40;const P={cons:['martelo'],hp:des>=5?V-10:V,max:des>=5?V-10:V,ouro:0,dados:[novoDado('d6'),novoDado('d6'),novoDado('d6'),novoDado('coin'),novoDado('d6')],rodTotal:0,danoExtra:0,reliq:0};
  definirReino(0);let M=gerarMapa();let atual=M.inicio,linha=0;const st={rodadas:0,dano:0,danoSofrido:0,acertos:0,erros:0,lutas:[]};
  while(true){
    const no=M.nos[atual];linha=no.r;
    if(no.inimigo!=null){
      const hp0=P.hp,r=luta(P,no,st);st.lutas.push({tier:no.inimigo,tipo:no.tipo,rod:r.rod,perdeu:hp0-Math.max(0,P.hp)});
      if(!r.venceu)return{venceu:false,linha:(S.reino||0)*MAPA_LINHAS+linha+1,st,P};
      if(no.tipo==='chefe'&&(no.final||no.r>=MAPA_LINHAS-1)){if((S.reino||0)>=(CFG.reinos||REINOS.length)-1)return{venceu:true,linha:MAPA_LINHAS*(S.reino+1),st,P};definirReino(S.reino+1);M=gerarMapa();atual=M.inicio;P.hp=P.max;continue}
      if(no.tipo==='chefe')P.hp=Math.min(P.max,P.hp+(des>=5?8:15));
      if(CFG.curaVitoria)P.hp=Math.min(P.max,P.hp+Math.round(P.max*CFG.curaVitoria));P.ouro+=Math.round((6+tierDe(no.inimigo)*2)*(no.tipo==='elite'||no.tipo==='chefe'?1.5:1)*(des>=3?.75:1)*(CFG.ouroMult||1));
      if(Math.random()<(no.tipo==='luta'?(CFG.dropCons??.25):(CFG.dropElite??.6)))ganhaCons(P,linha,no.tipo==='luta'?0:.35);
      if(no.tipo==='elite'||no.tipo==='chefe'){P.reliq++;P.danoExtra+=CFG.reliqDano??2}else{const ofer=sorteiaR(['coin','d4','d6','d8','d10','d12','d20'],linha);if(CFG.botEsperto&&(ofer==='d10'||ofer==='d12'||ofer==='d20')&&P.dados.length<8)P.dados.push(novoDado(ofer));else if(!CFG.botEsperto&&Math.random()<.5&&P.dados.length<8)P.dados.push(novoDado(sorteia(['d6','d10','coin'])));else melhorar(P,2)}
    }else if(no.tipo==='loja'){
      if(!CFG.semCons&&P.ouro>=12&&P.cons.length<3&&Math.random()<.5){P.ouro-=(CFG.precoCons??7);ganhaCons(P,linha,0)}
      while(P.ouro>=5){
        if(P.hp<P.max*.5&&P.ouro>=5){P.ouro-=5;P.hp=Math.min(P.max,P.hp+(des>=5?6:12));continue}
        if(CFG.botEsperto&&P.ouro>=18&&P.dados.filter(d=>d.type==='d20').length<2){P.ouro-=18;P.dados.push(novoDado('d20'));continue}
        if(P.ouro>=11&&P.dados.filter(d=>d.type==='d10').length<(CFG.botEsperto?3:2)){P.ouro-=11;P.dados.push(novoDado('d10'));continue}
        if(P.ouro>=9&&Math.random()<.3&&!P.dados.every(d=>d.encanto)){P.ouro-=8;const d=P.dados.find(x=>!x.encanto);d.encanto='x';continue}
        if(P.ouro>=10&&Math.random()<.35){P.ouro-=10;P.reliq++;P.danoExtra+=CFG.reliqDano??2;continue}
        P.ouro-=5;melhorar(P,2);
      }
    }else if(no.tipo==='descanso'){if(P.hp<P.max*.7)P.hp=Math.min(P.max,P.hp+Math.round(P.max*.35*(des>=5?.5:1)));else melhorar(P,3)}
    else if(no.tipo==='evento'){const x=Math.random();if(x<.35)P.ouro+=8;else if(x<.6)P.hp=Math.min(P.max,P.hp+8);else if(x<.8)melhorar(P,2);else P.hp-=5;if(P.hp<=0)return{venceu:false,linha:(S.reino||0)*MAPA_LINHAS+linha+1,st,P}}
    const prox=M.lig[atual];
    const pref=t=>{const n=M.nos[t];if(n.tipo==='chefe')return 9;if(P.hp<P.max*.45)return n.tipo==='descanso'?5:n.tipo==='loja'?4:n.tipo==='evento'?3:n.tipo==='luta'?2:0;if(P.ouro>=15&&n.tipo==='loja')return 4;return n.tipo==='elite'&&P.hp>P.max*.75?5:n.tipo==='luta'?3:n.tipo==='evento'?2.5:1};
    atual=prox.slice().sort((a,b)=>pref(b)-pref(a)+(Math.random()-.5)*.8)[0];
  }
}
const N=+(CFG.n||2000);let vit=0;const AB={};const morre={},porTier={};let rodTot=0,lutas=0;
for(let i=0;i<N;i++){const r=partida();for(const k in r.st.ab||{}){const q=AB[k]||(AB[k]={n:0,s:0,a:0,h:0});for(const z in q)q[z]+=r.st.ab[k][z]}if(r.venceu)vit++;else morre[r.linha]=(morre[r.linha]||0)+1;
  r.st.lutas.forEach(l=>{const k=l.tipo==='elite'?'E'+l.tier:l.tipo==='chefe'?'C'+l.tier:'L'+l.tier;const o=porTier[k]||(porTier[k]={n:0,rod:0,perdeu:0});o.n++;o.rod+=l.rod;o.perdeu+=l.perdeu;lutas++;rodTot+=l.rod})}
console.log(`desafio ${CFG.des||0} | vitórias ${(vit/N*100).toFixed(1)}% | rodadas por luta ${(rodTot/lutas).toFixed(2)}`);
console.log('morre no andar:',Object.entries(morre).sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}:${(v/N*100).toFixed(1)}%`).join(' '));
console.log('por inimigo (rodadas, vida perdida):',Object.entries(porTier).sort().map(([k,o])=>`${k} ${(o.rod/o.n).toFixed(1)}r/${(o.perdeu/o.n).toFixed(1)}hp`).join(' | '));

console.log('soma x alvo por inimigo:',Object.entries(AB).sort().map(([k,q])=>`${k} ${(q.s/q.n).toFixed(1)} x ${(q.a/q.n).toFixed(1)} acerta ${(q.h/q.n*100).toFixed(0)}%`).join(' | '));
