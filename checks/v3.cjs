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
assert.match(root.innerHTML,/8 MOVEMENTS/);
assert.match(root.innerHTML,/10 MOVEMENTS/);
const build=app.getPlan('build'),easy=app.getPlan('technique');
assert.equal(build.length,10);
assert.equal(easy.length,8);
for(const name of [...build,...easy])assert.ok(name&&name.length>2,'exercise name');
assert.equal(app.matchPlan('I want a winger plan').id,'wide');
assert.equal(app.matchPlan('first touch and passing').id,'first');
assert.equal(app.matchPlan('more strength').page,'workout');
click({action:'choose-workout',mode:'build'});
assert.match(root.innerHTML,/WORKOUT \/ MOVEMENT/);
let w=Object.values(app.getState().workouts)[0];
assert.equal(w.items.length,10);
assert.equal(w.mode,'build');
assert.ok(app.slotsFor(w,0).length>=2);
assert.equal(app.completedExercises(w),0);
const first=app.slotsFor(w,0)[0];
root.listeners.change({target:{dataset:{set:first},checked:true,id:''}});
assert.ok(app.getState().workouts[Object.keys(app.getState().workouts)[0]].checks[first]);
click({action:'close'});
click({action:'start-workout'});
assert.match(root.innerHTML,/checked/);
assert.ok(storage['galaxy-training-v1']===JSON.stringify(old),'legacy records untouched');
assert.match(css,/\.overlay/);
assert.match(css,/\.home-grid/);

for(const name of Object.keys(source.liftArt)){
 const graphic=source.exerciseGraphic(name);
 assert.match(graphic,/<svg/,'missing illustration '+name);
 assert.ok(!graphic.includes('NaN')&&!graphic.includes('undefined'),'bad illustration '+name);
}
for(const mode of ['build','technique']){const plan=app.getPlan(mode);assert.equal(new Set(plan).size,plan.length,'repeated movement in '+mode)}
const firstWorkout=app.getState().workouts[Object.keys(app.getState().workouts)[0]];
for(const slot of app.slotsFor(firstWorkout,0)){firstWorkout.checks[slot]=true}
assert.equal(app.completedExercises(firstWorkout),1,'fully checked movement counts once');
delete firstWorkout.checks[app.slotsFor(firstWorkout,0)[0]];
assert.equal(app.completedExercises(firstWorkout),0,'undo does not falsely complete movement');
click({action:'close'});
root.listeners.change({target:{id:'playerSelect',value:'1',dataset:{}}});
assert.equal(app.getState().active,1,'second player selected');
assert.ok(!Object.keys(app.getState().workouts).some(k=>k.startsWith('1|')),'new player workout separate');
root.listeners.change({target:{id:'playerSelect',value:'0',dataset:{}}});
assert.equal(app.getState().active,0,'first player resumed');

console.log('PASS v3: current content, four-tab shell, session completion, player isolation and legacy regression checks. DOM mock only; mobile/browser QA pending.');
