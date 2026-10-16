// Progressive enhancement: translation failure never discards form answers.
const languageService={configured:false,available:[],status:'loading',request:0};
state.answerMode='type';
const extra=()=>t().extra;
const builtInLanguages=[{language:'en',name:'English'},{language:'pl',name:'Polski'},{language:'ur',name:'اردو'}];
let microphoneConsent=false;
function openModal(html, className=''){
 const dialog=$('referralDialog');if(dialog.open)dialog.close();dialog.className=className;dialog.innerHTML=html;
 const heading=dialog.querySelector('h2');if(heading){heading.id='dialogTitle';dialog.setAttribute('aria-labelledby','dialogTitle');}
 dialog.showModal();return dialog;
}
function closeModal(){const dialog=$('referralDialog');dialog.close();dialog.innerHTML='';dialog.className='';}
function updateAccessibility(){
 const e=extra();
 const labels={receiveLabel:e.receiveLabel,answerLabel:e.answerLabel,typeMode:e.type,voiceMode:e.voice,contrastLabel:e.contrast,speedLabel:e.speed,allLanguages:e.allLanguages,accessTag:e.accessTag,sourcesButton:e.sources};
 Object.entries(labels).forEach(([id,value])=>$(id).textContent=value);
 $('typeMode').setAttribute('aria-pressed',String(state.answerMode==='type'));
 $('voiceMode').setAttribute('aria-pressed',String(state.answerMode==='voice'));
 const supported=Boolean(window.SpeechRecognition||window.webkitSpeechRecognition);
 $('inputStatus').textContent=!supported?e.voiceUnsupported:state.answerMode==='voice'?e.voiceSelected:e.inputHint;
 const voices=window.speechSynthesis?.getVoices()||[];
 $('voiceStatus').textContent=voices.length&&!voices.some(v=>v.lang.toLowerCase().startsWith(state.lang.toLowerCase()))?e.voiceUnavailable:e.voiceHint;
 $('translationStatus').textContent=languageService.status==='loading'?e.translating:languageService.status==='error'?e.apiUnavailable:languageService.configured?(translations[state.lang]&&!['en','pl','ur'].includes(state.lang)?e.machine:e.apiReady):e.apiOffline;
 $('translationStatus').className='translation-status '+(languageService.status==='loading'?'loading':languageService.configured?'connected':'');
 const list=[...builtInLanguages];if(!list.some(l=>l.language===state.lang))list.push(languageService.available.find(l=>l.language===state.lang)||{language:state.lang,name:state.lang});
 $('language').innerHTML=list.map(l=>`<option value="${esc(l.language)}" ${state.lang===l.language?'selected':''}>${esc(l.name)}</option>`).join('');
 if($('mic'))$('mic').classList.toggle('preferred-input',state.answerMode==='voice');
}
window.updateAccessibility=updateAccessibility;
async function loadLanguageService(){
 languageService.status='loading';updateAccessibility();
 try{const response=await fetch('/api/languages',{signal:AbortSignal.timeout(16000)});if(!response.ok)throw Error('unavailable');const data=await response.json();languageService.configured=data.configured===true;languageService.available=Array.isArray(data.languages)?data.languages.filter(l=>typeof l.language==='string'&&typeof l.name==='string'):[];languageService.status='ready';}
 catch{languageService.status='error';languageService.configured=false;languageService.available=[];}
 updateAccessibility();
}
async function changeLanguage(code){
 if(!code||code===state.lang)return;
 syncExperience();stopAudio();stopRecognition();const previous=state.lang,request=++languageService.request;
 try{
  if(!translations[code]){
   languageService.status='loading';updateAccessibility();$('language').disabled=true;
   const response=await fetch('/api/ui?target='+encodeURIComponent(code),{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('translation');const data=await response.json();
   if(!data.catalogue||!Array.isArray(data.catalogue.opportunities)||!data.catalogue.extra)throw Error('invalid');
   // Translations are plain text. Strip markup before inserting provider text into templates.
   const plain=value=>Array.isArray(value)?value.map(plain):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,plain(v)])):typeof value==='string'?value.replace(/[<>]/g,''):value;
   translations[code]=plain(data.catalogue);
  }
  if(request!==languageService.request)return;
  if(state.example&&state.experience===translations[previous].exampleExperience)state.experience=translations[code].exampleExperience;
  state.lang=code;state.guideHelp='';languageService.status='ready';render();
  // Preserve an edited summary. Custom resident text is never sent for translation.
 }catch{if(request===languageService.request){languageService.status='ready';$('language').value=previous;toast(extra().translationFailed);updateAccessibility();}}
 finally{if(request===languageService.request)$('language').disabled=false;}
}
function showLanguagePicker(){
 const e=extra();openModal(`<span class="eyebrow">MBACC CONNECT · TEAM WIGAN</span><h2>${esc(e.languageTitle)}</h2><p>${esc(e.languageIntro)}</p><label class="field-label" for="languageSearch">${esc(e.languageSearch)}</label><input type="text" id="languageSearch" autocomplete="off" placeholder="${esc(e.languageSearch)}"><div class="language-list" id="languageList"></div><p class="language-hint">${esc(languageService.configured?e.machine:e.languageNoApi)}</p><div class="dialog-actions"><button class="secondary" id="retryLanguages">${esc(e.loadLanguages)}</button><button class="primary" id="closeLanguages">${esc(e.close)}</button></div>`,'language-dialog');
 const list=[...builtInLanguages,...languageService.available.filter(l=>!builtInLanguages.some(b=>b.language===l.language))];
 for(const language of list){try{language.nativeName=new Intl.DisplayNames([language.language],{type:'language'}).of(language.language);}catch{language.nativeName=language.name;}}
 function draw(){const search=$('languageSearch').value.toLocaleLowerCase();const filtered=list.filter(l=>(l.name+' '+l.nativeName+' '+l.language).toLocaleLowerCase().includes(search));$('languageList').innerHTML=filtered.length?filtered.map(l=>`<button class="language-item" data-language="${esc(l.language)}" aria-pressed="${l.language===state.lang}"><span>${esc(l.nativeName||l.name)}${l.nativeName&&l.nativeName!==l.name?`<small style="display:block">${esc(l.name)}</small>`:''}</span><small>${esc(l.language)}</small></button>`).join(''):`<p>${esc(e.languageEmpty)}</p>`;document.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>{const code=button.dataset.language;closeModal();changeLanguage(code);});}
 $('languageSearch').oninput=draw;$('closeLanguages').onclick=closeModal;$('retryLanguages').onclick=async()=>{closeModal();await loadLanguageService();showLanguagePicker();};draw();$('languageSearch').focus();
}
function showSources(){const e=extra();openModal(`<span class="eyebrow">TEAM WIGAN · INDEPENDENT PROTOTYPE</span><h2>${esc(e.sources)}</h2><p>${esc(e.sourcesIntro)}</p><p class="source-line">${esc(e.checked)}</p><ul class="source-list">${window.WIGAN_CONTENT.sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></li>`).join('')}</ul><p><a href="${window.WIGAN_CONTENT.photo.url}" target="_blank" rel="noopener noreferrer">${esc(e.photoCredit)}</a> <a href="${window.WIGAN_CONTENT.photo.license}" target="_blank" rel="noopener noreferrer">CC BY-SA 2.0</a></p><p>${esc(t().guideDisclosure)}</p><button class="primary" id="closeSources">${esc(e.close)}</button>`);$('closeSources').onclick=closeModal;}
showOpportunity=function(i){
 syncExperience();const d=t(),o=d.opportunities[i],source=window.WIGAN_CONTENT.sources[i];
 openModal(`<span class="eyebrow">${esc(d.sample)}</span><h2>${esc(o.title)}</h2><p>${esc(o.description)}</p><ul class="details"><li>⌖ ${esc(o.area)}</li><li>◷ ${esc(o.schedule)}</li><li>◇ ${esc(o.price)}</li><li>♡ ${esc(o.support)}</li></ul><div class="review-note">${esc(d.detailNote)}</div><p class="source-line">${esc(d.extra.source)}: ${esc(source.provider)}</p><div class="dialog-actions"><button class="secondary" id="closeDetails">${esc(d.close)}</button><a class="primary official-link" href="${source.url}" target="_blank" rel="noopener noreferrer">${esc(d.detailAction)}</a></div>`);
 $('closeDetails').onclick=closeModal;
};
window.requestDictation=function(){
 if(recording){startDictation();return;}
 if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){toast(t().micUnavailable);return;}
 if(microphoneConsent){startDictation();return;}
 const e=extra();openModal(`<h2>${esc(e.micPrivacyTitle)}</h2><p>${esc(e.micPrivacy)}</p><div class="dialog-actions"><button class="secondary" id="cancelMic">${esc(t().cancel)}</button><button class="primary" id="agreeMic">${esc(e.startMic)}</button></div>`);
 $('cancelMic').onclick=closeModal;$('agreeMic').onclick=()=>{microphoneConsent=true;closeModal();startDictation();};
};
window.requestReset=function(){
 if(!state.interests.length&&!state.gateways.length&&!state.stage&&!state.experience&&!state.results){reset();return;}
 syncExperience();const e=extra();openModal(`<h2>${esc(e.resetTitle)}</h2><p>${esc(e.resetText)}</p><div class="dialog-actions"><button class="secondary" id="cancelReset">${esc(t().cancel)}</button><button class="primary" id="confirmReset">${esc(e.resetConfirm)}</button></div>`);$('cancelReset').onclick=closeModal;$('confirmReset').onclick=()=>{closeModal();reset();};
};
// Add a real contact format check to the existing consent-based preview.
const originalReferral=showReferral;
showReferral=function(title){
 originalReferral(title);const dialog=$('referralDialog');const h=dialog.querySelector('h2');h.id='dialogTitle';dialog.setAttribute('aria-labelledby','dialogTitle');const form=$('referralForm'),submit=form.onsubmit;
 $('refContact').oninput=()=>{$('refContact').setCustomValidity('');$('refContact').removeAttribute('aria-invalid');};
 form.onsubmit=e=>{const value=$('refContact').value.trim();const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);const validPhone=/^[+\d\s().-]+$/.test(value)&&value.replace(/\D/g,'').length>=7&&value.replace(/\D/g,'').length<=15;if(!validEmail&&!validPhone){e.preventDefault();$('refContact').setCustomValidity(extra().contactError);$('refContact').setAttribute('aria-invalid','true');$('refContact').reportValidity();return;}submit(e);const title=dialog.querySelector('h2');title.id='dialogTitle';title.tabIndex=-1;title.focus();};
};
$('language').onchange=e=>changeLanguage(e.target.value);
$('allLanguages').onclick=showLanguagePicker;
$('sourcesButton').onclick=showSources;
$('contrastButton').onclick=()=>{const active=document.body.classList.toggle('high-contrast');$('contrastButton').setAttribute('aria-pressed',String(active));};
$('typeMode').onclick=()=>{state.answerMode='type';stopRecognition();updateAccessibility();};
$('voiceMode').onclick=()=>{state.answerMode='voice';updateAccessibility();};
document.querySelector('.brand').onclick=e=>{e.preventDefault();window.requestReset();};
if(window.speechSynthesis)window.speechSynthesis.addEventListener('voiceschanged',updateAccessibility);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();stopRecognition();}});
updateAccessibility();loadLanguageService();
