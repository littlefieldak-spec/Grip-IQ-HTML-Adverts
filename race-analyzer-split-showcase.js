(function(){
  function one(s,r){return (r||document).querySelector(s)}
  function all(s,r){return Array.from((r||document).querySelectorAll(s))}
  function activate(box,id){
    all('.ra-orbit-tab',box).forEach(function(t){t.classList.toggle('active',t.getAttribute('data-slide')===id)})
    all('.ra-slide',box).forEach(function(sl){sl.classList.toggle('active',sl.getAttribute('data-slide')===id)})
  }
  function wire(box){
    all('.ra-orbit-tab',box).forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        activate(box,btn.getAttribute('data-slide'))
      },true)
    })
  }
  function renumber(root){all('.ra-orbit-tab',root).forEach(function(b,i){var s=b.querySelector('span'); if(s)s.textContent=String(i+1).padStart(2,'0')})}
  function box(title,desc,label,ids,tabs,slides){
    var b=document.createElement('div'); b.className='ra-split-box';
    var h=document.createElement('div'); h.className='ra-split-box-head';
    h.innerHTML='<div><h3>'+title+'</h3><p>'+desc+'</p></div><span class="ra-split-label">'+label+'</span>';
    var tr=document.createElement('div'); tr.className='ra-orbit-tabs'; tr.setAttribute('role','tablist');
    var cr=document.createElement('div'); cr.className='ra-carousel';
    ids.forEach(function(id){
      var t=tabs.find(function(x){return x.getAttribute('data-slide')===id});
      var s=slides.find(function(x){return x.getAttribute('data-slide')===id});
      if(t)tr.appendChild(t); if(s)cr.appendChild(s);
    });
    renumber(tr); b.appendChild(h); b.appendChild(tr); b.appendChild(cr); activate(b,ids[0]); wire(b); return b;
  }
  function run(){
    var show=one('.ra-showcase#showcase'); if(!show||show.classList.contains('ra-split-showcase-ready'))return !!show;
    var c=one('.ra-container',show), tabsWrap=one('.ra-orbit-tabs',show), car=one('.ra-carousel',show); if(!c||!tabsWrap||!car)return false;
    var tabs=all('.ra-orbit-tab',tabsWrap), slides=all('.ra-slide',car); if(tabs.length<7||slides.length<7)return false;
    var head=one('.ra-showcase-head p',show); if(head)head.textContent='Start with the race and pace story, then move into execution and the final report.';
    var top=box('See the race through the software','Review the race summary, long-run pace, and consistency together before moving into execution.','Race & Pace',['0','3','4'],tabs,slides);
    var mid=document.createElement('div'); mid.className='ra-split-cta'; mid.innerHTML='<div><strong>Race pace tells part of the story. Execution explains the finish.</strong><p>After the race and pace review, GripIQ shows where pit stops, racecraft, and the final report changed the result.</p></div>';
    var bot=box('Execution and final report','Review pit performance, racecraft leaderboard, and the final report in a separate software-output box.','Execution',['2','5','6'],tabs,slides);
    tabsWrap.remove(); car.remove(); c.appendChild(top); c.appendChild(mid); c.appendChild(bot); show.classList.add('ra-split-showcase-ready'); return true;
  }
  function boot(){var n=0,t=setInterval(function(){n++; if(run()||n>50)clearInterval(t)},150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
})();
