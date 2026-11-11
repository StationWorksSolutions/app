/* Galaxy Training shared application foundation v1.
   Content-neutral and usable in a browser or in Node regression tests. */
(function(factory){
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.GalaxyCore=api;
})(function(){
  'use strict';
  var KEY='galaxy-training-core-v1',VERSION=1;
  var STATES=['not_started','in_progress','paused','completed','awaiting_match_application','ready_for_review','skipped'];
  var NEXT={
    not_started:['in_progress','skipped'],
    in_progress:['paused','completed','skipped'],
    paused:['in_progress','skipped'],
    completed:['awaiting_match_application','ready_for_review'],
    awaiting_match_application:['ready_for_review'],
    ready_for_review:[],
    skipped:[]
  };
  var MODULES=['lesson','drill','workout','guided'];
  var ACTIVITIES=['practice','match','futsal','recovery'];
  function copy(v){return JSON.parse(JSON.stringify(v))}
  function isObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
  function dateOnly(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)}
  function nonempty(s){return typeof s==='string'&&!!s.trim()}
  function todayLocal(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function validMediaRef(m){return isObject(m)&&nonempty(m.assetId)&&['video','diagram','animation','image'].indexOf(m.kind)>=0}
  function validateLesson(l){
    return isObject(l)&&l.schemaVersion===1&&nonempty(l.id)&&nonempty(l.title)&&
      Array.isArray(l.prerequisites)&&l.prerequisites.every(nonempty)&&
      Array.isArray(l.positionTags)&&l.positionTags.every(nonempty)&&
      Array.isArray(l.media)&&l.media.every(validMediaRef);
  }
  function validateExercise(e){
    return isObject(e)&&e.schemaVersion===1&&nonempty(e.id)&&nonempty(e.title)&&
      (e.animation===null||validMediaRef(e.animation));
  }
  function validateWorkout(w){
    return isObject(w)&&w.schemaVersion===1&&nonempty(w.id)&&
      Array.isArray(w.items)&&w.items.length>0&&w.items.every(function(i){
        return isObject(i)&&nonempty(i.exerciseId)&&Number.isInteger(i.sets)&&i.sets>=1&&
          (i.reps===undefined||nonempty(String(i.reps)));
      });
  }
// A release record must be tied to the exact exercise and asset revision.
// This verifies the required REVIEW RECORD exists; it does not substitute for human biomechanics assessment.
var MOVEMENT_CHECKS=['jointAlignment','movementPath','rangeOfMotion','stability','equipmentContact','ageAppropriateness'];
function isReviewedExerciseDemonstration(exercise){
  if(!validateExercise(exercise)||!exercise.animation||exercise.animation.kind!=='animation')return false;
  var media=exercise.animation,review=media.review;
  return nonempty(media.assetVersion)&&isObject(review)&&review.status==='approved'&&
    review.exerciseId===exercise.id&&review.assetId===media.assetId&&review.assetVersion===media.assetVersion&&
    nonempty(review.reviewedBy)&&nonempty(review.reviewerQualification)&&
    dateOnly(review.reviewedAt)&&isObject(review.checks)&&
    MOVEMENT_CHECKS.every(function(key){return review.checks[key]===true});
}
  function createRuntime(storage,legacy){
    if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')throw Error('A storage adapter with getItem and setItem is required');
    var saved=null,storageError=null;
    try{saved=JSON.parse(storage.getItem(KEY)||'null')}catch(e){storageError='Stored core state could not be read.'}
    var doc=isObject(saved)&&saved.schemaVersion===VERSION&&Array.isArray(saved.profiles)&&
      isObject(saved.sessions)&&Array.isArray(saved.events)&&isObject(saved.schedule)?saved:
      {schemaVersion:VERSION,profiles:[],activePlayerId:null,objectives:{},schedule:{weekly:{},dated:{}},sessions:{},events:[],sequence:0};
    doc.schedule.weekly=doc.schedule.weekly||{};
    doc.schedule.dated=doc.schedule.dated||{};
    doc.objectives=doc.objectives||{};
    doc.sequence=Number.isSafeInteger(doc.sequence)&&doc.sequence>=0?doc.sequence:0;
    function save(){try{storage.setItem(KEY,JSON.stringify(doc));storageError=null;return true}catch(e){storageError='Progress could not be saved on this device.';return false}}
    function legacyProfiles(state){
      var names=state&&Array.isArray(state.names)?state.names:['Jay','James'];
      names.forEach(function(name,index){
        var p=doc.profiles[index];
        if(!p){p={id:'legacy-'+index,name:String(name||'Player '+(index+1)).slice(0,35),positions:[]};doc.profiles.push(p)}
        else if(nonempty(name))p.name=String(name).slice(0,35);
      });
      if(!doc.activePlayerId||!doc.profiles.some(function(x){return x.id===doc.activePlayerId}))
        doc.activePlayerId=doc.profiles[0]&&doc.profiles[0].id||null;
    }
    legacyProfiles(legacy);
    save();
    function requireProfile(id){
      if(!doc.profiles.some(function(p){return p.id===id}))throw Error('Unknown player '+id);
    }
    function nextId(prefix){doc.sequence+=1;return prefix+'-'+doc.sequence}
    function getPlayer(id){return copy(doc.profiles.find(function(p){return p.id===id})||null)}
    function addPlayer(name){
      if(!nonempty(name))throw Error('A player name is required');
      var id=nextId('player');
      doc.profiles.push({id:id,name:name.trim().slice(0,35),positions:[]});
      if(!doc.activePlayerId)doc.activePlayerId=id;
      save();return id;
    }
    function setPositions(id,positions){
      requireProfile(id);
      if(!Array.isArray(positions)||!positions.every(nonempty))throw Error('Invalid positions');
      doc.profiles.find(function(p){return p.id===id}).positions=Array.from(new Set(positions));
      save();
    }
    function setObjective(id,objective){
      requireProfile(id);
      if(!isObject(objective)||!nonempty(objective.id)||!nonempty(objective.label))throw Error('Invalid objective');
      doc.objectives[id]=copy(objective);save();
    }
    function setSchedule(id,weekly,dated){
      requireProfile(id);
      if(!Array.isArray(weekly)||!weekly.every(function(e){return isObject(e)&&Number.isInteger(e.day)&&e.day>=0&&e.day<=6&&ACTIVITIES.indexOf(e.kind)>=0}))
        throw Error('Invalid weekly schedule');
      if(!Array.isArray(dated)||!dated.every(function(e){return isObject(e)&&dateOnly(e.date)&&ACTIVITIES.indexOf(e.kind)>=0}))
        throw Error('Invalid dated schedule');
      doc.schedule.weekly[id]=copy(weekly);
      doc.schedule.dated[id]=copy(dated);
      save();
    }
    function activitiesOn(id,date){
      requireProfile(id);if(!dateOnly(date))throw Error('Expected YYYY-MM-DD');
      var day=new Date(date+'T12:00:00').getDay();
      var dated=(doc.schedule.dated[id]||[]).filter(function(e){return e.date===date});
      var weekly=(doc.schedule.weekly[id]||[]).filter(function(e){return e.day===day});
      return copy(dated.concat(weekly));
    }
    function logEvent(event){
      if(!isObject(event)||!nonempty(event.playerId)||!nonempty(event.type))throw Error('Invalid progress event');
      requireProfile(event.playerId);
      if(event.type==='competency_verified'&&
         (!isObject(event.assessment)||!nonempty(event.assessment.reviewerId)||!nonempty(event.assessment.evidence)))
        throw Error('Competency requires independent evidence and reviewer');
      var recorded={id:nextId('event'),schemaVersion:1,playerId:event.playerId,
        type:event.type,sessionId:event.sessionId||null,contentId:event.contentId||null,
        recordedAt:new Date().toISOString(),details:copy(event.details||{})};
      if(event.assessment)recorded.assessment=copy(event.assessment);
      doc.events.push(recorded);save();return copy(recorded);
    }
    function makeSession(request){
      if(!isObject(request)||!nonempty(request.playerId)||MODULES.indexOf(request.module)<0||!nonempty(request.contentId))
        throw Error('Invalid session request');
      requireProfile(request.playerId);
      var id=nextId('session'),s={id:id,schemaVersion:1,playerId:request.playerId,module:request.module,
        contentId:request.contentId,contentVersion:request.contentVersion||1,
        status:'not_started',cursor:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
        completedAt:null,reviewDue:null};
      doc.sessions[id]=s;save();return copy(s);
    }
    function transition(id,to,extra){
      var s=doc.sessions[id];if(!s)throw Error('Unknown session');
      if(STATES.indexOf(to)<0||(NEXT[s.status]||[]).indexOf(to)<0)throw Error('Invalid session transition: '+s.status+' → '+to);
      s.status=to;s.updatedAt=new Date().toISOString();
      if(to==='completed')s.completedAt=s.updatedAt;
      if(to==='skipped')s.skipReason=String(extra&&extra.reason||'not specified').slice(0,100);
      if(to==='ready_for_review')s.reviewDue=extra&&dateOnly(extra.reviewDue)?extra.reviewDue:todayLocal();
      logEvent({playerId:s.playerId,sessionId:id,contentId:s.contentId,type:'session_'+to,
        details:to==='skipped'?{reason:s.skipReason}:{}});
      save();return copy(s);
    }
    function setCursor(id,cursor){
      var s=doc.sessions[id];if(!s||['in_progress','paused'].indexOf(s.status)<0||!Number.isInteger(cursor)||cursor<0)
        throw Error('Cannot save session position');
      s.cursor=cursor;s.updatedAt=new Date().toISOString();save();return copy(s);
    }
    function resumable(playerId,module,contentId){
      requireProfile(playerId);
      return copy(Object.values(doc.sessions).filter(function(s){
        return s.playerId===playerId&&['in_progress','paused'].indexOf(s.status)>=0&&
          (!module||s.module===module)&&(!contentId||s.contentId===contentId);
      }).sort(function(a,b){return b.updatedAt.localeCompare(a.updatedAt)})[0]||null);
    }
    function sessionSummary(id){
      requireProfile(id);
      var all=Object.values(doc.sessions).filter(function(s){return s.playerId===id});
      var events=doc.events.filter(function(e){return e.playerId===id});
      return {started:all.filter(function(s){return s.status!=='not_started'}).length,
        completed:all.filter(function(s){return !!s.completedAt}).length,
        awaitingMatch:all.filter(function(s){return s.status==='awaiting_match_application'}).length,
        readyForReview:all.filter(function(s){return s.status==='ready_for_review'}).length,
        skipped:all.filter(function(s){return s.status==='skipped'}).length,
        independentlyVerified:events.filter(function(e){return e.type==='competency_verified'}).length};
    }
    function recommend(id,date,catalog){
      requireProfile(id);if(!dateOnly(date))throw Error('Expected YYYY-MM-DD');
      var events=activitiesOn(id,date);
      var busy=events.find(function(e){return e.kind==='match'||e.kind==='practice'||e.kind==='futsal'});
      var recovery=events.find(function(e){return e.kind==='recovery'});
      if(recovery)return {kind:'recovery',label:'Recovery is today’s training',finishedForToday:true,reason:'Scheduled recovery'};
      if(busy)return {kind:'scheduled',activity:busy.kind,label:busy.kind==='match'?'Match day':busy.kind==='futsal'?'Futsal today':'Team practice today',
        finishedForToday:false,reason:'Do not stack a demanding session on scheduled team activity'};
      var active=resumable(id);
      if(active)return {kind:'resume',sessionId:active.id,module:active.module,contentId:active.contentId,
        label:'Resume your session',finishedForToday:false,reason:'Finish existing work before starting another'};
      var done=Object.values(doc.sessions).some(function(s){return s.playerId===id&&!!s.completedAt&&s.completedAt.slice(0,10)===date});
      if(done)return {kind:'finished',label:'Training finished for today',finishedForToday:true,reason:'A completed session is enough'};
      var review=Object.values(doc.sessions).find(function(s){return s.playerId===id&&s.status==='ready_for_review'&&s.reviewDue<=date});
      if(review)return {kind:'review',contentId:review.contentId,module:review.module,
        label:'Review a familiar idea',finishedForToday:false,reason:'Review is due'};
      var options=Array.isArray(catalog)?catalog:[];
      var candidate=options.find(function(item){return item&&nonempty(item.id)&&
        !Object.values(doc.sessions).some(function(s){return s.playerId===id&&s.contentId===item.id&&!!s.completedAt})});
      return candidate?{kind:'new',contentId:candidate.id,module:'lesson',label:'Start '+String(candidate.title||'your next lesson'),
        finishedForToday:false,reason:'First unfinished validated lesson'}:
        {kind:'unavailable',label:'No training ready yet',finishedForToday:false,reason:'Content needs to be connected'};
    }
    return {
      storageKey:KEY,schemaVersion:VERSION,getState:function(){return copy(doc)},getStorageError:function(){return storageError},
      getPlayer:getPlayer,profiles:function(){return copy(doc.profiles)},playerIdForLegacyIndex:function(i){return 'legacy-'+i},
      activePlayerId:function(){return doc.activePlayerId},selectPlayer:function(id){requireProfile(id);doc.activePlayerId=id;save()},
      syncLegacyNames:function(s){legacyProfiles(s);save()},addPlayer:addPlayer,setPositions:setPositions,
      setObjective:setObjective,setSchedule:setSchedule,activitiesOn:activitiesOn,
      createSession:makeSession,transition:transition,setCursor:setCursor,resumable:resumable,
      sessionSummary:sessionSummary,recommend:recommend,recordEvent:logEvent
    };
  }
  return {schemaVersion:VERSION,storageKey:KEY,states:STATES.slice(),validTransitions:copy(NEXT),
    validateLesson:validateLesson,validateExercise:validateExercise,validateWorkout:validateWorkout,
    isReviewedExerciseDemonstration:isReviewedExerciseDemonstration,
    createRuntime:createRuntime};
});
