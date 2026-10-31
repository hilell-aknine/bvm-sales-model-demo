/* DEMO ONLY — the new sales model on top of the real portal page.
   Theory lessons: free. Practice: lesson 1 free, lessons 2+ locked.
   Products: practitioner completion 390, master 1,900 (6,200 struck). */
(function(){
  var COUNTS = window.DEMO_EX_COUNTS || [];
  var L1 = window.DEMO_L1_EX || [];
  var TOTAL_EX = COUNTS.reduce(function(a, m){ return a + m.reduce(function(x, y){ return x + y; }, 0); }, 0);
  function get(k){ try { return localStorage.getItem('bvmdemo_' + k); } catch(_) { return null; } }
  function set(k, v){ try { localStorage.setItem('bvmdemo_' + k, String(v)); } catch(_) {} }
  function del(k){ try { localStorage.removeItem('bvmdemo_' + k); } catch(_) {} }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function isFirst(m, l){ return m === 0 && l === 0; }

  /* ── sidebar tags ── */
  window.demoLessonTags = function(m, l){
    var practice = isFirst(m, l)
      ? '<span class="dm-tag dm-tag--free"><i class="fa-solid fa-video"></i> תרגול פתוח</span>'
      : (ownPractice(m, l)
        ? '<span class="dm-tag dm-tag--lock"><i class="fa-solid fa-lock"></i> תרגול מצולם</span>'
        : '<span class="dm-tag dm-tag--lock"><i class="fa-solid fa-lock"></i> תרגול</span>');
    return '<span class="dm-tags"><span class="dm-tag dm-tag--free">חינם</span>' + practice + '</span>';
  };

  /* ── under the video ── */
  var pr;
  function resetPr(){ pr = { i: 0, answered: false, picked: [], matched: {}, selLeft: null }; }
  resetPr();

  function quiz(){ return document.getElementById('dmQuiz') || host(); }
  function host(){
    var h = document.getElementById('demoPractice');
    if (!h) {
      h = document.createElement('section');
      h.id = 'demoPractice'; h.className = 'dm-practice';
      var anchor = document.getElementById('lessonPractice');
      anchor.parentNode.insertBefore(h, anchor.nextSibling);
    }
    return h;
  }

  /* ── recorded practice: Ram working live with the group (full practitioner course, unlisted on YouTube) ── */
  var PREVIEW_SEC = 45;
  var PRACTICE = [
    { name: 'טיול בין עמדות', m: 1, l: 5, g: 14, parts: [['4a1SaKfDKWY', '21:14'], ['cc5-lSX5a_A', '21:13'], ['cYUESWdTuZc', '21:12']] },
    { name: 'מערכות ייצוג', m: 3, l: 3, g: 25, parts: [['w929S8tMEag', '7:19']] },
    { name: 'דרייבר', m: 3, l: 4, g: 26, parts: [['78Cl7L58fqI', '2:48']] },
    { name: 'מפה קרוס', m: 3, l: 6, g: 28, parts: [['0Hm3AX5yrvE', '30:39'], ['kOtIrPHcR0Q', '31:41']] },
    { name: '6 שלבים (עבודה עם חלקים)', m: 4, l: 4, g: 33, parts: [['fz3TF1heoCY', '19:47'], ['pqAkH1jirZA', '19:49']] },
    { name: 'סוויש', m: 4, l: 6, g: 35, parts: [['UKppE__k9oo', '17:41'], ['dHkg3FKnhwU', '16:51']] },
    { name: 'יצירת עוגן', m: 5, l: 7, g: 43, parts: [['wW-00qyGcMk', '9:17']] }
  ];
  var VIDEO_COUNT = PRACTICE.reduce(function(a, p){ return a + p.parts.length; }, 0);
  var SIZES = [8, 6, 7, 7, 7, 8, 8];
  function gIndex(m, l){ var g = l + 1; for (var i = 0; i < m; i++) g += SIZES[i]; return g; }
  function ownPractice(m, l){ return PRACTICE.filter(function(p){ return p.m === m && p.l === l; })[0] || null; }
  function practiceFor(m, l){
    var g = gIndex(m, l), own = ownPractice(m, l);
    if (own) return { p: own, own: true };
    var next = PRACTICE.filter(function(p){ return p.g > g; })[0];
    return { p: next || PRACTICE[3], own: false, later: !!next };
  }
  window.DEMO_PRACTICE = PRACTICE;

  function partsList(p, openFirst){
    return '<ul class="dm-parts">' + p.parts.map(function(pt, k){
      var open = openFirst && k === 0;
      return '<li class="' + (open ? 'is-open' : '') + '"><i class="fa-solid ' + (open ? 'fa-circle-play' : 'fa-lock') + '"></i>' +
        '<span>' + esc(p.name) + (p.parts.length > 1 ? ' · חלק ' + (k + 1) : '') + '</span><bdi>' + pt[1] + '</bdi></li>';
    }).join('') + '</ul>';
  }

  var ytWait = null;
  function withYT(cb){
    if (window.YT && window.YT.Player) return cb();
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    }
    clearInterval(ytWait);
    ytWait = setInterval(function(){ if (window.YT && window.YT.Player) { clearInterval(ytWait); cb(); } }, 150);
  }

  var teaser = { player: null, timer: null };
  window.__demoTeaser = teaser; // for automated checks only
  function stopTeaser(){
    clearInterval(teaser.timer); teaser.timer = null;
    try { if (teaser.player && teaser.player.destroy) teaser.player.destroy(); } catch(_) {}
    teaser.player = null;
  }

  function mountPlayer(videoId, limit){
    stopTeaser();
    withYT(function(){
      var mount = document.getElementById('dmVidMount');
      if (!mount) return;
      teaser.player = new YT.Player('dmVidMount', {
        host: 'https://www.youtube-nocookie.com',
        videoId: videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, hl: 'he' },
        events: { onStateChange: function(e){
          if (!limit) return;
          if (e.data === YT.PlayerState.PLAYING) {
            clearInterval(teaser.timer);
            teaser.timer = setInterval(function(){
              var t = 0; try { t = teaser.player.getCurrentTime(); } catch(_) {}
              if (t >= limit) { try { teaser.player.pauseVideo(); teaser.player.seekTo(limit, true); } catch(_) {} lockOverlay(true); }
            }, 250);
          }
        } }
      });
    });
  }

  function lockOverlay(on){
    var o = document.getElementById('dmVidLock');
    if (o) o.hidden = !on;
  }

  function renderLesson1Video(){
    var p = PRACTICE[0];
    return '<div class="dm-card dm-vcard">' +
      '<div class="dm-head"><h3><i class="fa-solid fa-video"></i> תרגול חי עם רם</h3><span class="dm-tag dm-tag--free">פתוח בחינם</span></div>' +
      '<p class="dm-vsub">ככה נראה תרגול בקורס: רם עובד עם הקבוצה על <b>' + esc(p.name) + '</b>, הטכניקה הראשונה בקורס. החלק הראשון פתוח לכם במלואו.</p>' +
      '<div class="dm-vid"><div id="dmVidMount"></div></div>' +
      partsList(p, true) +
      '<p class="dm-vnote"><i class="fa-solid fa-lock"></i> עוד ' + (VIDEO_COUNT - 1) + ' סרטוני תרגול מצולמים של 7 טכניקות נפתחים עם השלמת הפרקטישנר.</p>' +
    '</div>' +
    '<div id="dmQuiz"></div>';
  }

  function renderTeaser(m, l){
    var r = practiceFor(m, l), p = r.p;
    var label = r.own ? 'התרגול של השיעור הזה' : (r.later ? 'בהמשך הקורס תתרגלו' : 'מתוך התרגולים בקורס');
    var n = (COUNTS[m] && COUNTS[m][l]) || 0;
    var minutes = p.parts.reduce(function(a, pt){ var x = pt[1].split(':'); return a + Number(x[0]) + Number(x[1]) / 60; }, 0);
    return '<div class="dm-card dm-vcard dm-vcard--locked">' +
      '<div class="dm-head"><h3><i class="fa-solid fa-video"></i> ' + label + ': ' + esc(p.name) + '</h3><span class="dm-tag dm-tag--lock"><i class="fa-solid fa-lock"></i> ' + PREVIEW_SEC + ' שניות ראשונות</span></div>' +
      '<div class="dm-vid">' +
        '<div id="dmVidMount"></div>' +
        '<div class="dm-vlock" id="dmVidLock" hidden>' +
          '<div class="dm-vlock__in">' +
            '<div class="dm-locked__icon"><i class="fa-solid fa-lock"></i></div>' +
            '<h4>רוצים לראות את ההמשך?</h4>' +
            '<p>בתרגול הזה רם עובד עם הקבוצה כ-' + Math.round(minutes) + ' דקות. כל התרגולים המצולמים נפתחים עם השלמת הפרקטישנר.</p>' +
            '<a href="#master-sales" class="lms-ms-cta dm-locked__cta"><i class="fa-solid fa-lock-open"></i> לפתוח את כל התרגולים</a>' +
            '<button type="button" class="dm-ghost" id="dmReplay"><i class="fa-solid fa-rotate-left"></i> לצפות שוב בהתחלה</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      partsList(p, false) +
      (n ? '<p class="dm-vnote"><i class="fa-solid fa-list-check"></i> ובנוסף ' + n + ' תרגילים בשאלות על השיעור הזה, עם הסבר על כל תשובה.</p>' : '') +
    '</div>';
  }

  window.demoAfterLesson = function(m, l){
    resetPr();
    var gamePane = document.querySelector('[data-pane="game"]');
    var gameTab = document.querySelector('.lms-tab[data-tab="game"]');
    if (isFirst(m, l)) {
      if (gamePane) gamePane.classList.remove('dm-locked-pane');
      if (gameTab) gameTab.classList.remove('dm-tab-locked');
      host().innerHTML = renderLesson1Video();
      mountPlayer(PRACTICE[0].parts[0][0], 0);
      if (get('l1done') === '1') practiceDone(); else renderPractice();
    } else {
      host().innerHTML = renderTeaser(m, l);
      var vid = practiceFor(m, l).p.parts[0][0];
      mountPlayer(vid, PREVIEW_SEC);
      document.getElementById('dmReplay').addEventListener('click', function(){
        lockOverlay(false);
        try { teaser.player.seekTo(0, true); teaser.player.playVideo(); } catch(_) {}
      });
      if (gamePane) gamePane.classList.add('dm-locked-pane');
      if (gameTab) gameTab.classList.add('dm-tab-locked');
    }
  };

  function renderPractice(){
    var ex = L1[pr.i]; if (!ex) return practiceDone();
    var letters = ['א', 'ב', 'ג', 'ד'];
    var prog = L1.map(function(_, k){ return '<i class="' + (k < pr.i ? 'done' : k === pr.i ? 'cur' : '') + '"></i>'; }).join('');
    var body = '';
    if (['multiple-choice', 'fill-blank', 'scenario'].indexOf(ex.type) !== -1) {
      if (ex.context) body += '<p class="dm-ctx">' + esc(ex.context) + '</p>';
      if (ex.template) body += '<p class="dm-tmpl">' + esc(ex.template).replace('___', '<b>&nbsp;</b>') + '</p>';
      body += '<div class="dm-opts">' + ex.options.map(function(o, k){ return '<button type="button" class="dm-opt" data-k="' + k + '"><span class="dm-k">' + letters[k] + '</span><span>' + esc(o) + '</span></button>'; }).join('') + '</div>';
    } else if (ex.type === 'compare') {
      body += '<div class="dm-opts dm-opts--2">' + [ex.optionA, ex.optionB].map(function(o, k){ return '<button type="button" class="dm-opt dm-opt--col" data-k="' + k + '"><span class="dm-k">' + esc(o.label) + '</span><span>' + esc(o.text) + '</span></button>'; }).join('') + '</div>';
    } else if (ex.type === 'match') {
      var rights = ex.pairs.map(function(p, k){ return { t: p.right, k: k }; });
      rights = [rights[2], rights[0], rights[3], rights[1]].filter(Boolean);
      body += '<p class="dm-ctx">בוחרים מושג מימין, ואז את ההסבר שלו.</p><div class="dm-opts dm-opts--2">' +
        '<div class="dm-col">' + ex.pairs.map(function(p, k){ return '<button type="button" class="dm-opt" data-l="' + k + '">' + esc(p.left) + '</button>'; }).join('') + '</div>' +
        '<div class="dm-col">' + rights.map(function(r){ return '<button type="button" class="dm-opt" data-r="' + r.k + '">' + esc(r.t) + '</button>'; }).join('') + '</div></div>';
    } else if (ex.type === 'order') {
      body += '<p class="dm-ctx">לוחצים על הפריטים לפי הסדר.</p><div class="dm-picked" id="dmPicked"></div>' +
        '<div class="dm-opts">' + ex.items.map(function(t, k){ return '<button type="button" class="dm-opt" data-o="' + k + '">' + esc(t) + '</button>'; }).join('') + '</div>';
    }
    quiz().innerHTML =
      '<div class="dm-card">' +
        '<div class="dm-head"><h3><i class="fa-solid fa-list-check"></i> תרגול בשאלות על שיעור 1</h3><span class="dm-tag dm-tag--free">פתוח בחינם</span></div>' +
        '<div class="dm-prog" aria-label="תרגיל ' + (pr.i + 1) + ' מתוך ' + L1.length + '">' + prog + '</div>' +
        '<p class="dm-q">' + esc(ex.question) + '</p>' + body +
        '<div class="dm-fb" id="dmFb" role="status"></div>' +
        '<button type="button" class="lms-ms-cta dm-next" id="dmNext" hidden>' + (pr.i === L1.length - 1 ? 'לסיים את התרגול' : 'לתרגיל הבא') + '</button>' +
      '</div>';
    wire(ex);
  }

  function feedback(ok, text){
    var fb = document.getElementById('dmFb');
    fb.className = 'dm-fb on ' + (ok ? 'ok' : 'no');
    fb.innerHTML = '<b>' + (ok ? 'נכון!' : 'לא בדיוק') + '</b> ' + esc(text || '');
    pr.answered = true; document.getElementById('dmNext').hidden = false;
  }

  function wire(ex){
    var h = quiz();
    if (['multiple-choice', 'fill-blank', 'scenario', 'compare'].indexOf(ex.type) !== -1) {
      h.querySelectorAll('[data-k]').forEach(function(b){ b.addEventListener('click', function(){
        if (pr.answered) return;
        var k = Number(b.dataset.k), ok = k === ex.correct;
        h.querySelectorAll('[data-k]').forEach(function(x){ x.disabled = true; if (Number(x.dataset.k) === ex.correct) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        if (ex.template && ok) h.querySelector('.dm-tmpl b').textContent = ex.options[k];
        feedback(ok, ok ? ex.explanation : ((ex.wrongExplanations && ex.wrongExplanations[k]) || ex.explanation));
      }); });
    } else if (ex.type === 'match') {
      h.querySelectorAll('[data-l]').forEach(function(b){ b.addEventListener('click', function(){
        if (b.disabled) return;
        h.querySelectorAll('[data-l]').forEach(function(x){ x.classList.remove('sel'); });
        b.classList.add('sel'); pr.selLeft = Number(b.dataset.l);
      }); });
      h.querySelectorAll('[data-r]').forEach(function(b){ b.addEventListener('click', function(){
        if (b.disabled || pr.selLeft === null) return;
        var L = h.querySelector('[data-l="' + pr.selLeft + '"]');
        if (Number(b.dataset.r) === pr.selLeft) {
          [L, b].forEach(function(x){ x.classList.remove('sel', 'wrong'); x.classList.add('right'); x.disabled = true; });
          pr.matched[pr.selLeft] = true; pr.selLeft = null;
          if (Object.keys(pr.matched).length === ex.pairs.length) feedback(true, ex.explanation);
        } else { b.classList.add('wrong'); setTimeout(function(){ b.classList.remove('wrong'); }, 700); }
      }); });
    } else if (ex.type === 'order') {
      h.querySelectorAll('[data-o]').forEach(function(b){ b.addEventListener('click', function(){
        if (b.disabled || pr.answered) return;
        b.disabled = true; pr.picked.push(Number(b.dataset.o));
        document.getElementById('dmPicked').insertAdjacentHTML('beforeend', '<div class="dm-opt"><span class="dm-k">' + pr.picked.length + '</span><span>' + esc(ex.items[Number(b.dataset.o)]) + '</span></div>');
        if (pr.picked.length === ex.items.length) {
          var ok = pr.picked.every(function(v, k){ return v === ex.correctOrder[k]; });
          document.querySelectorAll('#dmPicked .dm-opt').forEach(function(x){ x.classList.add(ok ? 'right' : 'wrong'); });
          var right = ex.correctOrder.map(function(v, k){ return (k + 1) + '. ' + ex.items[v]; }).join('  ');
          feedback(ok, ok ? ex.explanation : ('הסדר הנכון: ' + right + '. ' + ex.explanation));
        }
      }); });
    }
    document.getElementById('dmNext').addEventListener('click', function(){
      pr = { i: pr.i + 1, answered: false, picked: [], matched: {}, selLeft: null };
      if (pr.i >= L1.length) { set('l1done', '1'); return practiceDone(); }
      renderPractice();
      quiz().scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function practiceDone(){
    quiz().innerHTML =
      '<div class="dm-card dm-done">' +
        '<span class="dm-tag dm-tag--free"><i class="fa-solid fa-check"></i> התרגול של שיעור 1 הושלם</span>' +
        '<h3>ככה מרגיש תרגול אחרי שיעור.</h3>' +
        '<p>עם השלמת הפרקטישנר נפתחים כל ' + VIDEO_COUNT + ' סרטוני התרגול המצולמים של רם, ועוד ' + TOTAL_EX + ' תרגילים בשאלות לכל 51 השיעורים.</p>' +
        '<div class="dm-row"><a href="#master-sales" class="lms-ms-cta"><i class="fa-solid fa-lock-open"></i> לפתוח את כל התרגולים</a>' +
        '<button type="button" class="dm-ghost" id="dmAgain">לתרגל שוב</button></div>' +
      '</div>';
    document.getElementById('dmAgain').addEventListener('click', function(){ del('l1done'); resetPr(); renderPractice(); });
  }

  /* ── sales page: two offers + clock on top, testimonials + FAQ at the end ── */
  function check(){ return '<i class="fa-solid fa-check"></i>'; }
  function buildSales(){
    var view = document.getElementById('masterSalesView');
    if (!view || document.getElementById('demoOffers')) return;
    var header = view.querySelector('header');
    var offers = document.createElement('section');
    offers.id = 'demoOffers'; offers.className = 'lms-master-section dm-offers-wrap';
    offers.innerHTML =
      '<h2 class="dm-offers-h">את השיעורים כבר קיבלתם בחינם. מכאן בוחרים כמה עמוק להיכנס.</h2>' +
      '<div class="dm-clock" data-demo-clock>' +
        '<p>המחיר הזה לא יישאר ככה הרבה זמן. ההצעה האישית שלכם פתוחה עוד:</p>' +
        '<div class="dm-clock__d"><div><b data-u="d">7</b><span>ימים</span></div><div><b data-u="h">00</b><span>שעות</span></div><div><b data-u="m">00</b><span>דקות</span></div><div><b data-u="s">00</b><span>שניות</span></div></div>' +
      '</div>' +
      '<div class="dm-offers">' +
        '<article class="dm-offer">' +
          '<h3>השלמת הפרקטישנר</h3>' +
          '<p class="dm-offer__sub">לראות את רם עושה את הטכניקות עם אנשים, ולתרגל אחרי כל שיעור. מהבנה לתרגול.</p>' +
          '<div class="dm-offer__price"><b>390</b> <small>₪</small></div>' +
          '<p class="dm-offer__pay">תשלום אחד</p>' +
          '<ul>' +
            '<li>' + check() + '<span>' + VIDEO_COUNT + ' סרטוני תרגול מצולמים: רם עובד עם הקבוצה על 7 טכניקות, כ-3.5 שעות</span></li>' +
            '<li>' + check() + '<span>' + TOTAL_EX + ' תרגילים בשאלות לכל 51 השיעורים</span></li>' +
            '<li>' + check() + '<span>' + 'התרגול נפתח מתחת לכל שיעור, בדיוק איפה שעצרתם</span></li>' +
            '<li>' + check() + '<span>' + 'הסבר על כל תשובה, גם כשטועים</span></li>' +
            '<li>' + check() + '<span>' + 'גישה מיידית אחרי התשלום</span></li>' +
          '</ul>' +
          '<a class="dm-offer__btn dm-offer__btn--ghost" href="checkout.html?p=practitioner">לפתוח את כל התרגולים</a>' +
          '<p class="dm-refund"><i class="fa-solid fa-shield-halved"></i> החזר כספי מלא תוך 14 יום</p>' +
        '</article>' +
        '<article class="dm-offer dm-offer--main">' +
          '<h3>קורס <bdi>NLP MASTER</bdi></h3>' +
          '<p class="dm-offer__sub">לאנשים שרוצים להבין איך תת המודע עובד באמת. אמונות ליבה, ערכים ושינוי זהות.</p>' +
          '<div class="dm-offer__price"><b>1,900</b> <small>₪</small> <s>6,200 ₪</s> <em>70% הנחה</em></div>' +
          '<p class="dm-offer__pay">או ב-3 תשלומים של 633 ₪</p>' +
          '<ul>' +
            '<li>' + check() + '<span>' + 'קורס <bdi>NLP MASTER</bdi> מלא (רמה בינלאומית)</span></li>' +
            '<li>' + check() + '<span>' + 'כל הטכניקות המוקלטות של קורסי <bdi>PRACTITIONER</bdi> + <bdi>MASTER</bdi></span></li>' +
            '<li>' + check() + '<span>' + '2 חוברות טכניקות יישום מלאות מ-2 הקורסים</span></li>' +
            '<li>' + check() + '<span>' + 'בונוס: סדנת מסרים מרגשות</span></li>' +
            '<li>' + check() + '<span>' + 'בונוס: סדנת סגנונות תקשורת</span></li>' +
            '<li>' + check() + '<span>' + 'בונוס: כלי AI לתרגול ויישום</span></li>' +
          '</ul>' +
          '<a class="lms-ms-cta dm-offer__btn" href="checkout.html?p=master">קניתם אותי, אני בפנים! ←</a>' +
          '<p class="dm-refund"><i class="fa-solid fa-shield-halved"></i> החזר כספי מלא תוך 14 יום</p>' +
        '</article>' +
      '</div>';
    header.parentNode.insertBefore(offers, header.nextSibling);

    var tail = document.createElement('div');
    tail.id = 'demoFaq';
    tail.innerHTML =
      '<section class="lms-master-section">' +
        '<h2 class="dm-sec-h">מה אומרים מי שעשו את הדרך</h2>' +
        '<div class="dm-testis"><div>כאן תבוא המלצה אמיתית</div><div>כאן תבוא המלצה אמיתית</div><div>כאן תבוא המלצה אמיתית</div></div>' +
      '</section>' +
      '<section class="lms-master-section">' +
        '<h2 class="dm-sec-h">שאלות נפוצות</h2>' +
        '<div class="dm-faq">' +
          '<details><summary>האם יש תעודה?</summary><p>בכנות, לא. הקורס לא נותן תעודה. הוא מלמד מיומנות: להבין איך תת המודע עובד ולדעת לעבוד עם הכלים על עצמכם ועם אנשים אחרים. מה שתקבלו זה את היכולת, לא את הנייר.</p></details>' +
          '<details><summary>כמה זמן זה לוקח?</summary><p>קורס הפרקטישנר הוא 51 שיעורים, כ-18.5 שעות של צפייה, ו-' + TOTAL_EX + ' תרגילים לאורך הדרך. לומדים בקצב שלכם. קורס המאסטר פתוח לכם לכל החיים, כך שאפשר לחזור לכל שיעור ולכל טכניקה מתי שצריך.</p></details>' +
          '<details><summary>מה ההבדל בין מוקלט לחי?</summary><p>הקורס כולו מוקלט, ולכן צופים בו מתי שנוח ועוצרים כמה שצריך. שיעורי המאסטר צולמו במפגשים עם קבוצה, אז רואים בהם עבודה אמיתית מול אנשים, שאלות של משתתפים ותרגול חי של הטכניקות.</p></details>' +
        '</div>' +
      '</section>';
    var sections = view.querySelectorAll(':scope > section.lms-master-section');
    var last = sections[sections.length - 1];
    last.parentNode.insertBefore(tail, last);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildSales); else buildSales();
})();
