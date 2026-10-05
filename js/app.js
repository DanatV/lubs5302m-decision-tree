'use strict';
(() => {
 const $=s=>document.querySelector(s), E=DT.escape, KEY='masters-decision-tree-v1';
 let state=DT.fresh(),stage=0,selected=null,zoom=1,history=[],future=[],checked=false,storageOK=true;
 const names=['Factors','Root','Build','Review'];
 const button=(text,action,id='',cls='')=>`<button class="${cls}" data-action="${action}" data-id="${E(id)}">${text}</button>`;
 function announce(t){$('#announcer').textContent=t;}
 function save(){try{state.metadata.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));$('#save-status').textContent='Saved in this browser';}catch{storageOK=false;$('#save-status').textContent='Browser storage unavailable. Progress will not persist after closing. Export JSON to keep a copy.';}}
 function commit(fn,message='Changes saved.'){const before=DT.clone(state);
 try{fn(state);}catch(err){state=before;announce(err.message);return;}if(JSON.stringify(before)===JSON.stringify(state))return;
 history.push(before);
 if(history.length>20)history.shift();
 future=[];save();render();announce(message);}
 function modal(title,body,onSubmit,submit='Save'){const d=$('#dialog');d.oncancel=null;d.innerHTML=`<form><h2 id="dialog-title">${E(title)}</h2>${body}<p id="dialog-error" role="alert"></p><div class="dialog-actions"><button type="button" data-close>Cancel</button><button class="primary" type="submit">${E(submit)}</button></div></form>`;d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('form').onsubmit=e=>{e.preventDefault();
 try{const data=new FormData(e.target);onSubmit(data);d.close();}catch(err){$('#dialog-error').textContent=err.message;}};d.showModal();
 const focus=d.querySelector('input,textarea,select,button');focus?.focus();}
 function confirmChange(title,text,fn){modal(title,`<p>${E(text)}</p>`,()=>commit(fn), 'Apply change');}
 function options(value=''){return DT.factors(state).map(f=>`<option value="${f.id}" ${value===f.id?'selected':''}>${E(f.label||'Unnamed factor')}</option>`).join('');}
 function factorSelect(value=''){return `<label for="factor">Decision factor</label><select id="factor" name="factor" required>${value?'':'<option value="">Select a factor</option>'}${options(value)}</select><p id="reuse" class="hint"></p>`;}
 function reuseWatch(exclude){const input=$('#factor');
 if(!input)return;
 const update=()=>{$('#reuse').textContent=Object.values(state.nodes).some(n=>n.id!==exclude&&n.factorId===input.value)?'You have already used this factor elsewhere in your tree.':'';};input.addEventListener('change',update);update();}
 function setRoot(fid){if(state.rootNodeId){if(state.nodes[state.rootNodeId].factorId===fid)return;confirmChange('Change the root factor?', 'This replaces the factor in your root decision. All existing branches and outcomes remain in place. Review their criteria to decide whether they still express your intended logic.',s=>s.nodes[s.rootNodeId].factorId=fid);}else commit(s=>{const id=DT.id();s.rootNodeId=id;s.nodes[id]={id,type:'decision',factorId:fid,branches:[]};selected={type:'decision',id};});}
 function editBranch(bid){const b=state.branches[bid];modal('What criterion determines this branch?',`<label for="criterion">Branch criterion</label><textarea id="criterion" name="criterion" maxlength="240" placeholder="Enter your own threshold, category or condition">${E(b.criterion)}</textarea><p class="hint">A criterion is required for a complete branch. You can save an unfinished draft.</p>`,data=>commit(s=>s.branches[bid].criterion=data.get('criterion').trim()));}
 function nextTarget(bid){modal('What happens next?',`<label for="kind">Next step</label><select id="kind" name="kind" required><option value="">Select what happens next</option><option value="decision">Add another decision</option><option value="leaf">Add a final outcome</option></select><div id="target-fields"></div>`,data=>{const type=data.get('kind'),factor=data.get('factor'),label=data.get('outcome')?.trim();
 if(type==='decision'&&!factor)throw Error('Select the factor for this decision.');
 if(type==='leaf'&&!label)throw Error('Enter your own final outcome.');commit(s=>{const id=DT.id(),b=s.branches[bid];b.targetId=id;b.targetType=type;
 if(type==='decision'){s.nodes[id]={id,type,factorId:factor,branches:[]};selected={type,id};}else{s.leaves[id]={id,label};selected={type,id};}});});$('#kind').onchange=e=>{$('#target-fields').innerHTML=e.target.value==='decision'?factorSelect():e.target.value==='leaf'?'<label for="outcome">Final outcome</label><textarea id="outcome" name="outcome" maxlength="240" required placeholder="Describe your own final outcome"></textarea>':'';reuseWatch();};}
 function nodeEditor(){if(!selected)return '<h3>Edit your tree</h3><p>Select a node in the tree or the outline below to edit it.</p>';
 if(selected.type==='leaf'){const l=state.leaves[selected.id];
 if(!l)return '';
 return `<p class="eyebrow">FINAL OUTCOME</p><h3>${E(l.label)}</h3>${button('Edit outcome','edit-leaf',l.id)} ${button('Delete outcome','delete-leaf',l.id)}`;}
 const n=state.nodes[selected.id];
 if(!n)return '';
 const repeated=Object.values(state.nodes).filter(x=>x.factorId===n.factorId).length>1;
 return `<p class="eyebrow">${n.id===state.rootNodeId?'ROOT DECISION':'DECISION NODE'}</p><h3>${E(DT.label(state,n.factorId))}</h3>${repeated?'<p class="hint">You have already used this factor elsewhere in your tree.</p>':''}<div class="actions">${button('Add branch','add-branch',n.id,'primary')}${button('Change factor','change-factor',n.id)}${n.id!==state.rootNodeId?button('Move node','move',n.id)+button('Delete node','delete-node',n.id):'<span class="hint">Root protected from deletion</span>'}</div><h4>Outgoing branches (${n.branches.length})</h4>${n.branches.length<2?'<p class="hint">A complete decision needs at least two branches.</p>':''}${n.branches.map((bid,i)=>{const b=state.branches[bid];
 return `<section class="branch-card"><h4>Branch ${i+1}</h4><p>${E(b.criterion||'Criterion needed')}</p><div class="actions">${button('Edit criterion','edit-branch',bid)}${button('Delete branch','delete-branch',bid)}<button data-action="up" data-id="${bid}" ${i===0?'disabled':''} aria-label="Move branch ${i+1} up">↑ Up</button><button data-action="down" data-id="${bid}" ${i===n.branches.length-1?'disabled':''} aria-label="Move branch ${i+1} down">↓ Down</button></div>${b.targetId?`<p>Next: ${E(b.targetType==='decision'?DT.label(state,state.nodes[b.targetId].factorId):state.leaves[b.targetId].label)}</p>${button('Select next node','select-'+b.targetType,b.targetId)}`:button('What happens next?','next-target',bid,'primary')}</section>`;}).join('')}`;}
 function outline(nid=state.rootNodeId){const n=state.nodes[nid];
 if(!n)return '';
 return `<li>${button(E((nid===state.rootNodeId?'Root: ':'Decision: ')+DT.label(state,n.factorId)),'select-decision',nid)}<ul>${n.branches.map(bid=>{const b=state.branches[bid];
 return `<li><span>${E(b.criterion||'Criterion needed')}</span> ${button('Edit branch','edit-branch',bid)}${b.targetType==='decision'?`<ul>${outline(b.targetId)}</ul>`:b.targetType==='leaf'?button('Outcome: '+E(state.leaves[b.targetId].label),'select-leaf',b.targetId):button('Define next step','next-target',bid)}</li>`;}).join('')}</ul></li>`;}
 function readOnlyOutline(nid=state.rootNodeId){const n=state.nodes[nid];
 if(!n)return '';
 return `<li><strong>${E(DT.label(state,n.factorId))}</strong><ul>${n.branches.map(bid=>{const b=state.branches[bid];
 return `<li>${E(b.criterion||'Criterion needed')}${b.targetType==='decision'?`<ul>${readOnlyOutline(b.targetId)}</ul>`:` → ${E(b.targetType==='leaf'?state.leaves[b.targetId].label||'Outcome needs a label':'Next step not yet defined')}`}</li>`;}).join('')}</ul></li>`;}
 function workspace(review){return `<div class="workspace ${review?'review':''}"><section class="canvas-panel" aria-label="Decision tree workspace"><div class="canvas-toolbar"><div><strong>Your decision tree</strong><span class="legend"> Rounded box: decision · Square box: outcome</span></div><div class="actions">${button('−','zoom-out','','icon')}${button('+','zoom-in','','icon')}${button('Fit tree','fit')}${button('Full screen','fullscreen')}</div></div><p class="canvas-hint">${review?'Review your routes from root to final outcomes.':'Select a node to edit. Scroll in either direction to explore your tree.'}</p><div id="canvas" tabindex="0" aria-label="Scrollable decision tree. Use arrow keys to scroll."><div id="tree-svg">${DT.tree(state,!review).svg}</div></div></section>${review?'':`<aside id="editor" aria-label="Selected node editor">${nodeEditor()}</aside>`}</div>${review?`<details class="outline"><summary>Read your tree as text</summary><ul>${readOnlyOutline()}</ul></details>`:`<details class="outline"><summary>Tree outline · keyboard editing</summary><ul>${outline()}</ul></details>`}`;}
 function render(){const previousCanvas=$('#canvas');
 const scrollPosition=previousCanvas?{left:previousCanvas.scrollLeft,top:previousCanvas.scrollTop}:null;
 const focused=document.activeElement;
 const focusAction=focused?.dataset?.action;
 const focusId=focused?.dataset?.id;
 if(selected&&!(selected.type==='decision'?state.nodes[selected.id]:state.leaves[selected.id]))selected=null;$('#stages').innerHTML=names.map((name,i)=>`<button data-stage="${i}" ${stage===i?'aria-current="step"':''}><span>${i+1}</span> ${name}</button>`).join('');$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;$('#back').disabled=stage===0;$('#next').disabled=stage===3;$('#next').textContent=stage<3?'Continue to '+names[stage+1]:'Review';
 const issues=DT.validate(state);$('#status').textContent=issues.length?'In progress':'Structurally complete';$('#status').className=issues.length?'':'complete';
 if(checked)$('#validation').innerHTML=issues.length?`<div class="validation"><strong>Structure check</strong><ul>${issues.map(x=>'<li>'+E(x)+'</li>').join('')}</ul><p>This checks structure only, not your decision-making.</p></div>`:'<div class="validation"><strong>Structurally complete</strong><p>All routes through your tree currently end in terminal outcomes. This checks structure only, not your decision-making.</p></div>';else $('#validation').innerHTML='';
 let html='';
 if(stage===0){html=`<h2>1. Identify your decision factors</h2><p>Factors are variables or considerations that may influence a decision. You may use any subset of these factors, in an order you choose.</p><div class="factor-grid">${DT.provided.map(f=>`<article class="factor"><span class="tag">Provided factor</span><h3>${E(f.label)}</h3></article>`).join('')}</div><section class="custom-section"><h3>Add your own decision factors – optional</h3><p>${state.customFactors.length} of ${DT.maxCustom} additional factors added</p>${state.customFactors.map(f=>`<div class="custom-row"><span class="tag">Your factor</span><label for="custom-${f.id}">Factor name</label><input id="custom-${f.id}" data-custom="${f.id}" value="${E(f.label)}" maxlength="100" placeholder="Name your decision factor">${button('Delete','delete-custom',f.id)}</div>`).join('')}<button data-action="add-custom" ${state.customFactors.length>=DT.maxCustom?'disabled':''}>+ Add a factor</button></section>`;}
 if(stage===1){html=`<h2>2. Which factor should be considered first?</h2><p>The root node is the first decision in your tree. Choose the factor that you think should be considered first.</p><div class="factor-grid" role="group" aria-label="Select one root factor">${DT.factors(state).map(f=>`<button class="factor choice" data-action="root" data-id="${f.id}" aria-pressed="${state.nodes[state.rootNodeId]?.factorId===f.id}"><span class="tag">${f.type==='provided'?'Provided factor':'Your factor'}</span><strong>${E(f.label||'Unnamed factor')}</strong>${state.nodes[state.rootNodeId]?.factorId===f.id?'<span>✓ Selected root</span>':''}</button>`).join('')}</div>`;}
 if(stage===2)html=`<h2>3. Build your decision logic</h2><p>Add your own branch criteria, then decide what follows each route.</p>${state.rootNodeId?'':`<p class="validation">Select a root factor in stage 2 to begin. ${button('Choose root','go-root')}</p>`}${workspace(false)}`;
 if(stage===3)html=`<h2>4. Review your decision tree</h2><p>Follow each route and consider how your decisions lead to its outcome.</p>${workspace(true)}<h3>Your tree at a glance</h3>${DT.summaryHTML(state)}<details class="reflection"><summary>Reflect on your decision tree</summary><p>Optional: record your reasoning. These responses are included in JSON and print exports.</p>${DT.questions.map((q,i)=>`<details><summary>${i+1}. ${E(q)}</summary><label for="reflection-${i}">Your response</label><textarea id="reflection-${i}" data-reflection="${i}" rows="4">${E(state.reflections[i]||'')}</textarea></details>`).join('')}</details>${Object.keys(state.branches).length?`<details class="learning"><summary>From human decision trees to machine learning</summary><p>In this exercise, you manually selected the variables that mattered to you, chose the root node, created the branch rules, and determined the structure of the tree. You also defined the terminal outcomes. Each of these choices makes your own decision logic explicit. In a machine-learning decision tree, parts of this process can instead be derived algorithmically from training data. An algorithm compares alternative splits and identifies those that separate observations according to an outcome. The resulting tree reflects patterns in the data, the variables available, and the task it has been given. It does not necessarily express your personal priorities. Its usefulness also depends on whether the training data represent the situations in which the tree will be applied.</p><p><strong>If an algorithm were given data on thousands of students and their eventual university choices, do you think it would construct the same tree as you? Why or why not?</strong></p></details>`:''}`;
 $('#stage-content').innerHTML=html;applyZoom();
 if(scrollPosition&&$('#canvas'))$('#canvas').scrollTo(scrollPosition.left,scrollPosition.top);
 if(focusAction){const replacement=Array.from(document.querySelectorAll('[data-action]')).find(el=>el.dataset.action===focusAction&&el.dataset.id===focusId);
 if(replacement)replacement.focus({preventScroll:true});else if(!$('#dialog').open){const editor=$('#editor')||$('#stage-content');editor.setAttribute('tabindex','-1');editor.focus({preventScroll:true});}}const zoomIn=document.querySelector('[data-action="zoom-in"]'),zoomOut=document.querySelector('[data-action="zoom-out"]');zoomIn?.setAttribute('aria-label','Zoom in');zoomOut?.setAttribute('aria-label','Zoom out');}
 function applyZoom(){const svg=$('#tree-svg svg');
 if(svg){svg.style.width=Number(svg.getAttribute('width'))*zoom+'px';svg.style.height=Number(svg.getAttribute('height'))*zoom+'px';
 if(selected&&stage===2){const chosen=Array.from(svg.querySelectorAll('[data-tree-id]')).find(el=>el.dataset.treeId===selected.id);
 if(chosen){chosen.setAttribute('aria-pressed','true');
 const rect=chosen.querySelector('rect');rect.setAttribute('stroke','#9b3020');rect.setAttribute('stroke-width','3');}}}}
 function fit(){const svg=$('#tree-svg svg'),canvas=$('#canvas');
 if(svg&&canvas){zoom=Math.min(1,(canvas.clientWidth-24)/Number(svg.getAttribute('width')),(canvas.clientHeight-24)/Number(svg.getAttribute('height')));applyZoom();canvas.scrollTo(0,0);}}
 function go(i){stage=i;render();$('#main').focus();
 if(stage>=2)fit();}
 const actions={
 'go-root':()=>go(1),root:setRoot,
 'add-custom':()=>{if(state.customFactors.length>=DT.maxCustom)return;commit(s=>s.customFactors.push({id:DT.id(),label:'',type:'custom'}));
 const inputs=document.querySelectorAll('[data-custom]');inputs[inputs.length-1]?.focus();},
 'delete-custom':id=>{if(Object.values(state.nodes).some(n=>n.factorId===id)){modal('This factor is used in your tree','<p>Change the factor on each decision that uses it, or delete those decisions, before deleting this factor. This preserves your tree.</p>',()=>{},'Understood');return;}confirmChange('Delete this additional factor?','The factor will be removed from your available choices. Undo can restore it.',s=>s.customFactors=s.customFactors.filter(f=>f.id!==id));},
 'select-decision':id=>{selected={type:'decision',id};render();$('#editor').setAttribute('tabindex','-1');$('#editor').focus();},
 'select-leaf':id=>{selected={type:'leaf',id};render();$('#editor').setAttribute('tabindex','-1');$('#editor').focus();},
 'add-branch':id=>modal('What criterion determines this branch?','<label for="criterion">Branch criterion</label><textarea id="criterion" name="criterion" maxlength="240" placeholder="Enter your own threshold, category or condition"></textarea><p class="hint">A criterion is required for a complete branch. You can save an unfinished draft, then define what happens next.</p>',data=>commit(s=>{const bid=DT.id();s.branches[bid]={id:bid,sourceNodeId:id,criterion:data.get('criterion').trim(),targetType:null,targetId:null};s.nodes[id].branches.push(bid);}), 'Add branch'),
 'edit-branch':editBranch,'next-target':nextTarget,
 'change-factor':id=>{if(id===state.rootNodeId){go(1);return;}modal('Change decision factor',factorSelect(state.nodes[id].factorId)+'<p>Branches are preserved. Review whether their criteria still express your intended logic.</p>',data=>commit(s=>s.nodes[id].factorId=data.get('factor')));reuseWatch(id);},
 'edit-leaf':id=>modal('Edit final outcome',`<label for="outcome">Final outcome</label><textarea id="outcome" name="outcome" maxlength="240">${E(state.leaves[id].label)}</textarea><p class="hint">An empty outcome is saved as an incomplete draft.</p>`,data=>commit(s=>s.leaves[id].label=data.get('outcome').trim())),
 'delete-leaf':id=>confirmChange('Delete this outcome?','The outcome will be removed and its incoming branch will become incomplete.',s=>{const b=Object.values(s.branches).find(b=>b.targetId===id);DT.removeTarget(s,b);}),
 'delete-node':id=>{if(id===state.rootNodeId)return;confirmChange('Delete this decision and its subtree?',`This removes this decision and every branch, decision and outcome below it (${DT.descendants(state,id).size} decision nodes). Its incoming branch remains incomplete. Undo can restore the subtree.`,s=>DT.removeNode(s,id));},
 'delete-branch':id=>confirmChange('Delete this branch and its subtree?','This removes the criterion and every decision and outcome reached through this branch. Undo can restore the subtree.',s=>DT.removeBranch(s,id)),
 'move':id=>{const descendants=DT.descendants(state,id);
 const targets=Object.values(state.branches).filter(b=>!b.targetId&&!descendants.has(b.sourceNodeId));modal('Move decision and its subtree',`<p>Choose an empty destination branch. The entire subtree moves with this decision. Its previous branch becomes incomplete. Branches inside this subtree are excluded to prevent cycles.</p>${targets.length?`<label for="destination">Destination branch</label><select id="destination" name="destination" required><option value="">Select a branch</option>${targets.map(b=>`<option value="${b.id}">${E(DT.label(state,state.nodes[b.sourceNodeId].factorId))} · Branch ${state.nodes[b.sourceNodeId].branches.indexOf(b.id)+1}: ${E(b.criterion||'Criterion needed')}</option>`).join('')}</select>`:'<p>No eligible branches. Add an empty branch outside this subtree first.</p>'}`,data=>{if(!targets.length)return;commit(s=>DT.move(s,id,data.get('destination')));},targets.length?'Move subtree':'Understood');},
 'up':id=>reorder(id,-1),'down':id=>reorder(id,1),
 'zoom-in':()=>{zoom=Math.min(3,zoom*1.25);applyZoom();},'zoom-out':()=>{zoom=Math.max(.025,zoom/1.25);applyZoom();},fit,
 fullscreen:async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('.workspace').requestFullscreen)await $('.workspace').requestFullscreen();else announce('Full screen is unavailable in this browser. Use browser full screen instead.');}catch{announce('Full screen is unavailable.');}}
 };
 function reorder(id,delta){commit(s=>{const arr=s.nodes[s.branches[id].sourceNodeId].branches;
 const i=arr.indexOf(id),j=i+delta;
 if(j>=0&&j<arr.length)[arr[i],arr[j]]=[arr[j],arr[i]];});}
 document.addEventListener('click',e=>{const stageButton=e.target.closest('[data-stage]');
 if(stageButton){go(Number(stageButton.dataset.stage));return;}const action=e.target.closest('[data-action]');
 if(action)actions[action.dataset.action]?.(action.dataset.id);
 const node=e.target.closest('[data-tree-id]');
 if(node){if(node.dataset.treeType==='draft')nextTarget(node.dataset.treeId);else actions['select-'+node.dataset.treeType]?.(node.dataset.treeId);}const exp=e.target.closest('[data-export]');
 if(exp)DT.exportFile(state,exp.dataset.export).then(()=>announce('Export prepared.')).catch(err=>{modal('Export could not be completed',`<p>${E(err.message)}</p>`,()=>{},'Close');});});
 document.addEventListener('keydown',e=>{if(e.target.matches('[data-tree-id]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 // Save text without rebuilding focused inputs; one history entry per field edit.
 const editing=new WeakMap();
 document.addEventListener('focusin',e=>{if(e.target.matches('[data-custom],[data-reflection]'))editing.set(e.target,DT.clone(state));});
 document.addEventListener('input',e=>{const el=e.target;
 if(el.matches('[data-custom]'))state.customFactors.find(f=>f.id===el.dataset.custom).label=el.value;
 if(el.matches('[data-reflection]'))state.reflections[el.dataset.reflection]=el.value;
 if(el.matches('[data-custom],[data-reflection]')){save();
 const incomplete=DT.validate(state).length;$('#status').textContent=incomplete?'In progress':'Structurally complete';$('#status').className=incomplete?'':'complete';}});
 document.addEventListener('change',e=>{if(e.target.matches('[data-custom],[data-reflection]')){const before=editing.get(e.target);
 if(before){history.push(before);
 if(history.length>20)history.shift();
 future=[];$('#undo').disabled=false;$('#redo').disabled=true;}checked=false;$('#validation').innerHTML='';}});
 $('#undo').onclick=()=>{if(history.length){future.push(DT.clone(state));state=history.pop();save();render();announce('Change undone.');}};
 $('#redo').onclick=()=>{if(future.length){history.push(DT.clone(state));state=future.pop();save();render();announce('Change redone.');}};
 $('#check').onclick=()=>{checked=true;render();$('#validation').scrollIntoView({block:'nearest'});};$('#back').onclick=()=>go(Math.max(0,stage-1));$('#next').onclick=()=>go(Math.min(3,stage+1));
 $('#reset').onclick=()=>confirmChange('Reset exercise?','This removes your tree, additional factors and reflection responses from this exercise. Undo can restore it during this session.',s=>{Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,DT.fresh());stage=0;selected=null;});
 $('#dialog').addEventListener('close',()=>{if(document.activeElement===document.body){const target=$('#editor')||$('#stage-content');target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});
 window.addEventListener('beforeprint',()=>DT.preparePrint(state));
 render();
 let saved;
 try{const raw=localStorage.getItem(KEY);
 if(raw){saved=JSON.parse(raw);
 if(saved.metadata?.version!==1||!saved.nodes||!saved.branches||!saved.leaves||!Array.isArray(saved.customFactors)||!saved.reflections)throw Error('invalid');DT.checkSaved(saved);}localStorage.setItem(KEY+'-probe','1');localStorage.removeItem(KEY+'-probe');}catch{storageOK=false;$('#save-status').textContent='Saved work could not be read or browser storage is unavailable. Progress may not persist after closing.';}
 if(saved&&storageOK){state=saved;
 const d=$('#dialog');d.innerHTML='<h2 id="dialog-title">Continue your previous decision tree?</h2><p>Saved work was found in this browser.</p><div class="dialog-actions"><button id="start-new">Start a new tree</button><button id="continue" class="primary">Continue</button></div>';d.oncancel=e=>e.preventDefault();d.showModal();$('#continue').focus();$('#continue').onclick=()=>{d.oncancel=null;state=saved;stage=state.rootNodeId?2:0;selected=state.rootNodeId?{type:'decision',id:state.rootNodeId}:null;d.close();render();fit();};$('#start-new').onclick=()=>{d.oncancel=null;d.close();render();confirmChange('Start a new tree?','This replaces the saved exercise in this browser. Export it first by cancelling and continuing the previous tree if you want to keep it.',s=>Object.assign(s,DT.fresh()));};}
})();
