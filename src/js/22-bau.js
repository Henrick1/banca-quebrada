function modeloBau(){
  const g=new THREE.Group();
  const mad=new THREE.MeshStandardMaterial({color:lin('#6a3f1f'),roughness:.7});
  const madE=new THREE.MeshStandardMaterial({color:lin('#4a2a14'),roughness:.75});
  const ouro=new THREE.MeshStandardMaterial({color:lin('#d4a94f'),metalness:.85,roughness:.28,emissive:new THREE.Color('#3a2400'),emissiveIntensity:.4});
  const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
  add(new THREE.BoxGeometry(1,.5,.66),mad,0,.25,0);
  add(new THREE.CylinderGeometry(.33,.33,1,20,1,false,0,Math.PI),madE,0,.5,0,0,0,Math.PI/2);
  [-.36,.36].forEach(x=>{add(new THREE.BoxGeometry(.08,.52,.69),ouro,x,.26,0);add(new THREE.CylinderGeometry(.345,.345,.08,20,1,false,0,Math.PI),ouro,x,.5,0,0,0,Math.PI/2)});
  add(new THREE.BoxGeometry(1.02,.06,.68),ouro,0,.5,0);
  add(new THREE.BoxGeometry(.18,.22,.06),ouro,0,.45,.34);
  add(new THREE.TorusGeometry(.05,.016,6,14),madE,0,.42,.375);
  g.rotation.y=-.35;g.scale.setScalar(1.05);
  return g;
}
function premiosBau(){
  const cats=[];
  const reliq=Object.keys(ITENS).filter(k=>!temItem(k)).map(k=>({kind:'item',chave:k}));
  if(reliq.length)cats.push('item');
  if((S.cons||[]).length<consMax())cats.push('cons');
  if(S.dados.length<bolsaMax())cats.push('dado');
  cats.push('ouro');
  const ordem=embaralhar(cats),out=[];
  for(let i=0;i<3;i++){
    const c=ordem[i%ordem.length];
    let o;
    if(c==='item'){const ja=out.filter(x=>x.kind==='item').map(x=>x.chave);o=sortear(reliq.filter(x=>!ja.includes(x.chave)),1,.5)[0]}
    else if(c==='cons'){const ja=out.filter(x=>x.kind==='cons').map(x=>x.chave);o=sortear(Object.keys(CONSUMIVEIS).filter(k=>!ja.includes(k)).map(k=>({kind:'cons',chave:k})),1,.5)[0]}
    else if(c==='dado'){const ja=out.filter(x=>x.kind==='dado').map(x=>x.tipo);o=sortear(['d6','d10','d20','coin'].filter(t=>!ja.includes(t)).map(t=>({kind:'dado',tipo:t})),1,.5)[0]}
    else o={kind:'ouroBau',n:13+Math.floor(R()*4)*3};
    if(o)out.push(o);
  }
  return out;
}
function cartaBau(o){
  let ic,tit,desc,tipo;
  if(o.kind==='item'){const it=ITENS[o.chave];ic=svgPath(ITEM_ICONE[o.chave]||o.chave,it.cor);tit=it.nome;desc=it.desc;tipo='Relíquia'}
  else if(o.kind==='cons'){const c=CONSUMIVEIS[o.chave];ic=svgPath(o.chave,c.cor);tit=c.nome;desc=c.desc;tipo='Consumível'}
  else if(o.kind==='dado'){ic=svgTipo(o.tipo);tit=DIE[o.tipo].nome;desc=`Entra na sua bolsa. Média ${mediaDado(novoDado(o.tipo))}.`;tipo='Dado novo'}
  else{ic=`<svg viewBox="0 0 24 24"><path fill="#e3b64a" fill-rule="evenodd" d="${PATHS.ouro}"/></svg>`;tit=`${o.n} de ouro`;desc='Direto para o seu bolso.';tipo='Ouro'}
  const r=raridadeOferta(o)||'comum',rc=RARIDADE[r];
  return`<button class="bau-carta r-${r}" style="--rc:${rc.cor}"><span class="bc-rar">${rc.nome} · ${tipo}</span><span class="bc-ic">${ic}</span><b>${tit}</b><span class="bc-desc">${desc}</span></button>`;
}
function abrirBau(){
  const premios=premiosBau(),el=document.createElement('div');el.className='bau-tela';
  el.innerHTML=`<div class="bau-luz"></div><div class="bau-raios"></div>
    <div class="bau-css"><div class="bau-tampa"><i></i></div><div class="bau-corpo"><i></i><span class="bau-fecho"></span></div></div>
    <p class="bau-dica">Abrindo o baú...</p>
    <div class="bau-cartas">${premios.map(cartaBau).join('')}</div>`;
  document.body.appendChild(el);
  SOM.tensao();
  const passos=reduzir?[0,0,0]:[0,350,700];
  passos.forEach((t,i)=>setTimeout(()=>{el.classList.remove('treme');void el.offsetWidth;el.classList.add('treme');SOM.batida(8+i*2,true)},t));
  setTimeout(()=>{el.classList.add('aberto');SOM.combo();setTimeout(()=>SOM.vitoria(),120);$('vinheta')&&vinheta('#f2c661');el.querySelector('.bau-dica').textContent='Escolha um prêmio'},reduzir?100:1150);
  let feito=false;
  el.querySelectorAll('.bau-carta').forEach((b,i)=>b.addEventListener('click',()=>{
    if(feito||!el.classList.contains('aberto'))return;feito=true;
    const o=premios[i];
    if(o.kind==='item'){ganharItem(o.chave);SOM.item()}
    else if(o.kind==='cons'){S.cons.push(o.chave);SOM.batida(8,true)}
    else if(o.kind==='dado'){const d=novoDado(o.tipo);S.dados.push(d);if(S.loja)S.loja.flash={die:d.id};SOM.batida(7,DIE[o.tipo].metal)}
    else{S.ouro+=o.n;SOM.ouro(4)}
    b.classList.add('escolhida');el.classList.add('fim');
    setTimeout(()=>{el.classList.add('sai');setTimeout(()=>el.remove(),reduzir?0:400);hud();if(S.loja)renderLoja();salvarPartida()},reduzir?200:1000);
  }));
}
