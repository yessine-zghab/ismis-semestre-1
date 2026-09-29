/* STUDY WITH ME — user-defined focus timer (vanilla JS, no backend) */
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$("tmCard")) return;

  const MAX = 12 * 3600;
  const QUOTES = ["Keep going.", "One task at a time.", "Your future self will thank you.",
                  "Stay focused.", "Progress > perfection.", "Small steps, every day."];
  const KEY = "isims_study_today";

  const S = { kind: "focus", total: 0, remaining: 0, running: false, end: 0, iv: null, qi: 0, qiv: null, view: "setup" };

  /* ---------- today's stats (localStorage, optional) ---------- */
  const today = () => new Date().toISOString().slice(0, 10);
  function loadStats() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.date === today()) return d; } catch (e) {}
    return { date: today(), sessions: 0, seconds: 0 };
  }
  function saveStats() { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) {} }
  let T = loadStats();

  /* ---------- active-session persistence (survives a page refresh) ---------- */
  const AKEY = "isims_study_active";
  function saveActive() {
    try { localStorage.setItem(AKEY, JSON.stringify({ kind: S.kind, total: S.total, remaining: S.remaining, running: S.running, end: S.end })); } catch (e) {}
  }
  function clearActive() { try { localStorage.removeItem(AKEY); } catch (e) {} }

  /* ---------- screen wake lock (no permission prompt; ignored if unsupported) ---------- */
  let wl = null;
  async function lock() { try { if ("wakeLock" in navigator) wl = await navigator.wakeLock.request("screen"); } catch (e) {} }
  function unlock() { try { if (wl) wl.release(); } catch (e) {} wl = null; }

  function navDot(on) { const b = $("nav-timer"); if (b) b.classList.toggle("tm-live", on); }

  /* ---------- formatting ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  function clock(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return h > 0 ? h + ":" + pad(m) + ":" + pad(x) : pad(m) + ":" + pad(x);
  }
  function human(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    if (h && m) return h + "h " + m + "m";
    if (h) return h + "h";
    if (m) return m + "m";
    return s + "s";
  }
  function label(total) {
    const m = Math.floor(total / 60), s = total % 60;
    const parts = [];
    if (m) parts.push(m + " minute");
    if (s) parts.push(s + " second");
    return parts.join(" ") + (S.kind === "focus" ? " focus session" : " break");
  }

  /* ---------- views ---------- */
  function show(v) {
    S.view = v;
    ["Setup", "Active", "Done", "Game"].forEach((n) => { $("tm" + n).hidden = n.toLowerCase() !== v; });
    $("timer").classList.toggle("is-active", v === "active");
    $("tmCard").classList.toggle("finished", v === "done");
    if (v !== "active") $("tmCard").classList.remove("paused");
    if (v === "setup") { refreshStats(); validate(); }
    const f = { active: "tmPause", done: "tmAgain" }[v];
    if (f && $("timer").style.display !== "none") $(f).focus({ preventScroll: true });
  }

  function refreshStats() {
    $("stSessions").textContent = T.sessions;
    $("stTime").textContent = T.seconds ? human(T.seconds) : "0m";
    $("stCurrent").textContent = "#" + (T.sessions + 1);
    const focus = S.kind === "focus";
    $("tmQ").textContent = focus ? "How long do you want to study?" : "How long is your break?";
    $("tmStart").textContent = focus ? "Start Focus" : "Start Break";
  }

  /* ---------- input ---------- */
  const num = (id) => Math.max(0, parseInt($(id).value, 10) || 0);
  const chosen = () => num("tmH") * 3600 + num("tmM") * 60 + num("tmS");

  // e.g. 75 min -> 1 h 15 min, so the fields always match what will run
  function normalize() {
    const t = chosen();
    $("tmH").value = Math.floor(t / 3600);
    $("tmM").value = pad(Math.floor((t % 3600) / 60));
    $("tmS").value = pad(t % 60);
    validate();
  }

  function validate() {
    const t = chosen();
    let err = "";
    if (t === 0) err = "Choose a duration greater than 0.";
    else if (t > MAX) err = "Maximum duration is 12 hours.";
    $("tmError").textContent = err;
    $("tmPreview").textContent = !err && t ? "→ " + label(t) : "";
    $("tmStart").disabled = !!err;
    return !err;
  }
  ["tmH", "tmM", "tmS"].forEach((id) => {
    $(id).addEventListener("input", validate);
    $(id).addEventListener("change", normalize);
    $(id).addEventListener("focus", (e) => e.target.select());
    $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") { normalize(); start(); } });
  });

  /* ---------- timer ---------- */
  function render() {
    $("tmTime").textContent = clock(S.remaining);
    $("tmBar").style.width = ((S.total - S.remaining) / S.total * 100) + "%";
    document.title = S.view === "active" ? clock(S.remaining) + (S.kind === "focus" ? " · Focus" : " · Break")
                   : S.view === "done" ? "✅ Done — Study With Me" : "L1 Multimédia ISIMS — Student Hub v2";
  }

  function start() {
    if (!validate()) return;
    S.total = S.remaining = chosen();
    $("tmKicker").textContent = S.kind === "focus" ? "Focus Session #" + (T.sessions + 1) : "Break Time ☕";
    $("tmSub").textContent = label(S.total);
    show("active");
    setQuote(true);
    run();
  }

  function run() {
    clearInterval(S.iv);
    S.running = true;
    S.end = Date.now() + S.remaining * 1000;
    S.iv = setInterval(tick, 250);
    $("tmPause").textContent = "⏸ Pause";
    $("tmCard").classList.remove("paused");
    clearInterval(S.qiv);
    S.qiv = setInterval(() => setQuote(false), 45000);
    lock(); navDot(true); saveActive();
    render();
  }

  function halt() { clearInterval(S.iv); clearInterval(S.qiv); S.running = false; unlock(); navDot(false); }

  function pause() {
    tick(); if (S.view !== "active") return;
    halt();
    $("tmPause").textContent = "▶ Resume";
    $("tmCard").classList.add("paused");
    saveActive(); render();
  }

  function toggle() { if (S.view !== "active") return; S.running ? pause() : run(); }

  function tick() {
    const left = Math.max(0, Math.ceil((S.end - Date.now()) / 1000));
    if (left !== S.remaining) { S.remaining = left; render(); }
    if (left <= 0) finish();
  }

  function reset() {
    if (S.view !== "active") return;
    halt();
    S.remaining = S.total;
    $("tmPause").textContent = "▶ Resume";
    $("tmCard").classList.add("paused");
    saveActive(); render();
  }

  function exit() {
    if (S.view !== "active") return;
    halt(); clearActive();
    if (S.kind === "break") { S.kind = "focus"; $("tmH").value = 0; $("tmM").value = 25; $("tmS").value = 0; }
    show("setup"); render();
  }

  function finish() {
    halt(); clearActive(); beep(); flashTitle();
    if (S.kind === "focus") {
      T.sessions++; T.seconds += S.total; saveStats();
      $("tmDoneTitle").textContent = "Focus Session Complete!";
      $("tmDoneStats").innerHTML =
        "<div><strong>" + human(S.total) + "</strong><span>Session duration</span></div>" +
        "<div><strong>#" + T.sessions + "</strong><span>Session number</span></div>" +
        "<div><strong>" + human(T.seconds) + "</strong><span>Total focused</span></div>";
      $("tmBreak").hidden = false;
      $("tmAgain").textContent = "Start Another Session";
    } else {
      $("tmDoneTitle").textContent = "Break Over — Ready?";
      $("tmDoneStats").innerHTML = "<div><strong>" + human(S.total) + "</strong><span>Break length</span></div>" +
        "<div><strong>" + T.sessions + "</strong><span>Sessions today</span></div>" +
        "<div><strong>" + human(T.seconds) + "</strong><span>Total focused</span></div>";
      $("tmBreak").hidden = true;
      $("tmAgain").textContent = "Start Focus Session";
    }
    show("done"); render();
  }

  function setQuote(first) {
    const q = $("tmQuote");
    if (first) { S.qi = Math.floor(Math.random() * QUOTES.length); q.textContent = QUOTES[S.qi]; return; }
    q.classList.add("fade");
    setTimeout(() => { S.qi = (S.qi + 1) % QUOTES.length; q.textContent = QUOTES[S.qi]; q.classList.remove("fade"); }, 600);
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [660, 880, 1100].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.22;
        o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.start(t); o.stop(t + 0.32);
      });
    } catch (e) {}
  }

  let flashIv = null;
  function flashTitle() {
    clearInterval(flashIv);
    if (!document.hidden) return;
    let on = false;
    flashIv = setInterval(() => {
      if (!document.hidden) { clearInterval(flashIv); render(); return; }
      document.title = (on = !on) ? "⏰ Time's up!" : "✅ Done — Study With Me";
    }, 900);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !S.running) return;
    lock(); tick();               // re-acquire wake lock, catch up instantly
  });

  window.addEventListener("beforeunload", (e) => { if (S.running) { e.preventDefault(); e.returnValue = ""; } });

  $("tmClear").onclick = () => {
    if (!T.sessions && !T.seconds) return;
    if (confirm("Reset today's sessions and focused time?")) { T = { date: today(), sessions: 0, seconds: 0 }; saveStats(); refreshStats(); }
  };

  /* ---------- buttons ---------- */
  $("tmStart").onclick = start;
  $("tmPause").onclick = toggle;
  $("tmReset").onclick = reset;
  $("tmSkip").onclick = exit;
  $("tmAgain").onclick = () => { S.kind = "focus"; show("setup"); render(); };
  $("tmBreak").onclick = () => {
    S.kind = "break";
    $("tmH").value = 0; $("tmM").value = 5; $("tmS").value = 0;
    show("setup"); render();
  };

  /* ---------- memory match (simple break game) ---------- */
  const EMO = ["🎓", "📚", "✏️", "💻", "🧠", "🔬", "🎧", "☕"];
  const GKEY = "isims_memory_best";
  const G = { first: null, lock: false, moves: 0, matched: 0, t0: 0, iv: null, from: "setup" };
  const gBest = () => { try { return parseInt(localStorage.getItem(GKEY), 10) || null; } catch (e) { return null; } };

  function openGame(from) { G.from = from; show("game"); newGame(); }
  function closeGame() { clearInterval(G.iv); show(G.from); render(); }

  function newGame() {
    clearInterval(G.iv);
    Object.assign(G, { first: null, lock: false, moves: 0, matched: 0, t0: 0 });
    const deck = EMO.concat(EMO).sort(() => Math.random() - 0.5);
    const grid = $("memGrid"); grid.innerHTML = "";
    deck.forEach((e) => {
      const b = document.createElement("button");
      b.className = "mem-card"; b.type = "button"; b.setAttribute("aria-label", "Hidden card");
      b.innerHTML = "<span>" + e + "</span>"; b.dataset.e = e;
      b.onclick = () => flip(b);
      grid.appendChild(b);
    });
    $("gMoves").textContent = 0; $("gTime").textContent = "0s";
    $("gBest").textContent = gBest() ? gBest() + " moves" : "—";
    $("gMsg").textContent = "Find all 8 pairs. Quick break, then back to studying 💪";
  }

  function flip(b) {
    if (G.lock || b.classList.contains("open") || b.classList.contains("done")) return;
    if (!G.t0) { G.t0 = Date.now(); G.iv = setInterval(() => { $("gTime").textContent = Math.floor((Date.now() - G.t0) / 1000) + "s"; }, 500); }
    b.classList.add("open"); b.setAttribute("aria-label", b.dataset.e);
    if (!G.first) { G.first = b; return; }
    G.moves++; $("gMoves").textContent = G.moves;
    const a = G.first; G.first = null;
    if (a.dataset.e === b.dataset.e) {
      a.classList.replace("open", "done"); b.classList.replace("open", "done");
      if (++G.matched === EMO.length) win();
    } else {
      G.lock = true;
      setTimeout(() => {
        [a, b].forEach((x) => { x.classList.remove("open"); x.setAttribute("aria-label", "Hidden card"); });
        G.lock = false;
      }, 700);
    }
  }

  function win() {
    clearInterval(G.iv);
    const sec = Math.floor((Date.now() - G.t0) / 1000), best = gBest();
    let msg = "🎉 Done in " + G.moves + " moves (" + sec + "s). Ready to focus again?";
    if (!best || G.moves < best) { try { localStorage.setItem(GKEY, G.moves); } catch (e) {} msg = "🏆 New best: " + G.moves + " moves! Ready to focus again?"; }
    $("gMsg").textContent = msg;
    $("gBest").textContent = Math.min(best || 999, G.moves) + " moves";
  }

  $("tmPlay").onclick = () => openGame("setup");
  $("tmPlay2").onclick = () => openGame("done");
  $("gNew").onclick = newGame;
  $("gBack").onclick = () => { closeGame(); if (G.from === "done") { S.kind = "focus"; show("setup"); render(); } };

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (S.view === "game" && e.key === "Escape" && $("timer").style.display !== "none") { $("gBack").click(); return; }
    if (S.view !== "active" || $("timer").style.display === "none") return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === "Space" && tag !== "button") { e.preventDefault(); toggle(); }
    else if (e.key === "r" || e.key === "R") reset();
    else if (e.key === "Escape") exit();
  });

  // restore an unfinished session after a refresh
  (function restore() {
    try {
      const a = JSON.parse(localStorage.getItem(AKEY));
      if (!a || !a.total) return;
      S.kind = a.kind; S.total = a.total;
      S.remaining = a.running ? Math.max(0, Math.ceil((a.end - Date.now()) / 1000)) : a.remaining;
      $("tmKicker").textContent = S.kind === "focus" ? "Focus Session #" + (T.sessions + 1) : "Break Time ☕";
      $("tmSub").textContent = label(S.total);
      show("active"); setQuote(true);
      if (a.running) { S.end = a.end; a.end <= Date.now() ? finish() : run(); }
      else { $("tmPause").textContent = "▶ Resume"; $("tmCard").classList.add("paused"); render(); }
    } catch (e) { clearActive(); }
  })();
  if (S.view === "setup") { normalize(); show("setup"); render(); }
})();
