import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
export async function loadCatalogue(){
 const content=await readFile(new URL('../public/content.js',import.meta.url),'utf8');
 const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
 const prefix=app.slice(0,app.indexOf('const state='));
 return JSON.parse(JSON.stringify(vm.runInNewContext(content+'\n'+prefix+'\ntranslations.en',{window:{}},{timeout:1000})));
}
