const {app,BrowserWindow,ipcMain}=require('electron');
const path=require('path');
const fs=require('fs');
let janela=null;
const avisar=msg=>{if(janela&&!janela.isDestroyed())janela.webContents.send('bq-aviso',msg)};

function verificarAtualizacao(){
  if(!app.isPackaged||process.env.PORTABLE_EXECUTABLE_DIR)return;
  let autoUpdater;
  try{({autoUpdater}=require('electron-updater'))}catch(e){return}
  autoUpdater.autoDownload=true;
  autoUpdater.autoInstallOnAppQuit=true;
  autoUpdater.on('update-available',i=>avisar(`Baixando a versão ${i.version}...`));
  autoUpdater.on('update-downloaded',i=>avisar(`Versão ${i.version} pronta. Ela entra quando você fechar o jogo.`));
  autoUpdater.on('error',()=>{});
  autoUpdater.checkForUpdates().catch(()=>{});
}

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
ipcMain.on('bq-versao',e=>{e.returnValue=app.getVersion()});
ipcMain.on('bq-tela-cheia',(e,v)=>{if(janela)janela.setFullScreen(v===undefined?!janela.isFullScreen():!!v)});
ipcMain.on('bq-e-tela-cheia',e=>{e.returnValue=!!(janela&&janela.isFullScreen())});

function criarJanela(){
  janela=new BrowserWindow({
    width:1440,height:900,minWidth:900,minHeight:600,
    backgroundColor:'#120e0c',autoHideMenuBar:true,title:'Banca Quebrada',icon:path.join(__dirname,'icone.png'),
    webPreferences:{contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}
  });
  janela.loadFile(path.join(__dirname,'..','dist','index.html'));
  janela.webContents.on('before-input-event',(e,inp)=>{if(inp.type==='keyDown'&&inp.key==='F11'){e.preventDefault();janela.setFullScreen(!janela.isFullScreen())}});
  janela.webContents.once('did-finish-load',()=>setTimeout(verificarAtualizacao,3000));
}

app.whenReady().then(()=>{
  criarJanela();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)criarJanela()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
