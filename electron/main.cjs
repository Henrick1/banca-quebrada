const {app,BrowserWindow}=require('electron');
const path=require('path');

function criarJanela(){
  const janela=new BrowserWindow({
    width:1440,height:900,minWidth:900,minHeight:600,
    backgroundColor:'#120e0c',autoHideMenuBar:true,title:'Banca Quebrada',
    webPreferences:{contextIsolation:true,sandbox:true}
  });
  janela.loadFile(path.join(__dirname,'..','dist','index.html'));
}

app.whenReady().then(()=>{
  criarJanela();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)criarJanela()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
