let renderer,scene,camera,world,mDado,matCache={};
const lancados=[];
const formas={},shapes={};

function forma(tipo){
  if(formas[tipo])return formas[tipo];
  let V=[],F=[],vf=[];
  if(tipo==='d6'){
    const s=.56;
    V=[[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
    F=[[1,2,6,5],[0,4,7,3],[3,7,6,2],[0,1,5,4],[4,5,6,7],[0,3,2,1]];
    vf=[0,2,4,5,3,1];
  }else if(tipo==='d20'){
    const g=new THREE.IcosahedronGeometry(.82,0);const p=g.attributes.position;const idx=[];
    const chave=(x,y,z)=>[x,y,z].map(n=>n.toFixed(4)).join();
    const mapa={};
    for(let i=0;i<p.count;i++){const k=chave(p.getX(i),p.getY(i),p.getZ(i));if(!(k in mapa)){mapa[k]=V.length;V.push([p.getX(i),p.getY(i),p.getZ(i)])}idx.push(mapa[k])}
    for(let i=0;i<idx.length;i+=3)F.push([idx[i],idx[i+1],idx[i+2]]);
    vf=F.map((_,i)=>i);
  }else if(tipo==='d10'){
    const r=.8,h=.82,c=Math.cos(Math.PI/5),a=h*(1-c)/(1+c);
    V=[[0,h,0],[0,-h,0]];
    for(let i=0;i<10;i++){const an=i*Math.PI/5;V.push([r*Math.cos(an),i%2?-a:a,r*Math.sin(an)])}
    const R=i=>2+(i%10);
    for(let i=0;i<5;i++)F.push([0,R(2*i),R(2*i+1),R(2*i+2)]);
    for(let i=0;i<5;i++)F.push([1,R(2*i+1),R(2*i+2),R(2*i+3)]);
    vf=[0,5,1,6,2,7,3,8,4,9];
  }else{
    const n=18,r=.74,t=.08;
    for(let i=0;i<n;i++){const an=i/n*Math.PI*2;V.push([r*Math.cos(an),t,r*Math.sin(an)])}
    for(let i=0;i<n;i++){const an=i/n*Math.PI*2;V.push([r*Math.cos(an),-t,r*Math.sin(an)])}
    F.push([...Array(n).keys()]);F.push([...Array(n).keys()].map(i=>n+i));
    for(let i=0;i<n;i++)F.push([i,(i+1)%n,n+(i+1)%n,n+i]);
    vf=[0,1];
  }
  const vec=v=>new THREE.Vector3(v[0],v[1],v[2]);
  const N=[],C=[];
  F=F.map(f=>{
    const ps=f.map(i=>vec(V[i]));const c=ps.reduce((s,p)=>s.add(p),new THREE.Vector3()).divideScalar(ps.length);
    let nn=new THREE.Vector3().subVectors(ps[1],ps[0]).cross(new THREE.Vector3().subVectors(ps[2],ps[0]));
    if(nn.dot(c)<0){f=[f[0],...f.slice(1).reverse()];nn.negate()}
    N.push(nn.normalize());C.push(c);return f;
  });
  return formas[tipo]={V,F,vf,N,C,tipo};
}
function shapeFisica(tipo){
  const sd=forma(tipo);
  return new CANNON.ConvexPolyhedron(sd.V.map(v=>new CANNON.Vec3(v[0],v[1],v[2])),sd.F.map(f=>f.slice()));
}

function texturaFace(die,k,casa){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const def=DIE[die.type];const corpo=casa?(die.cor||CASA.cor):def.cor,tinta=casa?CASA.tinta:def.tinta;
  x.fillStyle=corpo;x.fillRect(0,0,128,128);
  if(def.metal){x.strokeStyle=tinta;x.globalAlpha=.5;x.lineWidth=4;x.beginPath();x.arc(64,64,52,0,Math.PI*2);x.stroke();x.globalAlpha=1}
  const f=die.faces[k];const n=f.v+f.bonus;const s=String(n);
  const sz=128*def.txt*(f.fx?.86:1);
  x.font=`800 ${sz}px "Alegreya Sans",sans-serif`;x.textAlign='left';x.textBaseline='alphabetic';
  const m=x.measureText(s);
  const asc=m.actualBoundingBoxAscent,desc=m.actualBoundingBoxDescent,esq=m.actualBoundingBoxLeft,dir=m.actualBoundingBoxRight;
  const sublinha=(n===6||n===9)&&die.type!=='d6'&&die.type!=='coin';
  const hNum=asc+desc+(sublinha?sz*.15:0);
  const is=f.fx?sz*.52:0,vao=f.fx?sz*.1:0;
  const topo=64-(hNum+vao+is)/2,base=topo+asc;
  x.fillStyle=f.bonus&&!casa?def.up:tinta;
  x.fillText(s,64-(dir-esq)/2,base);
  if(sublinha)x.fillRect(64-sz*.22,base+desc+sz*.06,sz*.44,sz*.07);
  if(f.fx){
    const iy=topo+hNum+vao+is/2;
    if(f.fx.k==='dobro'){
      x.fillStyle=FX.dobro.cor;x.font=`800 ${is}px "Alegreya Sans",sans-serif`;
      const m2=x.measureText('×2');
      x.fillText('×2',64-(m2.actualBoundingBoxRight-m2.actualBoundingBoxLeft)/2,iy+(m2.actualBoundingBoxAscent-m2.actualBoundingBoxDescent)/2);
    }else{x.save();x.translate(64-is/2,iy-is/2);x.scale(is/24,is/24);x.fillStyle=FX[f.fx.k].cor;x.strokeStyle='#0009';x.lineWidth=1.5;const p=new Path2D(PATHS[f.fx.k]);x.stroke(p);x.fill(p,'evenodd');x.restore()}
  }
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;
}

function criarMalha(die,casa){
  const sd=forma(die.type);const def=DIE[die.type];
  const base={roughness:def.metal?.35:.42,metalness:def.metal&&!casa?.55:0};
  const mats=[new THREE.MeshStandardMaterial({color:lin(casa?(die.cor||CASA.cor):def.cor),...base})];
  const matDe={};
  sd.vf.forEach((fi,k)=>{matDe[fi]=mats.length;mats.push(new THREE.MeshStandardMaterial({map:texturaFace(die,k,casa),...base}))});
  const pos=[],nor=[],uv=[];const geo=new THREE.BufferGeometry();let ini=0;
  sd.F.forEach((f,fi)=>{
    const ps=f.map(i=>new THREE.Vector3(...sd.V[i]));const c=sd.C[fi],n=sd.N[fi];
    let u,w;
    if(die.type==='d10'){w=new THREE.Vector3().subVectors(ps[0],c);w.sub(n.clone().multiplyScalar(w.dot(n))).normalize();u=new THREE.Vector3().crossVectors(w,n)}
    else{u=new THREE.Vector3().subVectors(ps[1],ps[0]).normalize();w=new THREE.Vector3().crossVectors(n,u)}
    let ext=0;ps.forEach(p=>{const d=p.clone().sub(c);ext=Math.max(ext,Math.abs(d.dot(u)),Math.abs(d.dot(w)))});
    const uvDe=p=>{const d=p.clone().sub(c);return[.5+d.dot(u)/(2*ext),.5+d.dot(w)/(2*ext)]};
    let cnt=0;
    for(let i=1;i<ps.length-1;i++){
      for(const p of[ps[0],ps[i],ps[i+1]]){pos.push(p.x,p.y,p.z);nor.push(n.x,n.y,n.z);uv.push(...uvDe(p));cnt++}
    }
    geo.addGroup(ini,cnt,fi in matDe?matDe[fi]:0);ini+=cnt;
  });
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const m=new THREE.Mesh(geo,mats);m.castShadow=true;m.receiveShadow=true;
  if(die.encanto&&!casa)bordasDado(die,m);
  return m;
}

function texturaFeltro(cor='#1e4a46'){
  const c=document.createElement('canvas');c.width=1200;c.height=720;const x=c.getContext('2d');
  x.fillStyle=cor;x.fillRect(0,0,1200,720);
  const img=x.getImageData(0,0,1200,720);const d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*18;d[i]+=n;d[i+1]+=n;d[i+2]+=n}
  x.putImageData(img,0,0);
  const g=x.createRadialGradient(600,360,80,600,360,720);g.addColorStop(0,'rgba(255,240,200,.07)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(0,0,1200,720);
  x.strokeStyle='rgba(222,186,110,.32)';x.lineWidth=3;
  x.strokeRect(40,40,1120,640);
  x.beginPath();x.arc(600,360,120,0,Math.PI*2);x.stroke();
  x.setLineDash([10,10]);
  x.beginPath();x.moveTo(170,70);x.lineTo(170,650);x.stroke();
  x.beginPath();x.moveTo(1030,70);x.lineTo(1030,650);x.stroke();
  x.setLineDash([]);
  x.fillStyle='rgba(222,186,110,.42)';x.textAlign='center';x.textBaseline='middle';
  x.font='44px "Pirata One",serif';x.fillText('A Casa Paga',600,360);
  x.font='700 18px "Alegreya Sans",sans-serif';
  x.save();x.translate(110,360);x.rotate(-Math.PI/2);x.fillText('SEUS LANCES',0,0);x.restore();
  x.save();x.translate(1090,360);x.rotate(Math.PI/2);x.fillText('LANCE DA CASA',0,0);x.restore();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}

function lin(h){return new THREE.Color(h).convertSRGBToLinear()}
function texturaMadeira(rx,ry,res=1024){
  const c=document.createElement('canvas'),b=document.createElement('canvas');c.width=c.height=b.width=b.height=res;
  const x=c.getContext('2d'),y=b.getContext('2d'),s=res/1024;
  const n=6,h=res/n,tons=[[86,52,31],[96,59,34],[78,45,26],[90,56,30],[82,49,28]];
  y.fillStyle='#808080';y.fillRect(0,0,res,res);
  for(let p=0;p<n;p++){
    const y0=p*h,[r,g,bl]=pick(tons),tom=(k)=>`rgb(${r*k|0},${g*k|0},${bl*k|0})`;
    const gr=x.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,tom(.78));gr.addColorStop(.15,tom(.95));gr.addColorStop(.5,tom(1.05));gr.addColorStop(.85,tom(.95));gr.addColorStop(1,tom(.75));
    x.fillStyle=gr;x.fillRect(0,y0,res,h);
    const lav=x.createLinearGradient(0,0,res,0);
    for(let i=0;i<=6;i++)lav.addColorStop(i/6,`rgba(${Math.random()<.5?'255,220,180':'20,10,4'},${(Math.random()*.07).toFixed(3)})`);
    x.fillStyle=lav;x.fillRect(0,y0,res,h);
    const nos=Array.from({length:Math.random()<.65?1+Math.floor(Math.random()*2):0},()=>({kx:Math.random()*res,ky:y0+h*(.25+Math.random()*.5),r:(10+Math.random()*12)*s}));
    const f1=(.002+Math.random()*.003)/s,f2=(.009+Math.random()*.008)/s,ph=Math.random()*6,ph2=Math.random()*6,A=(5+Math.random()*9)*s;
    const desvio=(X,Y)=>{
      let o=A*Math.sin(X*f1+ph)+A*.25*Math.sin(X*f2+ph2);
      for(const k of nos){const dx=X-k.kx,dy=Y-k.ky;o+=Math.sign(dy||1)*k.r*1.8*Math.exp(-(dx*dx)/(k.r*k.r*10))*Math.exp(-(dy*dy)/(k.r*k.r*8))}
      return o;
    };
    for(let Y=y0+3*s;Y<y0+h-2*s;Y+=(1.4+Math.random()*3.2)*s){
      const escura=Math.random()<.68,al=escura?.07+Math.random()*.2:.03+Math.random()*.07,lw=(.5+Math.random()*1.8)*s;
      x.strokeStyle=escura?`rgba(28,13,5,${al})`:`rgba(255,214,168,${al})`;x.lineWidth=lw;
      y.strokeStyle=escura?`rgba(0,0,0,${Math.min(1,al*2.2)})`:`rgba(255,255,255,${al*1.5})`;y.lineWidth=lw*1.2;
      x.beginPath();y.beginPath();
      for(let X=0;X<=res;X+=6*s){const yy=Math.max(y0+2*s,Math.min(y0+h-2*s,Y+desvio(X,Y)));if(X){x.lineTo(X,yy);y.lineTo(X,yy)}else{x.moveTo(X,yy);y.moveTo(X,yy)}}
      x.stroke();y.stroke();
    }
    for(let i=0,tot=Math.floor(1400*s);i<tot;i++){
      const px=Math.random()*res,py=y0+3*s+Math.random()*(h-6*s),L=(2+Math.random()*8)*s,yy=py+desvio(px,py)*.15;
      x.fillStyle=`rgba(22,10,4,${.15+Math.random()*.25})`;x.fillRect(px,yy,L,.9*s);
      y.fillStyle='rgba(0,0,0,.45)';y.fillRect(px,yy,L,.9*s);
    }
    for(const k of nos){
      for(let i=7;i>0;i--){x.strokeStyle=`rgba(32,15,6,${.1+i*.06})`;x.lineWidth=1.6*s;x.beginPath();x.ellipse(k.kx,k.ky,k.r*i/7*1.7,k.r*i/7*.75,0,0,Math.PI*2);x.stroke()}
      const gk=x.createRadialGradient(k.kx,k.ky,0,k.kx,k.ky,k.r);gk.addColorStop(0,'rgba(18,8,3,.95)');gk.addColorStop(1,'rgba(18,8,3,0)');
      x.fillStyle=gk;x.beginPath();x.ellipse(k.kx,k.ky,k.r*1.1,k.r*.55,0,0,Math.PI*2);x.fill();
      const gb=y.createRadialGradient(k.kx,k.ky,0,k.kx,k.ky,k.r);gb.addColorStop(0,'rgba(0,0,0,.6)');gb.addColorStop(1,'rgba(0,0,0,0)');
      y.fillStyle=gb;y.beginPath();y.ellipse(k.kx,k.ky,k.r*1.1,k.r*.55,0,0,Math.PI*2);y.fill();
    }
    x.fillStyle='rgba(8,4,2,.92)';x.fillRect(0,y0,res,3*s);
    y.fillStyle='#000';y.fillRect(0,y0,res,5*s);
    const bev=y.createLinearGradient(0,y0,0,y0+10*s);bev.addColorStop(0,'rgba(0,0,0,.6)');bev.addColorStop(1,'rgba(0,0,0,0)');y.fillStyle=bev;y.fillRect(0,y0+5*s,res,10*s);
    const jx=Math.random()*res;x.fillStyle='rgba(8,4,2,.92)';x.fillRect(jx,y0,3*s,h);y.fillStyle='#000';y.fillRect(jx,y0,5*s,h);
  }
  const mk=cv=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;return t};
  const t=mk(c);t.encoding=THREE.sRGBEncoding;t.relevo=mk(b);return t;
}
function matMadeira(rx,ry,cor,{rough=.5,res=1024,rot=0,verniz=0,relevo=.035}={}){
  const t=texturaMadeira(rx,ry,res),bm=t.relevo;
  if(rot)[t,bm].forEach(q=>{q.center.set(.5,.5);q.rotation=rot});
  return new THREE.MeshStandardMaterial({map:t,bumpMap:bm,bumpScale:relevo,color:lin(cor),roughness:Math.max(.2,rough-verniz*.3)});
}
function criarAderecos(latao){
  const y=-.51;
  const cera=new THREE.MeshStandardMaterial({color:lin('#e9dcc0'),roughness:.6});
  const vx=-TW/2-2,vz=-TD/2-1.2;
  const prato=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,.1,32),latao);prato.position.set(vx,y+.05,vz);prato.castShadow=prato.receiveShadow=true;scene.add(prato);
  const corpo=new THREE.Mesh(new THREE.CylinderGeometry(.26,.28,1.5,24),cera);corpo.position.set(vx,y+.85,vz);corpo.castShadow=true;scene.add(corpo);
  const chama=new THREE.Sprite(new THREE.SpriteMaterial({map:brilho(),color:'#ffb347',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  chama.position.set(vx,y+1.85,vz);chama.scale.set(.42,.7,1);scene.add(chama);
  const luz=new THREE.PointLight('#ff9a3c',1.2,16,1.6);luz.position.set(vx,y+2.2,vz);scene.add(luz);
  MESA.vela={chama,luz};
  const moeda=new THREE.MeshStandardMaterial({color:lin('#d9a83e'),metalness:.8,roughness:.3});
  const geo=new THREE.CylinderGeometry(.32,.32,.07,28);
  const mx=TW/2+2.1,mz=-TD/2-.9;
  for(let i=0;i<6;i++){const m=new THREE.Mesh(geo,moeda);m.position.set(mx+rnd(.03),y+.035+i*.072,mz+rnd(.03));m.rotation.y=Math.random()*6;m.castShadow=m.receiveShadow=true;scene.add(m)}
  for(let i=0;i<3;i++){const m=new THREE.Mesh(geo,moeda);m.position.set(mx-.9+rnd(.6),y+.035,mz+1+rnd(.8));m.rotation.set(rnd(.08),Math.random()*6,rnd(.08));m.castShadow=m.receiveShadow=true;scene.add(m)}
}
