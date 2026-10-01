/* STUDY WITH ME — user-defined focus timer (vanilla JS, no backend) */
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$("tmCard")) return;

  const MAX = 12 * 3600;
  const QUOTES = ["Keep going.", "One task at a time.", "Your future self will thank you.",
                  "Stay focused.", "Progress > perfection.", "Small steps, every day."];
  const KEY = "isims_study_today";

  const S = { kind: "focus", total: 0, remaining: 0, running: false, end: 0, iv: null, qi: 0, qiv: null, view: "setup" };

  /* ---------- today's stats (local date, not UTC) ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  function loadStats() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.date === today()) return d; } catch (e) {}
    return { date: today(), sessions: 0, seconds: 0 };
  }
  function saveStats() { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) {} }
  let T = loadStats();
  const freshDay = () => { if (T.date !== today()) T = { date: today(), sessions: 0, seconds: 0 }; };

  /* ---------- formatting ---------- */
  function clock(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return h > 0 ? h + ":" + pad(m) + ":" + pad(x) : pad(m) + ":" + pad(x);
  }
  function human(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60, p = [];
    if (h) p.push(h + "h");
    if (m) p.push(m + "m");
    if (x && !h) p.push(x + "s");
    return p.join(" ") || "0m";
  }
  function label(total) {
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60, p = [];
    if (h) p.push(h + (h > 1 ? " hours" : " hour"));
    if (m) p.push(m + (m > 1 ? " minutes" : " minute"));
    if (s) p.push(s + (s > 1 ? " seconds" : " second"));
    return p.join(" ") + (S.kind === "focus" ? " focus session" : " break");
  }

  /* ---------- views ---------- */
  function show(v) {
    S.view = v;
    ["Setup", "Active", "Done", "Game"].forEach((n) => { $("tm" + n).hidden = n.toLowerCase() !== v; });
    $("timer").classList.toggle("is-active", v === "active");
    $("tmCard").classList.toggle("finished", v === "done");
    if (v !== "active") $("tmCard").classList.remove("paused");
    if (v === "setup") { freshDay(); refreshStats(); validate(); }
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
    $(id).addEventListener("change", validate);
    $(id).addEventListener("focus", (e) => e.target.select());
    $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
  });

  /* ---------- timer ---------- */
  function render() {
    $("tmTime").textContent = clock(S.remaining);
    $("tmBar").style.width = (S.total ? (S.total - S.remaining) / S.total * 100 : 0) + "%";
    document.title = S.view === "active" ? clock(S.remaining) + (S.kind === "focus" ? " · Focus" : " · Break")
                   : S.view === "done" ? "✅ Done — Study With Me" : "L1 Multimédia ISIMS — Student Hub v2";
  }

  function start() {
    if (S.view !== "setup" || !validate()) return;
    freshDay();
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
    render();
  }

  function halt() { clearInterval(S.iv); clearInterval(S.qiv); S.running = false; }

  function pause() {
    tick(); if (S.view !== "active") return;
    halt();
    $("tmPause").textContent = "▶ Resume";
    $("tmCard").classList.add("paused");
    render();
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
    render();
  }

  function exit() {
    if (S.view !== "active") return;
    halt();
    if (S.kind === "break") { S.kind = "focus"; $("tmH").value = 0; $("tmM").value = 25; $("tmS").value = 0; }
    show("setup"); render();
  }

  function finish() {
    halt(); beep();
    freshDay();
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
      if (ctx.state === "suspended") ctx.resume();
      [660, 880, 1100].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.22;
        o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.start(t); o.stop(t + 0.32);
      });
    } catch (e) {}
  }

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

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (S.view !== "active" || $("timer").style.display === "none") return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === "Space" && tag !== "button") { e.preventDefault(); toggle(); }
    else if (e.key === "r" || e.key === "R") reset();
    else if (e.key === "Escape") exit();
  });

  /* ---------- calendar hook ---------- */
  window.setStudyDuration = function (mins) {
    if (S.view === "active") { if (!confirm("A session is running. Replace it?")) return; halt(); }
    S.kind = "focus";
    $("tmH").value = Math.floor(mins / 60); $("tmM").value = mins % 60; $("tmS").value = 0;
    show("setup"); render();
  };

  /* ---------- reset today ---------- */
  $("tmClear").onclick = () => {
    if (!confirm("Reset today's stats?")) return;
    T = { date: today(), sessions: 0, seconds: 0 }; saveStats(); refreshStats();
  };

  /* ---------- memory game ---------- */
  const EMO = ["📚", "🧠", "✏️", "💡", "🎯", "🔬", "💻", "📐"];
  const BKEY = "isims_mem_best";
  const G = { first: null, lock: false, moves: 0, found: 0, t0: 0, iv: null };
  const getBest = () => { try { return parseInt(localStorage.getItem(BKEY), 10) || 0; } catch (e) { return 0; } };

  function newGame() {
    clearInterval(G.iv); Object.assign(G, { first: null, lock: false, moves: 0, found: 0, t0: 0, iv: null });
    const deck = EMO.concat(EMO);
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    $("memGrid").innerHTML = deck.map((e) =>
      '<button type="button" class="mem-card" data-e="' + e + '" aria-label="Hidden card"><span>?</span></button>').join("");
    $("gMoves").textContent = 0; $("gTime").textContent = "0s";
    $("gBest").textContent = getBest() ? getBest() + " moves" : "—";
    $("gMsg").textContent = "Find all 8 pairs. Quick break, then back to studying 💪";
  }
  function openGame() { show("game"); newGame(); render(); }
  function closeGame() { clearInterval(G.iv); show("setup"); render(); }

  $("memGrid").addEventListener("click", (e) => {
    const c = e.target.closest(".mem-card");
    if (!c || G.lock || c === G.first || c.classList.contains("open")) return;
    if (!G.t0) {
      G.t0 = Date.now();
      G.iv = setInterval(() => { $("gTime").textContent = Math.floor((Date.now() - G.t0) / 1000) + "s"; }, 500);
    }
    c.classList.add("open"); c.firstChild.textContent = c.dataset.e; c.setAttribute("aria-label", c.dataset.e);
    if (!G.first) { G.first = c; return; }
    G.moves++; $("gMoves").textContent = G.moves;
    const a = G.first; G.first = null;
    if (a.dataset.e === c.dataset.e) {
      a.classList.add("match"); c.classList.add("match");
      if (++G.found === EMO.length) {
        clearInterval(G.iv);
        const best = getBest();
        if (!best || G.moves < best) { try { localStorage.setItem(BKEY, G.moves); } catch (x) {} $("gBest").textContent = G.moves + " moves"; }
        $("gMsg").textContent = "🎉 Done in " + G.moves + " moves! Back to studying?";
      }
    } else {
      G.lock = true;
      setTimeout(() => {
        [a, c].forEach((x) => { x.classList.remove("open"); x.firstChild.textContent = "?"; x.setAttribute("aria-label", "Hidden card"); });
        G.lock = false;
      }, 700);
    }
  });
  $("tmPlay").onclick = openGame; $("tmPlay2").onclick = openGame;
  $("gNew").onclick = newGame; $("gBack").onclick = closeGame;

  show("setup"); render();
})();
