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
run("day='A';sessionKey='0|test|A';exerciseIndex=0;liftSession()");assert.ok(run('hub.innerHTML').includes('Squat to a chair'));assert.ok(!run('hub.innerHTML').includes('Dumbbell floor press'));
for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
run("day='B';sessionKey='1|test|B';player=1");for(let i=0;i<5;i++){run('exerciseIndex='+i+';liftSession()');assert.ok(!run('hub.innerHTML').includes('undefined'))}
assert.equal(run("data.records['0|2026-10-19|A'].weights[0]"),5);
assert.ok(run("data.trainingSessions['0|test|A']!==data.trainingSessions['1|test|B']"));
console.log('PASS: all scripts boot; 22 unique complete lessons; valid demo URL construction; schedule-free entry; one exercise at a time; both strength sessions render; old records preserved; player sessions separate. DOM mock only, not browser QA.');
// Exercise the real workout event handler and persistence (browser tests supplement this mock).
const click=d=>{ctx.testEvent={target:{closest:()=>({dataset:d})}};run("document");listeners.filter(x=>x.event==='click').at(-1).f(ctx.testEvent)};
run("player=0");click({liftSession:'A'});click({liftReady:''});click({liftNext:''});
assert.equal(run('exerciseIndex'),1);assert.equal(JSON.parse(stored).trainingSessions[run('sessionKey')].completed.length,1);
click({liftSession:'A'});click({liftReady:''});assert.equal(run('exerciseIndex'),1,'Resume first unfinished exercise');
for(let i=0;i<4;i++)click({liftNext:''});
run("showHub('Progress')");assert.ok(run('hub.innerHTML').includes('5 of 5 exercises · Complete'));
run("player=1;showHub('Progress')");assert.ok(!run('hub.innerHTML').includes('5 of 5 exercises · Complete'),'No cross-player history');
run("player=0");click({liftSession:'A'});assert.ok(run('hub.innerHTML').includes('Your training.'),'Completed session does not restart');
click({liftSession:'B'});click({liftReady:''});click({runClock:'60'});assert.ok(tick);click({pauseClock:''});assert.equal(tick,null);click({resumeClock:''});assert.ok(tick);run("showHub('Today')");assert.equal(tick,null,'Navigation stops timer');
console.log('PASS: workout completion, persistence, resume, history, player isolation, duplicate prevention, timer pause/resume/cleanup.');
