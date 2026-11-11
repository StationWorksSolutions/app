const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const dataScript=fs.readFileSync('dist/content-v3.js','utf8');
const appScript=fs.readFileSync('dist/training-v3.js','utf8');
const coreScript=fs.readFileSync('dist/core-foundation.js','utf8');
const html=fs.readFileSync('dist/index.html','utf8');
const css=fs.readFileSync('dist/training-v3.css','utf8');
assert.match(html,/training-v3\.js/);
assert.match(html,/content-v3\.js/);
assert.ok(!html.includes('app-refresh.js'),'old overlapping scripts must not boot');
new vm.Script(dataScript,{filename:'content-v3.js'});
new vm.Script(appScript,{filename:'training-v3.js'});
new vm.Script(coreScript,{filename:'core-foundation.js'});
const root={innerHTML:'',listeners:{},contains:()=>true,isConnected:true,addEventListener(type,fn){this.listeners[type]=fn},querySelector(){return null}};
const document={
 body:{style:{}},getElementById(id){return id==='app'?root:null},
 addEventListener(type,fn){this[type+'Listener']=fn}
};
const old={names:['Jay test','James test'],records:{'0|2026-10-19|A':{checks:{'one':true},weights:{},feeling:''}}};
const storage={'galaxy-training-v1':JSON.stringify(old)};
const ctx={
 window:{},document,location:{search:'?player=1'},
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},
 URLSearchParams,Date,JSON,console,Blob,setTimeout(){},
 alert(){throw Error('unexpected alert')},
};
vm.createContext(ctx);
vm.runInContext(dataScript,ctx,{filename:'content-v3.js'});
const source=ctx.window.GALAXY_CONTENT;
assert.equal(source.lessons.length,36,'curriculum retains all 36 concepts');
assert.equal(new Set(source.lessons.map(l=>l.id)).size,36);
assert.equal(source.levels.length,6);
for(const level of source.levels){
 assert.equal(level[2].length,6);
 for(const id of level[2])assert.ok(source.byId[id],'missing lesson '+id);
}
for(const lesson of source.lessons){
 for(const field of ['id','title','why','solo','duo','scenario','answer'])assert.ok(lesson[field],lesson.id+' missing '+field);
 assert.ok(Array.isArray(lesson.cues));
 assert.ok(source.plays[lesson.id]&&source.plays[lesson.id].frames.length===3,'missing storyboard '+lesson.id);
 for(const id of lesson.video||[])assert.ok(source.demos[id]&&/^https:\/\//.test(source.demos[id].url),'invalid resource '+id);
}
vm.runInContext(coreScript,ctx,{filename:'core-foundation.js'});
vm.runInContext(appScript,ctx,{filename:'training-v3.js'});
const app=ctx.window.GalaxyTraining;
assert.ok(app,'app boots');
assert.equal(app.getState().names[0],'Jay test','migrates names from the existing browser');
assert.match(root.innerHTML,/One clear next step/);
assert.ok(app.getCoreState(),'core model initialized');
assert.match(root.innerHTML,/data-path="learn"/);
assert.match(root.innerHTML,/data-path="train"/);
assert.match(root.innerHTML,/data-path="progress"/);
assert.ok(!root.innerHTML.includes('Strength A'));
function click(dataset){root.listeners.click({target:{closest(){return {dataset}}}})}
click({action:'nav',path:'learn'});
assert.match(root.innerHTML,/Think before you play/);
assert.match(root.innerHTML,/36 situations/);
click({action:'lesson',id:'scan'});
assert.match(root.innerHTML,/role="dialog"/);
assert.match(root.innerHTML,/viewBox="0 0 300 240"/);
click({action:'frame',step:'1'});
assert.match(root.innerHTML,/2 \/ 3/);
click({action:'lesson-next'});
assert.match(root.innerHTML,/YOUR DECISION/);
click({action:'reveal'});
assert.match(root.innerHTML,/One useful response/);
click({action:'lesson-next'});
assert.match(root.innerHTML,/Try the idea/);
click({action:'lesson-next'});
assert.match(root.innerHTML,/Progress recorded/);
assert.equal(Object.values(app.getCoreState().sessions).find(s=>s.contentId==='scan').status,'awaiting_match_application');
assert.ok(app.getState().lessons['0|11|scan'].seen,'viewed lesson records explored state');
click({action:'nav',path:'drills'});
assert.match(root.innerHTML,/Ask for a session/);
click({action:'drill',id:'wide'});
assert.match(root.innerHTML,/DRILLS \/ BALL LAB/);
assert.match(root.innerHTML,/With a partner/);
click({action:'close'});
click({action:'nav',path:'workout'});
assert.match(root.innerHTML,/Workouts temporarily unavailable/);
assert.match(root.innerHTML,/Exercise demonstrations are being reviewed/);
assert.ok(!root.innerHTML.includes('data-action="choose-workout"'),'no exercise start CTA');
assert.ok(!root.innerHTML.includes('data-action="start-workout"'),'no resume CTA while media unverified');
assert.equal(source.exerciseGraphic,undefined,'unsafe artwork generator must not be exported');
assert.equal(source.liftArt,undefined,'unsafe artwork must not be published');
const build=app.getPlan('build'),easy=app.getPlan('technique');
assert.equal(build.length,10);
assert.equal(easy.length,8);
assert.equal(app.matchPlan('I want a winger plan').id,'wide');
assert.equal(app.matchPlan('first touch and passing').id,'first');
assert.equal(app.matchPlan('more strength').page,'workout');
assert.equal(Object.keys(app.getState().workouts).length,0);
click({action:'choose-workout',mode:'build'});
click({action:'start-workout'});
click({action:'workout-move',step:'1'});
root.listeners.change({target:{dataset:{set:'0:1:'},checked:true,id:''}});
assert.equal(Object.keys(app.getState().workouts).length,0,'blocked exercise actions cannot write records');
assert.ok(!root.innerHTML.includes('role="dialog"'),'exercise overlay never opens');
assert.ok(storage['galaxy-training-v1']===JSON.stringify(old),'legacy records untouched');
assert.match(css,/\.overlay/);
click({action:'nav',path:'progress'});
assert.match(root.innerHTML,/Participation is not the same as demonstrated skill competency/);
root.listeners.change({target:{id:'playerSelect',value:'1',dataset:{}}});
assert.equal(app.getState().active,1,'second player selected');
assert.ok(!Object.keys(app.getState().workouts).some(k=>k.startsWith('1|')),'player history still isolated');
root.listeners.change({target:{id:'playerSelect',value:'0',dataset:{}}});
assert.equal(app.getState().active,0,'first player resumed');

console.log('PASS v3: core flow, player isolation, unreviewed exercise lockout and legacy records. DOM mock only; device QA pending.');
