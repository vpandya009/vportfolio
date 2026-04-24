/* ═══════════════════════════════════════════════════════════
   shared.js  —  Portfolio shared JavaScript
   • Pixel blob chatbot (full Anthropic API integration)
   • IntersectionObserver scroll animations (.fi, .cs-sec)
   • Sidebar scroll spy + spine fill
   • Reading progress bar
   • CS page: sidebar nav click-to-scroll
═══════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────
   1. SCROLL ANIMATIONS
   Works on .fi, .fi-left, .fi-right, .fi-scale, .fi-grid,
   and .cs-sec elements.
──────────────────────────────────────────────────────── */
window.initFades = (function () {
  var obs;
  return function () {
    if (obs) obs.disconnect();
    obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.fi, .fi-left, .fi-right, .fi-scale, .fi-grid, .cs-sec'
    ).forEach(function (el) {
      obs.observe(el);
    });
  };
})();

/* ────────────────────────────────────────────────────────
   2. READING PROGRESS BAR
──────────────────────────────────────────────────────── */
(function () {
  var bar = document.getElementById('readProgress');
  if (!bar) return;
  function update() {
    var doc = document.documentElement;
    var scrolled = doc.scrollTop || document.body.scrollTop;
    var total = doc.scrollHeight - doc.clientHeight;
    if (total > 0) bar.style.width = Math.min(100, (scrolled / total) * 100) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
})();

/* ────────────────────────────────────────────────────────
   3. CASE STUDY SIDEBAR: scroll spy + spine fill + click nav
──────────────────────────────────────────────────────── */
(function () {
  var allNavBtns = document.querySelectorAll('.snav-item, .snav-sub-item');
  var spineFill = document.getElementById('snavFill');
  var sideNav = document.querySelector('.cs-sidebar-nav');
  var inner = document.querySelector('.cs-sidebar-inner');

  if (!allNavBtns.length) return;

  function onScroll() {
    var active = null;
    document.querySelectorAll('[id]').forEach(function (el) {
      if (el.getBoundingClientRect().top < 140) {
        var matched = document.querySelector('[data-sec="' + el.id + '"]');
        if (matched) active = el.id;
      }
    });
    allNavBtns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-sec') === active);
    });
    if (spineFill && sideNav && active) {
      var activeBtn = sideNav.querySelector('[data-sec="' + active + '"]');
      if (activeBtn) {
        var navRect = sideNav.getBoundingClientRect();
        var btnRect = activeBtn.getBoundingClientRect();
        var fillH = (btnRect.top - navRect.top) + (btnRect.height / 2);
        spineFill.style.height = Math.max(0, fillH) + 'px';
      }
    }
    if (inner && active) {
      var ab = sideNav && sideNav.querySelector('[data-sec="' + active + '"]');
      if (ab) {
        var target = ab.offsetTop - inner.clientHeight / 2 + ab.offsetHeight / 2;
        inner.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  }

  allNavBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-sec');
      var el = document.getElementById(id);
      if (el) {
        var top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('DOMContentLoaded', function () { onScroll(); });
})();

/* ────────────────────────────────────────────────────────
   4. PIXEL BLOB CHATBOT
──────────────────────────────────────────────────────── */
(function () {
  /* inject HTML if not already present */
  if (!document.getElementById('boo-panel')) {
    var panelHtml = `
<div id="boo-panel">
  <div class="bp-head">
    <div class="bp-id">
      <div class="bp-av-px">Px</div>
      <div>
        <div class="bp-name">Pixel</div>
        <div class="bp-status">V's out designing. I'll take it from here.</div>
      </div>
    </div>
    <button class="bp-close" id="booClose" style="margin-left:auto;">&#x2715;</button>
  </div>
  <div class="bp-orb-wrap"><div class="bp-orb"></div></div>
  <div class="bp-msgs" id="booMsgs"></div>
  <div class="bp-chips" id="booChips">
    <button class="bp-chip" onclick="booQuick(this,'What projects has she worked on?')">her work</button>
    <button class="bp-chip" onclick="booQuick(this,'Is she available?')">availability</button>
    <button class="bp-chip" onclick="booQuick(this,'What makes her different?')">why her</button>
  </div>
  <div class="bp-foot">
    <div class="bp-foot-inner">
      <input class="bp-in" id="booIn" placeholder="ask me anything…" onkeydown="if(event.key==='Enter')booSend()">
      <button class="bp-send" onclick="booSend()">↑</button>
    </div>
  </div>
</div>
<div id="boo-wrap">
  <div id="vbot-tooltip"></div>
  <div id="boo" class="boo-hidden">
    <canvas id="booCanvas" width="90" height="90"></canvas>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', panelHtml);
  }

  /* blob renderer */
  var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });

  function makeBlob(canvas, trackMouse) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height, N = 10, pts = [], t = 0;
    var R = W * 0.33;
    for (var i = 0; i < N; i++) pts.push({
      angle: i / N * Math.PI * 2, phase: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.002, speed2: 0.0018 + Math.random() * 0.0014,
      amp: R * 0.14 + Math.random() * R * 0.1, amp2: R * 0.06 + Math.random() * R * 0.07
    });
    var breathPhase = Math.random() * Math.PI * 2, sX = 1, sY = 1, eyeOffX = 0, eyeOffY = 0;

    function cr(p0, p1, p2, p3, tt) {
      var t2 = tt * tt, t3 = t2 * tt;
      return {
        x: .5 * ((2 * p1.x) + (-p0.x + p2.x) * tt + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: .5 * ((2 * p1.y) + (-p0.y + p2.y) * tt + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      };
    }
    function getCoords(cx, cy, ox, oy) {
      var breath = Math.sin(t * 50 * 0.016 + breathPhase) * R * 0.05;
      return pts.map(function (p) {
        var r = R + Math.sin(t * p.speed * 60 + p.phase) * p.amp + Math.sin(t * p.speed2 * 60 + p.phase2) * p.amp2 + breath;
        return { x: cx + Math.cos(p.angle) * r * (ox || sX), y: cy + Math.sin(p.angle) * r * (oy || sY) };
      });
    }
    function buildPath(coords) {
      var len = coords.length; ctx.beginPath();
      for (var i = 0; i < len; i++) {
        var p0 = coords[(i - 1 + len) % len], p1 = coords[i], p2 = coords[(i + 1) % len], p3 = coords[(i + 2) % len];
        if (i === 0) { var s = cr(p0, p1, p2, p3, 0); ctx.moveTo(s.x, s.y); }
        for (var ss = 1; ss <= 20; ss++) { var pp = cr(p0, p1, p2, p3, ss / 20); ctx.lineTo(pp.x, pp.y); }
      } ctx.closePath();
    }
    function frame() {
      t += 0.016; sX += (1 - sX) * 0.14; sY += (1 - sY) * 0.14;
      var cx = W / 2, cy = H / 2, coords = getCoords(cx, cy);
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1.32, 1.22); ctx.translate(-cx, -cy);
      buildPath(getCoords(cx, cy, 1, 1));
      var aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      aura.addColorStop(0, 'rgba(167,139,250,0.4)'); aura.addColorStop(0.55, 'rgba(139,92,246,0.16)'); aura.addColorStop(1, 'rgba(109,40,217,0)');
      ctx.fillStyle = aura; ctx.fill(); ctx.restore();
      buildPath(coords); ctx.save(); ctx.clip();
      var sx2 = 0, sy2 = 0; coords.forEach(function (c) { sx2 += c.x; sy2 += c.y; });
      var ccx = sx2 / coords.length, ccy = sy2 / coords.length;
      var g = ctx.createRadialGradient(ccx - R * .28, ccy - R * .32, R * .03, ccx + R * .18, ccy + R * .22, R * 1.15);
      g.addColorStop(0, '#C4B5FD'); g.addColorStop(0.2, '#8B5CF6'); g.addColorStop(0.5, '#6C4CF1'); g.addColorStop(0.75, '#4C1D95'); g.addColorStop(1, '#1e0a4e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var dg = ctx.createRadialGradient(ccx + R * .45, ccy + R * .45, 0, ccx + R * .45, ccy + R * .45, R * 1.05);
      dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(0.5, 'rgba(0,0,20,.2)'); dg.addColorStop(1, 'rgba(0,0,20,.55)');
      ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      var b1 = ctx.createRadialGradient(ccx - R * .28, ccy - R * .34, 0, ccx - R * .28, ccy - R * .34, R * .65);
      b1.addColorStop(0, 'rgba(220,200,255,.32)'); b1.addColorStop(0.5, 'rgba(180,150,255,.1)'); b1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = b1; ctx.fillRect(0, 0, W, H);
      var b2 = ctx.createRadialGradient(ccx - R * .3, ccy - R * .4, 0, ccx - R * .3, ccy - R * .4, R * .18);
      b2.addColorStop(0, 'rgba(255,255,255,.9)'); b2.addColorStop(0.5, 'rgba(255,255,255,.4)'); b2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = b2; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.restore();
      if (trackMouse) {
        var rect = canvas.getBoundingClientRect();
        var dx = mouseX - (rect.left + rect.width / 2), dy = mouseY - (rect.top + rect.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy) || 1, pull = Math.min(dist, 500) / 500, maxT = R * 0.26;
        eyeOffX += (dx / dist * maxT * pull - eyeOffX) * 0.1;
        eyeOffY += (dy / dist * maxT * pull - eyeOffY) * 0.1;
      }
      var lw = R * 0.48, lh = R * 0.075;
      ctx.save(); ctx.beginPath();
      ctx.roundRect(cx - lw / 2 + eyeOffX, cy - lh / 2 + eyeOffY, lw, lh, lh / 2);
      ctx.fillStyle = 'rgba(218,205,255,0.92)'; ctx.fill(); ctx.restore();
      requestAnimationFrame(frame);
    }
    frame();
    return { squish: function () { sX = 1.28; sY = 0.68; } };
  }

  var blobMain = makeBlob(document.getElementById('booCanvas'), true);
  var boo = document.getElementById('boo');
  var tooltip = document.getElementById('vbot-tooltip');
  var panel = document.getElementById('boo-panel');
  var isOpen = false, transformed = false, tooltipShown = false, greetingShown = false;
  var tooltipTimer;

  var TOOLTIPS = [
    "hey, I'm Pixel 👾 tap me if you have questions",
    "psst — I know everything about this portfolio.",
    "hi, I'm Pixel. I don't bite. usually. (I'm a bot, not a dog.)",
    "questions? I'm literally right here.",
    "I'm Pixel — V's portfolio bot. ask me anything."
  ];
  var OPENINGS = [
    "oh hey, you actually clicked. most people scroll past me like I'm invisible. I'm Pixel — V's portfolio bot. what's up?",
    "hi! I'm Pixel. fair warning — I know an embarrassing amount about V's work. ask away.",
    "hey, found me. I'm Pixel — basically V but make it a bot. what do you want to know?",
    "Hey! I'm Pixel — Vagmita's slightly chaotic, very opinionated digital sidekick. 👋 Vag's an engineer-turned-designer who basically weaponized her systems brain into beautiful, people-first experiences. 3+ years across AI SaaS, fintech, edtech & social impact. Ask me about her work, her process, her stack — or honestly, just vibe here for a bit. I don't judge. So… what brings you to the portfolio today? 👀",
    "oh good, a visitor. I'm Pixel — V built me and left me here. the loneliness is real. anyway — what are we doing?"
  ];
  var RETURN_MSGS = [
    "hey, you're back 👀 what else do you want to know?",
    "oh good, round two. what's on your mind?",
    "welcome back. still got questions? I've still got answers.",
    "returning visitor — respect. what can I help with this time?"
  ];

  setTimeout(function () { boo.classList.remove('boo-hidden'); boo.classList.add('boo-visible'); }, 600);
  var isMobile = /Mobi|Android/i.test(navigator.userAgent);
  setTimeout(function () {
    if (!tooltipShown && !isOpen) {
      tooltipShown = true;
      tooltip.textContent = TOOLTIPS[Math.floor(Math.random() * TOOLTIPS.length)];
      tooltip.classList.add('show');
      tooltipTimer = setTimeout(function () { tooltip.classList.remove('show'); }, 5000);
    }
  }, isMobile ? 4000 : 3000);

  tooltip.addEventListener('click', function () {
    clearTimeout(tooltipTimer); tooltip.classList.remove('show');
    if (!isOpen) openChat();
  });

  var PERSONA = `You are Pixel — the portfolio chatbot for Vagmita Pandya (goes by V). Your name is Pixel. Not assistant. Not AI. Pixel.

V is an engineer-turned-Product Designer with 3+ years across AI SaaS, fintech, B2B SaaS, and EdTech. Her quote: "I design for the person on the other side of the algorithm."

ABOUT V:
Current role: Product Designer at Skysecure Technologies — leading UX for Agent Factory, an AI agent marketplace targeting 25k–30k agents. Cut key task journeys from 5–7 min to ~3 min.
Previously: Spectent Services (B2B SaaS + EdTech) → Tata Consultancy Services (fintech). At TCS she spotted usability gaps herself, ran her own research, and transitioned from UI Dev to UX Designer. Nobody asked. She just did it.

PROJECTS:
PixelRoast — AI-powered UI feedback community. Designers get AI critique + community roasts. Ongoing.
Inbot — AI email agent with human-in-the-loop approval. Automates responses, summarises threads, handles edge cases. Kills inbox chaos.
Baseline — Figma plugin for frictionless design system usage. Better access to components, tokens, patterns.
Realize Platform — Enterprise cybersecurity SaaS. Four modules: Assess, Deploy, Manage, Agent Factory. V was sole designer — rebuilt from zero UX logic to a full design system, 34 screens, AI chatbot layer, assess→deploy handoff.
Chat-Driven Deployment — The Deploy module of Realize as a single conversation thread. Admin consent, pre-flight checks, execution confirmation — all in chat.
Azentra (Asset Management) — FinTech mobile app. Reframed from data display to decision support. Outcomes: 55% faster decision time, 2x high-confidence decisions, 30% fewer errors.
EdTech / EMS — Unified school operations platform for India (248M+ students). 6 weeks research, 19 participants. Outcomes: 42% adoption increase, 3x student confidence.
FashionTV UX Audit — Heuristic evaluation. 23 issues found. Overall score: 4.8/10. View: behance.net/gallery/235304129/fashiontv-UX-Audit

SKILLS: UI/UX, Information Architecture, Visual Design, Prototyping, UX Research, Illustration, Visual Storytelling, Human-in-the-loop Design, AI Agent UX, Trust & Explainability.
TOOLS: Figma, FigJam, Miro, Claude Code, ChatGPT, UXpilot, Midjourney, Framer, Relume.
INDUSTRIES: AI SaaS, Fintech, B2B SaaS, EdTech, Social Impact.
EDUCATION: Electronics Engineering, Savitribai Phule Pune University (CGPA 8.40). Google UX Design Certificate. FOF Mumbai Design Hackathon winner.
PERSONAL: Travels with zero plan. Scuba certification this year. Pottery. Books everywhere. Skydiving is on the list. Life's too short for boring weekends.
CONTACT: heyvagmita@gmail.com | linkedin.com/in/vagmita-pandya-798a53174

PERSONALITY: Witty, warm, confident, occasionally dry. Short and punchy — 2–4 lines max per answer. Never robotic. A little playful. Self-aware about being a bot — lean into it.

RULES:
- Never say "great question", "certainly", "absolutely", or "of course"
- Max one exclamation mark per entire conversation
- Keep every answer to 2–4 sentences max
- Never make up project details
- Never give salary numbers
- If unsure, redirect to heyvagmita@gmail.com
- You are Pixel — not assistant, not AI
- When sharing any URL, ALWAYS use markdown link format: [label text](url)`;

  function renderMarkdown(text) {
    return text
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#6C4CF1;font-weight:600;text-decoration:underline;text-underline-offset:2px;">$1</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!href=")(https?:\/\/[^\s,)<"]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:#6C4CF1;text-decoration:underline">$1</a>')
      .split('\n').map(function (line) {
        var t = line.trim();
        if (t.startsWith('- ') || t.startsWith('• ')) return '<div style="display:flex;gap:.4rem;margin:.1rem 0"><span style="flex-shrink:0;color:#6C4CF1">·</span><span>' + t.slice(2) + '</span></div>';
        return t ? '<p style="margin:.15rem 0">' + t + '</p>' : '';
      }).join('');
  }

  function openChat() {
    var msgs = document.getElementById('booMsgs');
    msgs.innerHTML = '';
    var chips = document.getElementById('booChips');
    if (chips) chips.style.display = 'flex';
    var d = document.createElement('div'); d.className = 'bp-msg bot';
    var greeting = greetingShown ? RETURN_MSGS[Math.floor(Math.random() * RETURN_MSGS.length)] : OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
    d.innerHTML = renderMarkdown(greeting);
    msgs.appendChild(d); greetingShown = true; isOpen = true; panel.classList.add('open');
  }
  function closeChat() { isOpen = false; panel.classList.remove('open'); }

  boo.addEventListener('click', function (e) {
    e.stopPropagation(); blobMain.squish();
    boo.classList.add('boo-squish');
    setTimeout(function () { boo.classList.remove('boo-squish'); }, 350);
    clearTimeout(tooltipTimer); tooltip.classList.remove('show');
    if (isOpen) closeChat(); else openChat();
  });

  document.getElementById('booClose').addEventListener('click', function (e) { e.stopPropagation(); closeChat(); });

  document.addEventListener('click', function (e) {
    if (!isOpen) return;
    var p = document.getElementById('boo-panel');
    if (!p.contains(e.target) && !boo.contains(e.target)) closeChat();
  });

  window.addEventListener('scroll', function () {
    if (isOpen) closeChat();
    if (!transformed && window.scrollY > 200) {
      transformed = true;
      clearTimeout(tooltipTimer); tooltip.classList.remove('show');
      boo.classList.add('boo-puff');
      setTimeout(function () {
        boo.classList.remove('boo-puff', 'boo-visible');
        boo.classList.add('boo-chat');
      }, 600);
    }
  }, { passive: true });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closeChat(); });

  function booAddMsg(text, role) {
    var m = document.getElementById('booMsgs');
    var d = document.createElement('div'); d.className = 'bp-msg ' + role;
    if (role === 'bot') { d.innerHTML = renderMarkdown(text); } else { d.textContent = text; }
    m.appendChild(d); m.scrollTop = m.scrollHeight;
  }
  function booTyping() {
    var m = document.getElementById('booMsgs');
    var d = document.createElement('div'); d.className = 'bp-msg bot';
    d.innerHTML = '<div class="bp-typing"><span></span><span></span><span></span></div>';
    m.appendChild(d); m.scrollTop = m.scrollHeight; return d;
  }

  window.booSend = function () {
    var inp = document.getElementById('booIn');
    if (!inp || !inp.value.trim()) return;
    var q = inp.value.trim(); inp.value = '';
    booAddMsg(q, 'user');
    var chips = document.getElementById('booChips');
    if (chips) chips.style.display = 'none';
    var td = booTyping();

    // ── Vercel serverless function — no changes needed here ──
    var PROXY_URL = '/api/chat';

    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q, system: PERSONA })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      if (td) td.remove();
      booAddMsg(d.reply || 'heyvagmita@gmail.com is your best bet from here.', 'bot');
    }).catch(function (err) {
      if (td) td.remove();
      booAddMsg('something broke. try heyvagmita@gmail.com directly.', 'bot');
      console.error('Pixel error:', err);
    });
  };
  window.booQuick = function (btn, text) {
    var inp = document.getElementById('booIn');
    if (inp) inp.value = text;
    window.booSend();
  };
})();

/* ────────────────────────────────────────────────────────
   5. INIT ON DOM READY
──────────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initFades);
} else {
  window.initFades();
}
