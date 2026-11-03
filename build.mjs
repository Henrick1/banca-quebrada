import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync,watch} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz=dirname(fileURLToPath(import.meta.url));
const LIBS=[
  ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','node_modules/three/build/three.min.js'],
  ['https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js','node_modules/cannon/build/cannon.min.js']
];
const embutirLibs=html=>LIBS.reduce((h,[url,arq])=>{
  const local=join(raiz,arq);
  if(!existsSync(local))return h;
  return h.replace(`<script src="${url}"></script>`,()=>`<script>${readFileSync(local,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`);
},html);
const ler=pasta=>readdirSync(join(raiz,pasta)).filter(f=>/\.(css|js)$/.test(f)).sort().map(f=>readFileSync(join(raiz,pasta,f),'utf8')).join('');

function build(){
  const modelo=readFileSync(join(raiz,'src/index.html'),'utf8');
  const pagina=modelo.replace('/*__CSS__*/',()=>ler('src/css')).replace('//__JS__',()=>ler('src/js'));
  mkdirSync(join(raiz,'dist'),{recursive:true});
  writeFileSync(join(raiz,'dist/artifact.html'),pagina);
  writeFileSync(join(raiz,'dist/index.html'),`<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>html,body{height:100%;margin:0}</style>\n${embutirLibs(pagina)}\n</html>\n`);
  console.log(`build ok · ${(pagina.length/1024).toFixed(0)} KB · dist/index.html e dist/artifact.html`);
}

build();
if(process.argv.includes('--watch')){
  let t;
  for(const p of ['src','src/css','src/js'])watch(join(raiz,p),()=>{clearTimeout(t);t=setTimeout(()=>{try{build()}catch(e){console.error(e.message)}},80)});
  console.log('observando src/ ...');
}
