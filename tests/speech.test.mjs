import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/accessibility.js',import.meta.url),'utf8');
const dictation=source.slice(source.indexOf('function beginDictation(){'),source.indexOf('window.requestDictation='));
function setup(supported=true){const messages=[],elements={mic:{textContent:'',classList:{add(){},remove(){}}},experience:{value:''},next:{disabled:false}};let rec;
 class Recognition{constructor(){rec=this;}start(){this.onstart();}stop(){this.onend();}}
 const context={window:supported?{SpeechRecognition:Recognition}:{},state:{lang:'en',screen:'questions',step:5,answers:[[],[],[],[],[],'Existing experience.']},recognition:null,$:id=>elements[id],u:()=>({speak:'Speak',stopMic:'Stop',speechUnavailable:'Unavailable',micError:'Permission denied',listening:'Listening'}),toast:m=>messages.push(m),stopAudio:()=>{},canContinue:()=>true,stopDictation:()=>{context.recognition=null;}};
 vm.createContext(context);vm.runInContext(dictation,context);return{context,messages,elements,get rec(){return rec;}};
}
test('dictation preserves typed experience and appends the transcript',()=>{const h=setup();h.context.beginDictation();assert.equal(h.rec.lang,'en-GB');h.rec.onresult({results:[[{transcript:'I helped neighbours.'}]]});assert.equal(h.elements.experience.value,'Existing experience. I helped neighbours.');assert.equal(h.elements.next.disabled,false);});
test('unsupported speech and microphone denial retain typed answers',()=>{const h=setup(false);h.context.beginDictation();assert.equal(h.messages.at(-1),'Unavailable');assert.equal(h.context.state.answers[5],'Existing experience.');const denied=setup();denied.context.beginDictation();denied.rec.onerror();assert.equal(denied.messages.at(-1),'Permission denied');assert.equal(denied.context.state.answers[5],'Existing experience.');});
test('late speech results after stopping or leaving the experience step are ignored',()=>{const h=setup();h.context.beginDictation();const rec=h.rec;h.context.recognition=null;rec.onresult({results:[[{transcript:'late'}]]});assert.equal(h.context.state.answers[5],'Existing experience.');h.context.recognition=rec;h.context.state.step=6;rec.onresult({results:[[{transcript:'late'}]]});assert.equal(h.context.state.answers[5],'Existing experience.');});
