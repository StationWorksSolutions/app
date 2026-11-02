const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes={};const listeners=[];
function el(){return {hidden:false,value:'',innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},append(){},prepend(){},after(){},before(){},replaceWith(){},setAttribute(){},removeAttribute(){},addEventListener(){},scrollIntoView(){},focus(){},querySelector(){return el()},querySelectorAll(){return []},insertAdjacentHTML(p,s){this.innerHTML+=s}}}
let stored='',tick;
const old={names:['Player 1','Player 2'],sets:[1,1],records:{'0|2026-10-19|A':{checks:{},weights:{0:5},feeling:'Good'}}};
const ctx={document:{body:el(),head:el(),createElement:el,getElementById:id=>nodes[id]??=el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener:(event,f,capture)=>listeners.push({event,f,capture})},window:{scrollTo(){}},localStorage:{getItem:()=>JSON.stringify(old),setItem:(k,v)=>stored=v},location:{search:'',href:'https://example.com'},history:{replaceState(){}},navigator:{},URL,URLSearchParams,Date,Blob,setTimeout(){},setInterval(f){tick=f;return 1},clearInterval(){tick=null}};
vm.createContext(ctx);const html=fs.readFileSync('dist/index.html','utf8');vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);for(const [,file]of html.matchAll(/<script src="([^"]+)"/g))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),ctx,{filename:file});
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('lessons.length'),36);
assert.equal(new Set(run('lessons.map(l=>l.id)')).size,36);
run(`for(const l of lessons){for(const f of ['why','solo','duo','scenario','answer','evidence'])if(!l[f])throw Error(l.id+' missing '+f);for(const id of l.video)if(!demoCatalog[id].url.startsWith('https:'))throw Error('Invalid link '+id)}`);
run("showHub('Today')");assert.ok(run('hub.innerHTML').includes('Today’s five.'));assert.ok(!/Monday|Wednesday|Friday/.test(run('hub.innerHTML')));
run("showHub('Learn')");assert.ok(run('hub.innerHTML').includes('36 CONCEPT CARDS'));
run("day='A';sessionKey='0|test|A';exerciseIndex=0;liftSession()");assert.ok(run('hub.innerHTML').includes('Squat to a chair'));assert.ok(!run('hub.innerHTML').includes('<h1>Dumbbell floor press</h1>'));
for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
run("day='B';sessionKey='1|test|B';player=1");for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
assert.equal(run("data.records['0|2026-10-19|A'].weights[0]"),5);
assert.ok(run("data.trainingSessions['0|test|A']!==data.trainingSessions['1|test|B']"));
console.log('PASS: all scripts boot; 36 unique complete lessons; valid demo URL construction; schedule-free entry; one exercise at a time; both strength sessions render; old records preserved; player sessions separate. DOM mock only, not browser QA.');
// Real card event handlers: browsing must never imply completion.
const click=d=>{ctx.testEvent={target:{closest:()=>({dataset:d})}};listeners.find(x=>x.event==='click'&&x.f.toString().includes('d.cardDone')).f(ctx.testEvent)};
run("player=0;data.sets[0]=2");click({liftSession:'A'});click({liftReady:''});
click({cardStep:'1'});assert.equal(run('exerciseIndex'),1);assert.equal(run('cardRecord().completed.length'),0);
click({cardStep:'-1'});click({cardDone:''});assert.equal(run('cardRecord().completed.length'),0,'Two sets required');
click({liftSession:'A'});click({liftReady:''});assert.ok(run('hub.innerHTML').includes('Set 2 of 2'),'Resume within exercise');
click({cardDone:''});assert.ok(run('cardRecord().completed.includes(0)'));click({cardUndo:''});assert.ok(!run('cardRecord().completed.includes(0)'));click({cardDone:''});
for(let i=1;i<5;i++){click({cardIndex:String(i)});const n=run('cardSlots(exerciseIndex).length');for(let j=0;j<n;j++)click({cardDone:''})}
assert.ok(run('hub.innerHTML').includes('Deck complete.'));
run("showHub('Progress')");assert.ok(run('hub.innerHTML').includes('5 of 5 exercises · Complete'));
run("player=1;showHub('Progress')");assert.ok(!run('hub.innerHTML').includes('5 of 5 exercises · Complete'));
run("player=0");click({liftSession:'A'});assert.ok(run('hub.innerHTML').includes('Your training.'));
click({liftSession:'B'});click({liftReady:''});click({runClock:'60'});assert.ok(tick);click({pauseClock:''});assert.equal(tick,null);click({resumeClock:''});assert.ok(tick);click({cardStep:'1'});assert.equal(tick,null);
assert.equal(run('Object.keys(liftArt).length'),9);
for(const workout of ['A','B'])for(let i=0;i<5;i++){run("day='"+workout+"';exerciseIndex="+i+";liftSession()");assert.ok(run('hub.innerHTML').includes('<svg'));assert.ok(!run('hub.innerHTML').includes('undefined'))}
console.log('PASS: card browsing, per-set/per-side checks, two-set plan, partial resume, undo, completion, legacy records, player isolation, diagram coverage, timer cleanup.');
// Geometry invariants catch the prior stretching-limb regression.
run(`for(const [name,art] of Object.entries(liftArt)){for(const p of art.rigs){const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);if(Math.abs(dist(p.hip,p.shoulder)-38)>0.001)throw Error(name+' torso');for(const [limbs,len] of [[p.arms,24],[p.legs,32]])for(const limb of limbs)for(let i=0;i<2;i++)if(Math.abs(dist(limb[i],limb[i+1])-len)>0.001)throw Error(name+' limb length');for(const q of [p.head,p.hip,p.shoulder,...p.arms.flat(),...p.legs.flat()])if(!q.every(Number.isFinite)||q[1]>159)throw Error(name+' invalid joint')}}`);
console.log('PASS: all 18 poses retain fixed torso and limb lengths; joints remain above the floor.');

assert.equal(run('iqLevels.flatMap(l=>l[2]).length'),36);
assert.equal(new Set(run('iqLevels.flatMap(l=>l[2])')).size,36);
run("for(const l of iqLevels)for(const id of l[2])if(!lessonById[id])throw Error(id)");
run("player=0;prefs().format='9';data.concepts[conceptKey('scan')]={explained:'2026-10-01',applied:'2026-10-01',recalled:'2026-10-01'}");assert.equal(run("conceptSecure('scan')"),false);
run("data.concepts[conceptKey('scan')].recalled='2026-10-02'");assert.equal(run("conceptSecure('scan')"),true);
run("prefs().format='11'");assert.equal(run("conceptSecure('scan')"),false);
run("player=1;prefs().format='9'");assert.equal(run("conceptSecure('scan')"),false);
for(const deck of ['touch','wing','engine'])for(let i=0;i<3;i++){run("ballDeck='"+deck+"';ballIndex="+i+";ballSession()");assert.ok(!run('hub.innerHTML').includes('undefined'))}
run("player=0;day='B';sessionKey='0|new-plan|B';exerciseIndex=0");click({strengthPlan:'2'});assert.equal(run('cardRecord().goalSets'),2);
assert.ok(run('hub.innerHTML').includes('Single-Leg Strength'));
console.log('PASS: 36 concepts in six complete levels; later-day recall gate; per-player/per-format milestones; three ball decks; two-set strength selection.');
assert.equal(run('Object.keys(lessonPlays).length'),36);
run(`for(const l of lessons){const m=lessonPlays[l.id];if(!m||m.frames.length!==3)throw Error('Missing storyboard '+l.id);for(const f of m.frames){if(!f.text||f.text.split(' ').length>20)throw Error('Long caption '+l.id);for(const p of [...Object.values(f.actors||{}),f.ball].filter(Boolean))if(p[0]<0||p[0]>300||p[1]<0||p[1]>240)throw Error('Off pitch '+l.id)}}`);
assert.equal(run("parsePlay('A passes to B. A runs right. B passes to A.').frames.length"),4);
assert.throws(()=>run("parsePlay('B passes to A.')"));assert.throws(()=>run("parsePlay('<script>bad</script>')"));
assert.equal(run("rotationIndex('2026-11-01',0)===rotationIndex('2026-11-01',0)"),true);
assert.notEqual(run("rotationIndex('2026-11-01',0)"),run("rotationIndex('2026-11-02',0)"));
run("player=0;beginDaily()");const lineup=run('JSON.stringify(cardRecord().exerciseNames)');run('beginDaily()');assert.equal(run('JSON.stringify(cardRecord().exerciseNames)'),lineup);
for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
for(const id of run('lessons.map(l=>l.id)'))for(let i=0;i<3;i++){run("prefs().focus='"+id+"';step="+i+";focusStep()");assert.ok(!run('hub.innerHTML').includes('undefined'))}
console.log('PASS: 36 concise storyboards; all 108 lesson cards render; play command validation; next-date rotation; same-date workout preservation and demo mappings.');
