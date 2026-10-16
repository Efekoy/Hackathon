/** Same-origin, fixed-catalogue translation. Never accepts resident answers or arbitrary text. */
export function createApi(catalogue, fetchImpl=fetch, now=Date.now) {
  let supported=null,supportedUntil=0,supportedPending=null;
  const cache=new Map(),pending=new Map(),requests=new Map();
  const codePattern=/^[a-z]{2,8}(?:-[a-z0-9]{2,8})?$/i;
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  async function provider(path,key,body){
    const response=await fetchImpl('https://translation.googleapis.com/language/translate/v2'+path,{method:body?'POST':'GET',headers:{'X-Goog-Api-Key':key,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw new Error('PROVIDER_UNAVAILABLE');
    return response.json();
  }
  async function languages(key){
    if(supported&&supportedUntil>now())return supported;
    if(supportedPending)return supportedPending;
    supportedPending=(async()=>{const data=await provider('/languages?target=en',key);const list=data?.data?.languages;if(!Array.isArray(list)||!list.length)throw Error('INVALID_PROVIDER_RESPONSE');supported=list.filter(l=>codePattern.test(l.language)&&typeof l.name==='string').map(l=>({language:l.language,name:l.name}));supportedUntil=now()+3600000;return supported;})();
    try{return await supportedPending;}finally{supportedPending=null;}
  }
  function pathsOf(value,path=[],out=[]){if(typeof value==='string')out.push({path,text:value.replace(/<[^>]*>/g,' ')});else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))pathsOf(v,[...path,k],out);return out;}
  const entries=pathsOf(catalogue).filter(({path})=>!['icon','area'].includes(path.at(-1)));
  const unique=[...new Set(entries.map(e=>e.text))];
  async function translated(target,key){
    if(cache.has(target))return cache.get(target);
    if(pending.has(target))return pending.get(target);
    const task=(async()=>{
      const phrases=new Map();
      const chunks=[];let chunk=[],size=0;for(const text of unique){if(chunk.length>=100||size+text.length>12000){chunks.push(chunk);chunk=[];size=0;}chunk.push(text);size+=text.length;}if(chunk.length)chunks.push(chunk);
      // Independent public-copy batches; no resident data is included.
      await Promise.all(chunks.map(async q=>{const data=await provider('',key,{q,target,source:'en',format:'text'});const values=data?.data?.translations;if(!Array.isArray(values)||values.length!==q.length||values.some(v=>typeof v.translatedText!=='string'))throw Error('INVALID_PROVIDER_RESPONSE');q.forEach((text,i)=>phrases.set(text,values[i].translatedText));}));
      const result=structuredClone(catalogue);for(const {path,text}of entries){let parent=result;for(const part of path.slice(0,-1))parent=parent[part];parent[path.at(-1)]=phrases.get(text);}cache.set(target,result);if(cache.size>50)cache.delete(cache.keys().next().value);return result;
    })();pending.set(target,task);try{return await task;}finally{pending.delete(target);}
  }
  return async function handle(request,env={}){
    const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return null;
    if(!['/api/languages','/api/ui'].includes(url.pathname))return json({error:'NOT_FOUND'},404);
    if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405);
    const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return json({error:'ORIGIN_NOT_ALLOWED'},403);
    const key=env.GOOGLE_TRANSLATE_API_KEY?.trim();
    if(!key)return url.pathname==='/api/languages'?json({configured:false,languages:[]}):json({error:'TRANSLATION_NOT_CONFIGURED'},503);
    const ip=request.headers.get('CF-Connecting-IP')||'local';let bucket=requests.get(ip);if(!bucket||bucket.until<now()){bucket={count:0,until:now()+60000};requests.set(ip,bucket);}if(++bucket.count>24)return json({error:'RATE_LIMITED'},429);if(requests.size>5000)for(const [id,b]of requests){if(b.until<now())requests.delete(id);}
    try{
      if(url.pathname==='/api/languages')return json({configured:true,languages:await languages(key)});
      const target=url.searchParams.get('target');if(!target||!codePattern.test(target))return json({error:'INVALID_LANGUAGE'},400);
      if(target==='en')return json({catalogue});
      if(!(await languages(key)).some(l=>l.language===target))return json({error:'UNSUPPORTED_LANGUAGE'},400);
      return json({catalogue:await translated(target,key),machineTranslated:true});
    }catch{return json({error:'TRANSLATION_UNAVAILABLE'},502);}
  };
}
