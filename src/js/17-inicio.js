function mostrarErro(msg){const e=$('erro');e.textContent=`Algo quebrou na mesa: ${msg}`;e.hidden=false}
window.addEventListener('error',e=>mostrarErro(e.message||'erro desconhecido'));
window.addEventListener('unhandledrejection',e=>mostrarErro(String(e.reason&&e.reason.message||e.reason)));
Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(()=>{
  telaInicial();
  try{iniciar3D();$('cena').addEventListener('webglcontextlost',()=>mostrarErro('o navegador perdeu o contexto 3D. Recarregue a página.'))}
  catch(e){mostrarErro(e.message);console.error(e)}
});
