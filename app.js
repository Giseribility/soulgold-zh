(function(){
  'use strict';
  var SPRITE = 'https://eemeliri.github.io/soulgold/';
  var TYPE_ORDER = ['一般','格斗','飞行','毒','地面','岩石','虫','幽灵','钢','火','水','草','电','超能力','冰','龙','恶','妖精','星晶','暗影','???'];
  var TCOLOR = {
    '一般':'#8a8a6a','格斗':'#b83a3a','飞行':'#8a72d6','毒':'#9a3a98','地面':'#c9a94f',
    '岩石':'#a8933a','虫':'#92a51a','幽灵':'#6a4f8c','钢':'#8c8ca6','火':'#d9682a',
    '水':'#4f7ad6','草':'#5aa83a','电':'#c9a800','超能力':'#d94f7a','冰':'#4fb3b0',
    '龙':'#5a2ad6','恶':'#5a4a3a','妖精':'#c26a9a','星晶':'#2f9a8c','暗影':'#4a4258','???':'#8a8a8a'
  };
  var STATS = [['hp','HP'],['atk','攻击'],['def','防御'],['spa','特攻'],['spd','特防'],['spe','速度']];

  var SP = window.SG_SPECIES || [];
  var AB = window.SG_ABILITIES || [];
  var SPbySlug = {}; SP.forEach(function(s){ SPbySlug[s.slug]=s; });
  var ABbyName = {}; AB.forEach(function(a){ if(!ABbyName[a.name]) ABbyName[a.name]=a; });

  var view='dex', q='', typeFilter='全部';

  function el(tag, cls, html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function tbadge(t){ var c=TCOLOR[t]||'#888'; return '<span class="tbadge" style="background:'+c+'">'+esc(t)+'</span>'; }
  function imgTag(path, cls){
    var src=SPRITE+(path||'').replace(/^\//,'');
    return '<img class="'+cls+'" loading="lazy" src="'+src+'" alt="" onerror="this.style.display=\'none\';this.parentNode.insertAdjacentHTML(\'beforeend\',\'<span class=&quot;ph&quot;>?</span>\')">';
  }

  // ---- type chips ----
  function builtTypeBar(){
    var bar=document.getElementById('typebar');
    var present={}; SP.forEach(function(s){ s.types.forEach(function(t){present[t]=1;}); });
    var list=['全部'].concat(TYPE_ORDER.filter(function(t){return present[t];}));
    bar.querySelectorAll('.chip').forEach(function(n){n.remove();});
    list.forEach(function(t){
      var b=el('button','chip'+(t===typeFilter?' active':''), esc(t));
      if(t!=='全部'){ b.style.borderColor=TCOLOR[t]; b.style.color= t===typeFilter?'#fff':(TCOLOR[t]); if(t===typeFilter){b.style.background=TCOLOR[t];b.style.borderColor='transparent';} }
      else if(t===typeFilter){ b.style.background='#3b5bdb'; b.style.borderColor='transparent'; b.style.color='#fff'; }
      b.onclick=function(){ typeFilter=t; builtTypeBar(); renderDex(); };
      bar.insertBefore(b, bar.querySelector('.result-count'));
    });
  }

  // ---- dex ----
  function matchSp(s){
    if(typeFilter!=='全部' && s.types.indexOf(typeFilter)<0) return false;
    if(!q) return true;
    var k=q.toLowerCase();
    return (s.name&&s.name.indexOf(q)>=0) || (s.en&&s.en.toLowerCase().indexOf(k)>=0) || (String(s.dex)===k);
  }
  function renderDex(){
    var grid=document.getElementById('dexGrid');
    var list=SP.filter(matchSp);
    document.getElementById('dexCount').textContent='共 '+list.length+' 只（含形态）';
    if(!list.length){ grid.innerHTML='<div class="empty">没有匹配的宝可梦</div>'; return; }
    var html=list.map(function(s){
      var types=s.types.map(tbadge).join('');
      return '<div class="pcard" data-slug="'+s.slug+'">'+
        '<div class="dex">#'+s.dex+'</div>'+
        '<div class="thumb">'+imgTag(s.sprite,'')+'</div>'+
        '<div class="nm">'+esc(s.name)+'</div>'+
        '<div class="en">'+esc(s.en)+'</div>'+
        '<div class="types">'+types+'</div>'+
      '</div>';
    }).join('');
    grid.innerHTML=html;
    grid.querySelectorAll('.pcard').forEach(function(n){ n.onclick=function(){ openDetail(n.getAttribute('data-slug')); }; });
  }

  // ---- ability ----
  function matchAb(a){
    if(!q) return true;
    var k=q.toLowerCase();
    return (a.name&&a.name.indexOf(q)>=0) || (a.en&&a.en.toLowerCase().indexOf(k)>=0) || (a.desc&&a.desc.indexOf(q)>=0);
  }
  function renderAb(){
    var box=document.getElementById('abList');
    var list=AB.filter(matchAb);
    document.getElementById('abCount').textContent='共 '+list.length+' 个特性';
    if(!list.length){ box.innerHTML='<div class="empty">没有匹配的特性</div>'; return; }
    box.innerHTML=list.map(function(a){
      var badge = a.kind==='official' ? '<span class="badge off">官方</span>' : '<span class="badge cus">自制</span>';
      return '<div class="abcard" data-ab="'+esc(a.name)+'"><div>'+
        '<div class="an">'+esc(a.name)+badge+'<span class="en">'+esc(a.en)+'</span></div>'+
        '<div class="ad">'+esc(a.desc||'—')+'</div>'+
      '</div></div>';
    }).join('');
    box.querySelectorAll('.abcard').forEach(function(n){
      n.onclick=function(){ openAbility(n.getAttribute('data-ab')); };
    });
  }

  // ---- detail modal ----
  function openDetail(slug){
    var s=SPbySlug[slug]; if(!s) return;
    var maxStat=200;
    var bars=STATS.map(function(p){
      var v=s.stats[p[0]]||0; var w=Math.min(100, Math.round(v/ maxStat *100));
      return '<div class="statrow"><span class="lab">'+p[1]+'</span><span class="val">'+v+'</span><div class="bar"><i style="width:'+w+'%"></i></div></div>';
    }).join('');
    var abGroup=function(title,arr){
      if(!arr||!arr.length) return '';
      var uniq=[]; arr.forEach(function(n){ if(uniq.indexOf(n)<0) uniq.push(n); });
      return '<div class="sect"><h3>'+title+'</h3><div class="chips">'+uniq.map(function(n){
        var a=ABbyName[n]; var tip=a&&a.desc?(' title="'+esc(a.desc)+'"'):'';
        var link=a?' link" data-ab="'+esc(n):'';
        return '<span class="abchip'+link+'"'+tip+'>'+esc(n)+(a?'<span class="go">›</span>':'')+'</span>';
      }).join('')+'</div></div>';
    };
    var cats = (s.categories&&s.categories.length)?'<div class="sect"><h3>分类</h3><div class="chips">'+s.categories.map(function(c){return '<span class="cat">'+esc(c)+'</span>';}).join('')+'</div></div>':'';
    var html=
      '<div class="mhead">'+
        '<div class="mimg">'+imgTag(s.sprite,'')+'</div>'+
        '<div><div class="mdex">No.'+s.dex+'</div><h2>'+esc(s.name)+'</h2><div class="men">'+esc(s.en)+'</div>'+
          '<div class="types" style="margin-top:6px">'+s.types.map(tbadge).join('')+'</div>'+
        '</div>'+
        '<button class="mclose" id="mclose">✕</button>'+
      '</div>'+
      '<div class="mbody">'+
        '<div class="sect"><h3>种族值 · 合计 '+s.bst+'</h3>'+bars+'</div>'+
        abGroup('常规特性', s.regular)+
        abGroup('隐藏特性', s.hidden)+
        abGroup('固有特性', s.innate)+
        cats+
      '</div>';
    var m=document.getElementById('modal');
    m.innerHTML=html;
    document.getElementById('overlay').classList.add('show');
    document.getElementById('mclose').onclick=closeModal;
    m.querySelectorAll('.abchip[data-ab]').forEach(function(n){
      n.onclick=function(e){ e.stopPropagation(); openAbility(n.getAttribute('data-ab')); };
    });
  }
  function openAbility(name){
    var a=ABbyName[name];
    var kind = a ? (a.kind==='official'?'<span class="badge off">官方</span>':'<span class="badge cus">自制</span>') : '';
    var body = a && a.desc ? esc(a.desc) : '暂无描述';
    var html='<div class="mhead"><div><h2>'+esc(name)+'</h2>'+
        (a&&a.en?'<div class="men">'+esc(a.en)+'</div>':'')+'</div>'+
        '<button class="mclose" id="mclose">✕</button></div>'+
      '<div class="mbody"><div class="sect"><h3>特性说明 '+kind+'</h3>'+
        '<div class="abdesc">'+body+'</div>'+
        (a&&a.en?'<div class="absent">英文名：'+esc(a.en)+'</div>':'')+
      '</div></div>';
    var m=document.getElementById('modal');
    m.innerHTML=html;
    document.getElementById('overlay').classList.add('show');
    document.getElementById('mclose').onclick=closeModal;
  }
  function closeModal(){ document.getElementById('overlay').classList.remove('show'); }

  // ---- wiring ----
  document.querySelectorAll('.tab').forEach(function(t){
    t.onclick=function(){
      view=t.getAttribute('data-view');
      document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');});
      t.classList.add('active');
      document.getElementById('dexView').style.display = view==='dex'?'':'none';
      document.getElementById('abilityView').style.display = view==='ability'?'':'none';
      if(view==='dex') renderDex(); else renderAb();
    };
  });
  document.getElementById('q').addEventListener('input', function(e){
    q=e.target.value.trim(); if(view==='dex') renderDex(); else renderAb();
  });
  document.getElementById('overlay').addEventListener('click', function(e){ if(e.target.id==='overlay') closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });

  builtTypeBar(); renderDex();
})();
