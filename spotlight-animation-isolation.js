/*
  Spotlight animation isolation patch.
  Replaces cross-fade slide transitions with a deterministic one-visible-slide-per-box swap.
*/
(function () {
  function all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function syncBox(box) {
    if (!box) return;
    var active = box.getAttribute('data-active-slide');
    if (!active) {
      var firstActive = box.querySelector('.ra-slide.active') || box.querySelector('.ra-slide');
      active = firstActive && firstActive.getAttribute('data-slide');
      if (active) box.setAttribute('data-active-slide', active);
    }
    all('.ra-slide', box).forEach(function (slide) {
      var isActive = slide.getAttribute('data-slide') === active;
      slide.classList.toggle('active', isActive);
      slide.classList.remove('ra-slide-incoming', 'ra-slide-outgoing');
    });
    all('.ra-orbit-tab', box).forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-slide') === active);
    });
  }

  function install() {
    var boxes = all('.ra-showcase.ra-split-showcase-ready .ra-split-box');
    if (!boxes.length) return false;

    boxes.forEach(function (box) {
      if (box.dataset.spotlightIsolated === '1') return;
      box.dataset.spotlightIsolated = '1';
      syncBox(box);

      all('.ra-orbit-tab', box).forEach(function (tab) {
        tab.addEventListener('click', function () {
          var id = tab.getAttribute('data-slide');
          if (!id) return;
          box.setAttribute('data-active-slide', id);
          syncBox(box);
        }, true);
      });

      var observer = new MutationObserver(function () {
        syncBox(box);
      });
      observer.observe(box, { attributes: true, attributeFilter: ['data-active-slide'] });
    });
    return true;
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (install() || tries > 80) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
