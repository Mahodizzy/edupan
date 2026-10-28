/* =============================================================
   EduPan · PPX — Datos
   · Vista previa (demo: true): datos de ejemplo en este navegador.
   · Sistema real (demo: false): Firebase Authentication para el
     login y Cloud Firestore como base de datos en la nube.
   Las pantallas (app.js) y las reglas (core.js) no cambian entre
   un modo y otro: solo este archivo sabe dónde se guarda todo.
   ============================================================= */
(function (PPX) {
  "use strict";
  const { util } = PPX;
  const CFG = window.PPX_CONFIG || { demo: true, administradora: { nombre: "Ely Piccinini", email: "elypiccinini298@gmail.com" } };
  const DEMO = !!CFG.demo;
  const KEY = DEMO ? "ppx-edupan-demo" : "ppx-edupan";
  const ADMIN_EMAIL = CFG.administradora.email;
  const ADMIN_NAME = CFG.administradora.nombre;

  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /** Los 3 locales: 2 panaderías y 1 pastelería (el tipo se cambia en Ajustes). */
  const LOCALES = () => [
    { id: "matriz", nombre: "Matriz", tipo: "Panadería", direccion: "", esMatriz: true },
    { id: "suc1", nombre: "Sucursal 1", tipo: "Panadería", direccion: "", esMatriz: false },
    { id: "suc2", nombre: "Sucursal 2", tipo: "Pastelería", direccion: "", esMatriz: false },
  ];
  /** Completa campos nuevos en datos guardados con versiones anteriores. */
  function migrate(db) {
    if (!db) return db;
    const def = Object.fromEntries(LOCALES().map((l) => [l.id, l.tipo]));
    db.locales.forEach((l) => { if (!l.tipo) l.tipo = def[l.id] || "Panadería"; });
    db.productos.forEach((p) => { if (p.stockMin === undefined) p.stockMin = null; });
    db.reportes.forEach((r) => { if (!r.tipo) r.tipo = "VENTAS"; });
    const F = PPX.fin;
    if (!Array.isArray(db.categorias)) db.categorias = F.CATEGORIAS();
    db.categorias.forEach((c) => { if (!c.tipo) c.tipo = "egreso"; });
    if (!db.categorias.some((c) => c.tipo === "ingreso")) db.categorias.push(...F.CATEGORIAS_ING());
    if (!Array.isArray(db.empleados)) db.empleados = [];
    db.empleados.forEach((e) => { if (e.decimos === undefined) e.decimos = true; if (e.fondos === undefined) e.fondos = true; });
    if (!Array.isArray(db.fijos)) db.fijos = [];
    db.nomina = Object.assign(F.NOMINA(), db.nomina || {});
    return db;
  }

  /** Sistema vacío: solo los 3 locales y la administradora. */
  function empty() {
    return {
      version: 4, reportes: [], productos: [],
      locales: LOCALES(), categorias: PPX.fin.CATEGORIAS(), empleados: [], fijos: [], nomina: PPX.fin.NOMINA(),
      usuarios: [{ id: "ely", nombre: ADMIN_NAME, email: ADMIN_EMAIL, rol: "ADMINISTRADORA", activo: true }],
      auditoria: [{ id: util.uid(), fecha: util.now(), usuario: "Sistema", accion: "Sistema iniciado", detalle: "Locales Matriz, Sucursal 1 y Sucursal 2 creados" }],
    };
  }

  /** Ejemplo de reportes diarios, gastos, personal y roles (vista previa), con montos parecidos al Excel de la administradora. */
  function seedFinanzas(r, lastSunday) {
    const F = PPX.fin, reportes = [], t = util.today();
    const doc = (o) => reportes.push(Object.assign({ id: util.uid(), estado: "CONFIRMADO", obs: "", creado: util.now(), ejemplo: true }, o));
    const perfil = { matriz: { ing: 270, eg: 0.32 }, suc1: { ing: 100, eg: 0.18 }, suc2: { ing: 400, eg: 0.14 } };
    const det = ["insumos", "insumos", "gas", "transporte", "limpieza", "mantenimiento"];
    const ingMix = { matriz: [["ing-pan", 0.8], ["ing-beb", 0.2]], suc1: [["ing-pan", 0.85], ["ing-beb", 0.15]], suc2: [["ing-pas", 0.6], ["ing-ped", 0.3], ["ing-beb", 0.1]] };
    const start = util.addDays(t, -80), cajas = new Map();
    for (let d = start; d < t; d = util.addDays(d, 1)) {
      const dow = new Date(d + "T12:00:00").getDay(), wk = dow === 0 || dow === 6 ? 1.25 : 1;
      for (const id of ["matriz", "suc1", "suc2"]) {
        if (r() < 0.04) continue; // algún día sin reporte
        const P = perfil[id], ing = util.round2(P.ing * wk * (0.8 + r() * 0.4)), eg = util.round2(ing * P.eg * (0.5 + r()));
        let lineas, ingLineas;
        if (r() < 0.55) lineas = [{ categoriaId: "", monto: eg }];
        else { const a = det[Math.floor(r() * det.length)], b = det[Math.floor(r() * det.length)], x = util.round2(eg * (0.4 + r() * 0.3)); lineas = a === b ? [{ categoriaId: a, monto: eg }] : [{ categoriaId: a, monto: x }, { categoriaId: b, monto: util.round2(eg - x) }]; }
        if (r() < 0.5) ingLineas = [{ categoriaId: "", monto: ing }];
        else { let acc = 0; ingLineas = ingMix[id].map(([c, f], i, arr) => { const v = i === arr.length - 1 ? util.round2(ing - acc) : util.round2(ing * f * (0.9 + r() * 0.2)); acc += v; return { categoriaId: c, monto: v }; }); }
        const rep = { tipo: "CAJA", localId: id, desde: d, hasta: d, ingresos: ing, ingLineas, lineas };
        doc(rep); cajas.set(d + "|" + id, reportes[reportes.length - 1]);
      }
    }
    // Arriendo, luz, agua e internet: se pagan con la caja del día y se registran como egreso con su categoría
    const fijosEj = [["arriendo", "matriz", 450, 5], ["arriendo", "suc1", 280, 5], ["arriendo", "suc2", 380, 5], ["luz", "matriz", 95, 15], ["luz", "suc1", 38, 15], ["luz", "suc2", 55, 15], ["agua", "matriz", 22, 20], ["agua", "suc2", 12, 20], ["internet", "matriz", 30, 10]];
    const meses = [-2, -1, 0].map((k) => { const d = new Date(t + "T12:00:00"); return util.iso(new Date(d.getFullYear(), d.getMonth() + k, 1)).slice(0, 7); });
    for (const mes of meses) for (const [cat, id, monto, dia] of fijosEj) {
      for (let k = 0; k < 4; k++) { const c = cajas.get(`${mes}-${String(dia + k).padStart(2, "0")}|${id}`); if (c) { c.lineas.push({ categoriaId: cat, monto: util.round2(monto * (cat === "arriendo" ? 1 : 0.85 + r() * 0.3)) }); break; } }
    }
    const fijos = [];
    const E = (nombre, localId, cargo, sueldo, ingreso, extra) => Object.assign({ id: util.uid(), nombre, localId, cargo, sueldo, frecuencia: "MENSUAL", ingreso, iess: true, decimos: true, decimosMensual: false, fondos: true, fondosEnRol: true, activo: true, ejemplo: true }, extra || {});
    const empleados = [
      E("Carlos Mendoza", "matriz", "Panadero", 600, "2022-03-01"), E("Luis Andrade", "matriz", "Ayudante de panadería", 482, "2025-02-10"), E("María Torres", "matriz", "Vendedora", 482, "2023-07-01"),
      E("Andrea Vera", "suc1", "Vendedora", 482, "2024-11-04", { decimosMensual: true }),
      E("Patricia León", "suc2", "Pastelera", 550, "2021-09-15"), E("Jorge Salazar", "suc2", "Ayudante (sin afiliar)", 482, "2026-06-01", { iess: false, decimos: false, fondos: false }),
    ];
    for (const mes of meses.slice(0, 2)) for (const id of ["matriz", "suc1", "suc2"]) {
      const per = F.periodo(mes, "M");
      const lineas = empleados.filter((e) => e.localId === id && e.ingreso <= per.hasta).map((e, i) => F.rolLinea(e, { dias: 30, h50: i === 0 ? 6 : 0, bonos: 0, anticipos: i === 2 ? 50 : 0 }, F.NOMINA(), "M", per.hasta));
      doc({ tipo: "ROL", localId: id, desde: per.desde, hasta: per.hasta, mes, tramo: "M", periodoTxt: per.txt, lineas, aprobado: util.now() });
    }
    const categorias = F.CATEGORIAS();
    return { reportes, categorias, empleados, fijos };
  }

  /** Datos de ejemplo (solo en la vista previa): 10 productos y 10 semanas de reportes por local. */
  function seed() {
    if (!DEMO) return empty();
    const locales = LOCALES();
    // origen: "P" = producción propia, "C" = compra a proveedor (reventa)
    const P = (nombre, precio, costo, unidad, base, stockMin, pas, origen = "P") => ({ id: util.uid(), nombre, precio, costo, unidad, stockMin, activo: true, ejemplo: true, base, pas: !!pas, origen });
    const productos = [
      P("Pan de yuca", 0.25, 0.11, "unidad", 220, 40), P("Pan enrollado", 0.15, 0.06, "unidad", 380, 60), P("Cachito", 0.20, 0.08, "unidad", 260, 40),
      P("Pan de agua", 0.12, 0.05, "unidad", 300, 50), P("Empanada de viento", 0.60, 0.24, "unidad", 90, 15), P("Torta de chocolate (porción)", 1.50, 0.62, "porción", 40, 12, true),
      P("Pastel de manzana (porción)", 1.25, 0.55, "porción", 30, 10, true), P("Galletas de mantequilla", 1.00, 0.42, "funda", 45, 10, true),
      P("Leche 1 litro", 1.10, 0.95, "unidad", 60, 24, false, "C"), P("Gaseosa 1,35 L", 1.25, 0.92, "unidad", 35, 12, false, "C"),
      P("Bizcocho", 0.30, null, "unidad", 70, null),
    ];
    const factor = { matriz: 1.0, suc1: 0.72, suc2: 0.55 };
    // La pastelería vende más tortas y pasteles y menos pan.
    const mix = (loc, p) => (loc.tipo === "Pastelería" ? (p.pas ? 2.6 : 0.35) : 1);
    const r = rng(20261027);
    const t = util.today();
    const d = new Date(t + "T12:00:00");
    const lastSunday = util.addDays(t, -(((d.getDay() + 7) % 7) || 7));
    const reportes = [];
    const doc = (o) => reportes.push(Object.assign({ id: util.uid(), totalDeclarado: "", estado: "CONFIRMADO", obs: "", creado: util.now(), ejemplo: true }, o));
    const inicio = util.addDays(lastSunday, -7 * 10);
    const proveedores = { "Leche 1 litro": "Lácteos del Valle", "Gaseosa 1,35 L": "Distribuidora Andina" };

    for (const loc of locales) {
      // Conteo inicial: punto de partida de cada local
      const stock = new Map(productos.map((p) => [p.id, Math.round((p.stockMin || 20) * 1.5)]));
      doc({ localId: loc.id, tipo: "INVENTARIO", desde: inicio, hasta: inicio, obs: "Conteo inicial", lineas: productos.map((p) => ({ productoId: p.id, cantidad: stock.get(p.id), costo: p.costo })) });

      for (let w = 9; w >= 0; w--) {
        const hasta = util.addDays(lastSunday, -7 * w), desde = util.addDays(hasta, -6), sabado = util.addDays(hasta, -1);
        const ventas = [], perdidas = [], prod = [], compras = [];
        for (const [i, p] of productos.entries()) {
          const vend = Math.max(0, Math.round(p.base * factor[loc.id] * mix(loc, p) * (0.8 + r() * 0.45) * (1 + (9 - w) * 0.012)));
          const perd = p.origen === "P" ? Math.round(vend * (0.02 + r() * 0.05)) : (r() < 0.12 ? 1 : 0);
          const meta = (p.stockMin || 20) * 1.6;
          let entra = Math.max(0, Math.round(vend + perd + (meta - stock.get(p.id)) + (r() - 0.5) * 6));
          // Al final quedan algunos casos para revisar
          if (w === 0 && loc.id === "suc1" && i === 2) entra = Math.max(0, vend + perd - stock.get(p.id));
          if (w === 0 && loc.id === "matriz" && i === 4) entra = Math.max(0, vend + perd - stock.get(p.id) + Math.round((p.stockMin || 10) * 0.5));
          if (w === 0 && loc.id === "suc2" && i === 9) entra = Math.max(0, vend + perd - stock.get(p.id) + 4);
          if (entra) (p.origen === "C" ? compras : prod).push({ productoId: p.id, cantidad: entra, costo: p.costo });
          if (vend) ventas.push({ productoId: p.id, cantidad: vend, precio: p.precio, costo: p.costo });
          if (perd) perdidas.push({ productoId: p.id, cantidad: perd, costo: p.costo, motivo: p.origen === "C" ? "Roto o derramado" : r() < 0.7 ? "No se vendió / se dañó" : r() < 0.6 ? "Vencido" : "Regalado o degustación" });
          stock.set(p.id, stock.get(p.id) + entra - perd - vend);
        }
        if (prod.length) doc({ localId: loc.id, tipo: "ENTRADA", subtipo: "PRODUCCION", desde, hasta: desde, lineas: prod });
        const porProv = {};
        for (const l of compras) { const n = proveedores[productos.find((p) => p.id === l.productoId).nombre]; (porProv[n] = porProv[n] || []).push(l); }
        for (const [prov, lineas] of Object.entries(porProv)) doc({ localId: loc.id, tipo: "ENTRADA", subtipo: "COMPRA", proveedor: prov, factura: `001-00${1200 + w * 3}`, desde, hasta: desde, lineas });
        if (perdidas.length) doc({ localId: loc.id, tipo: "PERDIDA", desde: sabado, hasta: sabado, lineas: perdidas });
        const total = util.round2(ventas.reduce((a, l) => a + l.cantidad * l.precio, 0));
        const dif = w === 3 && loc.id === "suc2";
        doc({
          localId: loc.id, tipo: "VENTAS", desde: hasta, hasta, lineas: ventas, totalDeclarado: "", obs: "",
        });
      }
      // Conteo físico al cierre en la Matriz: encuentra pequeñas diferencias
      if (loc.id === "matriz") {
        doc({ localId: loc.id, tipo: "INVENTARIO", desde: lastSunday, hasta: lastSunday, obs: "Conteo físico de fin de semana",
          lineas: productos.filter((p) => p.origen === "P").map((p, i) => ({ productoId: p.id, cantidad: Math.max(0, stock.get(p.id) - (i === 0 ? 6 : i === 2 ? 3 : 0)), costo: p.costo })) });
      }
    }
    const fin = seedFinanzas(r, lastSunday);
    reportes.push(...fin.reportes);
    return {
      version: 4, locales, reportes, categorias: fin.categorias, empleados: fin.empleados, fijos: fin.fijos, nomina: PPX.fin.NOMINA(),
      productos: productos.map(({ base, pas, origen, ...p }) => p),
      usuarios: [{ id: "ely", nombre: ADMIN_NAME, email: ADMIN_EMAIL, rol: "ADMINISTRADORA", activo: true }],
      auditoria: [{ id: util.uid(), fecha: util.now(), usuario: "Sistema", accion: "Datos de ejemplo cargados", detalle: "11 productos y 10 semanas de entradas, ventas y pérdidas por local" }],
    };
  }

  /* ---------- Vista previa: guardado en este navegador ---------- */
  const store = {
    load() { try { const s = localStorage.getItem(KEY); return s ? migrate(JSON.parse(s)) : null; } catch (e) { return null; } },
    save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* sin almacenamiento: sigue en memoria */ } },
    loadSession() { try { const s = sessionStorage.getItem(KEY + "-s"); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    saveSession(s) { try { s ? sessionStorage.setItem(KEY + "-s", JSON.stringify(s)) : sessionStorage.removeItem(KEY + "-s"); } catch (e) { /* idem */ } },
  };

  /* =============================================================
     Nube: Firebase Authentication + Cloud Firestore
     Estructura de la base de datos:
       ppx/acceso      { admins:[correos], lectores:[correos], nombres:{correo:nombre} }
       ppx/catalogo    { productos:[…], locales:[…], ultimoRespaldo }
       reportes/{id}   un documento por reporte (ventas, entradas, pérdidas, conteos)
       auditoria/{id}  registro de actividad (solo se agrega, nunca se edita)
     Quién puede leer o escribir lo deciden las reglas de
     firestore.rules en el servidor, no esta página.
     ============================================================= */
  const FB = CFG.firebase || {};
  const CONFIGURED = !DEMO && !!FB.apiKey && !/PEGA|TU_|xxx/i.test(FB.apiKey) && !!FB.projectId;
  let fa = null, fs = null, current = null, role = null, owner = false, unsub = [], pending = 0, lastRedirectError = null;
  const base = { cat: null, rep: new Map(), aud: new Set() };
  const listeners = { remote: [], status: [] };
  const emit = (k, v) => listeners[k].forEach((f) => { try { f(v); } catch (e) { console.error(e); } });

  const ERR = {
    "auth/invalid-email": "El correo no es válido.",
    "auth/missing-email": "Escribe tu correo.",
    "auth/missing-password": "Escribe tu contraseña.",
    "auth/user-disabled": "Esta cuenta está desactivada.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/invalid-credential": "Correo o contraseña incorrectos. Si entras con Google, usa el botón «Entrar con Google».",
    "auth/invalid-login-credentials": "Correo o contraseña incorrectos. Si entras con Google, usa el botón «Entrar con Google».",
    "auth/too-many-requests": "Demasiados intentos seguidos. Espera unos minutos o usa «¿Olvidaste tu contraseña?».",
    "auth/email-already-in-use": "Ese correo ya tiene cuenta. Entra con tu contraseña o con Google, o usa «¿Olvidaste tu contraseña?».",
    "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
    "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de terminar. Intenta otra vez.",
    "auth/cancelled-popup-request": "Se cerró la ventana de Google antes de terminar. Intenta otra vez.",
    "auth/unauthorized-domain": "Esta dirección web no está autorizada en Firebase. Agrégala en Authentication → Configuración → Dominios autorizados (paso 6 de la guía).",
    "auth/operation-not-allowed": "Este método de acceso no está activado en Firebase (Authentication → Método de acceso, paso 3 de la guía).",
    "auth/network-request-failed": "Sin conexión a internet. Revisa la red e intenta otra vez.",
    "auth/account-exists-with-different-credential": "Ese correo ya entra con otro método. Usa el método con el que creaste la cuenta.",
    "auth/requires-recent-login": "Por seguridad, cierra sesión y vuelve a entrar antes de hacer este cambio.",
    "auth/invalid-api-key": "La configuración de Firebase en config.js no es correcta (apiKey). Revisa el paso 5 de la guía.",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "La configuración de Firebase en config.js no es correcta (apiKey). Revisa el paso 5 de la guía.",
    "permission-denied": "La base de datos rechazó la operación. Revisa que las reglas de firestore.rules estén publicadas (paso 4 de la guía).",
    "unavailable": "No hay conexión con la base de datos. Revisa internet e intenta otra vez.",
    "failed-precondition": "La base de datos no está lista. Revisa que Firestore esté creado (paso 4 de la guía).",
    "not-found": "No se encontró la base de datos. Revisa que Firestore esté creado y que projectId en config.js sea correcto.",
  };
  const message = (e) => (e && (ERR[e.code] || ERR[(e.code || "").replace(/^firestore\//, "")])) || (e && e.message) || "Ocurrió un error inesperado.";
  const noAccess = (email) => Object.assign(new Error(`El correo ${email} no tiene acceso a este panel.`), { code: "no-access" });
  const plain = (o) => JSON.parse(JSON.stringify(o)); // Firestore no acepta valores undefined

  function init() {
    if (fa) return true;
    if (!CONFIGURED || !window.firebase || !firebase.initializeApp) return false;
    firebase.initializeApp(FB);
    fa = firebase.auth(); fs = firebase.firestore();
    fa.languageCode = "es";
    fa.getRedirectResult().catch((e) => { lastRedirectError = e; });
    return true;
  }
  const ref = {
    acceso: () => fs.collection("ppx").doc("acceso"),
    catalogo: () => fs.collection("ppx").doc("catalogo"),
    reporte: (id) => fs.collection("reportes").doc(id),
    audit: (id) => fs.collection("auditoria").doc(id),
  };

  function usuariosDe(acc) {
    const nombres = acc.nombres || {};
    const out = [{ id: "ely", nombre: ADMIN_NAME, email: ADMIN_EMAIL, rol: "ADMINISTRADORA", activo: true, duena: true }];
    (acc.admins || []).filter((e) => e !== ADMIN_EMAIL.toLowerCase()).forEach((e) => out.push({ id: e, nombre: nombres[e] || e, email: e, rol: "ADMINISTRADORA", activo: true }));
    (acc.lectores || []).forEach((e) => out.push({ id: e, nombre: nombres[e] || e, email: e, rol: "LECTURA", activo: true }));
    return out;
  }
  const CAT_KEYS = ["productos", "locales", "categorias", "empleados", "fijos", "nomina"];
  const catalogOf = (db) => plain(Object.assign({ version: 4, ultimoRespaldo: db.ultimoRespaldo || null }, ...CAT_KEYS.map((k) => ({ [k]: db[k] }))));
  const applyCatalog = (db, c) => { CAT_KEYS.forEach((k) => { if (c[k] !== undefined) db[k] = c[k]; }); db.ultimoRespaldo = c.ultimoRespaldo || null; return migrate(db); };

  function setStatus() { emit("status", { pending }); }
  function commit(ops) {
    if (!ops.length) return Promise.resolve();
    const chunks = [];
    for (let i = 0; i < ops.length; i += 400) chunks.push(ops.slice(i, i + 400));
    pending++; setStatus();
    return Promise.all(chunks.map((c) => { const b = fs.batch(); c.forEach((o) => o.apply(b)); return b.commit(); }))
      .catch((e) => { ops.forEach((o) => o.undo()); emit("status", { pending, error: message(e) }); throw e; })
      .finally(() => { pending--; setStatus(); });
  }

  /** Guarda en la nube solo lo que cambió desde la última vez. */
  function save(db) {
    current = db;
    if (role !== "ADMINISTRADORA") return Promise.resolve();
    const ops = [];
    const cj = JSON.stringify(catalogOf(db));
    if (cj !== base.cat) { const prev = base.cat; base.cat = cj; const data = JSON.parse(cj); ops.push({ apply: (b) => b.set(ref.catalogo(), data), undo: () => { if (base.cat === cj) base.cat = prev; } }); }
    const ids = new Set();
    for (const r of db.reportes) {
      ids.add(r.id);
      const j = JSON.stringify(r);
      if (base.rep.get(r.id) !== j) { base.rep.set(r.id, j); const data = JSON.parse(j); ops.push({ apply: (b) => b.set(ref.reporte(r.id), data), undo: () => base.rep.delete(r.id) }); }
    }
    for (const id of [...base.rep.keys()]) if (!ids.has(id)) { const prev = base.rep.get(id); base.rep.delete(id); ops.push({ apply: (b) => b.delete(ref.reporte(id)), undo: () => base.rep.set(id, prev) }); }
    for (const a of db.auditoria) if (!base.aud.has(a.id)) { base.aud.add(a.id); const data = plain(a); ops.push({ apply: (b) => b.set(ref.audit(a.id), data), undo: () => base.aud.delete(a.id) }); }
    return commit(ops).catch(() => {});
  }

  /** Cambios hechos desde otro equipo (por ejemplo, el jefe ve lo que Ely registra). */
  function subscribe() {
    unsub.forEach((u) => u()); unsub = [];
    unsub.push(ref.catalogo().onSnapshot((s) => {
      if (s.metadata.hasPendingWrites || !s.exists || !current) return;
      const d = s.data(), j = JSON.stringify(catalogOf(Object.assign({}, current, d)));
      if (j === base.cat) return;
      base.cat = j; applyCatalog(current, d); emit("remote", "catalogo");
    }, () => {}));
    unsub.push(fs.collection("reportes").onSnapshot((s) => {
      if (s.metadata.hasPendingWrites || !current) return;
      let changed = false;
      s.docChanges().forEach((c) => {
        const id = c.doc.id;
        if (c.type === "removed") { if (base.rep.has(id)) { base.rep.delete(id); current.reportes = current.reportes.filter((r) => r.id !== id); changed = true; } return; }
        const r = c.doc.data(), j = JSON.stringify(r);
        if (base.rep.get(id) === j) return;
        base.rep.set(id, j);
        const i = current.reportes.findIndex((x) => x.id === id);
        if (i >= 0) current.reportes[i] = r; else current.reportes.push(r);
        changed = true;
      });
      if (changed) { migrate(current); emit("remote", "reportes"); }
    }, () => {}));
    unsub.push(ref.acceso().onSnapshot((s) => {
      if (s.metadata.hasPendingWrites || !s.exists || !current) return;
      current.usuarios = usuariosDe(s.data()); emit("remote", "acceso");
    }, () => {}));
  }

  /** Abre la sesión: revisa el acceso y descarga los datos. */
  async function open(user) {
    const email = (user.email || "").toLowerCase();
    owner = email === ADMIN_EMAIL.toLowerCase();
    let acc;
    try { const s = await ref.acceso().get(); acc = s.exists ? s.data() : null; }
    catch (e) { if (e.code === "permission-denied" && !owner) throw noAccess(email); throw e; }
    if (!acc) {
      if (!owner) throw noAccess(email);
      acc = { admins: [], lectores: [], nombres: {} };
      await ref.acceso().set(acc);
    }
    if (owner || (acc.admins || []).includes(email)) role = "ADMINISTRADORA";
    else if ((acc.lectores || []).includes(email)) role = "LECTURA";
    else throw noAccess(email);

    const [cat, reps, auds] = await Promise.all([
      ref.catalogo().get(),
      fs.collection("reportes").get(),
      fs.collection("auditoria").orderBy("fecha", "desc").limit(300).get(),
    ]);
    const db = empty();
    db.usuarios = usuariosDe(acc);
    db.auditoria = auds.docs.map((d) => d.data());
    db.reportes = reps.docs.map((d) => d.data());
    if (cat.exists) applyCatalog(db, cat.data());
    migrate(db);
    base.cat = cat.exists ? JSON.stringify(catalogOf(db)) : null;
    base.rep = new Map(reps.docs.map((d) => [d.id, JSON.stringify(d.data())]));
    base.aud = new Set(db.auditoria.map((a) => a.id));
    if (!cat.exists) db.auditoria = empty().auditoria.concat(db.auditoria);
    current = db;
    if (!cat.exists && role === "ADMINISTRADORA") await save(db); // primer ingreso: crea los 3 locales y la primera línea de actividad
    subscribe();
    const nombre = owner ? ADMIN_NAME : (db.usuarios.find((u) => u.email === email) || {}).nombre || user.displayName || email;
    const proveedores = (user.providerData || []).map((p) => p.providerId);
    return { db, session: { id: user.uid, nombre, email, rol: role, duena: owner, proveedores } };
  }

  /** Solo la dueña (Ely) cambia quién tiene acceso. */
  async function setAcceso(fn) {
    const s = await ref.acceso().get(), acc = s.exists ? s.data() : { admins: [], lectores: [], nombres: {} };
    acc.admins = acc.admins || []; acc.lectores = acc.lectores || []; acc.nombres = acc.nombres || {};
    fn(acc);
    await ref.acceso().set(plain(acc));
    if (current) current.usuarios = usuariosDe(acc);
  }

  function close() { unsub.forEach((u) => u()); unsub = []; current = null; role = null; owner = false; base.cat = null; base.rep = new Map(); base.aud = new Set(); }

  const cloud = {
    configured: CONFIGURED,
    init,
    message,
    projectId: FB.projectId || "",
    onAuth(cb) { return fa.onAuthStateChanged(cb); },
    on(k, cb) { listeners[k].push(cb); },
    redirectError() { const e = lastRedirectError; lastRedirectError = null; return e; },
    async google() {
      const p = new firebase.auth.GoogleAuthProvider();
      p.setCustomParameters({ prompt: "select_account" });
      try { await fa.signInWithPopup(p); }
      catch (e) { if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") return fa.signInWithRedirect(p); throw e; }
    },
    signIn: (email, pass) => fa.signInWithEmailAndPassword(email, pass),
    async signUp(email, pass) { const c = await fa.createUserWithEmailAndPassword(email, pass); await c.user.sendEmailVerification(); return c.user; },
    reset: (email) => fa.sendPasswordResetEmail(email),
    resendVerification: () => fa.currentUser && fa.currentUser.sendEmailVerification(),
    async reload() { if (fa.currentUser) await fa.currentUser.reload(); return fa.currentUser; },
    async signOut() { close(); await fa.signOut(); },
    open,
    save,
    setAcceso,
    pending: () => pending,
  };

  PPX.data = { seed, empty, migrate, store, ADMIN_EMAIL, ADMIN_NAME, DEMO, CLOUD: !DEMO, cloud };
})(window.PPX);
