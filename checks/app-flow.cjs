const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes={};const listeners=[];
function el(){return {hidden:false,value:'',innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},append(){},prepend(){},after(){},before(){},replaceWith(){},setAttribute(){},removeAttribute(){},addEventListener(){},scrollIntoView(){},focus(){},querySelector(){return el()},querySelectorAll(){return []},insertAdjacentHTML(p,s){this.innerHTML+=s}}}
let stored='',tick;
const old={names:['Player 1','Player 2'],sets:[1,1],records:{'0|2026-10-19|A':{checks:{},weights:{0:5},feeling:'Good'}}};
const ctx={document:{body:el(),head:el(),createElement:el,getElementById:id=>nodes[id]??=el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener:(event,f,capture)=>listeners.push({event,f,capture})},window:{scrollTo(){}},localStorage:{getItem:()=>JSON.stringify(old),setItem:(k,v)=>stored=v},location:{search:'',href:'https://example.com'},history:{replaceState(){}},navigator:{},URL,URLSearchParams,Date,Blob,setTimeout(){},setInterval(f){tick=f;return 1},clearInterval(){tick=null}};
vm.createContext(ctx);const html=fs.readFileSync('dist/index.html','utf8');vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);for(const [,file]of html.matchAll(/<script src="([^"]+)"/g))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),ctx,{filename:file});
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('lessons.length'),22);
assert.equal(new Set(run('lessons.map(l=>l.id)')).size,22);
run(`for(const l of lessons){for(const f of ['why','solo','duo','scenario','answer','evidence'])if(!l[f])throw Error(l.id+' missing '+f);for(const id of l.video)if(!demoCatalog[id].url.startsWith('https:'))throw Error('Invalid link '+id)}`);
run("showHub('Today')");assert.ok(run('hub.innerHTML').includes('Control & stability'));assert.ok(!/Monday|Wednesday|Friday/.test(run('hub.innerHTML')));
run("showHub('Learn')");assert.ok(run('hub.innerHTML').includes('22 lessons'));
run("day='A';sessionKey='0|test|A';exerciseIndex=0;liftSession()");assert.ok(run('hub.innerHTML').includes('Squat to a chair'));assert.ok(!run('hub.innerHTML').includes('<h1>Dumbbell floor press</h1>'));
for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
run("day='B';sessionKey='1|test|B';player=1");for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
assert.equal(run("data.records['0|2026-10-19|A'].weights[0]"),5);
assert.ok(run("data.trainingSessions['0|test|A']!==data.trainingSessions['1|test|B']"));
console.log('PASS: all scripts boot; 22 unique complete lessons; valid demo URL construction; schedule-free entry; one exercise at a time; both strength sessions render; old records preserved; player sessions separate. DOM mock only, not browser QA.');
// Real card event handlers: browsing must never imply completion.
const click=d=>{ctx.testEvent={target:{closest:()=>({dataset:d})}};listeners.filter(x=>x.event==='click').at(-1).f(ctx.testEvent)};
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
