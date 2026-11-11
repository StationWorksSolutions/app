/* Galaxy soccer curriculum release gate. No UI, player store or workout logic. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.GalaxyCurriculum=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
var REVIEW_AREAS=['soccer','age','clarity','prerequisites','drill','match','media','duplicates','schema','playerExperience'];
var PILOT=['GI-001','GI-003','GI-004','GI-005','TM-005','TM-006','AT-001','DF-001','TR-001','MA-001'];
function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
function filled(x){return typeof x==='string'&&x.trim().length>0}
function arr(x){return Array.isArray(x)}
function unique(x){return new Set(x).size===x.length}
function idOf(x){return x&&String(x.id||x.lessonId||'')}
function prerequisites(l){return l.prerequisites||l.prerequisiteIds||[]}
function validateCatalog(catalog){
  var lessons=arr(catalog)?catalog:(catalog&&catalog.lessons),issues=[];
  if(!arr(lessons))return ['catalog lessons array missing'];
  var ids=lessons.map(idOf),map=new Map(lessons.map(l=>[idOf(l),l]));
  if(!unique(ids))issues.push('duplicate lesson IDs');
  lessons.forEach(function(l){
    var id=idOf(l);
    if(!/^([A-Z]{2})-\d{3}$/.test(id)||!filled(l.title)||!filled(l.objective))issues.push(id+': invalid required metadata');
    if(!arr(prerequisites(l))||!unique(prerequisites(l)))issues.push(id+': invalid prerequisites');
    else prerequisites(l).forEach(function(p){if(!map.has(p))issues.push(id+': missing '+p)});
    if(l.demonstratedFormationFormat&&['9v9','11v11'].indexOf(l.demonstratedFormationFormat)<0)issues.push(id+': invalid formation format');
    if((id==='TT-017'||id==='TT-018'||id==='TT-025')&&l.demonstratedFormationFormat==='9v9')issues.push(id+': 11v11 formation incorrectly demonstrated as 9v9');
  });
  var visiting=new Set(),done=new Set();
  function visit(id){
    if(done.has(id)||!map.has(id))return;
    if(visiting.has(id)){issues.push('prerequisite cycle '+id);return}
    visiting.add(id);prerequisites(map.get(id)).forEach(visit);visiting.delete(id);done.add(id);
  }
  ids.forEach(visit);
  return issues;
}
function validReview(record,version){
  return object(record)&&record.status==='approved'&&filled(record.reviewerId)&&
    filled(record.reviewedAt)&&record.contentVersion===version;
}
function mediaUsable(m){
  if(!object(m)||!filled(m.assetId)||!filled(m.assetVersion)||m.playbackStatus!=='verified')return false;
  if(!['video','animation','diagram'].includes(m.kind))return false;
  if(!['owned','permission_granted','external_link'].includes(m.rightsStatus))return false;
  if(m.rightsStatus==='external_link'&&!/^https:\/\//.test(m.url||''))return false;
  return m.coachingApproved===true&&m.ageSuitable===true;
}
function publicationIssues(l,context){
  var e=[],ctx=context||{},id=idOf(l);
  if(!filled(id)||!filled(l.title)||!filled(l.objective)||!filled(l.contentVersion))e.push('identity/version');
  if(!arr(l.positionTags)||!l.positionTags.length||!arr(prerequisites(l)))e.push('position/prerequisites');
  if(!object(l.concept)||!filled(l.concept.definition)||/placeholder|to be defined/i.test(l.concept.definition))e.push('approved concept definition');
  if(!object(l.watch)||!arr(l.watch.mediaIds)||!l.watch.mediaIds.length||!arr(l.watch.cues)||l.watch.cues.length>3||!filled(l.watch.observationChallenge))e.push('watch');
  var media=ctx.media||{};
  if(object(l.watch)&&arr(l.watch.mediaIds))l.watch.mediaIds.forEach(function(mid){
    if(!mediaUsable(media[mid]))e.push('verified media '+mid);
  });
  var u=l.understand;
  if(!object(u)||!filled(u.situation)||!arr(u.choices)||u.choices.length<2||
    !u.choices.every(function(c){return object(c)&&filled(c.action)&&filled(c.reason)})||
    !filled(u.trigger))e.push('situational decision');
  var p=l.practice,drills=ctx.drills||{};
  if(!object(p)||!filled(p.drillId)||!object(drills[p&&p.drillId])||
    drills[p.drillId].conceptId!==(l.concept&&l.concept.id)||
    !filled(drills[p.drillId].setup)||!filled(drills[p.drillId].equipment)||
    !Number.isFinite(drills[p.drillId].durationMinutes))e.push('drill-concept alignment');
  if(!object(l.apply)||!filled(l.apply.matchChallenge)||!filled(l.apply.observableEvidence))e.push('match challenge');
  if(!arr(l.assessments)||!l.assessments.length||!l.assessments.every(function(a){return filled(a.question)&&arr(a.options)&&a.options.length>=2&&filled(a.rationale)}))e.push('assessments');
  REVIEW_AREAS.forEach(function(area){if(!validReview(l.reviews&&l.reviews[area],l.contentVersion))e.push('review '+area)});
  if(ctx.lessons){
    var all=new Set(ctx.lessons.map(idOf));
    prerequisites(l).forEach(function(id){if(!all.has(id))e.push('missing prerequisite '+id)});
  }
  if(l.demonstratedFormationFormat==='9v9'&&['TT-017','TT-018','TT-025'].includes(id))e.push('formation format');
  return e;
}
function published(l,ctx){return l.status==='published'&&publicationIssues(l,ctx).length===0}
function publishedLessons(catalog,ctx){return catalog.filter(function(l){return published(l,ctx)})}
function eligible(catalog,ctx,completed,positions){
  var ready=new Set(completed||[]),roles=new Set(positions||[]);
  return publishedLessons(catalog,ctx).filter(function(l){
    var tags=l.positionTags||[];
    var relevant=!roles.size||tags.includes('OUT')||tags.some(function(t){return roles.has(t)});
    return relevant&&!ready.has(idOf(l))&&prerequisites(l).every(function(p){return ready.has(p)});
  });
}
function toCore(l,ctx){
  var failures=publicationIssues(l,ctx);
  if(l.status!=='published'||failures.length)throw Error('Not approved for play: '+idOf(l)+' '+failures.join(', '));
  return {schemaVersion:1,id:idOf(l),title:l.title,positionTags:l.positionTags,
    prerequisites:prerequisites(l).slice(),media:l.watch.mediaIds.map(function(assetId){
      return {assetId:assetId,kind:ctx.media[assetId].kind};
    })};
}
function pilotIssues(catalog){
  var map=new Map(catalog.map(l=>[idOf(l),l])),issues=[];
  PILOT.forEach(function(id){if(!map.has(id))issues.push('missing pilot '+id)});
  PILOT.forEach(function(id){if(map.has(id))prerequisites(map.get(id)).forEach(function(p){
    if(!PILOT.includes(p))issues.push(id+': outside pilot prerequisite '+p);
  })});
  return issues;
}
function formatFor(l){
  var id=idOf(l);
  return (id==='TT-017'||id==='TT-018'||id==='TT-025')?
    {conceptApplicableFormats:['9v9','11v11'],demonstratedFormationFormat:'11v11'}:
    {conceptApplicableFormats:l.conceptApplicableFormats||['9v9','11v11'],demonstratedFormationFormat:l.demonstratedFormationFormat||null};
}
function progressFromEvents(events,playerId,lessonId,now){
  var related=(events||[]).filter(function(e){return e.playerId===playerId&&e.contentId===lessonId});
  var has=function(type){return related.some(function(e){return e.type===type})};
  var match=related.some(function(e){return e.type==='match_application'&&object(e.details)&&filled(e.details.evidence)});
  var verified=related.some(function(e){
    return e.type==='competency_verified'&&object(e.assessment)&&filled(e.assessment.reviewerId)&&filled(e.assessment.evidence);
  });
  var reviewSessions=related.filter(function(e){return filled(e.reviewDue)}).sort(function(a,b){return a.reviewDue.localeCompare(b.reviewDue)});
  var due=reviewSessions.length?reviewSessions[reviewSessions.length-1].reviewDue:null;
  return {exposed:has('lesson_viewed'),understood:has('understanding_assessed'),
    practiced:has('practice_completed'),matchApplied:match,independentlyVerified:verified,
    reviewDue:!!due&&due<=(now||new Date().toISOString().slice(0,10)),reviewOn:due};
}
function mapLegacyProgress(){return {automaticMigration:false,masteryTransferred:false,preserveKeys:['galaxy-training-v1','galaxy-training-unified-v3'],requiresReviewedMapping:true}}
return {schemaVersion:1,pilotIds:PILOT.slice(),reviewAreas:REVIEW_AREAS.slice(),
  validateCatalog:validateCatalog,publicationIssues:publicationIssues,published:published,
  publishedLessons:publishedLessons,eligible:eligible,toCore:toCore,pilotIssues:pilotIssues,
  formatFor:formatFor,progressFromEvents:progressFromEvents,legacyPolicy:mapLegacyProgress};
});
