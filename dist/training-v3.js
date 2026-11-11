/* Galaxy Training unified app: one navigation, one player store, three learning paths. */
(function(){
'use strict';
var source=window.GALAXY_CONTENT;
var curriculumSearch='',curriculumDomain='all',curriculumBrowseOpen=false,curriculumId='',curriculumPhase=0,curriculumFrame=0,curriculumChoice='',curriculumRevealed=false;
var root=document.getElementById('app');
if(!root||!source||!Array.isArray(source.lessons)){if(root)root.innerHTML='<main class="error">Unable to load the training library. Reload the page.</main>';return;}
var KEY='galaxy-training-unified-v3',LEGACY='galaxy-training-v1';
function parse(json){try{return JSON.parse(json)}catch(e){return null}}
var legacy=null;try{legacy=parse(localStorage.getItem(LEGACY))}catch(e){}
var stored=null;try{stored=parse(localStorage.getItem(KEY))}catch(e){}
var state=stored&&stored.schema===3?stored:{
 schema:3,names:(legacy&&Array.isArray(legacy.names)?legacy.names.slice(0,2):['Jay','James']),
 active:0,format:['11','9'],level:[0,0],lessons:{},drills:{},workouts:{},logs:{},settings:{}
};
if(!Array.isArray(state.names))state.names=['Jay','James'];
while(state.names.length<2)state.names.push('Player '+(state.names.length+1));
['lessons','drills','workouts','logs','settings'].forEach(function(k){if(!state[k]||typeof state[k]!=='object')state[k]={}});
if(!Array.isArray(state.format))state.format=['11','9'];
if(!Array.isArray(state.level))state.level=[0,0];
while(state.format.length<state.names.length)state.format.push('11');
while(state.level.length<state.names.length)state.level.push(0);
var queryPlayer=Number(new URLSearchParams(location.search).get('player'));
var player=queryPlayer>=1&&queryPlayer<=state.names.length?queryPlayer-1:(state.active>=0&&state.active<state.names.length?state.active:0);
var page='home',overlay=null,phase=0,frame=0,revealed=false,lessonId='',track='first',workoutMode='build';
var core=window.GalaxyCore?window.GalaxyCore.createRuntime(localStorage,state):null,coreSessionId=null;
function corePlayer(){return core?(core.profiles()[player]||{}).id:null}
function activateCore(module,id){
 if(!core)return 0;
 var old=core.resumable(corePlayer(),module,id);
 if(!old){old=core.createSession({playerId:corePlayer(),module:module,contentId:id,contentVersion:1});core.transition(old.id,'in_progress')}
 else if(old.status==='paused')core.transition(old.id,'in_progress');
 coreSessionId=old.id;return old.cursor;
}
function saveCoreCursor(cursor){if(core&&coreSessionId){var s=core.getState().sessions[coreSessionId];if(s&&s.status==='in_progress')core.setCursor(coreSessionId,cursor)}}
function completeCore(module){
 if(core&&coreSessionId){var s=core.getState().sessions[coreSessionId];if(s&&s.status==='in_progress'){core.transition(coreSessionId,'completed');if(module==='lesson')core.transition(coreSessionId,'awaiting_match_application')}}
}
var drillTrack='',drillIndex=0,workoutIndex=0,partner=false,queryStatus='',decisionDraft='',notesDraft='',lastActiveButton=null;
var tracks=[
 {id:'first',title:'First touch & passing',desc:'Receive, look up, connect. Keep both feet involved.',ids:['scan','touch','pass','bodyshape']},
 {id:'wide',title:'Winger decisions',desc:'Beat, combine, overlap, and deliver with a purpose.',ids:['dribble','widechoice','overlap','cross']},
 {id:'finish',title:'Create a chance',desc:'Read the passer, find separation, finish under control.',ids:['runs','strikercheck','blindside','finish']},
 {id:'defend',title:'Defend with a partner',desc:'Slow the attack, guide play, protect cover.',ids:['defend','cover','pressangle','trackrunner']},
 {id:'control',title:'Ball control & turns',desc:'Protect the ball, turn into space, reset the play.',ids:['touch','shield','turn','reset']}
];
var moves={
 'Squat to a chair':{reps:'8',cue:'Sit back toward a stable chair and stand tall. Knees track over feet.',avoid:'Collapsing inward or dropping into the chair.',demo:'squat'},
 'Supported split squat':{reps:'6 each leg',cue:'Hold a stable support. Keep your front foot planted; lower slowly.',avoid:'Rushing the balance or bouncing.',demo:'split'},
 'Glute bridge':{reps:'10',cue:'Press through your feet and lift hips without arching the back.',avoid:'Pushing through your lower back.',demo:'bridge'},
 'Calf raise':{reps:'12',cue:'Rise slowly, pause, lower under control. Keep an easy hand support.',avoid:'Bouncing through the ankle.',demo:'calf'},
 'Dumbbell floor press':{reps:'8',cue:'Use light, controlled weight with an adult. Keep wrists steady.',avoid:'Max lifts or forcing a range.',demo:'press'},
 'Incline push-up':{reps:'6–10',cue:'Use a sturdy surface. Make one straight line from head to heel.',avoid:'Sagging at the hips.',demo:'push'},
 'Supported one-arm row':{reps:'8 each side',cue:'Brace with your free hand and draw elbow toward your back pocket.',avoid:'Twisting your trunk to lift the weight.',demo:'row'},
 'Dead bug heel taps':{reps:'8 each side',cue:'Keep your ribs quiet while one heel lowers toward the floor.',avoid:'Raising the lower back off the floor.',demo:'deadbug'},
 'Suitcase hold':{reps:'15 seconds each side',cue:'Stand tall and breathe with a light weight on one side.',avoid:'Leaning or holding your breath.',demo:'suitcase'},
 'Single-leg balance':{reps:'20 seconds each side',cue:'Fix eyes on one spot; soften your standing knee. Use a wall if needed.',avoid:'Turning this into a hopping contest.'},
 'Band lateral walk':{reps:'8 steps each direction',cue:'Keep steps small and knees aligned. Use light band tension.',avoid:'Dragging feet or letting knees cave in.'},
 'Wall march':{reps:'8 each side',cue:'Lean gently into a wall, lift one knee, and pause without arching.',avoid:'Hurrying or losing posture.'},
 'Hip hinge practice':{reps:'10',cue:'Push hips back with a long spine. Practice unloaded first.',avoid:'Rounding to reach farther.'},
 'Band pull-apart':{reps:'10',cue:'Use a light band, relax shoulders, and pull apart smoothly.',avoid:'Shrugging or snapping the band.'},
 'Side plank (knees)':{reps:'15 seconds each side',cue:'From knees and elbow, lift hips into one straight line.',avoid:'Letting the shoulder collapse.'}
};
var plans=[
 ['Squat to a chair','Supported split squat','Dumbbell floor press','Supported one-arm row','Glute bridge','Calf raise','Dead bug heel taps','Suitcase hold','Band lateral walk','Single-leg balance'],
 ['Hip hinge practice','Supported split squat','Incline push-up','Supported one-arm row','Glute bridge','Calf raise','Side plank (knees)','Suitcase hold','Wall march','Band pull-apart'],
 ['Squat to a chair','Band lateral walk','Dumbbell floor press','Supported one-arm row','Hip hinge practice','Single-leg balance','Dead bug heel taps','Calf raise','Wall march','Band pull-apart'],
 ['Supported split squat','Squat to a chair','Incline push-up','Supported one-arm row','Glute bridge','Band lateral walk','Side plank (knees)','Single-leg balance','Hip hinge practice','Wall march']
];
var easy=['Squat to a chair','Hip hinge practice','Glute bridge','Single-leg balance','Dead bug heel taps','Wall march','Band pull-apart','Calf raise'];
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function safeUrl(url){return typeof url==='string'&&/^https:\/\//.test(url)?esc(url):''}
function persist(){state.active=player;try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){queryStatus='This browser is not saving progress. Export a backup before leaving.'}if(core){core.syncLegacyNames(state);core.selectPlayer(corePlayer())}}
function trackById(id){return tracks.find(function(t){return t.id===id})||tracks[0]}
function lessonKey(id){return player+'|'+state.format[player]+'|'+id}
function progress(id){var k=lessonKey(id);return state.lessons[k]||(state.lessons[k]={})}
function completeCount(){return source.lessons.filter(function(l){return !!progress(l.id).applied}).length}
function drillKey(id){return player+'|'+today()+'|'+id}
function drillRecord(id){var k=drillKey(id);return state.drills[k]||(state.drills[k]={done:[]})}
function workoutKey(){return player+'|'+today()}
function workoutRecord(){return state.workouts[workoutKey()]||null}
function statLine(){var wd=workoutRecord();var entries=Object.keys(state.drills).filter(function(k){return k.indexOf(player+'|')===0&&state.drills[k].done&&state.drills[k].done.length});return '<div class="row"><div class="stat"><strong>'+completeCount()+' / 36</strong> concepts tried</div><span class="chip">'+entries.length+' drill sessions logged</span><span class="chip">'+(wd?'Workout '+(isWorkoutDone(wd)?'complete':'saved'):'No workout started today')+'</span></div>'}
function navHTML(){
 return '<header class="sitehead"><div class="topbar"><button class="brand" data-action="home">GALAXY <b>/ TRAINING</b></button><label class="player-wrap"><span>PLAYER</span><select aria-label="Choose player" id="playerSelect">'+state.names.map(function(n,i){return '<option value="'+i+'" '+(i===player?'selected':'')+'>'+esc(n)+'</option>'}).join('')+'</select></label></div></header>'+
 '<nav class="topnav" aria-label="Primary">'+[['home','Today'],['learn','Learn'],['train','Train'],['progress','Progress']].map(function(a){var selected=page===a[0]||(a[0]==='train'&&(page==='drills'||page==='workout'));return '<button data-action="nav" data-path="'+a[0]+'" '+(selected?'aria-current="page"':'')+'>'+a[1]+'</button>'}).join('')+'</nav>';
}

function recommended(){
 return core?core.recommend(corePlayer(),today(),source.lessons.map(function(l){return {id:l.id,title:l.title}})):
  {kind:'new',contentId:source.lessons[0].id,label:'Start your lesson',reason:'Watch, practice and apply'};
}
function homeHTML(){
 var r=recommended(),l=source.byId[r.contentId],title=l?l.title:r.label,action='';
 if(r.kind==='new'||r.kind==='review')action='<button class="primary next-action" data-action="lesson" data-id="'+esc(r.contentId)+'">'+(r.kind==='review'?'Review':'Start session')+' →</button>';
 if(r.kind==='resume')action='<button class="primary next-action" data-action="resume-core" data-id="'+esc(r.sessionId)+'">Resume session →</button>';
 if(r.kind==='scheduled')action='<button class="primary next-action" data-action="nav" data-path="log">Log activity →</button>';
 return '<section class="journey"><p class="eyebrow">TODAY / '+esc(state.names[player])+'</p><h1>One clear next step.</h1>'+
 '<div class="next-panel"><p class="eyebrow">'+esc(r.kind==='scheduled'?'TEAM ACTIVITY':r.kind==='recovery'?'RECOVERY':r.kind==='finished'?'FINISHED':'YOUR DEVELOPMENT FOCUS')+'</p>'+
 '<h2>'+esc(title)+'</h2><p>'+esc(r.reason||'Watch, practice, apply.')+'</p>'+action+'</div>'+
 '<p class="caption">'+(r.finishedForToday?'You are finished for today.':'One session at a time. You decide when to continue.')+'</p>'+
 '<details class="journey-extra"><summary>Optional activities</summary><button data-action="nav" data-path="train">Browse training</button> <button data-action="nav" data-path="log">Log a match or practice</button> <button data-action="settings">Profiles and backup</button></details></section>';
}
function trainHTML(){
 return '<section class="intro"><p class="eyebrow">TRAIN</p><h1>Practice with purpose.</h1><p class="lead">Choose a training type, or return to Today for your recommendation.</p></section>'+
 '<div class="training-choices"><button class="listcard" data-action="nav" data-path="drills"><span class="meta">FIELD</span><h2>Soccer drills</h2><span>Ball work and decisions →</span></button>'+
 '<button class="listcard" data-action="nav" data-path="workout"><span class="meta">PHYSICAL</span><h2>Workouts</h2><span>Technique review in progress →</span></button></div>';
}
function progressHTML(){
 var prefix=player+'|',keys=Object.keys(state.lessons).filter(function(k){return k.indexOf(prefix)===0});
 var seen=keys.filter(function(k){return !!state.lessons[k].seen}).length,applied=keys.filter(function(k){return !!state.lessons[k].applied}).length;
 var drills=Object.keys(state.drills).filter(function(k){return k.indexOf(prefix)===0&&state.drills[k].done&&state.drills[k].done.length}).length;
 var workouts=Object.keys(state.workouts).filter(function(k){return k.indexOf(prefix)===0&&isWorkoutDone(state.workouts[k])}).length;
 var info=core?core.sessionSummary(corePlayer()):{awaitingMatch:0,readyForReview:0};
 return '<section class="intro"><p class="eyebrow">PROGRESS</p><h1>Your development.</h1><p class="lead">Participation is not the same as demonstrated skill competency.</p></section>'+
 '<div class="progress-grid">'+[[seen,'Concepts explored'],[applied,'Ideas practiced'],[drills,'Drill sessions'],[workouts,'Workouts completed']].map(function(x){return '<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>'}).join('')+'</div>'+
 '<section class="panel"><h2>What comes next?</h2><p>'+info.awaitingMatch+' ideas awaiting match application · '+info.readyForReview+' ready for review</p>'+
 '<p class="caption">A practice checkbox does not award mastery.</p><button class="button" data-action="nav" data-path="log">Record field application</button></section>';
}
function logHTML(){
 return '<section class="intro"><p class="eyebrow">FIELD NOTES</p><h1>Log activity.</h1></section>'+
 '<form id="logForm" class="panel"><label class="field">Activity<select name="kind"><option>Practice</option><option>Game</option><option>Futsal</option></select></label>'+
 '<label class="field">One thing you noticed<textarea name="note" maxlength="400"></textarea></label>'+
 '<label class="toggle"><input type="checkbox" name="applied"> I tried an idea from training</label><button class="primary">Save activity</button></form>';
}
function finishHTML(){
 var next=recommended();
 return '<section class="journey"><p class="eyebrow">SESSION COMPLETE</p><h1>Progress recorded.</h1><div class="next-panel"><h2>Finished this session.</h2>'+
 '<p>Your activity was recorded. Match application and competency are separate.</p><p>'+esc(next.finishedForToday?'Training is finished for today.':'Next: '+next.label)+'</p>'+
 '<button class="primary next-action" data-action="nav" data-path="home">Back to Today →</button></div></section>';
}

function learnHTML(){
 var n=Math.max(0,Math.min(5,Number(state.level[player])||0)),level=source.levels[n];
 return '<section class="intro"><p class="eyebrow">LEARN / GAME IQ</p><h1>Think before you play.</h1><p class="lead">36 situations across six levels. Each card asks you to notice, choose, and apply an idea. Lessons are always open.</p></section>'+
 (window.GalaxyCurriculumExperience?window.GalaxyCurriculumExperience.roadmapHTML(curriculumSearch,curriculumDomain,curriculumBrowseOpen):'')+
  '<div class="option-row" aria-label="Learning levels">'+source.levels.map(function(l,i){return '<button data-action="level" data-index="'+i+'" aria-pressed="'+(i===n)+'">'+(i+1)+'. '+esc(l[0])+'</button>'}).join('')+'</div>'+
 '<section class="panel"><p class="eyebrow">LEVEL '+(n+1)+'</p><div class="split"><div><h2>'+esc(level[0])+'</h2><p>'+esc(level[1])+'</p></div><label class="field">Game format<select id="formatSelect"><option value="9" '+(state.format[player]==='9'?'selected':'')+'>9v9</option><option value="11" '+(state.format[player]==='11'?'selected':'')+'>11v11</option></select></label></div>'+
 '<div class="progressline"><span style="width:'+Math.round(level[2].filter(function(id){return !!progress(id).applied}).length/6*100)+'%"></span></div><p class="caption">Practice markers are self-reported, not assessed soccer mastery.</p></section>'+
 '<div class="lesson-list">'+level[2].map(function(id){var l=source.byId[id];if(!l)return '';var p=progress(id),status=p.applied?'Practiced':p.seen?'Explored':'New';return '<button class="listcard" data-action="lesson" data-id="'+esc(id)+'"><span class="meta">'+esc(l.category)+' · '+status+'</span><h3>'+esc(l.title)+'</h3><p>'+esc((l.cues||[])[0]||l.why)+'</p><span class="go">Open lesson →</span></button>'}).join('')+'</div>';
}
function drillsHTML(){
 return '<section class="intro"><p class="eyebrow">DRILLS / BALL LAB</p><h1>Train with a reason.</h1><p class="lead">Choose a focused session, then work through one full-screen drill at a time.</p></section>'+
 '<section class="panel"><h3>Ask for a session</h3><p class="muted">Describe a goal, such as “first touch and passing” or “winger moves.” We match it to the existing coached library; this is not an AI coach.</p><form id="planForm" class="promptline"><input id="planText" name="request" maxlength="160" aria-label="Describe a training goal" placeholder="I want to work on first touch and passing"><button class="primary" type="submit">Find a session</button></form>'+ (queryStatus?'<div class="notice" role="status">'+esc(queryStatus)+'</div>':'')+'</section>'+
 '<div class="drill-list">'+tracks.map(function(t){var p=state.drills[drillKey(t.id)];var n=p&&p.done?p.done.length:0;return '<button class="listcard" data-action="drill" data-id="'+t.id+'"><span class="meta">'+t.ids.length+' DRILLS · '+(n?n+' SAVED TODAY':'SOLO OR PARTNER')+'</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.desc)+'</p><span class="go">'+(n?'Continue session':'Start session')+' →</span></button>'}).join('')+'</div>';
}
function workoutPlan(mode){
 var date=today(),dayNum=Math.floor(Date.parse(date+'T12:00:00Z')/86400000),base=plans[((dayNum+player)%plans.length+plans.length)%plans.length];
 return mode==='technique'?easy.slice():base.slice();
}
function createWorkout(mode){
 var k=workoutKey();if(state.workouts[k])return state.workouts[k];
 var w={date:today(),mode:mode,items:workoutPlan(mode),checks:{},created:new Date().toISOString(),finished:null};
 state.workouts[k]=w;persist();return w;
}
function slotsFor(w,index){var name=w.items[index],sets=w.mode==='technique'?1:2,sides=/each (leg|side|direction)/.test(moves[name].reps);var out=[];for(var set=1;set<=sets;set++)(sides?['L','R']:['']).forEach(function(side){out.push(index+':'+set+':'+side)});return out}
function completedExercises(w){return w.items.filter(function(name,i){return slotsFor(w,i).every(function(k){return !!w.checks[k]})}).length}
function isWorkoutDone(w){return w&&completedExercises(w)===w.items.length}
function workoutHTML(){
 var past=Object.keys(state.workouts).filter(function(k){return k.indexOf(player+'|')===0}).length;
 return '<section class="intro"><p class="eyebrow">TRAIN / PHYSICAL</p><h1>Workouts temporarily unavailable.</h1>'+
 '<p class="lead">Exercise demonstrations are being reviewed for safe, age-appropriate technique. Do not follow the previous stick-figure illustrations. Independent workouts will return only after the movement demonstrations pass a qualified review.</p></section>'+
 '<section class="panel" role="status"><h2>Movement safety review</h2><p>Strength sessions cannot be started or resumed in this preview until verified instructional media is integrated.</p>'+
 '<p class="caption">'+past+' earlier workout record(s) remain saved on this device. Their progress has not been deleted.</p>'+
 '<p class="caption">Review-only: five experimental animated movements are available to inspect. They are not verified coaching instructions.</p>'+'<p><a class="button" href="./biomechanics-review.html" target="_blank" rel="noopener noreferrer">View five movement animations (review) ↗</a></p>'+'<button class="button" data-action="nav" data-path="train">Back to Train</button></section>';
}
function scheduleHTML(){
 if(!core)return '';
 var c=core.getState().schedule,id=corePlayer(),weekly=c.weekly[id]||[],dated=c.dated[id]||[];
 var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 var kinds='<option value="practice">Team practice</option><option value="futsal">Futsal</option><option value="match">Match</option><option value="recovery">Recovery</option><option value="none">Clear this day</option>';
 return '<details class="panel"><summary>Training calendar</summary><p class="caption">Scheduling changes recommendations without adding extra workouts. Add known dates; do not assume match dates.</p>'+
 '<p>'+esc(weekly.map(function(e){return days[e.day]+': '+e.kind}).join(' · ')||'No weekly activities set')+'</p>'+
 '<form id="weeklyScheduleForm"><label class="field">Day<select name="day">'+days.map(function(d,i){return '<option value="'+i+'">'+d+'</option>'}).join('')+'</select></label>'+
 '<label class="field">Activity<select name="kind">'+kinds+'</select></label><button class="button">Save weekly day</button></form>'+
 '<p>'+esc(dated.map(function(e){return e.date+': '+e.kind}).join(' · ')||'No dated activities set')+'</p>'+
 '<form id="datedScheduleForm"><label class="field">Date<input type="date" name="date" required></label>'+
 '<label class="field">Activity<select name="kind">'+kinds+'</select></label><button class="button">Save dated activity</button></form></details>';
}
function settingsHTML(){
 return '<section class="intro"><p class="eyebrow">PROFILE / BACKUP</p><h1>Family setup.</h1><p class="lead">These are profiles on one browser, not private user accounts.</p></section>'+
 '<section class="panel"><form id="settingsForm">'+state.names.map(function(n,i){return '<label class="field">Player '+(i+1)+' name<input name="name'+i+'" maxlength="35" value="'+esc(n)+'"></label>'}).join('')+'<p><button class="primary" type="submit">Save names</button></p></form><form id="addPlayerForm"><label class="field">Additional player<input name="name" maxlength="35" placeholder="Player name"></label><button class="button" type="submit">Add player</button></form></section>'+
 '<section class="panel"><h3>Move or back up progress</h3><p>Export a copy of v3 and core progress, plus archived Galaxy records. Importing may replace progress on this device; it does not provide cloud sync. Keep backups private.</p><div class="row"><button class="button" data-action="export">Export backup</button><label class="button">Import backup <input type="file" accept="application/json" id="importFile" style="max-width:170px"></label></div><p class="caption">An export may contain children’s names and notes; store it privately.</p></section>'+
 scheduleHTML()+'<section class="panel"><h3>Saved activity</h3>'+statLine()+'<p class="caption">Older sessions, if any, are preserved under their original browser key and included in exports, not silently counted as new sessions.</p></section>';
}
function render(){
 root.innerHTML=navHTML()+'<main class="shell">'+(page==='home'?homeHTML():page==='learn'?learnHTML():page==='train'?trainHTML():page==='progress'?progressHTML():page==='log'?logHTML():page==='finish'?finishHTML():page==='drills'?drillsHTML():page==='workout'?workoutHTML():settingsHTML())+'</main>'+(overlay?overlayHTML():'');
 document.body.style.overflow=overlay?'hidden':'';

}
function diagram(l){
 var m=source.plays[l.id];if(!m)return '<div class="notice">Use the question and coached explanation for this concept.</div>';
 frame=Math.max(0,Math.min(frame,m.frames.length-1));
 var players=JSON.parse(JSON.stringify(m.actors)),ball=m.frames[0].ball,f=m.frames[frame];
 for(var i=0;i<=frame;i++){Object.assign(players,m.frames[i].actors||{});if(m.frames[i].ball)ball=m.frames[i].ball}
 var arrows='';
 ['run','pass'].forEach(function(t){if(f[t]&&f[t].length>=2){var a=f[t],dash=t==='run'?'stroke-dasharray="6 5"':'';arrows+='<polyline points="'+a.map(function(p){return p.map(Number).join(',')}).join(' ')+'" fill="none" stroke="'+(t==='run'?'#cdaaff':'#69c8fa')+'" stroke-width="4" '+dash+' marker-end="url(#arrow)"/>'}});
 var actors=Object.keys(players).map(function(id){var xy=players[id],enemy=id==='D'||id==='E';return '<circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="15" stroke="#fff" stroke-width="2" fill="'+(enemy?'#8051d3':'#307cec')+'"/><text x="'+xy[0]+'" y="'+(xy[1]+5)+'" text-anchor="middle" fill="white" font-weight="800" font-size="14">'+esc(id)+'</text>'}).join('');
 return '<div class="pitch"><svg viewBox="0 0 300 240" role="img" aria-label="'+esc(f.text)+'"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#bcdbff" stroke-width="1.5"/></marker></defs><rect x="10" y="10" width="280" height="220" rx="8" fill="#194d60" stroke="#a5d5d4" stroke-width="2"/><path d="M10 120H290M115 10v45h70V10M115 230v-45h70v45" stroke="#8abdbf" stroke-width="1.2" fill="none" opacity=".7"/><circle cx="150" cy="120" r="35" fill="none" stroke="#8abdbf" opacity=".6"/>'+arrows+actors+'<circle cx="'+ball[0]+'" cy="'+ball[1]+'" r="5.8" fill="#fff" stroke="#172a54" stroke-width="1.8"/></svg><p class="diagram-caption">'+esc(f.text)+'</p></div>'+
 '<div class="diagram-control"><button class="button" data-action="frame" data-step="-1" '+(frame===0?'disabled':'')+' aria-label="Previous moment">←</button><span class="chip">'+(frame+1)+' / '+m.frames.length+'</span><button class="button" data-action="frame" data-step="1" '+(frame===m.frames.length-1?'disabled':'')+' aria-label="Next moment">→</button></div><p class="caption">Blue: teammates · Purple: defender · Dotted arrow: run · Solid arrow: pass. Illustrative example, not a required team shape.</p>';
}
function demo(l){
 var id=(l.video||[])[0],d=source.demos[id];var url=d&&safeUrl(d.url);
 return url?'<p><a href="'+url+'" target="_blank" rel="noopener noreferrer">Watch coaching demonstration ↗</a></p><p class="caption">'+esc(d.by||'Coaching resource')+' · '+esc(d.cue||'Look for the decision.')+'</p>':'';
}
function lessonHTML(){
 var l=source.byId[lessonId]||source.lessons[0],r=progress(l.id),stages=['Watch','Decide','Try'],title=stages[phase];
 var inner='';
 if(phase===0)inner='<p class="big-cue">'+esc((l.cues||[])[0]||l.why)+'</p>'+diagram(l)+'<details><summary>Why this matters</summary><p>'+esc(l.why)+'</p><p>'+esc(l.mistake||'')+'</p></details>'+demo(l);
 if(phase===1)inner='<div class="practice-steps"><p class="eyebrow">YOUR DECISION</p><h2>'+esc(l.scenario)+'</h2><p>Say what you would do, then reveal one coached answer.</p><label class="field">My thinking (optional)<textarea maxlength="500" id="decisionInput" placeholder="I would… because…">'+esc(decisionDraft||r.decision||'')+'</textarea></label><p><button class="button" data-action="reveal">'+(revealed?'Coaching answer shown':'Reveal coaching answer')+'</button></p>'+(revealed?'<div class="answer"><strong>One useful response</strong><p>'+esc(l.answer)+'</p><p class="caption">A different action can also work if the game cues support it.</p></div>':'')+'</div>';
 if(phase===2)inner='<div class="practice-steps"><h2>Try the idea.</h2><p class="big-cue">'+esc((l.cues||[])[0]||l.title)+'</p><div class="option-row"><button data-action="partner" data-mode="solo" aria-pressed="'+(!partner)+'">Solo</button><button data-action="partner" data-mode="partner" aria-pressed="'+partner+'">With a partner</button></div><p>'+esc(partner?l.duo:l.solo)+'</p><details><summary>Make it more game-like</summary><p>'+esc(l.pressure||'Add a passive defender when the movement is controlled.')+'</p></details><label class="field">What did I notice? (optional)<textarea maxlength="500" id="applicationInput" placeholder="What was different when I tried it?">'+esc(notesDraft||r.example||'')+'</textarea></label><label class="toggle"><input id="appliedCheck" type="checkbox" '+(r.applied?'checked':'')+'> I practiced this idea</label><p class="caption">This marker records your report, not proof of mastery.</p></div>';
 return '<p class="eyebrow">'+esc(l.category)+' / '+title.toUpperCase()+'</p><h1>'+esc(l.title)+'</h1><div class="option-row">'+stages.map(function(s,i){return '<button data-action="phase" data-phase="'+i+'" aria-pressed="'+(i===phase)+'">'+(i+1)+'. '+s+'</button>'}).join('')+'</div>'+inner;
}
function drillHTML(){
 var t=trackById(drillTrack),id=t.ids[drillIndex],l=source.byId[id],r=drillRecord(t.id),done=r.done.indexOf(id)>=0;
 return '<p class="eyebrow">'+esc(t.title)+' / '+(drillIndex+1)+' OF '+t.ids.length+'</p><h1>'+esc(l.title)+'</h1><p class="big-cue">'+esc((l.cues||[])[0]||l.title)+'</p><div class="metrics"><span>2–4 quality rounds</span><span>Short rest as needed</span></div><div class="practice-steps"><div class="option-row"><button data-action="partner" data-mode="solo" aria-pressed="'+(!partner)+'">Solo</button><button data-action="partner" data-mode="partner" aria-pressed="'+partner+'">With a partner</button></div><p>'+esc(partner?l.duo:l.solo)+'</p><p class="caption">Start slowly, then add movement or gentle pressure once the decision stays clear.</p><details><summary>Why this drill</summary><p>'+esc(l.why)+'</p><p>'+esc(l.mistake||'')+'</p></details>'+demo(l)+'</div><label class="toggle"><input type="checkbox" id="drillCheck" '+(done?'checked':'')+'> Practiced this drill today</label>';
}
function workoutHTMLCard(){return '<section role="alert"><h2>Workout demonstration unavailable</h2><p>Independent exercise instruction is suspended until approved movement media is integrated.</p></section>';}
function overlayHTML(){
 var mode=overlay,heading=mode==='curriculum'?'CURRICULUM / REVIEW DRAFT':mode==='lesson'?'LEARN / GAME IQ':mode==='drill'?'DRILLS / BALL LAB':'WORKOUT / MOVEMENT';
 var body=mode==='curriculum'&&window.GalaxyCurriculumExperience?window.GalaxyCurriculumExperience.lessonHTML(curriculumId,curriculumPhase,curriculumFrame,curriculumChoice,curriculumRevealed):mode==='lesson'?lessonHTML():mode==='drill'?drillHTML():workoutHTMLCard();
 var footer='';
 if(mode==='curriculum')footer='<button class="button" data-action="curriculum-prev" '+(curriculumPhase===0?'disabled':'')+'>← Back</button><button class="primary" data-action="curriculum-next">'+(curriculumPhase===2?'Close draft':'Continue →')+'</button>';
 if(mode==='lesson')footer='<button class="button" data-action="lesson-back" '+(phase===0?'disabled':'')+'>← Back</button><button class="primary" data-action="lesson-next">'+(phase===2?'Finish lesson':'Continue →')+'</button>';
 if(mode==='drill'){var t=trackById(drillTrack);footer='<button class="button" data-action="drill-move" data-step="-1" '+(drillIndex===0?'disabled':'')+'>← Previous</button><button class="primary" data-action="drill-move" data-step="1">'+(drillIndex===t.ids.length-1?'Finish':'Next drill →')+'</button>'}
 if(mode==='workout')footer='<button class="button" data-action="close">Close</button>';
 return '<section class="overlay" role="dialog" aria-modal="true" aria-label="'+heading+'" id="activeOverlay"><div class="overlay-inner"><div class="overlay-head"><span class="phase">'+heading+'</span><button class="close" data-action="close" aria-label="Close card">×</button></div><div class="overlay-content">'+body+'</div><div class="overlay-footer">'+footer+'</div></div></section>';
}
function openCurriculum(id){if(!window.GalaxyCurriculumExperience||!window.GalaxyCurriculumExperience.pilot[id])return;lastActiveButton=document.activeElement;curriculumId=id;curriculumPhase=0;curriculumFrame=0;curriculumChoice='';curriculumRevealed=false;overlay='curriculum';render();focusClose()}
function openLesson(id){if(!source.byId[id])return;lastActiveButton=document.activeElement;lessonId=id;phase=activateCore('lesson',id);frame=0;revealed=false;decisionDraft='';notesDraft='';overlay='lesson';render();focusClose()}
function focusClose(){var close=root.querySelector('.close');if(close)close.focus()}
function openDrill(id){lastActiveButton=document.activeElement;drillTrack=trackById(id).id;drillIndex=activateCore('drill',drillTrack);partner=false;overlay='drill';render();focusClose()}
function openWorkout(mode){overlay=null;page='workout';render();return}
function close(){if(core&&coreSessionId){var s=core.getState().sessions[coreSessionId];if(s&&s.status==='in_progress'){saveCoreCursor(overlay==='lesson'?phase:overlay==='drill'?drillIndex:workoutIndex);core.transition(coreSessionId,'paused')}}coreSessionId=null;overlay=null;render();if(lastActiveButton&&lastActiveButton.isConnected)lastActiveButton.focus()}
function nextLesson(){
 var r=progress(lessonId);
 if(phase===0){r.seen=r.seen||today();phase=1}
 else if(phase===1){r.decision=(document.getElementById('decisionInput')||{}).value||decisionDraft||r.decision||'';phase=2}
 else {r.example=(document.getElementById('applicationInput')||{}).value||notesDraft||r.example||'';persist();completeCore('lesson');close();page='finish';render();return}
 persist();saveCoreCursor(phase);render();
}
function updateDateGuard(){return today()}
function matchPlan(phrase){
 var q=String(phrase||'').trim().toLowerCase();
 if(!q)return null;
 if(/strength|workout|weights|kettlebell|dumbbell|conditioning/.test(q))return {page:'workout',info:'Strength and movement plans are under Workout.'};
 if(/wing|cross|outside|dribbl|beat a defender|1v1/.test(q))return {id:'wide',info:'Matched wide attacking and 1v1 decisions.'};
 if(/finish|shoot|striker|goal|run behind/.test(q))return {id:'finish',info:'Matched chance creation and finishing.'};
 if(/defend|press|tackle|cover|back line/.test(q))return {id:'defend',info:'Matched defending and support.'};
 if(/turn|shield|ball mastery|close control/.test(q))return {id:'control',info:'Matched close control and turning.'};
 if(/pass|receive|first touch|scan|control|soccer|football|ball/.test(q))return {id:'first',info:'Matched first touch and passing.'};
 return {id:'first',info:'No exact topic found. Here is the closest foundational session; choose another category below if needed.'};
}
root.addEventListener('click',function(e){
 var b=e.target.closest('button');if(!b||!root.contains(b))return;
 var a=b.dataset.action;
 if(!a)return;
 if(a==='curriculum-open'){openCurriculum(b.dataset.id);return}
 if(a==='curriculum-frame'){curriculumFrame=Math.min(2,Math.max(0,curriculumFrame+Number(b.dataset.step)));render();return}
 if(a==='curriculum-choice'){curriculumChoice=String(b.dataset.choice);curriculumRevealed=false;render();return}
 if(a==='curriculum-reveal'){if(curriculumChoice!==''){curriculumRevealed=true;render()}return}
 if(a==='curriculum-next'){if(curriculumPhase<2){curriculumPhase++;render()}else{close()}return}
 if(a==='curriculum-prev'){if(curriculumPhase>0){curriculumPhase--;render()}return}
 if(a==='home'){overlay=null;page='home';render();return}
 if(a==='nav'){if(overlay)close();page=b.dataset.path;queryStatus='';render();return}
  if(a==='resume-core'&&core){var active=core.getState().sessions[b.dataset.id];if(active&&active.playerId===corePlayer()){if(active.module==='lesson')openLesson(active.contentId);if(active.module==='drill')openDrill(active.contentId);if(active.module==='workout')openWorkout((workoutRecord()||{}).mode||'technique')}return}
 if(a==='settings'){page='settings';render();return}
 if(a==='level'){state.level[player]=Number(b.dataset.index);persist();render();return}
 if(a==='lesson'){openLesson(b.dataset.id);return}
 if(a==='drill'){openDrill(b.dataset.id);return}
 if(a==='choose-workout'){openWorkout(b.dataset.mode);return}
 if(a==='start-workout'){openWorkout('blocked');return}
 if(a==='close'){close();return}
 if(a==='frame'){frame+=Number(b.dataset.step);render();return}
 if(a==='phase'){var p=Number(b.dataset.phase);if(p>phase){var record=progress(lessonId);if(phase===0)record.seen=record.seen||today();if(phase===1){var box=document.getElementById('decisionInput');record.decision=box?box.value:decisionDraft}persist()}phase=p;saveCoreCursor(phase);render();return}
 if(a==='reveal'){var box2=document.getElementById('decisionInput');decisionDraft=box2?box2.value:decisionDraft;revealed=true;persist();render();return}
 if(a==='partner'){partner=b.dataset.mode==='partner';render();return}
 if(a==='lesson-next'){nextLesson();return}
 if(a==='lesson-back'){if(phase>0){phase--;render()}return}
 if(a==='drill-move'){var length=trackById(drillTrack).ids.length;var n=drillIndex+Number(b.dataset.step);if(n>=length){if(drillRecord(drillTrack).done.length===length){completeCore('drill');close();page='finish';render()}else{drillIndex=Math.max(0,trackById(drillTrack).ids.findIndex(function(id){return drillRecord(drillTrack).done.indexOf(id)<0}));saveCoreCursor(drillIndex);render()}return}drillIndex=Math.max(0,n);saveCoreCursor(drillIndex);render();return}
 if(a==='workout-move')return;
 if(a==='export'){
  var payload={schema:3,exported:new Date().toISOString(),unified:state,legacy:legacy,core:core?core.getState():null};
  var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='galaxy-training-backup-'+today()+'.json';anchor.click();setTimeout(function(){URL.revokeObjectURL(url)},1000);return
 }
});
root.addEventListener('change',function(e){
 var t=e.target;
 if(t.id==='curriculumDomain'){curriculumDomain=t.value;curriculumBrowseOpen=true;render();return}
  if(t.id==='playerSelect'){var selected=Number(t.value);player=Number.isInteger(selected)&&selected>=0&&selected<state.names.length?selected:0;persist();overlay=null;render();return}
 if(t.id==='formatSelect'){state.format[player]=t.value==='9'?'9':'11';persist();render();return}
 if(t.id==='appliedCheck'){var r=progress(lessonId);if(t.checked)r.applied=today();else delete r.applied;r.example=(document.getElementById('applicationInput')||{}).value||r.example||'';persist();render();return}
 if(t.id==='drillCheck'){var r2=drillRecord(drillTrack),id=trackById(drillTrack).ids[drillIndex];r2.done=r2.done.filter(function(x){return x!==id});if(t.checked)r2.done.push(id);persist();render();return}
 if(t.dataset.set)return; // Disabled until an approved instructional adapter replaces legacy workouts.
 if(t.id==='importFile'&&t.files&&t.files[0]){var file=t.files[0];file.text().then(function(s){var obj=parse(s);if(!obj||obj.schema!==3||!obj.unified||obj.unified.schema!==3||!Array.isArray(obj.unified.names)||!obj.unified.lessons||!obj.unified.drills||!obj.unified.workouts){alert('This is not a Galaxy Training v3 backup. Nothing was changed.');return}if(obj.core&&(!window.GalaxyCore||obj.core.schemaVersion!==1||!Array.isArray(obj.core.profiles)||!obj.core.sessions||!Array.isArray(obj.core.events)||!obj.core.schedule)){alert('Core progress in this backup is invalid. Nothing was changed.');return}state=obj.unified;state.names=state.names.map(function(x){return String(x).slice(0,35)});while(state.format.length<state.names.length)state.format.push('11');while(state.level.length<state.names.length)state.level.push(0);if(obj.legacy){try{localStorage.setItem(LEGACY,JSON.stringify(obj.legacy));legacy=obj.legacy}catch(err){}}player=Math.max(0,Math.min(Number(state.active)||0,state.names.length-1));persist();if(obj.core){try{localStorage.setItem(window.GalaxyCore.storageKey,JSON.stringify(obj.core));core=window.GalaxyCore.createRuntime(localStorage,state);core.selectPlayer(corePlayer())}catch(err){alert('Core progress could not be restored. Existing v3 data was imported; check browser storage.')}}page='home';overlay=null;render();alert('Backup imported to this browser.')} ).catch(function(){alert('Unable to read this file. Nothing was changed.')});return}
});
root.addEventListener('input',function(e){if(e.target.id==='decisionInput'){decisionDraft=e.target.value;progress(lessonId).decision=decisionDraft;persist()}if(e.target.id==='applicationInput'){notesDraft=e.target.value;progress(lessonId).example=notesDraft;persist()}});
root.addEventListener('submit',function(e){
 var form=e.target;if(form.id==='curriculumSearchForm'){e.preventDefault();curriculumSearch=String(form.elements.query.value||'').slice(0,100);curriculumBrowseOpen=true;render();return}
 if(form.id==='planForm'){e.preventDefault();var result=matchPlan(form.elements.request.value);if(!result){queryStatus='Describe a topic to find a session.';render();return}queryStatus=result.info;if(result.page){page=result.page;render()}else{openDrill(result.id)}return}
 if(form.id==='weeklyScheduleForm'&&core){e.preventDefault();var day=Number(form.elements.day.value),kind=form.elements.kind.value;
 var calendar=core.getState().schedule,id=corePlayer(),weekly=(calendar.weekly[id]||[]).filter(function(e){return e.day!==day});
 if(kind!=='none')weekly.push({day:day,kind:kind});core.setSchedule(id,weekly,calendar.dated[id]||[]);render();return}
 if(form.id==='datedScheduleForm'&&core){e.preventDefault();var date=form.elements.date.value,kind=form.elements.kind.value;
 var calendar=core.getState().schedule,id=corePlayer(),dated=(calendar.dated[id]||[]).filter(function(e){return e.date!==date});
 if(kind!=='none')dated.push({date:date,kind:kind});core.setSchedule(id,calendar.weekly[id]||[],dated);render();return}
 if(form.id==='addPlayerForm'){e.preventDefault();var newName=String(form.elements.name.value||'').trim().slice(0,35);if(!newName||!core)return;core.addPlayer(newName);state.names.push(newName);state.format.push('11');state.level.push(0);player=state.names.length-1;persist();render();return}
 if(form.id==='settingsForm'){e.preventDefault();state.names=state.names.map(function(n,i){return String(form.elements['name'+i]&&form.elements['name'+i].value||n).trim().slice(0,35)||n});persist();render();return}
 if(form.id==='logForm'){e.preventDefault();var k=player+'|'+today()+'|'+form.elements.kind.value;state.logs[k]={kind:form.elements.kind.value,note:String(form.elements.note.value||'').slice(0,400),date:today(),saved:new Date().toISOString()};persist();if(core&&form.elements.applied&&form.elements.applied.checked){var pending=Object.values(core.getState().sessions).find(function(s){return s.playerId===corePlayer()&&s.status==='awaiting_match_application'});if(pending){core.recordEvent({playerId:corePlayer(),type:'match_application',sessionId:pending.id,contentId:pending.contentId,details:{activity:form.elements.kind.value,note:state.logs[k].note}});core.transition(pending.id,'ready_for_review',{reviewDue:today()})}}page='progress';render();return}
});
document.addEventListener('keydown',function(e){if(!overlay)return;if(e.key==='Escape'){e.preventDefault();close()}else if(overlay==='lesson'&&phase===0&&!/INPUT|TEXTAREA/.test(e.target.tagName)){if(e.key==='ArrowRight'){frame++;render()}if(e.key==='ArrowLeft'){frame--;render()}}});
var touchStart=null;root.addEventListener('touchstart',function(e){if(!overlay||e.target.closest('button,input,textarea,select,a')){touchStart=null;return}touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
root.addEventListener('touchend',function(e){if(!touchStart||!overlay)return;var dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(dy>115&&dy>Math.abs(dx)*1.4){close();return}if(overlay==='lesson'&&phase===0&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){frame+=dx<0?1:-1;render()}},{passive:true});
window.GalaxyTraining={getContent:function(){return source},getState:function(){return state},getCoreState:function(){return core?core.getState():null},getPlan:workoutPlan,matchPlan:matchPlan,slotsFor:slotsFor,completedExercises:completedExercises,isWorkoutDone:isWorkoutDone};
render();
})();