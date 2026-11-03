const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('bqArquivo',{
  ler:()=>ipcRenderer.sendSync('bq-ler'),
  gravar:d=>ipcRenderer.send('bq-gravar',d),
  pasta:()=>ipcRenderer.sendSync('bq-pasta'),
  versao:()=>ipcRenderer.sendSync('bq-versao'),
  telaCheia:v=>ipcRenderer.send('bq-tela-cheia',v),
  eTelaCheia:()=>ipcRenderer.sendSync('bq-e-tela-cheia'),
  aoAvisar:f=>ipcRenderer.on('bq-aviso',(e,m)=>f(m))
});
