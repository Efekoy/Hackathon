import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const dictation=source.slice(source.indexOf('function startDictation(){'),source.indexOf("$('listenButton').onclick"));
function setup(supported=true){const messages=[],elements={mic:{textContent:'',classList:{add(){},remove(){}}},experience:{value:''}};let rec;
 class Recognition{constructor(){rec=this;}start(){this.onstart();}stop(){this.onend();}}
 const context={window:supported?{SpeechRecognition:Recognition}:{},state:{lang:'en',experience:'Existing experience.'},languages:{en:'en-GB'},recording:false,recognition:null,$:id=>elements[id],t:()=>({mic:'Speak',micStop:'Stop',micUnavailable:'Unavailable',micError:'Permission denied',listening:'Listening'}),toast:m=>messages.push(m),stopAudio:()=>{},stopRecognition:()=>{context.recognition?.stop();context.recognition=null;context.recording=false;}};
 vm.createContext(context);vm.runInContext(dictation,context);return{context,messages,elements,get rec(){return rec;}};
}
test('dictation appends transcript without discarding an existing answer',()=>{const h=setup();h.context.startDictation();assert.equal(h.rec.lang,'en-GB');h.rec.onresult({results:[[{transcript:'I helped neighbours.'}]]});assert.equal(h.elements.experience.value,'Existing experience. I helped neighbours.');h.rec.onend();assert.equal(h.context.recording,false);});
test('unsupported speech and microphone denial leave typed answers intact',()=>{const h=setup(false);h.context.startDictation();assert.equal(h.messages.at(-1),'Unavailable');assert.equal(h.context.state.experience,'Existing experience.');const denied=setup();denied.context.startDictation();denied.rec.onerror();assert.equal(denied.messages.at(-1),'Permission denied');assert.equal(denied.context.state.experience,'Existing experience.');});
test('late dictation results after stopping cannot overwrite form data',()=>{const h=setup();h.context.startDictation();const rec=h.rec;h.context.stopRecognition();rec.onresult({results:[[{transcript:'late result'}]]});assert.equal(h.context.state.experience,'Existing experience.');});
