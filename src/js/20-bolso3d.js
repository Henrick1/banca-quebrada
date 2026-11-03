const BOL={r:null,itens:[],assin:'',hover:-1,t:0,ray:null,cols:3};
function matsBolso(){
  if(BOL.m)return BOL.m;
  BOL.m={
    ferro:new THREE.MeshStandardMaterial({color:lin('#aab2bb'),metalness:.85,roughness:.32}),
    ferroEsc:new THREE.MeshStandardMaterial({color:lin('#5d646c'),metalness:.8,roughness:.45}),
    madeira:matMadeira(.4,.2,'#a0703f',{rough:.6,res:256,relevo:.01}),
    madeiraEsc:new THREE.MeshStandardMaterial({color:lin('#3d2617'),roughness:.55}),
    rolha:new THREE.MeshStandardMaterial({color:lin('#b88a5a'),roughness:.9}),
    vidro:new THREE.MeshStandardMaterial({color:lin('#d8efe6'),metalness:.1,roughness:.08,transparent:true,opacity:.32,depthWrite:false}),
    verde:new THREE.MeshStandardMaterial({color:lin('#4fbf6a'),emissive:lin('#1d5a2a'),emissiveIntensity:.6,roughness:.25}),
    veneno:new THREE.MeshStandardMaterial({color:lin('#b4d93c'),emissive:lin('#4a6a10'),emissiveIntensity:.7,roughness:.25}),
    couro:new THREE.MeshStandardMaterial({color:lin('#7a4a28'),roughness:.85}),
    costura:new THREE.MeshStandardMaterial({color:lin('#e2c98e'),roughness:.8}),
    chumbo:new THREE.MeshStandardMaterial({color:lin('#6f767e'),metalness:.6,roughness:.5}),
    latao:new THREE.MeshStandardMaterial({color:lin('#c99a3f'),metalness:.85,roughness:.3})
  };
  return BOL.m;
}
function modeloCons(k){
  const M=matsBolso(),g=new THREE.Group(),add=(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;g.add(m);return m};
  const H=Math.PI/2;
  if(k==='martelo'){
    add(new THREE.CylinderGeometry(.055,.07,1.05,12),M.madeira,-.08,.07,0,0,0,H);
    add(new THREE.BoxGeometry(.24,.22,.56),M.ferro,.46,.11,0);
    add(new THREE.CylinderGeometry(.12,.12,.08,16),M.ferroEsc,.46,.11,.3,H,0,0);
    add(new THREE.BoxGeometry(.2,.18,.18),M.ferroEsc,.46,.1,-.33,0,0,0);
    g.rotation.y=.5;
  }else if(k==='tonico'){
    add(new THREE.CylinderGeometry(.2,.2,.52,24),M.vidro,-.1,.2,0,0,0,H);
    add(new THREE.CylinderGeometry(.17,.17,.46,24),M.verde,-.1,.2,0,0,0,H);
    add(new THREE.SphereGeometry(.2,24,12,0,Math.PI*2,0,H),M.vidro,.16,.2,0,0,0,-H);
    add(new THREE.CylinderGeometry(.075,.085,.2,16),M.vidro,.42,.2,0,0,0,H);
    add(new THREE.CylinderGeometry(.08,.07,.13,16),M.rolha,.56,.2,0,0,0,H);
    g.rotation.y=-.45;
  }else if(k==='faca'){
    const s=new THREE.Shape();s.moveTo(0,-.07);s.lineTo(.62,-.02);s.quadraticCurveTo(.7,0,.62,.04);s.lineTo(0,.07);s.lineTo(0,-.07);
    add(new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelThickness:.008,bevelSize:.012,bevelSegments:1}),M.ferro,-.05,.04,0,-H,0,0);
    add(new THREE.BoxGeometry(.05,.05,.28),M.latao,-.07,.045,0);
    add(new THREE.CylinderGeometry(.055,.065,.42,12),M.madeiraEsc,-.3,.06,0,0,0,H);
    add(new THREE.SphereGeometry(.07,12,8),M.latao,-.52,.06,0);
    g.rotation.y=.6;
  }else if(k==='frasco'){
    add(new THREE.SphereGeometry(.28,24,16),M.vidro,-.06,.28,0);
    add(new THREE.SphereGeometry(.24,24,16),M.veneno,-.06,.28,0);
    add(new THREE.CylinderGeometry(.07,.09,.24,16),M.vidro,.27,.28,0,0,0,H);
    add(new THREE.CylinderGeometry(.075,.065,.12,16),M.rolha,.43,.28,0,0,0,H);
    g.rotation.y=-.3;g.scale.setScalar(.92);
  }else if(k==='peso'){
    add(new THREE.CylinderGeometry(.22,.32,.36,8),M.chumbo,0,.18,0);
    add(new THREE.CylinderGeometry(.24,.24,.04,8),M.ferroEsc,0,.37,0);
    add(new THREE.TorusGeometry(.12,.035,8,20),M.ferroEsc,0,.47,0);
    g.rotation.y=.3;
  }else if(k==='maoLeve'){
    const perfil=[[0,0],[.16,.01],[.26,.06],[.31,.15],[.3,.26],[.24,.35],[.14,.42],[.1,.45],[.12,.49],[.18,.54],[.21,.57],[.2,.58]].map(([x,y])=>new THREE.Vector2(x,y));
    const geo=new THREE.LatheGeometry(perfil,40),pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),a=Math.atan2(z,x);let f=1+.05*Math.sin(a*5);if(y>.46)f*=1+.22*Math.sin(a*9)*Math.min(1,(y-.46)/.08);pa.setXYZ(i,x*f,y,z*f*.86)}
    geo.computeVertexNormals();
    const fig=new THREE.Group();
    const sm=(geo2,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo2,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;fig.add(m);return m};
    sm(geo,new THREE.MeshStandardMaterial({color:lin('#8a5a30'),roughness:.88,side:THREE.DoubleSide}));
    sm(new THREE.TorusGeometry(.11,.022,8,24),M.costura,0,.45,0,H,0,0);
    sm(new THREE.CylinderGeometry(.014,.014,.26,6),M.costura,.15,.34,.08,.2,0,-.35);
    sm(new THREE.CylinderGeometry(.014,.014,.22,6),M.costura,.09,.33,.15,.5,0,-.15);
    sm(new THREE.SphereGeometry(.032,8,6),M.latao,.2,.22,.1);
    sm(new THREE.SphereGeometry(.032,8,6),M.latao,.12,.23,.24);
    const osso=new THREE.MeshStandardMaterial({color:lin('#efe6cf'),roughness:.45});
    sm(new THREE.BoxGeometry(.12,.12,.12),osso,-.03,.55,.01,.4,.6,.2);
    sm(new THREE.BoxGeometry(.1,.1,.1),M.latao,.06,.53,-.04,.2,1.1,.5);
    fig.rotation.x=-.45;fig.position.set(.03,.02,.12);g.add(fig);
    g.rotation.y=-.3;g.scale.setScalar(1.05);
  }
  return g;
}
function texturaBolso(n,cols){
  const linhas=Math.ceil(n/cols),c=document.createElement('canvas');c.width=cols*170;c.height=linhas*150;const x=c.getContext('2d');
  x.fillStyle='#3b2416';x.fillRect(0,0,c.width,c.height);
  const img=x.getImageData(0,0,c.width,c.height),d=img.data;
  for(let i=0;i<d.length;i+=4){const q=(Math.random()-.5)*18;d[i]+=q;d[i+1]+=q*.8;d[i+2]+=q*.6}
  x.putImageData(img,0,0);
  x.strokeStyle='rgba(212,169,79,.32)';x.setLineDash([6,7]);x.lineWidth=3;x.strokeRect(8,8,c.width-16,c.height-16);
  for(let i=0;i<n;i++){const cx=(i%cols+.5)*170,cy=(Math.floor(i/cols)+.5)*150;x.strokeStyle='rgba(212,169,79,.18)';x.beginPath();x.arc(cx,cy,56,0,Math.PI*2);x.stroke()}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
}
function iniciarBolso(){
  if(BOL.r||!$('consCena'))return;
  const cv=$('consCena');
  BOL.r=new THREE.WebGLRenderer({canvas:cv,antialias:true});BOL.r.setPixelRatio(pxQualidade());
  BOL.r.shadowMap.enabled=qualidade().sombra;BOL.r.shadowMap.type=THREE.PCFSoftShadowMap;BOL.r.outputEncoding=THREE.sRGBEncoding;BOL.r.toneMapping=THREE.ACESFilmicToneMapping;
  BOL.sc=new THREE.Scene();BOL.sc.background=new THREE.Color('#1a110a');
  BOL.cam=new THREE.PerspectiveCamera(26,3,.1,50);
  BOL.sc.add(new THREE.HemisphereLight('#f6e7c9','#1a110b',.75));
  const l=new THREE.DirectionalLight('#ffe1ae',1.35);l.position.set(-2.5,7,3.5);l.castShadow=true;l.shadow.mapSize.set(1024,1024);
  Object.assign(l.shadow.camera,{left:-5,right:5,top:4,bottom:-4,near:.5,far:20});l.shadow.bias=-.0008;BOL.sc.add(l);
  BOL.fundo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({roughness:.92}));BOL.fundo.rotation.x=-Math.PI/2;BOL.fundo.receiveShadow=true;BOL.sc.add(BOL.fundo);
  BOL.ray=new THREE.Raycaster();
  const alvoDe=e=>{
    const rc=cv.getBoundingClientRect();BOL.ray.setFromCamera(new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1),BOL.cam);
    const h=BOL.ray.intersectObjects(BOL.itens.map(it=>it.toque),false)[0];return h?h.object.userData.i:-1;
  };
  cv.addEventListener('pointermove',e=>{const i=alvoDe(e);if(i!==BOL.hover){BOL.hover=i;cv.style.cursor=i>=0?'pointer':'default';dicaBolso()}});
  cv.addEventListener('pointerleave',()=>{BOL.hover=-1;dicaBolso()});
  cv.addEventListener('click',e=>{const i=alvoDe(e);if(i>=0){const it=BOL.itens[i];if(it)it.pulo=1;usarCons(i)}});
  new ResizeObserver(ajustarBolso).observe($('cons'));
}
function ajustarBolso(){
  if(!BOL.r)return;const cv=$('consCena'),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  BOL.r.setPixelRatio(pxQualidade());BOL.r.setSize(w,h,false);BOL.cam.aspect=w/h;
  const lw=BOL.cols*1.5,ld=Math.ceil(BOL.n/BOL.cols)*1.32,t=Math.tan(THREE.MathUtils.degToRad(BOL.cam.fov/2)),el=1.22;
  const d=Math.max(lw/2/(t*BOL.cam.aspect),ld/2/t*.8)*1.1;
  BOL.cam.position.set(0,d*Math.sin(el),d*Math.cos(el));BOL.cam.lookAt(0,0,0);BOL.cam.updateProjectionMatrix();
}
function sincronizarBolso(){
  iniciarBolso();if(!BOL.r)return;
  const l=S.cons||[],n=consMax(),cols=Math.min(3,n),assin=n+'|'+l.join(',');
  if(assin===BOL.assin)return;
  const mudouN=n!==BOL.n;BOL.assin=assin;BOL.n=n;BOL.cols=cols;
  const linhas=Math.ceil(n/cols);
  $('consCena').style.height=(linhas*66)+'px';
  if(mudouN){if(BOL.fundo.material.map)BOL.fundo.material.map.dispose();BOL.fundo.material.map=texturaBolso(n,cols);BOL.fundo.material.needsUpdate=true;BOL.fundo.scale.set(cols*1.5,linhas*1.32,1)}
  const antigos=new Map(BOL.itens.map(it=>[it.chave+'#'+it.ord,it]));
  const cont={},novos=[];
  l.forEach((k,i)=>{
    cont[k]=(cont[k]||0)+1;const id=k+'#'+cont[k];
    const x=((i%cols)-(cols-1)/2)*1.5,z=(Math.floor(i/cols)-(linhas-1)/2)*1.32;
    let it=antigos.get(id);
    if(it)antigos.delete(id);
    else{const g=modeloCons(k);g.scale.multiplyScalar(1.1);g.position.set(x,0,z);BOL.sc.add(g);const toque=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.9,16),new THREE.MeshBasicMaterial({visible:false}));toque.position.y=.3;g.add(toque);it={chave:k,ord:cont[k],g,toque,y:1.2,pulo:0,ry0:g.rotation.y}}
    it.i=i;it.toque.userData.i=i;it.x=x;it.z=z;
    novos.push(it);
  });
  for(const it of antigos.values()){
    faiscasBolso(it.g.position);BOL.sc.remove(it.g);it.g.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose()});
  }
  BOL.itens=novos;BOL.hover=-1;dicaBolso();
  ajustarBolso();
}
function faiscasBolso(){SOM.batida(5,true)}
function dicaBolso(){
  const el=$('consDica');if(!el)return;
  const it=BOL.itens[BOL.hover];
  if(!it){el.classList.remove('on');return}
  const k=it.chave,c=CONSUMIVEIS[k],tr=travaCons(k),desc=c.desc;
  el.style.setProperty('--c',c.cor);
  el.innerHTML=`<b>${c.nome}</b>${desc}${tr?`<em>${tr}</em>`:k==='martelo'?`<em class="ok">${MIRA.i===BOL.hover?'Clique de novo para guardar':'Clique e escolha o dado da casa'}</em>`:'<em class="ok">Clique para usar</em>'}`;
  el.classList.add('on');
}
function passoBolso(dt){
  passoMira();
  if(!BOL.r||$('cons').hidden)return;
  BOL.t+=dt;
  BOL.itens.forEach((it,i)=>{
    const g=it.g,hov=i===BOL.hover||i===MIRA.i,tr=!!travaCons(it.chave);
    g.position.x+=(it.x-g.position.x)*Math.min(1,dt*10);g.position.z+=(it.z-g.position.z)*Math.min(1,dt*10);
    if(it.y>0){it.vy=(it.vy||0)-28*dt;it.y=Math.max(0,it.y+it.vy*dt);if(it.y===0){if(Math.abs(it.vy)>2.5){SOM.batida(Math.abs(it.vy)*.4,it.chave==='martelo'||it.chave==='peso',.4);it.vy*=-.3;it.y=.001}else it.vy=0}}
    it.pulo=Math.max(0,it.pulo-dt*4);
    const alvoH=hov&&!tr?.22:0;it.h=(it.h||0)+(alvoH-(it.h||0))*Math.min(1,dt*12);
    g.position.y=it.y+it.h+Math.sin(it.pulo*Math.PI)*.25;
    g.rotation.y=it.ry0+(hov?Math.sin(BOL.t*2.2)*.12:0);
    g.rotation.z=hov&&!tr?Math.sin(BOL.t*3)*.04:0;
  });
  BOL.r.render(BOL.sc,BOL.cam);
}
