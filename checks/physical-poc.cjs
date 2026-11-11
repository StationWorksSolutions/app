'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('dist/physical-poc.html', 'utf8');
assert.match(html, /id="figure"/, 'SVG stage is present');
assert.match(html, /prefers-reduced-motion/, 'reduced-motion support is present');
const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script, 'executable proof-of-concept script exists');
assert.doesNotMatch(script[1], /localStorage|sessionStorage|fetch\s*\(/, 'preview must not mutate Galaxy data or access network');

const elements = new Map();
function mockEl(id=''){
  return {id,children:[],events:{},attributes:{},textContent:'',_html:'',
    classList:{toggle(){}},
    setAttribute(k,v){this.attributes[k]=v},
    addEventListener(name,fn){this.events[name]=fn},
    appendChild(child){this.children.push(child)},
    get innerHTML(){return this._html},
    set innerHTML(s){this._html=s;if(id==='phases')this.children=Array.from(s.matchAll(/<button/g),()=>mockEl('phase-button'))}
  };
}
const document={
  getElementById(id){if(!elements.has(id))elements.set(id,mockEl(id));return elements.get(id)},
  createElement(){return mockEl('button')},
  addEventListener(){},
  hidden:false
};
let callback=null;
const window={};
vm.runInNewContext(script[1],{document,window,matchMedia:()=>({matches:true}),requestAnimationFrame:fn=>{callback=fn}}, {timeout:2500});
assert.equal(elements.get('library').children.length,5);
assert.equal(elements.get('movement-title').textContent,'Bodyweight squat');
assert.ok(elements.get('figure').innerHTML.includes('<line'));
assert.equal(elements.get('play').textContent,'Play','Reduced motion should pause autoplay');
assert.equal(typeof callback,'function');
const api=window.GALAXY_MOTION_POC;
assert.ok(api);
assert.equal(api.version,1);
const expected=['bodyweight-squat','split-squat','single-leg-rdl','lateral-bound','acceleration-start'];
assert.deepEqual(Array.from(api.exercises,x=>x.id),expected);
assert.ok(api.exercises.every(x=>x.status==='coach-review-required'));

const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
for(const [i,id] of expected.entries()){
  elements.get('library').children[i].events.click();
  assert.ok(elements.get('figure').innerHTML.length>2000,id+' draws an articulated figure');
  for(const t of [0,.2,.43,.57,.8,.999,1]){
    const snap=api.snapshot(id,t);
    assert.ok(snap && snap.joints);
    const j=snap.joints;
    for(const value of Object.values(j))assert.ok(value.every(Number.isFinite),id+' finite joints');
    for(const [a,b,d] of [['h','shoulder',98],['lhip','lk',76],['rhip','rk',76],['lk','lankle',70],['rk','rankle',70],['lsh','le',56],['rsh','re',56],['le','lw',51],['re','rw',51]]){
      assert.ok(Math.abs(distance(j[a],j[b])-d)<.000001,id+' '+a+'-'+b+' length stays constant');
    }
  }
}

const fixedStances={
  'bodyweight-squat':[['lankle',[180,362]]],
  'split-squat':[['lankle',[224,360]],['rankle',[124,360]]],
  'single-leg-rdl':[['lankle',[178,362]]]
};
for(const [id,anchors] of Object.entries(fixedStances)){
  for(const t of [0,.12,.3,.43,.56,.72,.9,1]){
    const points=api.snapshot(id,t).joints;
    for(const [joint,expected] of anchors){
      assert.ok(distance(points[joint],expected)<0.001,id+' foot anchor at '+t+' for '+joint);
    }
  }
}
elements.get('library').children[4].events.click();
assert.equal(elements.get('movement-title').textContent,'Acceleration start');
elements.get('play').events.click();
callback(1000);callback(1500);callback(2000);
assert.match(elements.get('phase-hint').textContent,/Playing|Paused/);
console.log('Physical motion POC: 5 movement definitions, 35 frame samples, planted foot anchors, fixed segment geometry, SVG startup and reduced-motion checks PASS');
