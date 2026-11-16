/* =============================================================
   EduPan · PPX — Hojas de finanzas del informe en Excel
   No toca la pantalla. Lo usan la sección Informes del panel y
   el envío automático por correo (Google Apps Script), para que
   el Excel sea el mismo en los dos casos.
   ============================================================= */
(function (PPX) {
  "use strict";

  const ORIGEN = { caja: "Reporte diario", gasto: "Gasto", rol: "Rol de pagos", estimado: "Sueldo estimado (sin rol)" };

  /** Encabezado de cada hoja: título, período y locales, y quién lo generó. */
  function cabecera(db, range, locs, quien) {
    const fmt = PPX.fmt;
    const desde = range[0] === "1900-01-01" ? (db.reportes.map((r) => r.desde).sort()[0] || PPX.util.today()) : range[0];
    const periodo = `Período: ${fmt.period(desde, range[1])}`;
    return (title, extra) => [[{ v: title, s: "title" }], [{ v: `${periodo} · Locales: ${locs.map((l) => l.nombre).join(", ")}${extra ? " · " + extra : ""}`, s: "sub" }], [{ v: quien, s: "sub" }], []];
  }

  /**
   * Hojas de finanzas: Resultados, Reportes diarios, Egresos y Roles de pago.
   * hojas = { finanzas, diario, gastos, roles } (true para incluirla).
   */
  function finSheets(db, range, locs, hojas, head) {
    const F = PPX.fin, round2 = PPX.util.round2;
    const H = hojas || {}, out = [], C = PPX.excel.colName, ids = locs.map((l) => l.id);
    const inLocs = (r) => ids.includes(r.localId);
    const local = (id) => db.locales.find((l) => l.id === id) || { id, nombre: id };
    const locIdx = (id) => db.locales.findIndex((l) => l.id === id);
    const catName = (id) => (id === "" || id == null ? F.SIN.nombre : F.SUELDO_CATS[id] ? F.SUELDO_CATS[id] : ((db.categorias || []).find((c) => c.id === id) || { nombre: id }).nombre);

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
      add("sue", "(−) Sueldos pagados (roles, adelantos y aportes IESS)", d.map((x) => x.sueldos), "money");
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
      for (const e of eg) rows.push([{ v: e.fecha, s: "date" }, local(e.localId).nombre, catName(e.categoriaId), ORIGEN[e.origen] || e.origen, e.origen === "caja" ? e.detalle || (e.r && e.r.obs) || "" : e.detalle || "", { v: e.monto, s: "money" }]);
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

  /** Cifras del mes para el cuerpo del correo: cada local y el total. */
  function resumenMes(db, range) {
    const F = PPX.fin, round2 = PPX.util.round2;
    const locs = db.locales.map((l) => Object.assign({ id: l.id, nombre: l.nombre }, F.summary(db, range, l.id)));
    const tot = { nombre: "Total EduPan" };
    ["ingresos", "caja", "sueldos", "egresos", "utilidad", "dias"].forEach((k) => { tot[k] = round2(locs.reduce((a, x) => a + (x[k] || 0), 0)); });
    return { locales: locs, total: tot };
  }

  PPX.informe = { cabecera, finSheets, resumenMes, HOJAS_FIN: { finanzas: true, diario: true, gastos: true, roles: true } };
})(window.PPX = window.PPX || {});
