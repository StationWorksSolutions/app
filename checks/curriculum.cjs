const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('dist/index.html','utf8');
assert.match(html,/curriculum-gate\\.js/);
assert.match(html,/curriculum-pilot\\.js/);
assert.match(html,/training-v3\\.js/,'existing app entry preserved');
const curriculum=require('../dist/curriculum-gate.js');
const pilot=require('../dist/curriculum-pilot.js');
const Core=require('../dist/core-foundation.js');
const lessons=pilot.lessons;
assert.equal(pilot.plannedCount,250);
assert.equal(Object.values(pilot.domainAllocation).reduce((a,b)=>a+b,0),250);
assert.equal(lessons.length,10);
assert.deepEqual(curriculum.validateCatalog(lessons),[]);
assert.deepEqual(curriculum.pilotIssues(lessons),[]);
assert.ok(lessons.every(l=>!curriculum.published(l,{})),'drafts never playable');
const incomplete={...lessons[0],status:'published'};
assert.ok(curriculum.publicationIssues(incomplete,{}).length>=10,'metadata-only published lesson fails closed');
assert.throws(()=>curriculum.toCore(incomplete,{}),/Not approved/);
assert.deepEqual(curriculum.publishedLessons(lessons,{}),[],'do not recommend draft catalog');
assert.deepEqual(curriculum.eligible(lessons,{},[],['W']),[],'drafts cannot leak to Today');
const fixture={
  ...lessons[0],contentVersion:'rev-1',status:'published',
  concept:{id:'C-GI-SCAN',definition:'Look away from the incoming ball before it travels to identify pressure and a safe pass.'},
  watch:{mediaIds:['vid-scan-v1'],cues:['Locate the nearest presser'],observationChallenge:'Which teammate can the receiver use?'},
  understand:{trigger:'The ball leaves the passer',situation:'A teammate receives with a defender approaching.',
    choices:[{action:'Turn into open space',reason:'When the defender is late and the space is usable.'},
      {action:'Protect and set back',reason:'When the defender arrives tight and support is available.'}]},
  practice:{drillId:'drill-scan'},
  apply:{matchChallenge:'Before receiving, look for one opponent and a safe pass.',observableEvidence:'One observed pre-receive scan changing the next action.'},
  assessments:[{question:'What changed before the receive?',options:['Defender closed','Space opened'],rationale:'The defender movement should update the receiver choice.'}],
  reviews:{}
};
const media={'vid-scan-v1':{assetId:'vid-scan-v1',assetVersion:'rev-1',kind:'animation',playbackStatus:'verified',
  rightsStatus:'owned',coachingApproved:true,ageSuitable:true}};
const drills={'drill-scan':{conceptId:'C-GI-SCAN',equipment:'Cones and a ball',setup:'Two receiving gates',durationMinutes:8}};
for(const area of curriculum.reviewAreas)fixture.reviews[area]={status:'approved',reviewerId:'fixture-reviewer',reviewedAt:'2026-11-11',contentVersion:'rev-1'};
const ctx={media,drills,lessons:[fixture]};
assert.deepEqual(curriculum.publicationIssues(fixture,ctx),[],'complete approved fixture can publish');
assert.ok(curriculum.published(fixture,ctx));
assert.ok(Core.validateLesson(curriculum.toCore(fixture,ctx)),'core adapter contract');
assert.ok(!curriculum.published({...fixture,contentVersion:'rev-2'},ctx),'new revision invalidates reviews');
assert.ok(!curriculum.published({...fixture,watch:{...fixture.watch,mediaIds:['bad-id']}},ctx),'unverified media rejected');
assert.ok(!curriculum.published({...fixture,practice:{drillId:'not-found'}},ctx),'missing drill rejected');
assert.ok(!curriculum.published({...fixture,assessments:[]},ctx),'missing assessment rejected');
assert.ok(!curriculum.published(fixture,{...ctx,media:{'vid-scan-v1':{...media['vid-scan-v1'],kind:'diagram'}}}),'video-first publication gate rejects diagram-only watch');
const child={...fixture,id:'TM-005',lessonId:'TM-005',prerequisites:['GI-003']};
assert.ok(curriculum.publicationIssues(child,{...ctx,lessons:[child,lessons[1]]}).includes('unpublished prerequisite GI-003'),'unready prerequisite blocks release');

assert.ok(!curriculum.published({...fixture,concept:{definition:'Placeholder'}},ctx),'placeholder concepts rejected');
assert.ok(!curriculum.published({...fixture,reviews:{}},ctx),'missing human reviews rejected');
assert.ok(curriculum.eligible([fixture],ctx,[],['GK']).length===0,'GK role filter does not assign an outfield-only optional lesson');
assert.equal(curriculum.eligible([fixture],ctx,[],['W']).length,1,'first approved lesson is eligible');
assert.deepEqual(curriculum.validateCatalog([{...lessons[0],prerequisites:['GI-001']}]),['prerequisite cycle GI-001']);
assert.equal(curriculum.formatFor({id:'TT-017'}).demonstratedFormationFormat,'11v11');
assert.equal(curriculum.formatFor({id:'TT-017'}).conceptApplicableFormats.length,2);
assert.equal(curriculum.validateCatalog([{...lessons[0],id:'TT-017',prerequisites:[],demonstratedFormationFormat:'9v9'}]).includes('TT-017: 11v11 formation incorrectly demonstrated as 9v9'),true);
const events=[
  {playerId:'jay',contentId:'GI-001',type:'lesson_viewed'},
  {playerId:'jay',contentId:'GI-001',type:'understanding_assessed'},
  {playerId:'jay',contentId:'GI-001',type:'practice_completed'},
  {playerId:'jay',contentId:'GI-001',type:'match_application',details:{evidence:'Saw opponent at left shoulder'}},
  {playerId:'jay',contentId:'GI-001',type:'review_scheduled',reviewDue:'2026-11-13'}
];
const p=curriculum.progressFromEvents(events,'jay','GI-001','2026-11-14');
assert.deepEqual([p.exposed,p.understood,p.practiced,p.matchApplied,p.independentlyVerified,p.reviewDue],[true,true,true,true,false,true]);
assert.equal(curriculum.progressFromEvents(events,'james','GI-001','2026-11-14').exposed,false);
assert.equal(curriculum.progressFromEvents([...events,{playerId:'jay',contentId:'GI-001',type:'competency_verified',assessment:{reviewerId:'coach-1',evidence:'Repeated in new scenario'}}],'jay','GI-001','2026-11-14').independentlyVerified,true);
assert.equal(curriculum.legacyPolicy().automaticMigration,false);
console.log('PASS curriculum: dependency-closed pilot, publication invariants, media/drill/reviews, core adapter, progress separation, formation safety, legacy hold.');
