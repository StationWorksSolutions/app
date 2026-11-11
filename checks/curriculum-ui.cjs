// DOM-mock interaction test for curriculum preview within the EXISTING Galaxy app.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={innerHTML:'',listeners:{},contains(){return true},querySelector(){return null},
 addEventListener(type,fn){this.listeners[type]=fn}};
const document={body:{style:{}},getElementById(id){return id==='app'?root:null},
 addEventListener(type,fn){this[type+'Listener']=fn}};
const storage={};
const ctx={window:{},document,location:{search:'?player=1'},URLSearchParams,Date,JSON,console,Blob,
 setTimeout(){},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},
 alert(){throw Error('unexpected alert')}};
vm.createContext(ctx);
for(const path of [
 'dist/content-v3.js','dist/core-foundation.js','dist/curriculum-gate.js',
 'dist/curriculum-pilot.js','dist/curriculum-catalog.js','dist/curriculum-preview.js',
 'dist/training-v3.js'])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const app=ctx.window.GalaxyTraining;
assert.ok(app);
function click(dataset){root.listeners.click({target:{closest(){return {dataset}}}})}
assert.equal(ctx.window.GALAXY_CONTENT.lessons.length,36,'legacy curriculum remains');
click({action:'nav',path:'learn'});
assert.ok(root.innerHTML.includes('250 sequenced learning objectives'),'full staged library visible');
assert.ok(root.innerHTML.includes('GI-001'),'pilot navigation visible');
const beforeLessons=JSON.stringify(app.getState().lessons),beforeSessions=JSON.stringify(app.getCoreState().sessions);
click({action:'curriculum-open',id:'GI-001'});
assert.ok(root.innerHTML.includes('COACH REVIEW PENDING'),'review gate visible');
assert.ok(root.innerHTML.includes('CURRICULUM / REVIEW DRAFT'),'single app overlay');
assert.ok(root.innerHTML.includes('data-action="curriculum-choice"'),'interactive decision options');
click({action:'curriculum-frame',step:'1'});
assert.ok(root.innerHTML.includes('2 / 3'));
click({action:'curriculum-choice',choice:'0'});
click({action:'curriculum-reveal'});
assert.ok(root.innerHTML.includes('Protect and set it back:')||root.innerHTML.includes('Often the safer choice'));
click({action:'curriculum-next'});
assert.ok(root.innerHTML.includes('FIELD DRILL'));
click({action:'curriculum-next'});
assert.ok(root.innerHTML.includes('MATCH CHALLENGE'));
click({action:'curriculum-next'});
assert.ok(!root.innerHTML.includes('role="dialog"'),'draft closes without fake completion');
assert.equal(JSON.stringify(app.getState().lessons),beforeLessons,'review cannot mark legacy lessons completed');
assert.equal(JSON.stringify(app.getCoreState().sessions),beforeSessions,'review cannot record fake skill sessions');
root.listeners.submit({preventDefault(){},target:{id:'curriculumSearchForm',elements:{query:{value:'counter'}}}});
assert.ok(root.innerHTML.includes('Explore the 250-lesson roadmap'));
root.listeners.change({target:{id:'curriculumDomain',value:'TR',dataset:{}}});
assert.ok(root.innerHTML.includes('value="TR" selected'),'filter saved');
click({action:'curriculum-open',id:'TM-005'});
assert.ok(root.innerHTML.includes('Cushion a rolling ball'));
click({action:'close'});
click({action:'curriculum-open',id:'TM-006'});
assert.ok(root.innerHTML.includes('Receive across the body'));
click({action:'close'});
assert.equal(JSON.stringify(app.getState().lessons),beforeLessons);
assert.equal(JSON.stringify(app.getCoreState().sessions),beforeSessions);
assert.ok(!root.innerHTML.includes('role="dialog"'));
console.log('PASS curriculum UI integration: full catalog, guided preview, decisions, practice/apply, filters, and no false progress. DOM mock only.');
