/* ------------------------------------------------------------------ *
 * interactive.js  —  refined futuristic UI interactions:
 *                    cyberpunk glitch effects on major headings,
 *                    seamless theme transition, telemetry edge rails,
 *                    live IST clock, intersection reveal observer,
 *                    timeline pulses, active section indicator.
 * ------------------------------------------------------------------ */
(() => {
  'use strict';
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- theme management ---------- */
  const THEME_KEY = 'sp.theme';
  const root = document.documentElement;
  let darkHintTimer = null;

  function updateThemeHint(mode) {
    const hint = document.getElementById('themeHint');
    if (!hint) return;

    if (darkHintTimer) {
      clearTimeout(darkHintTimer);
      darkHintTimer = null;
    }

    if (mode === 'light') {
      // In light (cream) mode: message says "Try dark mode" and stays visible
      hint.textContent = 'Try dark mode';
      hint.classList.remove('is-hidden');
    } else {
      // In dark mode: message says "Try light mode", but vanishes after a few seconds
      hint.textContent = 'Try light mode';
      hint.classList.remove('is-hidden');
      darkHintTimer = setTimeout(() => {
        hint.classList.add('is-hidden');
      }, 4200);
    }
  }

  function applyTheme(mode) {
    root.dataset.theme = mode;
    localStorage.setItem(THEME_KEY, mode);
    const btn = document.getElementById('themeBtn');
    if (btn) {
      const label = mode === 'light' ? 'Switch to dark theme' : 'Switch to cream theme';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
    updateThemeHint(mode);
  }

  const initialTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(initialTheme);

  /* ---------- cyberpunk glitch theme transition ---------- */
  const GLITCH_PRES = 320;   // phase 1: glitchy tile sweep
  const GLITCH_HOLD = 240;   // theme flip happens here under the tiles
  const GLITCH_OUT  = 400;   // phase 2: CRT scan-out

  function switchTheme(targetMode) {
    const fromMode = root.dataset.theme === 'light' ? 'light' : 'dark';
    const toMode = targetMode;
    if (fromMode === toMode) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      applyTheme(toMode);
      return;
    }

    document.body.classList.add('is-theming');

    /* Build the tile grid */
    const COLS = 34, ROWS = 16;
    const overlay = document.createElement('div');
    overlay.className = 'themedo';

    const fromBg = fromMode === 'light' ? '#fcfbf9' : '#0c0c0e';
    const toBg   = toMode === 'light'   ? '#fcfbf9' : '#0c0c0e';
    overlay.style.setProperty('--__tile', fromBg);
    overlay.style.setProperty('--__tile-end', toBg);

    /* Pure monochrome grayscale palette (zero colored tint) */
    const glitchPalette = ['#ffffff', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a'];
    const tiles = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      const tile = document.createElement('div');
      tile.className = 'themedo__tile';
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const diag = (col + row) / (COLS + ROWS);
      const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const t1 = (diag + Math.abs(jitter) * 0.25) % 1;
      const delayP1 = Math.round(t1 * GLITCH_PRES * 0.95);
      tile.dataset.delay = String(delayP1);

      const ph = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1;
      const hex = glitchPalette[Math.floor(ph * glitchPalette.length)];
      tile.style.setProperty('--__glitch', hex);
      overlay.appendChild(tile);
      tiles.push(tile);
    }
    document.body.appendChild(overlay);

    /* PHASE 1 — staggered glitch flash, sweep left → right */
    tiles.forEach((tile) => {
      const d = parseInt(tile.dataset.delay, 10);
      setTimeout(() => tile.classList.add('is-glitch'), d);
      setTimeout(() => tile.classList.remove('is-glitch'), d + 75);
    });

    /* Theme flip mid-glitch */
    setTimeout(() => {
      applyTheme(toMode);
    }, GLITCH_PRES * 0.55);

    /* Data-slash line */
    const slash = document.createElement('div');
    slash.className = 'theme-slash';
    document.body.appendChild(slash);
    requestAnimationFrame(() => slash.classList.add('is-on'));

    /* Terminal HUD log */
    const themeName = toMode === 'light' ? 'cream' : 'dark';
    const log = document.createElement('pre');
    log.className = 'theme-log';
    log.textContent = `> switching to ${themeName} theme\n> re-calibrating optics...`;
    document.body.appendChild(log);
    requestAnimationFrame(() => log.classList.add('is-on'));
    setTimeout(() => {
      log.textContent = `> switching to ${themeName} theme\n> status: operational [OK]`;
    }, GLITCH_HOLD * 0.8);

    /* PHASE 2 — CRT scan-out: tiles lift + disappear bottom-to-top */
    setTimeout(() => {
      for (let row = ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < COLS; col++) {
          const idx = row * COLS + col;
          const tile = tiles[idx];
          if (!tile) continue;
          const delay = (ROWS - 1 - row) * 20 + (col * 3) % 25;
          setTimeout(() => tile.classList.add('is-shift'), delay);
          setTimeout(() => tile.classList.add('is-final'), delay + 110);
        }
      }
    }, GLITCH_PRES);

    /* Cleanup */
    setTimeout(() => {
      slash.remove();
      log.remove();
      overlay.remove();
      document.body.classList.remove('is-theming');
    }, GLITCH_PRES + GLITCH_OUT + 150);
  }

  document.getElementById('themeBtn')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    switchTheme(next);
  });

  document.getElementById('themeHint')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    switchTheme(next);
  });

  /* ---------- professional cyberpunk pixel glitch & text decoder ---------- *
     Applies to major titles: sahil pawar, builds, journey, bio.
     Interactive matrix character scramble on hover + real-time polygon slice
     tearing and periodic electric HUD twitch.
  */
  const CYBER_GLYPHS = '0123456789ABCDEF_><[]{}/*#%!~░▒▓█';

  function triggerGlitchPulse(heading) {
    if (!heading || heading.dataset.scrambling === 'true') return;
    heading.classList.remove('is-glitch');
    // Double-twitch electric impulse
    heading.classList.add('is-glitch');
    setTimeout(() => {
      heading.classList.remove('is-glitch');
      setTimeout(() => {
        heading.classList.add('is-glitch');
        setTimeout(() => heading.classList.remove('is-glitch'), 160);
      }, 45);
    }, 95);
  }

  function scrambleHeading(heading) {
    if (!heading || heading.dataset.scrambling === 'true') return;
    const baseText = heading.dataset.baseText || heading.dataset.text || heading.textContent.trim();
    if (!baseText) return;
    heading.dataset.baseText = baseText;
    heading.dataset.scrambling = 'true';
    heading.classList.add('is-glitch');

    // Find the text node to scramble so child overlay spans (.pixel-fx) are preserved
    let textNode = null;
    for (const child of heading.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
        textNode = child;
        break;
      }
    }
    if (!textNode) {
      heading.dataset.scrambling = 'false';
      heading.classList.remove('is-glitch');
      return;
    }

    const length = baseText.length;
    let iteration = 0;

    const interval = setInterval(() => {
      const currentScramble = baseText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) {
            return baseText[index];
          }
          return CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];
        })
        .join('');

      textNode.textContent = currentScramble;
      heading.dataset.text = currentScramble;

      iteration += 1 / 2.2; // Decodes cleanly across ~320ms

      if (iteration >= length) {
        clearInterval(interval);
        textNode.textContent = baseText;
        heading.dataset.text = baseText;
        heading.dataset.scrambling = 'false';
        setTimeout(() => heading.classList.remove('is-glitch'), 90);
      }
    }, 24);
  }

  const cyberHeadings = $$(
    '.brand__title, #builds-title, #journey-title, .sect__title, .featured-card__title, .page-section__head h2'
  );

  cyberHeadings.forEach((heading) => {
    // Extract base text cleanly
    const rawText =
      heading.dataset.text ||
      Array.from(heading.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .filter(Boolean)
        .join(' ') ||
      heading.textContent.trim();

    heading.dataset.text = rawText;
    heading.dataset.baseText = rawText;
    heading.classList.add('cyber-glitch');

    // Ensure pixel fx overlay element is present
    if (!heading.querySelector('.pixel-fx') && !heading.querySelector('.brand__glitch-overlay')) {
      const fx = document.createElement('span');
      fx.className = 'pixel-fx';
      fx.setAttribute('aria-hidden', 'true');
      heading.appendChild(fx);
    }

    heading.addEventListener('mouseenter', () => {
      scrambleHeading(heading);
    });

    heading.addEventListener('click', () => {
      triggerGlitchPulse(heading);
      scrambleHeading(heading);
    });
  });

  /* ---------- AUTOMATIC PIXEL GLITCH ENGINE ---------- *
     Executes automatically on page load, recurring intervals,
     and viewport scroll reveal without requiring user to hover.
  */
  const brandTitle = document.querySelector('.brand__title');
  const sectionHeadings = $$(
    '#builds-title, #journey-title, .sect__title, .featured-card__title, .page-section__head h2'
  );

  // 1. Initial automatic intro glitch on load
  setTimeout(() => {
    if (brandTitle) scrambleHeading(brandTitle);
  }, 450);

  // 2. Automatic recurring loop on main title "sahil pawar" (every ~4.6s)
  let autoMainTimer = null;
  function startAutoMainTimer() {
    if (autoMainTimer) return;
    autoMainTimer = setInterval(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      if (brandTitle && brandTitle.dataset.scrambling !== 'true') {
        scrambleHeading(brandTitle);
      }
    }, 4600);
  }

  // 3. Automatic periodic loop on visible section headings (every ~3.8s)
  let autoSectionTimer = null;
  let sectionCycleIdx = 0;
  function startAutoSectionTimer() {
    if (autoSectionTimer) return;
    autoSectionTimer = setInterval(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || sectionHeadings.length === 0) return;

      // Prioritize headings currently visible in the viewport
      const visible = sectionHeadings.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= -50 && r.bottom <= window.innerHeight + 50;
      });

      const targets = visible.length > 0 ? visible : sectionHeadings;
      const target = targets[sectionCycleIdx % targets.length];
      sectionCycleIdx++;

      if (target && target.dataset.scrambling !== 'true') {
        scrambleHeading(target);
      }
    }, 3800);
  }

  function startGlitchTimer() {
    startAutoMainTimer();
    startAutoSectionTimer();
  }

  function stopGlitchTimer() {
    if (autoMainTimer) {
      clearInterval(autoMainTimer);
      autoMainTimer = null;
    }
    if (autoSectionTimer) {
      clearInterval(autoSectionTimer);
      autoSectionTimer = null;
    }
  }

  startGlitchTimer();

  // 4. Scroll-reveal: automatically trigger glitch when scrolling into view
  if ('IntersectionObserver' in window) {
    const scrollGlitchObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const heading = entry.target;
            setTimeout(() => {
              if (heading && heading.dataset.scrambling !== 'true') {
                scrambleHeading(heading);
              }
            }, 160);
          }
        });
      },
      { threshold: 0.3 }
    );

    sectionHeadings.forEach((h) => scrollGlitchObserver.observe(h));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopGlitchTimer();
    else startGlitchTimer();
  });

  /* ---------- live IST clock ---------- */
  const tz = document.querySelector('.reach-tz');
  if (tz) {
    const tick = () => {
      try {
        const t = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date());
        tz.textContent = `${t} IST`;
      } catch {}
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- edge telemetry rails ---------- *
     Two subtle vertical strips running down the edges of the page.
     LEFT rail shows system state, stack, and geo coordinates (NO years).
     RIGHT rail shows telemetry metrics, hashes, and latencies (NO years).
  */
  const railLeft = document.getElementById('railLeft');
  const railRight = document.getElementById('railRight');

  if (railLeft || railRight) {
    const IST_OFFSET = 5.5 * 3600 * 1000;
    function istNow() {
      return new Date(Date.now() + IST_OFFSET - new Date().getTimezoneOffset() * 60 * 1000);
    }
    const HEX = '0123456789abcdef';
    const rnd = (n) => Math.floor(Math.random() * n);
    const randHex = (len) => Array.from({ length: len }, () => HEX[rnd(16)]).join('');
    const randBin = (len) => Array.from({ length: len }, () => (Math.random() > 0.5 ? '1' : '0')).join('');

    function buildLeftLines() {
      const t = istNow();
      const hh = String(t.getUTCHours()).padStart(2, '0');
      const mm = String(t.getUTCMinutes()).padStart(2, '0');
      const ss = String(t.getUTCSeconds()).padStart(2, '0');

      // Purposely sanitized: ZERO years or year numbers
      const pool = [
        `pune · 18.5204°n · 73.8567°e`,
        `ist ${hh}:${mm}:${ss}`,
        `monsoonfish · ai eng`,
        `innomatics · ai r&d`,
        `axcentra · backend`,
        `trinity · comp sci`,
        `aces · coordinator`,
        `lc · knight · 500+`,
        `cgpa · 8.51`,
        `eval · precision-first`,
        `rag · hybrid retrieval`,
        `langgraph · multi-agent`,
        `veriframe · 87.5% acc`,
        `healthscribe · 94% f1`,
        `repolens · hybrid ast`,
        `gemini · 2.5 flash`,
        `groq · llama-3.3`,
        `chroma · vector db`,
        `supabase · pgvector`,
        `sqlalchemy · async`,
        `pydantic · structured`,
        `pytest · coverage`,
        `state · active // 24x7`,
        `status · open for roles`,
        `domain · applied ai/backend`,
        `build · ship · evaluate`,
        `engineer · sahil pawar`,
        `github · sahil261005`,
        `linkedin · /in/sahil`,
        `leetcode · @sahil_2610`,
      ];

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const picked = pool.slice(0, 14);
      return picked.map((line, i) => {
        let cls = '';
        if (i === 0 || i === 7) cls = 'is-hot';
        else if (i === 3) cls = 'is-warm';
        else if (i === 11) cls = 'is-cool';
        return `<span class="edge-rail__line${cls ? ' ' + cls : ''}">${line}</span>`;
      }).join('');
    }

    function buildRightLines() {
      const t = istNow();
      const stamps = [
        `0x${randHex(6)} · ${t.getUTCSeconds()}s`,
        `p99 · ${(Math.random() * 120 + 20).toFixed(1)}ms`,
        `${(Math.random() * 4 + 1).toFixed(1)}k tok/s`,
        `temp · 0.20`,
        `0x${randHex(4)} · sha-256`,
        `${randBin(8)} · bin`,
        `v2.4.0 · core`,
        `req · ${rnd(400) + 120}/m`,
        `acc · ${(92 + Math.random() * 6).toFixed(1)}%`,
        `ttfb · ${(0.08 + Math.random() * 0.12).toFixed(3)}s`,
        `0x${randHex(8)}`,
        `qps · ${rnd(48) + 12}`,
        `lat · ${rnd(80) + 15}ms`,
        `agent · sub-graph ok`,
        `chunk · 512 tok`,
        `overlap · 64 tok`,
        `ttl · 300s`,
      ];

      for (let i = stamps.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stamps[i], stamps[j]] = [stamps[j], stamps[i]];
      }

      const picked = stamps.slice(0, 14);
      return picked.map((line, i) => {
        let cls = '';
        if (i === 2) cls = 'is-hot';
        else if (i === 8) cls = 'is-warm';
        else if (i === 12) cls = 'is-cool';
        return `<span class="edge-rail__line${cls ? ' ' + cls : ''}">${line}</span>`;
      }).join('');
    }

    function fillRails() {
      if (railLeft) railLeft.innerHTML = buildLeftLines() + buildLeftLines();
      if (railRight) railRight.innerHTML = buildRightLines() + buildRightLines();
    }
    fillRails();
    setInterval(fillRails, 3500);
  }

  /* ---------- reveal-on-view (smooth scroll entrance) ---------- */
  const reveals = $$('.reveal, .tl');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('tl')) {
            const all = $$('.tl');
            const i = all.indexOf(entry.target);
            entry.target.style.transitionDelay = (i * 80) + 'ms';
          }
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- journey timeline rail pulse ---------- */
  function spawnRailPulses() {
    const tl = document.querySelector('.timeline');
    if (!tl) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    tl.querySelectorAll('.rail-pulse').forEach((d) => d.remove());
    for (let i = 0; i < 2; i++) {
      const dot = document.createElement('div');
      dot.className = 'rail-pulse';
      dot.style.animationDelay = (i * 2.2) + 's';
      tl.appendChild(dot);
    }
  }
  spawnRailPulses();

  /* ---------- section navigation spy ---------- */
  const sections = ['about', 'builds', 'journey']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$('.nav__link[href^="#"]');

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setActiveNav(link.getAttribute('href').slice(1)));
  });

  if (sections.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveNav(visible.target.id);
    }, { threshold: 0.18, rootMargin: '-18% 0px -58% 0px' });
    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------- page ready ---------- */
  document.body.classList.add('is-loaded');
})();
