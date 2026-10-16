/* Pure journey logic: interest exploration, never recruitment or eligibility scoring. */
window.WiganJourney=(()=>{
 const icons=[['🔧','💙','🎨','📦','🧸','💻'],['🏗️','🏭','🎭','🏡','💻','🌤️'],['🔧','💙','✨','📊','💪','💬'],['👷','⚙️','💼','🧭','🤝','✨'],['🎒','📚','🛠️','🧭','💭'],[],[],['🌐','📝','🚌','♿','💬','✓']];
 const sectorIcons=['🏗️','🎨','💻','🧸','⚙️','📊','💙'];
 const affinities=[[[0,4],[6],[1],[5],[3],[2]],[[0],[4],[1],[6,3],[2,5],[]],[[0,4,2],[6],[1],[5],[0,4],[3]]];
 function scores(answers){const totals=Array(7).fill(0);for(let q=0;q<3;q++)for(const i of answers[q]||[])for(const sector of affinities[q][i]||[])totals[sector]+=q===0?3:2;const max=Math.max(...totals);return totals.map((signals,id)=>({id,signals,percent:max?Math.round(signals/max*100):0})).sort((a,b)=>b.signals-a.signals||a.id-b.id);}
 function answered(answers){return answers.reduce((count,value,i)=>count+(i===5?Boolean(value.trim()):i===6?Boolean(value.days.length||value.times.length||value.area):value.length>0),0);}
 function xp(answers,complete){return answered(answers)*100+(complete?200:0);}
 function level(points){return Math.min(4,Math.floor(points/300)+1);}
 function shouldMbacc(answers){const goals=answers[3]||[];return goals.includes(1)||goals.includes(5);}
 function routes(answers){const goals=answers[3]||[];const priorities=[0,1,2,3,4];if(!goals.length)return[2,0,3];const relevance=[[0],[1],[2,5],[3],[4]];return priorities.sort((a,b)=>relevance[b].filter(i=>goals.includes(i)).length-relevance[a].filter(i=>goals.includes(i)).length||a-b).slice(0,3);}
 function toggle(current,index,limit=3,exclusive=-1){if(current.includes(index))return current.filter(i=>i!==index);if(index===exclusive)return[index];const values=current.filter(i=>i!==exclusive);return values.length>=limit?values:[...values,index];}
 function initial(){return[[],[],[],[],[],'',{days:[],times:[],area:0},[]];}
 return {icons,sectorIcons,scores,answered,xp,level,shouldMbacc,routes,toggle,initial};
})();
