// A quiet entry point: the next lesson first, browsing and tracking second.
const previousHub=showHub;
showHub=function(page='Today'){
 document.body.classList.remove('lesson-mode');previousHub(page);
 const l=lessonById[prefs().focus]||lessonById.scan;
 const profile=`<div class="quiet-top"><span class="quiet-brand">GALAXY</span><label class="sr-only" for="quietPlayer">Choose player</label><select id="quietPlayer">${data.names.map((n,i)=>`<option value="${i}" ${i===player?'selected':''}>${escapeHTML(n)}</option>`).join('')}</select></div>`;
 if(page==='Today'){
 const reviewed=data.journey.practice[player+'|'+l.id]?.reviewed===localDate();
 hub.innerHTML=profile+`<section class="quiet-home"><p class="quiet-label">${reviewed?'YOUR PRACTICE CUE':'YOUR NEXT IDEA'}</p><h1>${escapeHTML(l.title)}</h1><p class="quiet-cue">${escapeHTML(l.cues[0])}</p><button class="primary quiet-start" data-start>${reviewed?'Review this idea':data.journey.resume[player+'|'+l.id]?'Continue lesson':'Start learning'} <span aria-hidden="true">→</span></button><p class="quiet-meta">One idea · see it, try it, use it</p></section><details class="quiet-extra"><summary>Log practice or a game</summary><div class="row"><button data-log="Practice">Practice</button><button data-log="Game">Game</button></div></details><details class="quiet-extra"><summary>Training & parent settings</summary><div class="quiet-links"><button data-old="week">Choose a session</button><button data-old="strength">Strength & movement</button><button data-old="soccer">Ball training</button><button data-parent>Parent settings</button></div></details>`;
 }else if(page==='Learn'){
 hub.innerHTML=profile+`<section class="quiet-heading"><h1>What do you want to learn?</h1><p>Your current focus: ${escapeHTML(l.title)}</p></section>`+['Awareness','Ball skills','Attacking','Defending','Team play','Goalkeeping'].filter(c=>lessons.some(x=>x.category===c)).map(c=>`<details class="quiet-collection"><summary>${escapeHTML(c)} <span>${lessons.filter(x=>x.category===c).length} lessons</span></summary>${lessons.filter(x=>x.category===c).map(x=>`<button class="quiet-lesson" data-focus="${x.id}">${escapeHTML(x.title)} <span aria-hidden="true">→</span></button>`).join('')}</details>`).join('')+`<details class="quiet-extra"><summary>Positions & all lessons</summary><button data-old="library">Explore the full library</button></details>`;
 // Include every category, even if new content introduces another name.
 const shown=new Set(['Awareness','Ball skills','Attacking','Defending','Team play','Goalkeeping']);
 lessons.filter(x=>!shown.has(x.category)).forEach(x=>hub.insertAdjacentHTML('beforeend',`<button class="quiet-lesson" data-focus="${x.id}">${escapeHTML(x.title)} →</button>`));
 }
 if($('quietPlayer'))$('quietPlayer').onchange=e=>{player=Number(e.target.value);step=0;showHub(page)};
};
const fullFocusStep=focusStep;
focusStep=function(){
 fullFocusStep();document.body.classList.add('lesson-mode');
 // Keep the active concept short, with supporting detail available on demand.
 const card=hub.querySelector('.focus-card');
 if(step===0){const explanation=card.querySelector(':scope > p');if(explanation){const details=document.createElement('details');details.innerHTML='<summary>Why this helps</summary>';explanation.replaceWith(details);details.append(explanation)}}
 if(step===2){const label=card.querySelector('label');if(label){const details=document.createElement('details');details.innerHTML='<summary>Write my answer (optional)</summary>';label.replaceWith(details);details.append(label)}const intro=document.createElement('p');intro.className='quiet-meta';intro.textContent='Say what you would do, then check your thinking.';card.querySelector('h1').after(intro)}
 if(step===3){const details=card.querySelector('details');const paragraphs=Array.from(card.children).filter(x=>x.tagName==='P');const guidance=paragraphs.find(x=>x.textContent.startsWith('Use this as'));if(guidance){const extra=document.createElement('details');extra.innerHTML='<summary>How much should I do?</summary>';guidance.replaceWith(extra);extra.append(guidance)}}
 if(step===1){const links=Array.from(card.querySelectorAll(':scope > p')).filter(p=>p.querySelector('a'));if(links.length>1){const details=document.createElement('details');details.innerHTML='<summary>Another demonstration</summary>';links[1].before(details);links.slice(1).forEach(p=>details.append(p))}}
};
document.addEventListener('click',e=>{if(e.target.closest('[data-log],[data-parent]'))document.body.classList.remove('lesson-mode')});
showHub('Today');
