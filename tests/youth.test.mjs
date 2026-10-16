import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const content=await readFile(new URL('../public/content.js',import.meta.url),'utf8');
const source=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
function context(){const c={window:{}};vm.createContext(c);vm.runInContext(content+'\n'+source.slice(0,source.indexOf("$('listenButton').onclick")),c);return c;}
const result=(c,expression)=>JSON.parse(vm.runInContext('JSON.stringify('+expression+')',c));
test('all bundled languages offer youth goals and the seven official gateways',()=>{const c=context();for(const code of ['en','pl','ur']){const d=result(c,`translations.${code}`);assert.equal(d.interestNames.length,6);assert.equal(d.youth.gatewayNames.length,7);assert.equal(d.youth.stages.length,5);assert.equal(d.opportunities.length,6);assert.equal(d.opportunities[5].type,5);}const english=result(c,'translations.en');assert.ok(!JSON.stringify(english.opportunities).includes('Adult Learning'));assert.match(english.footerName,/Wigan Connect/);assert.ok(!JSON.stringify(english.headings).includes('MBacc'));});
test('each practical youth goal prioritises the corresponding official route',()=>{const c=context();for(let goal=0;goal<5;goal++){vm.runInContext(`state.interests=[${goal}]`,c);assert.equal(result(c,'rankedOpportunities()[0].i'),goal);}vm.runInContext('state.interests=[5]',c);assert.equal(result(c,'shouldSuggestMbacc()'),true);});
test('selected career gateways and education stage are included in the profile',()=>{const c=context();vm.runInContext("state.interests=[0];state.gateways=[2,4];state.stage=1;state.experience='I built a school website.'",c);const summary=vm.runInContext('buildSummary()',c);assert.match(summary,/Technology & digital/);assert.match(summary,/Engineering & making things/);assert.match(summary,/School \/ GCSEs/);assert.match(summary,/I built a school website/);});
test('MBacc is suggested only for relevant career exploration answers',()=>{const c=context();
for(const goals of [[],[3],[4],[3,4]]){vm.runInContext(`state.interests=${JSON.stringify(goals)};state.gateways=[2]`,c);assert.equal(vm.runInContext('renderPathwayPlan()',c),'');}
for(const goals of [[1],[5],[0],[2]]){vm.runInContext(`state.interests=${JSON.stringify(goals)};state.gateways=[2]`,c);assert.match(vm.runInContext('renderPathwayPlan()',c),/https:\/\/gmacs.co.uk\/beeline\//);}
vm.runInContext('state.interests=[0];state.gateways=[]',c);assert.equal(vm.runInContext('renderPathwayPlan()',c),'');
});
test('the form gathers information under Wigan Connect without MBacc promotion',()=>{const c=context();const html=vm.runInContext('renderForm()',c);assert.ok(!html.includes('MBacc'));assert.ok(!html.includes('Beeline'));vm.runInContext('state.interests=[5];state.experience="private fictional answer"',c);const results=vm.runInContext('renderPathwayPlan()',c);assert.ok(!results.includes('private fictional answer'));assert.ok(!results.includes('?'));});
