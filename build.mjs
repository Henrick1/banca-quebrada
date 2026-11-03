import {readFileSync,writeFileSync,readdirSync,mkdirSync,watch} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz=dirname(fileURLToPath(import.meta.url));
const ler=pasta=>readdirSync(join(raiz,pasta)).filter(f=>/\.(css|js)$/.test(f)).sort().map(f=>readFileSync(join(raiz,pasta,f),'utf8')).join('');

function build(){
  const modelo=readFileSync(join(raiz,'src/index.html'),'utf8');
  const pagina=modelo.replace('/*__CSS__*/',()=>ler('src/css')).replace('//__JS__',()=>ler('src/js'));
  mkdirSync(join(raiz,'dist'),{recursive:true});
  writeFileSync(join(raiz,'dist/artifact.html'),pagina);
  writeFileSync(join(raiz,'dist/index.html'),`<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>html,body{height:100%;margin:0}</style>\n${pagina}\n</html>\n`);
  console.log(`build ok · ${(pagina.length/1024).toFixed(0)} KB · dist/index.html e dist/artifact.html`);
}

build();
if(process.argv.includes('--watch')){
  let t;
  for(const p of ['src','src/css','src/js'])watch(join(raiz,p),()=>{clearTimeout(t);t=setTimeout(()=>{try{build()}catch(e){console.error(e.message)}},80)});
  console.log('observando src/ ...');
}
