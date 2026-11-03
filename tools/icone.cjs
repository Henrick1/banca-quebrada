const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:512,height:512}});
  const svg=fs.readFileSync(path.join(__dirname,'icone.svg'),'utf8');
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await p.locator('svg').screenshot({path:path.join(__dirname,'..','electron','icone.png'),omitBackground:true});
  await b.close();
})();
