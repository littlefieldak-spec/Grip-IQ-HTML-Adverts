(function () {
  function cleanLabel(text) {
    return (text || '').replace(/^\s*\d+\s*/, '').replace(/\s+/g, ' ').trim();
  }

  function tabControls() {
    return Array.from(document.querySelectorAll('button, a, [role="button"], [data-tab], [data-slide], [tabindex]'));
  }

  function findControl(matchers) {
    return tabControls().find(function (el) {
      var label = cleanLabel(el.textContent).toLowerCase();
      return matchers.some(function (m) { return label.indexOf(m) !== -1; });
    });
  }

  function relabel(el, label) {
    if (!el) return;
    var textNodes = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (node.nodeValue && node.nodeValue.trim() && !/^\s*\d+\s*$/.test(node.nodeValue)) {
        textNodes.push(node);
      }
    }
    if (textNodes.length) {
      textNodes[textNodes.length - 1].nodeValue = ' ' + label;
    } else {
      var prefix = (el.textContent.match(/^\s*\d+/) || [''])[0];
      el.textContent = prefix ? prefix + ' ' + label : label;
    }
    el.setAttribute('aria-label', label);
  }

  function commonParent(elements) {
    var paths = elements.map(function (el) {
      var path = [];
      while (el) {
        path.push(el);
        el = el.parentElement;
      }
      return path;
    });
    return paths[0].find(function (candidate) {
      return paths.every(function (path) { return path.indexOf(candidate) !== -1; });
    });
  }

  function hidePositionFlowPanels() {
    Array.from(document.querySelectorAll('section, article, div')).forEach(function (el) {
      var label = cleanLabel(el.textContent).toLowerCase();
      if ((label.startsWith('position flow') || label.indexOf('position flow') !== -1) &&
          !['BUTTON', 'A'].includes(el.tagName) &&
          el.querySelector('canvas, img, svg, table, h2, h3')) {
        el.style.display = 'none';
      }
    });
  }

  function run() {
    if (document.querySelector('.gripiq-tab-groups')) return true;

    var raceSummary = findControl(['race summary']);
    var positionFlow = findControl(['position flow']);
    var pitStop = findControl(['pit stop time', 'pit stop performance']);
    var longRun = findControl(['compare long-run pace', 'long-run pace', 'long run pace']);
    var consistency = findControl(['pace vs consistency']);
    var racecraft = findControl(['racecraft leaderboard', 'racecraft leader board']);
    var finalReport = findControl(['final report']);

    var required = [raceSummary, pitStop, longRun, consistency, racecraft, finalReport].filter(Boolean);
    if (required.length < 5) return false;

    relabel(longRun, 'Long-Run Pace');
    relabel(pitStop, 'Pit Stop Performance');
    relabel(racecraft, 'Racecraft Leaderboard');

    if (positionFlow) positionFlow.remove();
    hidePositionFlowPanels();

    var parent = commonParent(required);
    if (!parent || parent === document.body || parent === document.documentElement) return false;

    var wrapper = document.createElement('div');
    wrapper.className = 'gripiq-tab-groups';

    var analysis = document.createElement('div');
    analysis.className = 'gripiq-tab-box gripiq-tab-box--analysis';

    var execution = document.createElement('div');
    execution.className = 'gripiq-tab-box gripiq-tab-box--execution';

    [raceSummary, longRun, consistency].forEach(function (el) {
      if (el) analysis.appendChild(el);
    });

    [pitStop, racecraft, finalReport].forEach(function (el) {
      if (el) execution.appendChild(el);
    });

    wrapper.appendChild(analysis);
    wrapper.appendChild(execution);
    parent.insertBefore(wrapper, parent.firstChild);
    return true;
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (run() || tries > 40) clearInterval(timer);
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
