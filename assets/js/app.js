/* =============================================================
   EduPan · PPX — Pantallas y eventos
   Login, Panel, Productos, Reportes y Ajustes.
   ============================================================= */
(function (PPX) {
  "use strict";
  const { fmt, util, rules, data } = PPX;
  const { esc, round2, parseNum, uid, today, addDays, iso } = util;
  const $ = (s, el = document) => el.querySelector(s);
  const IMG = "assets/img/";

  /* ---------- Íconos ---------- */
  const svg = (p, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    panel: svg('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
    productos: svg('<path d="M4 14c0-4.2 3.6-7.5 8-7.5s8 3.3 8 7.5c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z"/><path d="M9 9.5l1 3M13 9l.6 3.4M16.4 10.4l-.7 2.4"/>'),
    informes: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h8M12 11v8"/>'),
    perdidas: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/><path d="M10 11v6M14 11v6"/>'),
    inventario: svg('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>'),
    reportes: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    ajustes: svg('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>', 2.4),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
    back: svg('<path d="M15 18l-6-6 6-6"/>', 2.2),
    out: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    warn: svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
    alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'),
    check: svg('<path d="M20 6L9 17l-5-5"/>', 2.4),
    tag: svg('<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    diario: svg('<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 14h3M8 17h6"/>'),
    gastos: svg('<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.5"/>'),
    personal: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>'),
    mas: svg('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'),
    "prod-panel": svg('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  };
  const logo = (cls = "") => `<img class="logo-on-light ${cls}" src="${IMG}logo-light.webp" alt="EduPan Panaderías"><img class="logo-on-dark ${cls}" src="${IMG}logo-dark.webp" alt="EduPan Panaderías">`;
  const mark = () => `<img class="logo-on-light" src="${IMG}mark-light.webp" alt="EduPan"><img class="logo-on-dark" src="${IMG}mark-dark.webp" alt="EduPan">`;

  /* ---------- Modo claro / oscuro ---------- */
  const THEME_KEY = "ppx-tema";
  const sysDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : { matches: false, addEventListener() {} };
  let theme = (() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();
  const isDark = () => (theme ? theme === "dark" : sysDark.matches);
  const SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 2.2);
  const MOON = svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', 2.2);
  function applyTheme() {
    const dark = isDark();
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = dark ? "#0C0A09" : "#F6F2EC";
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-checked", String(dark));
      b.title = dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
      const ic = b.querySelector(".tt-thumb"); if (ic) ic.innerHTML = dark ? MOON : SUN;
      const lb = b.querySelector(".tt-label"); if (lb) lb.textContent = dark ? "Modo oscuro" : "Modo claro";
    });
  }
  /** Interruptor on/off. compact = solo el interruptor (barra del celular y login). */
  const themeToggle = (compact) => `<button type="button" class="theme-toggle${compact ? " compact" : ""}" data-theme-toggle role="switch" aria-checked="${isDark()}" aria-label="Modo oscuro" title="${isDark() ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}">${compact ? "" : `<span class="tt-label">${isDark() ? "Modo oscuro" : "Modo claro"}</span>`}<span class="tt-track"><span class="tt-thumb">${isDark() ? MOON : SUN}</span></span></button>`;
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    theme = isDark() ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, theme); } catch (x) { /* sin almacenamiento: dura esta visita */ }
    document.documentElement.classList.add("theme-anim");
    applyTheme();
    setTimeout(() => document.documentElement.classList.remove("theme-anim"), 450);
  });
  sysDark.addEventListener && sysDark.addEventListener("change", () => { if (!theme) applyTheme(); });
  applyTheme();

  /* ---------- Estado ---------- */
  // Vista previa: datos de ejemplo en este navegador. Sistema real: Firebase (se carga al iniciar sesión).
  let db = data.DEMO ? (data.store.load() || data.seed()) : data.empty();
  data.migrate(db);
  let session = data.DEMO ? data.store.loadSession() : null;
  const ui = { periodo: "30", local: "todos", prodQuery: "", prodVer: "activos", repLocal: "todos", repEstado: "todos", invLocal: "todos", invEstado: "todos", invMov: "todos", movLimit: 25, perdPeriodo: "30", perdLocal: "todos", pendingDraft: null,
    inf: { periodo: "mes", desde: "", hasta: "", locs: { matriz: true, suc1: true, suc2: true }, hojas: { finanzas: true, diario: true, gastos: true, roles: true, resumen: false, productos: false, ventas: false, inventario: false, perdidas: false, entradas: false } }, draft: null, viewId: null, pendingOpen: null, reopen: false, confirmDelete: false, confirmReset: false,
    gate: data.DEMO ? null : { tipo: "cargando" }, loginMode: "entrar", loginMsg: null, confirmUserDel: null };

  const save = () => (data.DEMO ? data.store.save(db) : data.cloud.save(db));
  const isAdmin = () => !!session && session.rol === "ADMINISTRADORA";
  const producto = (id) => db.productos.find((p) => p.id === id);
  const local = (id) => db.locales.find((l) => l.id === id);
  const reportTotals = rules.reportTotals;
  const cuadre = rules.cuadre;
  function audit(accion, detalle) {
    db.auditoria.unshift({ id: uid(), fecha: util.now(), usuario: session ? session.nombre : "—", accion, detalle });
    db.auditoria = db.auditoria.slice(0, 300);
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2400);
  }
  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches"; };
  const statePill = (r) => r.estado === "CONFIRMADO" ? '<span class="pill good">Confirmado</span>' : '<span class="pill warn">Borrador</span>';
  const cuadrePill = (c) => c.estado === "ok" ? '<span class="pill good">Cuadra</span>' : c.estado === "dif" ? `<span class="pill bad">Dif. ${fmt.signedMoney(c.dif)}</span>` : '<span class="pill neutral">Sin total</span>';
  const marginClass = (m) => (m >= 0.4 ? "good" : m >= 0.15 ? "warn" : "bad");

  /* ---------- Gráficos ---------- */
  function sparkline(series, color = "var(--gold)") {
    if (series.length < 2) return "";
    const W = 200, H = 38, vals = series.map((s) => s.v), min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 4 - ((v - min) / span) * (H - 10)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
    const id = "g" + uid();
    const [lx, ly] = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <path class="area" d="${line}L${W} ${H}L0 ${H}Z" fill="url(#${id})"/><path class="line" pathLength="1" d="${line}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><circle cx="${lx}" cy="${ly}" r="3" fill="${color}"/></svg>`;
  }
  function ring(share, color) {
    const r = 23, c = 2 * Math.PI * r, v = isFinite(share) ? share : 0;
    return `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="6"/>${v > 0 ? `<circle cx="28" cy="28" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(c * v).toFixed(1)} ${c.toFixed(1)}"/>` : ""}</svg>`;
  }
  function weeklyChart(reps) {
    if (!reps.length) return `<div class="empty">Sin reportes confirmados en este período.</div>`;
    const weeks = new Map();
    for (const r of reps) { const k = util.monday(r.hasta); const o = weeks.get(k) || {}; o[r.localId] = (o[r.localId] || 0) + reportTotals(r).ventas; weeks.set(k, o); }
    const keys = [...weeks.keys()].sort().slice(-12);
    const totals = keys.map((k) => Object.values(weeks.get(k)).reduce((a, b) => a + b, 0));
    const max = Math.max(...totals) || 1;
    const step = max > 4000 ? 1000 : max > 2000 ? 500 : max > 800 ? 200 : max > 300 ? 100 : 50;
    const top = Math.ceil((max * 1.08) / step) * step;
    const W = 620, H = 260, L = 54, B = 30, T = 22, R = 6, cw = (W - L - R) / keys.length, bw = Math.min(40, cw * 0.56);
    const y = (v) => T + (H - T - B) * (1 - v / top);
    let g = "";
    for (let v = 0; v <= top; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 10}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">$${v.toLocaleString("es-EC")}</text>`;
    keys.forEach((k, i) => {
      const x = L + i * cw + (cw - bw) / 2; let acc = 0; const segs = [];
      db.locales.forEach((l, j) => { const v = weeks.get(k)[l.id] || 0; if (v) { segs.push({ l, j, v, from: acc }); acc += v; } });
      const clip = "c" + uid();
      g += `<g class="col" ${tt({ t: fmt.money(acc), s: "Semana del " + fmt.short(k), r: segs.map((s) => [`var(--s${s.j + 1})`, s.l.nombre, fmt.money(s.v)]) })}><rect class="hit" x="${L + i * cw + 2}" y="${T}" width="${cw - 4}" height="${H - T - B}" rx="8"/>`;
      g += `<clipPath id="${clip}"><rect x="${x}" y="${y(acc)}" width="${bw}" height="${y(0) - y(acc)}" rx="7"/></clipPath><g class="grow" style="animation-delay:${(i * 0.06).toFixed(2)}s" clip-path="url(#${clip})">`;
      for (const s of segs) g += `<rect x="${x}" y="${y(s.from + s.v)}" width="${bw}" height="${Math.max(0, y(s.from) - y(s.from + s.v))}" fill="var(--s${s.j + 1})"/>`;
      g += `</g></g>`;
      if (i === keys.length - 1) g += `<text x="${x + bw / 2}" y="${y(acc) - 8}" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--ink)">${fmt.money(acc)}</text>`;
      if (keys.length <= 6 || i % Math.ceil(keys.length / 6) === 0 || i === keys.length - 1) g += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)">${fmt.short(k)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ventas por semana y por local">${g}</svg>`;
  }

  /* ---------- Estructura ---------- */
  const root = $("#root");
  const ROUTES = ["panel", "diario", "personal", "informes", "ajustes", "mas", "prod-panel", "reportes", "inventario", "perdidas", "productos"];
  const PROPUESTA = ["prod-panel", "reportes", "inventario", "perdidas", "productos"];
  const route = () => { const h = (location.hash || "").slice(1); return ROUTES.includes(h) ? h : "panel"; };

  function render() {
    if (!session) return ui.gate ? renderGate() : renderLogin();
    const r = route();
    const nav = [["panel", "Panel"], ["diario", "Reportes diarios"], ["personal", "Personal"], ["informes", "Informes"], ["ajustes", "Ajustes"]];
    const navProp = [["prod-panel", "Resumen por producto"], ["reportes", "Ventas"], ["inventario", "Inventario"], ["productos", "Productos"]];
    const tabs = [["panel", "Panel"], ["diario", "Diario"], ["personal", "Personal"], ["informes", "Informes"], ["mas", "Más"]];
    // Pérdidas vive dentro de Inventario: el menú marca Inventario
    const link = (k, t) => `<a href="#${k}" ${r === k || (k === "inventario" && r === "perdidas") || (k === "mas" && (PROPUESTA.includes(r) || r === "ajustes")) ? 'aria-current="page"' : ""}>${ICON[k]}<span>${t}</span></a>`;
    const role = isAdmin() ? "Administradora" : "Solo lectura";
    root.innerHTML = `
    <div class="app">
      <aside class="side">
        <div class="side-logo">${logo()}</div>
        <nav class="nav" aria-label="Secciones"><div class="nav-label">Gestión</div>${nav.map(([k, t]) => link(k, t)).join("")}<div class="nav-label prop">Propuesta · por producto</div>${navProp.map(([k, t]) => link(k, t)).join("")}</nav>
        <div class="side-foot">
          <div class="user"><div class="avatar">${esc(initials(session.nombre))}</div><div style="min-width:0"><b>${esc(session.nombre)}</b><span>${role}</span></div></div>
          ${themeToggle(false)}
          <button class="linkbtn" data-act="logout">${ICON.out} Cerrar sesión</button>
        </div>
      </aside>
      <header class="topbar">
        ${mark()}
        <div class="right">${themeToggle(true)}<span class="pill ${isAdmin() ? "gold" : "neutral"}">${role}</span><button class="icon-btn" data-act="logout" aria-label="Cerrar sesión">${ICON.out}</button></div>
      </header>
      <main class="main"><div class="wrap" id="view"></div></main>
      <nav class="tabbar" aria-label="Secciones">${tabs.map(([k, t]) => link(k, t)).join("")}</nav>
      <span id="sync" class="sync" role="status" hidden></span>
    </div>`;
    const v = $("#view");
    const key = r + (ui.draft ? ":editor" : ui.viewId ? ":" + ui.viewId : "");
    const entering = key !== ui.lastKey;
    ui.lastKey = key;
    if (entering) v.classList.add("enter");
    if (r === "panel") v.innerHTML = viewPanel();
    if (r === "prod-panel") v.innerHTML = viewPanelProductos();
    if (r === "diario") v.innerHTML = viewDiario();
    if (r === "personal") v.innerHTML = viewPersonal();
    if (r === "mas") v.innerHTML = viewMas();
    if (r === "productos") v.innerHTML = viewProductos();
    if (r === "reportes") v.innerHTML = ui.draft ? viewEditor() : ui.viewId ? viewDetalle() : viewReportes();
    const viewDoc = () => db.reportes.find((x) => x.id === ui.viewId);
    if (r === "inventario") v.innerHTML = ui.draft ? (ui.draft.tipo === "INVENTARIO" ? viewInvEditor() : viewMovEditor()) : ui.viewId ? (viewDoc()?.tipo === "INVENTARIO" ? viewInvDetalle() : viewMovDetalle()) : viewInventario();
    if (r === "perdidas") v.innerHTML = ui.draft ? viewMovEditor() : ui.viewId ? viewMovDetalle() : viewPerdidas();
    if (r === "informes") v.innerHTML = viewInformes();
    if (r === "ajustes") v.innerHTML = viewAjustes();
    if (PROPUESTA.includes(r) && !ui.draft && !ui.viewId) $(".page-head", v)?.insertAdjacentHTML("afterend", propuestaBanner());
    if (entering) $(".prod-grid", v)?.classList.add("enter-cards");
    else $(".prod-grid", v)?.classList.remove("enter-cards");
    countUp(v);
  }

  /* Cifras que suben desde 0 al mostrarse */
  const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(scope) {
    if (reduceMotion()) return;
    scope.querySelectorAll("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count) || 0, f = el.dataset.fmt === "int" ? fmt.int : fmt.money, t0 = performance.now(), dur = 900;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = f(el.dataset.fmt === "int" ? Math.round(end * e) : end * e);
        if (k < 1 && el.isConnected) requestAnimationFrame(step); else el.textContent = f(end);
      };
      requestAnimationFrame(step);
    });
  }

  /* Detalle al pasar el mouse por cualquier gráfico (elementos con data-tt) */
  document.addEventListener("mousemove", (e) => {
    const el = e.target.closest && e.target.closest("[data-tt]");
    const card = el && el.closest(".chart");
    let tip = document.querySelector(".tip");
    if (!el || !card) { tip?.remove(); return; }
    if (!tip || tip._src !== el || tip.parentNode !== card) {
      tip?.remove();
      const d = JSON.parse(el.dataset.tt);
      tip = document.createElement("div"); tip.className = "tip"; tip._src = el;
      tip.innerHTML = `<b>${esc(d.t)}</b>${d.s ? `<span class="muted">${esc(d.s)}</span>` : ""}` + (d.r || []).map(([c, n, v]) => `<div><span><i style="background:${c}"></i>${esc(n)}</span><span class="num">${esc(v)}</span></div>`).join("");
      card.appendChild(tip);
    }
    const r = card.getBoundingClientRect();
    tip.style.left = Math.min(Math.max(e.clientX - r.left, 100), r.width - 100) + "px"; tip.style.top = (e.clientY - r.top) + "px";
  });


  /* ---------- Login ---------- */
  function enter(u) {
    session = { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, duena: u.rol === "ADMINISTRADORA" };
    data.store.saveSession(session);
    if (!location.hash) location.hash = "panel";
    render();
  }
  const GOOGLE_G = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
  const shell = (inner) => `<div class="login"><div class="login-theme">${themeToggle(true)}</div><div class="login-card">${inner}</div></div>`;
  const note = (m) => (m ? `<div class="note ${m.ok ? "good" : "bad"}" role="${m.ok ? "status" : "alert"}">${esc(m.t)}</div>` : "");

  function renderLogin(err) {
    if (!data.DEMO) return renderCloudLogin();
    root.innerHTML = `
    <div class="login"><div class="login-theme">${themeToggle(true)}</div>
      <form class="login-card" id="login-form" novalidate>
        <div class="login-logo">${logo()}</div>
        <div style="display:grid;gap:6px"><h1>Panel de control</h1><p class="login-sub">Ventas de Matriz, Sucursal 1 y Sucursal 2 en un solo lugar.</p></div>
        <div class="field"><label for="lg-email">Correo</label><input class="input" id="lg-email" type="email" autocomplete="username" value="${esc(data.ADMIN_EMAIL)}" required></div>
        <div class="field"><label for="lg-pass">Contraseña</label><input class="input" id="lg-pass" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres" required></div>
        ${err ? `<div class="note bad" role="alert">${esc(err)}</div>` : ""}
        <button class="btn primary" type="submit">Entrar</button>
        <div class="divider"></div>
        <p class="login-foot">Vista previa: vale cualquier contraseña de 6 caracteres o más. En el sistema real el acceso lo controla Firebase (correo o Google).</p>
      </form>
    </div>`;
    $("#lg-pass").focus();
    $("#login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("#lg-email").value.trim().toLowerCase(), pass = $("#lg-pass").value;
      const u = db.usuarios.find((x) => x.email.toLowerCase() === email && x.activo);
      if (!u) return renderLogin("Ese correo no tiene acceso. La administradora puede agregarlo en Ajustes → Usuarios.");
      if (pass.length < 6) return renderLogin("La contraseña debe tener al menos 6 caracteres.");
      enter(u);
    });
  }

  /** Login del sistema real: Google o correo y contraseña (Firebase Authentication). */
  function renderCloudLogin() {
    const m = ui.loginMode, msg = ui.loginMsg;
    const emailVal = esc(ui.loginEmail || "");
    const title = m === "crear" ? "Crear cuenta con correo" : m === "recuperar" ? "Recuperar contraseña" : "Panel de control";
    const sub = m === "crear" ? "Te enviaremos un correo para confirmar que es tuyo. Solo los correos autorizados por la administradora ven los datos."
      : m === "recuperar" ? "Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva."
      : "Ingresos, egresos y utilidad de Matriz, Sucursal 1 y Sucursal 2.";
    root.innerHTML = shell(`
      <div class="login-logo">${logo()}</div>
      <div style="display:grid;gap:6px"><h1>${title}</h1><p class="login-sub">${sub}</p></div>
      ${m === "entrar" ? `<button class="btn google" type="button" id="lg-google">${GOOGLE_G} Entrar con Google</button><div class="or"><span>o con tu correo</span></div>` : ""}
      <form id="login-form" style="display:grid;gap:14px" novalidate>
        <div class="field"><label for="lg-email">Correo</label><input class="input" id="lg-email" type="email" autocomplete="username" value="${emailVal}" placeholder="tucorreo@gmail.com" required></div>
        ${m !== "recuperar" ? `<div class="field"><label for="lg-pass">Contraseña</label><input class="input" id="lg-pass" type="password" autocomplete="${m === "crear" ? "new-password" : "current-password"}" placeholder="${m === "crear" ? "Mínimo 8 caracteres" : ""}" required></div>` : ""}
        ${m === "crear" ? `<div class="field"><label for="lg-pass2">Repite la contraseña</label><input class="input" id="lg-pass2" type="password" autocomplete="new-password" required></div>` : ""}
        ${note(msg)}
        <button class="btn primary" type="submit" id="lg-submit">${m === "crear" ? "Crear cuenta" : m === "recuperar" ? "Enviar enlace" : "Entrar"}</button>
      </form>
      <div class="login-links">
        ${m === "entrar" ? `<button class="linkbtn" data-lmode="recuperar">¿Olvidaste tu contraseña?</button>` : `<button class="linkbtn" data-lmode="entrar">← Volver a entrar</button>`}
      </div>
      <div class="divider"></div>
      <p class="login-foot">Acceso restringido: solo pueden entrar los correos autorizados por EduPan. Cualquier otro correo es rechazado.</p>`);
    const busy = (on) => root.querySelectorAll("button").forEach((b) => { b.disabled = on; });
    const fail = (x) => { ui.loginMsg = { t: data.cloud.message(x) }; renderCloudLogin(); };
    root.querySelectorAll("[data-lmode]").forEach((b) => b.addEventListener("click", () => { ui.loginEmail = $("#lg-email").value.trim(); ui.loginMode = b.dataset.lmode; ui.loginMsg = null; renderCloudLogin(); }));
    const g = $("#lg-google");
    if (g) g.addEventListener("click", async () => { ui.loginMsg = null; busy(true); try { await data.cloud.google(); } catch (x) { fail(x); } });
    (m === "entrar" && !ui.loginEmail ? g : $("#lg-email")).focus();
    $("#login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("#lg-email").value.trim().toLowerCase(); ui.loginEmail = email;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { ui.loginMsg = { t: "Escribe un correo válido." }; return renderCloudLogin(); }
      if (m === "recuperar") {
        busy(true);
        try { await data.cloud.reset(email); ui.loginMode = "entrar"; ui.loginMsg = { ok: true, t: `Si ${email} tiene cuenta, te llegará un correo con el enlace para crear una contraseña nueva. Revisa también la carpeta de spam.` }; renderCloudLogin(); }
        catch (x) { fail(x); }
        return;
      }
      const pass = $("#lg-pass").value;
      if (m === "crear") {
        if (pass.length < 8) { ui.loginMsg = { t: "La contraseña debe tener al menos 8 caracteres." }; return renderCloudLogin(); }
        if (pass !== $("#lg-pass2").value) { ui.loginMsg = { t: "Las dos contraseñas no coinciden." }; return renderCloudLogin(); }
        busy(true);
        try { await data.cloud.signUp(email, pass); } catch (x) { fail(x); }
        return;
      }
      if (!pass) { ui.loginMsg = { t: "Escribe tu contraseña." }; return renderCloudLogin(); }
      busy(true);
      try { await data.cloud.signIn(email, pass); } catch (x) { fail(x); }
    });
  }

  /** Pantallas intermedias: conectando, confirmar correo, sin acceso, error. */
  function renderGate() {
    const g = ui.gate;
    const out = `<button class="btn ghost" type="button" data-gate="salir">Salir</button>`;
    let inner;
    if (g.tipo === "cargando") inner = `<div class="login-logo">${logo()}</div><div class="loading"><span class="spinner" aria-hidden="true"></span><span>${esc(g.texto || "Conectando con la base de datos…")}</span></div>`;
    else if (g.tipo === "config") inner = `<div class="login-logo">${logo()}</div><h1>Falta conectar Firebase</h1>
      <p class="login-sub">${window.firebase ? "Pega la configuración de tu proyecto de Firebase en <b>assets/js/config.js</b> (paso 5 de la guía) y vuelve a subir la carpeta a Netlify." : "No se pudo cargar Firebase. Revisa tu conexión a internet y recarga la página."}</p>
      <button class="btn primary" type="button" data-gate="recargar">Recargar</button>`;
    else if (g.tipo === "verificar") inner = `<div class="login-logo">${logo()}</div><h1>Confirma tu correo</h1>
      <p class="login-sub">Te enviamos un correo a <b>${esc(g.email)}</b>. Abre el enlace que trae (revisa también spam) y luego toca «Ya lo confirmé».</p>
      ${note(g.msg)}
      <button class="btn primary" type="button" data-gate="verificado">Ya lo confirmé</button>
      <div class="login-links"><button class="linkbtn" data-gate="reenviar">Reenviar el correo</button><button class="linkbtn" data-gate="salir">Usar otra cuenta</button></div>`;
    else if (g.tipo === "sinacceso") inner = `<div class="login-logo">${logo()}</div><h1>Sin acceso</h1>
      <p class="login-sub">El correo <b>${esc(g.email)}</b> entró bien, pero no tiene permiso para ver este panel. Pide a la administradora que lo agregue en <b>Ajustes → Usuarios</b> y vuelve a entrar.</p>${out}`;
    else inner = `<div class="login-logo">${logo()}</div><h1>No se pudo abrir el panel</h1><div class="note bad" role="alert">${esc(g.msg || "")}</div>
      <div class="actions" style="justify-content:center"><button class="btn primary" type="button" data-gate="reintentar">Reintentar</button>${out}</div>`;
    root.innerHTML = shell(inner);
    root.querySelectorAll("[data-gate]").forEach((b) => b.addEventListener("click", async () => {
      const a = b.dataset.gate;
      if (a === "salir") { ui.gate = null; ui.loginMsg = null; ui.loginMode = "entrar"; data.cloud.signOut().catch(() => {}); return render(); }
      if (a === "recargar") return location.reload();
      if (a === "reintentar") { const u = await data.cloud.reload().catch(() => null); return u ? startSession(u) : location.reload(); }
      if (a === "reenviar") { try { await data.cloud.resendVerification(); g.msg = { ok: true, t: "Correo reenviado." }; } catch (x) { g.msg = { t: data.cloud.message(x) }; } return renderGate(); }
      if (a === "verificado") {
        b.disabled = true;
        try { const u = await data.cloud.reload(); if (u && u.emailVerified) return startSession(u); g.msg = { t: "Todavía no aparece confirmado. Abre el enlace del correo y vuelve a intentarlo." }; }
        catch (x) { g.msg = { t: data.cloud.message(x) }; }
        return renderGate();
      }
    }));
  }

  /** Usuario de Firebase listo: revisa el correo, el acceso y descarga los datos. */
  async function startSession(user) {
    ui.loginMode = "entrar";
    if (!user.emailVerified) { ui.gate = { tipo: "verificar", email: user.email }; return render(); }
    ui.gate = { tipo: "cargando", texto: "Cargando tus datos…" }; render();
    try {
      const r = await data.cloud.open(user);
      db = r.db; session = r.session; ui.gate = null; ui.loginMsg = null;
      if (!location.hash) location.hash = "panel";
      render();
    } catch (x) {
      if (x.code === "no-access") {
        // Correo no autorizado: se cierra la sesión de inmediato y no ve nada
        ui.gate = null; ui.loginMode = "entrar"; ui.loginMsg = { t: `Acceso denegado: ${user.email} no está autorizado para entrar a este panel.` };
        data.cloud.signOut().catch(() => {}); return render();
      }
      ui.gate = { tipo: "error", msg: data.cloud.message(x) };
      render();
    }
  }

  /* ---------- Gráficos del panel ---------- */
  const tt = (o) => `data-tt="${esc(JSON.stringify(o))}"`;
  const niceStep = (max) => { const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
  const axisMoney = (v) => (v >= 1000 ? "$" + (v / 1000).toLocaleString("es-EC", { maximumFractionDigits: 1 }) + "k" : "$" + Math.round(v).toLocaleString("es-EC"));

  /** Gráfico circular (dona) con animación y detalle al pasar el mouse. */
  function donut(segs, centerVal, centerLbl) {
    const total = segs.reduce((a, s) => a + s.v, 0);
    if (!total) return `<div class="empty">Sin datos en este período.</div>`;
    const R = 70, C = 2 * Math.PI * R; let off = 0;
    const arcs = segs.filter((s) => s.v > 0).map((s, i) => {
      const len = (s.v / total) * C, gap = segs.length > 1 ? Math.min(3, len / 3) : 0;
      const a = `<circle class="arc" cx="100" cy="100" r="${R}" fill="none" stroke="${s.c}" stroke-width="24" stroke-dasharray="${(len - gap).toFixed(2)} ${(C - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" style="animation-delay:${i * 0.08}s" ${tt({ t: s.l, s: fmt.pct(s.v / total) + " del total", r: [[s.c, s.k || "Valor", fmt.money(s.v)]].concat(s.extra || []) })}/>`;
      off += len; return a;
    }).join("");
    return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 200 200" role="img" aria-label="${esc(centerLbl)}"><g transform="rotate(-90 100 100)"><circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--surface-3)" stroke-width="24"/>${arcs}</g>
      <text x="100" y="96" text-anchor="middle" class="donut-val">${esc(centerVal)}</text><text x="100" y="116" text-anchor="middle" class="donut-lbl">${esc(centerLbl)}</text></svg>
      <ul class="donut-legend">${segs.map((s) => `<li ${tt({ t: s.l, s: fmt.pct(s.v / total) + " del total", r: [[s.c, s.k || "Valor", fmt.money(s.v)]].concat(s.extra || []) })}><i style="background:${s.c}"></i><span class="nm">${esc(s.l)}</span><b class="num">${fmt.money(s.v)}</b><em class="num">${fmt.pct(s.v / total)}</em></li>`).join("")}</ul></div>`;
  }

  /** Cascada: de las ventas a la ganancia. */
  function waterfall(ventas, costo, perd, gan) {
    if (!ventas) return `<div class="empty">Sin ventas en este período.</div>`;
    const steps = [
      { l: "Ventas", v: ventas, from: 0, to: ventas, c: "var(--s1)" },
      { l: "Costo vendido", v: -costo, from: ventas - costo, to: ventas, c: "var(--s2)" },
      { l: "Pérdidas", v: -perd, from: ventas - costo - perd, to: ventas - costo, c: "var(--bad)" },
      { l: "Ganancia", v: gan, from: Math.min(0, gan), to: Math.max(0, gan), c: "var(--good)" },
    ];
    const W = 440, H = 260, L = 48, B = 34, T = 26, R = 6, max = ventas * 1.08, step = niceStep(max), top = Math.ceil(max / step) * step;
    const y = (v) => T + (H - T - B) * (1 - v / top), cw = (W - L - R) / steps.length, bw = Math.min(70, cw * 0.56);
    let g = "";
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${axisMoney(v)}</text>`;
    steps.forEach((s, i) => {
      const x = L + i * cw + (cw - bw) / 2, h = Math.max(2, y(s.from) - y(s.to));
      if (i < steps.length - 1) { const yy = y(i === 0 ? s.to : s.from); g += `<line x1="${x + bw}" x2="${x + cw}" y1="${yy}" y2="${yy}" stroke="var(--line-strong)" stroke-dasharray="3 3"/>`; }
      g += `<g class="col" ${tt({ t: s.l, s: i === 3 ? `${fmt.pct(ventas ? gan / ventas : NaN)} de las ventas` : i === 0 ? "Lo que se vendió" : `${fmt.pct(Math.abs(s.v) / ventas)} de las ventas`, r: [[s.c, i === 0 || i === 3 ? "Monto" : "Resta", fmt.money(Math.abs(s.v))]] })}>
        <rect class="hit" x="${L + i * cw + 2}" y="${T}" width="${cw - 4}" height="${H - T - B}" rx="8"/>
        <rect class="grow" style="animation-delay:${i * 0.12}s" x="${x}" y="${y(s.to)}" width="${bw}" height="${h}" rx="6" fill="${s.c}"/>
        <text x="${x + bw / 2}" y="${y(s.to) - 8}" text-anchor="middle" class="val-lbl">${i === 1 || i === 2 ? "−" : ""}${fmt.money(Math.abs(s.v))}</text>
        <text x="${x + bw / 2}" y="${H - 12}" text-anchor="middle" class="ax">${s.l}</text></g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="De las ventas a la ganancia">${g}</svg>`;
  }

  /** Barras agrupadas: ventas, costos, pérdidas y ganancia de cada local. */
  function groupedBars(rows) {
    const keys = [["ventas", "Ventas", "var(--s1)"], ["costo", "Costo vendido", "var(--s2)"], ["perd", "Pérdidas", "var(--bad)"], ["gan", "Ganancia", "var(--good)"]];
    const max = Math.max(1, ...rows.flatMap((r) => keys.map(([k]) => Math.abs(r[k]))));
    if (!rows.some((r) => r.ventas)) return `<div class="empty">Sin ventas en este período.</div>`;
    const W = 620, H = 260, L = 52, B = 34, T = 18, R = 8, step = niceStep(max * 1.05), top = Math.ceil((max * 1.05) / step) * step;
    const y = (v) => T + (H - T - B) * (1 - Math.max(0, v) / top), gw = (W - L - R) / rows.length, bw = Math.min(26, (gw * 0.72) / keys.length);
    let g = "";
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${axisMoney(v)}</text>`;
    rows.forEach((r, i) => {
      const x0 = L + i * gw + (gw - bw * keys.length - 6 * (keys.length - 1)) / 2;
      g += `<g class="col" ${tt({ t: r.nombre, s: `${r.tipo} · ganancia ${fmt.pct(r.ventas ? r.gan / r.ventas : NaN)} de las ventas`, r: keys.map(([k, l, c]) => [c, l, fmt.money(r[k])]) })}><rect class="hit" x="${L + i * gw + 4}" y="${T}" width="${gw - 8}" height="${H - T - B}" rx="8"/>`;
      keys.forEach(([k, , c], j) => { const v = Math.max(0, r[k]); g += `<rect class="grow" style="animation-delay:${(i * 0.1 + j * 0.05).toFixed(2)}s" x="${x0 + j * (bw + 6)}" y="${y(v)}" width="${bw}" height="${Math.max(1, y(0) - y(v))}" rx="5" fill="${c}"/>`; });
      g += `<text x="${L + i * gw + gw / 2}" y="${H - 12}" text-anchor="middle" class="ax strong">${esc(r.nombre)}</text></g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rentabilidad por local">${g}</svg>
      <div class="legend" style="margin-top:8px">${keys.map(([, l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  }

  /** Líneas: ventas, egresos y ganancia por semana. */
  function trendChart(series) {
    if (series.length < 2) return `<div class="empty">Se necesitan al menos dos semanas con ventas para ver la tendencia.</div>`;
    const keys = [["ventas", "Ventas", "var(--s1)"], ["egresos", "Costos + pérdidas", "var(--s2)"], ["gan", "Ganancia", "var(--good)"]];
    const max = Math.max(1, ...series.flatMap((s) => keys.map(([k]) => s[k]))), min = Math.min(0, ...series.map((s) => s.gan));
    const W = 620, H = 250, L = 52, B = 30, T = 16, R = 14, step = niceStep(max - min), top = Math.ceil((max * 1.05) / step) * step, bot = Math.floor(min / step) * step;
    const x = (i) => L + (i / (series.length - 1)) * (W - L - R), y = (v) => T + (H - T - B) * (1 - (v - bot) / (top - bot));
    let g = "";
    for (let v = bot; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${axisMoney(v)}</text>`;
    const gid = "tg" + uid();
    g += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--good)" stop-opacity=".22"/><stop offset="1" stop-color="var(--good)" stop-opacity="0"/></linearGradient></defs>`;
    const path = (k) => series.map((s, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(s[k]).toFixed(1)).join("");
    g += `<path class="area-in" d="${path("gan")}L${x(series.length - 1)} ${y(bot)}L${x(0)} ${y(bot)}Z" fill="url(#${gid})"/>`;
    keys.forEach(([k, , c], j) => { g += `<path class="draw" pathLength="1" style="animation-delay:${j * 0.15}s" d="${path(k)}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`; });
    const cw = (W - L - R) / (series.length - 1);
    series.forEach((s, i) => {
      g += `<g class="pt" ${tt({ t: "Semana del " + fmt.short(s.week), s: `Ganancia ${fmt.pct(s.ventas ? s.gan / s.ventas : NaN)} de las ventas`, r: keys.map(([k, l, c]) => [c, l, fmt.money(s[k])]) })}><rect class="hit" x="${x(i) - cw / 2}" y="${T}" width="${cw}" height="${H - T - B}"/><line class="guide" x1="${x(i)}" x2="${x(i)}" y1="${T}" y2="${H - B}"/>${keys.map(([k, , c]) => `<circle cx="${x(i)}" cy="${y(s[k])}" r="3.5" fill="${c}"/>`).join("")}</g>`;
      if (series.length <= 7 || i % Math.ceil(series.length / 6) === 0 || i === series.length - 1) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ax">${fmt.short(s.week)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia semanal">${g}</svg>
      <div class="legend" style="margin-top:8px">${keys.map(([, l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  }

  /* ---------- Resumen por producto (propuesta) ---------- */
  function viewPanelProductos() {
    const range = rules.periodRange(ui.periodo), prev = rules.prevRange(range);
    const reps = rules.confirmedIn(db, range, ui.local), t = rules.aggregate(reps), tp = rules.aggregate(rules.confirmedIn(db, prev, ui.local));
    const losses = rules.lossesIn(db, range, ui.local);
    const perd = round2(losses.reduce((a, x) => a + x.v, 0));
    const perdPrev = round2(rules.lossesIn(db, prev, ui.local).reduce((a, x) => a + x.v, 0));
    const egresos = round2(t.costo + perd), gan = round2(t.margen - perd), ganPrev = round2(tp.margen - perdPrev);
    const delta = tp.ventas > 0 ? (t.ventas - tp.ventas) / tp.ventas : null;
    const dGan = ganPrev !== 0 ? (gan - ganPrev) / Math.abs(ganPrev) : null;
    const sinCostoVentas = round2(t.ventas - t.ventasConCosto);
    const periodos = [["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["mes", "Este mes"], ["mesant", "Mes anterior"], ["90", "Últimos 90 días"], ["todo", "Todo el historial"]];
    const locs = [["todos", "Las 3 sedes"], ...db.locales.map((l) => [l.id, l.nombre])];
    const shown = ui.periodo === "todo" ? [db.reportes.map((r) => r.desde).sort()[0] || today(), today()] : range;

    const porLocal = db.locales.map((l, i) => {
      const a = rules.aggregate(rules.confirmedIn(db, range, l.id)), pl = round2(rules.lossesIn(db, range, l.id).reduce((s, x) => s + x.v, 0));
      return { l, i, t: a, perd: pl, gan: round2(a.margen - pl) };
    });
    const totalAll = porLocal.reduce((a, x) => a + x.t.ventas, 0);
    const lastReport = (id) => db.reportes.filter((r) => r.tipo === "VENTAS" && r.localId === id && r.estado === "CONFIRMADO").map((r) => r.hasta).sort().pop();

    const byProd = new Map();
    for (const r of reps) for (const l of r.lineas) {
      const o = byProd.get(l.productoId) || { id: l.productoId, q: 0, v: 0, c: 0, vc: 0, pq: 0, pv: 0 };
      const x = rules.lineTotal(l); o.q += Number(l.cantidad) || 0; o.v += x;
      if (rules.hasCost(l.costo)) { o.c += (Number(l.cantidad) || 0) * l.costo; o.vc += x; }
      byProd.set(l.productoId, o);
    }
    for (const x of losses) { const o = byProd.get(x.l.productoId) || { id: x.l.productoId, q: 0, v: 0, c: 0, vc: 0, pq: 0, pv: 0 }; o.pq += x.q; o.pv += x.v; byProd.set(x.l.productoId, o); }
    const prods = [...byProd.values()].filter((p) => p.v > 0).sort((a, b) => b.v - a.v);
    const maxP = Math.max(1, ...prods.map((p) => p.v));

    // Semanas: ventas, egresos y ganancia (con pérdidas)
    const wk = new Map(), W = (k) => wk.get(k) || wk.set(k, { week: k, ventas: 0, costo: 0, margen: 0, perd: 0 }).get(k);
    for (const r of reps) { const x = reportTotals(r), o = W(util.monday(r.hasta)); o.ventas += x.ventas; o.costo += x.costo; o.margen += x.margen; }
    for (const x of losses) W(util.monday(x.r.hasta)).perd += x.v;
    const series = [...wk.values()].sort((a, b) => a.week.localeCompare(b.week)).slice(-12).map((o) => ({ week: o.week, ventas: round2(o.ventas), egresos: round2(o.costo + o.perd), gan: round2(o.margen - o.perd) }));

    // Dona: por local (consolidado) o por producto (un local)
    const donutSegs = ui.local === "todos"
      ? porLocal.map(({ l, i, t: a, gan: g }) => ({ l: l.nombre, v: a.ventas, c: `var(--s${i + 1})`, k: "Ventas", extra: [["var(--good)", "Ganancia", fmt.money(g)]] }))
      : (() => { const top = prods.slice(0, 5), rest = prods.slice(5).reduce((a, p) => a + p.v, 0); const cols = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--teal)", "#8E7CC3", "var(--muted)"]; return top.map((p, i) => ({ l: producto(p.id)?.nombre || "—", v: p.v, c: cols[i], k: "Ventas" })).concat(rest ? [{ l: "Otros", v: rest, c: cols[5], k: "Ventas" }] : []); })();
    const motivos = new Map(); for (const x of losses) motivos.set(x.l.motivo || "Otro", (motivos.get(x.l.motivo || "Otro") || 0) + x.v);
    const motCols = ["var(--bad)", "#E08A3C", "#C9A227", "#8E7CC3", "var(--muted)"];
    const motSegs = [...motivos.entries()].sort((a, b) => b[1] - a[1]).map(([k, v], i) => ({ l: k, v, c: motCols[i % motCols.length], k: "Valor perdido" }));

    const borradores = db.reportes.filter((r) => r.estado === "BORRADOR" && MOV[r.tipo]);
    const difs = db.reportes.filter((r) => r.tipo === "VENTAS" && r.estado === "CONFIRMADO" && cuadre(r).estado === "dif");
    const sinCosto = db.productos.filter((p) => p.activo && !rules.hasCost(p.costo));
    const hayReportes = db.reportes.some((r) => r.tipo === "VENTAS" && r.estado === "CONFIRMADO");
    const atrasados = hayReportes ? db.locales.filter((l) => { const u = lastReport(l.id); return !u || u < addDays(today(), -10); }) : [];
    const nuevo = !db.productos.length || !db.reportes.some((r) => r.tipo === "VENTAS");
    const stock = stockAlerts();
    const porUnidades = [...prods].sort((a, b) => b.q - a.q);
    const estrella = porUnidades[0];
    const starCard = () => {
      if (ui.local === "todos" && totalAll > 0) {
        const top = [...porLocal].sort((a, b) => b.t.ventas - a.t.ventas)[0];
        return `<div class="kpi"><span class="eyebrow">Local con más ventas</span><span class="val val-name">${esc(top.l.nombre)}</span>
          <span class="sub">${fmt.money(top.t.ventas)} · ${fmt.pct(top.t.ventas / totalAll)} de las ventas</span>
          <div class="share" role="img" aria-label="Participación de cada local">${porLocal.map(({ l, i, t: a }) => `<i title="${esc(l.nombre)}: ${fmt.pct(a.ventas / totalAll)}" style="width:${(a.ventas / totalAll) * 100}%;background:var(--s${i + 1})"></i>`).join("")}</div>
          ${estrella ? `<span class="sub star">Más vendido: <b>${esc(producto(estrella.id)?.nombre || "—")}</b> · ${fmt.int(estrella.q)} u.</span>` : ""}</div>`;
      }
      return `<div class="kpi"><span class="eyebrow">Producto más vendido</span><span class="val val-name">${estrella ? esc(producto(estrella.id)?.nombre || "—") : "—"}</span>
        <span class="sub">${estrella ? `${fmt.int(estrella.q)} unidades · ${fmt.money(estrella.v)}` : "Sin ventas en este período"}</span>
        ${porUnidades[1] ? `<span class="sub star">Le sigue: <b>${esc(producto(porUnidades[1].id)?.nombre || "—")}</b> · ${fmt.int(porUnidades[1].q)} u.</span>` : ""}</div>`;
    };
    const alert = (cls, icon, html) => `<div class="alert ${cls}"><span class="ic">${ICON[icon]}</span><span>${html}</span></div>`;
    const dTxt = (d, label) => (d === null || !isFinite(d) ? "" : `<span class="delta ${d >= 0 ? "up" : "down"}">${d >= 0 ? "▲" : "▼"} ${fmt.pct(Math.abs(d))}</span> ${label}`);
    const ganPct = t.ventas ? gan / t.ventas : NaN, perdPct = egresos ? perd / egresos : NaN;

    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Propuesta</span><h1>Resumen por producto</h1>
        <p>${ui.local === "todos" ? "Matriz, Sucursal 1 y Sucursal 2" : "Solo " + esc(local(ui.local).nombre)} · ${fmt.period(...shown)}</p></div>
      <div class="filters">
        <div class="select-wrap"><select class="input" id="f-periodo" data-bind="periodo" aria-label="Período">${periodos.map(([k, x]) => `<option value="${k}" ${ui.periodo === k ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        <div class="segmented" role="group" aria-label="Local">${locs.map(([k, x]) => `<button class="seg" aria-pressed="${ui.local === k}" data-local="${k}">${esc(x)}</button>`).join("")}</div>
      </div>
    </div>

    ${nuevo ? `<section class="card welcome" aria-label="Primeros pasos">
      <div><span class="eyebrow">Primeros pasos</span><h2 style="margin-top:4px">Empieza a llenar tu panel</h2></div>
      <div class="steps">
        <div class="step"><span class="n">1</span><b>Crea tus productos</b><span class="muted small">Nombre, precio al público y costo de hacerlo.</span>${db.productos.length ? '<span class="pill good">Listo</span>' : isAdmin() ? '<a href="#productos">Ir a Productos</a>' : ""}</div>
        <div class="step"><span class="n">2</span><b>Registra entradas</b><span class="muted small">Producción y compras de cada local en Inventario.</span>${db.reportes.some((r) => r.tipo === "ENTRADA") ? '<span class="pill good">Listo</span>' : isAdmin() ? '<a href="#inventario">Ir a Inventario</a>' : ""}</div>
        <div class="step"><span class="n">3</span><b>Registra las ventas</b><span class="muted small">Al confirmarlas se restan del inventario y aparecen aquí.</span>${db.reportes.some((r) => r.tipo === "VENTAS") ? '<span class="pill good">Listo</span>' : isAdmin() ? '<a href="#reportes">Ir a Ventas</a>' : ""}</div>
      </div>
    </section>` : ""}
    <section class="kpis" aria-label="Indicadores">
      <div class="kpi hero"><span class="eyebrow">Ventas del período</span><span class="val num" data-count="${t.ventas}" data-fmt="money">${fmt.money(t.ventas)}</span>
        <span class="sub">${delta === null ? "Sin datos del período anterior" : dTxt(delta, "frente al período anterior")}</span>
        <div class="spark">${sparkline(series.map((s) => ({ v: s.ventas })), "#E3B263")}</div></div>
      <div class="kpi"><span class="eyebrow">Costos (egresos)</span><span class="val num" data-count="${egresos}" data-fmt="money">${fmt.money(egresos)}</span><span class="sub">Vendido ${fmt.money(t.costo)} · pérdidas <b style="color:var(--bad)">${fmt.money(perd)}</b></span><div class="spark">${sparkline(series.map((s) => ({ v: s.egresos })), "var(--s2)")}</div></div>
      <div class="kpi"><span class="eyebrow">Ganancia</span><span class="val num ${gan < 0 ? "" : "good"}" style="${gan < 0 ? "color:var(--bad)" : ""}" data-count="${gan}" data-fmt="money">${fmt.money(gan)}</span><span class="sub">${isFinite(ganPct) ? `${fmt.pct(ganPct)} de las ventas` : "Ventas − costos − pérdidas"}${dGan !== null ? " · " + dTxt(dGan, "") : ""}</span><div class="spark">${sparkline(series.map((s) => ({ v: s.gan })), "var(--good)")}</div></div>
      ${starCard()}
    </section>
    ${sinCostoVentas > 0 ? `<div class="note"><b>${fmt.money(sinCostoVentas)}</b> en ventas de productos sin costo registrado no entran en la ganancia. <a href="#productos">Agregar costos</a></div>` : ""}

    <div class="minis" aria-label="Indicadores secundarios">
      <div class="mini"><span>Unidades vendidas</span><b class="num">${fmt.int(t.unidades)}</b></div>
      <div class="mini"><span>Precio promedio por unidad</span><b class="num">${t.unidades ? fmt.money(t.ventas / t.unidades) : "—"}</b></div>
      <div class="mini"><span>Ganancia por cada $1 vendido</span><b class="num" style="color:var(--good)">${t.ventas ? fmt.money(gan / t.ventas) : "—"}</b></div>
      <div class="mini"><span>Pérdidas sobre egresos</span><b class="num" style="color:var(--bad)">${fmt.pct(perdPct)}</b></div>
      <div class="mini"><span>Valor del inventario hoy</span><b class="num">${fmt.money(stockTable(ui.local === "todos" ? db.locales : [local(ui.local)]).reduce((a, r) => a + r.per.reduce((s, x) => s + (x.qty > 0 && rules.hasCost(r.p.costo) ? x.qty * r.p.costo : 0), 0), 0))}</b></div>
    </div>

    <div class="two">
      <section class="card chart" aria-label="Ventas por semana">
        <div class="card-head"><div><h2>Ventas por semana</h2><p class="muted small">Cada reporte cuenta en la semana en que termina</p></div>
          <div class="legend">${db.locales.map((l, i) => `<span><i style="background:var(--s${i + 1})"></i>${esc(l.nombre)}</span>`).join("")}</div></div>
        ${weeklyChart(reps)}
      </section>
      <section class="card chart" aria-label="${ui.local === "todos" ? "Participación por local" : "Ventas por producto"}">
        <div class="card-head"><div><h2>${ui.local === "todos" ? "Participación en ventas" : "Ventas por producto"}</h2><p class="muted small">${ui.local === "todos" ? "Cuánto aporta cada local al total" : "Los 5 que más venden y el resto"}</p></div></div>
        ${donut(donutSegs, fmt.money(t.ventas), "ventas")}
      </section>
    </div>

    <div class="two rev">
      <section class="card chart" aria-label="De las ventas a la ganancia">
        <div class="card-head"><div><h2>De las ventas a la ganancia</h2><p class="muted small">Qué se lleva cada parte de lo vendido</p></div></div>
        ${waterfall(t.ventas, t.costo, perd, gan)}
      </section>
      ${ui.local === "todos" ? `<section class="card chart" aria-label="Rentabilidad por local">
        <div class="card-head"><div><h2>Rentabilidad por local</h2><p class="muted small">Ventas, costos, pérdidas y ganancia de cada sede</p></div></div>
        ${groupedBars(porLocal.map(({ l, t: a, perd: p, gan: g }) => ({ nombre: l.nombre, tipo: l.tipo, ventas: a.ventas, costo: a.costo, perd: p, gan: g })))}
      </section>` : `<section class="card chart" aria-label="Pérdidas por motivo"><div class="card-head"><div><h2>Pérdidas por motivo</h2><p class="muted small">Valor perdido a costo</p></div><a class="small" href="#perdidas">Ver pérdidas</a></div>${donut(motSegs, fmt.money(perd), "perdido")}</section>`}
    </div>

    <div class="two">
      <section class="card chart" aria-label="Tendencia semanal">
        <div class="card-head"><div><h2>Tendencia semanal</h2><p class="muted small">Ventas, egresos y ganancia semana a semana</p></div></div>
        ${trendChart(series)}
      </section>
      ${ui.local === "todos" ? `<section class="card chart" aria-label="Pérdidas por motivo"><div class="card-head"><div><h2>Pérdidas por motivo</h2><p class="muted small">Valor perdido a costo</p></div><a class="small" href="#perdidas">Ver pérdidas</a></div>${donut(motSegs, fmt.money(perd), "perdido")}</section>`
        : `<section class="card" aria-label="Resumen del local"><div class="card-head"><div><h2>${esc(local(ui.local).nombre)}</h2><p class="muted small">${esc(local(ui.local).tipo)} · último reporte ${lastReport(ui.local) ? fmt.short(lastReport(ui.local)) : "ninguno"}</p></div></div>
          <div class="totals num"><div><span class="muted">Ventas</span><b>${fmt.money(t.ventas)}</b></div><div><span class="muted">Costo de lo vendido</span><span>${fmt.money(t.costo)}</span></div><div><span class="muted">Pérdidas</span><span style="color:var(--bad)">${fmt.money(perd)}</span></div><div><span class="muted">Ganancia</span><b style="color:var(--good)">${fmt.money(gan)}</b></div><div><span class="muted">Participación en EduPan</span><span>${fmt.pct(totalAll ? t.ventas / totalAll : NaN)}</span></div></div></section>`}
    </div>

    <section class="card" aria-label="Productos más vendidos">
      <div class="card-head"><div><h2>Productos más vendidos</h2><p class="muted small">Ordenados por ventas en dólares · la ganancia ya descuenta las pérdidas de cada producto</p></div></div>
      ${prods.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Producto</th><th class="r">Unidades</th><th class="r">Ventas</th><th class="hide-sm"></th><th class="r">Costo</th><th class="r hide-sm">Pérdidas</th><th class="r">Ganancia</th><th class="r">Ganancia %</th></tr></thead>
        <tbody>${prods.map((p, i) => { const pr = producto(p.id), has = p.vc > 0, m = p.vc - p.c - p.pv; return `
          <tr><td style="white-space:nowrap"><span class="rank">${i + 1}</span><b>${esc(pr?.nombre || "—")}</b></td><td class="r num">${fmt.int(p.q)}</td><td class="r num"><b>${fmt.money(p.v)}</b></td>
          <td class="hide-sm" style="width:14%"><div class="bar"><i style="width:${(p.v / maxP) * 100}%"></i></div></td>
          <td class="r num">${has ? fmt.money(p.c) : '<span class="pill neutral">sin costo</span>'}</td><td class="r num hide-sm" style="color:${p.pv ? "var(--bad)" : "inherit"}">${p.pv ? fmt.money(p.pv) : "—"}</td><td class="r num">${has ? fmt.money(m) : "—"}</td>
          <td class="r">${has ? `<span class="pill ${marginClass(m / p.vc)}">${fmt.pct(m / p.vc)}</span>` : "—"}</td></tr>`; }).join("")}</tbody></table></div>`
        : `<div class="empty">No hay reportes confirmados en este período.</div>`}
    </section>

    <section class="card" aria-label="Para revisar">
      <div class="card-head"><h2>Para revisar</h2></div>
      <div class="alerts">
        ${!data.DEMO && isAdmin() && db.reportes.length && (backupDays() === null || backupDays() > 7) ? alert("warn", "clock", `<b>Respaldo semanal pendiente:</b> ${db.ultimoRespaldo ? `el último fue hace ${backupDays()} días` : "aún no has descargado ninguno"}. Los datos están en la nube; el respaldo es un seguro extra. <a href="#ajustes">Ir a Ajustes</a>`) : ""}
        ${borradores.map((r) => alert("warn", "clock", `<b>${MOV[r.tipo].label} sin confirmar:</b> ${esc(local(r.localId).nombre)}, ${fmt.period(r.desde, r.hasta)}. No cuenta hasta guardarlo. <a href="#${ROUTE_OF[r.tipo]}" data-route="${ROUTE_OF[r.tipo]}" data-open="${r.id}">Abrir</a>`)).join("")}
        ${stock.negativo ? alert("bad", "alert", `<b>${stock.negativo} producto${stock.negativo > 1 ? "s" : ""} con más salidas que entradas:</b> ${stock.negTxt}. Falta registrar alguna entrada o producción. <a href="#inventario">Ver inventario</a>`) : ""}
        ${stock.agotado ? alert("bad", "warn", `<b>${stock.agotado} producto${stock.agotado > 1 ? "s" : ""} agotado${stock.agotado > 1 ? "s" : ""}:</b> ${stock.agotadoTxt}. <a href="#inventario">Ver inventario</a>`) : ""}
        ${stock.bajo ? alert("warn", "warn", `<b>${stock.bajo} producto${stock.bajo > 1 ? "s" : ""} bajo el mínimo:</b> ${stock.bajoTxt}. <a href="#inventario">Ver inventario</a>`) : ""}
        ${difs.map((r) => { const c = cuadre(r); return alert("bad", "alert", `<b>No cuadra:</b> ${esc(local(r.localId).nombre)}, ${fmt.period(r.desde, r.hasta)}. Lo registrado suma ${fmt.money(reportTotals(r).ventas)} y el papel dice ${fmt.money(r.totalDeclarado)} (diferencia ${fmt.signedMoney(c.dif)}). <a href="#reportes" data-open="${r.id}">Revisar</a>`); }).join("")}
        ${atrasados.map((l) => alert("warn", "warn", `<b>Reporte pendiente:</b> ${esc(l.nombre)} no tiene reportes de ventas confirmados de los últimos 10 días.`)).join("")}
        ${sinCosto.length ? alert("", "tag", `<b>${sinCosto.length} producto${sinCosto.length > 1 ? "s" : ""} sin costo:</b> ${sinCosto.map((p) => esc(p.nombre)).join(", ")}. <a href="#productos">Completar</a>`) : ""}
        ${!borradores.length && !difs.length && !atrasados.length && !sinCosto.length && !stock.bajo && !stock.agotado && !stock.negativo ? alert("good", "check", hayReportes ? "Todo al día." : "Nada pendiente por ahora.") : ""}
      </div>
    </section>`;
  }

  /* ---------- Productos ---------- */
  function viewProductos() {
    const q = ui.prodQuery.trim().toLowerCase();
    const list = db.productos
      .filter((p) => (ui.prodVer === "todos" || (ui.prodVer === "activos" ? p.activo : !p.activo)) && (!q || p.nombre.toLowerCase().includes(q)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const act = db.productos.filter((p) => p.activo && rules.hasCost(p.costo) && p.precio > 0);
    const avg = act.length ? act.reduce((a, p) => a + (p.precio - p.costo) / p.precio, 0) / act.length : NaN;
    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Catálogo</span><h1>Productos</h1><p>Lo que cuesta hacer cada producto y a cuánto se vende al público. Margen promedio: <b>${fmt.pct(avg)}</b>.</p></div>
      ${isAdmin() ? `<button class="btn primary" data-act="prod-new">${ICON.plus} Nuevo producto</button>` : ""}
    </div>
    <div class="toolbar">
      <label class="search">${ICON.search}<input class="input" id="prod-q" type="search" placeholder="Buscar producto" value="${esc(ui.prodQuery)}" aria-label="Buscar producto"></label>
      <div class="segmented" role="group" aria-label="Mostrar">${[["activos", "Activos"], ["inactivos", "Desactivados"], ["todos", "Todos"]].map(([k, x]) => `<button class="seg" aria-pressed="${ui.prodVer === k}" data-prodver="${k}">${x}</button>`).join("")}</div>
    </div>
    ${list.length ? `<div class="prod-grid">${list.map(prodCard).join("")}</div>` : `<div class="card empty">${db.productos.length ? "Ningún producto coincide con la búsqueda." : "Todavía no hay productos. Crea el primero con «Nuevo producto»."}</div>`}`;
  }
  function prodCard(p) {
    const has = rules.hasCost(p.costo);
    const m = has ? round2(p.precio - p.costo) : null, mp = has && p.precio > 0 ? m / p.precio : NaN;
    return `<article class="prod ${p.activo ? "" : "off"}">
      <div class="prod-top"><div><div class="prod-name">${esc(p.nombre)}</div><div class="muted small">por ${esc(p.unidad || "unidad")}${p.stockMin ? ` · mínimo ${fmt.int(p.stockMin)}` : ""}${p.ejemplo ? " · ejemplo" : ""}${p.activo ? "" : " · desactivado"}</div></div>
        <span class="pill ${has ? (m < 0 ? "bad" : marginClass(mp)) : "neutral"}">${has ? (m < 0 ? "Pérdida" : fmt.pct(mp)) : "Sin costo"}</span></div>
      <div class="prod-price"><span class="big num">${fmt.money(p.precio)}</span><span class="muted small">precio al público</span></div>
      <div class="pc"><div><span>Costo</span><b>${has ? fmt.money(p.costo) : "—"}</b></div><div><span>Ganas</span><b style="color:${m !== null && m < 0 ? "var(--bad)" : "var(--good)"}">${has ? fmt.money(m) : "—"}</b></div></div>
      ${has && p.precio > 0 ? `<div><div class="split" role="img" aria-label="Costo ${fmt.pct(p.costo / p.precio)} y margen ${fmt.pct(mp)} del precio"><i class="c" style="width:${Math.min(100, (p.costo / p.precio) * 100)}%"></i><i class="m" style="width:${Math.max(0, mp * 100)}%"></i></div><div class="split-legend"><span>Costo ${fmt.pct(p.costo / p.precio)}</span><span>Margen ${fmt.pct(mp)}</span></div></div>` : ""}
      ${isAdmin() ? `<div class="prod-actions"><button class="btn" data-act="prod-edit" data-id="${p.id}">Editar</button><button class="btn ghost" data-act="prod-toggle" data-id="${p.id}">${p.activo ? "Desactivar" : "Activar"}</button></div>` : ""}
    </article>`;
  }
  function openProdDialog(id) {
    const p = id ? producto(id) : { nombre: "", precio: "", costo: "", unidad: "unidad", stockMin: "" };
    const show = (v) => (v === "" || v === null || v === undefined ? "" : String(v).replace(".", ","));
    const ov = document.createElement("div"); ov.className = "overlay";
    ov.innerHTML = `<form class="dialog" id="prod-form" novalidate role="dialog" aria-modal="true" aria-labelledby="pd-t">
      <div class="card-head" style="margin:0"><h2 id="pd-t">${id ? "Editar producto" : "Nuevo producto"}</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${ICON.x}</button></div>
      <div class="field"><label for="pd-nombre">Nombre</label><input class="input" id="pd-nombre" value="${esc(p.nombre)}" placeholder="Ej.: Pan de yuca" maxlength="80" required></div>
      <div class="grid2">
        <div class="field"><label for="pd-precio">Precio al público</label><input class="input num" id="pd-precio" inputmode="decimal" value="${show(p.precio)}" placeholder="0,25" required></div>
        <div class="field"><label for="pd-costo">Costo de hacerlo</label><input class="input num" id="pd-costo" inputmode="decimal" value="${show(p.costo)}" placeholder="0,11"><span class="hint">Opcional. Sin costo no hay margen.</span></div>
      </div>
      <div class="grid2">
        <div class="field"><label for="pd-unidad">Se vende por</label><select class="input" id="pd-unidad">${["unidad", "porción", "docena", "funda", "libra", "kg"].map((u) => `<option ${p.unidad === u ? "selected" : ""}>${u}</option>`).join("")}</select></div>
        <div class="field"><label for="pd-min">Stock mínimo</label><input class="input num" id="pd-min" inputmode="decimal" value="${show(p.stockMin)}" placeholder="Ej.: 40"><span class="hint">Opcional. Avisa cuando un local tenga menos.</span></div>
      </div>
      <div id="pd-prev" class="note info" aria-live="polite"></div>
      <div id="pd-err" class="errors"></div>
      ${id ? `<p class="muted small">Cambiar el precio o el costo no altera los reportes ya registrados: cada reporte guarda los valores de su momento.</p>` : ""}
      <div class="actions"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary" type="submit">${id ? "Guardar cambios" : "Crear producto"}</button></div>
    </form>`;
    document.body.appendChild(ov);
    const upd = () => {
      const pr = parseNum($("#pd-precio").value), co = parseNum($("#pd-costo").value), box = $("#pd-prev");
      if (isNaN(pr)) { box.className = "note info"; box.textContent = "Escribe el precio para ver cuánto ganas por unidad."; return; }
      if (isNaN(co)) { box.className = "note info"; box.textContent = `Se vende a ${fmt.money(pr)}. Agrega el costo para ver el margen.`; return; }
      const m = round2(pr - co);
      box.className = "note " + (m < 0 ? "bad" : m / pr >= 0.4 ? "good" : "");
      box.innerHTML = m < 0 ? `<b>Se vende a pérdida:</b> cuesta ${fmt.money(co)} y se vende a ${fmt.money(pr)}.` : `Ganas <b>${fmt.money(m)}</b> por ${esc($("#pd-unidad").value)}: <b>${fmt.pct(pr ? m / pr : NaN)}</b> del precio.`;
    };
    ["#pd-precio", "#pd-costo", "#pd-unidad"].forEach((s) => $(s, ov).addEventListener("input", upd));
    upd();
    const close = () => ov.remove();
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest("[data-close]")) close(); });
    $("#prod-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = $("#pd-nombre").value.trim().replace(/\s+/g, " "), precio = parseNum($("#pd-precio").value);
      const costoRaw = $("#pd-costo").value.trim(), costo = costoRaw === "" ? null : parseNum(costoRaw), unidad = $("#pd-unidad").value;
      const minRaw = $("#pd-min").value.trim(), stockMin = minRaw === "" ? null : parseNum(minRaw);
      const errs = [];
      if (!nombre) errs.push("Escribe el nombre del producto.");
      if (db.productos.some((x) => x.id !== id && x.nombre.toLowerCase() === nombre.toLowerCase())) errs.push("Ya existe un producto con ese nombre.");
      if (isNaN(precio) || precio < 0) errs.push("El precio debe ser un número igual o mayor a 0 (usa coma o punto para los centavos).");
      if (costo !== null && (isNaN(costo) || costo < 0)) errs.push("El costo debe ser un número igual o mayor a 0, o déjalo vacío.");
      if (stockMin !== null && (isNaN(stockMin) || stockMin < 0)) errs.push("El stock mínimo debe ser un número igual o mayor a 0, o déjalo vacío.");
      if (errs.length) { $("#pd-err").innerHTML = errs.map((x) => `<div class="note bad">${esc(x)}</div>`).join(""); return; }
      if (id) {
        const before = { precio: p.precio, costo: p.costo };
        Object.assign(p, { nombre, precio: round2(precio), costo: costo === null ? null : round2(costo), unidad, stockMin, ejemplo: false });
        audit("Producto editado", `${nombre}: precio ${fmt.money(before.precio)} → ${fmt.money(p.precio)}, costo ${rules.hasCost(before.costo) ? fmt.money(before.costo) : "—"} → ${rules.hasCost(p.costo) ? fmt.money(p.costo) : "—"}`);
      } else {
        db.productos.push({ id: uid(), nombre, precio: round2(precio), costo: costo === null ? null : round2(costo), unidad, stockMin, activo: true });
        audit("Producto creado", `${nombre} a ${fmt.money(precio)}`);
      }
      save(); close(); render(); toast(id ? "Producto guardado" : "Producto creado");
    });
    $("#pd-nombre", ov).focus();
  }

  /* ---------- Reportes ---------- */
  function viewReportes() {
    const list = db.reportes
      .filter((r) => r.tipo === "VENTAS" && (ui.repLocal === "todos" || r.localId === ui.repLocal))
      .sort((a, b) => b.hasta.localeCompare(a.hasta) || a.localId.localeCompare(b.localId));
    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Propuesta · por producto</span><h1>Ventas</h1><p>Cada venta con sus productos, como una factura. Lo vendido se resta del inventario del local.</p></div>
      ${isAdmin() ? `<button class="btn primary" data-act="rep-new">${ICON.plus} Registrar nueva venta</button>` : ""}
    </div>
    <div class="toolbar">
      <div class="segmented" role="group" aria-label="Local">${[["todos", "Todos"], ...db.locales.map((l) => [l.id, l.nombre])].map(([k, x]) => `<button class="seg" aria-pressed="${ui.repLocal === k}" data-replocal="${k}">${esc(x)}</button>`).join("")}</div>
    </div>
    <section class="card">
    ${list.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Local</th><th class="hide-sm">Productos</th><th class="r">Unidades</th><th class="r">Total</th><th class="r hide-sm">Ganancia</th></tr></thead>
      <tbody>${list.map((r) => { const t = reportTotals(r); return `<tr class="click" data-open="${r.id}" tabindex="0">
        <td class="num" style="white-space:nowrap">${fmt.date(r.hasta)}${r.estado === "BORRADOR" ? ' <span class="pill warn">Borrador</span>' : ""}</td><td><b>${esc(local(r.localId).nombre)}</b></td>
        <td class="muted hide-sm">${esc(r.lineas.slice(0, 3).map((l) => producto(l.productoId)?.nombre || "—").join(", "))}${r.lineas.length > 3 ? ` y ${r.lineas.length - 3} más` : ""}</td>
        <td class="r num">${fmt.int(t.unidades)}</td><td class="r num"><b>${fmt.money(t.ventas)}</b></td><td class="r num hide-sm">${t.ventasConCosto ? fmt.money(t.margen) : "—"}</td></tr>`; }).join("")}</tbody></table></div>`
      : `<div class="empty">No hay ventas registradas.${isAdmin() ? " Registra la primera con «Registrar nueva venta»." : ""}</div>`}
    </section>`;
  }
  const blankLine = () => ({ productoId: "", cantidad: "", precio: "", costo: null });
  function newDraft(base) {
    if (base) return JSON.parse(JSON.stringify(base));
    const t = today();
    return { id: null, localId: ui.repLocal && ui.repLocal !== "todos" ? ui.repLocal : "", tipo: "VENTAS", desde: t, hasta: t, totalDeclarado: "", estado: "BORRADOR", obs: "", lineas: [blankLine()] };
  }
  function viewEditor() {
    const d = ui.draft;
    const active = db.productos.filter((p) => p.activo || d.lineas.some((l) => l.productoId === p.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const show = (v) => (v === "" || v === null || v === undefined || (typeof v === "number" && isNaN(v)) ? "" : esc(String(v).replace(".", ",")));
    return `
    <div class="page-head">
      <div class="lead"><button class="btn ghost back" data-act="rep-cancel">${ICON.back} Ventas</button><h1>${d.id ? "Editar venta" : "Registrar nueva venta"}</h1><p>Como llenar una factura: el local, la fecha y los productos que se llevaron.</p></div>
    </div>
    <section class="card" style="display:grid;gap:14px">
      <div class="grid2">
        <div class="field"><label for="ed-local">Local</label><select class="input" id="ed-local" data-draft="localId"><option value="">Elige un local</option>${db.locales.map((l) => `<option value="${l.id}" ${d.localId === l.id ? "selected" : ""}>${esc(l.nombre)}</option>`).join("")}</select></div>
        <div class="field"><label for="ed-fecha">Fecha</label><input class="input" type="date" id="ed-fecha" data-draft="fecha" value="${d.hasta}" max="${today()}"></div>
      </div>
    </section>
    <section class="card" style="display:grid;gap:12px">
      <div class="card-head" style="margin:0"><div><h2>Productos vendidos</h2><p class="muted small">El precio se llena con el del producto; cámbialo si se vendió a otro precio.</p></div></div>
      <div class="lines">
        <div class="line line-head"><span>Producto</span><span>Cantidad</span><span>Precio</span><span style="text-align:right">Subtotal</span><span></span></div>
        ${d.lineas.map((l, i) => `<div class="line">
          <select class="input" data-line="${i}" data-k="productoId" aria-label="Producto, línea ${i + 1}"><option value="">Elige producto</option>${active.map((p) => `<option value="${p.id}" ${l.productoId === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select>
          <input class="input num" inputmode="decimal" data-line="${i}" data-k="cantidad" value="${show(l.cantidad)}" placeholder="Cantidad" aria-label="Cantidad, línea ${i + 1}">
          <input class="input num" inputmode="decimal" data-line="${i}" data-k="precio" value="${show(l.precio)}" placeholder="Precio" aria-label="Precio, línea ${i + 1}">
          <span class="sub" data-sub="${i}">${fmt.money(rules.lineTotal(l))}</span>
          <button class="icon-btn" type="button" data-delline="${i}" aria-label="Quitar línea ${i + 1}">${ICON.x}</button>
        </div>`).join("")}
      </div>
      <div><button class="btn" type="button" data-act="line-add">${ICON.plus} Agregar producto</button></div>
    </section>
    <div class="two">
      <section class="card" style="display:grid;gap:14px">
        <div class="field"><label for="ed-obs">Observación</label><textarea class="input" id="ed-obs" rows="3" data-draft="obs" maxlength="500" placeholder="Opcional. Ej.: pedido de la señora Gómez">${esc(d.obs)}</textarea></div>
      </section>
      <section class="card" style="display:grid;gap:14px" id="ed-summary">${editorSummary(d)}</section>
    </div>
    <div id="ed-err" class="errors"></div>
    <div class="actions"><button class="btn ghost" data-act="rep-cancel">Cancelar</button><button class="btn primary" data-act="rep-confirm">${ICON.check} Guardar venta</button></div>`;
  }
  function editorSummary(d) {
    const t = reportTotals(d), c = cuadre(d), mp = t.ventasConCosto ? t.margen / t.ventasConCosto : NaN;
    return `<h2>Total de la venta</h2><div class="totals num">
      <div><span class="muted">Total</span><span class="big">${fmt.money(t.ventas)}</span></div>
      <div><span class="muted">Costo de lo vendido</span><span>${fmt.money(t.costo)}</span></div>
      <div><span class="muted">Ganancia (ventas − costos)</span><span style="color:var(--good);font-weight:800">${fmt.money(t.margen)} · ${fmt.pct(mp)}</span></div>
      <div><span class="muted">Unidades</span><span>${fmt.int(t.unidades)}</span></div></div>
      ${stockWarnings(d)}`;
  }
  /** Avisa si una venta deja el inventario del local en negativo (no bloquea: la venta ya ocurrió). */
  function stockWarnings(d) {
    if (!d.localId) return "";
    const w = [];
    for (const l of d.lineas) {
      if (!l.productoId || l.cantidad === "" || isNaN(l.cantidad)) continue;
      const s = rules.stockAt(db, d.localId, l.productoId, d.hasta, d.id);
      if (s.tracked && Number(l.cantidad) > s.qty) w.push(`${esc(producto(l.productoId)?.nombre)}: se vendieron ${fmt.int(l.cantidad)} y en inventario hay ${fmt.int(s.qty)}`);
    }
    return `<div class="note info">Al guardar, lo vendido se resta del inventario de ${esc(local(d.localId).nombre)}.</div>` + (w.length ? `<div class="note"><b>Revisa las entradas:</b><br>${w.join("<br>")}</div>` : "");
  }
  function viewDetalle() {
    const r = db.reportes.find((x) => x.id === ui.viewId);
    if (!r) { ui.viewId = null; return viewReportes(); }
    const t = reportTotals(r), c = cuadre(r), mp = t.ventasConCosto ? t.margen / t.ventasConCosto : NaN;
    return `
    <div class="page-head">
      <div class="lead"><button class="btn ghost back" data-act="det-back">${ICON.back} Ventas</button><h1>Venta · ${esc(local(r.localId).nombre)} · ${fmt.date(r.hasta)}</h1>
        <div class="chips">${r.estado === "BORRADOR" ? statePill(r) : ""} ${r.ejemplo ? '<span class="pill neutral plain">Ejemplo</span>' : ""}</div></div>
      ${isAdmin() ? `<div class="actions"><button class="btn danger" data-act="det-delete">Eliminar venta</button><button class="btn primary" data-act="det-edit">Editar venta</button></div>` : ""}
    </div>
    ${ui.reopen ? `<div class="confirm-box"><div class="field"><label for="ro-mot">¿Por qué se reabre este reporte?</label><input class="input" id="ro-mot" maxlength="200" placeholder="Ej.: el local corrigió la cantidad de pan de yuca"></div><div id="ro-err"></div><div class="actions"><button class="btn ghost" data-act="reopen-cancel">Cancelar</button><button class="btn primary" data-act="reopen-ok">Reabrir y editar</button></div><p class="muted small">El motivo queda en la actividad, con el total anterior.</p></div>` : ""}
    ${ui.confirmDelete ? `<div class="confirm-box"><span>¿Eliminar esta venta? Lo vendido vuelve al inventario y queda registrado en la actividad.</span><div class="actions"><button class="btn ghost" data-act="del-cancel">Cancelar</button><button class="btn primary" data-act="del-ok">Eliminar</button></div></div>` : ""}
    <section class="kpis">
      <div class="kpi hero"><span class="eyebrow">Total de la venta</span><span class="val num">${fmt.money(t.ventas)}</span><span class="sub">${fmt.int(t.unidades)} unidades</span></div>
      <div class="kpi"><span class="eyebrow">Costo</span><span class="val num">${fmt.money(t.costo)}</span></div>
      <div class="kpi"><span class="eyebrow">Ganancia</span><span class="val num good">${fmt.money(t.margen)}</span><span class="sub">${fmt.pct(mp)}</span></div>
      <div class="kpi"><span class="eyebrow">Productos</span><span class="val num">${r.lineas.length}</span><span class="sub">${fmt.date(r.hasta)}</span></div>
    </section>
    <section class="card"><div class="table-wrap"><table>
      <thead><tr><th>Producto</th><th class="r">Cantidad</th><th class="r">Precio</th><th class="r">Subtotal</th><th class="r hide-sm">Costo unit.</th><th class="r">Ganancia</th></tr></thead>
      <tbody>${r.lineas.map((l) => { const has = rules.hasCost(l.costo), st = rules.lineTotal(l); return `<tr><td><b>${esc(producto(l.productoId)?.nombre || "—")}</b></td><td class="r num">${fmt.int(l.cantidad)}</td><td class="r num">${fmt.money(l.precio)}</td><td class="r num"><b>${fmt.money(st)}</b></td><td class="r num hide-sm">${has ? fmt.money(l.costo) : "—"}</td><td class="r num">${has ? fmt.money(st - l.cantidad * l.costo) : "—"}</td></tr>`; }).join("")}</tbody>
    </table></div></section>
    ${r.obs ? `<section class="card"><h3>Observaciones</h3><p class="muted" style="margin-top:6px">${esc(r.obs)}</p></section>` : ""}`;
  }
  function saveDraft(confirm) {
    if (!isAdmin()) return;
    const d = ui.draft;
    let omitidos = 0;
    if (d.tipo === "INVENTARIO") {
      // En un conteo, un producto cargado pero sin cantidad se toma como "no contado"
      const antes = d.lineas.length;
      d.lineas = d.lineas.filter((l) => !(l.productoId && l.cantidad === ""));
      omitidos = antes - d.lineas.length;
      ui.omitidos = omitidos;
    }
    d.lineas = d.lineas.filter((l) => l.productoId || l.cantidad !== "");
    if (!d.lineas.length) d.lineas.push(blankLine());
    const errs = rules.validateReport(d, db, confirm);
    const box = $("#ed-err");
    if (errs.length) { box.innerHTML = errs.map((x) => `<div class="note bad" role="alert">${esc(x)}</div>`).join(""); box.scrollIntoView({ block: "center" }); return; }
    if (d.tipo === "INVENTARIO") return saveInventory(d, confirm);
    if (d.tipo === "ENTRADA" || d.tipo === "PERDIDA") return saveMovement(d);
    const c = cuadre(d);
    if (confirm && c.estado === "dif" && !d._aceptaDif) {
      box.innerHTML = `<div class="confirm-box"><span><b>El reporte no cuadra (diferencia ${fmt.signedMoney(c.dif)}).</b> ¿Confirmarlo de todas formas? Quedará marcado para revisar.</span><div class="actions"><button class="btn ghost" type="button" id="dif-no">Revisar primero</button><button class="btn primary" type="button" id="dif-si">Confirmar igual</button></div></div>`;
      $("#dif-no").onclick = () => { box.innerHTML = ""; };
      $("#dif-si").onclick = () => { d._aceptaDif = true; saveDraft(true); };
      box.scrollIntoView({ block: "center" });
      return;
    }
    delete d._aceptaDif;
    const clean = {
      ...d,
      lineas: d.lineas.filter((l) => l.productoId).map((l) => ({ productoId: l.productoId, cantidad: Number(l.cantidad) || 0, precio: round2(Number(l.precio) || 0), costo: rules.hasCost(l.costo) ? l.costo : null })),
      totalDeclarado: "", desde: d.hasta,
      estado: confirm ? "CONFIRMADO" : "BORRADOR", ejemplo: false,
    };
    const t = reportTotals(clean);
    if (clean.id) db.reportes[db.reportes.findIndex((x) => x.id === clean.id)] = clean;
    else { clean.id = uid(); clean.creado = util.now(); db.reportes.push(clean); }
    const editada = !!d.id && db.reportes.some((x) => x.id === d.id);
    audit(editada ? "Venta editada" : "Venta registrada", `${local(clean.localId).nombre} · ${fmt.date(clean.hasta)} · ${fmt.money(t.ventas)} · ${clean.lineas.length} producto${clean.lineas.length === 1 ? "" : "s"}`);
    save(); ui.draft = null; ui.viewId = clean.id; render(); toast(editada ? "Venta guardada" : "Venta registrada");
  }

  /* ---------- Inventario ---------- */
  const STATE = {
    ok: '<span class="pill good">Bien</span>', bajo: '<span class="pill warn">Bajo mínimo</span>',
    agotado: '<span class="pill bad">Agotado</span>', negativo: '<span class="pill bad" title="Hay más salidas que entradas registradas">Revisar</span>',
    sin: '<span class="pill neutral">Sin movimientos</span>',
  };
  const RANK = { negativo: 4, agotado: 3, bajo: 2, ok: 1, sin: 0 };
  const MOV = {
    ENTRADA: { label: "Entrada", pill: "good", sign: "+" }, PERDIDA: { label: "Pérdida", pill: "bad", sign: "−" },
    VENTAS: { label: "Venta", pill: "gold", sign: "−" }, INVENTARIO: { label: "Conteo físico", pill: "neutral", sign: "=" },
  };
  const ROUTE_OF = { VENTAS: "reportes", INVENTARIO: "inventario", ENTRADA: "inventario", PERDIDA: "perdidas", ROL: "personal" };
  const monthRange = () => { const t = today(), d = new Date(t + "T12:00:00"); return [iso(new Date(d.getFullYear(), d.getMonth(), 1)), t]; };

  /** Existencia actual de cada producto en cada local. */
  function stockTable(locs) {
    return db.productos.map((p) => ({ p, per: locs.map((l) => { const s = rules.stockAt(db, l.id, p.id); return { l, ...s, st: s.tracked ? rules.stockState(s.qty, p.stockMin) : "sin" }; }) }));
  }
  /** Alertas de stock de los 3 locales (para el panel). */
  function stockAlerts() {
    const out = { bajo: 0, agotado: 0, negativo: 0, bajoList: [], agotadoList: [], negList: [] };
    for (const row of stockTable(db.locales)) {
      if (!row.p.activo) continue;
      for (const x of row.per) {
        const name = `${row.p.nombre} (${x.l.nombre})`;
        if (x.st === "agotado") { out.agotado++; out.agotadoList.push(name); }
        if (x.st === "bajo") { out.bajo++; out.bajoList.push(name); }
        if (x.st === "negativo") { out.negativo++; out.negList.push(name); }
      }
    }
    const short = (a) => esc(a.slice(0, 3).join(", ")) + (a.length > 3 ? ` y ${a.length - 3} más` : "");
    out.bajoTxt = short(out.bajoList); out.agotadoTxt = short(out.agotadoList); out.negTxt = short(out.negList);
    return out;
  }
  function deltaTxt(q, pq) {
    if (q === null || pq === null || q === undefined || pq === undefined) return "";
    const d = round2(q - pq); if (!d) return '<span class="muted small">igual</span>';
    return `<span class="small delta ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${fmt.int(Math.abs(d))}</span>`;
  }
  function movSummaryTxt(r) {
    if (r.tipo === "ENTRADA") return r.subtipo === "COMPRA" ? `Compra · ${esc(r.proveedor || "proveedor")}` : "Producción propia";
    if (r.tipo === "PERDIDA") { const m = [...new Set(r.lineas.map((l) => l.motivo))]; return esc(m.slice(0, 2).join(", ") + (m.length > 2 ? "…" : "")); }
    if (r.tipo === "VENTAS") return `Reporte del ${fmt.period(r.desde, r.hasta)}`;
    return esc(r.obs || "Conteo de existencias");
  }

  /** Pestañas internas de Inventario y acciones comunes. */
  function invTabs(active) {
    return `<nav class="subtabs" aria-label="Inventario"><a href="#inventario" ${active === "inventario" ? 'aria-current="page"' : ""}>${ICON.inventario}Existencias y movimientos</a><a href="#perdidas" ${active === "perdidas" ? 'aria-current="page"' : ""}>${ICON.perdidas}Pérdidas</a></nav>`;
  }
  const invActions = () => (isAdmin() ? `<div class="actions"><button class="btn" data-act="inv-new">Conteo físico</button><button class="btn" data-act="mov-new" data-movtipo="PERDIDA">Registrar pérdida</button><button class="btn primary" data-act="mov-new" data-movtipo="ENTRADA">${ICON.plus} Registrar entrada</button></div>` : "");
  function viewInventario() {
    const locs = db.locales;
    const shown = ui.invLocal === "todos" ? locs : locs.filter((l) => l.id === ui.invLocal);
    const one = shown.length === 1;
    const mes = monthRange();
    const sums = one ? rules.movementSums(db, shown[0].id, mes) : null;
    let valor = 0, bajo = 0, agotado = 0, neg = 0;
    const rows = stockTable(shown)
      .filter((r) => r.p.activo || r.per.some((x) => x.tracked && x.qty))
      .sort((a, b) => a.p.nombre.localeCompare(b.p.nombre, "es"))
      .map((r) => {
        r.v = 0;
        for (const x of r.per) {
          if (x.st === "bajo") bajo++; if (x.st === "agotado") agotado++; if (x.st === "negativo") neg++;
          if (x.qty > 0 && rules.hasCost(r.p.costo)) r.v += x.qty * r.p.costo;
        }
        valor += r.v;
        r.worst = r.per.reduce((w, x) => (RANK[x.st] > RANK[w] ? x.st : w), "sin");
        return r;
      })
      .filter((r) => ui.invEstado === "todos" || ["bajo", "agotado", "negativo"].includes(r.worst));
    const entradasMes = db.reportes.filter((r) => r.tipo === "ENTRADA" && r.estado === "CONFIRMADO" && r.hasta >= mes[0] && shown.some((l) => l.id === r.localId)).reduce((a, r) => a + rules.movTotals(r).valor, 0);
    const movs = db.reportes
      .filter((r) => (ui.invMov === "todos" ? ["ENTRADA", "PERDIDA", "INVENTARIO"].includes(r.tipo) : r.tipo === ui.invMov) && (ui.invLocal === "todos" || r.localId === ui.invLocal))
      .sort((a, b) => b.hasta.localeCompare(a.hasta) || (b.creado || "").localeCompare(a.creado || ""));
    const lim = ui.movLimit || 25;
    const hasProducts = db.productos.length > 0;
    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Existencias por local</span><h1>Inventario</h1><p>Entradas suman, ventas confirmadas y pérdidas restan. Cada local lleva su propio inventario.</p></div>
      ${invActions()}
    </div>
    ${invTabs("inventario")}
    <div class="toolbar">
      <div class="segmented" role="group" aria-label="Local">${[["todos", "Los 3 locales"], ...locs.map((l) => [l.id, l.nombre])].map(([k, x]) => `<button class="seg" aria-pressed="${ui.invLocal === k}" data-invlocal="${k}">${esc(x)}</button>`).join("")}</div>
      <div class="segmented" role="group" aria-label="Mostrar">${[["todos", "Todos los productos"], ["alerta", "Solo alertas"]].map(([k, x]) => `<button class="seg" aria-pressed="${ui.invEstado === k}" data-investado="${k}">${x}</button>`).join("")}</div>
    </div>
    <section class="kpis" aria-label="Resumen de inventario">
      <div class="kpi hero"><span class="eyebrow">Valor del inventario</span><span class="val num" data-count="${round2(valor)}" data-fmt="money">${fmt.money(valor)}</span><span class="sub">Existencias × costo de cada producto</span></div>
      <div class="kpi"><span class="eyebrow">Bajo el mínimo</span><span class="val num" style="color:var(--warn)" data-count="${bajo}" data-fmt="int">${bajo}</span><span class="sub">Productos por reponer</span></div>
      <div class="kpi"><span class="eyebrow">Agotados</span><span class="val num" style="color:var(--bad)" data-count="${agotado + neg}" data-fmt="int">${agotado + neg}</span><span class="sub">${neg ? `${neg} con más salidas que entradas` : "Existencia en cero"}</span></div>
      <div class="kpi"><span class="eyebrow">Entradas del mes</span><span class="val num" data-count="${round2(entradasMes)}" data-fmt="money">${fmt.money(entradasMes)}</span><span class="sub">Producción y compras, a costo</span></div>
    </section>
    ${!hasProducts ? `<section class="card welcome"><div><span class="eyebrow">Inventario</span><h2 style="margin-top:4px">Primero crea tus productos</h2></div><p class="muted">El inventario se lleva por producto y por local. Crea los productos y luego registra la primera entrada de cada local.</p>${isAdmin() ? '<div><a class="btn primary" href="#productos">Ir a Productos</a></div>' : ""}</section>` : `
    <section class="card" aria-label="Existencias">
      <div class="card-head"><div><h2>Existencias actuales</h2><p class="muted small">${one ? `${esc(shown[0].nombre)} · movimiento de este mes por producto` : "Cada local por separado: los datos no se mezclan"}</p></div>
        <div class="legend"><span><i style="background:var(--good)"></i>Bien</span><span><i style="background:var(--warn)"></i>Bajo mínimo</span><span><i style="background:var(--bad)"></i>Agotado</span></div></div>
      ${rows.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Producto</th>${one ? `<th class="r">Existencia</th><th class="r hide-sm">Entradas mes</th><th class="r hide-sm">Ventas mes</th><th class="r hide-sm">Pérdidas mes</th><th class="r hide-sm">Mínimo</th>` : shown.map((l) => `<th class="r">${esc(l.nombre)}</th>`).join("")}<th class="r">Valor</th><th>Estado</th></tr></thead>
        <tbody>${rows.map((r) => { const m = sums && (sums.get(r.p.id) || { entradas: 0, ventas: 0, perdidas: 0 }); return `<tr><td style="white-space:nowrap"><b>${esc(r.p.nombre)}</b>${!one && r.p.stockMin ? `<br><span class="muted small">mínimo ${fmt.int(r.p.stockMin)}</span>` : ""}</td>
          ${one ? `<td class="r num"><span class="stock ${r.per[0].st}">${r.per[0].tracked ? fmt.int(r.per[0].qty) : "—"}</span></td>
              <td class="r num hide-sm" style="color:var(--good)">${m.entradas ? "+" + fmt.int(m.entradas) : "—"}</td><td class="r num hide-sm">${m.ventas ? "−" + fmt.int(m.ventas) : "—"}</td><td class="r num hide-sm" style="color:var(--bad)">${m.perdidas ? "−" + fmt.int(m.perdidas) : "—"}</td><td class="r num hide-sm">${r.p.stockMin ? fmt.int(r.p.stockMin) : "—"}</td>`
            : r.per.map((x) => `<td class="r num"><span class="stock ${x.st}">${x.tracked ? fmt.int(x.qty) : "—"}</span></td>`).join("")}
          <td class="r num">${r.v ? fmt.money(r.v) : "—"}</td><td>${STATE[r.worst]}</td></tr>`; }).join("")}</tbody></table></div>`
        : `<div class="empty">${ui.invEstado === "alerta" ? "Ningún producto con alertas." : "Todavía no hay movimientos."}</div>`}
      <p class="muted small" style="margin-top:12px">Existencia = entradas − ventas confirmadas − pérdidas. Si registras un conteo físico, la existencia se ajusta a lo contado y la diferencia queda guardada.</p>
    </section>`}
    <section class="card" aria-label="Movimientos">
      <div class="card-head"><div><h2>Movimientos</h2><p class="muted small">Todo lo que entró, salió o se contó</p></div>
        <div class="segmented" role="group" aria-label="Tipo de movimiento">${[["todos", "Todos"], ["ENTRADA", "Entradas"], ["PERDIDA", "Pérdidas"], ["INVENTARIO", "Conteos"], ["VENTAS", "Ventas"]].map(([k, x]) => `<button class="seg" aria-pressed="${ui.invMov === k}" data-invmov="${k}">${x}</button>`).join("")}</div></div>
      ${movs.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Fecha</th><th>Local</th><th>Movimiento</th><th class="hide-sm">Detalle</th><th class="r">Unidades</th><th class="r">Valor</th><th>Estado</th></tr></thead>
        <tbody>${movs.slice(0, lim).map((r) => { const mt = r.tipo === "VENTAS" ? { unidades: reportTotals(r).unidades, valor: reportTotals(r).ventas } : r.tipo === "INVENTARIO" ? rules.inventoryTotals(r, db) : rules.movTotals(r); return `<tr class="click" data-open="${r.id}" data-route="${ROUTE_OF[r.tipo]}" tabindex="0">
          <td class="num" style="white-space:nowrap">${fmt.short(r.hasta)}</td><td style="white-space:nowrap"><b>${esc(local(r.localId).nombre)}</b></td>
          <td><span class="pill ${MOV[r.tipo].pill} plain">${MOV[r.tipo].label}</span></td><td class="hide-sm muted">${movSummaryTxt(r)}</td>
          <td class="r num">${MOV[r.tipo].sign === "=" ? "" : MOV[r.tipo].sign}${fmt.int(mt.unidades)}</td><td class="r num">${fmt.money(mt.valor)}</td><td>${statePill(r)}</td></tr>`; }).join("")}</tbody></table></div>
        ${movs.length > lim ? `<div style="text-align:center;margin-top:12px"><button class="btn" data-act="mov-more">Ver ${Math.min(25, movs.length - lim)} más</button></div>` : ""}`
        : `<div class="empty">Sin movimientos registrados.</div>`}
    </section>`;
  }

  /* --- Entradas y pérdidas --- */
  function newMovDraft(tipo) {
    const t = today(), loc = ui.invLocal !== "todos" ? ui.invLocal : ui.perdLocal !== "todos" ? ui.perdLocal : "";
    return { id: null, tipo, subtipo: "PRODUCCION", proveedor: "", factura: "", actualizarCosto: true, localId: loc, desde: t, hasta: t, totalDeclarado: "", estado: "BORRADOR", obs: "", lineas: [blankLine()] };
  }
  function movLineValue(l) {
    const q = Number(l.cantidad);
    if (!l.productoId || l.cantidad === "" || isNaN(q)) return '<span class="muted">—</span>';
    return rules.hasCost(l.costo) ? fmt.money(q * l.costo) : '<span class="muted small">sin costo</span>';
  }
  function movSummary(d) {
    const t = rules.movTotals(d), warns = [];
    if (d.tipo === "PERDIDA" && d.localId) for (const l of d.lineas) {
      if (!l.productoId || l.cantidad === "" || isNaN(l.cantidad)) continue;
      const s = rules.stockAt(db, d.localId, l.productoId, d.hasta, d.id);
      if (s.tracked && Number(l.cantidad) > s.qty) warns.push(`${esc(producto(l.productoId)?.nombre)}: pierdes ${fmt.int(l.cantidad)} y en inventario hay ${fmt.int(s.qty)}`);
    }
    return `<h2>Resumen</h2><div class="totals num">
      <div><span class="muted">${d.tipo === "PERDIDA" ? "Valor perdido (a costo)" : "Valor que entra (a costo)"}</span><span class="big" style="color:${d.tipo === "PERDIDA" ? "var(--bad)" : "var(--ink)"}">${fmt.money(t.valor)}</span></div>
      <div><span class="muted">Productos</span><span>${t.productos}</span></div>
      <div><span class="muted">Unidades</span><span>${fmt.int(t.unidades)}</span></div></div>
      ${d.tipo === "PERDIDA" ? `<div class="note info">Se resta del inventario de ${d.localId ? esc(local(d.localId).nombre) : "este local"} y baja la ganancia del panel. No cuenta como venta.</div>` : `<div class="note info">Se suma al inventario de ${d.localId ? esc(local(d.localId).nombre) : "este local"}.</div>`}
      ${warns.length ? `<div class="note">${warns.join("<br>")}</div>` : ""}
      ${t.sinCosto ? `<div class="note">${t.sinCosto} producto${t.sinCosto > 1 ? "s" : ""} sin costo no suma${t.sinCosto > 1 ? "n" : ""} al valor.</div>` : ""}`;
  }
  function viewMovEditor() {
    const d = ui.draft, perd = d.tipo === "PERDIDA";
    const active = db.productos.filter((p) => p.activo || d.lineas.some((l) => l.productoId === p.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const show = (v) => (v === "" || v === null || v === undefined || (typeof v === "number" && isNaN(v)) ? "" : esc(String(v).replace(".", ",")));
    const back = route() === "perdidas" ? "Pérdidas" : "Inventario";
    return `
    <div class="page-head">
      <div class="lead"><button class="btn ghost back" data-act="rep-cancel">${ICON.back} ${back}</button><h1>${perd ? (d.id ? "Editar pérdida" : "Registrar pérdida") : d.id ? "Editar entrada" : "Registrar entrada"}</h1>
        <p>${perd ? "Producto que se dañó, venció, se rompió o se regaló: sale del inventario sin ser venta." : "Producción del local o mercadería comprada a un proveedor."}</p></div>
    </div>
    <section class="card" style="display:grid;gap:14px">
      ${perd ? "" : `<div class="field"><span class="lbl">Tipo de entrada</span><div class="segmented" role="group" aria-label="Tipo de entrada">${[["PRODUCCION", "Producción propia"], ["COMPRA", "Compra a proveedor"]].map(([k, x]) => `<button class="seg" type="button" aria-pressed="${d.subtipo === k}" data-subtipo="${k}">${x}</button>`).join("")}</div></div>`}
      <div class="grid2">
        <div class="field"><label for="ed-local">Local</label><select class="input" id="ed-local" data-draft="localId"><option value="">Elige un local</option>${db.locales.map((l) => `<option value="${l.id}" ${d.localId === l.id ? "selected" : ""}>${esc(l.nombre)} · ${esc(l.tipo)}</option>`).join("")}</select></div>
        <div class="field"><label for="ed-fecha">Fecha</label><input class="input" type="date" id="ed-fecha" data-draft="fecha" value="${d.hasta}" max="${today()}"></div>
      </div>
      ${!perd && d.subtipo === "COMPRA" ? `<div class="grid2">
        <div class="field"><label for="ed-prov">Proveedor</label><input class="input" id="ed-prov" data-draft="proveedor" value="${esc(d.proveedor)}" placeholder="Ej.: Distribuidora Andina" maxlength="80" list="prov-list"><datalist id="prov-list">${[...new Set(db.reportes.filter((r) => r.proveedor).map((r) => r.proveedor))].map((x) => `<option value="${esc(x)}">`).join("")}</datalist></div>
        <div class="field"><label for="ed-fact">N.º de factura <span class="muted">(opcional)</span></label><input class="input" id="ed-fact" data-draft="factura" value="${esc(d.factura)}" placeholder="001-001-000123" maxlength="40"></div>
      </div>` : ""}
      <div class="chips"><span class="muted small">Atajos:</span><button class="chip" type="button" data-quick="hoy">Hoy</button><button class="chip" type="button" data-quick="ayer">Ayer</button></div>
    </section>
    <section class="card" style="display:grid;gap:12px">
      <div class="card-head" style="margin:0"><div><h2>${perd ? "Productos perdidos" : "Productos que entran"}</h2><p class="muted small">${perd ? "Indica el motivo de cada uno." : "El costo se llena con el del producto; cámbialo si esta vez costó distinto."}</p></div></div>
      <div class="lines">
        <div class="line mov line-head"><span>Producto</span><span>Cantidad</span><span>${perd ? "Motivo" : "Costo unitario"}</span><span style="text-align:right">Valor</span><span></span></div>
        ${d.lineas.map((l, i) => `<div class="line mov">
          <select class="input" data-line="${i}" data-k="productoId" aria-label="Producto, línea ${i + 1}"><option value="">Elige producto</option>${active.map((p) => `<option value="${p.id}" ${l.productoId === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select>
          <input class="input num" inputmode="decimal" data-line="${i}" data-k="cantidad" value="${show(l.cantidad)}" placeholder="Cantidad" aria-label="Cantidad, línea ${i + 1}">
          ${perd ? `<select class="input" data-line="${i}" data-k="motivo" aria-label="Motivo, línea ${i + 1}"><option value="">Motivo</option>${rules.MOTIVOS.map((m) => `<option ${l.motivo === m ? "selected" : ""}>${m}</option>`).join("")}</select>`
            : `<input class="input num" inputmode="decimal" data-line="${i}" data-k="costo" value="${show(l.costo)}" placeholder="Costo" aria-label="Costo unitario, línea ${i + 1}">`}
          <span class="sub" data-sub="${i}">${movLineValue(l)}</span>
          <button class="icon-btn" type="button" data-delline="${i}" aria-label="Quitar línea ${i + 1}">${ICON.x}</button>
        </div>`).join("")}
      </div>
      <div><button class="btn" type="button" data-act="line-add">${ICON.plus} Agregar producto</button></div>
      ${!perd && d.subtipo === "COMPRA" ? `<label class="check"><input type="checkbox" id="ed-upcost" ${d.actualizarCosto ? "checked" : ""}> Actualizar el costo de estos productos con el precio de esta compra</label>` : ""}
    </section>
    <div class="two">
      <section class="card" style="display:grid;gap:14px">
        <div class="field"><label for="ed-obs">Observaciones</label><textarea class="input" id="ed-obs" rows="4" data-draft="obs" maxlength="500" placeholder="${perd ? "Ej.: se cayó una caja de gaseosas" : "Ej.: producción del turno de la mañana"}">${esc(d.obs)}</textarea></div>
      </section>
      <section class="card" style="display:grid;gap:14px" id="ed-summary">${movSummary(d)}</section>
    </div>
    <div id="ed-err" class="errors"></div>
    <div class="actions"><button class="btn ghost" data-act="rep-cancel">Cancelar</button><button class="btn primary" data-act="rep-confirm">${perd ? "Registrar pérdida" : "Guardar entrada"}</button></div>`;
  }
  function viewMovDetalle() {
    const r = db.reportes.find((x) => x.id === ui.viewId);
    if (!r) { ui.viewId = null; return r && r.tipo === "PERDIDA" ? viewPerdidas() : viewInventario(); }
    const perd = r.tipo === "PERDIDA", t = rules.movTotals(r);
    const titulo = perd ? "Pérdida" : r.subtipo === "COMPRA" ? `Compra a ${esc(r.proveedor || "proveedor")}` : "Producción";
    return `
    <div class="page-head">
      <div class="lead"><button class="btn ghost back" data-act="det-back">${ICON.back} ${route() === "perdidas" ? "Pérdidas" : "Inventario"}</button><h1>${titulo} · ${esc(local(r.localId).nombre)} · ${fmt.date(r.hasta)}</h1>
        <div class="chips">${statePill(r)} <span class="pill ${MOV[r.tipo].pill} plain">${MOV[r.tipo].label}</span> ${r.factura ? `<span class="pill neutral plain">Factura ${esc(r.factura)}</span>` : ""} ${r.ejemplo ? '<span class="pill neutral plain">Ejemplo</span>' : ""}</div></div>
      ${isAdmin() ? (r.estado === "CONFIRMADO" ? `<button class="btn" data-act="det-reopen">Reabrir para corregir</button>` : `<div class="actions"><button class="btn danger" data-act="det-delete">Eliminar borrador</button><button class="btn primary" data-act="det-edit">Continuar editando</button></div>`) : ""}
    </div>
    ${r.estado !== "CONFIRMADO" ? `<div class="note">Está reabierto: no cuenta en el inventario hasta que lo guardes de nuevo.</div>` : ""}
    ${ui.reopen ? `<div class="confirm-box"><div class="field"><label for="ro-mot">¿Por qué se reabre?</label><input class="input" id="ro-mot" maxlength="200" placeholder="Ej.: la cantidad estaba mal"></div><div id="ro-err"></div><div class="actions"><button class="btn ghost" data-act="reopen-cancel">Cancelar</button><button class="btn primary" data-act="reopen-ok">Reabrir y editar</button></div></div>` : ""}
    ${ui.confirmDelete ? `<div class="confirm-box"><span>¿Eliminar este borrador? No se puede deshacer.</span><div class="actions"><button class="btn ghost" data-act="del-cancel">Cancelar</button><button class="btn primary" data-act="del-ok">Eliminar</button></div></div>` : ""}
    <section class="kpis">
      <div class="kpi hero"><span class="eyebrow">${perd ? "Valor perdido" : "Valor que entró"}</span><span class="val num">${fmt.money(t.valor)}</span><span class="sub">A costo de cada producto</span></div>
      <div class="kpi"><span class="eyebrow">Unidades</span><span class="val num">${fmt.int(t.unidades)}</span></div>
      <div class="kpi"><span class="eyebrow">Productos</span><span class="val num">${t.productos}</span></div>
      <div class="kpi"><span class="eyebrow">${perd ? "Efecto" : "Origen"}</span><span class="val val-name">${perd ? "Resta" : r.subtipo === "COMPRA" ? "Compra" : "Producción"}</span><span class="sub">${perd ? "Sale del inventario y baja la ganancia" : "Suma al inventario del local"}</span></div>
    </section>
    <section class="card"><div class="table-wrap"><table>
      <thead><tr><th>Producto</th><th class="r">Cantidad</th>${perd ? "<th>Motivo</th>" : ""}<th class="r">Costo unit.</th><th class="r">Valor</th></tr></thead>
      <tbody>${r.lineas.map((l) => { const has = rules.hasCost(l.costo), q = Number(l.cantidad) || 0; return `<tr><td><b>${esc(producto(l.productoId)?.nombre || "—")}</b></td><td class="r num">${MOV[r.tipo].sign}${fmt.int(q)}</td>${perd ? `<td>${esc(l.motivo || "—")}</td>` : ""}<td class="r num">${has ? fmt.money(l.costo) : "—"}</td><td class="r num"><b>${has ? fmt.money(q * l.costo) : "—"}</b></td></tr>`; }).join("")}</tbody>
    </table></div></section>
    ${r.obs ? `<section class="card"><h3>Observaciones</h3><p class="muted" style="margin-top:6px">${esc(r.obs)}</p></section>` : ""}`;
  }
  function saveMovement(d) {
    const clean = {
      ...d,
      lineas: d.lineas.filter((l) => l.productoId).map((l) => {
        const o = { productoId: l.productoId, cantidad: Number(l.cantidad) || 0, costo: rules.hasCost(l.costo) ? round2(Number(l.costo)) : null };
        if (d.tipo === "PERDIDA") o.motivo = l.motivo;
        return o;
      }),
      proveedor: d.subtipo === "COMPRA" ? String(d.proveedor || "").trim() : "", factura: d.subtipo === "COMPRA" ? String(d.factura || "").trim() : "",
      totalDeclarado: "", estado: "CONFIRMADO", ejemplo: false,
    };
    if (d.tipo === "PERDIDA") { delete clean.subtipo; delete clean.proveedor; delete clean.factura; }
    delete clean.actualizarCosto;
    const t = rules.movTotals(clean);
    if (clean.id) db.reportes[db.reportes.findIndex((x) => x.id === clean.id)] = clean;
    else { clean.id = uid(); clean.creado = util.now(); db.reportes.push(clean); }
    if (d.tipo === "ENTRADA" && d.subtipo === "COMPRA" && d.actualizarCosto) {
      for (const l of clean.lineas) {
        const p = producto(l.productoId);
        if (p && l.costo !== null && l.costo !== p.costo) { audit("Costo actualizado por compra", `${p.nombre}: ${rules.hasCost(p.costo) ? fmt.money(p.costo) : "—"} → ${fmt.money(l.costo)}`); p.costo = l.costo; }
      }
    }
    const loc = local(clean.localId).nombre;
    if (d.tipo === "PERDIDA") audit("Pérdida registrada", `${loc} ${fmt.date(clean.hasta)} · ${fmt.int(t.unidades)} u. · ${fmt.money(t.valor)}`);
    else audit(clean.subtipo === "COMPRA" ? "Compra registrada" : "Producción registrada", `${loc} ${fmt.date(clean.hasta)} · ${clean.subtipo === "COMPRA" ? clean.proveedor + " · " : ""}${fmt.int(t.unidades)} u. · ${fmt.money(t.valor)}`);
    save(); ui.draft = null; ui.viewId = clean.id; render();
    toast(d.tipo === "PERDIDA" ? "Pérdida registrada" : "Entrada guardada");
  }

  /* --- Conteo físico --- */
  function newInvDraft() {
    const t = today();
    return { id: null, localId: ui.invLocal !== "todos" ? ui.invLocal : "", tipo: "INVENTARIO", desde: t, hasta: t, totalDeclarado: "", estado: "BORRADOR", obs: "", lineas: [blankLine()] };
  }
  function invLineValue(l, d) {
    const p = producto(l.productoId), q = Number(l.cantidad);
    if (!p || l.cantidad === "" || isNaN(q)) {
      if (p && d && d.localId) { const s = rules.stockAt(db, d.localId, p.id, d.hasta, d.id); return s.tracked ? `<span class="muted small">sistema: ${fmt.int(s.qty)}</span>` : '<span class="muted">—</span>'; }
      return '<span class="muted">—</span>';
    }
    const s = d && d.localId ? rules.stockAt(db, d.localId, p.id, d.hasta, d.id) : null;
    const dif = s && s.tracked ? round2(q - s.qty) : null;
    return `<span class="muted small">sistema ${s && s.tracked ? fmt.int(s.qty) : "—"}</span> ${dif === null ? "" : dif === 0 ? '<span class="pill good plain">cuadra</span>' : `<span class="pill ${dif < 0 ? "bad" : "warn"} plain">${dif > 0 ? "+" : "−"}${fmt.int(Math.abs(dif))}</span>`}`;
  }
  function invSummary(d) {
    const t = rules.inventoryTotals(d, db);
    let faltan = 0, faltanV = 0, sobran = 0;
    if (d.localId) for (const l of d.lineas) {
      if (!l.productoId || l.cantidad === "" || isNaN(l.cantidad)) continue;
      const s = rules.stockAt(db, d.localId, l.productoId, d.hasta, d.id); if (!s.tracked) continue;
      const dif = Number(l.cantidad) - s.qty;
      if (dif < 0) { faltan += -dif; faltanV += -dif * (rules.hasCost(l.costo) ? l.costo : 0); } else sobran += dif;
    }
    return `<h2>Resumen</h2><div class="totals num">
      <div><span class="muted">Valor contado</span><span class="big">${fmt.money(t.valor)}</span></div>
      <div><span class="muted">Productos contados</span><span>${t.productos}</span></div>
      <div><span class="muted">Faltan frente al sistema</span><span style="color:var(--bad);font-weight:800">${fmt.int(faltan)} u. · ${fmt.money(faltanV)}</span></div>
      <div><span class="muted">Sobran frente al sistema</span><span style="font-weight:800">${fmt.int(sobran)} u.</span></div></div>
      <div class="note info">Al confirmar, la existencia de cada producto contado pasa a ser lo contado. Lo que falta suele ser pérdida que no se registró.</div>`;
  }
  function viewInvEditor() {
    const d = ui.draft;
    const active = db.productos.filter((p) => p.activo || d.lineas.some((l) => l.productoId === p.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const show = (v) => (v === "" || v === null || v === undefined || (typeof v === "number" && isNaN(v)) ? "" : esc(String(v).replace(".", ",")));
    return `
    <div class="page-head">
      <div class="lead"><button class="btn ghost back" data-act="rep-cancel">${ICON.back} Inventario</button><h1>${d.id ? "Editar conteo físico" : "Conteo físico"}</h1><p>Cuenta lo que hay en el local y compáralo con lo que dice el sistema.</p></div>
    </div>
    <section class="card" style="display:grid;gap:14px">
      <div class="grid2">
        <div class="field"><label for="ed-local">Local</label><select class="input" id="ed-local" data-draft="localId"><option value="">Elige un local</option>${db.locales.map((l) => `<option value="${l.id}" ${d.localId === l.id ? "selected" : ""}>${esc(l.nombre)} · ${esc(l.tipo)}</option>`).join("")}</select></div>
        <div class="field"><label for="ed-fecha">Fecha del conteo (al cierre)</label><input class="input" type="date" id="ed-fecha" data-draft="fecha" value="${d.hasta}" max="${today()}"></div>
      </div>
      <div class="chips"><span class="muted small">Atajos:</span><button class="chip" type="button" data-quick="hoy">Hoy</button><button class="chip" type="button" data-quick="ayer">Ayer</button></div>
    </section>
    <section class="card" style="display:grid;gap:12px">
      <div class="card-head" style="margin:0"><div><h2>Productos contados</h2><p class="muted small">Los productos que dejes vacíos no se tocan.</p></div>
        <div class="actions"><button class="btn" type="button" data-act="inv-fill">Cargar todos los productos</button></div></div>
      <div class="lines">
        <div class="line inv line-head"><span>Producto</span><span>Contado</span><span style="text-align:right">Diferencia</span><span></span></div>
        ${d.lineas.map((l, i) => `<div class="line inv">
          <select class="input" data-line="${i}" data-k="productoId" aria-label="Producto, línea ${i + 1}"><option value="">Elige producto</option>${active.map((p) => `<option value="${p.id}" ${l.productoId === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select>
          <input class="input num" inputmode="decimal" data-line="${i}" data-k="cantidad" value="${show(l.cantidad)}" placeholder="Cantidad" aria-label="Cantidad contada, línea ${i + 1}">
          <span class="sub" data-sub="${i}">${invLineValue(l, d)}</span>
          <button class="icon-btn" type="button" data-delline="${i}" aria-label="Quitar línea ${i + 1}">${ICON.x}</button>
        </div>`).join("")}
      </div>
      <div><button class="btn" type="button" data-act="line-add">${ICON.plus} Agregar producto</button></div>
    </section>
    <div class="two">
      <section class="card" style="display:grid;gap:14px">
        <div class="field"><label for="ed-obs">Observaciones</label><textarea class="input" id="ed-obs" rows="4" data-draft="obs" maxlength="500" placeholder="Ej.: conteo de fin de mes">${esc(d.obs)}</textarea></div>
      </section>
      <section class="card" style="display:grid;gap:14px" id="ed-summary">${invSummary(d)}</section>
    </div>
    <div id="ed-err" class="errors"></div>
    <div class="actions"><button class="btn ghost" data-act="rep-cancel">Cancelar</button><button class="btn" data-act="rep-save">Guardar borrador</button><button class="btn primary" data-act="rep-confirm">Confirmar conteo</button></div>`;
  }
  function viewInvDetalle() {
    const r = db.reportes.find((x) => x.id === ui.viewId);
    if (!r) { ui.viewId = null; return viewInventario(); }
    const t = rules.inventoryTotals(r, db);
    return `
    <div class="page-head">
      <div class="lead"><button class="btn ghost back" data-act="det-back">${ICON.back} Inventario</button><h1>Conteo físico · ${esc(local(r.localId).nombre)} · ${fmt.date(r.hasta)}</h1>
        <div class="chips">${statePill(r)} <span class="pill neutral plain">${esc(local(r.localId).tipo)}</span> ${r.ejemplo ? '<span class="pill neutral plain">Ejemplo</span>' : ""}</div></div>
      ${isAdmin() ? (r.estado === "CONFIRMADO" ? `<button class="btn" data-act="det-reopen">Reabrir para corregir</button>` : `<div class="actions"><button class="btn danger" data-act="det-delete">Eliminar borrador</button><button class="btn primary" data-act="det-edit">Continuar editando</button></div>`) : ""}
    </div>
    ${ui.reopen ? `<div class="confirm-box"><div class="field"><label for="ro-mot">¿Por qué se reabre este conteo?</label><input class="input" id="ro-mot" maxlength="200" placeholder="Ej.: el local recontó los cachitos"></div><div id="ro-err"></div><div class="actions"><button class="btn ghost" data-act="reopen-cancel">Cancelar</button><button class="btn primary" data-act="reopen-ok">Reabrir y editar</button></div></div>` : ""}
    ${ui.confirmDelete ? `<div class="confirm-box"><span>¿Eliminar este borrador? No se puede deshacer.</span><div class="actions"><button class="btn ghost" data-act="del-cancel">Cancelar</button><button class="btn primary" data-act="del-ok">Eliminar</button></div></div>` : ""}
    <section class="kpis">
      <div class="kpi hero"><span class="eyebrow">Valor contado</span><span class="val num">${fmt.money(t.valor)}</span><span class="sub">${fmt.int(t.unidades)} unidades</span></div>
      <div class="kpi"><span class="eyebrow">Productos contados</span><span class="val num">${t.productos}</span></div>
      <div class="kpi"><span class="eyebrow">Bajo el mínimo</span><span class="val num" style="color:var(--warn)">${t.bajo}</span></div>
      <div class="kpi"><span class="eyebrow">Agotados</span><span class="val num" style="color:var(--bad)">${t.agotado}</span></div>
    </section>
    <section class="card"><div class="table-wrap"><table>
      <thead><tr><th>Producto</th><th class="r">Según sistema</th><th class="r">Contado</th><th class="r">Diferencia</th><th class="r hide-sm">Valor</th><th>Estado</th></tr></thead>
      <tbody>${r.lineas.map((l) => { const p = producto(l.productoId), q = Number(l.cantidad) || 0, has = rules.hasCost(l.costo), s = rules.stockAt(db, r.localId, l.productoId, r.hasta, r.id); return `<tr><td><b>${esc(p?.nombre || "—")}</b></td>
        <td class="r num muted">${s.tracked ? fmt.int(s.qty) : "—"}</td><td class="r num"><b>${fmt.int(q)}</b></td><td class="r">${s.tracked ? deltaTxt(q, s.qty) : ""}</td>
        <td class="r num hide-sm">${has ? fmt.money(q * l.costo) : "—"}</td><td>${STATE[rules.stockState(q, p?.stockMin)]}</td></tr>`; }).join("")}</tbody>
    </table></div></section>
    ${r.obs ? `<section class="card"><h3>Observaciones</h3><p class="muted" style="margin-top:6px">${esc(r.obs)}</p></section>` : ""}`;
  }
  function saveInventory(d, confirm) {
    const clean = {
      ...d,
      lineas: d.lineas.filter((l) => l.productoId).map((l) => ({ productoId: l.productoId, cantidad: Number(l.cantidad) || 0, costo: rules.hasCost(l.costo) ? l.costo : null })),
      totalDeclarado: "", estado: confirm ? "CONFIRMADO" : "BORRADOR", ejemplo: false,
    };
    const t = rules.inventoryTotals(clean, db);
    if (clean.id) db.reportes[db.reportes.findIndex((x) => x.id === clean.id)] = clean;
    else { clean.id = uid(); clean.creado = util.now(); db.reportes.push(clean); }
    audit(confirm ? "Conteo físico confirmado" : "Conteo guardado como borrador", `${local(clean.localId).nombre} ${fmt.date(clean.hasta)} · ${t.productos} productos · ${fmt.money(t.valor)}`);
    save(); ui.draft = null; ui.viewId = clean.id; render();
    toast((confirm ? "Conteo confirmado" : "Borrador guardado") + (ui.omitidos ? ` · ${ui.omitidos} producto${ui.omitidos > 1 ? "s" : ""} sin cantidad no se incluyeron` : ""));
    ui.omitidos = 0;
  }

  /* ---------- Pérdidas ---------- */
  function viewPerdidas() {
    const range = rules.periodRange(ui.perdPeriodo);
    const lines = rules.lossesIn(db, range, ui.perdLocal);
    const total = round2(lines.reduce((a, x) => a + x.v, 0)), unidades = lines.reduce((a, x) => a + x.q, 0);
    const ventasT = rules.aggregate(rules.confirmedIn(db, range, ui.perdLocal));
    const share = ventasT.costo + total > 0 ? total / (ventasT.costo + total) : NaN;
    const group = (keyFn) => { const m = new Map(); for (const x of lines) { const k = keyFn(x); const o = m.get(k) || { k, q: 0, v: 0 }; o.q += x.q; o.v += x.v; m.set(k, o); } return [...m.values()].sort((a, b) => b.v - a.v); };
    const porMotivo = group((x) => x.l.motivo || "Otro"), porLocal = group((x) => x.r.localId), porProd = group((x) => x.l.productoId);
    const maxM = Math.max(1, ...porMotivo.map((x) => x.v)), maxL = Math.max(1, ...porLocal.map((x) => x.v));
    const periodos = [["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["mes", "Este mes"], ["mesant", "Mes anterior"], ["90", "Últimos 90 días"], ["todo", "Todo el historial"]];
    const docs = db.reportes.filter((r) => r.tipo === "PERDIDA" && r.hasta >= range[0] && r.hasta <= range[1] && (ui.perdLocal === "todos" || r.localId === ui.perdLocal)).sort((a, b) => b.hasta.localeCompare(a.hasta));
    const motivoTop = porMotivo[0];
    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Inventario</span><h1>Pérdidas</h1><p>Producto dañado, vencido, roto o regalado. Sale del inventario y baja la ganancia.</p></div>
      ${invActions()}
    </div>
    ${invTabs("perdidas")}
    <div class="toolbar">
      <div class="select-wrap"><select class="input" data-bind="perdPeriodo" aria-label="Período">${periodos.map(([k, x]) => `<option value="${k}" ${ui.perdPeriodo === k ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      <div class="segmented" role="group" aria-label="Local">${[["todos", "Los 3 locales"], ...db.locales.map((l) => [l.id, l.nombre])].map(([k, x]) => `<button class="seg" aria-pressed="${ui.perdLocal === k}" data-perdlocal="${k}">${esc(x)}</button>`).join("")}</div>
    </div>
    <section class="kpis" aria-label="Resumen de pérdidas">
      <div class="kpi hero"><span class="eyebrow">Pérdidas del período</span><span class="val num" data-count="${total}" data-fmt="money">${fmt.money(total)}</span><span class="sub">A costo de cada producto</span></div>
      <div class="kpi"><span class="eyebrow">Unidades perdidas</span><span class="val num" data-count="${unidades}" data-fmt="int">${fmt.int(unidades)}</span><span class="sub">${docs.length} registro${docs.length === 1 ? "" : "s"}</span></div>
      <div class="kpi"><span class="eyebrow">De lo producido y comprado</span><span class="val num" style="color:var(--bad)">${fmt.pct(share)}</span><span class="sub">Pérdidas ÷ (costo vendido + pérdidas)</span></div>
      <div class="kpi"><span class="eyebrow">Motivo principal</span><span class="val val-name">${motivoTop ? esc(motivoTop.k) : "—"}</span><span class="sub">${motivoTop ? `${fmt.money(motivoTop.v)} · ${fmt.int(motivoTop.q)} u.` : "Sin pérdidas en el período"}</span></div>
    </section>
    ${lines.length ? `<div class="two">
      <section class="card"><div class="card-head"><div><h2>Por motivo</h2><p class="muted small">Valor perdido a costo</p></div></div>
        <div class="hbars">${porMotivo.map((x) => `<div class="hbar"><span>${esc(x.k)}</span><div class="track"><i style="width:${(x.v / maxM) * 100}%"></i></div><b class="num">${fmt.money(x.v)}</b></div>`).join("")}</div></section>
      <section class="card"><div class="card-head"><div><h2>Por local</h2><p class="muted small">Cada local por separado</p></div></div>
        <div class="hbars">${porLocal.map((x) => { const i = db.locales.findIndex((l) => l.id === x.k); return `<div class="hbar"><span>${esc(local(x.k).nombre)}</span><div class="track"><i style="width:${(x.v / maxL) * 100}%;background:var(--s${i + 1})"></i></div><b class="num">${fmt.money(x.v)}</b></div>`; }).join("")}</div></section>
    </div>
    <section class="card"><div class="card-head"><div><h2>Productos que más se pierden</h2></div></div>
      <div class="table-wrap"><table><thead><tr><th>Producto</th><th class="r">Unidades</th><th class="r">Valor</th><th class="hide-sm">Motivo más común</th></tr></thead>
      <tbody>${porProd.slice(0, 10).map((x, i) => { const mm = group((y) => (y.l.productoId === x.k ? y.l.motivo : null)).filter((y) => y.k)[0]; return `<tr><td style="white-space:nowrap"><span class="rank">${i + 1}</span><b>${esc(producto(x.k)?.nombre || "—")}</b></td><td class="r num">${fmt.int(x.q)}</td><td class="r num"><b>${fmt.money(x.v)}</b></td><td class="hide-sm muted">${esc(mm ? mm.k : "—")}</td></tr>`; }).join("")}</tbody></table></div>
    </section>` : ""}
    <section class="card"><div class="card-head"><div><h2>Registros</h2></div></div>
      ${docs.length ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Local</th><th class="hide-sm">Motivos</th><th class="r">Unidades</th><th class="r">Valor</th><th>Estado</th></tr></thead>
      <tbody>${docs.map((r) => { const t = rules.movTotals(r); return `<tr class="click" data-open="${r.id}" data-route="perdidas" tabindex="0"><td class="num" style="white-space:nowrap">${fmt.date(r.hasta)}</td><td><b>${esc(local(r.localId).nombre)}</b></td><td class="hide-sm muted">${movSummaryTxt(r)}</td><td class="r num">${fmt.int(t.unidades)}</td><td class="r num"><b>${fmt.money(t.valor)}</b></td><td>${statePill(r)}</td></tr>`; }).join("")}</tbody></table></div>`
        : `<div class="empty">No hay pérdidas registradas en este período.${isAdmin() ? " Usa «Registrar pérdida» cuando algo se dañe, venza o se regale." : ""}</div>`}
    </section>`;
  }

  /* ---------- Informes (Excel) ---------- */
  const HOJAS = [
    ["finanzas", "Estado de resultados", "Ingresos, egresos, sueldos y utilidad de cada local y del total, con egresos por categoría"],
    ["diario", "Reportes diarios", "Ingresos y egresos de cada día por local, como el Excel de caja"],
    ["gastos", "Egresos", "Cada egreso con fecha, local, categoría y monto (incluye los sueldos de los roles)"],
    ["roles", "Roles de pago", "Cada trabajador: ingresos, IESS, neto pagado y costo para EduPan"],
    ["resumen", "Propuesta · Resumen por producto", "Ventas, costos, pérdidas y ganancia por producto"],
    ["productos", "Propuesta · Ventas por producto", "Unidades y dólares de cada producto en cada local"],
    ["ventas", "Propuesta · Reportes de ventas", "Cada reporte con su período, total y cuadre"],
    ["inventario", "Propuesta · Inventario actual", "Existencias de cada producto por local, valor y estado"],
    ["perdidas", "Propuesta · Pérdidas", "Cada pérdida con su producto, motivo y valor"],
    ["entradas", "Propuesta · Entradas", "Producción y compras a proveedores"],
  ];
  function infRange() { return ui.inf.periodo === "custom" ? [ui.inf.desde, ui.inf.hasta] : rules.periodRange(ui.inf.periodo); }
  function infLocs() { return db.locales.filter((l) => ui.inf.locs[l.id]); }
  /** Cifras por local para el resumen (pantalla y Excel). */
  function resumenData(range, locs) {
    return locs.map((l) => {
      const a = rules.aggregate(rules.confirmedIn(db, range, l.id));
      const perd = round2(rules.lossesIn(db, range, l.id).reduce((s, x) => s + x.v, 0));
      const ent = db.reportes.filter((r) => r.tipo === "ENTRADA" && r.estado === "CONFIRMADO" && r.localId === l.id && r.hasta >= range[0] && r.hasta <= range[1]);
      const prodV = round2(ent.filter((r) => r.subtipo !== "COMPRA").reduce((s, r) => s + rules.movTotals(r).valor, 0));
      const compV = round2(ent.filter((r) => r.subtipo === "COMPRA").reduce((s, r) => s + rules.movTotals(r).valor, 0));
      let inv = 0, bajo = 0, agot = 0;
      for (const p of db.productos) {
        const s = rules.stockAt(db, l.id, p.id); if (!s.tracked) continue;
        if (s.qty > 0 && rules.hasCost(p.costo)) inv += s.qty * p.costo;
        const st = rules.stockState(s.qty, p.stockMin); if (p.activo && st === "bajo") bajo++; if (p.activo && (st === "agotado" || st === "negativo")) agot++;
      }
      return { l, ventas: a.ventas, costo: a.costo, perd, egresos: round2(a.costo + perd), gan: round2(a.margen - perd), unidades: a.unidades, prodV, compV, inv: round2(inv), bajo, agot, n: a.n };
    });
  }

  function buildWorkbook() {
    const range = infRange(), locs = infLocs(), H = ui.inf.hojas;
    const X = PPX.excel, C = X.colName;
    const periodo = `Período: ${fmt.period(range[0] === "1900-01-01" ? (db.reportes.map((r) => r.desde).sort()[0] || today()) : range[0], range[1])}`;
    const quien = `Generado el ${new Date().toLocaleString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} por ${session.nombre}`;
    const head = (title, extra) => [[{ v: title, s: "title" }], [{ v: `${periodo} · Locales: ${locs.map((l) => l.nombre).join(", ")}${extra ? " · " + extra : ""}`, s: "sub" }], [{ v: quien, s: "sub" }], []];
    const sheets = [];
    const inRange = (r) => r.hasta >= range[0] && r.hasta <= range[1] && locs.some((l) => l.id === r.localId);
    sheets.push(...finSheets(range, locs, head));

    if (H.resumen) {
      const d = resumenData(range, locs), n = d.length, T = n + 1; // columna del total
      const rows = head("EduPan Panaderías · Informe de gestión");
      rows.push([{ v: "Indicador", s: "header" }, ...d.map((x) => ({ v: `${x.l.nombre} (${x.l.tipo})`, s: "headerR" })), { v: "Total EduPan", s: "headerR" }]);
      const start = rows.length + 1; // fila de Excel donde empieza el primer indicador
      const R = {}; // fila de cada indicador
      const add = (key, label, vals, style, totalKind) => {
        const r = rows.length + 1; R[key] = r;
        const row = [{ v: label, s: style === "money" || style === "int" || style === "pct" ? "bold" : style }];
        vals.forEach((v) => row.push(typeof v === "object" ? v : { v, s: style }));
        const first = C(1) + r, last = C(n) + r;
        if (totalKind === "sum") row.push({ v: vals.reduce((a, v) => a + (typeof v === "object" ? v.v || 0 : v || 0), 0), s: style, f: `SUM(${first}:${last})` });
        else if (typeof totalKind === "function") row.push(totalKind(r));
        rows.push(row);
      };
      const colF = (i) => C(i + 1);
      add("ventas", "Ventas", d.map((x) => x.ventas), "money", "sum");
      add("costo", "Costo de lo vendido", d.map((x) => x.costo), "money", "sum");
      add("perd", "Pérdidas (a costo)", d.map((x) => ({ v: x.perd, s: "moneyBad" })), "money", "sum");
      add("egresos", "Costos totales (egresos)", d.map((x, i) => ({ v: x.egresos, s: "money", f: `${colF(i)}${R.costo}+${colF(i)}${R.perd}` })), "money", (r) => ({ v: round2(d.reduce((a, x) => a + x.egresos, 0)), s: "money", f: `${C(T)}${R.costo}+${C(T)}${R.perd}` }));
      add("gan", "Ganancia (ventas − costos totales)", d.map((x, i) => ({ v: x.gan, s: "moneyGood", f: `${colF(i)}${R.ventas}-${colF(i)}${R.egresos}` })), "moneyGood", (r) => ({ v: round2(d.reduce((a, x) => a + x.gan, 0)), s: "moneyGood", f: `${C(T)}${R.ventas}-${C(T)}${R.egresos}` }));
      const pctF = (col) => `IF(${col}${R.ventas}=0,"",${col}${R.gan}/${col}${R.ventas})`;
      add("ganp", "Ganancia sobre ventas", d.map((x, i) => ({ v: x.ventas ? x.gan / x.ventas : "", s: "pct", f: pctF(colF(i)) })), "pct", () => { const v = d.reduce((a, x) => a + x.ventas, 0), g = d.reduce((a, x) => a + x.gan, 0); return { v: v ? g / v : "", s: "pct", f: pctF(C(T)) }; });
      add("part", "Participación en las ventas", d.map((x, i) => ({ v: "", s: "pct", f: `IF($${C(T)}$${R.ventas}=0,"",${colF(i)}${R.ventas}/$${C(T)}$${R.ventas})` })), "pct", () => ({ v: 1, s: "pct", f: `IF(${C(T)}${R.ventas}=0,"",1)` }));
      add("uni", "Unidades vendidas", d.map((x) => x.unidades), "int", "sum");
      add("ppu", "Precio promedio por unidad", d.map((x, i) => ({ v: x.unidades ? x.ventas / x.unidades : "", s: "money", f: `IF(${colF(i)}${R.uni}=0,"",${colF(i)}${R.ventas}/${colF(i)}${R.uni})` })), "money", () => ({ v: "", s: "money", f: `IF(${C(T)}${R.uni}=0,"",${C(T)}${R.ventas}/${C(T)}${R.uni})` }));
      add("rep", "Reportes de ventas confirmados", d.map((x) => x.n), "int", "sum");
      rows.push([]);
      rows.push([{ v: "Inventario", s: "section" }]);
      add("prod", "Producción del período (a costo)", d.map((x) => x.prodV), "money", "sum");
      add("comp", "Compras a proveedores (a costo)", d.map((x) => x.compV), "money", "sum");
      add("inv", `Valor del inventario al ${fmt.date(today())}`, d.map((x) => x.inv), "money", "sum");
      add("bajo", "Productos bajo el mínimo", d.map((x) => x.bajo), "int", "sum");
      add("agot", "Productos agotados", d.map((x) => x.agot), "int", "sum");
      rows.push([]);
      rows.push([{ v: "La ganancia es ventas menos el costo de lo vendido y las pérdidas. No incluye arriendo, sueldos ni servicios de los locales.", s: "sub" }]);
      rows.push([{ v: "Las ventas cuentan en el período en que termina cada reporte confirmado.", s: "sub" }]);
      // Marca los totales con estilo de total
      for (const r of rows.slice(start - 1)) { if (r.length === n + 2 && r[T]) { r[T] = { ...r[T], s: { money: "totalMoney", moneyGood: "totalMoney", moneyBad: "totalMoney", int: "totalInt", pct: "totalPct" }[r[T].s] || r[T].s }; } }
      sheets.push({ name: "Resumen por producto", cols: [40, ...d.map(() => 22), 20], rows, freeze: "B6" });
    }

    if (H.productos) {
      const rows = head("Ventas por producto");
      const hdr = [{ v: "Producto", s: "header" }];
      locs.forEach((l) => hdr.push({ v: `${l.nombre} · unidades`, s: "headerR" }, { v: `${l.nombre} · ventas`, s: "headerR" }));
      hdr.push(...["Total unidades", "Total ventas", "Costo de lo vendido", "Pérdidas", "Ganancia", "Ganancia %"].map((v) => ({ v, s: "headerR" })));
      rows.push(hdr);
      const m = new Map();
      for (const r of db.reportes) {
        if (r.estado !== "CONFIRMADO" || !inRange(r)) continue;
        if (r.tipo === "VENTAS") for (const l of r.lineas) {
          const o = m.get(l.productoId) || { per: {}, c: 0, p: 0 }; const pl = o.per[r.localId] || (o.per[r.localId] = { q: 0, v: 0 });
          pl.q += Number(l.cantidad) || 0; pl.v += rules.lineTotal(l); if (rules.hasCost(l.costo)) o.c += (Number(l.cantidad) || 0) * l.costo; m.set(l.productoId, o);
        }
        if (r.tipo === "PERDIDA") for (const l of r.lineas) { const o = m.get(l.productoId) || { per: {}, c: 0, p: 0 }; if (rules.hasCost(l.costo)) o.p += (Number(l.cantidad) || 0) * l.costo; m.set(l.productoId, o); }
      }
      const list = [...m.entries()].map(([id, o]) => ({ id, o, v: Object.values(o.per).reduce((a, x) => a + x.v, 0) })).sort((a, b) => b.v - a.v);
      const first = rows.length + 1, nL = locs.length;
      list.forEach(({ id, o }) => {
        const r = rows.length + 1, row = [{ v: producto(id)?.nombre || "—", s: "bold" }];
        locs.forEach((l) => { const x = o.per[l.id] || { q: 0, v: 0 }; row.push({ v: x.q, s: "num" }, { v: round2(x.v), s: "money" }); });
        const qCols = locs.map((_, i) => C(1 + i * 2) + r).join(","), vCols = locs.map((_, i) => C(2 + i * 2) + r).join(",");
        const tq = Object.values(o.per).reduce((a, x) => a + x.q, 0), tv = round2(Object.values(o.per).reduce((a, x) => a + x.v, 0));
        const cTq = C(1 + nL * 2), cTv = C(2 + nL * 2), cC = C(3 + nL * 2), cP = C(4 + nL * 2), cG = C(5 + nL * 2);
        row.push({ v: tq, s: "num", f: `SUM(${qCols})` }, { v: tv, s: "money", f: `SUM(${vCols})` }, { v: round2(o.c), s: "money" }, { v: round2(o.p), s: "moneyBad" },
          { v: round2(tv - o.c - o.p), s: "moneyGood", f: `${cTv}${r}-${cC}${r}-${cP}${r}` }, { v: tv ? (tv - o.c - o.p) / tv : "", s: "pct", f: `IF(${cTv}${r}=0,"",${cG}${r}/${cTv}${r})` });
        rows.push(row);
      });
      const last = rows.length;
      if (list.length) {
        const tr = [{ v: "Total", s: "totalLabel" }];
        for (let j = 1; j <= nL * 2 + 5; j++) { const isQ = j <= nL * 2 ? j % 2 === 1 : j === nL * 2 + 1; tr.push({ v: "", s: isQ ? "totalNum" : "totalMoney", f: `SUM(${C(j)}${first}:${C(j)}${last})` }); }
        const cTv = C(2 + nL * 2), cG = C(5 + nL * 2), tRow = last + 1;
        tr.push({ v: "", s: "totalPct", f: `IF(${cTv}${tRow}=0,"",${cG}${tRow}/${cTv}${tRow})` });
        rows.push(tr);
      } else rows.push([{ v: "Sin ventas confirmadas en el período.", s: "sub" }]);
      sheets.push({ name: "Ventas por producto", cols: [32, ...locs.flatMap(() => [13, 15]), 14, 15, 17, 13, 15, 12], rows, freeze: "B6", filter: list.length ? `A5:${C(nL * 2 + 6)}${last}` : null });
    }

    if (H.ventas) {
      const rows = head("Reportes de ventas");
      rows.push(["Local", "Desde", "Hasta", "Ventas", "Costo", "Ganancia", "Total del papel", "Diferencia", "Estado", "Observaciones"].map((v, i) => ({ v, s: i >= 3 && i <= 7 ? "headerR" : "header" })));
      const list = db.reportes.filter((r) => r.tipo === "VENTAS" && inRange(r)).sort((a, b) => a.hasta.localeCompare(b.hasta) || a.localId.localeCompare(b.localId));
      const first = rows.length + 1;
      list.forEach((r) => {
        const t = reportTotals(r), c = cuadre(r), n = rows.length + 1;
        rows.push([{ v: local(r.localId).nombre, s: "bold" }, { v: r.desde, s: "date" }, { v: r.hasta, s: "date" }, { v: t.ventas, s: "money" }, { v: t.costo, s: "money" }, { v: t.margen, s: "moneyGood", f: `D${n}-E${n}` },
          c.estado === "sin" ? { v: "", s: "money" } : { v: Number(r.totalDeclarado), s: "money" }, c.estado === "sin" ? { v: "", s: "money" } : { v: c.dif, s: c.estado === "dif" ? "moneyBad" : "money", f: `D${n}-G${n}` },
          r.estado === "CONFIRMADO" ? "Confirmado" : "Borrador", r.obs || ""]);
      });
      const last = rows.length;
      if (list.length) rows.push([{ v: "Total", s: "totalLabel" }, { v: "", s: "totalLabel" }, { v: "", s: "totalLabel" }, ...["D", "E", "F"].map((col) => ({ v: "", s: "totalMoney", f: `SUM(${col}${first}:${col}${last})` }))]);
      else rows.push([{ v: "Sin reportes en el período.", s: "sub" }]);
      sheets.push({ name: "Reportes de ventas", cols: [16, 12, 12, 14, 14, 14, 15, 13, 13, 48], rows, freeze: "A6", filter: list.length ? `A5:J${last}` : null });
    }

    if (H.inventario) {
      const rows = head("Inventario actual", `Existencias al ${fmt.date(today())}`);
      rows.push([{ v: "Producto", s: "header" }, { v: "Mínimo", s: "headerR" }, ...locs.map((l) => ({ v: l.nombre, s: "headerR" })), { v: "Total", s: "headerR" }, { v: "Costo unitario", s: "headerR" }, { v: "Valor", s: "headerR" }, { v: "Estado", s: "header" }]);
      const first = rows.length + 1, nL = locs.length;
      const LBL = { ok: "Bien", bajo: "Bajo mínimo", agotado: "Agotado", negativo: "Revisar: más salidas que entradas", sin: "Sin movimientos" };
      const prods = db.productos.filter((p) => p.activo || locs.some((l) => rules.stockAt(db, l.id, p.id).qty)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      prods.forEach((p) => {
        const r = rows.length + 1, per = locs.map((l) => rules.stockAt(db, l.id, p.id));
        const sts = per.map((s) => (s.tracked ? rules.stockState(s.qty, p.stockMin) : "sin")), worst = sts.reduce((w, x) => (RANK[x] > RANK[w] ? x : w), "sin");
        const total = per.reduce((a, s) => a + s.qty, 0), cT = C(2 + nL), cU = C(3 + nL);
        const bad = sts.filter((x) => x !== "ok" && x !== "sin").map((x, i) => x);
        rows.push([{ v: p.nombre, s: "bold" }, p.stockMin ? { v: p.stockMin, s: "num" } : "", ...per.map((s) => (s.tracked ? { v: s.qty, s: "num" } : "")), { v: total, s: "num", f: `SUM(${C(2)}${r}:${C(1 + nL)}${r})` },
          rules.hasCost(p.costo) ? { v: p.costo, s: "money" } : "", rules.hasCost(p.costo) ? { v: round2(Math.max(0, total) * p.costo), s: "money", f: `MAX(0,${cT}${r})*${cU}${r}` } : "",
          worst === "ok" || worst === "sin" ? LBL[worst] : `${LBL[worst]} (${locs.filter((_, i) => sts[i] === worst).map((l) => l.nombre).join(", ")})`]);
      });
      const last = rows.length;
      if (prods.length) rows.push([{ v: "Total", s: "totalLabel" }, { v: "", s: "totalLabel" }, ...locs.map((_, i) => ({ v: "", s: "totalNum", f: `SUM(${C(2 + i)}${first}:${C(2 + i)}${last})` })), { v: "", s: "totalNum", f: `SUM(${C(2 + nL)}${first}:${C(2 + nL)}${last})` }, { v: "", s: "totalLabel" }, { v: "", s: "totalMoney", f: `SUM(${C(4 + nL)}${first}:${C(4 + nL)}${last})` }]);
      rows.push([]); rows.push([{ v: "Existencia = entradas − ventas confirmadas − pérdidas, desde el último conteo físico. Cada local por separado.", s: "sub" }]);
      sheets.push({ name: "Inventario", cols: [32, 10, ...locs.map(() => 13), 11, 14, 14, 36], rows, freeze: "B6", filter: prods.length ? `A5:${C(5 + nL)}${last}` : null });
    }

    const movSheet = (tipo, name, title) => {
      const perd = tipo === "PERDIDA";
      const rows = head(title);
      const hdr = perd ? ["Fecha", "Local", "Producto", "Cantidad", "Motivo", "Costo unitario", "Valor", "Observaciones"] : ["Fecha", "Local", "Tipo", "Proveedor", "Factura", "Producto", "Cantidad", "Costo unitario", "Valor"];
      rows.push(hdr.map((v) => ({ v, s: ["Cantidad", "Costo unitario", "Valor"].includes(v) ? "headerR" : "header" })));
      const first = rows.length + 1;
      const docs = db.reportes.filter((r) => r.tipo === tipo && r.estado === "CONFIRMADO" && inRange(r)).sort((a, b) => a.hasta.localeCompare(b.hasta) || a.localId.localeCompare(b.localId));
      for (const r of docs) for (const l of r.lineas) {
        const n = rows.length + 1, q = Number(l.cantidad) || 0, has = rules.hasCost(l.costo);
        const qc = perd ? "D" : "G", cc = perd ? "F" : "H";
        const common = { v: has ? round2(q * l.costo) : "", s: perd ? "moneyBad" : "money", f: has ? `${qc}${n}*${cc}${n}` : undefined };
        rows.push(perd
          ? [{ v: r.hasta, s: "date" }, { v: local(r.localId).nombre, s: "bold" }, producto(l.productoId)?.nombre || "—", { v: q, s: "num" }, l.motivo || "", has ? { v: l.costo, s: "money" } : "", common, r.obs || ""]
          : [{ v: r.hasta, s: "date" }, { v: local(r.localId).nombre, s: "bold" }, r.subtipo === "COMPRA" ? "Compra a proveedor" : "Producción propia", r.proveedor || "", r.factura || "", producto(l.productoId)?.nombre || "—", { v: q, s: "num" }, has ? { v: l.costo, s: "money" } : "", common]);
      }
      const last = rows.length;
      if (last >= first) {
        rows.push(perd
          ? [{ v: "Total", s: "totalLabel" }, { v: "", s: "totalLabel" }, { v: "", s: "totalLabel" }, { v: "", s: "totalNum", f: `SUM(D${first}:D${last})` }, { v: "", s: "totalLabel" }, { v: "", s: "totalLabel" }, { v: "", s: "totalMoney", f: `SUM(G${first}:G${last})` }]
          : [{ v: "Total", s: "totalLabel" }, ...Array(5).fill({ v: "", s: "totalLabel" }), { v: "", s: "totalNum", f: `SUM(G${first}:G${last})` }, { v: "", s: "totalLabel" }, { v: "", s: "totalMoney", f: `SUM(I${first}:I${last})` }]);
      } else rows.push([{ v: perd ? "Sin pérdidas en el período." : "Sin entradas en el período.", s: "sub" }]);
      sheets.push({ name, cols: perd ? [12, 14, 32, 11, 26, 14, 13, 40] : [12, 14, 20, 26, 18, 32, 11, 14, 14], rows, freeze: "A6", filter: last >= first ? `A5:${perd ? "H" : "I"}${last}` : null });
    };
    if (H.perdidas) movSheet("PERDIDA", "Pérdidas", "Pérdidas");
    if (H.entradas) movSheet("ENTRADA", "Entradas", "Entradas: producción y compras");
    return sheets;
  }

  function viewInformes() {
    const range = infRange(), locs = infLocs(), d = locs.map((l) => ({ l, ...F.summary(db, range, l.id) }));
    const sum = (k) => d.reduce((a, x) => a + x[k], 0);
    const periodos = [["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["mes", "Este mes"], ["mesant", "Mes anterior"], ["90", "Últimos 90 días"], ["todo", "Todo el historial"], ["custom", "Elegir fechas"]];
    const shown = range[0] === "1900-01-01" ? [db.reportes.map((r) => r.desde).sort()[0] || today(), range[1]] : range;
    const nHojas = HOJAS.filter(([k]) => ui.inf.hojas[k]).length;
    const recientes = db.auditoria.filter((a) => a.accion === "Informe descargado").slice(0, 5);
    const rowsPrev = [
      ["Ingresos", "ingresos", "money"], ["Egresos del día", "caja", "bad"], ["Sueldos y beneficios", "sueldos", "bad"], ["Total egresos", "egresos", "money"], ["Utilidad", "utilidad", "good"], ["Días reportados", "dias", "int"],
    ];
    const cell = (v, k) => (k === "int" ? fmt.int(v) : `<span style="${k === "bad" ? "color:var(--bad)" : k === "good" ? "color:var(--good);font-weight:800" : ""}">${fmt.money(v)}</span>`);
    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Excel</span><h1>Informes</h1><p>Descarga un Excel con el resumen de las sedes para revisarlo o enviárselo a tu jefe.</p></div>
    </div>
    <div class="two rev">
      <section class="card" style="display:grid;gap:16px">
        <div><h2>Qué incluir</h2><p class="muted small">El informe usa los mismos datos del panel.</p></div>
        <div class="field"><label for="inf-periodo">Período</label><div class="select-wrap"><select class="input" id="inf-periodo" data-bind="infPeriodo">${periodos.map(([k, x]) => `<option value="${k}" ${ui.inf.periodo === k ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
        ${ui.inf.periodo === "custom" ? `<div class="grid2"><div class="field"><label for="inf-desde">Desde</label><input class="input" type="date" id="inf-desde" data-inf="desde" value="${ui.inf.desde}" max="${today()}"></div><div class="field"><label for="inf-hasta">Hasta</label><input class="input" type="date" id="inf-hasta" data-inf="hasta" value="${ui.inf.hasta}" max="${today()}"></div></div>` : ""}
        <div class="field"><span class="lbl">Locales</span><div class="checks">${db.locales.map((l) => `<label class="check-chip"><input type="checkbox" data-infloc="${l.id}" ${ui.inf.locs[l.id] ? "checked" : ""}><span>${esc(l.nombre)}</span></label>`).join("")}</div></div>
        <div class="field"><span class="lbl">Hojas del Excel</span><div class="sheet-list">${HOJAS.map(([k, n, desc]) => `<label class="sheet-opt"><input type="checkbox" data-infhoja="${k}" ${ui.inf.hojas[k] ? "checked" : ""}><span><b>${n}</b><span class="muted small">${desc}</span></span></label>`).join("")}</div></div>
        <div id="inf-err"></div>
        ${data.DEMO
          ? `<button class="btn primary" type="button" disabled>Descargar Excel</button><p class="note info">En este enlace de vista previa no se pueden descargar archivos. En el sistema instalado (el zip) este botón descarga el Excel.</p>`
          : `<button class="btn primary" type="button" data-act="inf-download" ${!locs.length || !nHojas ? "disabled" : ""}>Descargar Excel · ${nHojas} hoja${nHojas === 1 ? "" : "s"}</button>`}
      </section>
      <section class="card" style="display:grid;gap:14px;align-content:start;align-self:start">
        <div class="card-head" style="margin:0"><div><h2>Vista previa del estado de resultados</h2><p class="muted small">${fmt.period(...shown)} · así queda la primera hoja</p></div></div>
        ${locs.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Indicador</th>${d.map((x) => `<th class="r">${esc(x.l.nombre)}</th>`).join("")}<th class="r">Total</th></tr></thead>
          <tbody>${rowsPrev.map(([lbl, k, kind]) => `<tr><td><b>${lbl}</b></td>${d.map((x) => `<td class="r num">${cell(x[k], kind)}</td>`).join("")}<td class="r num"><b>${cell(sum(k), kind)}</b></td></tr>`).join("")}
            <tr><td><b>Margen sobre ingresos</b></td>${d.map((x) => `<td class="r num">${fmt.pct(x.ingresos ? x.utilidad / x.ingresos : NaN)}</td>`).join("")}<td class="r num"><b>${fmt.pct(sum("ingresos") ? sum("utilidad") / sum("ingresos") : NaN)}</b></td></tr>
          </tbody></table></div>` : `<div class="empty">Elige al menos un local.</div>`}
        <div class="note info"><b>Para enviárselo a tu jefe:</b> descarga el Excel y adjúntalo a un correo o a WhatsApp. El envío automático por correo llega con la versión en línea.</div>
        ${recientes.length ? `<div><h3 style="margin-bottom:8px">Últimos informes</h3><div class="alerts">${recientes.map((a) => `<div class="alert"><span class="ic">${ICON.informes}</span><span><b>${fmt.stamp(a.fecha)}</b> · ${esc(a.detalle)}</span></div>`).join("")}</div></div>` : ""}
      </section>
    </div>`;
  }
  function downloadReport() {
    const range = infRange(), locs = infLocs();
    if (ui.inf.periodo === "custom" && (!ui.inf.desde || !ui.inf.hasta || ui.inf.hasta < ui.inf.desde)) { $("#inf-err").innerHTML = '<div class="note bad">Revisa las fechas: «hasta» no puede ser anterior a «desde».</div>'; return; }
    try {
      const sheets = buildWorkbook();
      const bytes = PPX.excel.build(sheets, { title: "EduPan · Informe de gestión", author: session.nombre });
      const name = `EduPan-informe-${range[0] === "1900-01-01" ? "historial" : range[0]}-al-${range[1]}.xlsx`;
      PPX.excel.download(bytes, name);
      audit("Informe descargado", `${name} · ${locs.map((l) => l.nombre).join(", ")} · ${sheets.length} hojas`);
      save(); render(); toast("Excel descargado");
    } catch (x) {
      $("#inf-err").innerHTML = `<div class="note bad">No se pudo generar el Excel: ${esc(x.message)}</div>`;
    }
  }

  /* =============================================================
     FINANZAS: reportes diarios, gastos, personal y roles de pago
     ============================================================= */
  const F = PPX.fin;
  const curMes = () => today().slice(0, 7);
  const mesTxt = (mes) => { const t = F.MESES[Number(mes.slice(5, 7)) - 1]; return t.charAt(0).toUpperCase() + t.slice(1) + " " + mes.slice(0, 4); };
  const addMes = (mes, k) => { const [y, m] = mes.split("-").map(Number); return iso(new Date(y, m - 1 + k, 1)).slice(0, 7); };
  const mesRange = (mes) => [mes + "-01", F.lastDay(mes)];
  const catById = (id) => (id === "" || id == null ? F.SIN : id === "sueldos" ? F.SUELDOS : db.categorias.find((c) => c.id === id) || { id, nombre: id, activo: false });
  const catName = (id) => catById(id).nombre;
  const CAT_COLS = ["var(--s1)", "var(--s2)", "#5B6FD6", "var(--teal)", "#8E7CC3", "#E08A3C", "#C9A227", "#D96C8A", "#6BA368", "#9C7A5B", "#5C8DB8", "var(--muted)"];
  /** Segmentos de la dona de categorías: las 7 mayores y el resto junto. */
  const catSegs = (cats) => { const top = cats.slice(0, 7), rest = cats.slice(7).reduce((a, c) => a + c.v, 0); return top.map((c, i) => ({ l: catName(c.id), v: c.v, c: catColor(c.id, i), k: "Egresos" })).concat(rest ? [{ l: `Otras (${cats.length - 7})`, v: round2(rest), c: "var(--surface-3)", k: "Egresos" }] : []); };
  const catColor = (id, i) => (id === "" ? "var(--muted)" : id === "sueldos" ? "#2F8FD8" : CAT_COLS[i % CAT_COLS.length]);
  const ORIGEN = { caja: ["Reporte diario", "gold"], gasto: ["Gasto", "neutral"], rol: ["Rol de pagos", "good"] };
  const money0 = (v) => (v ? fmt.money(v) : "—");
  const showNum = (v) => (v === "" || v === null || v === undefined ? "" : String(v).replace(".", ","));
  const numOk = (v) => { const n = parseNum(String(v ?? "").trim()); return String(v ?? "").trim() === "" ? 0 : n; };
  const monthNav = (key, mes) => `<div class="month-nav" role="group" aria-label="Mes"><button class="icon-btn" data-f="mes" data-key="${key}" data-k="-1" aria-label="Mes anterior">‹</button><b>${mesTxt(mes)}</b><button class="icon-btn" data-f="mes" data-key="${key}" data-k="1" aria-label="Mes siguiente" ${mes >= curMes() ? "disabled" : ""}>›</button></div>`;
  const ftabs = (key, cur, items) => `<nav class="subtabs" aria-label="Secciones">${items.map(([k, t, ic]) => `<a href="#" data-f="tab" data-key="${key}" data-v="${k}" ${cur === k ? 'aria-current="page"' : ""}>${ic ? ICON[ic] : ""}${t}</a>`).join("")}</nav>`;
  const segLocal = (key, cur, todos = "Los 3 locales") => `<div class="segmented" role="group" aria-label="Local">${[["todos", todos], ...db.locales.map((l) => [l.id, l.nombre])].map(([k, x]) => `<button class="seg" aria-pressed="${cur === k}" data-f="set" data-key="${key}" data-v="${k}">${esc(x)}</button>`).join("")}</div>`;
  const locIdx = (id) => db.locales.findIndex((l) => l.id === id);
  const errBox = (errs) => errs.map((x) => `<div class="note bad">${esc(x)}</div>`).join("");
  function dialog(html, onMount) {
    const ov = document.createElement("div"); ov.className = "overlay";
    ov.innerHTML = html; document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest("[data-close]")) close(); });
    onMount && onMount(ov, close);
    return { ov, close };
  }
  const dlgHead = (id, t) => `<div class="card-head" style="margin:0"><h2 id="${id}">${t}</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${ICON.x}</button></div>`;
  const localSelect = (id, val) => `<select class="input" id="${id}">${db.locales.map((l) => `<option value="${l.id}" ${val === l.id ? "selected" : ""}>${esc(l.nombre)}</option>`).join("")}</select>`;

  /* ---------- Reportes diarios ---------- */
  function viewDiario() {
    const tab = ui.diaTab || "mes";
    if (tab === "categorias") return `<div class="page-head"><div class="lead"><span class="eyebrow">Ingresos y egresos de cada día</span><h1>Reportes diarios</h1><p>Categorías para separar de dónde viene y en qué se va el dinero.</p></div></div>
      ${ftabs("diaTab", tab, [["mes", "Días del mes", "diario"], ["categorias", "Categorías", "tag"]])}${viewCategorias()}`;
    const mes = ui.diaMes || curMes(), [a, b] = mesRange(mes), hasta = b > today() ? today() : b;
    const cajas = F.cajaIn(db, [a, b], "todos"), map = new Map(cajas.map((r) => [r.hasta + "|" + r.localId, r]));
    const dias = []; for (let d = a; d <= hasta; d = addDays(d, 1)) dias.push(d);
    const tot = { ing: 0, eg: 0 }, porLoc = Object.fromEntries(db.locales.map((l) => [l.id, { ing: 0, eg: 0, n: 0 }]));
    for (const r of cajas) { const e = F.cajaEgresos(r), o = porLoc[r.localId]; o.ing += Number(r.ingresos) || 0; o.eg += e; o.n++; tot.ing += Number(r.ingresos) || 0; tot.eg += e; }
    const faltan = dias.filter((d) => d < today()).reduce((n, d) => n + db.locales.filter((l) => !map.has(d + "|" + l.id)).length, 0);
    const sinDet = cajas.reduce((s, r) => s + r.lineas.filter((l) => !l.categoriaId).reduce((x, l) => x + (Number(l.monto) || 0), 0), 0);
    const cell = (d, l) => {
      const r = map.get(d + "|" + l.id);
      if (r) { const e = F.cajaEgresos(r); return `<td class="r num day-cell" data-f="caja-open" data-id="${r.id}" tabindex="0" title="Ver o editar"><b>${fmt.money(r.ingresos)}</b><span class="eg">${e ? "− " + fmt.money(e) : "sin egresos"}</span></td>`; }
      return `<td class="r day-cell empty-cell" ${isAdmin() ? `data-f="caja-new" data-loc="${l.id}" data-fecha="${d}" tabindex="0" title="Registrar"` : ""}>${isAdmin() ? '<span class="add">+ Registrar</span>' : "—"}</td>`;
    };
    const dow = (d) => ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][new Date(d + "T12:00:00").getDay()];
    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">Ingresos y egresos de cada día</span><h1>Reportes diarios</h1><p>Lo que entró y lo que salió de caja en cada local. Toca una celda para registrar o corregir.</p></div>
      ${isAdmin() ? `<button class="btn primary" data-f="caja-new" data-loc="${db.locales[0].id}" data-fecha="${today()}">${ICON.plus} Registrar día</button>` : ""}
    </div>
    ${ftabs("diaTab", tab, [["mes", "Días del mes", "diario"], ["categorias", "Categorías", "tag"]])}
    <div class="toolbar">${monthNav("diaMes", mes)}
      <span class="muted small">Ingresos en grande; egresos del día debajo, en rojo.</span></div>
    <section class="kpis" aria-label="Resumen del mes">
      <div class="kpi hero"><span class="eyebrow">Ingresos del mes</span><span class="val num" data-count="${round2(tot.ing)}" data-fmt="money">${fmt.money(tot.ing)}</span><span class="sub">${cajas.length} reporte${cajas.length === 1 ? "" : "s"} · ${mesTxt(mes)}</span></div>
      <div class="kpi"><span class="eyebrow">Egresos del mes</span><span class="val num" style="color:var(--bad)" data-count="${round2(tot.eg)}" data-fmt="money">${fmt.money(tot.eg)}</span><span class="sub">${sinDet ? `${fmt.money(sinDet)} sin detallar` : "Todo con categoría"}</span></div>
      <div class="kpi"><span class="eyebrow">Queda</span><span class="val num ${tot.ing - tot.eg >= 0 ? "good" : ""}" data-count="${round2(tot.ing - tot.eg)}" data-fmt="money">${fmt.money(tot.ing - tot.eg)}</span><span class="sub">Ingresos − egresos. La utilidad, ya con los sueldos, está en el Panel.</span></div>
      <div class="kpi"><span class="eyebrow">Reportes pendientes</span><span class="val num" style="color:${faltan ? "var(--warn)" : "var(--good)"}" data-count="${faltan}" data-fmt="int">${faltan}</span><span class="sub">${faltan ? "Días pasados sin reporte de algún local" : "Todos los días reportados"}</span></div>
    </section>
    <section class="card" aria-label="Reportes del mes">
      <div class="table-wrap"><table class="day-table">
        <thead><tr><th>Fecha</th>${db.locales.map((l, i) => `<th class="r"><i class="dot" style="background:var(--s${i + 1})"></i>${esc(l.nombre)}</th>`).join("")}<th class="r">Total del día</th></tr></thead>
        <tbody>${dias.slice().reverse().map((d) => { const ing = db.locales.reduce((s, l) => s + (Number(map.get(d + "|" + l.id)?.ingresos) || 0), 0), eg = db.locales.reduce((s, l) => s + (map.get(d + "|" + l.id) ? F.cajaEgresos(map.get(d + "|" + l.id)) : 0), 0);
          return `<tr><td style="white-space:nowrap"><b>${fmt.short(d)}</b> <span class="muted small">${dow(d)}</span></td>${db.locales.map((l) => cell(d, l)).join("")}<td class="r num day-cell"><b>${money0(ing)}</b><span class="eg">${eg ? "− " + fmt.money(eg) : ""}</span></td></tr>`; }).join("")}
        </tbody>
        <tfoot><tr><td><b>Total</b></td>${db.locales.map((l) => `<td class="r num day-cell"><b>${fmt.money(porLoc[l.id].ing)}</b><span class="eg">− ${fmt.money(porLoc[l.id].eg)}</span><span class="queda">Queda ${fmt.money(porLoc[l.id].ing - porLoc[l.id].eg)}</span></td>`).join("")}<td class="r num day-cell"><b>${fmt.money(tot.ing)}</b><span class="eg">− ${fmt.money(tot.eg)}</span><span class="queda">Queda ${fmt.money(tot.ing - tot.eg)}</span></td></tr></tfoot>
      </table></div>
      ${!dias.length ? `<div class="empty">Este mes todavía no empieza.</div>` : ""}
    </section>`;
  }

  /** Registrar o editar el reporte de un día: ingresos y egresos, cada uno como un solo total o por categoría. */
  function openCajaDialog(id, preset) {
    if (!isAdmin() && !id) return;
    const ro = !isAdmin();
    const r0 = id ? db.reportes.find((x) => x.id === id) : null;
    const blank = () => ({ categoriaId: "", monto: "", nueva: "" });
    const fromLines = (ls) => (ls && ls.length ? ls.map((l) => ({ categoriaId: l.categoriaId || "", monto: showNum(l.monto), nueva: "" })) : [blank()]);
    const modoOf = (ls) => (ls.length > 1 || ls.some((l) => l.categoriaId) ? "cat" : "total");
    const ing0 = r0 ? fromLines(r0.ingLineas && r0.ingLineas.length ? r0.ingLineas : [{ categoriaId: "", monto: r0.ingresos }]) : [blank()];
    const eg0 = r0 ? fromLines(r0.lineas) : [blank()];
    const st = {
      localId: r0 ? r0.localId : preset.localId, fecha: r0 ? r0.hasta : preset.fecha, obs: r0 ? r0.obs || "" : "",
      ing: { modo: modoOf(ing0), lineas: ing0 }, eg: { modo: modoOf(eg0), lineas: eg0 },
    };
    const SEC = { ing: { tipo: "ingreso", label: "Ingresos del día", hint: "Todo el dinero que entró ese día en el local.", ej: "Ej.: ventas de panadería, pedidos" },
      eg: { tipo: "egreso", label: "Egresos del día", hint: "Todo lo que se pagó ese día: insumos, gas, luz, arriendo…", ej: "Ej.: gas, transporte, arriendo" } };
    let confirmDel = false, errs = [];
    const { ov, close } = dialog(`<form class="dialog wide" id="caja-form" novalidate role="dialog" aria-modal="true" aria-labelledby="cj-t"></form>`);
    const form = $("#caja-form", ov);
    const sum = (k) => st[k].lineas.reduce((s, l) => s + (numOk(l.monto) || 0), 0);
    const opts = (k, val) => {
      const tipo = SEC[k].tipo, act = db.categorias.filter((c) => c.activo && c.tipo === tipo);
      const extra = val && val !== "__nueva" && !act.some((c) => c.id === val) ? [catById(val)] : [];
      return `<option value="" ${!val ? "selected" : ""}>Sin detallar</option>${act.concat(extra).map((c) => `<option value="${c.id}" ${val === c.id ? "selected" : ""}>${esc(c.nombre)}</option>`).join("")}${ro ? "" : `<option value="__nueva" ${val === "__nueva" ? "selected" : ""}>+ Nueva categoría…</option>`}`;
    };
    const section = (k) => {
      const S = SEC[k], x = st[k];
      return `<div class="field caja-sec ${k}"><div class="lbl-row"><span class="lbl">${S.label}</span>
        ${ro ? "" : `<div class="segmented small-seg" role="group" aria-label="Forma de registrar ${S.label.toLowerCase()}"><button type="button" class="seg" aria-pressed="${x.modo === "total"}" data-cm="${k}:total">Un solo total</button><button type="button" class="seg" aria-pressed="${x.modo === "cat"}" data-cm="${k}:cat">Por categoría</button></div>`}</div>
        ${x.modo === "total"
          ? `<input class="input num big-input" data-cl="${k}:0:monto" inputmode="decimal" placeholder="0,00" value="${esc(x.lineas[0].monto)}" aria-label="${S.label}" ${ro ? "readonly" : ""}><span class="hint">${S.hint}</span>`
          : `<div class="eg-lines">${x.lineas.map((l, i) => `<div class="eg-line">
              <select class="input" data-cl="${k}:${i}:categoriaId" aria-label="Categoría" ${ro ? "disabled" : ""}>${opts(k, l.categoriaId)}</select>
              <input class="input num" data-cl="${k}:${i}:monto" inputmode="decimal" placeholder="0,00" value="${esc(l.monto)}" aria-label="Monto" ${ro ? "readonly" : ""}>
              ${ro ? "" : `<button type="button" class="icon-btn" data-cdel="${k}:${i}" aria-label="Quitar línea">${ICON.x}</button>`}
              ${l.categoriaId === "__nueva" ? `<input class="input nueva-cat" data-cl="${k}:${i}:nueva" maxlength="50" placeholder="Nombre de la nueva categoría (${S.ej.toLowerCase()})" value="${esc(l.nueva)}" aria-label="Nueva categoría">` : ""}
            </div>`).join("")}</div>
            ${ro ? "" : `<div><button type="button" class="btn ghost" data-cadd="${k}">${ICON.plus} Agregar ${k === "ing" ? "ingreso" : "egreso"}</button></div>`}
            ${k === "eg" && !ro ? `<span class="hint">Los sueldos no van aquí: se cuentan solos al aprobar el rol de pagos en Personal.</span>` : ""}`}
      </div>`;
    };
    const sumHtml = () => { const i = sum("ing"), e = sum("eg"), q = i - e; return `<div><span>Ingresos</span><b>${fmt.money(i)}</b></div><div><span>Egresos</span><b style="color:var(--bad)">− ${fmt.money(e)}</b></div><div class="q"><span>Queda</span><b style="color:${q >= 0 ? "var(--good)" : "var(--bad)"}">${fmt.money(q)}</b></div>`; };
    function paint() {
      form.innerHTML = `${dlgHead("cj-t", ro ? "Reporte del día" : r0 ? "Editar reporte del día" : "Registrar reporte del día")}
        <div class="grid2">
          <div class="field"><label for="cj-local">Local</label>${ro ? `<b>${esc(local(st.localId).nombre)}</b>` : localSelect("cj-local", st.localId)}</div>
          <div class="field"><label for="cj-fecha">Fecha</label>${ro ? `<b>${fmt.date(st.fecha)}</b>` : `<input class="input" type="date" id="cj-fecha" value="${st.fecha}" max="${today()}">`}</div>
        </div>
        ${section("ing")}
        ${section("eg")}
        <div class="caja-sum num">${sumHtml()}</div>
        <div class="field"><label for="cj-obs">Observación</label><input class="input" id="cj-obs" maxlength="200" placeholder="Opcional" value="${esc(st.obs)}" ${ro ? "readonly" : ""}></div>
        <div class="errors">${errBox(errs)}</div>
        ${confirmDel ? `<div class="confirm-box"><span>Se eliminará el reporte de <b>${esc(local(st.localId).nombre)}</b> del ${fmt.date(st.fecha)}. Queda registrado en la actividad.</span><div class="actions"><button type="button" class="btn ghost" data-cdelno>Cancelar</button><button type="button" class="btn danger" data-cdelok>Eliminar</button></div></div>` : ""}
        <div class="actions">${r0 && !ro ? `<button type="button" class="btn danger ghost-danger" data-cdelask style="margin-right:auto">Eliminar</button>` : ""}<button type="button" class="btn" data-close>${ro ? "Cerrar" : "Cancelar"}</button>${ro ? "" : `<button class="btn primary" type="submit">${r0 ? "Guardar cambios" : "Guardar"}</button>`}</div>`;
    }
    const sync = () => {
      if (ro) return;
      st.localId = $("#cj-local", form).value; st.fecha = $("#cj-fecha", form).value; st.obs = $("#cj-obs", form).value;
      form.querySelectorAll("[data-cl]").forEach((el) => { const [k, i, f] = el.dataset.cl.split(":"); st[k].lineas[i][f] = el.value; });
    };
    form.addEventListener("input", () => { sync(); $(".caja-sum", form).innerHTML = sumHtml(); });
    form.addEventListener("change", (e) => {
      sync();
      if (e.target.matches("select[data-cl]") && (e.target.value === "__nueva" || form.querySelector(".nueva-cat"))) { const pos = e.target.dataset.cl; paint(); const [k, i] = pos.split(":"); form.querySelector(`[data-cl="${k}:${i}:nueva"]`)?.focus(); }
    });
    form.addEventListener("click", (e) => {
      const t = e.target.closest("[data-cm],[data-cadd],[data-cdel],[data-cdelask],[data-cdelno],[data-cdelok]"); if (!t) return;
      sync();
      if (t.dataset.cm) {
        const [k, modo] = t.dataset.cm.split(":"), x = st[k];
        if (modo === "total" && x.modo === "cat") { const tot = sum(k); x.lineas = [{ categoriaId: "", monto: tot ? showNum(round2(tot)) : "", nueva: "" }]; }
        x.modo = modo;
      }
      if (t.dataset.cadd) st[t.dataset.cadd].lineas.push(blank());
      if (t.dataset.cdel) { const [k, i] = t.dataset.cdel.split(":"); st[k].lineas.splice(Number(i), 1); if (!st[k].lineas.length) st[k].lineas.push(blank()); }
      if (t.dataset.cdelask !== undefined) confirmDel = true;
      if (t.dataset.cdelno !== undefined) confirmDel = false;
      if (t.dataset.cdelok !== undefined) {
        db.reportes = db.reportes.filter((x) => x.id !== r0.id);
        audit("Reporte diario eliminado", `${local(r0.localId).nombre} · ${fmt.date(r0.hasta)} · ingresos ${fmt.money(r0.ingresos)}, egresos ${fmt.money(F.cajaEgresos(r0))}`);
        save(); close(); render(); return toast("Reporte eliminado");
      }
      paint();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault(); if (ro) return; sync(); errs = [];
      if (!st.fecha) errs.push("Elige la fecha.");
      if (st.fecha > today()) errs.push("La fecha no puede ser futura.");
      const nuevas = [];
      const clean = (k) => {
        const out = [];
        for (const l of st[k].lineas) {
          const m = numOk(l.monto);
          if (isNaN(m) || m < 0) { errs.push(`${k === "ing" ? "Cada ingreso" : "Cada egreso"} debe ser un número igual o mayor a 0 (usa coma o punto para los centavos).`); continue; }
          let cat = st[k].modo === "total" ? "" : l.categoriaId;
          if (cat === "__nueva") {
            const n = l.nueva.trim().replace(/\s+/g, " ");
            if (!n) { errs.push(`Escribe el nombre de la nueva categoría de ${k === "ing" ? "ingreso" : "egreso"}.`); continue; }
            nuevas.push({ k, n, l }); cat = "__nueva:" + n;
          }
          if (m > 0) out.push({ categoriaId: cat, monto: round2(m) });
        }
        return out;
      };
      let ingL = clean("ing"), egL = clean("eg");
      if (!errs.length && !ingL.length && !egL.length) errs.push("Escribe los ingresos o los egresos del día.");
      const dup = db.reportes.find((x) => x.tipo === "CAJA" && x.localId === st.localId && x.hasta === st.fecha && x.id !== (r0 && r0.id));
      if (dup) errs.push(`${local(st.localId).nombre} ya tiene un reporte del ${fmt.date(st.fecha)}. Ábrelo desde la tabla para corregirlo.`);
      if (errs.length) return paint();
      // Categorías nuevas: se crean al guardar (si ya existe una con ese nombre, se usa esa)
      const resolve = (ls, tipo) => ls.map((l) => {
        if (!String(l.categoriaId).startsWith("__nueva:")) return l;
        const n = l.categoriaId.slice(8), ex = db.categorias.find((c) => c.tipo === tipo && c.nombre.toLowerCase() === n.toLowerCase());
        if (ex) { ex.activo = true; return { ...l, categoriaId: ex.id }; }
        const c = { id: "c" + uid(), nombre: n, tipo, activo: true }; db.categorias.push(c); audit("Categoría creada", `${n} (${tipo})`);
        return { ...l, categoriaId: c.id };
      });
      ingL = resolve(ingL, "ingreso"); egL = resolve(egL, "egreso");
      const ing = round2(ingL.reduce((a, l) => a + l.monto, 0));
      const rep = { id: r0 ? r0.id : uid(), tipo: "CAJA", localId: st.localId, desde: st.fecha, hasta: st.fecha, ingresos: ing, ingLineas: ingL, lineas: egL, estado: "CONFIRMADO", obs: st.obs.trim(), creado: r0 ? r0.creado : util.now(), editado: r0 ? util.now() : null };
      if (r0) db.reportes[db.reportes.findIndex((x) => x.id === r0.id)] = rep; else db.reportes.push(rep);
      const eg = F.cajaEgresos(rep);
      audit(r0 ? "Reporte diario corregido" : "Reporte diario registrado", `${local(rep.localId).nombre} · ${fmt.date(rep.hasta)} · ingresos ${fmt.money(rep.ingresos)}, egresos ${fmt.money(eg)}${r0 && (r0.ingresos !== rep.ingresos || F.cajaEgresos(r0) !== eg) ? ` (antes ${fmt.money(r0.ingresos)} / ${fmt.money(F.cajaEgresos(r0))})` : ""}`);
      ui.diaMes = rep.hasta.slice(0, 7);
      save(); close(); render(); toast(r0 ? "Reporte corregido" : "Reporte guardado");
    });
    paint();
    if (!ro) form.querySelector('[data-cl="ing:0:monto"]')?.focus();
  }

  /* ---------- Categorías (dentro de Reportes diarios) ---------- */
  function viewCategorias() {
    const uso = new Map();
    for (const r of db.reportes) if (r.tipo === "CAJA" || r.tipo === "GASTO") {
      for (const l of r.lineas) if (l.categoriaId) uso.set(l.categoriaId, (uso.get(l.categoriaId) || 0) + 1);
      for (const l of r.ingLineas || []) if (l.categoriaId) uso.set(l.categoriaId, (uso.get(l.categoriaId) || 0) + 1);
    }
    const editing = ui.catEdit;
    const tabla = (tipo) => {
      const cats = db.categorias.filter((c) => c.tipo === tipo);
      return `<section class="card">
        <div class="card-head"><div><h2>Categorías de ${tipo === "ingreso" ? "ingresos" : "egresos"}</h2><p class="muted small">${tipo === "ingreso" ? "De dónde viene el dinero que entra." : "En qué se va el dinero que sale."}</p></div></div>
        ${isAdmin() ? `<form class="cat-form" data-tipo="${tipo}" novalidate><input class="input" maxlength="50" placeholder="${tipo === "ingreso" ? "Nueva categoría, por ejemplo: Catering" : "Nueva categoría, por ejemplo: Publicidad"}" aria-label="Nueva categoría"><button class="btn primary" type="submit">${ICON.plus} Crear</button><div class="cat-err" style="grid-column:1/-1"></div></form>` : ""}
        <div class="table-wrap"><table>
          <thead><tr><th>Categoría</th><th class="r">Veces usada</th><th>Estado</th>${isAdmin() ? "<th></th>" : ""}</tr></thead>
          <tbody>${cats.map((c) => `<tr><td>${editing === c.id ? `<form class="cat-rename" data-id="${c.id}"><input class="input" id="cat-ren" value="${esc(c.nombre)}" maxlength="50"><button class="btn small-btn primary" type="submit">Guardar</button><button class="btn small-btn ghost" type="button" data-f="cat-cancel">Cancelar</button></form>` : `<b>${esc(c.nombre)}</b>`}</td>
            <td class="r num">${uso.get(c.id) || 0}</td><td>${c.activo ? '<span class="pill good">Activa</span>' : '<span class="pill neutral">Desactivada</span>'}</td>
            ${isAdmin() ? `<td style="text-align:right;white-space:nowrap">${editing === c.id ? "" : `<button class="btn ghost small-btn" data-f="cat-edit" data-id="${c.id}">Renombrar</button><button class="btn ghost small-btn" data-f="cat-toggle" data-id="${c.id}">${c.activo ? "Desactivar" : "Activar"}</button>${uso.get(c.id) ? "" : `<button class="btn ghost small-btn" data-f="cat-del" data-id="${c.id}">Eliminar</button>`}`}</td>` : ""}</tr>`).join("")}
          ${tipo === "egreso" ? `<tr><td><b>${F.SUELDOS.nombre}</b> <span class="muted small">· la llenan los roles de pago aprobados en Personal</span></td><td class="r num">${db.reportes.filter((r) => r.tipo === "ROL" && r.estado === "CONFIRMADO").length}</td><td><span class="pill neutral">Del sistema</span></td>${isAdmin() ? "<td></td>" : ""}</tr>` : ""}
          </tbody></table></div>
      </section>`;
    };
    return `${tabla("ingreso")}${tabla("egreso")}
      <p class="muted small">También puedes crear una categoría al registrar el día: en «Por categoría», elige «+ Nueva categoría…». Una categoría que ya se usó no se puede eliminar (el historial la necesita), pero sí desactivar.</p>`;
  }

  /* ---------- Personal y roles de pago ---------- */
  const FREQ = { MENSUAL: "Mensual", QUINCENAL: "Quincenal" };
  const costoMes = (e) => F.rolLinea(e, { dias: 30 }, db.nomina, "M", today()).costo;
  function viewPersonal() {
    const tab = ui.perTab || "trabajadores";
    if (tab === "roles" && ui.rolDraft) return viewRolEditor();
    if (tab === "roles" && ui.viewId) { const r = db.reportes.find((x) => x.id === ui.viewId && x.tipo === "ROL"); if (r) return viewRolDetalle(r); }
    const head = `<div class="page-head">
      <div class="lead"><span class="eyebrow">Trabajadores de los 3 locales</span><h1>Personal y roles de pago</h1><p>Sueldos, aportes al IESS y beneficios de ley. Al aprobar un rol, su costo entra como gasto del local.</p></div>
      ${isAdmin() ? (tab === "trabajadores" ? `<button class="btn primary" data-f="emp-new">${ICON.plus} Nuevo trabajador</button>` : tab === "roles" ? `<button class="btn primary" data-f="rol-new">${ICON.plus} Nuevo rol de pagos</button>` : "") : ""}
    </div>
    ${ftabs("perTab", tab, [["trabajadores", "Trabajadores", "personal"], ["roles", "Roles de pago", "reportes"], ["config", "Valores de ley", "ajustes"]])}`;
    if (tab === "roles") return head + viewRoles();
    if (tab === "config") return head + viewNomina();
    const loc = ui.perLocal || "todos", ver = ui.perVer || "activos";
    const emps = db.empleados.filter((e) => (loc === "todos" || e.localId === loc) && (ver === "todos" || (ver === "activos") === (e.activo !== false))).sort((a, b) => locIdx(a.localId) - locIdx(b.localId) || a.nombre.localeCompare(b.nombre, "es"));
    const act = db.empleados.filter((e) => e.activo !== false && (loc === "todos" || e.localId === loc));
    const sueldos = act.reduce((a, e) => a + (Number(e.sueldo) || 0), 0), costo = act.reduce((a, e) => a + costoMes(e), 0);
    const anos = (d) => { const y = (new Date(today()) - new Date(d)) / (365.25 * 864e5); return y >= 1 ? `${Math.floor(y)} año${Math.floor(y) === 1 ? "" : "s"}` : `${Math.max(0, Math.floor(y * 12))} mes${Math.floor(y * 12) === 1 ? "" : "es"}`; };
    return head + `
    <div class="toolbar">${segLocal("perLocal", loc)}<div class="segmented" role="group" aria-label="Mostrar">${[["activos", "Activos"], ["inactivos", "Inactivos"], ["todos", "Todos"]].map(([k, x]) => `<button class="seg" aria-pressed="${ver === k}" data-f="set" data-key="perVer" data-v="${k}">${x}</button>`).join("")}</div></div>
    <section class="minis" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="mini"><span>Trabajadores activos</span><b class="num">${act.length}</b></div>
      <div class="mini"><span>Sueldos al mes</span><b class="num">${fmt.money(sueldos)}</b></div>
      <div class="mini"><span>Costo real al mes (con IESS y beneficios)</span><b class="num">${fmt.money(costo)}</b></div>
    </section>
    <section class="card">
      ${emps.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Nombre</th><th>Local</th><th class="hide-sm">Cargo</th><th class="r">Sueldo</th><th>Pago</th><th class="hide-sm">IESS</th><th class="hide-sm">Antigüedad</th><th class="r">Costo al mes</th></tr></thead>
        <tbody>${emps.map((e) => `<tr class="click" tabindex="0" data-f="emp-edit" data-id="${e.id}"><td style="white-space:nowrap"><b>${esc(e.nombre)}</b>${e.activo === false ? ' <span class="pill neutral">Inactivo</span>' : ""}</td><td style="white-space:nowrap">${esc(local(e.localId).nombre)}</td><td class="hide-sm">${esc(e.cargo || "—")}</td>
          <td class="r num">${fmt.money(e.sueldo)}</td><td>${FREQ[e.frecuencia]}</td><td class="hide-sm">${e.iess ? '<span class="pill good">Afiliado</span>' : '<span class="pill warn">No afiliado</span>'}${e.decimos === false ? ' <span class="pill neutral plain">Sin décimos</span>' : ""}</td><td class="hide-sm">${e.ingreso ? anos(e.ingreso) : "—"}</td><td class="r num"><b>${fmt.money(costoMes(e))}</b></td></tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">No hay trabajadores con estos filtros.${isAdmin() ? " Agrega el primero con «Nuevo trabajador»." : ""}</div>`}
      <p class="muted small" style="margin-top:12px">Costo al mes = sueldo + aporte patronal al IESS + décimo tercero + décimo cuarto + fondos de reserva, según lo que recibe cada trabajador. Los sueldos no se registran en el reporte diario: cuentan como egreso al aprobar el rol de pagos.</p>
    </section>`;
  }

  function openEmpDialog(id) {
    const ro = !isAdmin();
    const e0 = id ? db.empleados.find((x) => x.id === id) : null;
    if (!e0 && ro) return;
    const v = e0 || { nombre: "", localId: ui.perLocal && ui.perLocal !== "todos" ? ui.perLocal : db.locales[0].id, cargo: "", sueldo: db.nomina.sbu, frecuencia: "MENSUAL", ingreso: today(), iess: true, decimos: true, decimosMensual: false, fondos: true, fondosEnRol: true, activo: true };
    const { ov, close } = dialog(`<form class="dialog" id="emp-form" novalidate role="dialog" aria-modal="true" aria-labelledby="em-t">
      ${dlgHead("em-t", ro ? esc(v.nombre) : e0 ? "Editar trabajador" : "Nuevo trabajador")}
      <div class="field"><label for="em-nombre">Nombre completo</label><input class="input" id="em-nombre" maxlength="80" value="${esc(v.nombre)}" placeholder="Ej.: María Torres"></div>
      <div class="grid2"><div class="field"><label for="em-local">Local donde trabaja</label>${localSelect("em-local", v.localId)}</div>
        <div class="field"><label for="em-cargo">Cargo</label><input class="input" id="em-cargo" maxlength="60" value="${esc(v.cargo || "")}" placeholder="Ej.: Panadero, vendedora" list="em-cargos"><datalist id="em-cargos">${["Panadero", "Ayudante de panadería", "Pastelera", "Vendedora", "Cajera", "Repartidor"].map((x) => `<option value="${x}">`).join("")}</datalist></div></div>
      <div class="grid2"><div class="field"><label for="em-sueldo">Sueldo mensual</label><input class="input num" id="em-sueldo" inputmode="decimal" value="${showNum(v.sueldo)}"><span class="hint">Salario básico 2026: ${fmt.money(db.nomina.sbu)}.</span></div>
        <div class="field"><label for="em-freq">Se le paga</label><select class="input" id="em-freq">${Object.entries(FREQ).map(([k, x]) => `<option value="${k}" ${v.frecuencia === k ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
      <div class="field"><label for="em-ing">Fecha de ingreso</label><input class="input" type="date" id="em-ing" value="${v.ingreso || ""}" max="${today()}"><span class="hint">Para saber desde cuándo le corresponden fondos de reserva (al año).</span></div>
      <div class="checks-col">
        <label class="check-line"><input type="checkbox" id="em-iess" ${v.iess ? "checked" : ""}><span>Afiliado al IESS <span class="muted small">(se le descuenta el aporte personal y EduPan paga el patronal)</span></span></label>
        <label class="check-line"><input type="checkbox" id="em-dec" ${v.decimos !== false ? "checked" : ""}><span>Recibe décimo tercero y décimo cuarto</span></label>
        <label class="check-line sub-check" id="em-decm-l" ${v.decimos !== false ? "" : "hidden"}><input type="checkbox" id="em-decm" ${v.decimosMensual ? "checked" : ""}><span>Se los pagan cada mes en el rol (mensualizados)</span></label>
        <label class="check-line" id="em-fon-l"><input type="checkbox" id="em-fon" ${v.fondos !== false && v.iess ? "checked" : ""} ${v.iess ? "" : "disabled"}><span>Recibe fondos de reserva <span class="muted small">(con IESS, desde el primer año)</span></span></label>
        <label class="check-line sub-check" id="em-fonr-l" ${v.fondos !== false && v.iess ? "" : "hidden"}><input type="checkbox" id="em-fonr" ${v.fondosEnRol !== false ? "checked" : ""}><span>Se los pagan en el rol (si no, se depositan en el IESS)</span></label>
        ${e0 ? `<label class="check-line"><input type="checkbox" id="em-act" ${v.activo !== false ? "checked" : ""}><span>Trabajador activo</span></label>` : ""}
      </div>
      <div id="em-prev" class="note info"></div>
      <div id="em-err" class="errors"></div>
      <div class="actions"><button type="button" class="btn" data-close>${ro ? "Cerrar" : "Cancelar"}</button>${ro ? "" : `<button class="btn primary" type="submit">Guardar</button>`}</div>
    </form>`);
    const f = $("#emp-form", ov);
    if (ro) f.querySelectorAll("input,select").forEach((x) => { x.disabled = true; });
    const cur = () => ({ id: e0 ? e0.id : "x", nombre: $("#em-nombre", f).value.trim(), localId: $("#em-local", f).value, cargo: $("#em-cargo", f).value.trim(), sueldo: numOk($("#em-sueldo", f).value), frecuencia: $("#em-freq", f).value, ingreso: $("#em-ing", f).value, iess: $("#em-iess", f).checked, decimos: $("#em-dec", f).checked, decimosMensual: $("#em-dec", f).checked && $("#em-decm", f).checked, fondos: $("#em-iess", f).checked && $("#em-fon", f).checked, fondosEnRol: $("#em-fonr", f).checked, activo: e0 ? $("#em-act", f).checked : true });
    const prev = () => {
      // Opciones que dependen de otras
      const iess = $("#em-iess", f).checked;
      $("#em-fon", f).disabled = !iess || ro; if (!iess) $("#em-fon", f).checked = false;
      $("#em-decm-l", f).hidden = !$("#em-dec", f).checked;
      $("#em-fonr-l", f).hidden = !$("#em-fon", f).checked;
      const e = cur(), box = $("#em-prev", f);
      if (isNaN(e.sueldo) || e.sueldo <= 0) { box.textContent = "Escribe el sueldo para ver cuánto recibe y cuánto cuesta."; return; }
      const l = F.rolLinea(e, { dias: 30 }, db.nomina, "M", today());
      const anios = e.ingreso ? (new Date(today()) - new Date(e.ingreso)) / (365.25 * 864e5) : 0;
      const partes = [[l.patronal, "aporte patronal IESS"], [l.d13, "décimo tercero"], [l.d14, "décimo cuarto"], [l.fondos, "fondos de reserva"]].filter(([x]) => x > 0);
      box.innerHTML = `En un mes completo recibe <b>${fmt.money(l.neto)}</b>${l.iessP ? ` (con el descuento del IESS de ${fmt.money(l.iessP)})` : ""}${l.decimosMensual ? " incluidos los décimos" : ""}. `
        + (partes.length ? `A EduPan le cuesta <b>${fmt.money(l.costo)}</b>: sueldo ${fmt.money(l.total)} + ${partes.map(([x, n]) => `${n} ${fmt.money(x)}`).join(" + ")}.` : `A EduPan le cuesta <b>${fmt.money(l.costo)}</b>: solo el sueldo, sin aportes ni beneficios.`)
        + (e.iess && e.fondos && anios < 1 ? `<br><span class="muted">Los fondos de reserva empiezan cuando cumpla un año de trabajo.</span>` : "");
      if (e.sueldo < db.nomina.sbu) box.innerHTML += `<br><span style="color:var(--bad)">Ojo: es menos que el salario básico (${fmt.money(db.nomina.sbu)}) para jornada completa.</span>`;
    };
    f.addEventListener("input", prev); f.addEventListener("change", prev); prev();
    f.addEventListener("submit", (ev) => {
      ev.preventDefault(); if (ro) return;
      const e = cur(), errs = [];
      if (!e.nombre) errs.push("Escribe el nombre.");
      if (isNaN(e.sueldo) || e.sueldo <= 0) errs.push("El sueldo debe ser mayor a 0.");
      if (!e.ingreso) errs.push("Escribe la fecha de ingreso.");
      if (errs.length) { $("#em-err", f).innerHTML = errBox(errs); return; }
      e.sueldo = round2(e.sueldo); e.nombre = e.nombre.replace(/\s+/g, " ");
      if (e0) { const antes = e0.sueldo; Object.assign(e0, e, { id: e0.id, ejemplo: false }); audit("Trabajador editado", `${e.nombre} · ${local(e.localId).nombre} · sueldo ${fmt.money(antes)} → ${fmt.money(e.sueldo)}${e.activo ? "" : " · inactivo"}`); }
      else { e.id = uid(); db.empleados.push(e); audit("Trabajador agregado", `${e.nombre} · ${local(e.localId).nombre} · ${e.cargo || "sin cargo"} · ${fmt.money(e.sueldo)}`); }
      save(); close(); render(); toast("Trabajador guardado");
    });
    if (!ro) $("#em-nombre", f).focus();
  }

  function viewRoles() {
    const roles = db.reportes.filter((r) => r.tipo === "ROL" && (!ui.perLocal || ui.perLocal === "todos" || r.localId === ui.perLocal)).sort((a, b) => b.hasta.localeCompare(a.hasta) || locIdx(a.localId) - locIdx(b.localId));
    const nf = ui.rolNew;
    return `
    ${nf ? `<section class="card" style="display:grid;gap:14px"><div><h2>Nuevo rol de pagos</h2><p class="muted small">Se arma con los trabajadores activos del local que cobran con esa frecuencia. Luego completas días, horas extra, bonos y descuentos.</p></div>
      <form id="rolnew-form" class="grid3" style="align-items:end" novalidate>
        <div class="field"><label for="rn-mes">Mes</label><input class="input" type="month" id="rn-mes" value="${nf.mes}" max="${curMes()}"></div>
        <div class="field"><label for="rn-tramo">Período</label><select class="input" id="rn-tramo">${[["M", "Mes completo (mensuales)"], ["Q1", "1.ª quincena (quincenales)"], ["Q2", "2.ª quincena (quincenales)"]].map(([k, x]) => `<option value="${k}" ${nf.tramo === k ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label for="rn-local">Local</label>${localSelect("rn-local", nf.localId)}</div>
        <div id="rn-err" style="grid-column:1/-1"></div>
        <div class="actions" style="grid-column:1/-1"><button type="button" class="btn ghost" data-f="rol-new-cancel">Cancelar</button><button class="btn primary" type="submit">Armar rol</button></div>
      </form></section>` : ""}
    <section class="card">
      <div class="card-head"><div><h2>Roles de pago</h2><p class="muted small">Solo los aprobados cuentan como gasto de sueldos del local.</p></div>${segLocal("perLocal", ui.perLocal || "todos", "Todos")}</div>
      ${roles.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Período</th><th>Local</th><th class="r">Trabajadores</th><th class="r">Neto a pagar</th><th class="r hide-sm">Costo para EduPan</th><th>Estado</th></tr></thead>
        <tbody>${roles.map((r) => { const t = F.rolTotals(r); return `<tr class="click" tabindex="0" data-open="${r.id}" data-route="personal"><td style="white-space:nowrap"><b>${esc(r.periodoTxt)}</b></td><td>${esc(local(r.localId).nombre)}</td><td class="r num">${t.n}</td><td class="r num"><b>${fmt.money(t.neto)}</b></td><td class="r num hide-sm">${fmt.money(t.costo)}</td><td>${r.estado === "CONFIRMADO" ? '<span class="pill good">Aprobado</span>' : '<span class="pill warn">Borrador</span>'}</td></tr>`; }).join("")}</tbody></table></div>`
        : `<div class="empty">Todavía no hay roles de pago.${isAdmin() ? " Crea el primero con «Nuevo rol de pagos»." : ""}</div>`}
    </section>`;
  }

  function rolCompute(d) {
    const per = F.periodo(d.mes, d.tramo);
    return d.ids.map((id) => { const e = d.snap[id]; return F.rolLinea(e, d.inp[id], db.nomina, d.tramo, per.hasta); });
  }
  function viewRolEditor() {
    const d = ui.rolDraft, per = F.periodo(d.mes, d.tramo), lines = rolCompute(d), t = F.rolTotals({ lineas: lines });
    const inp = (id, k, ph, w) => `<input class="input num cell-in" data-rol="${id}:${k}" inputmode="decimal" value="${esc(showNum(d.inp[id][k]))}" placeholder="${ph}" aria-label="${k}" style="width:${w || 66}px">`;
    return `
    <button class="btn ghost back" data-f="rol-cancel">‹ Roles de pago</button>
    <div class="page-head"><div class="lead"><span class="eyebrow">${d.id ? "Editar" : "Nuevo"} rol de pagos · ${esc(local(d.localId).nombre)}</span><h1>${esc(per.txt)}</h1><p>Del ${fmt.date(per.desde)} al ${fmt.date(per.hasta)}. Completa lo que cambie; lo demás se calcula solo.</p></div></div>
    <section class="card">
      <div class="table-wrap"><table class="rol-table">
        <thead><tr><th>Trabajador</th><th class="r">Días<br><span class="muted small">de ${per.dias}</span></th><th class="r">H. extra<br><span class="muted small">50 %</span></th><th class="r">H. extra<br><span class="muted small">100 %</span></th><th class="r">Bonos</th><th class="r">Anticipos</th><th class="r">Otros desc.</th><th class="r">Ingresos</th><th class="r">Neto a recibir</th><th class="r">Costo EduPan</th></tr></thead>
        <tbody>${lines.map((l) => `<tr><td style="white-space:nowrap"><b>${esc(l.nombre)}</b><br><span class="muted small">${esc(l.cargo || "")} · ${fmt.money(l.sueldo)}${l.iessAfiliado ? "" : " · sin IESS"}</span></td>
          <td class="r">${inp(l.empleadoId, "dias", per.dias, 50)}</td><td class="r">${inp(l.empleadoId, "h50", "0", 50)}</td><td class="r">${inp(l.empleadoId, "h100", "0", 50)}</td><td class="r">${inp(l.empleadoId, "bonos", "0,00")}</td><td class="r">${inp(l.empleadoId, "anticipos", "0,00")}</td><td class="r">${inp(l.empleadoId, "otros", "0,00")}</td>
          <td class="r num">${fmt.money(l.total)}</td><td class="r num"><b>${fmt.money(l.neto)}</b>${l.iessP ? `<br><span class="small" style="color:var(--bad)">IESS − ${fmt.money(l.iessP)}</span>` : ""}</td><td class="r num">${fmt.money(l.costo)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td><b>Total</b></td><td colspan="6"></td><td class="r num"><b>${fmt.money(t.total)}</b></td><td class="r num"><b>${fmt.money(t.neto)}</b><br><span class="small" style="color:var(--bad)">IESS − ${fmt.money(t.iess)}</span></td><td class="r num"><b>${fmt.money(t.costo)}</b></td></tr></tfoot>
      </table></div>
      <p class="muted small" style="margin-top:10px">Hora normal = sueldo ÷ ${db.nomina.horasMes}. Horas extra al 50 % (suplementarias) y al 100 % (extraordinarias, fines de semana o feriados). Aporte personal IESS ${showNum(db.nomina.iessPersonal)} %.</p>
    </section>
    <div class="two">
      <section class="card"><div class="card-head"><div><h2>Costo para EduPan</h2><p class="muted small">Lo que entra como gasto de sueldos al aprobar</p></div></div>
        <div class="totals num">
          <div><span class="muted">Ingresos de los trabajadores</span><span>${fmt.money(t.total)}</span></div>
          <div><span class="muted">Aporte patronal IESS (${showNum(db.nomina.iessPatronal)} %)</span><span>${fmt.money(t.patronal)}</span></div>
          <div><span class="muted">Décimo tercero, décimo cuarto y fondos de reserva</span><span>${fmt.money(t.provisiones)}</span></div>
          <div><span class="muted"><b>Costo total</b></span><b class="big">${fmt.money(t.costo)}</b></div>
        </div></section>
      <section class="card" style="display:grid;gap:12px;align-content:start">
        <div><h2>Guardar</h2><p class="muted small">El borrador no cuenta. Al aprobarlo, el costo entra como egreso de sueldos de ${esc(local(d.localId).nombre)} del ${fmt.date(per.hasta)}.</p></div>
        <div id="rol-err"></div>
        <div class="actions" style="justify-content:flex-start"><button class="btn" data-f="rol-save" data-v="BORRADOR">Guardar borrador</button><button class="btn primary" data-f="rol-save" data-v="CONFIRMADO">${ICON.check} Aprobar rol</button></div>
      </section>
    </div>`;
  }
  function viewRolDetalle(r) {
    const t = F.rolTotals(r);
    return `
    <button class="btn ghost back" data-f="rol-back">‹ Roles de pago</button>
    <div class="page-head"><div class="lead"><span class="eyebrow">Rol de pagos · ${esc(local(r.localId).nombre)}</span><h1>${esc(r.periodoTxt)}</h1>
      <p>${r.estado === "CONFIRMADO" ? `<span class="pill good">Aprobado</span> ${r.aprobado ? "el " + fmt.stamp(r.aprobado) : ""}` : '<span class="pill warn">Borrador · no cuenta como gasto</span>'}</p></div>
      <div class="actions">${!data.DEMO ? `<button class="btn" data-f="rol-xlsx" data-id="${r.id}">${ICON.informes} Excel para firmar</button>` : ""}
      ${isAdmin() ? (r.estado === "CONFIRMADO" ? `<button class="btn" data-f="rol-reopen" data-id="${r.id}">Reabrir para corregir</button>` : `<button class="btn danger ghost-danger" data-f="rol-del" data-id="${r.id}">Eliminar</button><button class="btn primary" data-f="rol-edit" data-id="${r.id}">Continuar editando</button>`) : ""}</div>
    </div>
    ${ui.rolConfirm === r.id ? `<div class="confirm-box"><span>¿Eliminar este borrador de rol?</span><div class="actions"><button class="btn ghost" data-f="rol-del-no">Cancelar</button><button class="btn danger" data-f="rol-del-ok" data-id="${r.id}">Eliminar</button></div></div>` : ""}
    <section class="kpis">
      <div class="kpi hero"><span class="eyebrow">Neto a pagar</span><span class="val num">${fmt.money(t.neto)}</span><span class="sub">${t.n} trabajador${t.n === 1 ? "" : "es"}</span></div>
      <div class="kpi"><span class="eyebrow">Ingresos</span><span class="val num">${fmt.money(t.total)}</span><span class="sub">Sueldos, horas extra y bonos</span></div>
      <div class="kpi"><span class="eyebrow">Descuentos</span><span class="val num" style="color:var(--bad)">${fmt.money(t.desc)}</span><span class="sub">IESS ${fmt.money(t.iess)} · anticipos y otros</span></div>
      <div class="kpi"><span class="eyebrow">Costo para EduPan</span><span class="val num">${fmt.money(t.costo)}</span><span class="sub">Con aporte patronal y beneficios</span></div>
    </section>
    <section class="card"><div class="table-wrap"><table>
      <thead><tr><th>Trabajador</th><th class="r">Días</th><th class="r">Sueldo ganado</th><th class="r">Horas extra</th><th class="r">Bonos</th><th class="r">Ingresos</th><th class="r">IESS</th><th class="r">Anticipos y otros</th><th class="r">Décimos y fondos en el rol</th><th class="r">Neto</th><th class="r hide-sm">Costo EduPan</th></tr></thead>
      <tbody>${r.lineas.map((l) => `<tr><td style="white-space:nowrap"><b>${esc(l.nombre)}</b><br><span class="muted small">${esc(l.cargo || "")}</span></td><td class="r num">${l.dias}</td><td class="r num">${fmt.money(l.ganado)}</td><td class="r num">${l.extras ? fmt.money(l.extras) : "—"}</td><td class="r num">${l.bonos ? fmt.money(l.bonos) : "—"}</td><td class="r num">${fmt.money(l.total)}</td><td class="r num" style="color:var(--bad)">${l.iessP ? "− " + fmt.money(l.iessP) : "—"}</td><td class="r num" style="color:var(--bad)">${l.anticipos + l.otros ? "− " + fmt.money(l.anticipos + l.otros) : "—"}</td><td class="r num">${round2(l.neto - l.total + l.desc) ? fmt.money(round2(l.neto - l.total + l.desc)) : "—"}</td><td class="r num"><b>${fmt.money(l.neto)}</b></td><td class="r num hide-sm">${fmt.money(l.costo)}</td></tr>`).join("")}</tbody>
    </table></div></section>`;
  }
  function newRolDraft(base) {
    if (base) {
      const snap = {}, inp = {}, ids = [];
      for (const l of base.lineas) { const e = db.empleados.find((x) => x.id === l.empleadoId) || {}; snap[l.empleadoId] = { ...e, id: l.empleadoId, nombre: l.nombre, cargo: l.cargo, sueldo: l.sueldo, iess: l.iessAfiliado, decimosMensual: l.decimosMensual }; inp[l.empleadoId] = { dias: l.dias, h50: l.h50 || "", h100: l.h100 || "", bonos: l.bonos || "", anticipos: l.anticipos || "", otros: l.otros || "" }; ids.push(l.empleadoId); }
      return { id: base.id, localId: base.localId, mes: base.mes, tramo: base.tramo, snap, inp, ids, creado: base.creado };
    }
  }
  function saveRol(estado) {
    const d = ui.rolDraft, per = F.periodo(d.mes, d.tramo), lineas = rolCompute(d), errs = [];
    for (const id of d.ids) for (const k of ["dias", "h50", "h100", "bonos", "anticipos", "otros"]) { const v = numOk(d.inp[id][k]); if (isNaN(v) || v < 0) { errs.push(`${d.snap[id].nombre}: revisa «${{ dias: "días", h50: "horas 50 %", h100: "horas 100 %", bonos: "bonos", anticipos: "anticipos", otros: "otros descuentos" }[k]}».`); } }
    if (errs.length) { $("#rol-err").innerHTML = errBox(errs); return; }
    const rep = { id: d.id || uid(), tipo: "ROL", localId: d.localId, desde: per.desde, hasta: per.hasta, mes: d.mes, tramo: d.tramo, periodoTxt: per.txt, lineas, estado, obs: "", creado: d.creado || util.now(), aprobado: estado === "CONFIRMADO" ? util.now() : null };
    const i = db.reportes.findIndex((x) => x.id === rep.id);
    if (i >= 0) db.reportes[i] = rep; else db.reportes.push(rep);
    const t = F.rolTotals(rep);
    audit(estado === "CONFIRMADO" ? "Rol de pagos aprobado" : "Rol de pagos guardado como borrador", `${local(rep.localId).nombre} · ${per.txt} · ${t.n} trabajadores · neto ${fmt.money(t.neto)} · costo ${fmt.money(t.costo)}`);
    ui.rolDraft = null; ui.viewId = rep.id;
    save(); render(); toast(estado === "CONFIRMADO" ? "Rol aprobado: ya cuenta como gasto" : "Borrador guardado");
  }
  function rolWorkbook(r) {
    const t = F.rolTotals(r), L = local(r.localId).nombre;
    const head = [[{ v: `EduPan Panaderías · Rol de pagos · ${L}`, s: "title" }], [{ v: `${r.periodoTxt} · del ${fmt.date(r.desde)} al ${fmt.date(r.hasta)} · ${r.estado === "CONFIRMADO" ? "Aprobado" : "Borrador"}`, s: "sub" }], []];
    const cols = ["Trabajador", "Cargo", "Días", "Sueldo ganado", "Horas extra", "Bonos", "Total ingresos", "Aporte IESS", "Anticipos", "Otros descuentos", "Décimos y fondos pagados", "Neto a recibir", "Firma"];
    const rows = head.concat([cols.map((v, i) => ({ v, s: i < 2 || i === 12 ? "header" : "headerR" }))]);
    const first = rows.length + 1;
    r.lineas.forEach((l) => rows.push([l.nombre, l.cargo || "", { v: l.dias, s: "int" }, { v: l.ganado, s: "money" }, { v: l.extras, s: "money" }, { v: l.bonos, s: "money" }, { v: l.total, s: "money" }, { v: l.iessP, s: "money" }, { v: l.anticipos, s: "money" }, { v: l.otros, s: "money" }, { v: round2(l.neto - l.total + l.desc), s: "money" }, { v: l.neto, s: "totalMoney" }, ""]));
    const last = rows.length, C = PPX.excel.colName;
    const vals = (l) => [l.ganado, l.extras, l.bonos, l.total, l.iessP, l.anticipos, l.otros, round2(l.neto - l.total + l.desc), l.neto];
    const sums = r.lineas.reduce((acc, l) => vals(l).map((v, i) => acc[i] + v), Array(9).fill(0));
    rows.push(["Total", "", "", ...[3, 4, 5, 6, 7, 8, 9, 10, 11].map((c, i) => ({ v: round2(sums[i]), s: "totalMoney", f: `SUM(${C(c)}${first}:${C(c)}${last})` })), ""].map((x, i) => (i === 0 ? { v: "Total", s: "totalLabel" } : x)));
    const heights = {}; for (let i = first; i <= last; i++) heights[i] = 30;
    const prov = head.concat([["Trabajador", "Ingresos", "Aporte patronal IESS", "Décimo tercero", "Décimo cuarto", "Fondos de reserva", "Costo total"].map((v, i) => ({ v, s: i ? "headerR" : "header" }))]);
    const pf = prov.length + 1;
    r.lineas.forEach((l) => prov.push([l.nombre, ...[l.total, l.patronal, l.d13, l.d14, l.fondos, l.costo].map((v) => ({ v, s: "money" }))]));
    const pl = prov.length;
    const pv = (l) => [l.total, l.patronal, l.d13, l.d14, l.fondos, l.costo];
    const ps = r.lineas.reduce((acc, l) => pv(l).map((v, i) => acc[i] + v), Array(6).fill(0));
    prov.push([{ v: "Total", s: "totalLabel" }, ...[1, 2, 3, 4, 5, 6].map((c, i) => ({ v: round2(ps[i]), s: "totalMoney", f: `SUM(${C(c)}${pf}:${C(c)}${pl})` }))]);
    prov.push([]); prov.push([{ v: `Valores usados: salario básico ${fmt.money(db.nomina.sbu)}, aporte personal ${db.nomina.iessPersonal} %, aporte patronal ${db.nomina.iessPatronal} %, fondos de reserva ${db.nomina.fondos} %. Costo total del rol: ${fmt.money(t.costo)}.`, s: "sub" }]);
    return [
      { name: "Rol de pagos", cols: [26, 20, 7, 13, 12, 11, 14, 12, 12, 13, 14, 15, 26], rows, freeze: "B5", heights },
      { name: "Costo para EduPan", cols: [26, 14, 18, 14, 14, 16, 14], rows: prov, freeze: "B5" },
    ];
  }

  function viewNomina() {
    const n = db.nomina, ro = !isAdmin();
    const fld = (k, l, h) => `<div class="field"><label for="nm-${k}">${l}</label><input class="input num" id="nm-${k}" data-nm="${k}" inputmode="decimal" value="${showNum(n[k])}" ${ro ? "readonly" : ""}><span class="hint">${h}</span></div>`;
    return `
    <section class="card" style="display:grid;gap:16px">
      <div><h2>Valores de ley para los roles</h2><p class="muted small">Vienen con los valores de Ecuador 2026. Si cambian (por ejemplo, el salario básico de 2027), actualízalos aquí; los roles ya aprobados no cambian.</p></div>
      <form id="nomina-form" class="grid3" novalidate>
        ${fld("sbu", "Salario básico unificado (USD)", "2026: $482. Base del décimo cuarto.")}
        ${fld("iessPersonal", "Aporte personal IESS (%)", "Se descuenta al trabajador.")}
        ${fld("iessPatronal", "Aporte patronal IESS (%)", "Lo paga EduPan (incluye IECE y SECAP).")}
        ${fld("fondos", "Fondos de reserva (%)", "Desde el primer año de trabajo.")}
        ${fld("horasMes", "Horas de trabajo al mes", "Para el valor de la hora: sueldo ÷ horas.")}
        ${ro ? "" : `<div class="field" style="align-self:end"><button class="btn primary" type="submit">Guardar valores</button></div>`}
        <div id="nm-err" style="grid-column:1/-1"></div>
      </form>
      <div class="note info">Décimo tercero = 1/12 de lo ganado. Décimo cuarto = salario básico ÷ 12 por mes trabajado. Cada beneficio se aplica solo a los trabajadores que lo reciben (se marca en su ficha). Confirma estos valores con tu contador.</div>
    </section>`;
  }

  /* ---------- Menú «Más» (celular) ---------- */
  function viewMas() {
    const it = (k, t, d) => `<a class="mas-item" href="#${k}">${ICON[k] || ICON.reportes}<span><b>${t}</b><span class="muted small">${d}</span></span></a>`;
    return `<div class="page-head"><div class="lead"><span class="eyebrow">Menú</span><h1>Más opciones</h1></div></div>
      <section class="card mas-list">${it("ajustes", "Ajustes", "Locales, usuarios, respaldo y actividad")}</section>
      <section class="card mas-list"><div><span class="eyebrow">Propuesta · registro por producto</span><p class="muted small" style="margin-top:4px">Para cuando se quiera llevar cada pan, torta o bebida por separado.</p></div>
        ${it("prod-panel", "Resumen por producto", "Ventas y ganancia de cada producto")}${it("reportes", "Ventas", "Registrar una venta con sus productos")}${it("inventario", "Inventario", "Existencias, entradas y pérdidas")}${it("productos", "Productos", "Catálogo con precio y costo")}</section>`;
  }
  const propuestaBanner = () => `<div class="note info propuesta"><b>Propuesta:</b> registro por producto (cada pan, torta o bebida por separado). Hoy el negocio se lleva con los <a href="#diario">reportes diarios</a> de ingresos y egresos; esta sección queda lista por si más adelante se quiere ese detalle. No suma en el Panel principal.</div>`;

  /* ---------- Gráficos de finanzas ---------- */
  function stackChart(ser, gran) {
    if (!ser.some((s) => s.ingresos || s.egresos)) return `<div class="empty">Sin reportes en este período.</div>`;
    const keys = ser.slice(-(gran === "dia" ? 31 : 16));
    const max = Math.max(1, ...keys.map((s) => Math.max(s.ingresos, s.caja)));
    const W = 620, H = 260, L = 54, B = 30, T = 22, R = 6, step = niceStep(max * 1.05), top = Math.ceil((max * 1.08) / step) * step;
    const cw = (W - L - R) / keys.length, bw = Math.min(34, cw * 0.62), y = (v) => T + (H - T - B) * (1 - v / top);
    const lbl = (k) => (gran === "mes" ? F.MESES[Number(k.slice(5, 7)) - 1].slice(0, 3) : fmt.short(k));
    let g = "";
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${axisMoney(v)}</text>`;
    const pts = [];
    keys.forEach((s, i) => {
      const x = L + i * cw + (cw - bw) / 2; let acc = 0; const segs = [];
      db.locales.forEach((l, j) => { const v = s.per[l.id] || 0; if (v) { segs.push({ l, j, v, from: acc }); acc += v; } });
      const clip = "c" + uid();
      g += `<g class="col" ${tt({ t: (gran === "dia" ? "" : gran === "semana" ? "Semana del " : "") + (gran === "mes" ? mesTxt(s.key.slice(0, 7)) : fmt.short(s.key)), s: `Ingresos ${fmt.money(s.ingresos)} · queda ${fmt.money(s.ingresos - s.caja)}`, r: segs.map((x) => [`var(--s${x.j + 1})`, x.l.nombre, fmt.money(x.v)]).concat([["var(--bad)", "Egresos del día", fmt.money(s.caja)]]) })}><rect class="hit" x="${L + i * cw + 1}" y="${T}" width="${Math.max(1, cw - 2)}" height="${H - T - B}" rx="6"/>`;
      g += `<clipPath id="${clip}"><rect x="${x}" y="${y(acc)}" width="${bw}" height="${Math.max(0, y(0) - y(acc))}" rx="${Math.min(6, bw / 3)}"/></clipPath><g class="grow" style="animation-delay:${(i * 0.03).toFixed(2)}s" clip-path="url(#${clip})">`;
      for (const sg of segs) g += `<rect x="${x}" y="${y(sg.from + sg.v)}" width="${bw}" height="${Math.max(0, y(sg.from) - y(sg.from + sg.v))}" fill="var(--s${sg.j + 1})"/>`;
      g += `</g></g>`;
      pts.push([x + bw / 2, y(s.caja)]);
      if (keys.length <= 8 || i % Math.ceil(keys.length / 7) === 0 || i === keys.length - 1) g += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" class="ax">${lbl(s.key)}</text>`;
    });
    g += `<path class="draw" pathLength="1" d="${pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("")}" fill="none" stroke="var(--bad)" stroke-width="2" stroke-dasharray="1 0" stroke-linejoin="round" style="pointer-events:none"/>`;
    g += pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="var(--bad)" style="pointer-events:none"/>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ingresos por local y egresos">${g}</svg>`;
  }
  function waterfallSteps(steps, labelTotal) {
    const ing = steps[0].v;
    if (!ing && !steps.slice(1, -1).some((s) => s.v)) return `<div class="empty">Sin datos en este período.</div>`;
    let run = ing; const S = [{ ...steps[0], from: 0, to: ing }];
    for (const s of steps.slice(1, -1)) { S.push({ ...s, from: run - s.v, to: run, neg: true }); run -= s.v; }
    const fin = steps[steps.length - 1]; S.push({ ...fin, v: run, from: Math.min(0, run), to: Math.max(0, run) });
    const minV = Math.min(0, ...S.map((s) => s.from)), max = Math.max(ing, ...S.map((s) => s.to)) * 1.08;
    const W = 460, H = 260, L = 50, B = 34, T = 26, R = 6, step = niceStep(max - minV), top = Math.ceil(max / step) * step, bot = Math.floor(minV / step) * step;
    const y = (v) => T + (H - T - B) * (1 - (v - bot) / (top - bot)), cw = (W - L - R) / S.length, bw = Math.min(60, cw * 0.58);
    let g = "";
    for (let v = bot; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${v < 0 ? "−" : ""}${axisMoney(Math.abs(v))}</text>`;
    S.forEach((s, i) => {
      const x = L + i * cw + (cw - bw) / 2, h = Math.max(2, y(s.from) - y(s.to)), last = i === S.length - 1;
      g += `<g class="col" ${tt({ t: s.l, s: i === 0 ? "Total del período" : last ? `${fmt.pct(ing ? s.v / ing : NaN)} de los ingresos` : `${fmt.pct(ing ? s.v / ing : NaN)} de los ingresos`, r: [[s.c, i === 0 || last ? "Monto" : "Resta", fmt.money(Math.abs(s.v))]] })}>
        <rect class="hit" x="${L + i * cw + 2}" y="${T}" width="${cw - 4}" height="${H - T - B}" rx="8"/>
        <rect class="grow" style="animation-delay:${i * 0.1}s" x="${x}" y="${y(s.to)}" width="${bw}" height="${h}" rx="6" fill="${last && s.v < 0 ? "var(--bad)" : s.c}"/>
        <text x="${x + bw / 2}" y="${y(s.to) - 8}" text-anchor="middle" class="val-lbl">${s.neg ? "−" : last && s.v < 0 ? "−" : ""}${axisMoney(Math.abs(s.v))}</text>
        <text x="${x + bw / 2}" y="${H - 12}" text-anchor="middle" class="ax">${s.l}</text></g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(labelTotal)}">${g}</svg>`;
  }
  function locBars(rows) {
    const keys = [["ingresos", "Ingresos", "var(--s1)"], ["egresos", "Egresos", "var(--s2)"], ["utilidad", "Utilidad", "var(--good)"]];
    if (!rows.some((r) => r.ingresos || r.egresos)) return `<div class="empty">Sin datos en este período.</div>`;
    const max = Math.max(1, ...rows.flatMap((r) => keys.map(([k]) => Math.abs(r[k])))), min = Math.min(0, ...rows.map((r) => r.utilidad));
    const W = 620, H = 260, L = 54, B = 34, T = 18, R = 8, step = niceStep((max - min) * 1.05), top = Math.ceil((max * 1.05) / step) * step, bot = Math.floor(min / step) * step;
    const y = (v) => T + (H - T - B) * (1 - (v - bot) / (top - bot)), gw = (W - L - R) / rows.length, bw = Math.min(30, (gw * 0.72) / keys.length);
    let g = "";
    for (let v = bot; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${v < 0 ? "−" : ""}${axisMoney(Math.abs(v))}</text>`;
    rows.forEach((r, i) => {
      const x0 = L + i * gw + (gw - bw * keys.length - 6 * (keys.length - 1)) / 2;
      g += `<g class="col" ${tt({ t: r.nombre, s: `Utilidad ${fmt.pct(r.ingresos ? r.utilidad / r.ingresos : NaN)} de los ingresos`, r: keys.map(([k, l, c]) => [c, l, fmt.money(r[k])]).concat([["var(--muted)", "· Del día / sueldos", `${axisMoney(r.caja)} / ${axisMoney(r.sueldos)}`]]) })}><rect class="hit" x="${L + i * gw + 4}" y="${T}" width="${gw - 8}" height="${H - T - B}" rx="8"/>`;
      keys.forEach(([k, , c], j) => { const v = r[k], a = Math.max(0, v), b2 = Math.min(0, v); g += `<rect class="grow" style="animation-delay:${(i * 0.1 + j * 0.05).toFixed(2)}s" x="${x0 + j * (bw + 6)}" y="${y(a)}" width="${bw}" height="${Math.max(1, y(b2) - y(a))}" rx="5" fill="${k === "utilidad" && v < 0 ? "var(--bad)" : c}"/>`; });
      g += `<text x="${L + i * gw + gw / 2}" y="${H - 12}" text-anchor="middle" class="ax strong">${esc(r.nombre)}</text></g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Resultado por local">${g}</svg>
      <div class="legend" style="margin-top:8px">${keys.map(([, l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  }
  function lineTrend(ser, gran) {
    if (ser.length < 2) return `<div class="empty">Se necesitan al menos dos ${gran === "mes" ? "meses" : "semanas"} con datos.</div>`;
    const keys = [["ingresos", "Ingresos", "var(--s1)"], ["egresos", "Egresos", "var(--s2)"], ["utilidad", "Utilidad", "var(--good)"]];
    const max = Math.max(1, ...ser.flatMap((s) => keys.map(([k]) => s[k]))), min = Math.min(0, ...ser.map((s) => s.utilidad));
    const W = 620, H = 250, L = 54, B = 30, T = 16, R = 14, step = niceStep(max - min), top = Math.ceil((max * 1.05) / step) * step, bot = Math.floor(min / step) * step;
    const x = (i) => L + (i / (ser.length - 1)) * (W - L - R), y = (v) => T + (H - T - B) * (1 - (v - bot) / (top - bot));
    let g = "";
    for (let v = bot; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 5"' : ""}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${v < 0 ? "−" : ""}${axisMoney(Math.abs(v))}</text>`;
    const gid = "tg" + uid();
    g += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--good)" stop-opacity=".22"/><stop offset="1" stop-color="var(--good)" stop-opacity="0"/></linearGradient></defs>`;
    const path = (k) => ser.map((s, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(s[k]).toFixed(1)).join("");
    g += `<path class="area-in" d="${path("utilidad")}L${x(ser.length - 1)} ${y(Math.max(bot, 0))}L${x(0)} ${y(Math.max(bot, 0))}Z" fill="url(#${gid})"/>`;
    keys.forEach(([k, , c], j) => { g += `<path class="draw" pathLength="1" style="animation-delay:${j * 0.15}s" d="${path(k)}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`; });
    const cw = (W - L - R) / (ser.length - 1);
    ser.forEach((s, i) => {
      const lab = gran === "mes" ? mesTxt(s.key.slice(0, 7)) : "Semana del " + fmt.short(s.key);
      g += `<g class="pt" ${tt({ t: lab, s: `Utilidad ${fmt.pct(s.ingresos ? s.utilidad / s.ingresos : NaN)} de los ingresos`, r: keys.map(([k, l, c]) => [c, l, fmt.money(s[k])]) })}><rect class="hit" x="${x(i) - cw / 2}" y="${T}" width="${cw}" height="${H - T - B}"/><line class="guide" x1="${x(i)}" x2="${x(i)}" y1="${T}" y2="${H - B}"/>${keys.map(([k, , c]) => `<circle cx="${x(i)}" cy="${y(s[k])}" r="3.5" fill="${c}"/>`).join("")}</g>`;
      if (ser.length <= 7 || i % Math.ceil(ser.length / 6) === 0 || i === ser.length - 1) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ax">${gran === "mes" ? F.MESES[Number(s.key.slice(5, 7)) - 1].slice(0, 3) : fmt.short(s.key)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia">${g}</svg>
      <div class="legend" style="margin-top:8px">${keys.map(([, l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join("")}</div>`;
  }

  /* ---------- Panel principal (finanzas) ---------- */
  function viewPanel() {
    const range = rules.periodRange(ui.periodo), prev = rules.prevRange(range);
    const firstDay = db.reportes.filter((r) => ["CAJA", "GASTO", "ROL"].includes(r.tipo)).map((r) => r.desde).sort()[0] || today();
    const shown = ui.periodo === "todo" ? [firstDay, today()] : range;
    const s = F.summary(db, range, ui.local), sp = F.summary(db, prev, ui.local);
    const days = Math.round((new Date(shown[1]) - new Date(shown[0])) / 864e5) + 1;
    const gran = days <= 35 ? "dia" : days <= 130 ? "semana" : "mes";
    const ser = F.series(db, shown, ui.local, gran);
    const trendGran = days <= 130 ? "semana" : "mes", trend = F.series(db, shown, ui.local, trendGran).slice(-14);
    const porLocal = db.locales.map((l, i) => ({ l, i, ...F.summary(db, range, l.id) }));
    const totIng = porLocal.reduce((a, x) => a + x.ingresos, 0);
    const eg = F.egresos(db, range, ui.local), cats = F.byCategoria(eg);
    const delta = (a, b) => (b ? (a - b) / Math.abs(b) : null);
    const dTxt = (d, label, inv) => (d === null || !isFinite(d) ? "" : `<span class="delta ${(d >= 0) !== !!inv ? "up" : "down"}">${d >= 0 ? "▲" : "▼"} ${fmt.pct(Math.abs(d))}</span> ${label}`);
    const periodos = [["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["mes", "Este mes"], ["mesant", "Mes anterior"], ["90", "Últimos 90 días"], ["todo", "Todo el historial"]];
    const locs = [["todos", "Las 3 sedes"], ...db.locales.map((l) => [l.id, l.nombre])];
    const nuevo = !db.reportes.some((r) => r.tipo === "CAJA");
    const best = [...porLocal].filter((x) => x.ingresos > 0).sort((a, b) => b.utilidad - a.utilidad)[0] || porLocal[0];
    const alert = (cls, icon, html) => `<div class="alert ${cls}"><span class="ic">${ICON[icon]}</span><span>${html}</span></div>`;
    // Para revisar
    const t = today(), mes = curMes(), diaHoy = Number(t.slice(8));
    const faltan = db.locales.map((l) => ({ l, d: [1, 2, 3, 4, 5, 6, 7].map((k) => addDays(t, -k)).filter((d) => !db.reportes.some((r) => r.tipo === "CAJA" && r.localId === l.id && r.hasta === d)) })).filter((x) => x.d.length && (ui.local === "todos" || x.l.id === ui.local));
    const rolBorr = db.reportes.filter((r) => r.tipo === "ROL" && r.estado === "BORRADOR");
    const mesAnt = addMes(mes, -1);
    const sinRol = db.locales.filter((l) => db.empleados.some((e) => e.activo !== false && e.localId === l.id && e.frecuencia === "MENSUAL" && e.ingreso <= F.lastDay(mesAnt)) && !db.reportes.some((r) => r.tipo === "ROL" && r.localId === l.id && r.mes === mesAnt && r.tramo === "M") && (ui.local === "todos" || l.id === ui.local));
    const sinDetPct = s.caja ? s.sinDetallar / s.caja : 0;
    const alerts = [
      !data.DEMO && isAdmin() && db.reportes.length && (backupDays() === null || backupDays() > 7) ? alert("warn", "clock", `<b>Respaldo semanal pendiente:</b> ${db.ultimoRespaldo ? `el último fue hace ${backupDays()} días` : "aún no has descargado ninguno"}. <a href="#ajustes">Ir a Ajustes</a>`) : "",
      ...faltan.map((x) => alert("warn", "warn", `<b>Falta el reporte diario de ${esc(x.l.nombre)}:</b> ${x.d.slice().reverse().map((d) => fmt.short(d)).join(", ")}. <a href="#diario">Ir a reportes diarios</a>`)),
      ...rolBorr.map((r) => alert("warn", "clock", `<b>Rol de pagos sin aprobar:</b> ${esc(local(r.localId).nombre)}, ${esc(r.periodoTxt)}. No cuenta como gasto hasta aprobarlo. <a href="#personal" data-route="personal" data-open="${r.id}">Abrir</a>`)),
      sinRol.length && diaHoy >= 3 ? alert("", "personal", `<b>Rol de ${mesTxt(mesAnt).toLowerCase()} pendiente:</b> ${sinRol.map((l) => esc(l.nombre)).join(", ")}. Sin rol, la utilidad no descuenta los sueldos. <a href="#personal" data-f="go-roles">Ir a roles</a>`) : "",
      sinDetPct > 0.5 && s.caja > 0 ? alert("", "tag", `<b>${fmt.pct(sinDetPct)} de los egresos están sin detallar.</b> Si se registran por categoría, sabrás en qué se va el dinero. <a href="#diario">Ir a reportes diarios</a>`) : "",
    ].filter(Boolean);

    return `
    <div class="page-head">
      <div class="lead"><span class="eyebrow">${greeting()}, ${esc(session.nombre.split(" ")[0])}</span><h1>Resumen de EduPan</h1>
        <p>${ui.local === "todos" ? "Matriz, Sucursal 1 y Sucursal 2" : "Solo " + esc(local(ui.local).nombre)} · ${fmt.period(...shown)}</p></div>
      <div class="filters">
        <div class="select-wrap"><select class="input" id="f-periodo" data-bind="periodo" aria-label="Período">${periodos.map(([k, x]) => `<option value="${k}" ${ui.periodo === k ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        <div class="segmented" role="group" aria-label="Local">${locs.map(([k, x]) => `<button class="seg" aria-pressed="${ui.local === k}" data-local="${k}">${esc(x)}</button>`).join("")}</div>
        <button class="btn" data-act="to-informe">${ICON.informes} Informe Excel</button>
      </div>
    </div>
    ${nuevo ? `<section class="card welcome" aria-label="Primeros pasos">
      <div><span class="eyebrow">Primeros pasos</span><h2 style="margin-top:4px">Empieza a llenar tu panel</h2></div>
      <div class="steps">
        <div class="step"><span class="n">1</span><b>Registra el día</b><span class="muted small">Ingresos y egresos de cada local, como en tu Excel.</span>${isAdmin() ? '<a href="#diario">Ir a reportes diarios</a>' : ""}</div>
        <div class="step"><span class="n">2</span><b>Agrega al personal</b><span class="muted small">Cada trabajador con su local y sueldo.</span>${db.empleados.length ? '<span class="pill good">Listo</span>' : isAdmin() ? '<a href="#personal">Agregar</a>' : ""}</div>
        <div class="step"><span class="n">3</span><b>Aprueba el rol del mes</b><span class="muted small">Así la utilidad descuenta los sueldos.</span>${db.reportes.some((r) => r.tipo === "ROL" && r.estado === "CONFIRMADO") ? '<span class="pill good">Listo</span>' : isAdmin() ? '<a href="#personal" data-f="go-roles">Ir a roles</a>' : ""}</div>
      </div>
    </section>` : ""}
    <section class="kpis" aria-label="Indicadores">
      <div class="kpi hero"><span class="eyebrow">Ingresos del período</span><span class="val num" data-count="${s.ingresos}" data-fmt="money">${fmt.money(s.ingresos)}</span>
        <span class="sub">${sp.ingresos ? dTxt(delta(s.ingresos, sp.ingresos), "frente al período anterior") : `${s.reportes} reporte${s.reportes === 1 ? "" : "s"} diario${s.reportes === 1 ? "" : "s"}`}</span>
        <div class="spark">${sparkline(trend.map((x) => ({ v: x.ingresos })), "#E3B263")}</div></div>
      <div class="kpi"><span class="eyebrow">Egresos</span><span class="val num" data-count="${s.egresos}" data-fmt="money">${fmt.money(s.egresos)}</span>
        <span class="sub">Del día ${fmt.money(s.caja)} · sueldos ${fmt.money(s.sueldos)}</span><div class="spark">${sparkline(trend.map((x) => ({ v: x.egresos })), "var(--s2)")}</div></div>
      <div class="kpi"><span class="eyebrow">Utilidad</span><span class="val num ${s.utilidad < 0 ? "" : "good"}" style="${s.utilidad < 0 ? "color:var(--bad)" : ""}" data-count="${s.utilidad}" data-fmt="money">${fmt.money(s.utilidad)}</span>
        <span class="sub">${isFinite(s.margen) ? `${fmt.pct(s.margen)} de los ingresos` : "Ingresos − egresos"}${sp.ingresos ? " · " + dTxt(delta(s.utilidad, sp.utilidad), "") : ""}</span><div class="spark">${sparkline(trend.map((x) => ({ v: x.utilidad })), "var(--good)")}</div></div>
      ${ui.local === "todos" && totIng > 0 ? `<div class="kpi"><span class="eyebrow">Local con más utilidad</span><span class="val val-name">${esc(best.l.nombre)}</span>
          <span class="sub">${fmt.money(best.utilidad)} · ${fmt.pct(best.ingresos ? best.utilidad / best.ingresos : NaN)} de sus ingresos</span>
          <div class="share" role="img" aria-label="Participación de cada local en los ingresos">${porLocal.map((x) => `<i title="${esc(x.l.nombre)}: ${fmt.pct(x.ingresos / totIng)}" style="width:${(x.ingresos / totIng) * 100}%;background:var(--s${x.i + 1})"></i>`).join("")}</div>
          <span class="sub star">Más ingresos: <b>${esc([...porLocal].sort((a, b) => b.ingresos - a.ingresos)[0].l.nombre)}</b></span></div>`
        : `<div class="kpi"><span class="eyebrow">Promedio por día</span><span class="val num">${s.dias ? fmt.money(s.ingresos / s.dias) : "—"}</span><span class="sub">${s.dias} día${s.dias === 1 ? "" : "s"} reportado${s.dias === 1 ? "" : "s"} · queda ${s.dias ? fmt.money(s.utilidad / s.dias) : "—"} por día</span></div>`}
    </section>
    <div class="minis" aria-label="Indicadores secundarios">
      <div class="mini"><span>Ingreso promedio por día</span><b class="num">${s.dias ? fmt.money(s.ingresos / s.dias) : "—"}</b></div>
      <div class="mini"><span>Utilidad por cada $1 que entra</span><b class="num" style="color:${s.utilidad < 0 ? "var(--bad)" : "var(--good)"}">${s.ingresos ? fmt.money(s.utilidad / s.ingresos) : "—"}</b></div>
      <div class="mini"><span>Sueldos sobre ingresos</span><b class="num">${fmt.pct(s.ingresos ? s.sueldos / s.ingresos : NaN)}</b></div>
      <div class="mini"><span>Egresos sin detallar</span><b class="num" style="color:${sinDetPct > 0.5 ? "var(--warn)" : "inherit"}">${s.sinDetallar ? fmt.money(s.sinDetallar) : "—"}</b></div>
      <div class="mini"><span>Días reportados</span><b class="num">${s.dias}</b></div>
    </div>
    <div class="two">
      <section class="card chart"><div class="card-head"><div><h2>Ingresos ${gran === "dia" ? "por día" : gran === "semana" ? "por semana" : "por mes"}</h2><p class="muted small">Barras: ingresos de cada local · línea roja: egresos del día</p></div>
        <div class="legend">${db.locales.map((l, i) => `<span><i style="background:var(--s${i + 1})"></i>${esc(l.nombre)}</span>`).join("")}<span><i style="background:var(--bad)"></i>Egresos del día</span></div></div>
        ${stackChart(ser, gran)}</section>
      <section class="card chart"><div class="card-head"><div><h2>${ui.local === "todos" ? "Participación en ingresos" : "En qué se gasta"}</h2><p class="muted small">${ui.local === "todos" ? "Cuánto aporta cada local" : "Egresos por categoría"}</p></div></div>
        ${ui.local === "todos" ? donut(porLocal.map((x) => ({ l: x.l.nombre, v: x.ingresos, c: `var(--s${x.i + 1})`, k: "Ingresos", extra: [["var(--good)", "Utilidad", fmt.money(x.utilidad)]] })), fmt.money(s.ingresos), "ingresos")
          : donut(catSegs(cats), fmt.money(s.egresos), "egresos")}</section>
    </div>
    <div class="two rev">
      <section class="card chart"><div class="card-head"><div><h2>De los ingresos a la utilidad</h2><p class="muted small">Qué se lleva cada tipo de egreso</p></div></div>
        ${waterfallSteps([{ l: "Ingresos", v: s.ingresos, c: "var(--s1)" }, { l: "Egresos del día", v: s.caja, c: "var(--s2)" }, { l: "Sueldos", v: s.sueldos, c: "#2F8FD8" }, { l: "Utilidad", v: 0, c: "var(--good)" }], "De los ingresos a la utilidad")}</section>
      ${ui.local === "todos" ? `<section class="card chart"><div class="card-head"><div><h2>Resultado por local</h2><p class="muted small">Ingresos, egresos y utilidad de cada sede</p></div></div>
        ${locBars(porLocal.map((x) => ({ nombre: x.l.nombre, ingresos: x.ingresos, egresos: x.egresos, utilidad: x.utilidad, caja: x.caja, sueldos: x.sueldos })))}</section>`
      : `<section class="card chart"><div class="card-head"><div><h2>Tendencia</h2><p class="muted small">${trendGran === "mes" ? "Mes a mes" : "Semana a semana"}</p></div></div>${lineTrend(trend, trendGran)}</section>`}
    </div>
    <div class="two">
      ${ui.local === "todos" ? `<section class="card chart"><div class="card-head"><div><h2>Tendencia</h2><p class="muted small">Ingresos, egresos y utilidad ${trendGran === "mes" ? "mes a mes" : "semana a semana"}</p></div></div>${lineTrend(trend, trendGran)}</section>
        <section class="card chart"><div class="card-head"><div><h2>En qué se gasta</h2><p class="muted small">Egresos por categoría</p></div><a class="small" href="#diario">Ver reportes</a></div>${donut(catSegs(cats), fmt.money(s.egresos), "egresos")}</section>`
      : `<section class="card" style="grid-column:1/-1"><div class="card-head"><div><h2>${esc(local(ui.local).nombre)}</h2><p class="muted small">${esc(local(ui.local).tipo)} · ${s.dias} día${s.dias === 1 ? "" : "s"} reportado${s.dias === 1 ? "" : "s"}</p></div></div>
          <div class="totals num"><div><span class="muted">Ingresos</span><b>${fmt.money(s.ingresos)}</b></div><div><span class="muted">Egresos de los reportes diarios</span><span>− ${fmt.money(s.caja)}</span></div><div><span class="muted">Sueldos y beneficios</span><span>− ${fmt.money(s.sueldos)}</span></div><div><span class="muted"><b>Utilidad</b></span><b class="big" style="color:${s.utilidad < 0 ? "var(--bad)" : "var(--good)"}">${fmt.money(s.utilidad)}</b></div><div><span class="muted">Participación en los ingresos de EduPan</span><span>${fmt.pct(totIng ? s.ingresos / totIng : NaN)}</span></div></div></section>`}
    </div>
    <section class="card" aria-label="Resultado por local">
      <div class="card-head"><div><h2>Estado de resultados por local</h2><p class="muted small">Utilidad = ingresos − egresos del día − sueldos</p></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Local</th><th class="r">Ingresos</th><th class="r">Egresos del día</th><th class="r">Sueldos</th><th class="r">Utilidad</th><th class="r">Margen</th><th class="r hide-sm">Días reportados</th></tr></thead>
        <tbody>${porLocal.map((x) => `<tr><td><span class="rank" style="background:var(--s${x.i + 1})"></span><b>${esc(x.l.nombre)}</b></td><td class="r num"><b>${fmt.money(x.ingresos)}</b></td><td class="r num">${fmt.money(x.caja)}</td><td class="r num">${fmt.money(x.sueldos)}</td><td class="r num"><b style="color:${x.utilidad < 0 ? "var(--bad)" : "var(--good)"}">${fmt.money(x.utilidad)}</b></td><td class="r">${isFinite(x.margen) ? `<span class="pill ${marginClass(x.margen)}">${fmt.pct(x.margen)}</span>` : "—"}</td><td class="r num hide-sm">${x.dias}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td><b>Total</b></td>${["ingresos", "caja", "sueldos"].map((k) => `<td class="r num"><b>${fmt.money(porLocal.reduce((a, x) => a + x[k], 0))}</b></td>`).join("")}<td class="r num"><b>${fmt.money(porLocal.reduce((a, x) => a + x.utilidad, 0))}</b></td><td class="r">${totIng ? `<span class="pill ${marginClass(porLocal.reduce((a, x) => a + x.utilidad, 0) / totIng)}">${fmt.pct(porLocal.reduce((a, x) => a + x.utilidad, 0) / totIng)}</span>` : "—"}</td><td class="hide-sm"></td></tr></tfoot>
      </table></div>
    </section>
    <section class="card" aria-label="Para revisar">
      <div class="card-head"><h2>Para revisar</h2></div>
      <div class="alerts">${alerts.length ? alerts.join("") : alert("good", "check", nuevo ? "Nada pendiente por ahora." : "Todo al día.")}</div>
    </section>`;
  }

  /* ---------- Excel: hojas de finanzas ---------- */
  function finSheets(range, locs, head) {
    const H = ui.inf.hojas, out = [], X = PPX.excel, C = X.colName, ids = locs.map((l) => l.id);
    const inLocs = (r) => ids.includes(r.localId);
    if (H.finanzas) {
      const rows = head("EduPan Panaderías · Estado de resultados");
      rows.push([{ v: "Concepto", s: "header" }, ...locs.map((l) => ({ v: l.nombre, s: "headerR" })), { v: "Total EduPan", s: "headerR" }]);
      const d = locs.map((l) => F.summary(db, range, l.id)), n = locs.length, R = {};
      const add = (k, label, vals, st, formula) => {
        const r = rows.length + 1; R[k] = r;
        const row = [{ v: label, s: k === "util" ? "totalLabel" : "bold" }];
        const stOf = (v) => (st === "moneyGood" && v < 0 ? "moneyBad" : st);
        vals.forEach((v, i) => row.push(formula ? { v, s: stOf(v), f: formula(C(i + 1)) } : { v, s: stOf(v) }));
        row.push(formula ? { v: round2(vals.reduce((a, b) => a + (Number(b) || 0), 0)), s: st === "pct" ? "totalPct" : "totalMoney", f: formula(C(n + 1)) } : { v: round2(vals.reduce((a, b) => a + b, 0)), s: st === "int" ? "totalInt" : "totalMoney", f: `SUM(${C(1)}${r}:${C(n)}${r})` });
        rows.push(row);
      };
      add("ing", "Ingresos", d.map((x) => x.ingresos), "money");
      add("caja", "(−) Egresos de los reportes diarios", d.map((x) => x.caja), "money");
      add("sue", "(−) Sueldos y beneficios (roles aprobados)", d.map((x) => x.sueldos), "money");
      add("eg", "Total egresos", d.map((x) => x.egresos), "money", (c) => `${c}${R.caja}+${c}${R.sue}`);
      add("util", "Utilidad", d.map((x) => x.utilidad), "moneyGood", (c) => `${c}${R.ing}-${c}${R.eg}`);
      add("mar", "Margen sobre ingresos", d.map((x) => (x.ingresos ? x.utilidad / x.ingresos : "")), "pct", (c) => `IF(${c}${R.ing}=0,"",${c}${R.util}/${c}${R.ing})`);
      add("dias", "Días reportados", d.map((x) => x.dias), "int");
      rows.push([]);
      rows.push([{ v: "Ingresos por categoría", s: "section" }]);
      rows.push([{ v: "Categoría", s: "header" }, ...locs.map((l) => ({ v: l.nombre, s: "headerR" })), { v: "Total", s: "headerR" }]);
      const perLocIng = Object.fromEntries(locs.map((l) => [l.id, new Map(F.ingresosPorCategoria(db, range, l.id).map((c) => [c.id, c.v]))]));
      const ingIds = [...new Set(locs.flatMap((l) => [...perLocIng[l.id].keys()]))];
      const i0 = rows.length + 1;
      for (const id of ingIds) { const r = rows.length + 1, vals = locs.map((l) => perLocIng[l.id].get(id) || 0); rows.push([catName(id), ...vals.map((v) => ({ v, s: "money" })), { v: round2(vals.reduce((a, b) => a + b, 0)), s: "totalMoney", f: `SUM(${C(1)}${r}:${C(n)}${r})` }]); }
      if (ingIds.length) { const r = rows.length + 1; rows.push([{ v: "Total", s: "totalLabel" }, ...d.map((x, i) => ({ v: x.ingresos, s: "totalMoney", f: `SUM(${C(i + 1)}${i0}:${C(i + 1)}${r - 1})` })), { v: round2(d.reduce((a, x) => a + x.ingresos, 0)), s: "totalMoney", f: `SUM(${C(n + 1)}${i0}:${C(n + 1)}${r - 1})` }]); }
      rows.push([]);
      rows.push([{ v: "Egresos por categoría", s: "section" }]);
      rows.push([{ v: "Categoría", s: "header" }, ...locs.map((l) => ({ v: l.nombre, s: "headerR" })), { v: "Total", s: "headerR" }]);
      const allCats = F.byCategoria(F.egresos(db, range, "todos").filter((e) => ids.includes(e.localId)));
      const c0 = rows.length + 1;
      for (const c of allCats) { const r = rows.length + 1; rows.push([catName(c.id), ...locs.map((l) => ({ v: round2(F.egresos(db, range, l.id).filter((e) => e.categoriaId === c.id).reduce((a, e) => a + e.monto, 0)), s: "money" })), { v: c.v, s: "totalMoney", f: `SUM(${C(1)}${r}:${C(n)}${r})` }]); }
      if (allCats.length) { const r = rows.length + 1; rows.push([{ v: "Total", s: "totalLabel" }, ...d.map((x, i) => ({ v: x.egresos, s: "totalMoney", f: `SUM(${C(i + 1)}${c0}:${C(i + 1)}${r - 1})` })), { v: round2(d.reduce((a, x) => a + x.egresos, 0)), s: "totalMoney", f: `SUM(${C(n + 1)}${c0}:${C(n + 1)}${r - 1})` }]); }
      rows.push([]);
      rows.push([{ v: "Utilidad = ingresos − egresos de los reportes diarios − sueldos. Los sueldos incluyen el aporte patronal, los décimos y los fondos de reserva de quienes los reciben.", s: "sub" }]);
      out.push({ name: "Resultados", cols: [44, ...locs.map(() => 18), 18], rows, freeze: "B6" });
    }
    if (H.diario) {
      const rows = head("Reportes diarios (como el Excel de caja)");
      rows.push([{ v: "Fecha", s: "header" }, ...locs.flatMap((l) => [{ v: `${l.nombre} · ingresos`, s: "headerR" }, { v: `${l.nombre} · egresos`, s: "headerR" }]), { v: "Total ingresos", s: "headerR" }, { v: "Total egresos", s: "headerR" }, { v: "Queda", s: "headerR" }]);
      const cajas = db.reportes.filter((r) => r.tipo === "CAJA" && r.hasta >= range[0] && r.hasta <= range[1] && inLocs(r));
      const fechas = [...new Set(cajas.map((r) => r.hasta))].sort(), first = rows.length + 1, n2 = locs.length * 2;
      const colSum = Array(n2 + 3).fill(0);
      for (const fch of fechas) {
        const r = rows.length + 1, row = [{ v: fch, s: "date" }];
        let ti = 0, te = 0;
        locs.forEach((l, i) => { const c = cajas.find((x) => x.hasta === fch && x.localId === l.id); const vi = c ? Number(c.ingresos) || 0 : 0, ve = c ? F.cajaEgresos(c) : 0; ti += vi; te += ve; colSum[i * 2] += vi; colSum[i * 2 + 1] += ve; row.push(c ? { v: vi, s: "money" } : null, c ? { v: ve, s: "money" } : null); });
        const ingC = locs.map((_, i) => `N(${C(1 + i * 2)}${r})`).join("+"), egC = locs.map((_, i) => `N(${C(2 + i * 2)}${r})`).join("+");
        colSum[n2] += ti; colSum[n2 + 1] += te; colSum[n2 + 2] += ti - te;
        row.push({ v: round2(ti), s: "money", f: ingC }, { v: round2(te), s: "money", f: egC }, { v: round2(ti - te), s: "money", f: `${C(n2 + 1)}${r}-${C(n2 + 2)}${r}` });
        rows.push(row);
      }
      const last = rows.length;
      if (fechas.length) rows.push([{ v: "Total", s: "totalLabel" }, ...colSum.map((v, i) => ({ v: round2(v), s: "totalMoney", f: `SUM(${C(i + 1)}${first}:${C(i + 1)}${last})` }))]);
      rows.push([]);
      rows.push([{ v: "Detalle por categoría", s: "section" }]);
      rows.push(["Fecha", "Local", "Tipo", "Categoría", "Monto", "Observación"].map((v, i) => ({ v, s: i === 4 ? "headerR" : "header" })));
      for (const r of cajas.sort((a, b) => a.hasta.localeCompare(b.hasta) || locIdx(a.localId) - locIdx(b.localId))) {
        for (const l of (r.ingLineas && r.ingLineas.length ? r.ingLineas : [{ categoriaId: "", monto: r.ingresos }])) if (Number(l.monto)) rows.push([{ v: r.hasta, s: "date" }, local(r.localId).nombre, "Ingreso", catName(l.categoriaId), { v: Number(l.monto), s: "money" }, r.obs || ""]);
        for (const l of r.lineas) rows.push([{ v: r.hasta, s: "date" }, local(r.localId).nombre, "Egreso", catName(l.categoriaId), { v: l.monto, s: "moneyBad" }, r.obs || ""]);
      }
      out.push({ name: "Reportes diarios", cols: [14, ...Array(n2).fill(16), 16, 16, 14], rows, freeze: "B6" });
    }
    if (H.gastos) {
      const rows = head("Egresos");
      rows.push(["Fecha", "Local", "Categoría", "Origen", "Detalle", "Monto"].map((v, i) => ({ v, s: i === 5 ? "headerR" : "header" })));
      const first = rows.length + 1;
      const eg = F.egresos(db, range, "todos").filter((e) => ids.includes(e.localId)).sort((a, b) => a.fecha.localeCompare(b.fecha));
      for (const e of eg) rows.push([{ v: e.fecha, s: "date" }, local(e.localId).nombre, catName(e.categoriaId), ORIGEN[e.origen][0], e.origen === "rol" ? e.detalle : e.r.obs || "", { v: e.monto, s: "money" }]);
      const last = rows.length;
      if (eg.length) rows.push([{ v: "Total", s: "totalLabel" }, "", "", "", "", { v: round2(eg.reduce((a, e) => a + e.monto, 0)), s: "totalMoney", f: `SUM(F${first}:F${last})` }]);
      out.push({ name: "Egresos", cols: [12, 14, 28, 16, 40, 14], rows, freeze: "A6", filter: eg.length ? `A5:F${last}` : null });
    }
    if (H.roles) {
      const rows = head("Roles de pago aprobados");
      rows.push(["Período", "Local", "Trabajador", "Cargo", "Días", "Ingresos", "IESS personal", "Anticipos y otros", "Neto pagado", "Aporte patronal", "Décimos y fondos", "Costo para EduPan"].map((v, i) => ({ v, s: i >= 4 ? "headerR" : "header" })));
      const first = rows.length + 1;
      const roles = db.reportes.filter((r) => r.tipo === "ROL" && r.estado === "CONFIRMADO" && r.hasta >= range[0] && r.hasta <= range[1] && inLocs(r)).sort((a, b) => a.hasta.localeCompare(b.hasta));
      const tot = Array(7).fill(0);
      for (const r of roles) for (const l of r.lineas) { const vals = [l.total, l.iessP, round2(l.anticipos + l.otros), l.neto, l.patronal, round2(l.d13 + l.d14 + l.fondos + l.vac), l.costo]; vals.forEach((v, i) => { tot[i] += v; }); rows.push([r.periodoTxt, local(r.localId).nombre, l.nombre, l.cargo || "", { v: l.dias, s: "int" }, ...vals.map((v) => ({ v, s: "money" }))]); }
      const last = rows.length;
      if (last >= first) rows.push([{ v: "Total", s: "totalLabel" }, "", "", "", "", ...[5, 6, 7, 8, 9, 10, 11].map((c, i) => ({ v: round2(tot[i]), s: "totalMoney", f: `SUM(${C(c)}${first}:${C(c)}${last})` }))]);
      out.push({ name: "Roles de pago", cols: [24, 14, 24, 20, 7, 13, 13, 14, 13, 14, 18, 15], rows, freeze: "A6" });
    }
    return out;
  }

  /* ---------- Eventos de finanzas ---------- */
  // Tocar en el menú la sección donde ya estás vuelve a su pantalla principal
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".nav a, .tabbar a");
    if (!a || !session || a.getAttribute("href") !== location.hash) return;
    if (ui.draft || ui.viewId || ui.rolDraft || ui.rolNew) { ui.draft = null; ui.viewId = null; ui.rolDraft = null; ui.rolNew = null; render(); window.scrollTo(0, 0); }
  });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-f]");
    if (!el || !session) return;
    const ds = el.dataset;
    switch (ds.f) {
      case "mes": ui[ds.key] = addMes(ui[ds.key] || curMes(), Number(ds.k)); return render();
      case "tab": e.preventDefault(); ui[ds.key] = ds.v; ui.viewId = null; ui.rolDraft = null; ui.rolNew = null; ui.catEdit = null; return render();
      case "set": ui[ds.key] = ds.v; return render();
      case "caja-new": return openCajaDialog(null, { localId: ds.loc, fecha: ds.fecha });
      case "caja-open": return openCajaDialog(ds.id);
      case "go-roles": ui.perTab = "roles"; if (route() === "personal") { e.preventDefault(); render(); } return;
      case "cat-edit": ui.catEdit = ds.id; render(); $("#cat-ren")?.focus(); return;
      case "cat-cancel": ui.catEdit = null; return render();
      case "cat-toggle": { if (!isAdmin()) return; const c = db.categorias.find((x) => x.id === ds.id); c.activo = !c.activo; audit(c.activo ? "Categoría activada" : "Categoría desactivada", c.nombre); save(); return render(); }
      case "cat-del": { if (!isAdmin()) return; const c = db.categorias.find((x) => x.id === ds.id); db.categorias = db.categorias.filter((x) => x.id !== ds.id); audit("Categoría eliminada", c.nombre); save(); render(); return toast("Categoría eliminada"); }
      case "emp-new": return openEmpDialog(null);
      case "emp-edit": return openEmpDialog(ds.id);
      case "rol-new": if (!isAdmin()) return; ui.rolNew = { mes: addMes(curMes(), Number(today().slice(8)) >= 25 ? 0 : -1), tramo: "M", localId: ui.perLocal && ui.perLocal !== "todos" ? ui.perLocal : db.locales[0].id }; return render();
      case "rol-new-cancel": ui.rolNew = null; return render();
      case "rol-cancel": ui.rolDraft = null; return render();
      case "rol-back": ui.viewId = null; return render();
      case "rol-save": return saveRol(ds.v);
      case "rol-edit": { const r = db.reportes.find((x) => x.id === ds.id); ui.rolDraft = newRolDraft(r); ui.viewId = null; return render(); }
      case "rol-reopen": { const r = db.reportes.find((x) => x.id === ds.id); r.estado = "BORRADOR"; r.aprobado = null; audit("Rol de pagos reabierto", `${local(r.localId).nombre} · ${r.periodoTxt} · deja de contar como gasto hasta aprobarlo de nuevo`); save(); ui.rolDraft = newRolDraft(r); ui.viewId = null; render(); return toast("Rol reabierto"); }
      case "rol-del": ui.rolConfirm = ds.id; return render();
      case "rol-del-no": ui.rolConfirm = null; return render();
      case "rol-del-ok": { const r = db.reportes.find((x) => x.id === ds.id); if (!r || r.estado !== "BORRADOR") return; db.reportes = db.reportes.filter((x) => x.id !== r.id); audit("Rol de pagos eliminado", `${local(r.localId).nombre} · ${r.periodoTxt}`); ui.rolConfirm = null; ui.viewId = null; save(); render(); return toast("Rol eliminado"); }
      case "rol-xlsx": {
        const r = db.reportes.find((x) => x.id === ds.id);
        try { const bytes = PPX.excel.build(rolWorkbook(r), { title: "EduPan · Rol de pagos", author: session.nombre }); const name = `EduPan-rol-${r.localId}-${r.mes}${r.tramo === "M" ? "" : "-" + r.tramo}.xlsx`; PPX.excel.download(bytes, name); audit("Rol de pagos descargado", name); save(); toast("Excel del rol descargado"); }
        catch (x) { toast("No se pudo generar el Excel: " + x.message); }
        return;
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("td[data-f],tr[data-f]")) e.target.click();
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.rol && ui.rolDraft) {
      const [id, k] = t.dataset.rol.split(":"); ui.rolDraft.inp[id][k] = t.value.trim();
      setTimeout(() => { const a = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.rol : null; const y = window.scrollY; render(); window.scrollTo(0, y); if (a) { const n = document.querySelector(`[data-rol="${a}"]`); if (n) { n.focus(); n.select && n.select(); } } }, 0);
    }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.classList.contains("cat-form")) {
      e.preventDefault(); if (!isAdmin()) return;
      const tipo = f.dataset.tipo, inp = f.querySelector("input"), err = f.querySelector(".cat-err");
      const n = inp.value.trim().replace(/\s+/g, " ");
      if (!n) { err.innerHTML = errBox(["Escribe el nombre de la categoría."]); return; }
      if (db.categorias.some((c) => c.tipo === tipo && c.nombre.toLowerCase() === n.toLowerCase()) || ["sin detallar", F.SUELDOS.nombre.toLowerCase()].includes(n.toLowerCase())) { err.innerHTML = errBox(["Ya existe una categoría con ese nombre."]); return; }
      db.categorias.push({ id: "c" + uid(), nombre: n, tipo, activo: true }); audit("Categoría creada", `${n} (${tipo})`); save(); render(); return toast("Categoría creada");
    }
    if (f.classList.contains("cat-rename")) {
      e.preventDefault(); if (!isAdmin()) return;
      const c = db.categorias.find((x) => x.id === f.dataset.id), n = $("#cat-ren").value.trim().replace(/\s+/g, " ");
      if (!n || db.categorias.some((x) => x.id !== c.id && x.tipo === c.tipo && x.nombre.toLowerCase() === n.toLowerCase())) return toast("Escribe un nombre distinto a las demás categorías");
      audit("Categoría renombrada", `${c.nombre} → ${n}`); c.nombre = n; ui.catEdit = null; save(); render(); return toast("Categoría renombrada");
    }
    if (f.id === "rolnew-form") {
      e.preventDefault(); if (!isAdmin()) return;
      const mes = $("#rn-mes").value, tramo = $("#rn-tramo").value, localId = $("#rn-local").value, errs = [];
      ui.rolNew = { mes, tramo, localId };
      if (!/^\d{4}-\d{2}$/.test(mes)) errs.push("Elige el mes.");
      else {
        const per = F.periodo(mes, tramo), freq = tramo === "M" ? "MENSUAL" : "QUINCENAL";
        if (db.reportes.some((r) => r.tipo === "ROL" && r.localId === localId && r.mes === mes && r.tramo === tramo)) errs.push(`Ya existe el rol de ${per.txt} para ${local(localId).nombre}. Ábrelo desde la lista.`);
        const emps = db.empleados.filter((x) => x.activo !== false && x.localId === localId && x.frecuencia === freq && (!x.ingreso || x.ingreso <= per.hasta));
        if (!emps.length) errs.push(`${local(localId).nombre} no tiene trabajadores activos que cobren ${freq === "MENSUAL" ? "mensual" : "quincenal"}. Revísalo en la pestaña Trabajadores.`);
        if (!errs.length) {
          const snap = {}, inp = {}; emps.forEach((x) => { snap[x.id] = { ...x }; inp[x.id] = { dias: x.ingreso > per.desde ? Math.max(0, Math.round((new Date(per.hasta) - new Date(x.ingreso)) / 864e5) + 1) : "", h50: "", h100: "", bonos: "", anticipos: "", otros: "" }; });
          ui.rolDraft = { localId, mes, tramo, snap, inp, ids: emps.map((x) => x.id) }; ui.rolNew = null; return render();
        }
      }
      $("#rn-err").innerHTML = errBox(errs);
    }
    if (f.id === "nomina-form") {
      e.preventDefault(); if (!isAdmin()) return;
      const n = {}, errs = [];
      f.querySelectorAll("[data-nm]").forEach((x) => { const v = numOk(x.value); if (isNaN(v) || v <= 0) errs.push("Revisa: " + x.closest(".field").querySelector("label").textContent); n[x.dataset.nm] = v; });
      if (errs.length) { $("#nm-err").innerHTML = errBox(errs); return; }
      audit("Valores de ley actualizados", `SBU ${fmt.money(n.sbu)} · IESS personal ${n.iessPersonal} % · patronal ${n.iessPatronal} % · fondos ${n.fondos} %`);
      db.nomina = Object.assign(db.nomina, n); save(); render(); return toast("Valores guardados");
    }
  });

  /* ---------- Ajustes ---------- */
  const canManageUsers = () => isAdmin() && (data.DEMO || !!session.duena);
  const backupDays = () => (db.ultimoRespaldo ? Math.floor((Date.now() - new Date(db.ultimoRespaldo).getTime()) / 86400000) : null);
  function backupNote() {
    const d = backupDays();
    if (d === null) return `<div class="note warn">Todavía no has descargado ningún respaldo.</div>`;
    return `<div class="note ${d > 7 ? "warn" : "good"}">Último respaldo descargado: <b>${fmt.stamp(db.ultimoRespaldo)}</b>${d > 7 ? ` (hace ${d} días). Descarga uno nuevo.` : ""}</div>`;
  }
  function viewAjustes() {
    return `
    <div class="page-head"><div class="lead"><span class="eyebrow">Configuración</span><h1>Ajustes</h1><p>Locales, usuarios y registro de actividad.</p></div></div>
    <section class="card"><div class="card-head"><div><h2>Locales</h2><p class="muted small">Dos panaderías y una pastelería. La dirección se completa cuando la tengas.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Dirección</th></tr></thead><tbody>
      ${db.locales.map((l) => `<tr><td style="white-space:nowrap"><b>${esc(l.nombre)}</b> ${l.esMatriz ? '<span class="pill gold plain">Matriz</span>' : ""}</td>
        <td>${isAdmin() ? `<select class="input" data-tipo="${l.id}" aria-label="Tipo de ${esc(l.nombre)}" style="min-width:140px">${["Panadería", "Pastelería"].map((x) => `<option ${l.tipo === x ? "selected" : ""}>${x}</option>`).join("")}</select>` : esc(l.tipo)}</td>
        <td>${isAdmin() ? `<input class="input" data-dir="${l.id}" value="${esc(l.direccion)}" placeholder="Pendiente" aria-label="Dirección de ${esc(l.nombre)}">` : esc(l.direccion || "Pendiente")}</td></tr>`).join("")}
      </tbody></table></div></section>
    <section class="card"><div class="card-head"><h2>Usuarios</h2></div>
      ${!data.DEMO ? `<p class="muted small" style="margin:-4px 0 12px">Cada persona entra con su correo (Google o correo y contraseña). Quien tenga «solo lectura» ve el panel, los reportes y los informes, pero no puede registrar ni cambiar nada.</p>` : ""}
      <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th>${canManageUsers() ? "<th></th>" : ""}</tr></thead><tbody>
      ${db.usuarios.map((u) => `<tr><td style="white-space:nowrap"><b>${esc(u.nombre)}</b></td><td>${esc(u.email)}</td><td>${u.rol === "ADMINISTRADORA" ? '<span class="pill gold">Administradora</span>' : '<span class="pill neutral">Solo lectura</span>'}</td>${canManageUsers() ? `<td style="text-align:right">${!u.duena && !data.DEMO ? `<button class="btn ghost" data-act="user-del" data-email="${esc(u.email)}">Quitar acceso</button>` : ""}</td>` : ""}</tr>`).join("")}
      </tbody></table></div>
      ${ui.confirmUserDel ? `<div class="confirm-box" style="margin-top:12px"><span><b>${esc(ui.confirmUserDel)}</b> ya no podrá entrar al panel.</span><div class="actions"><button class="btn ghost" data-act="user-del-cancel">Cancelar</button><button class="btn danger" data-act="user-del-ok">Quitar acceso</button></div></div>` : ""}
      ${canManageUsers() ? `<form id="user-form" class="grid3" style="margin-top:16px;align-items:end" novalidate>
        <div class="field"><label for="us-nombre">Nombre</label><input class="input" id="us-nombre" placeholder="Nombre del jefe" maxlength="80"></div>
        <div class="field"><label for="us-email">Correo</label><input class="input" id="us-email" type="email" placeholder="correo@ejemplo.com"></div>
        <button class="btn" type="submit">${ICON.plus} Dar acceso de solo lectura</button>
        <div id="us-err" style="grid-column:1/-1"></div></form>` : ""}
    </section>
    <section class="card"><div class="card-head"><div><h2>Actividad</h2><p class="muted small">Quién hizo qué. No se puede editar.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead><tbody>
      ${db.auditoria.slice(0, 40).map((a) => `<tr><td class="num" style="white-space:nowrap">${fmt.stamp(a.fecha)}</td><td style="white-space:nowrap">${esc(a.usuario)}</td><td style="white-space:nowrap"><b>${esc(a.accion)}</b></td><td class="muted">${esc(a.detalle)}</td></tr>`).join("")}
      </tbody></table></div></section>
    ${data.DEMO ? `<section class="card" style="display:grid;gap:12px"><div><h2>Vista previa</h2><p class="muted small">Estas opciones existen solo para probar la vista previa.</p></div>
      <div class="actions" style="justify-content:flex-start">
        <button class="btn" data-act="as-jefe">${isAdmin() ? "Ver como jefe (solo lectura)" : "Volver a ver como administradora"}</button>
        ${isAdmin() ? `<button class="btn danger" data-act="reset">Volver a los datos de ejemplo</button>` : ""}
      </div>
      ${ui.confirmReset ? `<div class="confirm-box"><span>Se borrarán los productos y reportes que hayas creado en este navegador.</span><div class="actions"><button class="btn ghost" data-act="reset-cancel">Cancelar</button><button class="btn primary" data-act="reset-ok">Sí, restablecer</button></div></div>` : ""}
    </section>` : `
    <section class="card" style="display:grid;gap:14px"><div><h2>Base de datos y respaldo</h2><p class="muted small">Todo se guarda en la nube (Firebase de Google, proyecto <b>${esc(data.cloud.projectId)}</b>) apenas lo registras, y se ve igual desde cualquier equipo. Como seguro adicional, descarga un respaldo cada semana y guárdalo en tu computadora o en Google Drive.</p></div>
      ${backupNote()}
      ${isAdmin() ? `<div class="actions" style="justify-content:flex-start">
        <button class="btn primary" data-act="backup">Descargar respaldo</button>
        <label class="btn" for="restore-file">Restaurar un respaldo</label><input id="restore-file" type="file" accept="application/json,.json" hidden>
      </div>
      <div id="restore-box"></div>` : ""}
    </section>
    <section class="card" style="display:grid;gap:14px"><div><h2>Tu cuenta</h2><p class="muted small">Entraste como <b>${esc(session.email)}</b>.</p></div>
      ${(session.proveedores || []).includes("password")
        ? `<div class="actions" style="justify-content:flex-start"><button class="btn" data-act="pass-reset">Cambiar mi contraseña</button></div><p class="muted small">Te llega un correo con un enlace para crear la contraseña nueva.</p>`
        : `<p class="muted small">Entras con tu cuenta de Google: la contraseña se cambia en tu cuenta de Google, no aquí.</p>`}
    </section>`}`;
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act],[data-local],[data-prodver],[data-replocal],[data-repestado],[data-invlocal],[data-investado],[data-invmov],[data-perdlocal],[data-subtipo],[data-open],[data-delline],[data-quick]");
    if (!el || !session) return;
    const ds = el.dataset;
    if (ds.local) { ui.local = ds.local; return render(); }
    if (ds.prodver) { ui.prodVer = ds.prodver; return render(); }
    if (ds.replocal) { ui.repLocal = ds.replocal; return render(); }
    if (ds.repestado) { ui.repEstado = ds.repestado; return render(); }
    if (ds.invlocal) { ui.invLocal = ds.invlocal; return render(); }
    if (ds.investado) { ui.invEstado = ds.investado; return render(); }
    if (ds.invmov) { ui.invMov = ds.invmov; ui.movLimit = 25; return render(); }
    if (ds.perdlocal) { ui.perdLocal = ds.perdlocal; return render(); }
    if (ds.subtipo && ui.draft) {
      ui.draft.subtipo = ds.subtipo;
      // Una compra parte del costo actual de cada producto; la producción también
      return render();
    }
    if (ds.open) {
      e.preventDefault(); ui.draft = null; ui.reopen = false; ui.confirmDelete = false;
      const target = ds.route || ROUTE_OF[db.reportes.find((x) => x.id === ds.open)?.tipo] || "reportes";
      if (target === "personal") { ui.perTab = "roles"; ui.rolDraft = null; }
      if (route() !== target) { ui.pendingOpen = ds.open; location.hash = target; return; }
      ui.viewId = ds.open; return render();
    }
    if (ds.delline !== undefined) { ui.draft.lineas.splice(Number(ds.delline), 1); if (!ui.draft.lineas.length) ui.draft.lineas.push(blankLine()); return render(); }
    if (ds.quick) {
      const t = today(), d = new Date(t + "T12:00:00"); let a, b;
      if (ds.quick === "hoy") a = b = t;
      if (ds.quick === "ayer") a = b = addDays(t, -1);
      if (ds.quick === "semana") { b = addDays(t, -((d.getDay() + 6) % 7) - 1); a = addDays(b, -6); }
      if (ds.quick === "mes") { a = iso(new Date(d.getFullYear(), d.getMonth() - 1, 1)); b = iso(new Date(d.getFullYear(), d.getMonth(), 0)); }
      ui.draft.desde = a; ui.draft.hasta = b; return render();
    }
    switch (ds.act) {
      case "logout":
        if (!data.DEMO && data.cloud.pending() && !confirm("Hay cambios que todavía se están guardando en la nube. ¿Salir de todas formas?")) return;
        session = null; ui.draft = null; ui.viewId = null;
        if (data.DEMO) { data.store.saveSession(null); return render(); }
        db = data.empty(); ui.gate = null; ui.loginMode = "entrar"; ui.loginMsg = null;
        data.cloud.signOut().catch(() => {}); return render();
      case "user-del": ui.confirmUserDel = ds.email; return render();
      case "user-del-cancel": ui.confirmUserDel = null; return render();
      case "user-del-ok": {
        const email = ui.confirmUserDel; ui.confirmUserDel = null;
        if (!email || !session.duena) return render();
        data.cloud.setAcceso((acc) => { acc.lectores = acc.lectores.filter((x) => x !== email); acc.admins = acc.admins.filter((x) => x !== email); delete acc.nombres[email]; })
          .then(() => { audit("Acceso retirado", email); save(); render(); toast("Acceso retirado"); })
          .catch((x) => toast(data.cloud.message(x)));
        return;
      }
      case "pass-reset": {
        data.cloud.reset(session.email).then(() => { audit("Cambio de contraseña solicitado", session.email); save(); toast("Te enviamos el enlace a " + session.email); })
          .catch((x) => toast(data.cloud.message(x)));
        return;
      }
      case "prod-new": if (isAdmin()) openProdDialog(null); return;
      case "prod-edit": if (isAdmin()) openProdDialog(ds.id); return;
      case "prod-toggle": { if (!isAdmin()) return; const p = producto(ds.id); p.activo = !p.activo; audit(p.activo ? "Producto activado" : "Producto desactivado", p.nombre); save(); render(); return toast(p.activo ? "Producto activado" : "Producto desactivado"); }
      case "rep-new": if (!isAdmin()) return; ui.viewId = null; ui.draft = newDraft(); return render();
      case "rep-cancel": ui.draft = null; return render();
      case "inv-new": if (!isAdmin()) return; ui.viewId = null; if (route() !== "inventario") { ui.pendingDraft = newInvDraft(); location.hash = "inventario"; return; } ui.draft = newInvDraft(); return render();
      case "inv-fill": {
        const have = new Set(ui.draft.lineas.map((l) => l.productoId));
        ui.draft.lineas = ui.draft.lineas.filter((l) => l.productoId || l.cantidad !== "");
        db.productos.filter((p) => p.activo && !have.has(p.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).forEach((p) => ui.draft.lineas.push({ productoId: p.id, cantidad: "", precio: "", costo: p.costo }));
        if (!ui.draft.lineas.length) ui.draft.lineas.push(blankLine());
        return render();
      }
      case "mov-new": {
        if (!isAdmin()) return;
        const draft = newMovDraft(ds.movtipo), target = ds.movtipo === "PERDIDA" && route() === "perdidas" ? "perdidas" : "inventario";
        ui.viewId = null;
        if (route() !== target) { ui.pendingDraft = draft; location.hash = target; return; }
        ui.draft = draft; return render();
      }
      case "mov-more": ui.movLimit = (ui.movLimit || 25) + 25; return render();
      case "inf-download": if (!data.DEMO) downloadReport(); return;
      case "to-informe": {
        ui.inf.periodo = ui.periodo; ui.inf.locs = Object.fromEntries(db.locales.map((l) => [l.id, ui.local === "todos" || ui.local === l.id]));
        location.hash = "informes"; return;
      }
      case "line-add": { ui.draft.lineas.push(blankLine()); render(); const s = document.querySelectorAll('[data-k="productoId"]'); s[s.length - 1]?.focus(); return; }
      case "rep-save": return saveDraft(false);
      case "rep-confirm": return saveDraft(true);
      case "det-back": ui.viewId = null; ui.reopen = false; ui.confirmDelete = false; return render();
      case "det-edit": { const r = db.reportes.find((x) => x.id === ui.viewId); ui.draft = newDraft(r); ui.viewId = null; return render(); }
      case "det-reopen": ui.reopen = true; render(); $("#ro-mot")?.focus(); return;
      case "reopen-cancel": ui.reopen = false; return render();
      case "reopen-ok": {
        const mot = $("#ro-mot").value.trim();
        if (mot.length < 5) { $("#ro-err").innerHTML = '<div class="note bad">Escribe el motivo (al menos 5 caracteres).</div>'; return; }
        const r = db.reportes.find((x) => x.id === ui.viewId);
        r.estado = "BORRADOR";
        if (r.tipo === "ENTRADA" || r.tipo === "PERDIDA") audit(r.tipo === "PERDIDA" ? "Pérdida reabierta" : "Entrada reabierta", `${local(r.localId).nombre} ${fmt.date(r.hasta)} · valor ${fmt.money(rules.movTotals(r).valor)} · motivo: ${mot}`);
        else if (r.tipo === "INVENTARIO") audit("Conteo reabierto", `Inventario de ${local(r.localId).nombre} del ${fmt.date(r.hasta)} · valor ${fmt.money(rules.inventoryTotals(r, db).valor)} · motivo: ${mot}`);
        else audit("Reporte reabierto", `${local(r.localId).nombre} ${fmt.period(r.desde, r.hasta)} · total ${fmt.money(reportTotals(r).ventas)} · motivo: ${mot}`);
        save(); ui.reopen = false; ui.draft = newDraft(r); ui.viewId = null; return render();
      }
      case "det-delete": ui.confirmDelete = true; return render();
      case "del-cancel": ui.confirmDelete = false; return render();
      case "del-ok": {
        const i = db.reportes.findIndex((x) => x.id === ui.viewId), r = db.reportes[i];
        if (r && (r.estado === "BORRADOR" || r.tipo === "VENTAS")) { db.reportes.splice(i, 1); audit(r.tipo === "VENTAS" ? "Venta eliminada" : "Borrador eliminado", `${MOV[r.tipo].label} · ${local(r.localId).nombre} ${fmt.period(r.desde, r.hasta)}${r.tipo === "VENTAS" ? " · " + fmt.money(reportTotals(r).ventas) : ""}`); save(); }
        ui.viewId = null; ui.confirmDelete = false; render(); return toast(r && r.tipo === "VENTAS" ? "Venta eliminada" : "Borrador eliminado");
      }
      case "as-jefe": session.rol = isAdmin() ? "LECTURA" : "ADMINISTRADORA"; data.store.saveSession(session); render(); return toast(isAdmin() ? "Viendo como administradora" : "Viendo como jefe: solo lectura");
      case "reset": ui.confirmReset = true; return render();
      case "reset-cancel": ui.confirmReset = false; return render();
      case "reset-ok": db = data.seed(); save(); ui.confirmReset = false; render(); return toast("Datos de ejemplo restablecidos");
      case "backup": {
        const blob = new Blob([JSON.stringify({ app: "ppx-edupan", exportado: util.now(), datos: db }, null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `respaldo-edupan-${today()}.json`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        db.ultimoRespaldo = util.now();
        audit("Respaldo descargado", `respaldo-edupan-${today()}.json`); save(); render(); return toast("Respaldo descargado");
      }
      case "restore-ok": {
        if (!ui.restore) return;
        if (!data.DEMO) { ui.restore.usuarios = db.usuarios; ui.restore.auditoria = db.auditoria; ui.restore.ultimoRespaldo = db.ultimoRespaldo; } // el acceso y la actividad no se reemplazan
        db = data.migrate(ui.restore); ui.restore = null;
        audit("Respaldo restaurado", `${db.productos.length} productos y ${db.reportes.length} reportes`); save(); render(); return toast("Respaldo restaurado");
      }
      case "restore-cancel": ui.restore = null; $("#restore-box").innerHTML = ""; return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("tr[data-open]")) e.target.click();
    if (e.key === "Escape") document.querySelector(".overlay")?.remove();
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.bind === "periodo") { ui.periodo = t.value; return render(); }
    if (t.dataset.bind === "perdPeriodo") { ui.perdPeriodo = t.value; return render(); }
    if (t.dataset.bind === "infPeriodo") {
      ui.inf.periodo = t.value;
      if (t.value === "custom" && !ui.inf.desde) { const r = rules.periodRange("mes"); ui.inf.desde = r[0]; ui.inf.hasta = r[1]; }
      return render();
    }
    if (t.dataset.inf) { ui.inf[t.dataset.inf] = t.value; return render(); }
    if (t.dataset.infloc) { ui.inf.locs[t.dataset.infloc] = t.checked; return render(); }
    if (t.dataset.infhoja) { ui.inf.hojas[t.dataset.infhoja] = t.checked; return render(); }
    if (t.id === "ed-upcost" && ui.draft) { ui.draft.actualizarCosto = t.checked; return; }
    if (t.dataset.k === "motivo" && ui.draft) { ui.draft.lineas[Number(t.dataset.line)].motivo = t.value; $("#ed-summary").innerHTML = movSummary(ui.draft); return; }
    if (t.dataset.tipo && isAdmin()) { const l = local(t.dataset.tipo); l.tipo = t.value; audit("Local actualizado", `${l.nombre}: ${l.tipo}`); save(); render(); return toast(`${l.nombre} ahora es ${l.tipo.toLowerCase()}`); }
    if (t.dataset.draft === "fecha" && ui.draft) { ui.draft.desde = ui.draft.hasta = t.value; if (ui.draft.tipo !== "VENTAS") render(); return; }
    if (t.dataset.dir && isAdmin()) { const l = local(t.dataset.dir); l.direccion = t.value.trim(); audit("Local actualizado", `${l.nombre}: dirección «${l.direccion || "pendiente"}»`); save(); return toast("Dirección guardada"); }
    if (t.dataset.k === "productoId" && ui.draft) {
      const l = ui.draft.lineas[Number(t.dataset.line)], p = producto(t.value);
      l.productoId = t.value; if (p) { l.precio = p.precio; l.costo = p.costo; if (ui.draft.tipo === "PERDIDA" && !l.motivo) l.motivo = rules.MOTIVOS[0]; }
      return render();
    }
    if (["desde", "hasta"].includes(t.dataset.draft) && ui.draft) ui.draft[t.dataset.draft] = t.value;
    if (t.dataset.draft === "localId" && ui.draft) { ui.draft.localId = t.value; render(); }
  });

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "prod-q") { ui.prodQuery = t.value; const pos = t.selectionStart; render(); const n = $("#prod-q"); n.focus(); n.setSelectionRange(pos, pos); return; }
    if (!ui.draft) return;
    if (t.dataset.line !== undefined && t.dataset.k !== "productoId" && t.dataset.k !== "motivo") {
      const i = Number(t.dataset.line), v = parseNum(t.value);
      ui.draft.lineas[i][t.dataset.k] = isNaN(v) ? (t.value.trim() === "" ? "" : NaN) : v;
      const sub = document.querySelector(`[data-sub="${i}"]`);
      if (ui.draft.tipo === "INVENTARIO") { if (sub) sub.innerHTML = invLineValue(ui.draft.lineas[i], ui.draft); $("#ed-summary").innerHTML = invSummary(ui.draft); return; }
      if (ui.draft.tipo === "ENTRADA" || ui.draft.tipo === "PERDIDA") { if (sub) sub.innerHTML = movLineValue(ui.draft.lineas[i]); $("#ed-summary").innerHTML = movSummary(ui.draft); return; }
      if (sub) sub.textContent = fmt.money(rules.lineTotal(ui.draft.lineas[i]));
      $("#ed-summary").innerHTML = editorSummary(ui.draft);
      return;
    }
    if (t.dataset.draft === "totalDeclarado") { ui.draft.totalDeclarado = t.value.trim() === "" ? "" : parseNum(t.value); $("#ed-summary").innerHTML = editorSummary(ui.draft); return; }
    if (["obs", "proveedor", "factura"].includes(t.dataset.draft)) { ui.draft[t.dataset.draft] = t.value; return; }
    if (["desde", "hasta"].includes(t.dataset.draft)) ui.draft[t.dataset.draft] = t.value;
    if (t.dataset.draft === "fecha") ui.draft.desde = ui.draft.hasta = t.value;
  });

  document.addEventListener("change", (e) => {
    if (e.target.id !== "restore-file" || !isAdmin()) return;
    const f = e.target.files[0]; if (!f) return;
    const box = $("#restore-box");
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result), d = j && j.datos;
        const okArr = (k) => d && Array.isArray(d[k]);
        if (!j || j.app !== "ppx-edupan" || !["locales", "productos", "reportes", "usuarios", "auditoria"].every(okArr)) throw new Error();
        ui.restore = d;
        box.innerHTML = `<div class="confirm-box"><span>El respaldo del <b>${fmt.stamp(j.exportado)}</b> tiene <b>${d.productos.length} producto${d.productos.length === 1 ? "" : "s"}</b> y <b>${d.reportes.length} reporte${d.reportes.length === 1 ? "" : "s"}</b>. Restaurarlo reemplaza ${data.DEMO ? "todo lo que hay ahora en este navegador" : "los productos y reportes que hay ahora en la base de datos"}.</span><div class="actions"><button class="btn ghost" data-act="restore-cancel">Cancelar</button><button class="btn primary" data-act="restore-ok">Restaurar</button></div></div>`;
      } catch (x) { box.innerHTML = '<div class="note bad">Ese archivo no es un respaldo de este panel.</div>'; }
      e.target.value = "";
    };
    rd.readAsText(f);
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id !== "user-form") return;
    e.preventDefault();
    if (!isAdmin()) return;
    const nombre = $("#us-nombre").value.trim(), email = $("#us-email").value.trim().toLowerCase(), errs = [];
    if (!nombre) errs.push("Escribe el nombre.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.push("Escribe un correo válido.");
    if (db.usuarios.some((u) => u.email.toLowerCase() === email)) errs.push("Ese correo ya tiene acceso.");
    if (errs.length) { $("#us-err").innerHTML = errs.map((x) => `<div class="note bad">${esc(x)}</div>`).join(""); return; }
    if (data.DEMO) {
      db.usuarios.push({ id: uid(), nombre, email, rol: "LECTURA", activo: true });
      audit("Usuario agregado", `${nombre} (${email}) con acceso de solo lectura`);
      save(); render(); return toast("Usuario agregado");
    }
    if (!session.duena) return;
    e.target.querySelector("button[type=submit]").disabled = true;
    data.cloud.setAcceso((acc) => { if (!acc.lectores.includes(email)) acc.lectores.push(email); acc.nombres[email] = nombre; })
      .then(() => { audit("Usuario agregado", `${nombre} (${email}) con acceso de solo lectura`); save(); render(); toast("Acceso dado a " + email); })
      .catch((x) => { $("#us-err").innerHTML = `<div class="note bad">${esc(data.cloud.message(x))}</div>`; e.target.querySelector("button[type=submit]").disabled = false; });
  });

  window.addEventListener("hashchange", () => {
    ui.draft = ui.pendingDraft || null; ui.viewId = ui.pendingOpen || null; ui.pendingOpen = null; ui.pendingDraft = null; ui.reopen = false; ui.confirmDelete = false;
    ui.rolDraft = null; ui.rolNew = null; ui.rolConfirm = null; ui.catEdit = null;
    if (route() === "diario") ui.diaTab = "mes";
    render(); window.scrollTo(0, 0);
  });

  /* ---------- Arranque ---------- */
  if (data.DEMO) render();
  else if (!data.cloud.init()) { ui.gate = { tipo: "config" }; render(); }
  else {
    render();
    data.cloud.onAuth((user) => {
      if (!user) {
        session = null; db = data.empty(); ui.gate = null;
        const re = data.cloud.redirectError(); if (re) ui.loginMsg = { t: data.cloud.message(re) };
        return render();
      }
      startSession(user);
    });
    // Cambios hechos desde otro equipo: se actualiza la pantalla si no hay nada a medio escribir.
    let stale = false;
    const busyEditing = () => !!ui.draft || !!ui.rolDraft || !!document.querySelector(".overlay") || ["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement || {}).tagName);
    data.cloud.on("remote", () => { if (!session) return; if (busyEditing()) stale = true; else render(); });
    document.addEventListener("focusout", () => setTimeout(() => { if (stale && session && !busyEditing()) { stale = false; render(); } }, 300));
    data.cloud.on("status", (st) => {
      const el = document.getElementById("sync"); if (!el) return;
      if (st.error) { el.hidden = false; el.className = "sync bad"; el.textContent = "No se guardó"; el.title = st.error; toast("No se pudo guardar en la nube: " + st.error); return; }
      if (st.pending) { el.hidden = false; el.className = "sync"; el.textContent = "Guardando…"; el.title = ""; }
      else if (el.className === "sync") { el.className = "sync good"; el.textContent = "Guardado"; setTimeout(() => { if (el.className === "sync good") el.hidden = true; }, 1800); }
    });
    window.addEventListener("beforeunload", (e) => { if (data.cloud.pending()) { e.preventDefault(); e.returnValue = ""; } });
  }
})(window.PPX);
