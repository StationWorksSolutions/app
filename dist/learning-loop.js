// Complete lessons without leaving the guided flow. Preserve existing records.
data.journey.resume=data.journey.resume||{};
data.journey.practice=data.journey.practice||{};
let brotherMode=false;
focusStep=function(){
 const l=lessonById[prefs().focus]||lessonById.scan,k=player+'|'+l.id;
 step=Math.max(0,Math.min(4,step));data.journey.resume[k]=step;persist();
 const stages=['Get the idea','Watch for it','Think it through','Try it','Use it'];
 const body=[
 `<p>${escapeHTML(l.why)}</p><div class="nextcue"><strong>Your one cue</strong><p>${escapeHTML(l.cues[0])}</p></div><details><summary>Show me more</summary><p>${escapeHTML(l.mistake)}</p><p>${escapeHTML(prefs().format==='9'?l.nine:l.eleven)}</p></details>`,
 `<p>Look for this in the demonstration:</p><h2>${escapeHTML(l.cues[0])}</h2>${l.video.map(id=>demoCatalog[id]?`<p><a href="${demoCatalog[id].url}" target="_blank" rel="noopener">▶ ${escapeHTML(demoCatalog[id].title)}</a></p>`:'').join('')}<p class="micro">Return here after watching. If the video is unavailable, use the written demonstration with an adult.</p>`,
 `<p>${escapeHTML(l.scenario)}</p><label>Your idea (say it aloud or write it)<textarea id="myIdea" maxlength="400" placeholder="I would… because…"></textarea></label><button data-reveal>Show the coaching explanation</button><div id="lessonExplanation" hidden><p>${escapeHTML(l.answer)}</p><p>Was your idea similar? More than one action can work. Explain what you noticed.</p></div>`,
 `<div class="row"><button data-practice-mode="solo" aria-pressed="${!brotherMode}">On my own</button><button data-practice-mode="brother" aria-pressed="${brotherMode}">With my brother</button></div><p>${escapeHTML(brotherMode?l.duo:l.solo)}</p><div class="nextcue"><strong>Keep it simple</strong><p>${escapeHTML(l.cues[0])}</p></div><p>Use this as the focus part of your existing session. Try one comfortable round, pause, then repeat only if fresh. No extra conditioning on practice or game days.</p><details><summary>Ready for a challenge?</summary><p>${escapeHTML(l.pressure)}</p><p>Only add pressure after the basic version feels controlled.</p></details><p class="micro">Clear your space first. Stop for pain and tell an adult.</p>`,
 `<h2>Your next practice mission</h2><p>${escapeHTML(l.evidence)}</p><p>Before practice, recall your cue without looking. Afterward, log whether you tried it. “Didn't get a chance” is okay.</p><button data-recall>Remind me of my cue</button><p id="recallCue" hidden>${escapeHTML(l.cues[0])}</p><p>Finish learning now; log actual practice or a game only after you do it.</p>`
 ];
 hub.innerHTML=`<button data-hub="Today">← Today</button><p class="muted">${step+1} OF 5 · ${stages[step]}</p><div class="step-track" aria-label="Step ${step+1} of 5">${stages.map((s,i)=>`<span class="${i<=step?'filled':''}"></span>`).join('')}</div><section class="panel focus-card"><h1>${escapeHTML(l.title)}</h1>${body[step]}</section><div class="row">${step?'<button data-loop-back>← Back</button>':''}<button class="primary" ${step===4?'data-loop-finish':'data-next'}>${step===4?'Save learning & finish':'Next →'}</button></div>`;
 if($('myIdea')){$('myIdea').value=data.journey.practice[k]?.idea||'';$('myIdea').oninput=e=>{data.journey.practice[k]={...data.journey.practice[k],idea:e.target.value};persist()}}
 window.scrollTo(0,0);
};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.start!==undefined){e.stopImmediatePropagation();step=data.journey.resume[player+'|'+prefs().focus]||0;focusStep()}
 if(d.loopBack!==undefined){step--;focusStep()}
 if(d.reveal!==undefined){$('lessonExplanation').hidden=false;b.hidden=true}
 if(d.recall!==undefined){$('recallCue').hidden=false;b.hidden=true}
 if(d.practiceMode){brotherMode=d.practiceMode==='brother';focusStep()}
 if(d.loopFinish!==undefined){const k=player+'|'+prefs().focus;data.journey.practice[k]={...data.journey.practice[k],reviewed:localDate()};data.journey.resume[k]=0;persist();showHub('Today');hub.insertAdjacentHTML('afterbegin','<p class="nextcue" role="status">Learning saved. Try your cue at practice, then log how it went.</p>')}
},true);
// Export the complete local record, including new reflections and lesson resumes.
$('export').onclick=()=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify({schema:1,exported:new Date().toISOString(),scope:'Both players on this browser only',data},null,2)],{type:'application/json'}));a.href=url;a.download='galaxy-family-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
