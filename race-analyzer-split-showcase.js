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
    function stop(){userOverride=true; if(box._raCycleTimer)clearInterval(box._raCycleTimer)}
    all('.ra-orbit-tab',box).forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        stop();
        activate(box,btn.getAttribute('data-slide'))
      },true)
    })
    box._raCycleTimer=setInterval(function(){
      if(userOverride)return;
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
  function moveRacecraftLeaderboardToTop(slide){
    if(!slide)return;
    var body=one('.ra-window-body',slide)||one('.snapshot-section-body',slide)||one('.ra-product-window',slide);
    if(!body)return;
    var candidates=all('section, article, div, table',body).filter(function(el){
      var t=(el.textContent||'').toLowerCase();
      return t.indexOf('racecraft leaderboard')!==-1 || (t.indexOf('driver')!==-1 && t.indexOf('passes')!==-1 && t.indexOf('defense')!==-1);
    });
    var target=candidates.sort(function(a,b){
      var at=(a.textContent||'').length, bt=(b.textContent||'').length;
      return at-bt;
    })[0];
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
    var tr=document.createElement('div'); tr.className='ra-orbit-tabs'; tr.setAttribute('role','tablist');
    var cr=document.createElement('div'); cr.className='ra-carousel';
    ids.forEach(function(id){
      var t=tabs.find(function(x){return x.getAttribute('data-slide')===id});
      var s=slides.find(function(x){return x.getAttribute('data-slide')===id});
      if(t)tr.appendChild(t); if(s){normalizeSlideLayout(s); if(id==='5')moveRacecraftLeaderboardToTop(s); cr.appendChild(s)}
    });
    renumber(tr); b.appendChild(h); b.appendChild(tr); b.appendChild(cr); activate(b,ids[0]); startAutoCycle(b,ids); return b;
  }
  function run(){
    var show=one('.ra-showcase#showcase'); if(!show||show.classList.contains('ra-split-showcase-ready'))return !!show;
    var c=one('.ra-container',show), tabsWrap=one('.ra-orbit-tabs',show), car=one('.ra-carousel',show); if(!c||!tabsWrap||!car)return false;
    var tabs=all('.ra-orbit-tab',tabsWrap), slides=all('.ra-slide',car); if(tabs.length<7||slides.length<7)return false;
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='0'}),'Race Summary','Start with the result: finish, starting position, race length, cautions, conditions, and the session context before diving into the evidence.');
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='3'}),'Long-Run Pace','Identify which laps and what part of the run separates you from the top runners.');
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='4'}),'Pace vs Consistency','See whether your speed comes with repeatability. Compare average pace against lap-to-lap consistency to spot drivers who are fast, stable, or leaving time through variation.');
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='2'}),'Pit Stop Performance','Break the stop into measurable phases and see where pit road gained or lost time against the field.');
    var craftSlide=slides.find(function(s){return s.getAttribute('data-slide')==='5'});
    setSlideCopy(craftSlide,'Racecraft Leaderboard','Rank the racecraft moments that changed the finish: passes, defense, traffic management, and position gains.');
    moveRacecraftLeaderboardToTop(craftSlide);
    setSlideCopy(slides.find(function(s){return s.getAttribute('data-slide')==='6'}),'Final Report','End with the complete summary: what happened, why it mattered, and what to work on before the next race.');
    var head=one('.ra-showcase-head p',show); if(head)head.textContent='Start with the race and pace story, then move into execution and the final report. The panels auto-cycle like a guided demo, but visitors can click any tab to take control.';
    var top=box('See the race through the software','Review the race summary, long-run pace, and consistency together before moving into execution.','Race & Pace',['0','3','4'],tabs,slides);
    var mid=document.createElement('div'); mid.className='ra-split-cta'; mid.innerHTML='<div><strong>Race pace tells part of the story. Execution explains the finish.</strong><p>After the race and pace review, GripIQ shows where pit stops, racecraft, and the final report changed the result.</p></div>';
    var bot=box('Execution and final report','Review pit performance, racecraft leaderboard, and the final report in a separate software-output box.','Execution',['2','5','6'],tabs,slides);
    tabsWrap.remove(); car.remove(); c.appendChild(top); c.appendChild(mid); c.appendChild(bot); show.classList.add('ra-split-showcase-ready'); return true;
  }
  function boot(){var n=0,t=setInterval(function(){n++; if(run()||n>50)clearInterval(t)},150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
})();
