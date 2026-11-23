/* ==========================================================================
   Thanksgiving 2026 — app
   Plain JavaScript, no dependencies. Content comes from js/data.js.
   Saved on the device (localStorage, prefix "tg26:"):
     shop, recipe, open (checkmarks) · settings (serving time + plan)
     notes · timers · ui · cook · prefs
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.TG_DATA;
  var NS = 'tg26:';
  var TABS = ['shop', 'plan', 'recipes', 'cook', 'notes'];
  var BASE_TITLE = document.title;

  /* ---------------------------------------------------------------------
     Small helpers
     --------------------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v; // trusted, static markup only
        else if (k === 'value') el.value = v;
        else if (k === 'checked') el.checked = !!v;
        else if (k === 'disabled') el.disabled = !!v;
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { add(el, c); }); return; }
    if (typeof child === 'string' || typeof child === 'number') { el.appendChild(document.createTextNode(String(child))); return; }
    el.appendChild(child);
  }
  // **bold** support for data text
  function rich(text) {
    var frag = document.createDocumentFragment();
    String(text || '').split(/(\*\*[^*]+\*\*)/g).forEach(function (part) {
      if (!part) return;
      if (part.slice(0, 2) === '**' && part.slice(-2) === '**') frag.appendChild(h('strong', null, part.slice(2, -2)));
      else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }
  function fill(text, vars) {
    return String(text || '').replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  }
  function hash(str) {
    var x = 5381;
    for (var i = 0; i < str.length; i++) x = ((x << 5) + x + str.charCodeAt(i)) | 0;
    return (x >>> 0).toString(36);
  }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function parseHHMM(s) {
    var m = /^(\d{1,2}):(\d{2})/.exec(s || '');
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }
  function clockParts(mins) {
    var m = Math.round(mins), shift = 0;
    while (m < 0) { m += 1440; shift--; }
    while (m >= 1440) { m -= 1440; shift++; }
    var hh = Math.floor(m / 60), mm = m % 60, ap = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return { time: hh + ':' + pad(mm), ap: ap, shift: shift };
  }
  function fmtClock(mins) {
    var p = clockParts(mins);
    return p.time + ' ' + p.ap + (p.shift < 0 ? ' (Wed)' : p.shift > 0 ? ' (Fri)' : '');
  }
  function fmtDur(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var hr = Math.floor(total / 3600), mi = Math.floor((total % 3600) / 60), se = total % 60;
    return hr ? hr + ':' + pad(mi) + ':' + pad(se) : mi + ':' + pad(se);
  }
  function fmtMins(min) {
    if (min >= 60) {
      var hr = Math.floor(min / 60), mi = min % 60;
      return mi ? hr + ' h ' + mi + ' min' : hr + ' h';
    }
    return min + ' min';
  }
  function localISO(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daysUntil(iso) {
    var p = iso.split('-').map(Number);
    var target = new Date(p[0], p[1] - 1, p[2]);
    var n = new Date();
    var today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    return Math.round((target - today) / 86400000);
  }
  function nowMinutes() { var d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }

  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/></svg>',
    timer: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.6M9.5 3h5"/></svg>',
    flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 2 20.5h20z"/><path d="M12 9.8v5M12 17.6v.2"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4.5v4h4"/></svg>',
    cook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16v4.5A4.5 4.5 0 0 1 15.5 20h-7A4.5 4.5 0 0 1 4 15.5V11Z"/><path d="M2 11h20"/></svg>',
    plate: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="34" cy="34" r="16"/><circle cx="34" cy="34" r="10"/><path d="M8 14v11a4 4 0 0 0 8 0V14M12 14v38M58 14c-4 0-7 6-7 14v4h7v20"/></svg>'
  };
  function icon(name) { var t = document.createElement('span'); t.innerHTML = ICON[name]; return t.firstChild; }

  /* ---------------------------------------------------------------------
     Storage
     --------------------------------------------------------------------- */
  var storageWarned = false;
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(NS + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(NS + key, JSON.stringify(value)); return true; }
      catch (e) {
        if (!storageWarned) { storageWarned = true; toast('Could not save on this device (storage is full or turned off).'); }
        return false;
      }
    },
    clearAll: function () {
      try {
        Object.keys(window.localStorage).forEach(function (k) { if (k.indexOf(NS) === 0) window.localStorage.removeItem(k); });
      } catch (e) { /* ignore */ }
    }
  };

  /* ---------------------------------------------------------------------
     Boot guard: data.js must load
     --------------------------------------------------------------------- */
  if (!DATA || !Array.isArray(DATA.recipes) || !Array.isArray(DATA.shopping)) {
    var err = document.getElementById('boot-error');
    if (err) {
      err.hidden = false;
      err.textContent = 'Could not read js/data.js. Check it for a typo (usually a missing comma or quote). Your browser console shows the line number.';
    }
    return;
  }

  var PLAN_DEFAULTS = DATA.plan.defaults;
  var state = {
    shop: store.get('shop', {}),
    recipe: store.get('recipe', {}),
    open: store.get('open', {}),
    notes: store.get('notes', ''),
    settings: Object.assign({ servingSet: false, ovenChosen: false }, PLAN_DEFAULTS, store.get('settings', {})),
    ui: Object.assign({ tab: 'shop', hideChecked: false, details: {} }, store.get('ui', {})),
    cook: Object.assign({ recipeId: null, pos: {} }, store.get('cook', {})),
    prefs: Object.assign({ wake: true, notify: false }, store.get('prefs', {})),
    timers: store.get('timers', [])
  };
  if (!Array.isArray(state.timers)) state.timers = [];
  if (!state.ui.details) state.ui.details = {};
  if (!state.cook.pos) state.cook.pos = {};

  function saveSettings() { store.set('settings', state.settings); }
  function saveUi() { store.set('ui', state.ui); }
  function saveCook() { store.set('cook', state.cook); }
  function savePrefs() { store.set('prefs', state.prefs); }
  function saveTimers() { store.set('timers', state.timers); }

  /* ---------------------------------------------------------------------
     Model: stable ids for every checkbox, flattened steps for Cook Mode
     --------------------------------------------------------------------- */
  var RECIPES = {};
  (function buildModel() {
    var seen = {};
    function uniq(id) { var out = id, n = 2; while (seen[out]) out = id + '-' + (n++); seen[out] = true; return out; }
    DATA.shopping.forEach(function (g) {
      g.items.forEach(function (it) { it._id = uniq('s:' + g.id + ':' + hash(it.name)); });
    });
    DATA.recipes.forEach(function (r) {
      RECIPES[r.id] = r;
      r._ing = [];
      r.ingredients.forEach(function (g) {
        g._items = g.items.map(function (it) {
          var o = typeof it === 'string' ? { text: it } : it;
          o._id = uniq('i:' + r.id + ':' + slug(g.title || 'main') + ':' + hash(o.text));
          r._ing.push(o);
          return o;
        });
      });
      r._steps = [];
      r.method.forEach(function (sec, si) {
        sec._start = r._steps.length;
        sec._steps = sec.steps.map(function (s, i) {
          var o = typeof s === 'string' ? { text: s } : s;
          o._id = uniq('m:' + r.id + ':' + (slug(sec.title) || 's' + si) + ':' + hash(o.text));
          o._num = i + 1;
          o._section = sec;
          o._si = si;
          r._steps.push(o);
          return o;
        });
      });
    });
    DATA.openItems.forEach(function (o) { o._id = uniq('o:' + hash(o.text)); });
  })();

  function dishTag(key) {
    var d = DATA.dishes[key];
    if (!d) return null;
    return h('span', { class: 'tag' }, h('i', { style: '--dot:' + d.color }), d.label);
  }

  /* ---------------------------------------------------------------------
     Toast
     --------------------------------------------------------------------- */
  var toastTimer = null;
  function toast(msg, actionLabel, onAction) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = '';
    el.appendChild(h('span', null, msg));
    if (actionLabel) {
      var b = h('button', { type: 'button', class: 'btn btn--small' }, actionLabel);
      b.addEventListener('click', function () { el.hidden = true; onAction(); });
      el.appendChild(b);
    }
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, actionLabel ? 6000 : 3200);
  }

  /* ---------------------------------------------------------------------
     Shared bits
     --------------------------------------------------------------------- */
  function masthead(eyebrow, title, dek) {
    return h('header', { class: 'masthead' },
      h('p', { class: 'eyebrow' }, eyebrow),
      h('h1', null, title),
      dek ? h('p', { class: 'dek' }, dek) : null);
  }
  function checkRow(opts) {
    // opts: kind, id, checked, recipe, name, children(body), extraLi
    var input = h('input', { type: 'checkbox', 'data-kind': opts.kind, 'data-id': opts.id, 'data-recipe': opts.recipe || null, 'data-name': opts.name || null, checked: opts.checked });
    var label = h('label', { class: 'check' + (opts.checked ? ' is-checked' : '') }, input, h('span', { class: 'check__body' }, opts.body));
    return h('li', { class: opts.checked ? 'is-checked-row' : null }, label, opts.extra || null);
  }
  function markRow(input) {
    var label = input.closest('.check');
    if (label) label.classList.toggle('is-checked', input.checked);
    var li = input.closest('li');
    if (li) li.classList.toggle('is-checked-row', input.checked);
  }
  function switchEl(id, label, hint, checked) {
    return h('label', { class: 'switch', for: id },
      h('span', null, h('span', { class: 'switch__label' }, label), hint ? h('span', { class: 'switch__hint' }, hint) : null),
      h('input', { type: 'checkbox', role: 'switch', id: id, checked: checked }));
  }
  function detailsEl(key, defaultOpen, summaryChildren, bodyChildren, cls, countKey) {
    var isOpen = state.ui.details[key] !== undefined ? state.ui.details[key] : defaultOpen;
    var d = h('details', { class: cls || 'rdetails', 'data-key': key });
    if (isOpen) d.open = true;
    d.appendChild(h('summary', null, summaryChildren,
      countKey ? h('span', { class: 'count', 'data-rcount': countKey }) : null,
      h('span', { class: 'chev', 'aria-hidden': 'true' })));
    d.appendChild(h('div', { class: (cls || 'rdetails') + '__body' }, bodyChildren));
    return d;
  }

  /* ---------------------------------------------------------------------
     Header
     --------------------------------------------------------------------- */
  function renderHeader() {
    var n = daysUntil(DATA.site.thanksgiving);
    var text = 'Thursday, November 26';
    if (n > 1) text += ' · ' + n + ' days to go';
    else if (n === 1) text = 'Tomorrow · Thursday, November 26';
    else if (n === 0) text = 'Today · Happy Thanksgiving';
    else text = 'Thursday, November 26, 2026';
    $('#header-date').textContent = text;
  }

  /* =====================================================================
     SHOP
     ===================================================================== */
  function renderShop() {
    var p = $('#panel-shop');
    p.textContent = '';
    var total = 0;
    DATA.shopping.forEach(function (g) { total += g.items.length; });

    p.appendChild(h('div', { class: 'print-only' },
      h('p', { class: 'print-title' }, DATA.site.title + ': shopping list'),
      h('p', { class: 'print-sub' }, 'Still to buy, by store section · Menu: ' + DATA.menu.join(', '))));
    p.appendChild(masthead('Shop', 'Shopping list', 'Still to buy, by store section. Tap anywhere on a row to check it off.'));

    var hide = switchEl('hide-checked', 'Hide checked items', null, state.ui.hideChecked);
    p.appendChild(h('section', { class: 'card', 'aria-label': 'Shopping progress' },
      h('div', { class: 'shop-summary' },
        h('div', { class: 'progress-label' },
          h('span', null, h('strong', { id: 'shop-count' }, '0 of ' + total), ' items checked'),
          h('span', { id: 'shop-pct' }, '0%')),
        h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Items checked', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': 0, id: 'shop-progress' }, h('span', { id: 'shop-bar' })),
        h('p', { class: 'sub', id: 'shop-sub' })),
      h('div', { class: 'shop-controls' },
        hide,
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'print' }, icon('print'), 'Print list'),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'reset-shop' }, icon('reset'), 'Reset'))));

    p.appendChild(h('nav', { class: 'jump', 'aria-label': 'Store sections' },
      DATA.shopping.map(function (g) {
        return h('a', { href: '#shop-' + g.id, 'data-action': 'jump', 'data-target': 'shop-' + g.id }, g.atHome ? 'At home' : g.title);
      })));

    var groups = h('div', { class: 'shop-groups' + (state.ui.hideChecked ? ' hide-checked' : ''), id: 'shop-groups' });
    DATA.shopping.forEach(function (g) {
      var list = h('ul', { class: 'check-list' });
      g.items.forEach(function (it) {
        var tags = h('span', { class: 'tags' },
          (it.uses || []).map(dishTag),
          it.optional ? h('span', { class: 'tag tag--opt' }, 'Optional') : null,
          it.tbc ? h('span', { class: 'tag tag--warn' }, 'To be confirmed') : null);
        list.appendChild(checkRow({
          kind: 'shop', id: it._id, name: it.name, checked: !!state.shop[it._id],
          body: [h('span', { class: 'check__name check__text' }, it.name), it.detail ? h('span', { class: 'check__detail' }, it.detail) : null, tags]
        }));
      });
      groups.appendChild(h('section', { class: 'card group' + (g.atHome ? ' group--home' : ''), id: 'shop-' + g.id, 'data-group': g.id },
        h('div', { class: 'card__head' }, h('h2', null, g.title), h('span', { class: 'count', 'data-count': g.id })),
        list,
        h('p', { class: 'group-done' }, 'All checked in this section.')));
    });
    p.appendChild(groups);
    updateShopCounts();
  }

  function updateShopCounts() {
    var total = 0, done = 0, storeTotal = 0, storeDone = 0, homeTotal = 0, homeDone = 0;
    DATA.shopping.forEach(function (g) {
      var gd = 0;
      g.items.forEach(function (it) { if (state.shop[it._id]) gd++; });
      total += g.items.length; done += gd;
      if (g.atHome) { homeTotal += g.items.length; homeDone += gd; } else { storeTotal += g.items.length; storeDone += gd; }
      var c = $('[data-count="' + g.id + '"]');
      if (c) c.textContent = gd + '/' + g.items.length;
      var sec = $('#shop-' + g.id);
      if (sec) sec.classList.toggle('is-complete', gd === g.items.length);
    });
    var pct = total ? Math.round(done / total * 100) : 0;
    $('#shop-count').textContent = done + ' of ' + total;
    $('#shop-pct').textContent = pct + '%';
    $('#shop-bar').style.width = pct + '%';
    $('#shop-progress').setAttribute('aria-valuenow', done);
    $('#shop-sub').textContent = 'At the store: ' + storeDone + ' of ' + storeTotal + ' · At home: ' + homeDone + ' of ' + homeTotal;
  }

  /* =====================================================================
     PLAN: backward-timed game plan
     ===================================================================== */
  var EVENT_ORDER = ['prepAhead', 'fridgeOut', 'preheat', 'panSetup', 'turkeyIn', 'stockStart', 'stockSimmer', 'carrotPrep',
    'macPrep', 'carrotsIn', 'firstCheck', 'carrotsToss', 'potatoPeel', 'secondOven', 'stockStrain', 'turkeyOut', 'carrotsOut',
    'panStrain', 'ovenDown', 'macIn', 'gravyReduce', 'potatoStart', 'ovenUp', 'roux', 'gravySimmer', 'macOut', 'macOutHold',
    'potatoReheat', 'potatoUncover', 'rewarm', 'carve', 'gravyDone', 'potatoMash', 'carrotFinish', 'serve'];

  function computePlan(s, optId) {
    var F = DATA.plan.fixed, E = DATA.plan.events;
    var S = parseHHMM(s.servingTime);
    if (S === null) S = parseHHMM(PLAN_DEFAULTS.servingTime) || 960;
    var d = {
      roast: +s.roast, rest: +s.rest, carve: +s.carve, c1: +s.carrots1, c2: +s.carrots2,
      macBake: +s.macBake, macRest: +s.macRest, down: +s.ovenDown, up: +s.ovenUp
    };
    var finish = F.carrotFinish;
    var T, carrotsIn, carrotsToss, carrotsOut, macIn, macOut, rewarmAt = null, downAt = null, upAt = null, secondHeat = null;

    if (optId === 'carrots-first') {
      T = S - (d.c1 + d.c2 + d.down + d.macBake + d.macRest);
      carrotsIn = T; carrotsToss = T + d.c1; carrotsOut = carrotsToss + d.c2;
      downAt = carrotsOut; macIn = downAt + d.down; macOut = macIn + d.macBake;
      rewarmAt = S - finish - F.rewarm;
    } else if (optId === 'mac-first') {
      T = S - (d.down + d.macBake + d.up + d.c1 + d.c2 + finish);
      downAt = T; macIn = T + d.down; macOut = macIn + d.macBake;
      upAt = macOut; carrotsIn = upAt + d.up; carrotsToss = carrotsIn + d.c1; carrotsOut = carrotsToss + d.c2;
    } else if (optId === 'second-oven') {
      T = S - d.rest - d.carve;
      carrotsIn = Math.max(T, S - finish - d.c2 - d.c1); carrotsToss = carrotsIn + d.c1; carrotsOut = carrotsToss + d.c2;
      macIn = S - d.macRest - d.macBake; macOut = macIn + d.macBake; secondHeat = macIn - F.secondOvenHeat;
    } else { // two-rack (recommended)
      optId = 'two-rack';
      T = S - d.rest - d.carve;
      carrotsIn = T - d.c1 - d.c2; carrotsToss = carrotsIn + d.c1; carrotsOut = T;
      downAt = T; macIn = Math.max(S - d.macRest - d.macBake, T + d.down); macOut = macIn + d.macBake;
      rewarmAt = S - finish - F.rewarm;
    }

    var roastStart = T - d.roast;
    var fridgeOut = roastStart - F.fridgeOut;
    var carveAt = S - d.carve;
    var restActual = carveAt - T;
    var vars = {
      carveTime: fmtClock(carveAt), carrots1: d.c1, carrots2: d.c2, rewarm: F.rewarm,
      rest: restActual, serveTime: fmtClock(S)
    };
    var ev = [];
    function addEv(key, t, extra) {
      var base = E[key] || { title: key, detail: '' };
      var o = { key: key, t: t, dish: base.dish, title: base.title, detail: base.detail };
      if (extra) Object.keys(extra).forEach(function (k) { if (extra[k] !== undefined) o[k] = extra[k]; });
      o.title = fill(o.title, vars); o.detail = fill(o.detail, vars);
      ev.push(o);
    }

    addEv('prepAhead', fridgeOut - F.prepAhead);
    addEv('fridgeOut', fridgeOut, { timer: { min: F.fridgeOut, label: 'Turkey: on the counter' } });
    addEv('preheat', roastStart - F.preheat, { oven: '425°F', detail: optId === 'two-rack' ? E.preheat.twoRackDetail : undefined });
    addEv('panSetup', roastStart - F.panSetup);
    var firstCheckAfter = Math.min(F.firstCheck, Math.max(d.roast - 10, 5));
    addEv('turkeyIn', roastStart, { oven: '425°F', timer: { min: firstCheckAfter, label: 'Turkey: first temp check' } });
    var stockStrainAt = T - F.stockStrain;
    var stockSimmerAt = stockStrainAt - F.stockSimmer;
    addEv('stockStart', stockSimmerAt - F.stockBrown);
    addEv('stockSimmer', stockSimmerAt, { timer: { min: 90, max: 120, label: 'Stock: simmer' } });
    addEv('firstCheck', roastStart + firstCheckAfter, { flag: true });
    addEv('stockStrain', stockStrainAt);
    addEv('turkeyOut', T, { flag: true, timer: { min: Math.max(1, restActual), label: 'Turkey: rest' } });
    addEv('panStrain', T);

    var reduceAt = Math.max(carveAt - F.gravySimmer - F.roux - F.gravyReduce, T + F.panStrain);
    var rouxAt = reduceAt + F.gravyReduce, gSimAt = rouxAt + F.roux, gDoneAt = gSimAt + F.gravySimmer;
    addEv('gravyReduce', reduceAt);
    addEv('roux', rouxAt, { timer: { min: 3, max: 5, label: 'Gravy: roux' } });
    addEv('gravySimmer', gSimAt, { timer: { min: 5, max: 10, label: 'Gravy: simmer' } });
    addEv('gravyDone', gDoneAt);
    addEv('carve', carveAt);
    addEv('serve', S, { flag: true });

    if (s.potatoesAhead) {
      addEv('potatoReheat', S - F.potatoReheat, { timer: { min: 20, label: 'Potatoes: reheat' } });
    } else {
      addEv('potatoPeel', S - F.potatoPeel);
      addEv('potatoStart', S - F.potatoStart, { timer: { min: 25, max: 30, label: 'Potatoes: covered simmer' } });
      addEv('potatoUncover', S - F.potatoUncover, { timer: { min: 3, max: 5, label: 'Potatoes: cook down' } });
      addEv('potatoMash', S - F.potatoMash);
    }

    addEv('macPrep', macIn - F.macPrep);
    if (secondHeat !== null) addEv('secondOven', secondHeat, { oven: '350°F' });
    addEv('macIn', macIn, { oven: '350°F', timer: { min: d.macBake, label: 'Mac & cheese: bake' } });
    var macWait = S - macOut;
    if (macWait > d.macRest + 5) addEv('macOutHold', macOut);
    else addEv('macOut', macOut, { timer: { min: Math.max(1, Math.min(d.macRest, macWait)), label: 'Mac & cheese: rest' } });

    addEv('carrotPrep', carrotsIn - F.carrotPrep);
    addEv('carrotsIn', carrotsIn, { oven: '425°F', detail: optId === 'two-rack' ? E.carrotsIn.twoRackDetail : undefined, timer: { min: d.c1, label: 'Carrots: first roast' } });
    addEv('carrotsToss', carrotsToss, { timer: { min: d.c2, label: 'Carrots: butter, thyme, zest' } });
    if (rewarmAt !== null) {
      addEv('carrotsOut', carrotsOut);
      addEv('rewarm', rewarmAt, { oven: '350°F', timer: { min: F.rewarm, label: 'Carrots: re-warm' } });
    }
    addEv('carrotFinish', S - finish);
    if (downAt !== null) addEv('ovenDown', downAt, { oven: '→ 350°F' });
    if (upAt !== null) addEv('ovenUp', upAt, { oven: '→ 425°F' });

    ev.forEach(function (e) { e.t = Math.round(e.t); });
    ev.sort(function (a, b) { return a.t - b.t || EVENT_ORDER.indexOf(a.key) - EVENT_ORDER.indexOf(b.key); });

    // Oven schedule
    var lane = [];
    lane.push({ start: roastStart - F.preheat, end: roastStart, temp: '425', label: 'Preheat' });
    lane.push({ start: roastStart, end: T, temp: '425', label: 'Turkey, lowest rack' });
    if (optId === 'two-rack') lane.push({ start: carrotsIn, end: carrotsOut, temp: '425', label: 'Carrots, upper rack (with the turkey)' });
    if (downAt !== null) lane.push({ start: downAt, end: downAt + d.down, temp: 'change', label: 'Door cracked: down to 350°F' });
    lane.push({ start: macIn, end: macOut, temp: '350', label: optId === 'second-oven' ? 'Mac & cheese (second oven)' : 'Mac & cheese' });
    if (upAt !== null) lane.push({ start: upAt, end: upAt + d.up, temp: 'change', label: 'Back up to 425°F' });
    if (optId !== 'two-rack') lane.push({ start: carrotsIn, end: carrotsOut, temp: '425', label: optId === 'second-oven' ? 'Carrots (main oven stays at 425°F)' : 'Carrots' });
    if (rewarmAt !== null) lane.push({ start: rewarmAt, end: rewarmAt + F.rewarm, temp: '350', label: 'Carrots re-warm' });
    lane.sort(function (a, b) { return a.start - b.start; });

    // Flags
    var warn = [], info = [];
    if (restActual > 45) warn.push('The turkey rests about ' + restActual + ' minutes before carving (recipe: 30 to 45). Keep it loosely tented with foil.');
    if (restActual < 30) warn.push('The turkey rest is only ' + restActual + ' minutes (recipe: 30 to 45).');
    if (macWait > d.macRest + 5) warn.push('The mac & cheese waits about ' + macWait + ' minutes after baking (rest: 10 to 15). Tent it loosely with foil to keep it hot.');
    if (macOut > S - 5) warn.push('With these timings the mac & cheese comes out at ' + fmtClock(macOut) + ', too close to serving. Shorten the oven change or rest, or pick a later serving time.');
    var carrotWait = rewarmAt !== null ? rewarmAt - carrotsOut : (S - finish) - carrotsOut;
    if (carrotWait > 20 && rewarmAt !== null) info.push('Carrots wait about ' + carrotWait + ' minutes, then get a ' + F.rewarm + '-minute re-warm.');
    if (carrotWait > 10 && rewarmAt === null) warn.push('Carrots finish about ' + carrotWait + ' minutes before serving.');
    function range(label, v, lo, hi) { if (v < lo || v > hi) warn.push(label + ' is set to ' + v + ' minutes (recipe: ' + lo + ' to ' + hi + ').'); }
    range('Turkey rest', d.rest, 30, 45);
    range('Carrots first roast', d.c1, 20, 25);
    range('Carrots second roast', d.c2, 10, 15);
    range('Mac & cheese bake', d.macBake, 25, 35);
    range('Mac & cheese rest', d.macRest, 10, 15);
    if (d.roast < F.firstCheck) info.push('Your roast estimate (' + d.roast + ' min) is shorter than the usual first temperature check at about 90 minutes.');

    return {
      opt: optId, S: S, T: T, roastStart: roastStart, carveAt: carveAt, restActual: restActual,
      macWait: macWait, carrotWait: carrotWait, rewarm: rewarmAt !== null,
      ovenChanges: (downAt !== null ? 1 : 0) + (upAt !== null ? 1 : 0),
      events: ev, lane: lane, warn: warn, info: info
    };
  }

  function currentOpt() {
    var id = state.settings.ovenPlan;
    var ok = DATA.plan.ovenOptions.some(function (o) { return o.id === id; });
    return ok ? id : PLAN_DEFAULTS.ovenPlan;
  }

  var ADJUST_FIELDS = [
    ['roast', 'Turkey roast estimate', 'Cook to temperature; first check at about 90'],
    ['rest', 'Turkey rest', 'Recipe: 30 to 45'],
    ['carve', 'Carving and platter', ''],
    ['carrots1', 'Carrots, first roast', 'Recipe: 20 to 25'],
    ['carrots2', 'Carrots, after butter', 'Recipe: 10 to 15'],
    ['macBake', 'Mac & cheese bake', 'Recipe: 25 to 35'],
    ['macRest', 'Mac & cheese rest', 'Recipe: 10 to 15'],
    ['ovenDown', 'Oven 425°F to 350°F', 'Door cracked'],
    ['ovenUp', 'Oven 350°F to 425°F', 'Option C only']
  ];

  function renderPlan() {
    var p = $('#panel-plan');
    p.textContent = '';
    var s = state.settings;
    p.appendChild(masthead('Plan', 'Game plan', 'Set your serving time. Every clock time below works backward from it.'));

    // Serving time
    var time = h('input', { type: 'time', id: 'serve-time', value: s.servingTime, step: 300, 'aria-describedby': 'serve-hint' });
    p.appendChild(h('section', { class: 'card card__pad', 'aria-label': 'Serving time' },
      h('div', { class: 'serve-row' },
        h('div', { class: 'field' },
          h('label', { class: 'field__label', for: 'serve-time' }, 'Target serving time'),
          time,
          h('span', { class: 'field__hint', id: 'serve-hint' }))),
      h('p', { class: 'serve-date' }, 'Thursday, November 26, 2026'),
      h('div', { class: 'keytimes', id: 'keytimes' }),
      h('div', { style: 'margin-top:14px' }, switchEl('potatoes-ahead', 'Make the potatoes ahead', 'Cook them Wednesday (up to 2 days ahead) and reheat on the stove Thursday.', s.potatoesAhead)),
      h('div', { class: 'btn-row', style: 'margin-top:10px' },
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'reset-plan' }, icon('reset'), 'Reset plan settings'))));

    // Oven conflict
    var opts = h('div', { class: 'options', role: 'radiogroup', 'aria-label': 'Oven sequence' });
    DATA.plan.ovenOptions.forEach(function (o) {
      opts.appendChild(h('label', { class: 'option', 'data-opt': o.id },
        h('input', { type: 'radio', name: 'oven-plan', value: o.id, checked: s.ovenChosen && s.ovenPlan === o.id }),
        h('span', { class: 'option__name' }, h('span', { class: 'option__letter' }, o.letter + '.'), ' ', o.name,
          o.recommended ? h('span', { class: 'option__badge' }, 'Recommended') : null),
        h('span', { class: 'option__seq' }, o.sequence),
        h('span', { class: 'option__facts', 'data-facts': o.id }),
        h('span', { class: 'option__more' }, h('b', null, 'Why: '), o.why, h('br'), h('b', null, 'Watch: '), o.watch)));
    });
    var adjust = h('div', { class: 'num-grid' });
    ADJUST_FIELDS.forEach(function (f) {
      adjust.appendChild(h('label', { class: 'field' },
        h('span', { class: 'field__label' }, f[1] + ' (min)'),
        h('input', { type: 'number', inputmode: 'numeric', min: 0, max: 600, step: 1, value: s[f[0]], 'data-setting': f[0] }),
        f[2] ? h('span', { class: 'field__hint' }, f[2]) : null));
    });
    p.appendChild(h('section', { class: 'card conflict', id: 'oven-conflict', 'aria-labelledby': 'oven-h' },
      h('div', { class: 'conflict__flag' }, icon('flag'),
        h('div', null, h('p', { class: 'eyebrow' }, 'Oven conflict'), h('h2', { id: 'oven-h' }, 'Carrots at 425°F vs. mac at 350°F'), h('p', null, DATA.plan.ovenConflict))),
      h('div', { style: 'padding:0 16px' }, h('p', { class: 'status-line', id: 'oven-status' })),
      opts,
      detailsEl('plan-adjust', false, h('span', { class: 'eyebrow' }, 'Adjust timings'),
        h('div', { class: 'adjust__body' }, h('p', { class: 'muted small', style: 'margin-bottom:12px' }, 'Change any duration and the whole plan recalculates. Saved on this phone.'), adjust), 'adjust')));

    p.appendChild(h('section', { class: 'card', 'aria-labelledby': 'lane-h' },
      h('div', { class: 'card__head' }, h('h2', { id: 'lane-h' }, 'Oven schedule'), h('span', { class: 'count', id: 'lane-opt' })),
      h('ul', { class: 'oven-lane', id: 'oven-lane' })));
    p.appendChild(h('div', { id: 'plan-flags' }));
    p.appendChild(h('section', { class: 'card', 'aria-label': 'Timeline', id: 'timeline' }));
    updatePlan();
  }

  function updatePlan() {
    var s = state.settings;
    var opt = currentOpt();
    var plan = computePlan(s, opt);
    window.__tgPlan = plan; // handy for debugging in the console

    var hint = $('#serve-hint');
    hint.textContent = s.servingSet ? 'Saved on this phone.' : 'Default is ' + fmtClock(parseHHMM(PLAN_DEFAULTS.servingTime)) + '. Set your own.';

    var kt = $('#keytimes');
    kt.textContent = '';
    [['Turkey in', plan.roastStart], ['Turkey out', plan.T], ['Carve', plan.carveAt], ['Serve', plan.S]].forEach(function (k) {
      kt.appendChild(h('div', { class: 'keytime' }, h('b', null, fmtClock(k[1])), h('span', null, k[0])));
    });

    // Option facts (computed for each option with your timings)
    DATA.plan.ovenOptions.forEach(function (o) {
      var pl = computePlan(s, o.id);
      var box = $('[data-facts="' + o.id + '"]');
      box.textContent = '';
      box.appendChild(h('span', { class: 'fact ' + (pl.restActual > 45 || pl.restActual < 30 ? 'fact--warn' : 'fact--ok') }, 'Turkey rest ' + pl.restActual + ' min'));
      box.appendChild(h('span', { class: 'fact' }, pl.ovenChanges === 0 ? 'No oven change' : pl.ovenChanges + (pl.ovenChanges === 1 ? ' oven change' : ' oven changes')));
      if (pl.macWait > +s.macRest + 5) box.appendChild(h('span', { class: 'fact fact--warn' }, 'Mac waits ' + pl.macWait + ' min'));
      box.appendChild(h('span', { class: 'fact' }, pl.rewarm ? 'Carrots re-warmed' : 'Carrots straight from the oven'));
      if (o.id === 'two-rack') box.appendChild(h('span', { class: 'fact' }, 'Needs 2 racks at once'));
      if (o.id === 'second-oven') box.appendChild(h('span', { class: 'fact fact--warn' }, 'Needs a second oven'));
      box.appendChild(h('span', { class: 'fact' }, 'Turkey in ' + fmtClock(pl.roastStart)));
      var lab = box.closest('.option');
      lab.classList.toggle('is-selected', s.ovenChosen && s.ovenPlan === o.id);
      lab.classList.toggle('is-preview', !s.ovenChosen && opt === o.id);
    });

    var chosen = DATA.plan.ovenOptions.filter(function (o) { return o.id === opt; })[0];
    var st = $('#oven-status');
    if (s.ovenChosen) {
      st.className = 'status-line status-line--ok';
      st.textContent = 'Your choice: ' + chosen.letter + ', ' + chosen.name + '. Saved on this phone; change it any time.';
    } else {
      st.className = 'status-line';
      st.textContent = 'Not decided yet. The plan below previews ' + chosen.letter + ' (recommended) until you tap an option.';
    }

    $('#lane-opt').textContent = 'Option ' + chosen.letter;
    var lane = $('#oven-lane');
    lane.textContent = '';
    plan.lane.forEach(function (l) {
      var tempLabel = l.temp === 'change' ? 'Change' : l.temp + '°F';
      lane.appendChild(h('li', null,
        h('span', { class: 'when' }, fmtClock(l.start).replace(/ (AM|PM)/, ''), '–', fmtClock(l.end)),
        h('span', { class: 'what' }, h('span', { class: 'temp temp--' + l.temp }, tempLabel), l.label)));
    });

    var flags = $('#plan-flags');
    flags.textContent = '';
    if (plan.warn.length || plan.info.length) {
      flags.appendChild(h('div', { class: 'callout callout--warn', role: 'note' },
        h('span', { class: 'callout__label' }, 'Heads-up for option ' + chosen.letter),
        h('ul', null, plan.warn.concat(plan.info).map(function (w) { return h('li', null, w); }))));
    }

    renderTimeline(plan);
    refreshChipRows();
    updatePlanNow();
    renderOpenHints();
    renderCookNext();
  }

  function renderTimeline(plan) {
    var box = $('#timeline');
    box.textContent = '';
    var s = state.settings;
    var opt = plan.opt;

    box.appendChild(h('div', { class: 'tl-day', id: 'tl-day-before' },
      h('p', { class: 'eyebrow' }, 'Day before'), h('h3', null, 'Wednesday, November 25')));
    var ul1 = h('ul', { class: 'timeline' });
    DATA.plan.dayBefore.forEach(function (it) {
      if (it.onlyIf && !s[it.onlyIf]) return;
      if (it.onlyIfNot && s[it.onlyIfNot]) return;
      if (it.onlyIfOven && it.onlyIfOven !== opt) return;
      ul1.appendChild(h('li', { class: 'tl-item' },
        h('div', { class: 'tl-time' }, h('small', null, it.when)),
        h('div', { class: 'tl-body' },
          h('p', { class: 'tl-title' }, it.title),
          it.detail ? h('p', { class: 'tl-detail' }, it.detail) : null,
          it.dish ? h('div', { class: 'tags' }, dishTag(it.dish)) : null)));
    });
    box.appendChild(ul1);

    box.appendChild(h('div', { class: 'tl-day', id: 'tl-day-of' },
      h('p', { class: 'eyebrow' }, 'Thanksgiving Day'), h('h3', null, 'Thursday, November 26')));
    var ul2 = h('ul', { class: 'timeline', id: 'tl-today' });
    plan.events.forEach(function (e) {
      var cp = clockParts(e.t);
      var chips = e.timer ? timerChips(e.timer, { step: 'plan:' + e.key, recipe: e.dish || '' }) : null;
      ul2.appendChild(h('li', { class: 'tl-item' + (e.flag ? ' is-flag' : ''), 'data-t': e.t },
        h('div', { class: 'tl-time' }, cp.time, h('small', null, cp.ap + (cp.shift < 0 ? ' Wed' : ''))),
        h('div', { class: 'tl-body' },
          h('p', { class: 'tl-title' }, e.title),
          e.detail ? h('p', { class: 'tl-detail' }, rich(e.detail)) : null,
          (e.dish || e.oven) ? h('div', { class: 'tags' }, e.dish ? dishTag(e.dish) : null, e.oven ? h('span', { class: 'tag tag--oven' }, e.oven) : null) : null,
          chips)));
    });
    box.appendChild(ul2);
  }

  function updatePlanNow() {
    var isDay = localISO() === DATA.site.thanksgiving;
    var isEve = localISO() === DATA.site.dayBefore;
    var dayBefore = $('#tl-day-before .eyebrow');
    if (dayBefore) dayBefore.textContent = isEve ? 'Day before · Today' : 'Day before';
    var dayOf = $('#tl-day-of .eyebrow');
    if (dayOf) dayOf.textContent = isDay ? 'Thanksgiving Day · Today' : 'Thanksgiving Day';
    var rows = $$('#tl-today .tl-item');
    var now = nowMinutes(), nextFound = false;
    rows.forEach(function (li) {
      li.classList.remove('is-past', 'is-next');
      if (!isDay) return;
      var t = +li.getAttribute('data-t');
      if (t < now - 1) li.classList.add('is-past');
      else if (!nextFound) { li.classList.add('is-next'); nextFound = true; }
    });
  }

  /* =====================================================================
     RECIPES
     ===================================================================== */
  function carrotGuide() {
    var halo = function (d) { return '<path class="cut-halo" d="' + d + '"/><path class="cut" d="' + d + '"/>'; };
    var rows = [
      {
        svg: '<svg viewBox="0 0 320 80" role="img" aria-label="Slender carrot left whole, with one optional diagonal cut if it is very long">' +
          '<path class="carrot-top" d="M30 40 Q20 33 12 31 M30 40 Q20 47 12 49"/>' +
          '<path class="carrot-body" d="M30 34 L226 38.6 Q234 40 226 41.4 L30 46 Q24 40 30 34Z"/>' + halo('M118 24 L138 56') +
          '<circle class="carrot-body" cx="284" cy="40" r="7"/>' +
          '</svg>',
        cap: ['Slender, under about 1/2 inch', 'Leave whole. Cut very long ones once, on a sharp diagonal.']
      },
      {
        svg: '<svg viewBox="0 0 320 80" role="img" aria-label="Medium carrot halved crosswise on a diagonal, with the thick top section halved lengthwise">' +
          '<path class="carrot-top" d="M30 40 Q19 31 10 28 M30 40 Q19 49 10 52"/>' +
          '<path class="carrot-body" d="M30 29 L222 37.4 Q234 40 222 42.6 L30 51 Q20 40 30 29Z"/>' + halo('M112 20 L136 60') + halo('M36 40 L116 40') +
          '<circle class="carrot-body" cx="284" cy="40" r="15"/>' + halo('M284 22 L284 58') +
          '</svg>',
        cap: ['Medium, 1/2 to 1 inch', 'Halve crosswise on a diagonal. If the top is much thicker than the tip, halve the top lengthwise.']
      },
      {
        svg: '<svg viewBox="0 0 320 80" role="img" aria-label="Large carrot halved crosswise, with the thick upper section quartered lengthwise">' +
          '<path class="carrot-top" d="M30 40 Q18 29 8 25 M30 40 Q18 51 8 55"/>' +
          '<path class="carrot-body" d="M30 23 L218 36.5 Q232 40 218 43.5 L30 57 Q14 40 30 23Z"/>' + halo('M106 14 L134 66') + halo('M36 40 L112 40') +
          '<circle class="carrot-body" cx="282" cy="40" r="21"/>' + halo('M282 16 L282 64') + halo('M258 40 L306 40') +
          '</svg>',
        cap: ['Large, over 1 inch', 'Halve crosswise, then quarter the thick upper section lengthwise. Halve or quarter the narrow end as needed.']
      },
      {
        svg: '<svg viewBox="0 0 320 96" role="img" aria-label="Pieces laid side by side at an even thickness of about one half to three quarters of an inch; an extra-thick piece is split lengthwise">' +
          '<rect class="carrot-body" x="20" y="8" width="150" height="14" rx="7"/>' +
          '<rect class="carrot-body" x="20" y="28" width="132" height="14" rx="7"/>' +
          '<rect class="carrot-body" x="20" y="48" width="142" height="14" rx="7"/>' +
          '<rect class="carrot-body" x="20" y="66" width="122" height="26" rx="12"/>' + halo('M26 79 L136 79') +
          '<path class="guide-ruler" d="M186 8 L186 22 M180 8 L192 8 M180 22 L192 22"/>' +
          '<text class="guide-label" x="200" y="20">1/2 to 3/4 in</text>' +
          '<text class="guide-label" x="160" y="84">split it</text>' +
          '</svg>',
        cap: ['Check', 'Lay a few side by side. Most should be 1/2 to 3/4 inch thick at the widest point; split any piece twice as thick as its neighbors.']
      }
    ];
    return h('div', { class: 'guide' },
      h('p', { class: 'guide__title' }, 'Cut for even thickness'),
      h('p', { class: 'guide__goal' }, 'The goal is uniform thickness, not identical length.'),
      rows.map(function (r) {
        return h('div', { class: 'guide__row' }, h('div', { html: r.svg }), h('p', { class: 'guide__cap' }, h('b', null, r.cap[0]), r.cap[1]));
      }));
  }

  function stepRow(r, st) {
    var body = h('span', { class: 'check__text' }, h('span', { class: 'step-num' }, st._num + '.'), rich(st.text));
    var extra = st.timer ? h('div', { class: 'step-extra' }, timerChips(st.timer, { step: st._id, recipe: r.id })) : null;
    return checkRow({ kind: 'recipe', id: st._id, recipe: r.id, checked: !!state.recipe[st._id], body: body, extra: extra });
  }

  function recipeCard(r, idx) {
    var art = h('article', { class: 'card recipe', id: 'recipe-' + r.id, 'aria-labelledby': 'rt-' + r.id });

    var fig = h('figure', { class: 'hero', style: '--g1:' + r.palette[0] + ';--g2:' + r.palette[1], 'data-photo': r.image });
    var img = h('img', { alt: r.imageAlt, width: 1600, height: 1000, decoding: 'async', loading: 'lazy', 'data-src': r.image });
    fig.appendChild(img);
    fig.appendChild(h('div', { class: 'hero__fallback', html: ICON.plate }));
    art.appendChild(fig);

    art.appendChild(h('div', { class: 'recipe__head' },
      h('p', { class: 'eyebrow' }, 'Recipe ' + (idx + 1) + ' · ' + r.shortTitle),
      h('h2', { id: 'rt-' + r.id }, r.title),
      r.subtitle ? h('p', { class: 'recipe__sub' }, r.subtitle) : null));
    if (r.intro && r.intro.length) art.appendChild(h('div', { class: 'recipe__intro' }, r.intro.map(function (t) { return h('p', null, rich(t)); })));
    (r.callouts || []).forEach(function (c) {
      art.appendChild(h('div', { class: 'callout callout--' + (c.tone || 'alert') }, h('span', { class: 'callout__label' }, c.label), h('p', null, rich(c.text))));
    });
    art.appendChild(h('dl', { class: 'stats' }, (r.stats || []).map(function (s) {
      return h('div', { class: 'stat' }, h('dt', null, s[0]), h('dd', null, s[1]));
    })));
    var pos = state.cook.pos[r.id] || 0;
    art.appendChild(h('div', { class: 'recipe__actions' },
      h('button', { type: 'button', class: 'btn btn--primary btn--block', 'data-action': 'cook-open', 'data-recipe': r.id },
        icon('cook'), pos > 0 ? 'Cook Mode · resume step ' + (pos + 1) : 'Start Cook Mode')));

    // Ingredients
    var ingBody = [];
    r.ingredients.forEach(function (g) {
      if (g.title) ingBody.push(h('p', { class: 'subhead' }, g.title));
      ingBody.push(h('ul', { class: 'check-list' }, g._items.map(function (it) {
        return checkRow({
          kind: 'recipe', id: it._id, recipe: r.id, checked: !!state.recipe[it._id],
          body: [h('span', { class: 'check__text' }, rich(it.text)), it.tbc ? h('span', { class: 'tags' }, h('span', { class: 'tag tag--warn' }, 'To be confirmed: see Notes')) : null]
        });
      })));
    });
    art.appendChild(detailsEl('r:' + r.id + ':ing', false,
      h('span', { class: 'sumtitle' }, h('span', { class: 'eyebrow' }, 'Ingredients'), h('small', null, r._ing.length + ' items')),
      ingBody, null, r.id + ':ing'));

    // Method (a cutting guide gets its own section)
    var methodBody = [];
    var plainSections = r.method.filter(function (x) { return !x.guide; });
    var showSub = !(plainSections.length === 1 && plainSections[0].title === 'Method');
    r.method.forEach(function (sec, si) {
      if (sec.guide) {
        var gBody = [carrotGuide(), sec.intro ? h('p', { class: 'method-intro' }, sec.intro) : null,
          h('ol', { class: 'check-list' }, sec._steps.map(function (st) { return stepRow(r, st); }))];
        art.appendChild(detailsEl('r:' + r.id + ':guide', false,
          h('span', { class: 'sumtitle' }, h('span', { class: 'eyebrow' }, 'How to cut'), h('small', null, sec.title)),
          gBody, null, r.id + ':sec' + si));
        return;
      }
      if (showSub) methodBody.push(h('p', { class: 'subhead' }, sec.title));
      methodBody.push(h('ol', { class: 'check-list' }, sec._steps.map(function (st) { return stepRow(r, st); })));
    });
    var stepCount = r._steps.filter(function (st) { return !st._section.guide; }).length;
    art.appendChild(detailsEl('r:' + r.id + ':method', false,
      h('span', { class: 'sumtitle' }, h('span', { class: 'eyebrow' }, 'Method'), h('small', null, stepCount + ' steps')),
      methodBody, null, r.id + ':method'));

    // Notes
    var noteBody = [];
    (r.notes || []).forEach(function (n) {
      if (n.title) noteBody.push(h('p', { class: 'subhead' }, n.title));
      noteBody.push(h('ul', { class: 'notes-list' }, n.items.map(function (t) { return h('li', null, rich(t)); })));
    });
    if (noteBody.length) {
      art.appendChild(detailsEl('r:' + r.id + ':notes', false,
        h('span', { class: 'sumtitle' }, h('span', { class: 'eyebrow' }, 'Notes'), h('small', null, 'Battle notes')), noteBody));
    }

    // Credits
    art.appendChild(h('div', { class: 'credits' },
      h('span', { class: 'eyebrow' }, 'Source'),
      h('ul', null, (r.credits || []).map(function (c) {
        return h('li', null, c.url ? ['Inspired by and adapted from ', h('a', { href: c.url, target: '_blank', rel: 'noopener' }, c.label)] : c.label);
      }))));
    art.appendChild(h('div', { class: 'recipe__foot' },
      h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'data-action': 'reset-recipe', 'data-recipe': r.id }, icon('reset'), 'Reset this recipe')));
    return art;
  }

  function renderRecipes() {
    var p = $('#panel-recipes');
    p.textContent = '';
    p.appendChild(masthead('Recipes', 'The menu', DATA.menu.join(' · ')));
    p.appendChild(h('nav', { class: 'jump', 'aria-label': 'Recipes' }, DATA.recipes.map(function (r) {
      return h('a', { href: '#recipe-' + r.id, 'data-action': 'jump', 'data-target': 'recipe-' + r.id }, r.shortTitle);
    })));
    DATA.recipes.forEach(function (r, i) { p.appendChild(recipeCard(r, i)); });
    p.appendChild(h('div', { class: 'btn-row', style: 'margin-top:8px' },
      h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'reset-recipes' }, icon('reset'), 'Reset all recipe checkmarks')));
    DATA.recipes.forEach(function (r) { updateRecipeCounts(r.id); });
  }

  function updateRecipeCounts(rid) {
    var r = RECIPES[rid];
    if (!r) return;
    function cnt(list) { var n = 0; list.forEach(function (x) { if (state.recipe[x._id]) n++; }); return n; }
    var ing = $('[data-rcount="' + rid + ':ing"]');
    if (ing) ing.textContent = cnt(r._ing) + '/' + r._ing.length;
    var methodSteps = r._steps.filter(function (st) { return !st._section.guide; });
    var m = $('[data-rcount="' + rid + ':method"]');
    if (m) m.textContent = cnt(methodSteps) + '/' + methodSteps.length;
    r.method.forEach(function (sec, si) {
      var el = $('[data-rcount="' + rid + ':sec' + si + '"]');
      if (el) el.textContent = cnt(sec._steps) + '/' + sec._steps.length;
    });
    var btn = $('[data-action="cook-open"][data-recipe="' + rid + '"]', $('#panel-recipes'));
    if (btn) {
      var pos = state.cook.pos[rid] || 0;
      btn.lastChild.textContent = pos > 0 ? 'Cook Mode · resume step ' + (pos + 1) : 'Start Cook Mode';
    }
  }

  /* Photos: load after the service worker is in control so a missing file
     falls back quietly to the gradient. */
  var swReadyResolve;
  var swReady = new Promise(function (res) { swReadyResolve = res; });
  setTimeout(function () { swReadyResolve(); }, 3000);
  var photoState = {};

  function loadHeroes() {
    swReady.then(function () {
      $$('.hero').forEach(function (fig) {
        var img = fig.querySelector('img');
        if (!img || img.getAttribute('src')) return;
        img.addEventListener('load', function () {
          if (img.naturalWidth > 2) { fig.classList.add('is-loaded'); photoState[img.dataset.src] = true; }
          else markMissing(fig, img);
          renderOpenHints();
        });
        img.addEventListener('error', function () { markMissing(fig, img); renderOpenHints(); });
        img.src = img.dataset.src;
      });
    });
  }
  function markMissing(fig, img) {
    fig.classList.add('is-missing');
    photoState[img.dataset.src] = false;
    var fb = fig.querySelector('.hero__fallback');
    fb.setAttribute('role', 'img');
    fb.setAttribute('aria-label', img.alt + ' (photo not added yet)');
    fb.removeAttribute('aria-hidden');
  }
  function probePhotos() {
    return swReady.then(function () {
      return Promise.all(DATA.recipes.map(function (r) {
        if (photoState[r.image] !== undefined) return Promise.resolve(photoState[r.image]);
        return new Promise(function (res) {
          var im = new Image();
          im.onload = function () { photoState[r.image] = im.naturalWidth > 2; res(photoState[r.image]); };
          im.onerror = function () { photoState[r.image] = false; res(false); };
          im.src = r.image;
        });
      }));
    });
  }

  /* =====================================================================
     TIMERS
     ===================================================================== */
  var timers = state.timers;
  function findTimer(id) { for (var i = 0; i < timers.length; i++) if (timers[i].id === id) return timers[i]; return null; }
  function timerLeft(t, now) {
    if (t.state === 'paused') return t.left;
    if (t.state === 'done') return 0;
    return Math.max(0, t.endAt - (now || Date.now()));
  }
  function startTimer(min, label, recipe, step) {
    min = +min;
    if (!(min > 0)) return;
    var ms = Math.round(min * 60000);
    timers.push({ id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label: label || 'Timer', recipe: recipe || null, step: step || null, total: ms, endAt: Date.now() + ms, left: null, state: 'running', doneAt: null });
    saveTimers();
    unlockAudio();
    afterTimersChanged();
    toast('Timer started: ' + (label || 'Timer') + ', ' + fmtMins(min));
  }
  function pauseTimer(t) { if (t.state !== 'running') return; t.left = Math.max(0, t.endAt - Date.now()); t.endAt = null; t.state = 'paused'; }
  function resumeTimer(t) { if (t.state !== 'paused') return; t.endAt = Date.now() + t.left; t.left = null; t.state = 'running'; }
  function addTime(t, min) {
    var ms = min * 60000;
    if (t.state === 'running') { t.endAt += ms; t.total += ms; }
    else if (t.state === 'paused') { t.left += ms; t.total += ms; }
    else { t.state = 'running'; t.endAt = Date.now() + ms; t.total = ms; t.doneAt = null; }
  }
  function removeTimer(t) { var i = timers.indexOf(t); if (i > -1) timers.splice(i, 1); }

  function tick() {
    var now = Date.now(), finished = [];
    timers.forEach(function (t) {
      if (t.state === 'running' && t.endAt <= now) { t.state = 'done'; t.doneAt = t.endAt; finished.push(t); }
    });
    if (finished.length) {
      saveTimers();
      afterTimersChanged();
      ringFor(finished);
    }
    $$('[data-countdown]').forEach(function (el) {
      var t = findTimer(el.getAttribute('data-countdown'));
      if (t) el.textContent = t.state === 'done' ? 'Done' : fmtDur(timerLeft(t, now));
    });
    $$('[data-tprogress]').forEach(function (el) {
      var t = findTimer(el.getAttribute('data-tprogress'));
      if (t) el.style.width = (t.state === 'done' ? 100 : Math.min(100, (1 - timerLeft(t, now) / t.total) * 100)) + '%';
    });
  }

  function timerCard(t) {
    var cls = 'timer' + (t.state === 'done' ? ' is-done' : t.state === 'paused' ? ' is-paused' : '');
    var ctrls;
    if (t.state === 'done') {
      ctrls = [
        h('button', { type: 'button', class: 'btn btn--primary btn--small', 'data-action': 'timer-dismiss', 'data-id': t.id }, 'Dismiss'),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-add', 'data-id': t.id, 'data-min': 1 }, '+1 min'),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-add', 'data-id': t.id, 'data-min': 5 }, '+5 min')
      ];
    } else {
      ctrls = [
        t.state === 'paused'
          ? h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-resume', 'data-id': t.id }, 'Resume')
          : h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-pause', 'data-id': t.id }, 'Pause'),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-add', 'data-id': t.id, 'data-min': 1, 'aria-label': 'Add 1 minute' }, '+1 min'),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-add', 'data-id': t.id, 'data-min': 5, 'aria-label': 'Add 5 minutes' }, '+5 min'),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-cancel', 'data-id': t.id, 'aria-label': 'Cancel timer: ' + t.label, title: 'Cancel' },
          h('span', { html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>', style: 'display:contents' }))
      ];
    }
    return h('li', { class: cls },
      h('div', { class: 'timer__top' },
        h('span', { class: 'timer__label' }, t.label, t.state === 'paused' ? ' (paused)' : ''),
        h('span', { class: 'timer__time', 'data-countdown': t.id }, t.state === 'done' ? 'Done' : fmtDur(timerLeft(t)))),
      h('div', { class: 'progress', 'aria-hidden': 'true' }, h('span', { 'data-tprogress': t.id })),
      h('div', { class: 'timer__ctrls' + (t.state === 'done' ? ' timer__ctrls--done' : '') }, ctrls));
  }

  function timerChips(spec, ctx) {
    var row = h('div', { class: 'chip-row', 'data-chips': ctx.step });
    row._spec = spec; row._ctx = ctx;
    fillChipRow(row);
    return row;
  }
  function fillChipRow(row) {
    var spec = row._spec, ctx = row._ctx;
    if (!spec) return;
    var t = null;
    for (var i = 0; i < timers.length; i++) if (timers[i].step === ctx.step) { t = timers[i]; break; }
    var sig = t ? t.id + t.state : 'none';
    if (row._sig === sig) return;
    row._sig = sig;
    row.textContent = '';
    if (t) {
      row.appendChild(h('button', { type: 'button', class: 'chip chip--running', 'data-action': 'goto-timers', 'aria-label': 'Timer running: ' + t.label + '. Show timers' },
        icon('timer'), h('span', { 'data-countdown': t.id }, t.state === 'done' ? 'Done' : fmtDur(timerLeft(t))), t.state === 'paused' ? ' paused' : ''));
    } else {
      var mins = spec.max && spec.max !== spec.min ? [spec.min, spec.max] : [spec.min];
      mins.forEach(function (m) {
        row.appendChild(h('button', {
          type: 'button', class: 'chip', 'data-action': 'timer-start', 'data-min': m, 'data-label': spec.label,
          'data-recipe': ctx.recipe || '', 'data-step': ctx.step, 'aria-label': 'Start ' + fmtMins(m) + ' timer: ' + spec.label
        }, icon('play'), fmtMins(m)));
      });
    }
  }
  function refreshChipRows() { $$('[data-chips]').forEach(fillChipRow); }

  function renderTimerList() {
    var ul = $('#timer-list');
    if (!ul) return;
    ul.textContent = '';
    if (!timers.length) { ul.appendChild(h('li', { class: 'empty' }, 'No timers running. Tap a time on any recipe step, the plan or the cheat sheet below.')); return; }
    timers.forEach(function (t) { ul.appendChild(timerCard(t)); });
  }
  function dockPill(t) {
    return h('button', { type: 'button', class: 'dock-pill' + (t.state === 'done' ? ' is-done' : t.state === 'paused' ? ' is-paused' : ''), 'data-action': 'goto-timers' },
      icon('timer'), h('span', null, t.label), h('b', { 'data-countdown': t.id }, t.state === 'done' ? 'Done' : fmtDur(timerLeft(t))));
  }
  function renderDock() {
    var dock = $('#dock');
    if (!timers.length) {
      dock.hidden = true;
      document.documentElement.style.setProperty('--dock-h', '0px');
    } else {
      dock.hidden = false;
      dock.textContent = '';
      dock.appendChild(h('div', { class: 'dock__inner' }, timers.map(dockPill)));
      document.documentElement.style.setProperty('--dock-h', dock.offsetHeight + 'px');
    }
    var badge = $('#cook-badge');
    var running = timers.length;
    badge.hidden = !running;
    badge.textContent = running ? String(running) : '';
    $('#tab-cook').setAttribute('aria-label', running ? 'Cook, ' + running + (running === 1 ? ' timer' : ' timers') : 'Cook');
  }

  function afterTimersChanged() {
    renderTimerList();
    renderDock();
    refreshChipRows();
    if (cm.open) { renderCmTimers(); renderCmDock(); }
    renderAlarm();
    updateWake();
    tick();
  }

  /* Alarm: banner on every screen + sound + vibration */
  var actx = null, ringTimer = null, ringStarted = 0;
  function unlockAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') actx.resume().catch(function () {});
      var b = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource();
      src.buffer = b; src.connect(actx.destination); src.start(0);
    } catch (e) { /* no audio */ }
  }
  function beep() {
    if (!actx || actx.state !== 'running') return;
    var t0 = actx.currentTime;
    [0, 0.28, 0.56].forEach(function (off, i) {
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine';
      o.frequency.value = i === 2 ? 1175 : 880;
      g.gain.setValueAtTime(0.0001, t0 + off);
      g.gain.exponentialRampToValueAtTime(0.45, t0 + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.22);
      o.connect(g); g.connect(actx.destination);
      o.start(t0 + off); o.stop(t0 + off + 0.25);
    });
  }
  function canVibrate() {
    return !!navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive);
  }
  function ringFor(list) {
    notifyFinished(list);
    if (ringTimer) return;
    ringStarted = Date.now();
    var ring = function () {
      var anyDone = timers.some(function (t) { return t.state === 'done'; });
      if (!anyDone || Date.now() - ringStarted > 120000) { stopRing(); return; }
      beep();
      if (canVibrate()) { try { navigator.vibrate([400, 160, 400, 160, 700]); } catch (e) { /* ignore */ } }
    };
    ring();
    ringTimer = setInterval(ring, 2600);
  }
  function stopRing() {
    if (ringTimer) { clearInterval(ringTimer); ringTimer = null; }
    if (canVibrate()) { try { navigator.vibrate(0); } catch (e) { /* ignore */ } }
  }
  function renderAlarm() {
    var done = timers.filter(function (t) { return t.state === 'done'; });
    var el = $('#alarm');
    if (!done.length) {
      el.hidden = true; el.textContent = '';
      document.title = BASE_TITLE;
      stopRing();
      return;
    }
    el.textContent = '';
    el.appendChild(h('div', { class: 'alarm__inner' },
      h('p', { class: 'alarm__title' }, done.length === 1 ? 'Timer done' : done.length + ' timers done'),
      h('ul', { class: 'alarm__list' }, done.map(function (t) {
        var ago = Math.round((Date.now() - (t.doneAt || Date.now())) / 60000);
        return h('li', null,
          h('span', null, t.label, ago >= 1 ? ' · ' + ago + ' min ago' : ''),
          h('div', { class: 'alarm__btns' },
            h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'timer-add', 'data-id': t.id, 'data-min': 5 }, '+5 min'),
            h('button', { type: 'button', class: 'btn btn--small btn--primary', 'data-action': 'timer-dismiss', 'data-id': t.id }, 'Dismiss')));
      }))));
    el.hidden = false;
    document.title = 'Timer done: ' + done[0].label;
  }
  function notifyFinished(list) {
    if (!state.prefs.notify || !('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return;
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.ready.then(function (reg) {
      list.forEach(function (t) {
        reg.showNotification('Timer done', { body: t.label, tag: t.id, renotify: true, requireInteraction: true, icon: 'images/icons/icon-192.png', vibrate: [400, 160, 400] });
      });
    }).catch(function () {});
  }

  /* =====================================================================
     WAKE LOCK: keep the screen on during Cook Mode and while timers run
     ===================================================================== */
  var wake = { sentinel: null, pending: false, status: 'off' };
  function wakeNeeded() {
    return state.prefs.wake && document.visibilityState === 'visible' &&
      (cm.open || timers.some(function (t) { return t.state === 'running' || t.state === 'done'; }));
  }
  function updateWake() {
    if (!('wakeLock' in navigator)) { wake.status = 'unsupported'; renderWake(); return; }
    if (wakeNeeded()) {
      if (wake.sentinel || wake.pending) { renderWake(); return; }
      wake.pending = true;
      navigator.wakeLock.request('screen').then(function (s) {
        wake.pending = false;
        wake.sentinel = s;
        wake.status = 'on';
        s.addEventListener('release', function () {
          if (wake.sentinel === s) wake.sentinel = null;
          wake.status = state.prefs.wake ? 'idle' : 'off';
          renderWake();
        });
        if (!wakeNeeded()) releaseWake();
        renderWake();
      }).catch(function () {
        wake.pending = false;
        wake.status = 'blocked';
        renderWake();
      });
    } else {
      releaseWake();
      wake.status = state.prefs.wake ? 'idle' : 'off';
      renderWake();
    }
  }
  function releaseWake() {
    var s = wake.sentinel;
    wake.sentinel = null;
    if (s) s.release().catch(function () {});
  }
  function wakeText() {
    switch (wake.status) {
      case 'on': return 'Screen will stay awake.';
      case 'idle': return 'On: the screen stays awake during Cook Mode and while a timer is running.';
      case 'blocked': return 'The browser didn\'t allow keeping the screen awake just now. Tap Awake to try again, or set Auto-Lock to Never while cooking.';
      case 'unsupported': return 'This browser can\'t keep the screen awake. While cooking, set Auto-Lock to Never (iPhone: Settings, Display & Brightness, Auto-Lock).';
      default: return 'Off: the screen can dim and lock as usual. Timers still finish on time; alerts show when you come back.';
    }
  }
  function renderWake() {
    var on = !!state.prefs.wake;
    var btn = $('#cm-wake');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', 'Keep screen awake: ' + (on ? 'on' : 'off'));
      btn.querySelector('span').textContent = on ? 'Awake' : 'Sleep ok';
    }
    var note = $('#cm-wake-note');
    if (note) note.textContent = wakeText();
    var sw = $('#wake-switch');
    if (sw) sw.checked = on;
    var st = $('#wake-status');
    if (st) { st.textContent = wakeText(); st.classList.toggle('is-on', wake.status === 'on'); }
  }
  function setWakePref(on) {
    state.prefs.wake = !!on;
    savePrefs();
    updateWake();
  }

  /* =====================================================================
     COOK MODE
     ===================================================================== */
  var cm = { open: false, recipe: null, idx: 0, opener: null };

  function openCook(rid, idx) {
    var r = RECIPES[rid];
    if (!r) return;
    cm.recipe = r;
    cm.idx = clamp(idx !== undefined ? idx : (state.cook.pos[rid] || 0), 0, r._steps.length - 1);
    cm.opener = document.activeElement;
    state.cook.recipeId = rid;
    saveCook();

    $('#cm-title').textContent = r.shortTitle;
    var sel = $('#cm-jump');
    sel.textContent = '';
    r.method.forEach(function (sec) { sel.appendChild(h('option', { value: String(sec._start) }, sec.title)); });
    sel.closest('label').hidden = r.method.length < 2;

    var ib = $('#cm-ingredients-body');
    ib.textContent = '';
    r.ingredients.forEach(function (g) {
      if (g.title) ib.appendChild(h('h4', null, g.title));
      ib.appendChild(h('ul', null, g._items.map(function (it) { return h('li', null, rich(it.text)); })));
    });
    var nb = $('#cm-notes-body');
    nb.textContent = '';
    (r.callouts || []).forEach(function (c) { nb.appendChild(h('div', { class: 'callout callout--alert' }, h('span', { class: 'callout__label' }, c.label), h('p', null, rich(c.text)))); });
    (r.notes || []).forEach(function (n) {
      if (n.title) nb.appendChild(h('h4', null, n.title));
      nb.appendChild(h('ul', null, n.items.map(function (t) { return h('li', null, rich(t)); })));
    });

    $('#cookmode').hidden = false;
    document.documentElement.classList.add('no-scroll', 'cook-open');
    if (!(history.state && history.state.cook)) { try { history.pushState({ cook: true }, ''); } catch (e) { /* ignore */ } }
    cm.open = true;
    unlockAudio();
    renderCookStep();
    renderCmDock();
    updateWake();
    renderCookPanelResume();
    setTimeout(function () { $('#cm-body').focus({ preventScroll: true }); }, 30);
  }

  function closeCook(fromPop) {
    if (!cm.open) return;
    cm.open = false;
    $('#cookmode').hidden = true;
    document.documentElement.classList.remove('no-scroll', 'cook-open');
    if (!fromPop && history.state && history.state.cook) history.back();
    updateWake();
    if (cm.recipe) updateRecipeCounts(cm.recipe.id);
    renderCookPanelResume();
    if (cm.opener && document.body.contains(cm.opener)) { try { cm.opener.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }

  function renderCookStep() {
    var r = cm.recipe, steps = r._steps, st = steps[cm.idx];
    $('#cm-section').textContent = st._section.title;
    $('#cm-count').textContent = 'Step ' + (cm.idx + 1) + ' of ' + steps.length;
    $('#cm-bar').style.width = ((cm.idx + 1) / steps.length * 100) + '%';
    $('#cm-num').textContent = st._num;
    var text = $('#cm-text');
    text.textContent = '';
    text.appendChild(rich(st.text));
    var done = $('#cm-done');
    done.setAttribute('data-kind', 'recipe');
    done.setAttribute('data-id', st._id);
    done.setAttribute('data-recipe', r.id);
    done.checked = !!state.recipe[st._id];
    $('#cm-done-row').classList.toggle('is-checked', done.checked);
    $('#cm-jump').value = String(st._section._start);
    $('#cm-prev').disabled = cm.idx === 0;
    var last = cm.idx === steps.length - 1;
    var next = $('#cm-next');
    next.firstChild.textContent = last ? 'Finish ' : 'Next ';
    renderCmTimers();
    state.cook.pos[r.id] = cm.idx;
    saveCook();
    $('#cm-body').scrollTop = 0;
  }

  function renderCmTimers() {
    var box = $('#cm-timers');
    box.textContent = '';
    var st = cm.recipe._steps[cm.idx];
    if (!st.timer) return;
    var t = null;
    for (var i = 0; i < timers.length; i++) if (timers[i].step === st._id) { t = timers[i]; break; }
    if (t) { box.appendChild(h('ul', { class: 'timers' }, timerCard(t))); return; }
    var mins = st.timer.max && st.timer.max !== st.timer.min ? [st.timer.min, st.timer.max] : [st.timer.min];
    mins.forEach(function (m, i) {
      box.appendChild(h('button', {
        type: 'button', class: 'btn btn--xl ' + (i === 0 ? 'btn--primary' : 'btn--ghost'), 'data-action': 'timer-start',
        'data-min': m, 'data-label': st.timer.label, 'data-recipe': cm.recipe.id, 'data-step': st._id
      }, icon('timer'), 'Start ' + fmtMins(m) + ' timer'));
    });
  }
  function renderCmDock() {
    var dock = $('#cm-dock');
    var st = cm.recipe && cm.recipe._steps[cm.idx];
    var others = timers.filter(function (t) { return !st || t.step !== st._id; });
    dock.hidden = !others.length;
    dock.textContent = '';
    others.forEach(function (t) { dock.appendChild(dockPill(t)); });
  }
  function cookGo(delta) {
    var n = cm.idx + delta;
    if (n < 0) return;
    if (n >= cm.recipe._steps.length) {
      var title = cm.recipe.shortTitle;
      closeCook();
      toast(title + ': all steps done. Nice work.');
      return;
    }
    cm.idx = n;
    renderCookStep();
    renderCmDock();
  }

  /* =====================================================================
     COOK TAB
     ===================================================================== */
  function renderCook() {
    var p = $('#panel-cook');
    p.textContent = '';
    p.appendChild(masthead('Cook', 'Cook-day station', 'Cook Mode, running timers and the temperature cheat sheet.'));
    p.appendChild(h('section', { class: 'card', id: 'cook-next', hidden: true }));

    p.appendChild(h('section', { class: 'card', 'aria-labelledby': 'cm-h' },
      h('div', { class: 'card__head' }, h('h2', { id: 'cm-h' }, 'Cook Mode'), h('span', { class: 'count' }, 'One step at a time')),
      h('div', { id: 'cook-resume' }),
      h('ul', { class: 'recipe-picks', id: 'recipe-picks' })));

    p.appendChild(h('section', { class: 'card card__pad', 'aria-label': 'Keep screen awake' },
      switchEl('wake-switch', 'Keep screen awake', 'During Cook Mode and while a timer is running.', state.prefs.wake),
      h('p', { class: 'wake-status', id: 'wake-status' })));

    var customLabel = h('input', { type: 'text', id: 'custom-label', placeholder: 'Label (optional)', maxlength: 40, autocomplete: 'off', 'aria-label': 'Timer label' });
    var customMin = h('input', { type: 'number', id: 'custom-min', inputmode: 'numeric', min: 1, max: 600, step: 1, placeholder: 'Min', 'aria-label': 'Minutes' });
    var notifyRow = null;
    if ('Notification' in window) {
      notifyRow = h('div', { style: 'padding:4px 16px 14px;border-top:1px solid var(--line)' },
        switchEl('notify-switch', 'Notify me in the background', 'Shows a notification if a timer ends while you are in another app. Android, or iPhone when installed to the Home Screen.', state.prefs.notify && Notification.permission === 'granted'));
    }
    p.appendChild(h('section', { class: 'card', id: 'timers-card', 'aria-labelledby': 'timers-h' },
      h('div', { class: 'card__head' }, h('h2', { id: 'timers-h' }, 'Timers'), h('span', { class: 'count' }, 'Run several at once')),
      h('ul', { class: 'timers', id: 'timer-list' }),
      h('form', { class: 'custom-timer', id: 'custom-timer', autocomplete: 'off' },
        customLabel, customMin,
        h('button', { type: 'submit', class: 'btn btn--primary' }, icon('timer'), 'Start custom timer')),
      notifyRow,
      h('p', { class: 'muted small', style: 'padding:0 16px 14px' }, 'Timers keep their end time even if the screen locks or you reload. Phones pause web pages in the background, so the alarm sounds when you return unless the screen is kept awake. On iPhone, the sound follows the ring/silent switch.')));

    var ref = DATA.cookReference;
    p.appendChild(h('section', { class: 'card', 'aria-labelledby': 'ref-h' },
      h('div', { class: 'card__head' }, h('h2', { id: 'ref-h' }, 'Temperature cheat sheet'), h('span', { class: 'count' }, 'Cook-day quick reference')),
      h('div', { class: 'tiles' }, ref.tiles.map(function (t) { return h('div', { class: 'tile' }, h('b', null, t.value), h('span', null, t.label)); })),
      h('ul', { class: 'ref-list' }, ref.lines.map(function (l, i) {
        return h('li', { class: l.strong ? 'is-strong' : null },
          h('span', { class: 'ref-label' }, l.label),
          h('span', { class: 'ref-text' }, rich(l.text)),
          l.timers ? h('div', { class: 'chip-row' }, l.timers.map(function (t, j) {
            return timerChips({ min: t.min, label: t.label }, { step: 'ref:' + i + ':' + j });
          })) : null);
      }))));
    renderCookPanelResume();
    renderTimerList();
    renderWake();
    renderCookNext();
  }

  function renderCookPanelResume() {
    var box = $('#cook-resume');
    if (!box) return;
    box.textContent = '';
    var rid = state.cook.recipeId;
    if (rid && RECIPES[rid]) {
      var r = RECIPES[rid], pos = state.cook.pos[rid] || 0, st = r._steps[Math.min(pos, r._steps.length - 1)];
      box.appendChild(h('div', { class: 'resume' },
        h('p', null, h('b', null, r.shortTitle), ' · ', st._section.title, ', step ', String(st._num), ' (', String(pos + 1), ' of ', String(r._steps.length), ')'),
        h('button', { type: 'button', class: 'btn btn--primary btn--block', 'data-action': 'cook-open', 'data-recipe': rid }, icon('cook'), 'Resume Cook Mode')));
    }
    var ul = $('#recipe-picks');
    ul.textContent = '';
    DATA.recipes.forEach(function (r) {
      var pos = state.cook.pos[r.id] || 0;
      ul.appendChild(h('li', null, h('button', { type: 'button', class: 'recipe-pick', 'data-action': 'cook-open', 'data-recipe': r.id },
        h('span', null, h('b', null, r.shortTitle), h('small', null, r._steps.length + ' steps' + (pos > 0 ? ' · at step ' + (pos + 1) : ''))),
        h('span', { class: 'go' }, pos > 0 ? 'Resume' : 'Start'))));
    });
  }

  function renderCookNext() {
    var box = $('#cook-next');
    if (!box) return;
    var isDay = localISO() === DATA.site.thanksgiving;
    if (!isDay || !window.__tgPlan) { box.hidden = true; return; }
    var now = nowMinutes();
    var upcoming = window.__tgPlan.events.filter(function (e) { return e.t >= now - 1; }).slice(0, 3);
    box.textContent = '';
    if (!upcoming.length) { box.hidden = true; return; }
    box.hidden = false;
    box.appendChild(h('div', { class: 'card__head' }, h('h2', null, 'Next on the plan'), h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'data-action': 'goto-tab', 'data-tab': 'plan' }, 'Full plan')));
    box.appendChild(h('ul', { class: 'timeline' }, upcoming.map(function (e, i) {
      var cp = clockParts(e.t);
      return h('li', { class: 'tl-item' + (i === 0 ? ' is-next' : '') },
        h('div', { class: 'tl-time' }, cp.time, h('small', null, cp.ap)),
        h('div', { class: 'tl-body' }, h('p', { class: 'tl-title' }, e.title), e.detail ? h('p', { class: 'tl-detail' }, rich(e.detail)) : null));
    })));
  }

  /* =====================================================================
     NOTES
     ===================================================================== */
  function renderNotes() {
    var p = $('#panel-notes');
    p.textContent = '';
    p.appendChild(masthead('Notes', 'Open items and notes', 'Decisions still open, reminders, and your own notes. Everything here saves on this phone.'));

    p.appendChild(h('section', { class: 'card', 'aria-labelledby': 'open-h' },
      h('div', { class: 'card__head' }, h('h2', { id: 'open-h' }, 'Open items'), h('span', { class: 'count', id: 'open-count' })),
      h('ul', { class: 'check-list' }, DATA.openItems.map(function (o) {
        return checkRow({
          kind: 'open', id: o._id, name: o.text, checked: !!state.open[o._id],
          body: [h('span', { class: 'check__text' }, rich(o.text)), o.hint ? h('span', { class: 'item-hint', 'data-hint': o.hint }) : null]
        });
      })),
      h('div', { class: 'btn-row', style: 'padding:4px 16px 16px' },
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'reset-open' }, icon('reset'), 'Reset open items'))));

    p.appendChild(h('section', { class: 'card', 'aria-labelledby': 'rem-h' },
      h('div', { class: 'card__head' }, h('h2', { id: 'rem-h' }, 'Reminders'), h('span', { class: 'count' }, 'From the recipes')),
      h('ul', { class: 'reminders' }, DATA.reminders.map(function (t) { return h('li', null, rich(t)); }))));

    var ta = h('textarea', { id: 'notes-text', rows: 9, placeholder: 'Anything to remember: who brings what, timing changes, ideas for next year…' });
    ta.value = state.notes || '';
    p.appendChild(h('section', { class: 'card card__pad', 'aria-labelledby': 'notes-h' },
      h('h2', { id: 'notes-h', style: 'font-size:1.3125rem;margin-bottom:10px' }, 'My notes'),
      h('label', { class: 'sr-only', for: 'notes-text' }, 'My notes'),
      ta,
      h('div', { class: 'btn-row', style: 'margin-top:10px;align-items:center;justify-content:space-between' },
        h('p', { class: 'save-state', id: 'notes-state', 'aria-live': 'polite' }, state.notes ? 'Saved on this phone.' : ''),
        h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'clear-notes' }, icon('reset'), 'Clear notes'))));

    p.appendChild(h('section', { class: 'card card__pad', 'aria-labelledby': 'data-h' },
      h('h2', { id: 'data-h', style: 'font-size:1.3125rem' }, 'This phone'),
      h('p', { class: 'muted', style: 'margin:6px 0 12px' }, 'Checkmarks, plan settings, timers and notes live only on this device. Nothing is uploaded.'),
      h('button', { type: 'button', class: 'btn btn--small', 'data-action': 'reset-all' }, icon('reset'), 'Reset everything on this phone')));

    updateOpenCount();
    renderOpenHints();
  }
  function updateOpenCount() {
    var n = 0;
    DATA.openItems.forEach(function (o) { if (state.open[o._id]) n++; });
    var c = $('#open-count');
    if (c) c.textContent = n + '/' + DATA.openItems.length + ' resolved';
  }
  var photoProbeStarted = false;
  function renderOpenHints() {
    var s = state.settings;
    $$('[data-hint]').forEach(function (el) {
      var kind = el.getAttribute('data-hint');
      el.textContent = '';
      el.classList.remove('is-ok');
      if (kind === 'servingTime') {
        if (s.servingSet) { el.classList.add('is-ok'); el.appendChild(document.createTextNode('Set to ' + fmtClock(parseHHMM(s.servingTime)) + ' on the Plan tab.')); }
        else el.appendChild(h('span', null, 'Default is ' + fmtClock(parseHHMM(PLAN_DEFAULTS.servingTime)) + '. ', h('a', { href: '#plan', 'data-action': 'goto-tab', 'data-tab': 'plan' }, 'Set it on the Plan tab')));
      } else if (kind === 'ovenPlan') {
        var o = DATA.plan.ovenOptions.filter(function (x) { return x.id === currentOpt(); })[0];
        if (s.ovenChosen) { el.classList.add('is-ok'); el.appendChild(document.createTextNode('Chosen: ' + o.letter + ', ' + o.name + '.')); }
        else el.appendChild(h('span', null, 'Not decided. ', h('a', { href: '#plan', 'data-action': 'goto-tab', 'data-tab': 'plan', 'data-target': 'oven-conflict' }, 'Compare the options')));
      } else if (kind === 'photos') {
        var known = DATA.recipes.filter(function (r) { return photoState[r.image] !== undefined; });
        if (known.length < DATA.recipes.length) {
          el.textContent = 'Checking the images folder…';
          if (!photoProbeStarted && state.ui.tab === 'notes') { photoProbeStarted = true; probePhotos().then(renderOpenHints); }
          return;
        }
        var missing = DATA.recipes.filter(function (r) { return !photoState[r.image]; }).map(function (r) { return r.image.split('/').pop(); });
        if (!missing.length) { el.classList.add('is-ok'); el.textContent = 'All ' + DATA.recipes.length + ' photos found.'; }
        else el.textContent = 'Found ' + (DATA.recipes.length - missing.length) + ' of ' + DATA.recipes.length + '. Still to add: ' + missing.join(', ') + '.';
      }
    });
  }

  var notesTimer = null;
  function saveNotes() {
    var ta = $('#notes-text');
    if (!ta) return;
    state.notes = ta.value;
    if (store.set('notes', state.notes)) {
      var d = new Date();
      $('#notes-state').textContent = 'Saved on this phone at ' + fmtClock(d.getHours() * 60 + d.getMinutes()) + '.';
    }
  }

  /* =====================================================================
     FOOTER
     ===================================================================== */
  function renderFooter() {
    var f = $('#site-footer');
    f.textContent = '';
    f.appendChild(h('h2', null, 'Inspired by and adapted from'));
    f.appendChild(h('ul', null, DATA.credits.map(function (c) {
      return h('li', null, h('a', { href: c.url, target: '_blank', rel: 'noopener' }, c.label));
    })));
    f.appendChild(h('p', { class: 'disclaimer' }, DATA.site.disclaimer));
  }

  /* =====================================================================
     TABS
     ===================================================================== */
  function showTab(id, opts) {
    opts = opts || {};
    if (TABS.indexOf(id) === -1) id = 'shop';
    TABS.forEach(function (t) {
      var on = t === id;
      $('#panel-' + t).hidden = !on;
      var tab = $('#tab-' + t);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    state.ui.tab = id;
    saveUi();
    if (!opts.keepHash) { try { history.replaceState(history.state, '', '#' + id); } catch (e) { /* file:// */ } }
    if (!opts.keepScroll) window.scrollTo(0, 0);
    if (id === 'recipes') loadHeroes();
    if (id === 'notes') renderOpenHints();
    if (id === 'plan') updatePlanNow();
    if (id === 'cook') { renderCookNext(); renderCookPanelResume(); }
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  /* =====================================================================
     EVENTS
     ===================================================================== */
  function onCheck(input) {
    var kind = input.getAttribute('data-kind'), id = input.getAttribute('data-id'), on = input.checked;
    var key = kind === 'shop' ? 'shop' : kind === 'open' ? 'open' : 'recipe';
    var bucket = state[key];
    if (on) bucket[id] = true; else delete bucket[id];
    store.set(key, bucket);
    $$('input[data-id="' + id + '"]').forEach(function (other) { if (other !== input) other.checked = on; markRow(other); });
    markRow(input);
    if (kind === 'shop') {
      updateShopCounts();
      if (on && state.ui.hideChecked) {
        toast('Checked off: ' + (input.getAttribute('data-name') || 'item'), 'Undo', function () { input.checked = false; onCheck(input); });
      }
    } else if (kind === 'open') {
      updateOpenCount();
    } else {
      updateRecipeCounts(input.getAttribute('data-recipe'));
    }
  }

  function bind() {
    document.addEventListener('change', function (e) {
      var el = e.target;
      if (el.matches('input[type="checkbox"][data-kind]')) { onCheck(el); return; }
      if (el.id === 'hide-checked') {
        state.ui.hideChecked = el.checked; saveUi();
        $('#shop-groups').classList.toggle('hide-checked', el.checked);
        return;
      }
      if (el.id === 'potatoes-ahead') { state.settings.potatoesAhead = el.checked; saveSettings(); updatePlan(); return; }
      if (el.name === 'oven-plan') { state.settings.ovenPlan = el.value; state.settings.ovenChosen = true; saveSettings(); updatePlan(); return; }
      if (el.id === 'serve-time') { onServeTime(el); return; }
      if (el.matches('[data-setting]')) { onSetting(el); return; }
      if (el.id === 'wake-switch') { setWakePref(el.checked); return; }
      if (el.id === 'notify-switch') { onNotifySwitch(el); return; }
      if (el.id === 'cm-jump') { cm.idx = +el.value; renderCookStep(); renderCmDock(); return; }
    });
    document.addEventListener('input', function (e) {
      var el = e.target;
      if (el.id === 'notes-text') {
        $('#notes-state').textContent = 'Saving…';
        clearTimeout(notesTimer);
        notesTimer = setTimeout(saveNotes, 400);
      } else if (el.id === 'serve-time') {
        onServeTime(el);
      }
    });
    document.addEventListener('focusout', function (e) { if (e.target.id === 'notes-text') saveNotes(); });

    document.addEventListener('submit', function (e) {
      if (e.target.id !== 'custom-timer') return;
      e.preventDefault();
      var min = parseFloat($('#custom-min').value);
      if (!(min > 0) || min > 600) { toast('Enter minutes between 1 and 600.'); $('#custom-min').focus(); return; }
      startTimer(min, $('#custom-label').value.trim() || 'Custom timer', null, null);
      $('#custom-min').value = '';
      $('#custom-label').value = '';
      document.activeElement && document.activeElement.blur && document.activeElement.blur();
    });

    document.addEventListener('click', function (e) {
      if (wake.status === 'blocked' && wakeNeeded()) updateWake(); // retry inside a user tap
      var tab = e.target.closest('.tab[data-tab]');
      if (tab) { showTab(tab.getAttribute('data-tab')); return; }
      var el = e.target.closest('[data-action]');
      if (!el) return;
      var a = el.getAttribute('data-action');
      var id = el.getAttribute('data-id');
      var t = id ? findTimer(id) : null;
      switch (a) {
        case 'jump':
          e.preventDefault();
          scrollToId(el.getAttribute('data-target'));
          break;
        case 'goto-tab':
          e.preventDefault();
          showTab(el.getAttribute('data-tab'));
          if (el.getAttribute('data-target')) setTimeout(function () { scrollToId(el.getAttribute('data-target')); }, 60);
          break;
        case 'goto-timers':
          if (cm.open) closeCook();
          showTab('cook');
          setTimeout(function () { scrollToId('timers-card'); }, 60);
          break;
        case 'print':
          window.print();
          break;
        case 'reset-shop':
          if (confirm('Clear all shopping-list checkmarks?')) {
            state.shop = {}; store.set('shop', state.shop);
            renderShop(); toast('Shopping list reset.');
          }
          break;
        case 'reset-recipes':
          if (confirm('Clear the checkmarks on every recipe?')) {
            state.recipe = {}; store.set('recipe', state.recipe);
            $$('input[data-kind="recipe"]').forEach(function (i) { i.checked = false; markRow(i); });
            DATA.recipes.forEach(function (r) { updateRecipeCounts(r.id); });
            toast('All recipe checkmarks cleared.');
          }
          break;
        case 'reset-recipe': {
          var rid = el.getAttribute('data-recipe'), r = RECIPES[rid];
          if (r && confirm('Clear the checkmarks on ' + r.shortTitle + '?')) {
            r._ing.concat(r._steps).forEach(function (x) { delete state.recipe[x._id]; });
            store.set('recipe', state.recipe);
            $$('input[data-kind="recipe"][data-recipe="' + rid + '"]').forEach(function (i) { i.checked = false; markRow(i); });
            updateRecipeCounts(rid);
            toast(r.shortTitle + ' checkmarks cleared.');
          }
          break;
        }
        case 'reset-plan':
          if (confirm('Reset the serving time, oven choice and timings to the defaults?')) {
            state.settings = Object.assign({ servingSet: false, ovenChosen: false }, PLAN_DEFAULTS);
            saveSettings(); renderPlan(); toast('Plan settings reset.');
          }
          break;
        case 'reset-open':
          if (confirm('Clear the checkmarks on the open items?')) {
            state.open = {}; store.set('open', state.open);
            $$('input[data-kind="open"]').forEach(function (i) { i.checked = false; markRow(i); });
            updateOpenCount();
          }
          break;
        case 'clear-notes':
          if (confirm('Clear your notes?')) { $('#notes-text').value = ''; saveNotes(); $('#notes-state').textContent = 'Notes cleared.'; }
          break;
        case 'reset-all':
          if (confirm('Reset everything saved on this phone: checkmarks, plan settings, timers and notes?')) {
            store.clearAll();
            location.reload();
          }
          break;
        case 'cook-open':
          openCook(el.getAttribute('data-recipe'));
          break;
        case 'cook-close': closeCook(); break;
        case 'cook-prev': cookGo(-1); break;
        case 'cook-next': cookGo(1); break;
        case 'wake-toggle': setWakePref(!state.prefs.wake); break;
        case 'timer-start':
          startTimer(el.getAttribute('data-min'), el.getAttribute('data-label'), el.getAttribute('data-recipe'), el.getAttribute('data-step'));
          break;
        case 'timer-pause': if (t) { pauseTimer(t); saveTimers(); afterTimersChanged(); } break;
        case 'timer-resume': if (t) { resumeTimer(t); saveTimers(); afterTimersChanged(); } break;
        case 'timer-add': if (t) { addTime(t, +el.getAttribute('data-min')); saveTimers(); afterTimersChanged(); } break;
        case 'timer-cancel': if (t) { removeTimer(t); saveTimers(); afterTimersChanged(); } break;
        case 'timer-dismiss': if (t) { removeTimer(t); saveTimers(); afterTimersChanged(); } break;
      }
    });

    // Remember open/closed sections
    document.addEventListener('toggle', function (e) {
      var d = e.target;
      if (d.tagName === 'DETAILS' && d.getAttribute('data-key')) { state.ui.details[d.getAttribute('data-key')] = d.open; saveUi(); }
    }, true);

    // Tab bar keyboard support
    $('.tabbar__inner').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var i = TABS.indexOf(state.ui.tab) + (e.key === 'ArrowRight' ? 1 : -1);
      i = (i + TABS.length) % TABS.length;
      showTab(TABS[i]);
      $('#tab-' + TABS[i]).focus();
    });

    // Cook Mode keyboard, focus trap and swipe
    document.addEventListener('keydown', function (e) {
      if (!cm.open) return;
      if (e.key === 'Escape') { closeCook(); return; }
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'select' || tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowRight') { cookGo(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { cookGo(-1); e.preventDefault(); }
      else if (e.key === 'Tab') {
        var f = $$('#cookmode button:not([disabled]), #cookmode select, #cookmode input, #cookmode summary, #cookmode [tabindex="-1"]').filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
    var sx = 0, sy = 0, st0 = 0;
    var body = $('#cm-body');
    body.addEventListener('touchstart', function (e) { var p = e.changedTouches[0]; sx = p.clientX; sy = p.clientY; st0 = Date.now(); }, { passive: true });
    body.addEventListener('touchend', function (e) {
      var p = e.changedTouches[0], dx = p.clientX - sx, dy = p.clientY - sy;
      if (Date.now() - st0 < 600 && Math.abs(dx) > 70 && Math.abs(dy) < 45) cookGo(dx < 0 ? 1 : -1);
    }, { passive: true });

    window.addEventListener('popstate', function () {
      if (cm.open && !(history.state && history.state.cook)) closeCook(true);
    });
    window.addEventListener('hashchange', function () {
      var id = location.hash.slice(1);
      if (TABS.indexOf(id) > -1 && id !== state.ui.tab) showTab(id, { keepHash: true });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { renderHeader(); tick(); renderAlarm(); updatePlanNow(); renderCookNext(); }
      updateWake();
    });
    window.addEventListener('pagehide', saveNotes);
    window.addEventListener('online', updateNet);
    window.addEventListener('offline', updateNet);
    document.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('resize', function () { if (!$('#dock').hidden) document.documentElement.style.setProperty('--dock-h', $('#dock').offsetHeight + 'px'); });
  }

  function onServeTime(el) {
    if (!el.value || parseHHMM(el.value) === null) return;
    if (el.value === state.settings.servingTime && state.settings.servingSet) return;
    state.settings.servingTime = el.value;
    state.settings.servingSet = true;
    saveSettings();
    updatePlan();
  }
  function onSetting(el) {
    var k = el.getAttribute('data-setting');
    var v = parseInt(el.value, 10);
    if (isNaN(v)) return;
    v = clamp(v, 0, 600);
    state.settings[k] = v;
    saveSettings();
    updatePlan();
  }
  function onNotifySwitch(el) {
    if (!el.checked) { state.prefs.notify = false; savePrefs(); return; }
    Notification.requestPermission().then(function (perm) {
      state.prefs.notify = perm === 'granted';
      savePrefs();
      el.checked = state.prefs.notify;
      if (!state.prefs.notify) toast('Notifications are blocked for this site in your browser settings.');
    }).catch(function () { el.checked = false; });
  }

  function updateNet() { $('#net-pill').hidden = navigator.onLine !== false; }

  /* =====================================================================
     SERVICE WORKER (offline + install)
     ===================================================================== */
  function initSW() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') { swReadyResolve(); return; }
    var hadController = !!navigator.serviceWorker.controller;
    if (hadController) swReadyResolve();
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      swReadyResolve();
      if (hadController) toast('A newer version of the guide is ready.', 'Reload', function () { location.reload(); });
    });
    navigator.serviceWorker.register('sw.js').catch(function () { swReadyResolve(); });
  }

  /* =====================================================================
     START
     ===================================================================== */
  if (history.state && history.state.cook) { try { history.replaceState(null, ''); } catch (e) { /* ignore */ } }
  renderHeader();
  renderShop();
  renderPlan();
  renderRecipes();
  renderCook();
  renderNotes();
  renderFooter();
  bind();
  var fromHash = location.hash.slice(1);
  showTab(TABS.indexOf(fromHash) > -1 ? fromHash : (TABS.indexOf(state.ui.tab) > -1 ? state.ui.tab : 'shop'), { keepScroll: true });
  afterTimersChanged();
  if (timers.some(function (t) { return t.state === 'done'; })) ringFor([]);
  setInterval(tick, 1000);
  setInterval(function () { updatePlanNow(); renderCookNext(); renderHeader(); }, 30000);
  updateNet();
  initSW();
})();
