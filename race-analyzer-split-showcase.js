(function(){
  function one(s,r){return (r||document).querySelector(s)}
  function all(s,r){return Array.from((r||document).querySelectorAll(s))}
  function activate(box,id){
    all('.ra-orbit-tab',box).forEach(function(t){t.classList.toggle('active',t.getAttribute('data-slide')===id)})
    all('.ra-slide',box).forEach(function(sl){sl.classList.toggle('active',sl.getAttribute('data-slide')===id)})
    box.setAttribute('data-active-slide',id)
    var active=one('.ra-slide.active',box), scroller=active&&one('.ra-window-body, .snapshot-section-body, [style*="overflow: auto"]',active);
    if(scroller&&scroller.scrollTo)scroller.scrollTo({top:0,left:0,behavior:'instant'});
  }
  function startAutoCycle(box,ids){
    var index=0;
    var userOverride=false;
    var hoverPaused=false;
    function stop(){userOverride=true; box.classList.add('ra-user-controlled'); if(box._raCycleTimer)clearInterval(box._raCycleTimer)}
    all('.ra-orbit-tab',box).forEach(function(btn){
      btn.addEventListener('mouseenter',function(){hoverPaused=true},true)
      btn.addEventListener('mouseleave',function(){hoverPaused=false},true)
      btn.addEventListener('focus',function(){hoverPaused=true},true)
      btn.addEventListener('blur',function(){hoverPaused=false},true)
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        stop();
        activate(box,btn.getAttribute('data-slide'))
      },true)
    })
    box._raCycleTimer=setInterval(function(){
      if(userOverride||hoverPaused)return;
      index=(index+1)%ids.length;
      activate(box,ids[index])
    },3000)
  }
  function renumber(root){all('.ra-orbit-tab',root).forEach(function(b,i){var s=b.querySelector('span'); if(s)s.textContent=String(i+1).padStart(2,'0')})}
  function normalizeSlideLayout(slide){
    if(!slide)return;
    var copy=one(':scope > .ra-slide-copy',slide)||one('.ra-slide-copy',slide);
    if(!copy)return;
    if(copy.parentElement!==slide)slide.insertBefore(copy,slide.firstChild);
    var product=one(':scope > .ra-product-window',slide);
    if(!product){
      var nested=one('.ra-product-window',slide);
      if(nested&&nested.parentElement!==slide){product=nested; slide.appendChild(product)}
    }
    if(!product){
      var rest=all(':scope > *',slide).filter(function(el){return el!==copy});
      if(rest.length){
        product=document.createElement('div');
        product.className='ra-product-window ra-product-window--wrapped';
        rest.forEach(function(el){product.appendChild(el)});
        slide.appendChild(product);
      }
    }
    if(product&&product.previousElementSibling!==copy){
      slide.insertBefore(copy,slide.firstChild);
      slide.insertBefore(product,copy.nextSibling);
    }
  }
  function anonymizePaceConsistency(slide){
    if(!slide)return;
    var replacements=[
      ['Andrew Littlefield','Race Craftsman'],['Andrew Littlef','Race Craftsman'],['Andrew Little','Race Craftsman'],['Andrew L','Race Craftsman'],
      ['Sebastian Roth','Sebastian Roth'],['Nico Bianchi','Nico Bianchi'],['Tomas Pereira','Tomas Pereira'],['Cole Reeves','Cole Reeves'],['Owen Brennan','Owen Brennan'],['Tristan Ladouc','Tristan Ladoux'],['Lucas Aaltonen','Lucas Aaltonen'],['Damian Krol','Damian Krol'],['Kai Sato','Kai Sato'],['Caleb Foster','Caleb Foster'],['Gavin Pearce','Gavin Pearce'],['Aiden Walsh','Aiden Walsh'],['Rafael Costa','Rafael Costa'],['Yann Marchetti','Yann Marchetti'],['Bruno Almeida','Bruno Almeida'],['Isaac Renner','Isaac Renner'],['Viktor Lindgren','Viktor Lindgren'],['Elias Novak','Elias Novak'],['Wyatt Hollis','Wyatt Hollis']
    ];
    var walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT,null);
    var nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var value=node.nodeValue;
      replacements.forEach(function(pair){value=value.split(pair[0]).join(pair[1])});
      value=value.replace(/Driver\s+0?1\b/g,'Sebastian Roth').replace(/Driver\s+0?2\b/g,'Nico Bianchi').replace(/Driver\s+0?3\b/g,'Tomas Pereira').replace(/Driver\s+0?4\b/g,'Cole Reeves').replace(/Driver\s+0?5\b/g,'Owen Brennan').replace(/Driver\s+0?6\b/g,'Tristan Ladoux').replace(/Driver\s+0?7\b/g,'Lucas Aaltonen').replace(/Driver\s+0?8\b/g,'Damian Krol').replace(/Driver\s+0?9\b/g,'Kai Sato').replace(/Driver\s+10\b/g,'Caleb Foster').replace(/Driver\s+11\b/g,'Gavin Pearce').replace(/Driver\s+12\b/g,'Aiden Walsh').replace(/Driver\s+13\b/g,'Rafael Costa').replace(/Driver\s+14\b/g,'Yann Marchetti').replace(/Driver\s+15\b/g,'Bruno Almeida').replace(/Driver\s+16\b/g,'Isaac Renner').replace(/Driver\s+17\b/g,'Viktor Lindgren').replace(/Driver\s+18\b/g,'Elias Novak').replace(/Driver\s+19\b/g,'Wyatt Hollis');
      node.nodeValue=value;
    });
  }
  function moveRacecraftLeaderboardToTop(slide){
    if(!slide)return;
    var body=one('.ra-window-body',slide)||one('.snapshot-section-body',slide)||one('.ra-product-window',slide);
    if(!body)return;
    var candidates=all('section, article, div, table',body).filter(function(el){
      var t=(el.textContent||'').toLowerCase();
      return t.indexOf('racecraft leaderboard')!==-1 || (t.indexOf('driver')!==-1 && t.indexOf('passes')!==-1 && t.indexOf('defense')!==-1);
    });
    var target=candidates.sort(function(a,b){return (a.textContent||'').length-(b.textContent||'').length})[0];
    if(target&&target.parentElement){
      var parent=target.parentElement;
      parent.insertBefore(target,parent.firstChild);
      var scrollers=all('[style*="overflow: auto"], .ra-window-body, .snapshot-section-body',slide);
      scrollers.forEach(function(s){if(s.scrollTo)s.scrollTo(0,0); else s.scrollTop=0});
    }
  }
  function setSlideCopy(slide,title,desc){
    if(!slide)return;
    var copy=one('.ra-slide-copy',slide);
    if(!copy){copy=document.createElement('div'); copy.className='ra-slide-copy'; slide.insertBefore(copy,slide.firstChild)}
    var kicker=one('.ra-slide-kicker',copy); if(!kicker){kicker=document.createElement('div'); kicker.className='ra-slide-kicker'; copy.insertBefore(kicker,copy.firstChild)}
    kicker.textContent='Actual Race Analyzer output';
    var h=one('h3',copy); if(!h){h=document.createElement('h3'); copy.appendChild(h)}
    h.textContent=title;
    var p=one('p',copy); if(!p){p=document.createElement('p'); copy.appendChild(p)}
    p.textContent=desc;
    normalizeSlideLayout(slide);
  }
  function box(title,desc,label,ids,tabs,slides){
    var b=document.createElement('div'); b.className='ra-split-box';
    var h=document.createElement('div'); h.className='ra-split-box-head';
    h.innerHTML='<div><h3>'+title+'</h3><p>'+desc+'</p></div><span class="ra-split-label">'+label+'</span>';
    var hint=document.createElement('div'); hint.className='ra-click-hint'; hint.innerHTML='<strong>Click to explore</strong><span>Click any tab to pause the animation and scan that report panel.</span>';
    var tr=document.createElement('div'); tr.className='ra-orbit-tabs'; tr.setAttribute('role','tablist');
    var cr=document.createElement('div'); cr.className='ra-carousel';
    ids.forEach(function(id){
      var t=tabs.find(function(x){return x.getAttribute('data-slide')===id});
      var s=slides.find(function(x){return x.getAttribute('data-slide')===id});
      if(t)tr.appendChild(t); if(s){normalizeSlideLayout(s); if(id==='4')anonymizePaceConsistency(s); if(id==='5')moveRacecraftLeaderboardToTop(s); cr.appendChild(s)}
    });
    renumber(tr); b.appendChild(h); b.appendChild(hint); b.appendChild(tr); b.appendChild(cr); activate(b,ids[0]); startAutoCycle(b,ids); return b;
  }
  function run(){
    var show=one('.ra-showcase#showcase'); if(!show||show.classList.contains('ra-split-showcase-ready'))return !!show;
    var c=one('.ra-container',show), tabsWrap=one('.ra-orbit-tabs',show), car=one('.ra-carousel',show); if(!c||!tabsWrap||!car)return false;
    var tabs=all('.ra-orbit-tab',tabsWrap), slides=all('.ra-slide',car); if(tabs.length<7||slides.length<7)return false;
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='0'}),'Race Summary','Understand the story of the race in seconds: where you started, where you finished, how the race unfolded, and what context matters before analyzing the details.');
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='3'}),'Long-Run Pace','Find the exact laps where top runners pulled away. Compare your green-flag pace to the best drivers and identify the parts of the run that cost time.');
    var paceConsistencySlide=slides.find(function(s){return s.getAttribute('data-slide')==='4'});
    setSlideCopy(paceConsistencySlide,'Pace vs Consistency','See whether you are slow, inconsistent, or both. Compare average pace against lap-to-lap variation so your next practice target is obvious.');
    anonymizePaceConsistency(paceConsistencySlide);
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='2'}),'Pit Stop Performance','Know whether pit road cost you positions. Break the stop into measurable phases and see where you gained or lost time against the field.');
    var craftSlide=slides.find(function(s){return s.getAttribute('data-slide')==='5'});
    setSlideCopy(craftSlide,'Racecraft Leaderboard','Identify who gained positions through clean passes, smart defense, traffic management, and racecraft decisions that changed the finish.');
    moveRacecraftLeaderboardToTop(craftSlide);
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='6'}),'Final Report','Leave with a focused plan for the next race: what happened, why it mattered, and what to improve before your next run.');
    var kicker=one('.ra-showcase-head .ra-kicker',show); if(kicker)kicker.textContent='Actual Race Analyzer output';
    var heading=one('.ra-showcase-head h2',show); if(heading)heading.textContent='Stop guessing why you finished where you finished.';
    var head=one('.ra-showcase-head p',show); if(head)head.textContent='GripIQ turns your race data into a clear breakdown of pace, consistency, pit execution, racecraft, and the next things to improve. The panels auto-cycle like a guided demo, but visitors can click any tab to take control.';
    var top=box('Understand your race before you analyze your laps','Start with the race story, then see whether the gap came from long-run pace, consistency, or both.','Race & Pace',['0','3','4'],tabs,slides);
    var mid=document.createElement('div'); mid.className='ra-split-cta'; mid.innerHTML='<div><strong>Race pace tells part of the story. Execution explains the finish.</strong><p>Once the pace picture is clear, GripIQ shows whether pit stops, traffic, passes, defense, and decision-making changed the result.</p></div>';
    var bot=box('Find the moments that changed the finish','Review pit performance, racecraft, and the final report as a separate execution breakdown.','Execution',['2','5','6'],tabs,slides);
    var final=document.createElement('div'); final.className='ra-split-cta ra-split-cta--final'; final.innerHTML='<div><strong>Ready to stop guessing what cost you positions?</strong><p>Upload a run and get a race breakdown built from your actual iRacing data.</p></div><a href="#pricing">Get Race Analyzer Early Access</a>';
    tabsWrap.remove(); car.remove(); c.appendChild(top); c.appendChild(mid); c.appendChild(bot); c.appendChild(final); show.classList.add('ra-split-showcase-ready'); return true;
  }
  function boot(){var n=0,t=setInterval(function(){n++; if(run()||n>50)clearInterval(t)},150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
})();
