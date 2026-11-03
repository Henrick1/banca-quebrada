const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('bqArquivo',{
  ler:()=>ipcRenderer.sendSync('bq-ler'),
  gravar:d=>ipcRenderer.send('bq-gravar',d),
  pasta:()=>ipcRenderer.sendSync('bq-pasta')
});
