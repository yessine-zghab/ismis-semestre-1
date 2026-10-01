/* CALENDRIER — weekly study planner + DS dates (vanilla JS, localStorage only) */
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$("calGrid")) return;

  const KEY = "isims_calendar";
  const SUBJECTS = [
    ["Algèbre", "#6366f1"],
    ["Analyse", "#0ea5e9"],
    ["Algorithmique & Programmation", "#10b981"],
    ["Systèmes d’Exploitation", "#f59e0b"],
    ["Systèmes Logiques & Architecture des Ordinateurs", "#ec4899"],
    ["Logique formelle", "#8b5cf6"],
    ["Numérisation et codage de données", "#14b8a6"],
    ["Study skills (Étudier à l'université)", "#84cc16"],
    ["Communication Skills en français", "#f97316"],
    ["Introduction au développement Web", "#06b6d4"]
  ];
  const colorOf = (s) => {
  const subject = SUBJECTS.find((x) => x[0] === s);
  return subject ? subject[1] : "#6366f1";
};


  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const monday = (d) => addDays(midnight(d), -((d.getDay() + 6) % 7));
  const fmt = (d, o) => d.toLocaleDateString("en-GB", o);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function load() { try { const a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }

  let items = load();
  let weekStart = monday(new Date());
  let editId = null, mType = "task";

  function rel(dateStr) {
    const n = Math.round((parse(dateStr) - midnight(new Date())) / 86400000);
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n === -1) return "yesterday";
    return n > 0 ? "in " + n + " days" : -n + " days ago";
  }
  const dsTitle = (it) => it.title || it.subject;
  const byTime = (a, b) => (a.time || "99:99").localeCompare(b.time || "99:99") || a.id - b.id;

  /* ---------- render ---------- */
  function render() {
    const today = ymd(new Date());
    const we = addDays(weekStart, 6);
    $("calWeek").textContent = fmt(weekStart, { day: "numeric", month: "short" }) + " – " + fmt(we, { day: "numeric", month: "short", year: "numeric" });

    // week grid
    let html = "";
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i), key = ymd(d);
      const list = items.filter((x) => x.date === key).sort(byTime);
      html += '<div class="cal-day' + (key === today ? " today" : "") + (key < today ? " past" : "") + '">' +
        '<div class="cal-dh"><span class="cal-dn">' + fmt(d, { weekday: "short" }) + '</span><span class="cal-dd">' + d.getDate() + "</span></div>" +
        '<div class="cal-items">' + list.map(itemHtml).join("") + "</div>" +
        '<button class="cal-add" data-add="' + key + '">+ Add</button></div>';
    }
    $("calGrid").innerHTML = html;

    // weekly progress
    const wk = items.filter((x) => x.type === "task" && x.date >= ymd(weekStart) && x.date <= ymd(we));
    const done = wk.filter((x) => x.done).length;
    $("calBar").style.width = wk.length ? (done / wk.length * 100) + "%" : "0%";
    $("calProg").textContent = wk.length ? done + "/" + wk.length + " tasks done this week" : "No tasks planned this week yet.";

    // upcoming DS
    const next = items.filter((x) => x.type === "ds" && x.date >= today).sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b));
    $("calDs").innerHTML = next.length
      ? next.slice(0, 3).map((x) => '<div class="cal-ds-chip" data-edit="' + x.id + '"><div><b>DS ' + esc(dsTitle(x)) + "</b><small>" +
          fmt(parse(x.date), { weekday: "short", day: "numeric", month: "short" }) + (x.time ? " · " + x.time : "") +
          "</small></div><em>" + rel(x.date) + "</em></div>").join("")
      : '<p class="cal-empty">No DS planned. Add your next one with “+ Add DS”.</p>';

    // home banner
    const hb = $("homeNextDs");
    if (hb) {
      if (next.length) {
        const n = next[0];
        hb.hidden = false;
        hb.innerHTML = '<div style="font-size:26px">📝</div><div><strong>Next DS: ' + esc(dsTitle(n)) + " — " + rel(n.date) + "</strong><span>" +
          fmt(parse(n.date), { weekday: "long", day: "numeric", month: "long" }) + (n.time ? " · " + n.time : "") + " · Open the calendar</span></div>";
      } else hb.hidden = true;
    }
  }

  function itemHtml(it) {
    const isDs = it.type === "ds";
    const meta = [it.time, !isDs && it.dur ? it.dur + " min" : ""].filter(Boolean).join(" · ");
    const go = !isDs && it.dur ? '<button class="cal-go" data-go="' + it.id + '" title="Start a focus session" aria-label="Start focus session">▶</button>' : "";
    return '<div class="cal-item' + (isDs ? " ds" : "") + (it.done ? " done" : "") + '" style="--sc:var(' + (isDs ? "--c-ds" : colorOf(it.subject)) + ')">' +
      '<div class="cal-r1">' + (isDs ? "" : '<input type="checkbox" data-done="' + it.id + '"' + (it.done ? " checked" : "") + ' aria-label="Mark done">') +
      '<span class="cal-sub">' + esc(it.subject) + "</span></div>" +
      '<div class="cal-body" data-edit="' + it.id + '"><span class="cal-t">' + esc(isDs ? dsTitle(it) : (it.title || "Study")) + "</span></div>" +
      (meta || go ? '<div class="cal-r3"><span class="cal-m">' + esc(meta) + "</span>" + go + "</div>" : "") + "</div>";
  }

  /* ---------- dialog ---------- */
  function setType(t) {
    mType = t;
    document.querySelectorAll("#calSeg button").forEach((b) => b.classList.toggle("on", b.dataset.t === t));
    $("calDurRow").style.display = t === "task" ? "" : "none";
    $("calTitleL").textContent = t === "task" ? "What are you studying?" : "DS title (optional)";
    $("calTitle").placeholder = t === "task" ? "Réviser les espaces vectoriels" : "DS Analyse — Chapitres 1 à 3";
  }

  function openDialog(type, date, id) {
    editId = id || null;
    const it = id ? items.find((x) => x.id === id) : null;
    $("calSubject").innerHTML = SUBJECTS.map((s) => "<option>" + esc(s[0]) + "</option>").join("");
    setType(it ? it.type : type);
    $("calModalTitle").textContent = it ? "Edit" : "Add to calendar";
    $("calSubject").value = it ? it.subject : SUBJECTS[0][0];
    $("calTitle").value = it ? it.title || "" : "";
    $("calDate").value = it ? it.date : date;
    $("calTime").value = it ? it.time || "" : "";
    $("calDur").value = it ? it.dur || "" : "45";
    $("calDel").style.display = it ? "" : "none";
    $("calSeg").style.display = it ? "none" : "";
    $("calModal").classList.add("show");
    setTimeout(() => $("calTitle").focus(), 50);
  }
  function closeDialog() { $("calModal").classList.remove("show"); editId = null; }

  function saveDialog() {
    const date = $("calDate").value;
    if (!date) { $("calDate").focus(); return; }
    const o = { type: mType, subject: $("calSubject").value, title: $("calTitle").value.trim(), date, time: $("calTime").value,
                dur: mType === "task" ? Math.min(720, Math.max(0, parseInt($("calDur").value, 10) || 0)) : 0 };
    if (editId) { const it = items.find((x) => x.id === editId); Object.assign(it, o); }
    else items.push(Object.assign({ id: Date.now() + Math.floor(Math.random() * 1000), done: false }, o));
    save(); closeDialog();
    weekStart = monday(parse(date));   // jump to the week that contains the new entry
    render();
  }

  /* ---------- actions ---------- */
  function study(it) {
    const m = it.dur || 25;
    const set = (id, v) => { const e = $(id); if (e) e.value = v; };
    set("tmH", Math.floor(m / 60)); set("tmM", pad(m % 60)); set("tmS", "00");
    const tm = $("tmM"); if (tm) tm.dispatchEvent(new Event("change"));
    if (typeof showPage === "function") showPage("timer");
  }

  $("calGrid").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]"), ed = e.target.closest("[data-edit]"), go = e.target.closest("[data-go]");
    if (e.target.closest("input")) return;
    if (go) study(items.find((x) => x.id === +go.dataset.go));
    else if (add) openDialog("task", add.dataset.add);
    else if (ed) openDialog(null, null, +ed.dataset.edit);
  });
  $("calGrid").addEventListener("change", (e) => {
    const c = e.target.closest("[data-done]"); if (!c) return;
    const it = items.find((x) => x.id === +c.dataset.done); it.done = c.checked; save(); render();
  });
  $("calDs").addEventListener("click", (e) => { const ed = e.target.closest("[data-edit]"); if (ed) openDialog(null, null, +ed.dataset.edit); });

  $("calPrev").onclick = () => { weekStart = addDays(weekStart, -7); render(); };
  $("calNext").onclick = () => { weekStart = addDays(weekStart, 7); render(); };
  $("calToday").onclick = () => { weekStart = monday(new Date()); render(); };
  $("calAddDs").onclick = () => { openDialog("ds", ymd(new Date())); setType("ds"); };
  $("calAddTop").onclick = () => openDialog("task", ymd(new Date()));
  $("calSeg").onclick = (e) => { const b = e.target.closest("button"); if (b) setType(b.dataset.t); };
  $("calSave").onclick = saveDialog;
  $("calCancel").onclick = closeDialog;
  $("calDel").onclick = () => { if (confirm("Delete this entry?")) { items = items.filter((x) => x.id !== editId); save(); closeDialog(); render(); } };
  $("calModal").addEventListener("click", (e) => { if (e.target === $("calModal")) closeDialog(); });
  $("calModal").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); saveDialog(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("calModal").classList.contains("show")) closeDialog(); });

  const hb = $("homeNextDs");
  if (hb) hb.onclick = () => typeof showPage === "function" && showPage("calendar");

  window.renderCalendar = function () { weekStart = monday(new Date()); render(); };
  render();
})();
