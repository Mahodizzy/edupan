/* =============================================================
   EduPan · PPX — Utilidades y reglas de negocio
   No toca la pantalla: solo cálculos, formatos y validaciones.
   ============================================================= */
window.PPX = window.PPX || {};

(function (PPX) {
  "use strict";

  /* ---------- Formatos ---------- */
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  const fmt = {
    money: (n) => (Number(n) || 0).toLocaleString("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }),
    signedMoney: (n) => (n < 0 ? "−" : n > 0 ? "+" : "") + fmt.money(Math.abs(n)),
    pct: (n) => (isFinite(n) ? (n * 100).toLocaleString("es-EC", { maximumFractionDigits: 1 }) + " %" : "—"),
    int: (n) => (Number(n) || 0).toLocaleString("es-EC", { maximumFractionDigits: 2 }),
    date: (s) => { if (!s) return ""; const [y, m, d] = s.split("-").map(Number); return `${d} ${MESES[m - 1]} ${y}`; },
    short: (s) => { const [, m, d] = s.split("-").map(Number); return `${d} ${MESES[m - 1]}`; },
    period: (a, b) => (a === b ? fmt.date(a) : `${fmt.short(a)} – ${fmt.date(b)}`),
    stamp: (s) => new Date(s).toLocaleString("es-EC", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  };

  /* ---------- Utilidades ---------- */
  const util = {
    esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
    round2: (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100,
    parseNum: (v) => {
      if (v === null || v === undefined) return NaN;
      const s = String(v).trim().replace(/\s/g, "").replace(",", ".");
      return s === "" ? NaN : Number(s);
    },
    uid: () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
    iso: (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    today: () => util.iso(new Date()),
    addDays: (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return util.iso(d); },
    monday: (s) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return util.iso(d); },
    now: () => new Date().toISOString(),
  };

  /* ---------- Reglas ---------- */
  const hasCost = (c) => c !== null && c !== undefined && c !== "" && !isNaN(c);
  const lineTotal = (l) => util.round2((Number(l.cantidad) || 0) * (Number(l.precio) || 0));

  /** Totales de un reporte: ventas, costo y margen (solo sobre líneas con costo). */
  function reportTotals(rep) {
    let ventas = 0, costo = 0, ventasConCosto = 0, unidades = 0;
    for (const l of rep.lineas) {
      const t = lineTotal(l);
      ventas += t;
      unidades += Number(l.cantidad) || 0;
      if (hasCost(l.costo)) { costo += (Number(l.cantidad) || 0) * Number(l.costo); ventasConCosto += t; }
    }
    return {
      ventas: util.round2(ventas), costo: util.round2(costo), ventasConCosto: util.round2(ventasConCosto),
      margen: util.round2(ventasConCosto - costo), unidades,
    };
  }

  /** Compara lo registrado con el total que trae el papel del local. */
  function cuadre(rep) {
    const d = rep.totalDeclarado;
    if (d === null || d === undefined || d === "" || isNaN(d)) return { estado: "sin", dif: 0 };
    const dif = util.round2(reportTotals(rep).ventas - Number(d));
    return { estado: Math.abs(dif) < 0.005 ? "ok" : "dif", dif };
  }

  const overlaps = (a, b) => a.desde <= b.hasta && b.desde <= a.hasta;

  /** Valida un reporte. Con forConfirm aplica también las reglas de confirmación. */
  function validateReport(rep, db, forConfirm) {
    const errs = [];
    const prod = (id) => db.productos.find((p) => p.id === id);
    const loc = (id) => db.locales.find((l) => l.id === id);
    if (!rep.localId) errs.push("Elige el local que entregó el reporte.");
    if (!rep.desde || !rep.hasta) errs.push("Indica las fechas desde y hasta.");
    else if (rep.hasta < rep.desde) errs.push("La fecha «hasta» no puede ser anterior a «desde».");
    else if (rep.hasta > util.today()) errs.push("La fecha «hasta» no puede estar en el futuro.");
    const inv = rep.tipo === "INVENTARIO", mov = rep.tipo === "ENTRADA" || rep.tipo === "PERDIDA";
    const verbo = { VENTAS: "vendida", INVENTARIO: "contada", ENTRADA: "que entró", PERDIDA: "perdida" }[rep.tipo] || "";
    if (forConfirm && !rep.lineas.some((l) => l.productoId)) errs.push({ VENTAS: "Agrega al menos un producto vendido.", INVENTARIO: "Agrega al menos un producto contado.", ENTRADA: "Agrega al menos un producto que entró.", PERDIDA: "Agrega al menos un producto perdido." }[rep.tipo]);
    if (rep.tipo === "ENTRADA" && rep.subtipo === "COMPRA" && !String(rep.proveedor || "").trim()) errs.push("Escribe el nombre del proveedor.");
    const seen = new Set();
    rep.lineas.forEach((l, i) => {
      if (!l.productoId) { if (l.cantidad !== "") errs.push(`Línea ${i + 1}: elige el producto.`); return; }
      const nombre = prod(l.productoId)?.nombre;
      if (seen.has(l.productoId)) errs.push(`«${nombre}» está repetido; súmalo en una sola línea.`);
      seen.add(l.productoId);
      if (l.cantidad === "") { errs.push(`Línea ${i + 1}: escribe la cantidad ${verbo} de «${nombre}».`); return; }
      if (mov && !(Number(l.cantidad) > 0)) errs.push(`Línea ${i + 1}: la cantidad de «${nombre}» debe ser mayor a 0.`);
      if (rep.tipo === "PERDIDA" && !l.motivo) errs.push(`Línea ${i + 1}: elige el motivo de la pérdida de «${nombre}».`);
      if (rep.tipo === "ENTRADA" && l.costo !== null && l.costo !== "" && l.costo !== undefined && (isNaN(l.costo) || Number(l.costo) < 0)) errs.push(`Línea ${i + 1}: el costo debe ser un número igual o mayor a 0.`);
      if (isNaN(l.cantidad) || Number(l.cantidad) < 0) errs.push(`Línea ${i + 1}: la cantidad debe ser un número igual o mayor a 0.`);
      if (rep.tipo === "VENTAS" && (l.precio === "" || isNaN(l.precio) || Number(l.precio) < 0)) errs.push(`Línea ${i + 1}: el precio debe ser un número igual o mayor a 0.`);
    });
    if (forConfirm && inv && rep.localId && rep.desde && rep.hasta) {
      const clash = db.reportes.find((r) => r.id !== rep.id && r.estado === "CONFIRMADO" && r.localId === rep.localId && r.tipo === rep.tipo && overlaps(r, rep));
      if (clash) errs.push(inv
        ? `Ya hay un conteo confirmado de ${loc(rep.localId).nombre} del ${fmt.date(clash.hasta)}. Ábrelo y reábrelo si necesitas corregirlo.`
        : `Ya hay un reporte confirmado de ${loc(rep.localId).nombre} del ${fmt.period(clash.desde, clash.hasta)} que se cruza con estas fechas. Así se evita contar dos veces la misma venta.`);
    }
    return errs;
  }

  /* ---------- Períodos e indicadores ---------- */
  function periodRange(key) {
    const t = util.today(), d = new Date(t + "T12:00:00");
    switch (key) {
      case "7": return [util.addDays(t, -6), t];
      case "30": return [util.addDays(t, -29), t];
      case "90": return [util.addDays(t, -89), t];
      case "mes": return [util.iso(new Date(d.getFullYear(), d.getMonth(), 1)), t];
      case "mesant": return [util.iso(new Date(d.getFullYear(), d.getMonth() - 1, 1)), util.iso(new Date(d.getFullYear(), d.getMonth(), 0))];
      default: return ["1900-01-01", t];
    }
  }
  function prevRange([a, b]) {
    const days = Math.round((new Date(b) - new Date(a)) / 864e5) + 1;
    return [util.addDays(a, -days), util.addDays(a, -1)];
  }
  /** Un reporte cuenta en el período donde termina (su fecha «hasta»). Solo confirmados. */
  function confirmedIn(db, range, localId) {
    return db.reportes.filter((r) => r.estado === "CONFIRMADO" && r.tipo === "VENTAS" && r.hasta >= range[0] && r.hasta <= range[1] && (localId === "todos" || r.localId === localId));
  }
  function aggregate(reps) {
    const t = { ventas: 0, costo: 0, ventasConCosto: 0, margen: 0, unidades: 0, n: reps.length };
    for (const r of reps) { const x = reportTotals(r); for (const k of ["ventas", "costo", "ventasConCosto", "margen", "unidades"]) t[k] += x[k]; }
    for (const k of ["ventas", "costo", "ventasConCosto", "margen"]) t[k] = util.round2(t[k]);
    return t;
  }
  /** Serie semanal (lunes de la fecha «hasta») de un indicador. */
  function weekly(reps, metric) {
    const m = new Map();
    for (const r of reps) { const k = util.monday(r.hasta); m.set(k, (m.get(k) || 0) + reportTotals(r)[metric]); }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ week: k, v: util.round2(v) }));
  }

  /* ---------- Inventario ---------- */
  /** Conteos confirmados de un local, del más reciente al más antiguo. */
  function inventoryCounts(db, localId) {
    return db.reportes.filter((r) => r.tipo === "INVENTARIO" && r.estado === "CONFIRMADO" && r.localId === localId).sort((a, b) => b.hasta.localeCompare(a.hasta));
  }
  /** Cantidad de un producto en un conteo (null si no se contó). */
  function qtyIn(rep, productoId) {
    if (!rep) return null;
    const l = rep.lineas.find((x) => x.productoId === productoId);
    return l ? Number(l.cantidad) || 0 : null;
  }
  /** Estado de existencia: sin conteo, agotado, bajo el mínimo u ok. */
  function stockState(qty, min) {
    if (qty === null || qty === undefined) return "sin";
    if (qty < 0) return "negativo";
    if (qty <= 0) return "agotado";
    if (min && qty < min) return "bajo";
    return "ok";
  }
  /* ---------- Existencias (inventario permanente por local) ---------- */
  const MOTIVOS = ["No se vendió / se dañó", "Vencido", "Roto o derramado", "Regalado o degustación", "Otro"];
  // Cómo mueve cada documento el inventario. El conteo físico no suma ni resta: fija la cantidad.
  const SIGN = { ENTRADA: 1, VENTAS: -1, PERDIDA: -1 };
  const confirmedOf = (db, localId) => db.reportes.filter((r) => r.estado === "CONFIRMADO" && r.localId === localId);
  /**
   * Existencia de un producto en un local hasta una fecha (incluida).
   * Parte del último conteo físico que incluya el producto (si hay) y suma entradas,
   * resta ventas confirmadas (por su fecha «hasta») y pérdidas posteriores a ese conteo.
   * Los datos de un local nunca se mezclan con los de otro.
   */
  function stockAt(db, localId, productoId, upto, excludeId) {
    const docs = confirmedOf(db, localId).filter((r) => r.id !== excludeId && (!upto || r.hasta <= upto));
    const conteo = docs.filter((r) => r.tipo === "INVENTARIO" && r.lineas.some((l) => l.productoId === productoId)).sort((a, b) => b.hasta.localeCompare(a.hasta))[0];
    let q = conteo ? qtyIn(conteo, productoId) : 0, moved = false;
    for (const r of docs) {
      const s = SIGN[r.tipo]; if (!s || (conteo && r.hasta <= conteo.hasta)) continue;
      for (const l of r.lineas) if (l.productoId === productoId) { q += s * (Number(l.cantidad) || 0); moved = true; }
    }
    return { qty: util.round2(q), conteo: conteo || null, tracked: !!conteo || moved || docs.some((r) => SIGN[r.tipo] && r.lineas.some((l) => l.productoId === productoId)) };
  }
  /** Sumas de entradas, ventas y pérdidas de un local en un rango de fechas. */
  function movementSums(db, localId, range) {
    const m = new Map();
    for (const r of confirmedOf(db, localId)) {
      if (!SIGN[r.tipo] || r.hasta < range[0] || r.hasta > range[1]) continue;
      for (const l of r.lineas) {
        const o = m.get(l.productoId) || { entradas: 0, ventas: 0, perdidas: 0 };
        const k = { ENTRADA: "entradas", VENTAS: "ventas", PERDIDA: "perdidas" }[r.tipo];
        o[k] += Number(l.cantidad) || 0; m.set(l.productoId, o);
      }
    }
    return m;
  }
  /** Valor y unidades de un documento de entrada o pérdida (cantidad × costo). */
  function movTotals(rep) {
    let unidades = 0, valor = 0, sinCosto = 0;
    for (const l of rep.lineas) {
      if (!l.productoId) continue;
      const q = Number(l.cantidad) || 0; unidades += q;
      if (hasCost(l.costo)) valor += q * Number(l.costo); else if (q > 0) sinCosto++;
    }
    return { productos: rep.lineas.filter((l) => l.productoId).length, unidades, valor: util.round2(valor), sinCosto };
  }
  /** Pérdidas confirmadas en un período (y local), línea por línea. */
  function lossesIn(db, range, localId) {
    const out = [];
    for (const r of db.reportes) {
      if (r.tipo !== "PERDIDA" || r.estado !== "CONFIRMADO" || r.hasta < range[0] || r.hasta > range[1] || (localId !== "todos" && r.localId !== localId)) continue;
      for (const l of r.lineas) out.push({ r, l, q: Number(l.cantidad) || 0, v: hasCost(l.costo) ? (Number(l.cantidad) || 0) * Number(l.costo) : 0 });
    }
    return out;
  }

  /** Valor de un conteo: cantidad × costo de cada línea. */
  function inventoryTotals(rep, db) {
    let unidades = 0, valor = 0, sinCosto = 0, bajo = 0, agotado = 0;
    for (const l of rep.lineas) {
      if (!l.productoId) continue;
      const q = Number(l.cantidad) || 0, p = db.productos.find((x) => x.id === l.productoId);
      unidades += q;
      if (hasCost(l.costo)) valor += q * Number(l.costo); else if (q > 0) sinCosto++;
      const st = stockState(l.cantidad === "" ? null : q, p && p.stockMin);
      if (st === "bajo") bajo++; if (st === "agotado") agotado++;
    }
    return { productos: rep.lineas.filter((l) => l.productoId).length, unidades, valor: util.round2(valor), sinCosto, bajo, agotado };
  }

  PPX.fmt = fmt;
  PPX.util = util;
  PPX.rules = { hasCost, lineTotal, reportTotals, cuadre, overlaps, validateReport, periodRange, prevRange, confirmedIn, aggregate, weekly, inventoryCounts, qtyIn, stockState, inventoryTotals, MOTIVOS, stockAt, movementSums, movTotals, lossesIn };
})(window.PPX);

/* =============================================================
   Finanzas: reportes diarios (ingresos y egresos globales por
   local), gastos con categorías y roles de pago (Ecuador).
   ============================================================= */
(function (PPX) {
  "use strict";
  const { util } = PPX;
  const r2 = util.round2, num = (v) => (isFinite(Number(v)) ? Number(v) : 0);

  /** Categorías que vienen de fábrica. Se pueden renombrar, desactivar o agregar nuevas. */
  const CATEGORIAS = () => [
    ["arriendo", "Arriendo"], ["luz", "Luz"], ["agua", "Agua"], ["gas", "Gas"], ["internet", "Internet y teléfono"],
    ["transporte", "Transporte"], ["mantenimiento", "Mantenimiento y reparaciones"], ["limpieza", "Limpieza y suministros"],
    ["insumos", "Compras del día (insumos)"], ["impuestos", "Impuestos y permisos"], ["otros", "Otros"],
  ].map(([id, nombre]) => ({ id, nombre, tipo: "egreso", activo: true })).concat(CATEGORIAS_ING());
  const CATEGORIAS_ING = () => [
    ["ing-pan", "Ventas de panadería"], ["ing-pas", "Ventas de pastelería"], ["ing-ped", "Pedidos y encargos"],
    ["ing-beb", "Bebidas y otros productos"], ["ing-otr", "Otros ingresos"],
  ].map(([id, nombre]) => ({ id, nombre, tipo: "ingreso", activo: true }));
  const SUELDOS = { id: "sueldos", nombre: "Sueldos y beneficios", activo: true, sistema: true };
  const SIN = { id: "", nombre: "Sin detallar", activo: true, sistema: true };
  /** Valores 2026 editables en Personal → Configuración. SBU 2026: USD 482. */
  const NOMINA = () => ({ sbu: 482, iessPersonal: 9.45, iessPatronal: 12.15, fondos: 8.33, horasMes: 240 });

  const inRange = (r, range, localId) => r.hasta >= range[0] && r.hasta <= range[1] && (!localId || localId === "todos" || r.localId === localId);
  const cajaIn = (db, range, localId) => db.reportes.filter((r) => r.tipo === "CAJA" && inRange(r, range, localId));
  const gastosIn = (db, range, localId) => db.reportes.filter((r) => r.tipo === "GASTO" && inRange(r, range, localId));
  const rolesIn = (db, range, localId) => db.reportes.filter((r) => r.tipo === "ROL" && r.estado === "CONFIRMADO" && inRange(r, range, localId));
  const cajaEgresos = (r) => r2(r.lineas.reduce((a, l) => a + num(l.monto), 0));
  const rolTotals = (r) => {
    const t = { total: 0, iess: 0, desc: 0, neto: 0, patronal: 0, provisiones: 0, costo: 0, n: r.lineas.length };
    for (const l of r.lineas) { t.total += l.total; t.iess += l.iessP; t.desc += l.desc; t.neto += l.neto; t.patronal += l.patronal; t.provisiones += l.d13 + l.d14 + l.fondos + l.vac; t.costo += l.costo; }
    for (const k in t) if (k !== "n") t[k] = r2(t[k]);
    return t;
  };

  /** Todos los egresos de un período, línea por línea: de los reportes diarios, de gastos y de roles aprobados. */
  function egresos(db, range, localId) {
    const out = [];
    for (const r of cajaIn(db, range, localId)) r.lineas.forEach((l, i) => num(l.monto) && out.push({ fecha: r.hasta, localId: r.localId, categoriaId: l.categoriaId || "", monto: num(l.monto), detalle: l.detalle || "", origen: "caja", r, i, pagado: true }));
    for (const r of gastosIn(db, range, localId)) r.lineas.forEach((l, i) => out.push({ fecha: r.hasta, localId: r.localId, categoriaId: l.categoriaId || "", monto: num(l.monto), detalle: l.detalle || "", origen: "gasto", r, i, pagado: r.pagado !== false, proveedor: r.proveedor || "" }));
    for (const r of rolesIn(db, range, localId)) out.push({ fecha: r.hasta, localId: r.localId, categoriaId: "sueldos", monto: rolTotals(r).costo, detalle: `Rol de pagos ${r.periodoTxt || ""} · ${r.lineas.length} trabajador${r.lineas.length === 1 ? "" : "es"}`, origen: "rol", r, pagado: true });
    return out;
  }

  /** Resumen financiero: ingresos, egresos (caja + gastos + sueldos) y utilidad. */
  function summary(db, range, localId) {
    const cajas = cajaIn(db, range, localId), eg = egresos(db, range, localId);
    const s = { ingresos: 0, caja: 0, gastos: 0, sueldos: 0, egresos: 0, utilidad: 0, sinDetallar: 0, porPagar: 0, dias: new Set(cajas.map((r) => r.hasta)).size, reportes: cajas.length };
    for (const r of cajas) s.ingresos += num(r.ingresos);
    for (const e of eg) {
      s[e.origen === "rol" ? "sueldos" : "caja"] += e.monto; // los gastos sueltos de versiones anteriores cuentan como egresos del día
      if (!e.categoriaId) s.sinDetallar += e.monto;
      if (!e.pagado) s.porPagar += e.monto;
    }
    for (const k of ["ingresos", "caja", "gastos", "sueldos", "sinDetallar", "porPagar"]) s[k] = r2(s[k]);
    s.egresos = r2(s.caja + s.gastos + s.sueldos);
    s.utilidad = r2(s.ingresos - s.egresos);
    s.margen = s.ingresos ? s.utilidad / s.ingresos : NaN;
    return s;
  }
  /** Ingresos del período por categoría (los reportes con un solo total cuentan como «Sin detallar»). */
  function ingresosPorCategoria(db, range, localId) {
    const m = new Map();
    for (const r of cajaIn(db, range, localId)) {
      const ls = Array.isArray(r.ingLineas) && r.ingLineas.length ? r.ingLineas : [{ categoriaId: "", monto: num(r.ingresos) }];
      for (const l of ls) if (num(l.monto)) m.set(l.categoriaId || "", r2((m.get(l.categoriaId || "") || 0) + num(l.monto)));
    }
    return [...m.entries()].map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  }
  function byCategoria(lines) {
    const m = new Map();
    for (const e of lines) m.set(e.categoriaId, r2((m.get(e.categoriaId) || 0) + e.monto));
    return [...m.entries()].map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  }
  /** Series por día, semana o mes para los gráficos. */
  function series(db, range, localId, gran) {
    const key = (d) => (gran === "dia" ? d : gran === "semana" ? util.monday(d) : d.slice(0, 7) + "-01");
    const m = new Map(), B = (k) => m.get(k) || m.set(k, { key: k, ingresos: 0, egresos: 0, caja: 0, per: {} }).get(k);
    if (gran === "dia") for (let d = range[0]; d <= range[1]; d = util.addDays(d, 1)) B(d);
    for (const r of cajaIn(db, range, localId)) { const o = B(key(r.hasta)); o.ingresos += num(r.ingresos); o.per[r.localId] = (o.per[r.localId] || 0) + num(r.ingresos); }
    for (const e of egresos(db, range, localId)) { const o = B(key(e.fecha)); o.egresos += e.monto; if (e.origen === "caja") o.caja += e.monto; }
    return [...m.values()].sort((a, b) => a.key.localeCompare(b.key)).map((o) => ({ ...o, ingresos: r2(o.ingresos), egresos: r2(o.egresos), caja: r2(o.caja), utilidad: r2(o.ingresos - o.egresos) }));
  }

  /* ---------- Rol de pagos ---------- */
  const lastDay = (mes) => { const [y, m] = mes.split("-").map(Number); return util.iso(new Date(y, m, 0)); };
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  /** tramo: "M" mes completo, "Q1" del 1 al 15, "Q2" del 16 al fin de mes. */
  function periodo(mes, tramo) {
    const fin = lastDay(mes), m = MESES[Number(mes.slice(5, 7)) - 1] + " " + mes.slice(0, 4);
    if (tramo === "Q1") return { desde: mes + "-01", hasta: mes + "-15", dias: 15, txt: "1.ª quincena de " + m };
    if (tramo === "Q2") return { desde: mes + "-16", hasta: fin, dias: 15, txt: "2.ª quincena de " + m };
    return { desde: mes + "-01", hasta: fin, dias: 30, txt: m.charAt(0).toUpperCase() + m.slice(1) };
  }
  const yearsBetween = (a, b) => (a ? (new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / (365.25 * 864e5) : 0);
  /**
   * Cálculo de un trabajador en un rol.
   * Ingresos: sueldo proporcional a los días + horas extra (50 % y 100 %) + bonos.
   * Descuentos: aporte personal IESS + anticipos + otros.
   * Costo para la empresa: ingresos + aporte patronal + décimo tercero (1/12) + décimo cuarto (SBU/12)
   * + fondos de reserva (desde el año de trabajo). Cada beneficio cuenta solo si el trabajador lo recibe.
   */
  function rolLinea(e, inp, cfg, tramo, hasta) {
    const dp = tramo === "M" ? 30 : 15, base = num(e.sueldo) * (dp / 30);
    const dias = Math.min(dp, Math.max(0, inp.dias === "" || inp.dias == null ? dp : num(inp.dias)));
    const ganado = base * (dias / dp);
    const vh = num(e.sueldo) / (num(cfg.horasMes) || 240);
    const extras = vh * 1.5 * num(inp.h50) + vh * 2 * num(inp.h100);
    const total = ganado + extras + num(inp.bonos);
    const iessP = e.iess ? (total * num(cfg.iessPersonal)) / 100 : 0;
    const patronal = e.iess ? (total * num(cfg.iessPatronal)) / 100 : 0;
    const dec = e.decimos !== false, vac = 0;
    const d13 = dec ? total / 12 : 0, d14 = dec ? (num(cfg.sbu) / 12) * (dias / 30) : 0;
    const fondos = e.iess && e.fondos !== false && yearsBetween(e.ingreso, hasta) >= 1 ? (total * num(cfg.fondos)) / 100 : 0;
    const mens = dec && !!e.decimosMensual, fondosRol = e.fondosEnRol !== false;
    const desc = iessP + num(inp.anticipos) + num(inp.otros);
    const neto = total - desc + (mens ? d13 + d14 : 0) + (fondosRol ? fondos : 0);
    const R = (v) => r2(v);
    return {
      empleadoId: e.id, nombre: e.nombre, cargo: e.cargo || "", sueldo: R(num(e.sueldo)), iessAfiliado: !!e.iess, decimosMensual: mens,
      dias, h50: num(inp.h50), h100: num(inp.h100), bonos: R(num(inp.bonos)), anticipos: R(num(inp.anticipos)), otros: R(num(inp.otros)), nota: inp.nota || "",
      ganado: R(ganado), extras: R(extras), total: R(total), iessP: R(iessP), desc: R(desc), neto: R(neto),
      patronal: R(patronal), d13: R(d13), d14: R(d14), fondos: R(fondos), vac: R(vac), costo: R(total + patronal + d13 + d14 + fondos + vac),
    };
  }

  PPX.fin = { CATEGORIAS, CATEGORIAS_ING, ingresosPorCategoria, SUELDOS, SIN, NOMINA, cajaIn, gastosIn, rolesIn, cajaEgresos, rolTotals, egresos, summary, byCategoria, series, periodo, rolLinea, MESES, lastDay };
})(window.PPX);
