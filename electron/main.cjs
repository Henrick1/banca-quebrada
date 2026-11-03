const {app,BrowserWindow,ipcMain}=require('electron');
const path=require('path');
const fs=require('fs');

const pastaSave=()=>path.join(app.getPath('documents'),'Banca Quebrada');
const arquivoSave=()=>path.join(pastaSave(),'save.json');

ipcMain.on('bq-ler',e=>{
  try{e.returnValue=JSON.parse(fs.readFileSync(arquivoSave(),'utf8'))}
  catch(err){
    try{e.returnValue=JSON.parse(fs.readFileSync(arquivoSave()+'.bak','utf8'))}catch(err2){e.returnValue=null}
  }
});
ipcMain.on('bq-gravar',(e,dados)=>{
  try{
    fs.mkdirSync(pastaSave(),{recursive:true});
    const alvo=arquivoSave(),tmp=alvo+'.tmp';
    fs.writeFileSync(tmp,JSON.stringify(dados,null,1));
    if(fs.existsSync(alvo))fs.copyFileSync(alvo,alvo+'.bak');
    fs.renameSync(tmp,alvo);
  }catch(err){console.error('save',err)}
});
ipcMain.on('bq-pasta',e=>{e.returnValue=pastaSave()});

function criarJanela(){
  const janela=new BrowserWindow({
    width:1440,height:900,minWidth:900,minHeight:600,
    backgroundColor:'#120e0c',autoHideMenuBar:true,title:'Banca Quebrada',
    webPreferences:{contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}
  });
  janela.loadFile(path.join(__dirname,'..','dist','index.html'));
}

app.whenReady().then(()=>{
  criarJanela();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)criarJanela()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
