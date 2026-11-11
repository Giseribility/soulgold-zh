(function(){
'use strict';
var SPRITE='https://eemeliri.github.io/soulgold/';
var TYPE_ORDER=['一般','格斗','飞行','毒','地面','岩石','虫','幽灵','钢','火','水','草','电','超能力','冰','龙','恶','妖精','星晶','暗影','???'];
var TCOLOR={'一般':'#8a8a6a','格斗':'#b83a3a','飞行':'#8a72d6','毒':'#9a3a98','地面':'#c9a94f','岩石':'#a8933a','虫':'#92a51a','幽灵':'#6a4f8c','钢':'#8c8ca6','火':'#d9682a','水':'#4f7ad6','草':'#5aa83a','电':'#c9a800','超能力':'#d94f7a','冰':'#4fb3b0','龙':'#5a2ad6','恶':'#5a4a3a','妖精':'#c26a9a','星晶':'#2f9a8c','暗影':'#4a4258','???':'#8a8a8a'};
var STATS=[['hp','HP'],['atk','攻击'],['def','防御'],['spa','特攻'],['spd','特防'],['spe','速度']];

var SP=window.SG_SPECIES||[],AB=window.SG_ABILITIES||[],MV=window.SG_MOVES||[],IT=window.SG_ITEMS||[],TM=window.SG_MACHINES||[],ENC=window.SG_ENCOUNTERS||[],TR=window.SG_TRAINERS||[],FR=window.SG_FRONTIER||[];
var SPbySlug={},spByName={},ABbyName={},MVbySlug={},MVbyName={},ITbySlug={};
SP.forEach(function(s){SPbySlug[s.slug]=s;if(!spByName[s.name])spByName[s.name]=s;});
AB.forEach(function(a){if(!ABbyName[a.name])ABbyName[a.name]=a;});
MV.forEach(function(m){MVbySlug[m.slug]=m;if(!MVbyName[m.name])MVbyName[m.name]=m;});
IT.forEach(function(i){ITbySlug[i.slug]=i;});

var view='dex', q='', typeFilter='全部';
var stack=[];

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tbadge(t){var c=TCOLOR[t]||'#888';return '<span class="tbadge" style="background:'+c+'">'+esc(t)+'</span>';}
function imgTag(path,cls){var src=SPRITE+String(path||'').replace(/^\//,'');return '<img class="'+cls+'" loading="lazy" src="'+src+'" alt="" onerror="this.style.display=\'none\';this.parentNode.insertAdjacentHTML(\'beforeend\',\'<span class=&quot;ph&quot;>?</span>\')">';}
function monImg(path){return path?imgTag(path,'mini'):'<span class="mini ph">?</span>';}
function ico(p,c){return p?imgTag(p,c):'';}
function typeLink(name){
  var s=spByName[name];
  return s?('<a class="ilink" data-open="species:'+esc(s.slug)+'">'+esc(name)+'</a>'):esc(name);
}
function moveLink(name){var m=MVbyName[name];return m?('<a class="ilink" data-open="move:'+esc(m.slug)+'">'+esc(name)+'</a>'):esc(name);}
function abLink(name){return ABbyName[name]?('<a class="ilink" data-open="ability:'+esc(name)+'">'+esc(name)+'</a>'):esc(name);}

var TABS=[
 {id:'dex',label:'图鉴',typeFilter:true},
 {id:'moves',label:'招式',typeFilter:true},
 {id:'abilities',label:'特性'},
 {id:'items',label:'道具'},
 {id:'machines',label:'技能机'},
 {id:'encounters',label:'遭遇'},
 {id:'trainers',label:'训练师'},
 {id:'frontier',label:'开拓区'}
];

function curTab(){for(var i=0;i<TABS.length;i++)if(TABS[i].id===view)return TABS[i];return TABS[0];}

/* ---------- tabs ---------- */
function buildTabs(){
  document.getElementById('tabs').innerHTML=TABS.map(function(t){return '<button class="tab'+(t.id===view?' active':'')+'" data-view="'+t.id+'">'+t.label+'</button>';}).join('');
}
function buildTypeBar(){
  var bar=document.getElementById('toolbar');
  bar.querySelectorAll('.chip').forEach(function(n){n.remove();});
  var t=curTab();
  if(!t.typeFilter){return;}
  var present={};var src=view==='moves'?MV:SP;
  src.forEach(function(s){ (s.types||[s.type]).forEach(function(x){present[x]=1;});});
  var list=['全部'].concat(TYPE_ORDER.filter(function(x){return present[x];}));
  list.forEach(function(x){
    var b=document.createElement('button');b.className='chip'+(x===typeFilter?' active':'');b.textContent=x;
    if(x!=='全部'){ if(x===typeFilter){b.style.background=TCOLOR[x];b.style.borderColor='transparent';b.style.color='#fff';}else{b.style.borderColor=TCOLOR[x];b.style.color=TCOLOR[x];}}
    else if(x===typeFilter){b.style.background='#3b5bdb';b.style.borderColor='transparent';b.style.color='#fff';}
    b.onclick=function(){typeFilter=x;render();};
    bar.insertBefore(b,bar.querySelector('#count'));
  });
}

/* ---------- list renderers ---------- */
function matchDex(s){ if(typeFilter!=='全部'&&s.types.indexOf(typeFilter)<0)return false; if(!q)return true;var k=q.toLowerCase();return s.name.indexOf(q)>=0||(s.en&&s.en.toLowerCase().indexOf(k)>=0)||String(s.dex)===q;}
function renderDex(){
  var list=SP.filter(matchDex);
  document.getElementById('count').textContent='共 '+list.length+' 只（含形态）';
  document.getElementById('view').innerHTML='<div class="grid">'+list.map(function(s){
    return '<div class="pcard" data-open="species:'+esc(s.slug)+'"><div class="dex">#'+s.dex+'</div><div class="thumb">'+imgTag(s.sprite,'')+'</div><div class="nm">'+esc(s.name)+'</div><div class="en">'+esc(s.en)+'</div><div class="types">'+s.types.map(tbadge).join('')+'</div></div>';
  }).join('')+'</div>';
}
function matchMove(m){ if(typeFilter!=='全部'&&m.type!==typeFilter)return false; if(!q)return true;var k=q.toLowerCase();return m.name.indexOf(q)>=0||(m.en&&m.en.toLowerCase().indexOf(k)>=0)||(m.desc&&m.desc.indexOf(q)>=0);}
function renderMoves(){
  var list=MV.filter(matchMove);
  document.getElementById('count').textContent='共 '+list.length+' 个招式';
  document.getElementById('view').innerHTML='<div class="rows">'+list.map(function(m){
    return '<div class="row" data-open="move:'+esc(m.slug)+'"><div class="rname">'+ico(m.icon,'ticon')+esc(m.name)+tbadge(m.type)+'<span class="rcat '+m.cat+'">'+esc(m.cat)+'</span></div>'+
      '<div class="rstats">威力 '+(m.power||'-')+' · 命中 '+(m.acc||'-')+' · PP '+(m.pp||'-')+(m.prio?' · 优先'+m.prio:'')+'</div>'+
      '<div class="rdesc">'+esc(m.desc||'')+'</div></div>';
  }).join('')+'</div>';
}
function matchAb(a){ if(!q)return true;var k=q.toLowerCase();return a.name.indexOf(q)>=0||(a.en&&a.en.toLowerCase().indexOf(k)>=0)||(a.desc&&a.desc.indexOf(q)>=0);}
function renderAb(){
  var list=AB.filter(matchAb);
  document.getElementById('count').textContent='共 '+list.length+' 个特性';
  document.getElementById('view').innerHTML='<div class="rows">'+list.map(function(a){
    var badge=a.kind==='official'?'<span class="badge off">官方</span>':'<span class="badge cus">自制</span>';
    return '<div class="row" data-open="ability:'+esc(a.name)+'"><div class="rname">'+esc(a.name)+badge+'<span class="ren">'+esc(a.en)+'</span></div><div class="rdesc">'+esc(a.desc||'—')+'</div></div>';
  }).join('')+'</div>';
}
function matchIt(x){ if(!q)return true;var k=q.toLowerCase();return x.name.indexOf(q)>=0||(x.en&&x.en.toLowerCase().indexOf(k)>=0)||(x.desc&&x.desc.indexOf(q)>=0);}
function renderItems(){
  var list=IT.filter(matchIt);
  document.getElementById('count').textContent='共 '+list.length+' 个道具';
  document.getElementById('view').innerHTML='<div class="rows">'+list.map(function(x){
    return '<div class="row" data-open="item:'+esc(x.slug)+'"><div class="rname">'+ico(x.icon,'iicon')+esc(x.name)+'<span class="tpocket">'+esc(x.pocket)+'</span></div><div class="rdesc">'+esc(x.desc||'')+'</div></div>';
  }).join('')+'</div>';
}
function matchTm(x){ if(!q)return true;var k=q.toLowerCase();return x.name.indexOf(q)>=0||x.label.toLowerCase().indexOf(k)>=0||(x.locs.join(' ').indexOf(q)>=0);}
function renderTm(){
  var list=TM.filter(matchTm);
  document.getElementById('count').textContent='共 '+list.length+' 个技能机';
  document.getElementById('view').innerHTML='<div class="rows">'+TM.map(function(x,i){return {x:x,i:i};}).filter(function(o){return matchTm(o.x);}).map(function(o){var x=o.x;
    return '<div class="row" data-open="machine:'+o.i+'"><div class="rname">'+ico(x.icon,'ticon')+'<b>'+esc(x.label)+'</b> '+esc(x.name)+tbadge(x.type)+'<span class="rcat '+x.cat+'">'+esc(x.cat)+'</span></div><div class="rdesc">'+esc(x.desc||'')+' · 获得：'+esc(x.locs.join('；')||'—')+'</div></div>';
  }).join('')+'</div>';
}
function matchEnc(e){ if(!q)return true;var k=q.toLowerCase();return e.name.indexOf(q)>=0;}
function renderEnc(){
  var list=ENC.map(function(e,i){return{e:e,i:i};}).filter(function(o){return matchEnc(o.e);});
  document.getElementById('count').textContent='共 '+list.length+' 个地点';
  document.getElementById('view').innerHTML='<div class="rows">'+list.map(function(o){var e=o.e;
    var cnt=0; e.variants.forEach(function(v){v.methods.forEach(function(m){cnt+=m.mons.length;});});
    return '<div class="row" data-open="encounter:'+o.i+'"><div class="rname">'+ico(e.sprite,'mini')+esc(e.name)+'</div><div class="rdesc">'+e.variants.length+' 个时段 · 共 '+cnt+' 条遇敌记录</div></div>';
  }).join('')+'</div>';
}
function matchTr(t){ if(!q)return true;var k=q.toLowerCase();return (t.name||'').toLowerCase().indexOf(k)>=0||t.locs.join(' ').indexOf(q)>=0;}
function renderTr(){
  var list=TR.map(function(t,i){return{t:t,i:i};}).filter(function(o){return matchTr(o.t);});
  document.getElementById('count').textContent='共 '+list.length+' 名训练师';
  document.getElementById('view').innerHTML='<div class="rows">'+list.map(function(o){var t=o.t;
    return '<div class="row" data-open="trainer:'+o.i+'"><div class="rname">'+ico(t.sprite,'tricon')+esc(t.name)+'<span class="tpocket">'+esc(t.difficulty)+' · Lv.'+esc(t.avg)+'</span></div><div class="rdesc">'+esc(t.locs.join('、')||'—')+' · '+t.party.length+' 只宝可梦</div></div>';
  }).join('')+'</div>';
}
function matchFr(f){ if(!q)return true;var k=q.toLowerCase();return f.species.indexOf(q)>=0||(f.item&&f.item.toLowerCase().indexOf(k)>=0)||(f.ability&&f.ability.indexOf(q)>=0);}
function renderFr(){
  var list=FR.map(function(f,i){return{f:f,i:i};}).filter(function(o){return matchFr(o.f);});
  document.getElementById('count').textContent='共 '+list.length+' 套开拓区配置';
  document.getElementById('view').innerHTML='<div class="rows">'+list.slice(0,800).map(function(o){var f=o.f;
    return '<div class="row" data-open="frontier:'+o.i+'"><div class="rname">'+ico(f.sprite,'mini')+typeLink(f.species)+'<span class="tpocket">'+esc(f.ability)+' · '+esc(f.nature)+'</span></div><div class="rdesc">'+esc(f.item||'无道具')+' · '+f.moves.map(function(m){return esc(m);}).join(' / ')+'</div></div>';
  }).join('')+'</div>'+(list.length>800?'<div class="morenote">仅显示前 800 条，请用搜索缩小范围</div>':'');
}

function render(){
  buildTabs();buildTypeBar();
  if(view==='dex')renderDex();else if(view==='moves')renderMoves();else if(view==='abilities')renderAb();else if(view==='items')renderItems();else if(view==='machines')renderTm();else if(view==='encounters')renderEnc();else if(view==='trainers')renderTr();else if(view==='frontier')renderFr();
}

/* ---------- modal ---------- */
function navBtns(){return '<div class="mnav">'+(stack.length>1?'<button class="mback" data-back="1">← 返回</button>':'')+'<button class="mclose" data-close="1">✕</button></div>';}
function statBars(st){var mx=200;return STATS.map(function(p){var v=st[p[0]]||0;var w=Math.min(100,Math.round(v/mx*100));return '<div class="statrow"><span class="lab">'+p[1]+'</span><span class="val">'+v+'</span><div class="bar"><i style="width:'+w+'%"></i></div></div>';}).join('');}
function abGroup(title,arr){if(!arr||!arr.length)return '';var u=[];arr.forEach(function(n){if(u.indexOf(n)<0)u.push(n);});return '<div class="sect"><h3>'+title+'</h3><div class="chips">'+u.map(function(n){return '<span class="abchip'+(ABbyName[n]?' link" data-open="ability:'+esc(n):'')+'">'+esc(n)+'</span>';}).join('')+'</div></div>';}

function detailSpecies(slug){
  var s=SPbySlug[slug];if(!s)return '<div class="mempty">未找到</div>';
  var cats=(s.categories&&s.categories.length)?'<div class="sect"><h3>分类</h3><div class="chips">'+s.categories.map(function(c){return '<span class="cat">'+esc(c)+'</span>';}).join('')+'</div></div>':'';
  return '<div class="mhead">'+navBtns()+'<div class="mimg">'+imgTag(s.sprite,'')+'</div><div><div class="mdex">No.'+s.dex+'</div><h2>'+esc(s.name)+'</h2><div class="men">'+esc(s.en)+'</div><div class="types" style="margin-top:6px">'+s.types.map(tbadge).join('')+'</div></div></div>'+
   '<div class="mbody"><div class="sect"><h3>种族值 · 合计 '+s.bst+'</h3>'+statBars(s.stats)+'</div>'+abGroup('常规特性',s.regular)+abGroup('隐藏特性',s.hidden)+abGroup('固有特性',s.innate)+cats+'</div>';
}
function detailAbility(name){var a=ABbyName[name];var kind=a?(a.kind==='official'?'<span class="badge off">官方</span>':'<span class="badge cus">自制</span>'):'';
  return '<div class="mhead">'+navBtns()+'<div><h2>'+esc(name)+'</h2>'+(a&&a.en?'<div class="men">'+esc(a.en)+'</div>':'')+'</div></div><div class="mbody"><div class="sect"><h3>特性说明 '+kind+'</h3><div class="abdesc">'+esc(a&&a.desc?a.desc:'—')+'</div></div></div>';}
function detailMove(slug){var m=MVbySlug[slug];if(!m)return '<div class="mempty">未找到</div>';
  return '<div class="mhead">'+navBtns()+'<div><h2>'+esc(m.name)+'</h2><div class="men">'+esc(m.en)+'</div><div class="types" style="margin-top:6px">'+ico(m.icon,'ticon')+tbadge(m.type)+'<span class="rcat '+m.cat+'">'+esc(m.cat)+'</span></div></div></div>'+
   '<div class="mbody"><div class="sect"><h3>招式数据</h3><div class="chips">'+
   '<span class="abchip">威力 '+(m.power||'-')+'</span><span class="abchip">命中 '+(m.acc||'-')+'</span><span class="abchip">PP '+(m.pp||'-')+'</span><span class="abchip">优先度 '+(m.prio||0)+'</span></div></div>'+
   '<div class="sect"><h3>说明</h3><div class="abdesc">'+esc(m.desc||'—')+'</div></div></div>';}
function detailItem(slug){var x=ITbySlug[slug];if(!x)return '<div class="mempty">未找到</div>';
  return '<div class="mhead">'+navBtns()+'<div class="mimg">'+ico(x.icon,'')+'</div><div><h2>'+esc(x.name)+'</h2><div class="men">'+esc(x.en)+' · '+esc(x.pocket)+'</div></div></div>'+
   '<div class="mbody"><div class="sect"><h3>说明</h3><div class="abdesc">'+esc(x.desc||'—')+'</div></div>'+
   (x.locs&&x.locs.length?'<div class="sect"><h3>获得地点</h3><div class="chips">'+x.locs.map(function(l){return '<span class="abchip">'+esc(l)+'</span>';}).join('')+'</div></div>':'')+'</div>';}
function detailMachine(i){var x=TM[i];if(!x)return '<div class="mempty">未找到</div>';
  return '<div class="mhead">'+navBtns()+'<div class="mimg">'+ico(x.icon,'')+'</div><div><h2>'+esc(x.label)+' '+esc(x.name)+'</h2><div class="men">'+esc(x.name)+' · '+esc(x.type)+' · '+esc(x.cat)+'</div></div></div>'+
   '<div class="mbody"><div class="sect"><h3>招式数据</h3><div class="chips"><span class="abchip">威力 '+(x.power||'-')+'</span><span class="abchip">命中 '+(x.acc||'-')+'</span><span class="abchip">PP '+(x.pp||'-')+'</span></div></div>'+
   '<div class="sect"><h3>说明</h3><div class="abdesc">'+esc(x.desc||'—')+'</div></div>'+
   '<div class="sect"><h3>获得地点</h3><div class="chips">'+(x.locs.length?x.locs.map(function(l){return '<span class="abchip">'+esc(l)+'</span>';}).join(''):'—')+'</div></div></div>';}
function detailEncounter(i){var e=ENC[i];if(!e)return '<div class="mempty">未找到</div>';
  var body=e.variants.map(function(v){
    var methods=v.methods.map(function(m){
      var rows=m.mons.map(function(o){return '<tr><td>'+monImg(o.sprite)+' '+typeLink(o.name)+'</td><td class="num">'+(o.min===o.max?('Lv.'+o.min):('Lv.'+o.min+'-'+o.max))+'</td><td class="num">'+o.rate+'%</td></tr>';}).join('');
      return '<div class="subsec"><div class="subt">'+esc(m.method)+'</div><table class="mtab"><thead><tr><th>宝可梦</th><th>等级</th><th>概率</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    }).join('');
    return '<div class="sect"><h3>'+esc(v.time)+'</h3>'+methods+'</div>';
  }).join('');
  return '<div class="mhead">'+navBtns()+'<div><h2>'+esc(e.name)+'</h2><div class="men">野外遭遇</div></div></div><div class="mbody">'+body+'</div>';}
function detailTrainer(i){var t=TR[i];if(!t)return '<div class="mempty">未找到</div>';
  var party=t.party.map(function(p){
    return '<div class="pmon"><div class="pmh">'+monImg(p.sprite)+' <b>'+typeLink(p.name)+'</b> <span class="lvl">Lv.'+esc(p.level)+'</span></div>'+
      '<div class="pmi">特性：'+esc(p.ability||'—')+(p.innate&&p.innate.length?' · 固有：'+p.innate.map(function(a){return esc(a);}).join('/'):'')+(p.item?' · 道具：'+esc(p.item):'')+'</div>'+
      '<div class="pmm">'+p.moves.map(function(m){return '<span class="abchip">'+esc(m)+'</span>';}).join('')+'</div></div>';
  }).join('');
  return '<div class="mhead">'+navBtns()+'<div class="mimg">'+ico(t.sprite,'')+'</div><div><h2>'+esc(t.name)+'</h2><div class="men">'+esc(t.difficulty)+' · 平均 Lv.'+esc(t.avg)+' · '+esc(t.locs.join('、')||'—')+'</div></div></div>'+
   '<div class="mbody"><div class="sect"><h3>队伍（'+t.party.length+'）</h3>'+party+'</div></div>';}
function detailFrontier(i){var f=FR[i];if(!f)return '<div class="mempty">未找到</div>';
  return '<div class="mhead">'+navBtns()+'<div><h2>'+typeLink(f.species)+'</h2><div class="men">'+esc(f.ability||'')+' · '+esc(f.nature||'')+'</div></div></div>'+
   '<div class="mbody"><div class="sect"><h3>配置</h3><div class="chips"><span class="abchip">道具：'+esc(f.item||'无')+'</span></div></div>'+
   '<div class="sect"><h3>招式</h3><div class="chips">'+f.moves.map(function(m){var mm=MVbyName[m];return '<span class="abchip'+(mm?' link" data-open="move:'+esc(mm.slug):'')+'">'+esc(m)+'</span>';}).join('')+'</div></div>'+
   '<div class="sect"><h3>努力值 / 个体值</h3><div class="chips"><span class="abchip">EV '+esc(f.evs.join('/'))+'</span><span class="abchip">IV '+esc(f.ivs.join('/'))+'</span></div></div></div>';}

function renderModal(){
  if(!stack.length){closeModal();return;}
  var top=stack[stack.length-1],html='';
  if(top.t==='species')html=detailSpecies(top.k);
  else if(top.t==='ability')html=detailAbility(top.k);
  else if(top.t==='move')html=detailMove(top.k);
  else if(top.t==='item')html=detailItem(top.k);
  else if(top.t==='machine')html=detailMachine(+top.k);
  else if(top.t==='encounter')html=detailEncounter(+top.k);
  else if(top.t==='trainer')html=detailTrainer(+top.k);
  else if(top.t==='frontier')html=detailFrontier(+top.k);
  document.getElementById('modal').innerHTML=html;
  document.getElementById('modal').scrollTop=0;
  document.getElementById('overlay').classList.add('show');
}
function openDetail(t,k){stack.push({t:t,k:k});renderModal();}
function back(){if(stack.length){stack.pop();}renderModal();}
function closeModal(){stack=[];document.getElementById('overlay').classList.remove('show');}

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  var o=e.target.closest('[data-open]');if(o){e.preventDefault();var v=o.getAttribute('data-open');var idx=v.indexOf(':');openDetail(v.slice(0,idx),v.slice(idx+1));return;}
  if(e.target.closest('[data-back]')){e.preventDefault();back();return;}
  if(e.target.closest('[data-close]')){e.preventDefault();closeModal();return;}
  var tab=e.target.closest('.tab');if(tab){view=tab.getAttribute('data-view');typeFilter='全部';q='';document.getElementById('q').value='';render();return;}
  if(e.target.id==='overlay'){closeModal();}
});
document.getElementById('q').addEventListener('input',function(e){q=e.target.value.trim();render();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});

render();
})();
