import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');
const modulos=['00-nucleo','01-dados','02-estado','15-mapa'].map(m=>readFileSync(join(raiz,'src/js',m+'.js'),'utf8')).join('\n');
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v]=a.replace(/^--/,'').split('=');return[k,v===undefined?1:isNaN(+v)?v:+v]}));
const corpo=readFileSync(join(raiz,'tools/sim-regras.js'),'utf8');
vm.runInNewContext(modulos+'\n'+corpo,{console,ARGS:args,document:{getElementById:()=>null}});
