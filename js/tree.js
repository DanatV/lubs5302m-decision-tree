'use strict';
DT.escape = x => String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
DT.tree = function(s, interactive=false){
 const E=DT.escape,W=280,G=40, positions=[],edges=[];
 let maxLines=2;
 function wrap(text){
   // Conservative glyph widths avoid relying on unavailable fonts or canvas metrics.
   const width = text => Array.from(text).reduce((sum,c)=>sum+1.2*(/[MW@%]/.test(c)?15:/[A-Z]/.test(c)?11:/[il.,' :;!|]/.test(c)?5:c.codePointAt(0)>255?17:9),0);
   const lines=[];
 let line='';
   for(const word of String(text).split(/\s+/)){
     if(line&&width(line+' '+word)>248){lines.push(line);line='';}
     for(const c of Array.from(word)){
       if(width(line+c)>248){lines.push(line);line='';}
       line+=c;
     }
     line+=' ';
   }
   if(line.trim())lines.push(line.trim());
   return lines.length?lines.map(x=>x.trim()):[''];
 }
 function build(type,id,path=new Set()){if(type==='decision'&&path.has(id))return {type:'draft',id:'cycle',text:'Cycle detected',children:[],width:W};
 const n=type==='decision'?s.nodes[id]:s.leaves[id];
 const text=type==='decision'?DT.label(s,n?.factorId):type==='leaf'?n?.label||'Outcome needs a label':'What happens next?';
 const lines=wrap(text);maxLines=Math.max(maxLines,lines.length);
 const next=new Set(path);next.add(id);
 const children=(type==='decision'?n?.branches||[]:[]).map(bid=>{const b=s.branches[bid];
 const child=build(b?.targetType||'draft',b?.targetId||bid,next);child.branch=b;child.branchId=bid;child.criteria=wrap(b?.criterion||'Criterion needed');maxLines=Math.max(maxLines,child.criteria.length);
 return child;});
 return {id,type,text,lines,children,width:Math.max(W,children.reduce((sum,c)=>sum+c.width,0)+Math.max(0,children.length-1)*G)};}
 if(!s.nodes[s.rootNodeId])return {svg:'<svg xmlns="http://www.w3.org/2000/svg" width="700" height="220" viewBox="0 0 700 220"><rect width="700" height="220" fill="#fcf8f5"/><text x="350" y="110" text-anchor="middle" fill="#685951" font-family="Arial" font-size="18">Select a root factor to start your tree.</text></svg>',width:700,height:220};
 const root=build('decision',s.rootNodeId),H=62+maxLines*24, gap=70+maxLines*24;
 let depthMax=0;
 function place(n,left,depth){n.x=left+n.width/2;n.y=30+depth*(H+gap);positions.push(n);depthMax=Math.max(depthMax,depth);
 let x=left;
 for(const c of n.children){place(c,x,depth+1);edges.push({a:n,b:c});x+=c.width+G;}}
 place(root,24,0);
 const width=root.width+48,height=60+depthMax*(H+gap)+H;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="${interactive?'group':'img'}" aria-label="Your decision tree"><title>Your decision tree</title><rect width="100%" height="100%" fill="#fcf8f5"/>`;
 for(const {a,b} of edges){const y=a.y+H+24;out+=`<path d="M ${a.x} ${a.y+H} V ${y} H ${b.x} V ${b.y}" fill="none" stroke="#ad9284" stroke-width="2"/>`;
 const labelY=y+16;out+=`<rect x="${b.x-139}" y="${labelY-5}" width="278" height="${b.criteria.length*24+12}" rx="6" fill="#fcf8f5"/>`;b.criteria.forEach((line,i)=>out+=`<text x="${b.x}" y="${labelY+15+i*24}" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#59473e">${E(line)}</text>`);}
 for(const n of positions){const isRoot=n.id===s.rootNodeId;
 const attr=interactive?` tabindex="0" role="button" data-tree-id="${E(n.id)}" data-tree-type="${n.type}" aria-label="Edit ${E(n.type)}: ${E(n.text)}"`:'';out+=`<g${attr}><rect x="${n.x-W/2}" y="${n.y}" width="${W}" height="${H}" rx="${n.type==='leaf'?3:14}" fill="${n.type==='leaf'?'#fce9e2':'#ffffff'}" stroke="${isRoot?'#ac3525':'#ad9284'}" stroke-width="${isRoot?3:1.5}" ${n.type==='draft'?'stroke-dasharray="6 4"':''}/>`;out+=`<text x="${n.x}" y="${n.y+28}" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" letter-spacing="1.2" fill="#842719">${isRoot?'ROOT DECISION':n.type==='decision'?'DECISION':n.type==='leaf'?'FINAL OUTCOME':'INCOMPLETE BRANCH'}</text>`;n.lines.forEach((line,i)=>out+=`<text x="${n.x}" y="${n.y+57+i*24}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#302723">${E(line)}</text>`);out+='</g>';}
 return {svg:out+'</svg>',width,height};
};
DT.summary = function(s){const used=new Set(Object.values(s.nodes).map(n=>n.factorId));
 return {'Root decision':s.nodes[s.rootNodeId]?DT.label(s,s.nodes[s.rootNodeId].factorId):'Not selected','Decision nodes':Object.keys(s.nodes).length,'Branches':Object.keys(s.branches).length,'Terminal leaves':Object.keys(s.leaves).length,'Provided factors used':DT.provided.filter(f=>used.has(f.id)).map(f=>f.label).join(', ')||'None','Provided factors not used':DT.provided.filter(f=>!used.has(f.id)).map(f=>f.label).join(', ')||'None','Custom factors created':s.customFactors.map(f=>f.label||'Unnamed factor').join(', ')||'None','Custom factors used':s.customFactors.filter(f=>used.has(f.id)).map(f=>f.label||'Unnamed factor').join(', ')||'None'};};
DT.summaryHTML = s => '<dl class="summary-grid">'+Object.entries(DT.summary(s)).map(([k,v])=>`<div><dt>${DT.escape(k)}</dt><dd>${DT.escape(v)}</dd></div>`).join('')+'</dl>';
