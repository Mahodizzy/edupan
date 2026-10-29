/* =============================================================
   EduPan · PPX — Generador de Excel (.xlsx)
   Escribe un libro de Excel real sin librerías externas: arma
   los XML de Office Open XML y los empaqueta en un ZIP.
   Funciona sin internet.

   Uso:
     const bytes = PPX.excel.build([{ name, cols, rows, freeze, filter, merges }]);
     PPX.excel.download(bytes, "informe.xlsx");

   Cada celda puede ser: null, texto, número o un objeto
   { v: valor, s: estilo, f: fórmula }. Estilos disponibles en STYLES.
   ============================================================= */
(function (PPX) {
  "use strict";

  /* ---------- ZIP (sin compresión) ---------- */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const enc = new TextEncoder(), now = new Date();
    const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
    const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
    const parts = [], central = [];
    let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true);
      c.setUint32(38, 0, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    const all = parts.concat(central, [new Uint8Array(end.buffer)]);
    const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
    let p = 0; for (const a of all) { out.set(a, p); p += a.length; }
    return out;
  }

  /* ---------- Estilos ---------- */
  // Índice de cellXfs en styles.xml para cada nombre de estilo
  const STYLES = { def: 0, header: 1, money: 2, pct: 3, int: 4, date: 5, title: 6, sub: 7, totalLabel: 8, totalMoney: 9, totalInt: 10, totalPct: 11, bold: 12, headerR: 13, moneyBad: 14, moneyGood: 15, section: 16, num: 17, totalNum: 18 };
  const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="4"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/><numFmt numFmtId="165" formatCode="0.0%"/><numFmt numFmtId="166" formatCode="dd/mm/yyyy"/><numFmt numFmtId="167" formatCode="#,##0.##"/></numFmts>
<fonts count="8">
<font><sz val="11"/><color rgb="FF2A221C"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF2A221C"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="18"/><color rgb="FF5A2A12"/><name val="Calibri"/><family val="2"/></font>
<font><i/><sz val="10"/><color rgb="FF776C62"/><name val="Calibri"/><family val="2"/></font>
<font><sz val="11"/><color rgb="FFC0402B"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF18805A"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="12"/><color rgb="FFA9711F"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF3A1C0C"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF4E8D2"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="3">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FFE8DCC3"/></bottom><diagonal/></border>
<border><left/><right/><top style="thin"><color rgb="FFA9711F"/></top><bottom style="thin"><color rgb="FFA9711F"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="19">
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="1" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="164" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="3" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="165" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="right" vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="5" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>
<xf numFmtId="164" fontId="6" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>
<xf numFmtId="0" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="167" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  /* ---------- Hojas ---------- */
  const xmlEsc = (s) => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const colName = (n) => { let s = ""; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  /** Fecha ISO (AAAA-MM-DD) a número de serie de Excel. */
  const serial = (iso) => { const [y, m, d] = iso.split("-").map(Number); return (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 864e5; };

  function cellXml(ref, c) {
    if (c === null || c === undefined || c === "") return "";
    const o = typeof c === "object" ? c : { v: c };
    const s = STYLES[o.s || (typeof o.v === "number" ? "num" : "def")] || 0;
    const sAttr = s ? ` s="${s}"` : "";
    if (o.f) return `<c r="${ref}"${sAttr}><f>${xmlEsc(o.f)}</f>${typeof o.v === "number" && isFinite(o.v) ? `<v>${o.v}</v>` : ""}</c>`;
    if (o.s === "date" && typeof o.v === "string") return `<c r="${ref}"${sAttr}><v>${serial(o.v)}</v></c>`;
    if (typeof o.v === "number") return isFinite(o.v) ? `<c r="${ref}"${sAttr}><v>${o.v}</v></c>` : "";
    if (o.v === null || o.v === undefined || o.v === "") return s ? `<c r="${ref}"${sAttr}/>` : "";
    return `<c r="${ref}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(o.v)}</t></is></c>`;
  }
  function sheetXml(sh) {
    const rows = sh.rows.map((row, i) => {
      const r = i + 1, ht = sh.heights && sh.heights[i] ? ` ht="${sh.heights[i]}" customHeight="1"` : "";
      return `<row r="${r}"${ht}>${(row || []).map((c, j) => cellXml(colName(j) + r, c)).join("")}</row>`;
    }).join("");
    const cols = sh.cols && sh.cols.length ? `<cols>${sh.cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>` : "";
    let pane = "";
    if (sh.freeze) {
      const row = Number(sh.freeze.replace(/[A-Z]+/, "")) - 1;
      pane = `<pane ySplit="${row}" topLeftCell="${sh.freeze}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="${sh.freeze}" sqref="${sh.freeze}"/>`;
    }
    const merges = sh.merges && sh.merges.length ? `<mergeCells count="${sh.merges.length}">${sh.merges.map((m) => `<mergeCell ref="${m}"/>`).join("")}</mergeCells>` : "";
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0" showGridLines="0"${sh.freeze ? "" : ' tabSelected="0"'}>${pane}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="16"/>${cols}<sheetData>${rows}</sheetData>${sh.filter ? `<autoFilter ref="${sh.filter}"/>` : ""}${merges}
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
  }

  /** Arma el libro y devuelve los bytes del archivo .xlsx. */
  function build(sheets, meta = {}) {
    const safe = (n, i) => (String(n || `Hoja ${i + 1}`).replace(/[\\/?*[\]:]/g, " ").slice(0, 31));
    const names = sheets.map((s, i) => safe(s.name, i));
    const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const files = [
      { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>` },
      { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
      { name: "docProps/core.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEsc(meta.title || "Informe")}</dc:title><dc:creator>${xmlEsc(meta.author || "EduPan PPX")}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>` },
      { name: "docProps/app.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>EduPan PPX</Application></Properties>` },
      { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${names.map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>${sheets.some((s) => s.filter) ? `<definedNames>${sheets.map((s, i) => (s.filter ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xmlEsc(names[i]).replace(/'/g, "''")}'!${s.filter.replace(/([A-Z]+)(\d+)/g, "$$$1$$$2")}</definedName>` : "")).join("")}</definedNames>` : ""}<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>` },
      { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: "xl/styles.xml", data: STYLES_XML },
      ...sheets.map((sh, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(sh) })),
    ];
    return zip(files);
  }

  /** Descarga los bytes como archivo. */
  function download(bytes, filename) {
    const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- Lectura de .xlsx (para importar productos) ---------- */
  /** Descomprime los archivos de un .xlsx (zip). Usa DecompressionStream del navegador. */
  async function unzip(buf, wanted) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder();
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error("El archivo no es un Excel (.xlsx) válido.");
    const n = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true);
    const out = {};
    for (let k = 0; k < n; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
      p += 46 + nl + el + cl;
      if (!wanted(name)) continue;
      const start = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true), data = u8.slice(start, start + csize);
      if (method === 0) out[name] = dec.decode(data);
      else if (method === 8) {
        if (typeof DecompressionStream === "undefined") throw new Error("Este navegador no puede leer archivos Excel. Usa Chrome, Edge, Firefox o Safari actualizados.");
        out[name] = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
      } else throw new Error("Formato de compresión no soportado en el Excel.");
    }
    return out;
  }
  /** Lee la primera hoja de un .xlsx y devuelve sus filas como listas de valores (texto o número). */
  async function read(buf) {
    const f = await unzip(buf, (n) => /^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/[^/]+\.xml)$/.test(n));
    const xml = (t) => new DOMParser().parseFromString(t, "application/xml");
    const byTag = (doc, tag) => Array.from(doc.getElementsByTagNameNS("*", tag));
    const shared = f["xl/sharedStrings.xml"] ? byTag(xml(f["xl/sharedStrings.xml"]), "si").map((si) => byTag(si, "t").map((t) => t.textContent).join("")) : [];
    let sheet = null;
    if (f["xl/workbook.xml"] && f["xl/_rels/workbook.xml.rels"]) {
      const first = byTag(xml(f["xl/workbook.xml"]), "sheet")[0];
      const rid = first && (first.getAttribute("r:id") || first.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"));
      const rel = byTag(xml(f["xl/_rels/workbook.xml.rels"]), "Relationship").find((r) => r.getAttribute("Id") === rid);
      if (rel) { const t = rel.getAttribute("Target").replace(/^\/?(xl\/)?/, ""); sheet = f["xl/" + t]; }
    }
    if (!sheet) sheet = f[Object.keys(f).filter((k) => k.startsWith("xl/worksheets/")).sort()[0]];
    if (!sheet) throw new Error("No se encontró ninguna hoja en el Excel.");
    const colIdx = (ref) => { let c = 0; for (const ch of ref.replace(/\d+/g, "")) c = c * 26 + ch.charCodeAt(0) - 64; return c - 1; };
    return byTag(xml(sheet), "row").map((row) => {
      const out = [];
      for (const c of byTag(row, "c")) {
        const t = c.getAttribute("t"), v = byTag(c, "v")[0], i = colIdx(c.getAttribute("r") || "A1");
        let val = null;
        if (t === "s") val = v ? shared[Number(v.textContent)] : null;
        else if (t === "inlineStr") val = byTag(c, "t").map((x) => x.textContent).join("");
        else if (t === "str" || t === "e") val = v ? v.textContent : null;
        else if (t === "b") val = v ? v.textContent === "1" : null;
        else if (v) { const n = Number(v.textContent); val = isNaN(n) ? v.textContent : n; }
        out[i] = val;
      }
      return out;
    });
  }

  PPX.excel = { build, download, colName, STYLES, read };
})(window.PPX = window.PPX || {});
