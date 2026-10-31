/* DEMO ONLY — strip on top of every page: "this is a demo", personal 7-day timer, reset. */
(function(){
  var WEEK = 7 * 24 * 3600 * 1000;
  function get(k){ try { return localStorage.getItem('bvmdemo_' + k); } catch(_) { return null; } }
  function del(k){ try { localStorage.removeItem('bvmdemo_' + k); } catch(_) {} }

  window.DemoTimer = {
    remaining: function(){
      var at = Number(get('signedAt'));
      if (!get('name') || !at) return null;
      return Math.max(0, at + WEEK - Date.now());
    },
    parts: function(r){
      return { d: Math.floor(r / 86400000), h: Math.floor(r / 3600000) % 24, m: Math.floor(r / 60000) % 60, s: Math.floor(r / 1000) % 60 };
    }
  };
  var pad = function(n){ return String(n).padStart(2, '0'); };

  var css = document.createElement('style');
  css.textContent =
    '.demo-strip{position:relative;z-index:100000;background:#E9B949;color:#1A1205;font:500 13px/1.4 Heebo,system-ui,sans-serif;direction:rtl}' +
    '.demo-strip__in{max-width:1400px;margin:0 auto;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;justify-content:space-between;padding:6px max(14px,env(safe-area-inset-right,0px)) 6px max(14px,env(safe-area-inset-left,0px))}' +
    '.demo-strip b{font-weight:800}' +
    '.demo-strip__timer{display:none;font-variant-numeric:tabular-nums;background:rgba(26,18,5,.1);border-radius:999px;padding:2px 10px;white-space:nowrap}' +
    '.demo-strip__timer.on{display:inline-block}' +
    '.demo-strip__btn{background:transparent;border:1px solid rgba(26,18,5,.4);border-radius:999px;padding:2px 12px;cursor:pointer;font:inherit;color:inherit;white-space:nowrap}' +
    '.demo-strip__grow{flex:1 1 220px;min-width:0}' +
    '.demo-toast{position:fixed;inset-inline:0;bottom:calc(84px + env(safe-area-inset-bottom,0px));margin:auto;width:max-content;max-width:calc(100% - 32px);z-index:100001;background:#103638;color:#F4F1EA;border:1px solid rgba(233,185,73,.5);border-radius:12px;padding:10px 16px;font:500 14px/1.5 Heebo,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);direction:rtl;text-align:center}';
  document.head.appendChild(css);

  var strip = document.createElement('div');
  strip.className = 'demo-strip';
  strip.innerHTML = '<div class="demo-strip__in">' +
    '<span class="demo-strip__grow"><b>גרסת הדגמה.</b> לא מחוברת לפורטל האמיתי, לתלמידים או לסליקה.</span>' +
    '<span class="demo-strip__timer" id="demoTimer">ההצעה האישית שלך: <b id="demoTimerTxt"></b></span>' +
    '<button type="button" class="demo-strip__btn" id="demoReset">להתחיל מההתחלה</button></div>';
  document.body.insertBefore(strip, document.body.firstChild);

  document.getElementById('demoReset').addEventListener('click', function(){
    ['name', 'email', 'signedAt', 'l1done', 'order'].forEach(del);
    try { sessionStorage.clear(); } catch(_) {}
    location.href = 'free-portal.html';
  });

  function tick(){
    var r = window.DemoTimer.remaining(), el = document.getElementById('demoTimer');
    if (r === null) { el.classList.remove('on'); return; }
    el.classList.add('on');
    var p = window.DemoTimer.parts(r);
    document.getElementById('demoTimerTxt').textContent = r > 0 ? (p.d + ' ימים ' + pad(p.h) + ':' + pad(p.m) + ':' + pad(p.s)) : 'הסתיימה';
    document.querySelectorAll('[data-demo-clock]').forEach(function(box){
      box.querySelector('[data-u="d"]').textContent = p.d;
      box.querySelector('[data-u="h"]').textContent = pad(p.h);
      box.querySelector('[data-u="m"]').textContent = pad(p.m);
      box.querySelector('[data-u="s"]').textContent = pad(p.s);
    });
  }
  tick(); setInterval(tick, 1000);

  window.demoToast = function(msg){
    var t = document.createElement('div'); t.className = 'demo-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 3200);
  };

  /* Pages that exist in this demo. Any other internal link shows a note instead of a 404. */
  var PAGES = ['free-portal.html', 'course-library.html', 'checkout.html'];
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#' || /^(https?:|mailto:|tel:|javascript:)/.test(href)) return;
    var file = href.split('#')[0].split('?')[0].split('/').pop();
    if (!file || PAGES.indexOf(file) !== -1) return;
    e.preventDefault(); e.stopPropagation();
    window.demoToast('בהדגמה הדף הזה לא כלול. בפורטל האמיתי הוא קיים ועובד.');
  }, true);
})();
