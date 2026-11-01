const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('dist/index.html','utf8');
const scripts=[html.match(/<script>([\s\S]*?)<\/script>/)[1],...['learning.js','demos.js','library-data.js','library.js'].map(f=>fs.readFileSync('dist/'+f,'utf8'))];
const elements={};let saved='';
function element(){return {value:'',textContent:'',innerHTML:'',style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},scrollIntoView(){},appendChild(){},prepend(){},after(){},querySelector(){return null},insertAdjacentHTML(where,s){this.innerHTML+=s},focus(){}}}
const old={names:['Player 1','Player 2'],sets:[1,1],records:{'0|2026-10-19|A':{checks:{warm:true},weights:{0:'5'},feeling:'Good'}},learning:{},demoChecks:{}};
const ctx={document:{head:element(),getElementById:id=>elements[id]??=element(),querySelectorAll:()=>[],addEventListener(){},createElement:element},localStorage:{getItem:()=>JSON.stringify(old),setItem:(k,v)=>saved=v},location:{search:'',href:'https://example.com'},history:{replaceState(){}},URL,URLSearchParams,Date,JSON,Number,String,Object,Math,navigator:{},setInterval(){},setTimeout(){},Blob};
vm.createContext(ctx);for(const s of scripts){new Function(s);vm.runInContext(s,ctx)}
const run=s=>vm.runInContext(s,ctx);
assert.ok(!/Monday|Wednesday|Friday/i.test(elements.libraryArea.innerHTML));
assert.ok(elements.libraryArea.innerHTML.includes('Choose a session'));
assert.equal(JSON.parse(saved).records['0|2026-10-19|A'].weights[0],'5','Preserve old logs');
run("prefs().weekType='normal';renderWeek()");assert.ok(elements.libraryArea.innerHTML.includes('data-week-action="B"'));
run("prefs().weekType='tournament';renderWeek()");assert.ok(elements.libraryArea.innerHTML.includes('Choose rest or learning'));
assert.equal(run('lessons.length'),16);assert.equal(run('Object.keys(positionPaths).length'),8);
run(`for(const [format,shapes] of Object.entries(formations)){for(const [name,players] of Object.entries(shapes)){if(players.length!==Number(format))throw Error('Wrong player count '+name);if(name.split('-').reduce((a,n)=>a+Number(n),0)!==Number(format)-1)throw Error('Wrong formation sum');for(const [label,x,y,role] of players){if(!positionPaths[role]||x<0||x>100||y<0||y>100)throw Error('Invalid field role')}}}for(const role of Object.values(positionPaths)){role.path.forEach(id=>{if(!lessonById[id])throw Error('Missing pathway lesson')})}for(const l of lessons){for(const key of ['nine','eleven','solo','duo','pressure','scenario','answer','evidence'])if(!l[key])throw Error('Missing lesson content');l.video.forEach(k=>{if(!demoCatalog[k])throw Error('Missing video')});l.prereq.forEach(k=>{if(!lessonById[k])throw Error('Missing prerequisite')});if(detailHTML(l.id).includes('undefined'))throw Error('Undefined lesson output')}`);
run("section='library';lessonId='touch';prefs().format='11';lessonRecord('touch').checks.practice=true;lessonRecord('touch').evidence='<script>alert(1)</script>';render()");
assert.ok(elements.libraryArea.innerHTML.includes('&lt;script&gt;'));assert.ok(!elements.libraryArea.innerHTML.includes('<script>alert'));
run("prefs().format='9'");assert.equal(run("countLesson('touch')"),0,'Separate formats');
run("player=1;prefs().format='11'");assert.equal(run("countLesson('touch')"),0,'Separate players');
run("player=0;prefs().format='11'");assert.equal(run("countLesson('touch')"),1,'Keep earlier progress');
run("prefs().focus='cross';section='week';render()");assert.ok(elements.libraryArea.innerHTML.includes('data-lesson="cross"'));
run("section='library';lessonId=null;libraryView='skills';category='Defending';query='';render()");assert.ok(elements.libraryArea.innerHTML.includes('2 lessons'));
run("category='All';query='no-match-xyz';render()");assert.ok(elements.libraryArea.innerHTML.includes('No matching lessons'));
run("libraryView='positions';prefs().formation='4-3-3';prefs().role='winger';render()");assert.ok(elements.libraryArea.innerHTML.includes('Four moments of the game'));
run("section='history';render()");assert.ok(elements.historyArea.innerHTML.includes('Library learning'));assert.ok(elements.historyArea.innerHTML.includes('First touch into the next action'));
for(const f of ['dist/index.html','dist/learning.js','dist/library.js'])assert.ok(!/Tuesday|Thursday/.test(fs.readFileSync(f,'utf8')),'Stale schedule');
console.log('PASS: existing log preservation; legacy workload variants; 16 complete lessons; 8 valid pathways; all formation counts; video mappings; escaping; per-player/per-format progress; filters; focus; history. No browser or playback test.');
