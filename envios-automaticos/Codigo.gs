/* =============================================================
   EduPan · PPX — Envíos automáticos por correo (Google Apps Script)

   Qué hace, sin que nadie tenga que abrir el panel:
     · Cada lunes por la mañana: envía el RESPALDO completo (.json)
       de la base de datos. Se restaura en Ajustes → Restaurar.
     · Cada día 1 por la mañana: envía el INFORME del mes anterior,
       con el resumen en el correo y el mismo Excel de la sección
       Informes (Resultados, Reportes diarios, Egresos y Roles).

   Cómo se instala: sigue la sección «Envíos automáticos por correo»
   de GUIA-PASO-A-PASO.html. Debe hacerse con la cuenta de Google
   que creó el proyecto de Firebase (la dueña del proyecto).

   Este script SOLO LEE los datos. Lo único que escribe es una línea
   en el registro de actividad («Respaldo enviado por correo» o
   «Informe mensual enviado por correo»), que el panel muestra.
   ============================================================= */

// ======================= CONFIGURACIÓN =======================
// Cambia solo estos valores.
const CONFIG = {
  // Dirección de tu página en Netlify, sin "/" al final.
  sitio: "https://TU-SITIO.netlify.app",

  // ID del proyecto de Firebase (el mismo de assets/js/config.js).
  proyecto: "edupan-e58ca",

  // Quién recibe el respaldo (tiene TODOS los datos: solo administradores).
  respaldoPara: ["elypiccinini298@gmail.com", "marlondominguez1012@gmail.com"],

  // Quién recibe el informe mensual. Puedes agregar el correo del jefe.
  informePara: ["elypiccinini298@gmail.com", "marlondominguez1012@gmail.com"],

  // Día y hora de los envíos (hora de Ecuador).
  respaldoDia: "LUNES",   // LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO o DOMINGO
  respaldoHora: 6,        // 0 a 23
  informeHora: 7,         // el día 1 de cada mes, a esta hora
};
// =============================================================


/* ---------- 1. Instalar (se ejecuta UNA vez) ---------- */

/** Programa los dos envíos. Si lo vuelves a ejecutar, reemplaza los anteriores. */
function instalar() {
  revisarConfig_();
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  const DIAS = { LUNES: "MONDAY", MARTES: "TUESDAY", MIERCOLES: "WEDNESDAY", JUEVES: "THURSDAY", VIERNES: "FRIDAY", SABADO: "SATURDAY", DOMINGO: "SUNDAY" };
  const dia = DIAS[String(CONFIG.respaldoDia).toUpperCase().replace("É", "E").replace("Á", "A")];
  if (!dia) throw new Error("CONFIG.respaldoDia no es válido: " + CONFIG.respaldoDia);
  ScriptApp.newTrigger("enviarRespaldo").timeBased().onWeekDay(ScriptApp.WeekDay[dia]).atHour(CONFIG.respaldoHora).create();
  ScriptApp.newTrigger("enviarInformeMensual").timeBased().onMonthDay(1).atHour(CONFIG.informeHora).create();
  Logger.log("Listo: respaldo cada %s a las %s:00 e informe el día 1 a las %s:00.", CONFIG.respaldoDia, CONFIG.respaldoHora, CONFIG.informeHora);
}

/** Envía ahora mismo el respaldo y el informe del mes anterior, para probar. */
function probarAhora() {
  enviarRespaldo();
  enviarInformeMensual();
}

/** Quita los envíos programados. */
function desinstalar() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  Logger.log("Envíos automáticos desactivados.");
}


/* ---------- 2. Envíos ---------- */

function enviarRespaldo() {
  conAviso_("el respaldo semanal", CONFIG.respaldoPara, () => {
    revisarConfig_();
    const db = leerBase_();
    const hoy = hoy_();
    const nombre = "respaldo-edupan-" + hoy + ".json";
    const json = JSON.stringify({ app: "ppx-edupan", exportado: new Date().toISOString(), automatico: true, datos: db }, null, 2);
    let adjunto = Utilities.newBlob(json, "application/json", nombre);
    if (adjunto.getBytes().length > 20 * 1024 * 1024) adjunto = Utilities.zip([adjunto], nombre + ".zip"); // Gmail acepta hasta 25 MB
    const n = db.reportes.length;
    const cuerpo = marco_("Respaldo semanal de EduPan",
      `<p style="margin:0 0 12px">Adjunto va el respaldo completo de la base de datos del <b>${fechaTxt_(hoy)}</b>: ` +
      `${db.productos.length} productos, ${n} reportes, ${db.empleados.length} trabajadores y ${db.pagos.length} pagos programados.</p>` +
      `<p style="margin:0 0 12px">Guárdalo en Google Drive o en tu computadora. Si algún día hiciera falta, se recupera en el panel: <b>Ajustes → Restaurar un respaldo</b>.</p>` +
      `<p style="margin:0;color:#776C62;font-size:13px">No hace falta hacer nada más: los datos siguen en la nube. Este archivo es un seguro extra.</p>`);
    MailApp.sendEmail({ to: CONFIG.respaldoPara.join(","), subject: `EduPan · Respaldo del ${fechaTxt_(hoy)}`, htmlBody: cuerpo, attachments: [adjunto], name: "EduPan · Envíos automáticos" });
    registrar_("Respaldo enviado por correo", `${nombre} · ${n} reportes · a ${CONFIG.respaldoPara.join(", ")}`);
  });
}

function enviarInformeMensual() {
  conAviso_("el informe mensual", CONFIG.respaldoPara, () => {
    revisarConfig_();
    const db = leerBase_();
    cargarPanel_();
    const PPX = globalThis.PPX, F = PPX.fin;
    // Mes anterior al de hoy
    const hoy = hoy_(), y = Number(hoy.slice(0, 4)), m = Number(hoy.slice(5, 7));
    const mes = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
    const range = [mes + "-01", F.lastDay(mes)];
    const pm = Number(mes.slice(5, 7)), mesAnt = pm === 1 ? `${Number(mes.slice(0, 4)) - 1}-12` : `${mes.slice(0, 4)}-${String(pm - 1).padStart(2, "0")}`;
    const rangeAnt = [mesAnt + "-01", F.lastDay(mesAnt)];
    const nombreMes = MESES_[pm - 1] + " " + mes.slice(0, 4);

    // Excel: las mismas hojas de finanzas de la sección Informes
    const locs = db.locales;
    const quien = `Generado automáticamente el ${fechaTxt_(hoy)} a las ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm")}`;
    const sheets = PPX.informe.finSheets(db, range, locs, PPX.informe.HOJAS_FIN, PPX.informe.cabecera(db, range, locs, quien));
    const bytes = PPX.excel.build(sheets, { title: "EduPan · Informe de " + nombreMes, author: "Envío automático" });
    const nombre = `EduPan-informe-${range[0]}-al-${range[1]}.xlsx`;
    const excel = Utilities.newBlob(Array.from(bytes, (b) => (b > 127 ? b - 256 : b)), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nombre);

    // Cuerpo del correo: resumen por local y comparación con el mes anterior
    const R = PPX.informe.resumenMes(db, range), A = PPX.informe.resumenMes(db, rangeAnt);
    const diasMes = Number(range[1].slice(8, 10));
    const filas = [["Ingresos", "ingresos"], ["Egresos del día", "caja"], ["Sueldos y aportes", "sueldos"], ["Total egresos", "egresos"], ["Utilidad", "utilidad"]];
    const th = (t, r) => `<th style="padding:8px 10px;text-align:${r ? "right" : "left"};font-size:12px;color:#776C62;border-bottom:1px solid #E8DFD3">${t}</th>`;
    const td = (t, r, extra) => `<td style="padding:8px 10px;text-align:${r ? "right" : "left"};border-bottom:1px solid #F1EBE3;white-space:nowrap;${extra || ""}">${t}</td>`;
    const cols = R.locales.concat([R.total]);
    const tabla = `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;font-size:14px">
      <tr>${th("")}${cols.map((c) => th(esc_(c.nombre), true)).join("")}</tr>
      ${filas.map(([t, k]) => `<tr>${td(`<b>${t}</b>`)}${cols.map((c, i) => td(dinero_(c[k]), true, (k === "utilidad" ? `font-weight:800;color:${c[k] < 0 ? "#B3261E" : "#1E7A4C"};` : "") + (i === cols.length - 1 ? "background:#FBF7F1;" : ""))).join("")}</tr>`).join("")}
      <tr>${td("<b>Margen</b>")}${cols.map((c, i) => td(c.ingresos ? pct_(c.utilidad / c.ingresos) : "—", true, i === cols.length - 1 ? "background:#FBF7F1;" : "")).join("")}</tr>
      <tr>${td("<b>Días reportados</b>")}${R.locales.map((c) => td(`${c.dias} de ${diasMes}`, true, c.dias < diasMes ? "color:#B26A00;" : "")).join("")}${td("", true, "background:#FBF7F1;")}</tr>
    </table>`;
    const varia = (k) => { const a = A.total[k], b = R.total[k]; if (!a) return ""; const v = (b - a) / Math.abs(a); return ` (${v >= 0 ? "+" : "−"}${pct_(Math.abs(v))} frente a ${MESES_[Number(mesAnt.slice(5, 7)) - 1]})`; };
    const faltan = R.locales.filter((c) => c.dias < diasMes);
    const cuerpo = marco_(`Informe de ${nombreMes}`,
      `<p style="margin:0 0 6px;font-size:15px">Ingresos del mes: <b>${dinero_(R.total.ingresos)}</b>${varia("ingresos")}</p>` +
      `<p style="margin:0 0 16px;font-size:15px">Utilidad: <b style="color:${R.total.utilidad < 0 ? "#B3261E" : "#1E7A4C"}">${dinero_(R.total.utilidad)}</b>${varia("utilidad")}</p>` +
      `<div style="overflow-x:auto">${tabla}</div>` +
      (faltan.length ? `<p style="margin:14px 0 0;padding:10px 12px;background:#FFF4E0;border-radius:8px;font-size:13px">Faltan reportes diarios: ${faltan.map((c) => `<b>${esc_(c.nombre)}</b> (${diasMes - c.dias} día${diasMes - c.dias === 1 ? "" : "s"})`).join(", ")}. Si se registran después, el informe del panel se actualiza solo.</p>` : "") +
      `<p style="margin:16px 0 0;color:#776C62;font-size:13px">Adjunto va el Excel con el estado de resultados, los reportes diarios, los egresos y los roles de pago del mes. Utilidad = ingresos − egresos de los reportes diarios − sueldos pagados.</p>`);
    MailApp.sendEmail({ to: CONFIG.informePara.join(","), subject: `EduPan · Informe de ${nombreMes}`, htmlBody: cuerpo, attachments: [excel], name: "EduPan · Envíos automáticos" });
    registrar_("Informe mensual enviado por correo", `${nombre} · a ${CONFIG.informePara.join(", ")}`);
  });
}


/* ---------- 3. Lectura de Firestore (solo lectura) ---------- */

const API_ = () => `https://firestore.googleapis.com/v1/projects/${CONFIG.proyecto}/databases/(default)/documents`;
let usarProyecto_ = true; // se cobra la cuota al proyecto de Firebase (si se puede)

function pedir_(url, opciones) {
  const base = Object.assign({ muteHttpExceptions: true, headers: {} }, opciones || {});
  const intentar = (conProyecto) => {
    const h = Object.assign({ Authorization: "Bearer " + ScriptApp.getOAuthToken() }, base.headers);
    if (conProyecto) h["x-goog-user-project"] = CONFIG.proyecto;
    return UrlFetchApp.fetch(url, Object.assign({}, base, { headers: h }));
  };
  let res = intentar(usarProyecto_);
  if (usarProyecto_ && res.getResponseCode() === 403 && /USER_PROJECT_DENIED|serviceusage/i.test(res.getContentText())) { usarProyecto_ = false; res = intentar(false); }
  const code = res.getResponseCode();
  if (code === 404) return null;
  if (code >= 300) {
    let msg = res.getContentText();
    try { msg = JSON.parse(msg).error.message; } catch (e) {}
    if (code === 403) msg += " — Esta cuenta de Google no tiene acceso al proyecto de Firebase «" + CONFIG.proyecto + "». Instala el script con la cuenta que creó el proyecto.";
    throw new Error("Firestore respondió " + code + ": " + msg);
  }
  return JSON.parse(res.getContentText() || "{}");
}

/** Convierte el formato de Firestore a datos normales de JavaScript. */
function valor_(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor_);
  if ("mapValue" in v) return campos_(v.mapValue.fields);
  if ("referenceValue" in v) return v.referenceValue;
  if ("geoPointValue" in v) return v.geoPointValue;
  return null;
}
function campos_(fields) { const o = {}; Object.keys(fields || {}).forEach((k) => { o[k] = valor_(fields[k]); }); return o; }

function leerColeccion_(nombre) {
  const out = [];
  let token = "";
  do {
    const r = pedir_(`${API_()}/${nombre}?pageSize=300${token ? "&pageToken=" + encodeURIComponent(token) : ""}`) || {};
    (r.documents || []).forEach((d) => out.push(campos_(d.fields)));
    token = r.nextPageToken || "";
  } while (token);
  return out;
}

/** Toda la base, con la misma forma que el respaldo que se descarga en Ajustes. */
function leerBase_() {
  const cat = pedir_(`${API_()}/ppx/catalogo`);
  if (!cat) throw new Error("No se encontró ppx/catalogo en el proyecto «" + CONFIG.proyecto + "». ¿Es el ID correcto?");
  const db = campos_(cat.fields);
  ["productos", "locales", "categorias", "empleados", "fijos", "pagos", "adelantos"].forEach((k) => { if (!Array.isArray(db[k])) db[k] = []; });
  db.reportes = leerColeccion_("reportes");
  db.usuarios = [];
  db.auditoria = [];
  return db;
}

/** Deja constancia en el registro de actividad del panel. */
function registrar_(accion, detalle) {
  const id = "auto" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const s = (x) => ({ stringValue: String(x) });
  pedir_(`${API_()}/auditoria?documentId=${id}`, {
    method: "post", contentType: "application/json",
    payload: JSON.stringify({ fields: { id: s(id), fecha: s(new Date().toISOString()), usuario: s("Envío automático"), accion: s(accion), detalle: s(detalle) } }),
  });
}


/* ---------- 4. Cálculos: los mismos archivos del panel ---------- */

var window = globalThis;

/** Carga core.js, excel.js e informe.js desde tu sitio para calcular igual que el panel. */
function cargarPanel_() {
  if (globalThis.PPX && globalThis.PPX.informe) return;
  if (typeof TextEncoder === "undefined") {
    globalThis.TextEncoder = function () {};
    globalThis.TextEncoder.prototype.encode = (s) => Uint8Array.from(Utilities.newBlob(String(s)).getBytes(), (b) => b & 255);
  }
  ["core.js", "excel.js", "informe.js"].forEach((f) => {
    const url = `${CONFIG.sitio}/assets/js/${f}?v=${Date.now()}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    const txt = res.getContentText();
    if (res.getResponseCode() !== 200 || /^\s*</.test(txt)) throw new Error(`No se encontró el archivo assets/js/${f} en ${CONFIG.sitio}. Revisa que CONFIG.sitio sea la dirección de tu página y que hayas subido ese archivo a GitHub.`);
    (0, eval)(txt);
  });
  if (!globalThis.PPX || !globalThis.PPX.informe) throw new Error("Los archivos del panel no cargaron bien. Revisa CONFIG.sitio.");
}


/* ---------- 5. Utilidades ---------- */

const MESES_ = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function revisarConfig_() {
  if (!/^https:\/\/[^/]+[^/]$/.test(CONFIG.sitio) || CONFIG.sitio.indexOf("TU-SITIO") >= 0) throw new Error("Escribe en CONFIG.sitio la dirección de tu página en Netlify, por ejemplo https://edupan.netlify.app (sin / al final).");
  if (!CONFIG.respaldoPara.length || !CONFIG.informePara.length) throw new Error("Falta al menos un correo en CONFIG.respaldoPara o CONFIG.informePara.");
}
function hoy_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"); }
function fechaTxt_(iso) { return `${Number(iso.slice(8, 10))} de ${MESES_[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`; }
function dinero_(n) {
  n = Math.round((Number(n) || 0) * 100) / 100;
  const s = Math.abs(n).toFixed(2).split("."), miles = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "−" : "") + "$" + miles + "," + s[1];
}
function pct_(x) { return (Math.round(x * 1000) / 10).toFixed(1).replace(".", ",") + " %"; }
function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function marco_(titulo, html) {
  return `<div style="background:#F6F1EA;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#17120E">
    <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:14px;padding:24px;border:1px solid #EDE4D8">
      <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B07A2A;margin-bottom:6px">EduPan Panaderías</div>
      <h1 style="margin:0 0 16px;font-size:22px">${esc_(titulo)}</h1>
      ${html}
    </div>
    <p style="max-width:640px;margin:14px auto 0;text-align:center;font-size:12px;color:#8A7E72">Envío automático del panel de EduPan · Diseñado y desarrollado por Maho Studio Dev</p>
  </div>`;
}

/** Si algo falla, avisa por correo con el motivo, para que no pase desapercibido. */
function conAviso_(que, para, fn) {
  try { fn(); }
  catch (e) {
    try {
      MailApp.sendEmail({ to: para.join(","), subject: `EduPan · No se pudo enviar ${que}`, name: "EduPan · Envíos automáticos",
        htmlBody: marco_(`No se pudo enviar ${que}`, `<p>El envío automático falló con este mensaje:</p><p style="padding:10px 12px;background:#FCEBEA;border-radius:8px;font-family:monospace;font-size:13px">${esc_(e.message)}</p><p style="color:#776C62;font-size:13px">Los datos del panel no se tocaron. Revisa la sección «Envíos automáticos por correo» de la guía, o descarga el respaldo a mano en Ajustes.</p>`) });
    } catch (x) {}
    throw e;
  }
}
