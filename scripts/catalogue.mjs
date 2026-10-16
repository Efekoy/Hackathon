import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
export async function loadCatalogue(){
 const content=await readFile(new URL('../public/content.js',import.meta.url),'utf8');
 const context={window:{}};vm.runInNewContext(content,context,{timeout:1000});
 return JSON.parse(JSON.stringify(context.window.WIGAN_CONTENT.overrides.en));
}
