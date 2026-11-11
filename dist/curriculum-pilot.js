/* Dependency-closed pilot metadata only. Not playable, published, or coach approved. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.GalaxyCurriculumPilot=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  return {
    schemaVersion:1,catalogId:'galaxy-soccer-250',catalogVersion:'1.0.0',
    catalogStatus:'architecture_draft',plannedCount:250,
    domainAllocation:{GI:45,TM:40,AT:35,DF:30,PI:35,TT:30,TR:20,MA:15},
    lessons:[
      ['GI-001','Look before the pass arrives','Identify one opponent and one useful option before receiving.','OUT',''],
      ['GI-003','Find the free side','Point to the less crowded receiving area before requesting a pass.','OUT',''],
      ['GI-004','Understand passing shadows','Move from behind a defender into a reachable passing lane.','OUT','GI-003'],
      ['GI-005','Recognize tight versus loose pressure','Distinguish immediate pressure from time to carry or pass.','OUT',''],
      ['TM-005','Cushion a rolling ball','Prepare a playable second action with a controlled first touch.','OUT','GI-001'],
      ['TM-006','Receive across the body','Use an open stance when space allows a turn into the next lane.','OUT','TM-005'],
      ['AT-001','Create a supporting triangle','Move diagonally to become a visible safe passing option.','OUT','GI-004'],
      ['DF-001','Slow the attacker before tackling','Arrive under control and delay the dribbler instead of diving in.','OUT','GI-005'],
      ['TR-001','React immediately when the ball is lost','Decide whether to delay the ball or recover toward goal after a turnover.','OUT','DF-001'],
      ['MA-001','Freeze a clip and locate the ball, goal and opponents','Identify the immediate players and spaces that matter to one decision.','OUT,GK','GI-001']
    ].map(function(a){return {
      schemaVersion:1,id:a[0],lessonId:a[0],title:a[1],objective:a[2],
      developmentLevel:'beginner',positionTags:a[3].split(','),
      prerequisites:a[4]?a[4].split(','):[],contentVersion:'1.0.0',
      status:'catalog_draft',validationStatus:'catalog_draft',
      conceptApplicableFormats:['9v9','11v11'],demonstratedFormationFormat:null,
      media:[],watch:null,understand:null,practice:null,apply:null,assessments:[],
      reviews:{}
    }})
  };
});
