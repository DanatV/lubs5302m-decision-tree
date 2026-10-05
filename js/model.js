'use strict';
window.DT = (() => {
  const provided = ['University QS ranking','Price / tuition fees','Cost of living','University location','Recommendation from family or friends'].map((label,i)=>({id:'f'+i,label,type:'provided'}));
  const maxCustom = 3;
  const questions = ['Why did you choose this factor as your root node?','Which factor has the greatest influence on your final decision?','Are there factors in your tree that could be measured objectively and others that depend on personal judgement?','Would changing the order of the decision nodes change your eventual choice?','What information would you need to apply this decision tree to real universities?','Is there a factor that you initially thought was important but did not ultimately include?',"How might another student's decision tree differ from yours?"];
  const clone = x => JSON.parse(JSON.stringify(x));
  const id = () => 'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,9);
  const fresh = () => ({customFactors:[],rootNodeId:null,nodes:{},branches:{},leaves:{},reflections:{},metadata:{version:1}});
  const factors = s => [...provided,...s.customFactors];
  const label = (s,f) => factors(s).find(x=>x.id===f)?.label || 'Unnamed factor';
  function descendants(s,n, result=new Set()) {if(result.has(n))return result;result.add(n);
 for(const b of s.nodes[n]?.branches||[]){const x=s.branches[b];
 if(x?.targetType==='decision')descendants(s,x.targetId,result);}return result;}
  function removeTarget(s,b){if(b.targetType==='decision')removeNode(s,b.targetId);else if(b.targetType==='leaf')delete s.leaves[b.targetId];b.targetId=null;b.targetType=null;}
  function removeBranch(s,bid){const b=s.branches[bid];
 if(!b)return;removeTarget(s,b);
 const n=s.nodes[b.sourceNodeId];
 if(n)n.branches=n.branches.filter(x=>x!==bid);delete s.branches[bid];}
  function removeNode(s,nid){const n=s.nodes[nid];
 if(!n)return;[...n.branches].forEach(b=>removeBranch(s,b));delete s.nodes[nid];Object.values(s.branches).forEach(b=>{if(b.targetId===nid){b.targetId=null;b.targetType=null;}});}
  function move(s,nid,bid){const b=s.branches[bid];
 if(nid===s.rootNodeId||!s.nodes[nid]||!b||b.targetId||descendants(s,nid).has(b.sourceNodeId))throw Error('Choose an empty branch outside this subtree. A node cannot lead back to an ancestor.');Object.values(s.branches).forEach(x=>{if(x.targetId===nid){x.targetId=null;x.targetType=null;}});b.targetType='decision';b.targetId=nid;}
  function validate(s){const issues=[];
 const add=t=>issues.push(t);
 if(!s.rootNodeId||!s.nodes[s.rootNodeId])add('Select a root decision to begin your tree.');
 let short=0,criteria=0,missing=0,empty=0;
 const ids=new Set(factors(s).map(f=>f.id));
 for(const n of Object.values(s.nodes)){if(n.branches.length<2)short++;
 if(!ids.has(n.factorId))add('A decision uses a missing factor. Change its factor.');
 for(const bid of n.branches){const b=s.branches[bid];
 if(!b){add('A branch record is missing.');continue;}if(!b.criterion.trim())criteria++;
 if(!b.targetId||!(b.targetType==='decision'?s.nodes[b.targetId]:b.targetType==='leaf'?s.leaves[b.targetId]:null))missing++;}}
    for(const l of Object.values(s.leaves))if(!l.label.trim())empty++;
    if(short)add(`${short} decision node${short===1?' has':'s have'} fewer than two branches. Add branches to complete each decision.`);
    if(criteria)add(`${criteria} branch${criteria===1?' needs':'es need'} a decision criterion. Enter your own condition.`);
    if(missing)add(`${missing} branch${missing===1?' does':'es do'} not yet connect to a decision or final outcome. Define what happens next.`);
    if(empty)add(`${empty} terminal outcome${empty===1?' needs':'s need'} a label.`);
    if(s.customFactors.some(f=>!f.label.trim()))add('An additional factor is empty. Name or delete it.');
    const seen=new Set(),active=new Set(),seenB=new Set(),seenL=new Set();
 let cycle=false,shared=false;
    function visit(nid){if(active.has(nid)){cycle=true;return;}if(seen.has(nid)){shared=true;return;}const n=s.nodes[nid];
 if(!n)return;seen.add(nid);active.add(nid);
 for(const bid of n.branches){seenB.add(bid);
 const b=s.branches[bid];
 if(b?.sourceNodeId!==nid)add('A branch has an inconsistent source.');
 if(b?.targetType==='decision')visit(b.targetId);
 if(b?.targetType==='leaf'){if(seenL.has(b.targetId))shared=true;seenL.add(b.targetId);}}active.delete(nid);}
    visit(s.rootNodeId);
 if(cycle)add('A cycle leads back to an ancestor. Remove that connection.');
 if(shared)add('A target has more than one incoming branch.');
 if(Object.keys(s.nodes).some(x=>!seen.has(x))||Object.keys(s.leaves).some(x=>!seenL.has(x))||Object.keys(s.branches).some(x=>!seenB.has(x)))add('Some items are disconnected from the root.');
 return issues;
  }
  function checkSaved(s){
    if(s.customFactors.length>maxCustom||s.customFactors.some(f=>typeof f.id!=='string'||typeof f.label!=='string'))throw Error('Invalid saved factors');
    if(Object.values(s.nodes).some(n=>typeof n.id!=='string'||typeof n.factorId!=='string'||!Array.isArray(n.branches)||n.branches.some(b=>!s.branches[b])))throw Error('Invalid saved decisions');
    if(Object.values(s.branches).some(b=>typeof b.criterion!=='string'||!s.nodes[b.sourceNodeId]||(b.targetId&&!(b.targetType==='decision'?s.nodes[b.targetId]:b.targetType==='leaf'?s.leaves[b.targetId]:false))))throw Error('Invalid saved branches');
    if(Object.values(s.leaves).some(l=>typeof l.label!=='string'))throw Error('Invalid saved outcomes');
    if(Object.values(s.reflections).some(r=>typeof r!=='string'))throw Error('Invalid reflections');
    const errors=validate(s);
 if(errors.some(e=>/cycle|disconnected|incoming|inconsistent|missing factor/.test(e)))throw Error('Invalid saved connections');
  }
  return {checkSaved,provided,maxCustom,questions,clone,id,fresh,factors,label,descendants,removeTarget,removeBranch,removeNode,move,validate};
})();
