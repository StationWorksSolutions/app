/* Galaxy curriculum review experience. Draft tactical art is NOT validated instructional media. */
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.GalaxyCurriculumExperience=api;
})(typeof window!=='undefined'?window:null,function(root){
'use strict';
var domainNames={GI:'Game IQ',TM:'Ball mastery',AT:'Attacking',DF:'Defending',PI:'Positions',TT:'Team tactics',TR:'Transitions',MA:'Match analysis'};
var pilot={
'GI-001':{
  id:'GI-001',title:'Look before the pass arrives',concept:'Scanning before receiving',minutes:8,
  why:'A useful look before the pass tells you where pressure and support are coming from.',
  cues:['Look while the ball is away.','Find one defender and one teammate.','Get your eyes back to the ball before it arrives.'],
  watch:'Find the moment when the receiver can safely check over their shoulder.',
  steps:['The passer has the ball. The receiver can see support but cannot see a defender behind.','As the pass begins, the receiver checks their shoulder for pressure.','Pressure arrives from behind. A safe return is available; turning is no longer automatic.'],
  question:'A defender is tight behind you. Your teammate is facing forward and free. What would you try?',
  choices:[
    {title:'Protect and set it back',reason:'Often the safer choice when pressure is tight and a supporting teammate can face forward.'},
    {title:'Turn into the open side',reason:'Can work if the new scan shows enough space and the defender cannot reach the first touch.'}],
  equipment:'Ball, safe wall or partner, 2 cones',setup:'Two exit gates about 2 steps apart, 3–5 meters from a wall or passing partner.',
  reps:'2 rounds of 6 passes, alternating the gate',drill:'Before each pass arrives, look toward both gates. Receive through the available gate or return the ball if both are blocked.',
  error:'Looking without identifying anything, or scanning as the ball reaches the foot.',
  easier:'Use fixed gates and a slow predictable pass.',harder:'Partner calls or moves to block a gate before the ball arrives.',
  apply:'Before a match receive, locate one opponent and one safe pass.',evidence:'Tell your coach which scan changed a turn, pass or protective touch.',
  reflection:'Did a new scan change your action, or did you follow your first idea?',
  frames:[{ball:[86,118],players:[[86,118,'P'],[185,135,'R'],[205,72,'S'],[210,170,'D']]},
    {ball:[136,125],players:[[86,118,'P'],[185,135,'R'],[205,72,'S'],[194,165,'D']],pass:[[95,119],[179,133]],scan:[185,135]},
    {ball:[174,133],players:[[86,118,'P'],[185,135,'R'],[205,72,'S'],[191,158,'D']],pass:[[182,136],[98,120]]}]
},
'TM-005':{
  id:'TM-005',title:'Cushion a rolling ball',concept:'Controlling first touch',minutes:8,
  why:'A first touch should leave the ball close enough to make the next decision.',
  cues:['Track the ball into your receiving area.','Meet it with a relaxed, controlled surface.','Set the touch where your second action can happen.'],
  watch:'Notice how the first touch sets up the next pass, not simply stops the ball.',
  steps:['A gentle rolling pass comes toward the receiver.','The receiver controls the ball into a small safe area.','The next pass is available without chasing a heavy first touch.'],
  question:'The ball arrives quickly and a defender is approaching. What first-touch size is useful?',
  choices:[
    {title:'Small touch toward a safe side',reason:'Better when the defender is near and control or a return pass matters.'},
    {title:'Long touch into open space',reason:'Can be useful if you have scanned, the lane is truly open and the defender cannot close it.'}],
  equipment:'Ball, safe wall or partner, 2 cones',setup:'Mark a 1-meter receiving square roughly 4 meters from a wall or partner.',
  reps:'2 rounds of 8 controlled receives, alternate feet',drill:'Pass gently, cushion the return inside the square, then make a controlled second pass.',
  error:'A stiff first touch that bounces beyond the next playable step.',
  easier:'Slow the pass and widen the square.',harder:'Partner varies passing pace slightly; keep the ball in control.',
  apply:'In training, find one first touch that allows an immediate useful next action.',evidence:'Describe the direction and distance of your touch and whether you could pass again.',
  reflection:'Did the touch prepare your next play, or did you need a rescue touch?',
  frames:[{ball:[93,133],players:[[82,133,'P'],[184,133,'R'],[215,170,'D']]},
    {ball:[164,133],players:[[82,133,'P'],[184,133,'R'],[215,170,'D']],pass:[[93,133],[178,133]]},
    {ball:[194,111],players:[[82,133,'P'],[184,133,'R'],[215,170,'D']],pass:[[194,111],[220,90]]}]
},
'TM-006':{
  id:'TM-006',title:'Receive across the body',concept:'Body shape and directional first touch',minutes:8,
  why:'A well-chosen first touch opens your next passing lane when the defender leaves space.',
  cues:['Look for pressure before opening up.','Shape your body toward the playable lane.','Receive across and away only if the lane stays safe.'],
  watch:'Which defender position makes turning helpful, and when would a set-back be safer?',
  steps:['The passer sends the ball toward a player facing sideways to see two options.','The receiver checks pressure and identifies the free lane on the opposite side.','A directional touch moves into that lane; a nearby defender would change the choice.'],
  question:'The defender blocks the far-side exit as the ball arrives. Do you still open across?',
  choices:[
    {title:'Protect and use the supporting pass',reason:'A safe adjustment if the far lane has closed. Do not open into pressure.'},
    {title:'Move across the defender',reason:'Possible only if the defender is late and you can keep the ball protected; not a fixed rule.'}],
  equipment:'Ball, wall or partner, 3 cones',setup:'Make a central receiving gate and two exit gates, 1.5 meters to either side.',
  reps:'2 rounds of 6 receives, vary the exit side',drill:'Check the side, receive across the body toward the open gate, and play a second pass. Reset if the lane is blocked.',
  error:'Opening the body automatically without checking the defender; letting the touch travel too far.',
  easier:'Start with no defender and a stationary open gate.',harder:'Partner points to the closing side before the receive; choose across or return.',
  apply:'Receive sideways once and use a deliberate first touch to find a forward-facing option.',evidence:'Explain where pressure was and why the chosen touch helped your second action.',
  reflection:'Would an open first touch or a return pass have been safer in that moment?',
  frames:[{ball:[102,145],players:[[82,145,'P'],[171,130,'R'],[226,153,'D'],[236,75,'S']]},
    {ball:[147,135],players:[[82,145,'P'],[171,130,'R'],[226,153,'D'],[236,75,'S']],pass:[[94,142],[166,130]],scan:[171,130]},
    {ball:[188,101],players:[[82,145,'P'],[171,130,'R'],[226,153,'D'],[236,75,'S']],pass:[[181,112],[229,79]]}]
}};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]})}
function catalog(){return root&&Array.isArray(root.GalaxyCurriculumCatalog)?root.GalaxyCurriculumCatalog:[]}
function safeName(l){return domainNames[l.domainCode]||l.domainCode}
function roadmapHTML(query,domain,browseOpen){
  var all=catalog(),q=String(query||'').trim().toLowerCase(),d=domain||'all';
  var filtered=all.filter(function(l){return (d==='all'||d===l.domainCode)&&(!q||[l.title,l.objective,l.id,l.subdomain].join(' ').toLowerCase().includes(q))});
  filtered.sort(function(a,b){return a.sequenceRank-b.sequenceRank});
  var shown=filtered.slice(0,8);
  return '<section class="curriculum-surface" aria-label="Curriculum roadmap">'+
   '<div class="curriculum-lead"><p class="eyebrow">NEXT CURRICULUM / REVIEW PREVIEW</p><h2>Learn what to see. Then use it.</h2>'+
   '<p>250 sequenced learning objectives. Drafts are visible for planning, but cannot earn completion or mastery until reviewed.</p>'+
   '<div class="curriculum-track">'+['GI-001','TM-005','TM-006'].map(function(id,i){
     var l=pilot[id];return '<button type="button" class="curriculum-pilot" data-action="curriculum-open" data-id="'+id+'"><span>'+('0'+(i+1)).slice(-2)+' · STORYBOARD</span><strong>'+esc(l.title)+'</strong><small>'+esc(l.concept)+'</small></button>';
   }).join('')+'</div></div>'+
   '<details class="curriculum-browse" '+(browseOpen?'open':'')+'><summary>Explore the 250-lesson roadmap</summary>'+
   '<form class="curriculum-query" id="curriculumSearchForm"><input name="query" aria-label="Search curriculum objectives" placeholder="Search passing, pressing, winger..." value="'+esc(query||'')+'" maxlength="100"><button class="button">Search</button></form>'+
   '<label class="curriculum-filter">Area <select id="curriculumDomain">'+
     '<option value="all">All areas</option>'+Object.keys(domainNames).map(function(k){return '<option value="'+k+'" '+(d===k?'selected':'')+'>'+esc(domainNames[k])+'</option>'}).join('')+'</select></label>'+
   '<p class="caption">'+filtered.length+' of '+all.length+' objectives. Every entry below is draft metadata.</p>'+
   '<div class="curriculum-result-list">'+shown.map(function(l){
     return '<div class="curriculum-result"><div><small>'+esc(safeName(l))+' · '+esc(l.level)+' · '+esc(l.id)+'</small><b>'+esc(l.title)+'</b><p>'+esc(l.objective)+'</p></div>'+
     (pilot[l.id]?'<button type="button" data-action="curriculum-open" data-id="'+l.id+'" class="button">Review draft</button>':'<span class="curriculum-pending">Media pending</span>')+
     '</div>';
   }).join('')+'</div>'+(filtered.length>8?'<p class="caption">Showing the first eight matching objectives. Refine your search for more.</p>':'')+
   '</details></section>';
}
function frameSVG(l,index){
  var f=l.frames[Math.max(0,Math.min(index,l.frames.length-1))],palette={P:'#4e88ff',R:'#4e88ff',D:'#a375ec',S:'#4e88ff'};
  var lines=(f.pass||[]).length===2?'<path d="M'+f.pass[0].join(' ')+' L'+f.pass[1].join(' ')+'" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" fill="none" marker-end="url(#carrow)"/>':'';
  var actors=f.players.map(function(p){
    var enemy=p[2]==='D';return '<g><circle cx="'+p[0]+'" cy="'+p[1]+'" r="15" fill="'+palette[p[2]]+'" stroke="#f9fbff" stroke-width="2"/><text x="'+p[0]+'" y="'+(p[1]+5)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">'+p[2]+'</text></g>';
  }).join('');
  var scan=f.scan?'<circle cx="'+f.scan[0]+'" cy="'+f.scan[1]+'" r="29" stroke="#ffbf69" stroke-width="2" stroke-dasharray="5 5" fill="none"/>':'';
  return '<svg viewBox="0 0 310 245" role="img" aria-label="'+esc(f.steps||l.steps[index])+'">'+
   '<defs><marker id="carrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="#fff"/></marker></defs>'+
   '<rect x="10" y="10" width="290" height="225" rx="6" fill="#183c48" stroke="#638997" stroke-width="2"/>'+
   '<path d="M155 10V235 M10 122H300" stroke="#b8ced4" stroke-width="1.5" opacity=".4"/>'+
   '<circle cx="155" cy="122" r="43" stroke="#b8ced4" fill="none" opacity=".35"/>'+
   actors+scan+lines+'<circle cx="'+f.ball[0]+'" cy="'+f.ball[1]+'" r="5" fill="#fff" stroke="#122034" stroke-width="2"/></svg>';
}
function lessonHTML(id,phase,frame,choice,revealed){
  var l=pilot[id];if(!l)return '<p>Draft unavailable.</p>';
  var step=['Watch','Practice','Apply'][phase]||'Watch';
  var head='<div class="curriculum-session"><p class="eyebrow">'+esc(l.id)+' · '+esc(l.minutes)+' MIN · COACH REVIEW PENDING</p><h2>'+esc(l.title)+'</h2>'+
   '<p>'+esc(l.why)+'</p><div class="curriculum-steps">'+['Watch','Practice','Apply'].map(function(s,i){
     return '<span class="'+(i===phase?'is-current':'')+'">'+(i+1)+'. '+s+'</span>';
   }).join('')+'</div>';
  var foot='<p class="curriculum-warning">Review prototype only. This is not verified coaching media, and no player progress is being recorded.</p></div>';
  if(step==='Watch'){
    var idx=Math.max(0,Math.min(2,frame));
    return head+'<div class="curriculum-visual">'+frameSVG(l,idx)+'<div class="curriculum-frame-actions"><button class="button" data-action="curriculum-frame" data-step="-1" '+(idx===0?'disabled':'')+'>Previous</button><span>'+ (idx+1) +' / 3</span><button class="button" data-action="curriculum-frame" data-step="1" '+(idx===2?'disabled':'')+'>Next</button></div></div>'+
     '<p class="curriculum-scene">'+esc(l.steps[idx])+'</p><p class="caption">Original storyboard draft; full-motion instructional video has not been produced.</p>'+
     '<div class="curriculum-cues"><h3>Look for this</h3>'+l.cues.map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div>'+
     '<h3>What do you notice?</h3><p>'+esc(l.watch)+'</p><div class="curriculum-decision"><h3>Choose your next action</h3><p>'+esc(l.question)+'</p>'+
     l.choices.map(function(c,i){return '<button type="button" class="'+(choice===String(i)?'chosen':'')+'" data-action="curriculum-choice" data-choice="'+i+'">'+esc(c.title)+'</button>'}).join('')+
     (revealed?'<div role="status" class="curriculum-rationale">'+l.choices.map(function(c){return '<p><b>'+esc(c.title)+':</b> '+esc(c.reason)+'</p>'}).join('')+'</div>':
     '<button class="button" data-action="curriculum-reveal" '+(choice===''?'disabled':'')+'>Compare decisions</button>')+'</div>'+foot;
  }
  if(step==='Practice')return head+
    '<div class="curriculum-practice"><p class="eyebrow">FIELD DRILL · '+esc(l.reps)+'</p><h3>'+esc(l.concept)+'</h3><p>'+esc(l.drill)+'</p>'+
    '<p><b>Setup:</b> '+esc(l.setup)+'</p><p><b>Equipment:</b> '+esc(l.equipment)+'</p>'+
    '<p><b>Avoid:</b> '+esc(l.error)+'</p><p><b>Easier:</b> '+esc(l.easier)+'</p><p><b>Harder:</b> '+esc(l.harder)+'</p></div>'+foot;
  return head+'<div class="curriculum-apply"><p class="eyebrow">MATCH CHALLENGE</p><h3>'+esc(l.apply)+'</h3>'+
    '<p><b>Look for:</b> '+esc(l.evidence)+'</p><p><b>Afterward:</b> '+esc(l.reflection)+'</p>'+
    '<p class="caption">When approved and published, match evidence and scheduled reviews will be tracked separately from lesson completion.</p></div>'+foot;
}
return {domainNames:domainNames,roadmapHTML:roadmapHTML,lessonHTML:lessonHTML,pilotIds:Object.keys(pilot),
  pilot:pilot,catalog:catalog};
});
