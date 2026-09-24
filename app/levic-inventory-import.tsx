"use client";

import { Check, FileText, Upload } from "lucide-react";
import { useState } from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "./levic-inventory-import.css";

type InvoiceItem = {
  selected: boolean;
  itemCode: string;
  name: string;
  lot: string;
  expiryDate: string;
  productCode: string;
  stock: string;
  unitCode: string;
  unitName: string;
  retailPrice: string;
  discountPercent: string;
  discountPo: string;
  discountSo: string;
  discountPcc: string;
  discountFair: string;
  netPrice: string;
  lineAmount: string;
  dose: string;
  presentation: string;
  brand: string;
  salePrice: string;
  sourceFile: string;
};

type PdfText = { str?: string; transform?: number[]; width?: number };
type PositionedText = { text: string; x: number; y: number };

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const numberText = (value: string) => value.replace(/[^0-9.-]/g, "");

function textsBetween(items: PositionedText[], y: number, from: number, to: number) {
  return clean(items.filter((i) => Math.abs(i.y - y) <= 4 && i.x >= from && i.x < to).sort((a, b) => a.x - b.x).map((i) => i.text).join(" "));
}

function inferProduct(description: string) {
  const dose = description.match(/\b\d+(?:\.\d+)?\s*(?:MG|MCG|G|ML|%)\b(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:MG|MCG|G|ML))*/i)?.[0] || "";
  const presentation = description.match(/\b\d+\s*(?:CAP|CAPS|TABLETAS?|TABS?|AMP|AMPOLLETAS?|BOL|BOLSAS?|SOBRES?|CMA|TUBO|FRASCO)\b/i)?.[0] || "";
  return { dose, presentation };
}

function parseLevicPage(rawItems: PdfText[], sourceFile: string): InvoiceItem[] {
  const items: PositionedText[] = rawItems
    .filter((item) => item.str && item.transform?.length)
    .map((item) => ({ text: clean(item.str || ""), x: item.transform?.[4] || 0, y: item.transform?.[5] || 0 }))
    .filter((item) => item.text);
  const codeRows = items.filter((item) => item.x < 44 && /^[A-Z]{2,}[A-Z0-9-]*\d+[A-Z0-9-]*$/.test(item.text));
  return codeRows.map((codeItem) => {
    const code = codeItem.text;
    const y = codeItem.y;
    const description = textsBetween(items, y, 44, 190);
    const lotMarker = items.find((item) => item.x < 44 && item.text.replace(/^\*/, "") === code && item.text.startsWith("*"));
    const lotText = lotMarker ? textsBetween(items, lotMarker.y, 44, 190) : "";
    const [lot = "", expiryDate = ""] = lotText.split("/").map(clean);
    const productCode = textsBetween(items, y, 190, 250);
    const quantity = numberText(textsBetween(items, y, 250, 280));
    const unitCode = textsBetween(items, y, 280, 303);
    const unitName = textsBetween(items, y, 303, 330);
    const retailPrice = numberText(textsBetween(items, y, 330, 380));
    const discountPercent = numberText(textsBetween(items, y, 380, 415));
    const discountPo = numberText(textsBetween(items, y, 415, 438));
    const discountSo = numberText(textsBetween(items, y, 438, 458));
    const discountPcc = numberText(textsBetween(items, y, 458, 480));
    const discountFair = numberText(textsBetween(items, y, 480, 500));
    const netPrice = numberText(textsBetween(items, y, 500, 545));
    const lineAmount = numberText(textsBetween(items, y, 545, 610));
    const inferred = inferProduct(description);
    return {
      selected: Boolean(code && description && retailPrice), itemCode: code, name: description,
      lot, expiryDate, productCode, stock: quantity || "0", unitCode, unitName,
      retailPrice, discountPercent, discountPo, discountSo, discountPcc, discountFair,
      netPrice, lineAmount, dose: inferred.dose, presentation: inferred.presentation || unitName,
      brand: "LEVIC", salePrice: retailPrice, sourceFile,
    };
  }).filter((item) => item.name);
}

const normalizedHeader = (value: string) => clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9%]+/g, "");
const aliases: Record<string, keyof InvoiceItem> = {
  clave: "itemCode", codigo: "itemCode", descripcion: "name", lote: "lot",
  fechacaducidad: "expiryDate", caducidad: "expiryDate", cveprod: "productCode",
  claveproducto: "productCode", cant: "stock", cantidad: "stock", cveum: "unitCode",
  um: "unitName", preciopublico: "retailPrice", precioalpublico: "retailPrice",
  "%desc": "discountPercent", desc1: "discountPercent", descpo: "discountPo",
  descso: "discountSo", descco: "discountSo", descpcc: "discountPcc",
  descferia: "discountFair", precioneto: "netPrice", importe: "lineAmount",
};

function completeItem(partial: Partial<InvoiceItem>, sourceFile: string): InvoiceItem {
  const name = clean(partial.name || "");
  const inferred = inferProduct(name);
  const retailPrice = String(partial.retailPrice || "");
  return {
    selected: Boolean(partial.itemCode && name && retailPrice), itemCode: String(partial.itemCode || ""),
    name, lot: String(partial.lot || ""), expiryDate: String(partial.expiryDate || ""),
    productCode: String(partial.productCode || ""), stock: String(partial.stock || "0"),
    unitCode: String(partial.unitCode || ""), unitName: String(partial.unitName || ""),
    retailPrice, discountPercent: String(partial.discountPercent || "0"),
    discountPo: String(partial.discountPo || "0"), discountSo: String(partial.discountSo || "0"),
    discountPcc: String(partial.discountPcc || "0"), discountFair: String(partial.discountFair || "0"),
    netPrice: String(partial.netPrice || ""), lineAmount: String(partial.lineAmount || ""),
    dose: inferred.dose, presentation: inferred.presentation || String(partial.unitName || ""),
    brand: "Importado", salePrice: retailPrice, sourceFile,
  };
}

function parseDelimited(text: string, sourceFile: string): InvoiceItem[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((header) => aliases[normalizedHeader(header)]);
  if (!headers.includes("itemCode") || !headers.includes("name")) return [];
  return lines.slice(1).map((line) => {
    const partial: Partial<InvoiceItem> = {};
    line.split(delimiter).forEach((value, index) => { const field = headers[index]; if (field) Object.assign(partial, { [field]: clean(value.replace(/^"|"$/g, "")) }); });
    return completeItem(partial, sourceFile);
  }).filter((item) => item.itemCode && item.name);
}

function parseLevicText(text: string, sourceFile: string): InvoiceItem[] {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
  const result: InvoiceItem[] = [];
  const product = /^([A-Z]{2,}[A-Z0-9-]*\d+)\s+(.+?)\s+(\d{8})\s+(\d+)\s+([A-Z0-9]+)\s+([A-Z]+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/i;
  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(product);
    if (!match) continue;
    const lotLine = lines.slice(index + 1, index + 4).find((line) => line.startsWith(`*${match[1]}`));
    const lotMatch = lotLine?.match(/^\*\S+\s+([^/]+)\s*\/\s*(\d{2}-\d{2}-\d{4})/);
    result.push(completeItem({ itemCode: match[1], name: match[2], productCode: match[3], stock: match[4], unitCode: match[5], unitName: match[6], retailPrice: match[7], discountPercent: match[8], discountPo: match[9], discountSo: match[10], discountPcc: match[11], discountFair: match[12], netPrice: match[13], lineAmount: match[14], lot: lotMatch?.[1]?.trim() || "", expiryDate: lotMatch?.[2] || "" }, sourceFile));
  }
  return result;
}

function positionedText(rawItems: PdfText[]) {
  const items = rawItems.filter((item) => item.str && item.transform?.length).map((item) => ({ text: clean(item.str || ""), x: item.transform?.[4] || 0, y: item.transform?.[5] || 0 })).filter((item) => item.text);
  const lines = new Map<number, PositionedText[]>();
  for (const item of items) { const key = Math.round(item.y / 3) * 3; lines.set(key, [...(lines.get(key) || []), item]); }
  return [...lines.entries()].sort((a, b) => b[0] - a[0]).map(([, row]) => row.sort((a, b) => a.x - b.x).map((item) => item.text).join(" ")).join("\n");
}

export default function LevicInventoryImport({ reload }: { reload: () => Promise<void> }) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState("");

  const readFile = async (file: File) => {
    setFilename(file.name);
    setStatus("Leyendo columnas y renglones del documento…");
    setItems([]);
    try {
      const parsed: InvoiceItem[] = [];
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        let fallbackText = "";
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          parsed.push(...parseLevicPage(content.items as PdfText[], file.name));
          fallbackText += positionedText(content.items as PdfText[]) + "\n";
        }
        if (!parsed.length) parsed.push(...parseLevicText(fallbackText, file.name));
      } else if (lower.endsWith(".docx")) {
        const mammoth = await import("mammoth/mammoth.browser");
        const text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
        parsed.push(...parseDelimited(text, file.name), ...parseLevicText(text, file.name));
      } else if (lower.endsWith(".txt") || lower.endsWith(".csv") || lower.endsWith(".tsv")) {
        const text = await file.text();
        parsed.push(...parseDelimited(text, file.name), ...parseLevicText(text, file.name));
      } else {
        throw new Error("Formato no compatible");
      }
      const unique = parsed.filter((item, index, all) => index === all.findIndex((other) => other.itemCode === item.itemCode && other.lot === item.lot));
      setItems(unique);
      setStatus(unique.length ? `Se leyeron ${unique.length} artículos. Revisa todas las columnas antes de incorporarlos.` : "No se encontraron artículos. Verifica que el documento tenga texto seleccionable o encabezados de columnas reconocibles.");
    } catch (error) {
      console.error(error);
      setStatus("No fue posible leer el documento. Se admiten PDF con texto, Word .docx, TXT, CSV y TSV. Los archivos .doc antiguos deben guardarse primero como .docx.");
    }
  };

  const edit = (index: number, field: keyof InvoiceItem, value: string | boolean) => setItems((current) => current.map((item, position) => position === index ? { ...item, [field]: value } : item));
  const confirm = async () => {
    const selected = items.filter((item) => item.selected && item.itemCode && item.name && Number(item.retailPrice) > 0);
    if (!selected.length) return setStatus("Selecciona al menos un artículo con clave, descripción y precio al público.");
    setStatus("Incorporando artículos al inventario…");
    const response = await fetch("/api/inventory", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: selected }) });
    const result = await response.json();
    if (!response.ok) return setStatus(result.error || "No fue posible incorporar los artículos.");
    setItems([]);
    setStatus(`${selected.length} artículos incorporados; sus cantidades se sumaron al inventario.`);
    await reload();
  };

  const fields: Array<[keyof InvoiceItem, string, string]> = [
    ["itemCode", "CLAVE", "text"], ["name", "DESCRIPCIÓN", "text"], ["lot", "LOTE", "text"],
    ["expiryDate", "CADUCIDAD", "text"], ["productCode", "CVE. PROD.", "text"], ["stock", "CANTIDAD", "number"],
    ["unitCode", "CVE. U.M.", "text"], ["unitName", "U.M.", "text"], ["retailPrice", "PRECIO PÚBLICO", "number"],
    ["discountPercent", "% DESC.", "number"], ["discountPo", "DESC. P.O.", "number"], ["discountSo", "DESC. S.O.", "number"],
    ["discountPcc", "DESC. PCC", "number"], ["discountFair", "DESC. FERIA", "number"], ["netPrice", "PRECIO NETO", "number"],
    ["lineAmount", "IMPORTE", "number"],
  ];

  return <section className="importbox levic-import">
    <div className="importintro"><span><Upload /></span><div><h2>Importar inventario desde archivo</h2><p>Lee PDF, Word .docx, TXT, CSV o TSV y conserva clave, lote, caducidad, descuentos y precios.</p></div><label className="uploadbutton"><FileText /> Seleccionar archivo<input type="file" accept=".pdf,.docx,.txt,.csv,.tsv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} /></label></div>
    {filename && <p className="importstatus"><b>{filename}</b> · {status}</p>}
    {items.length > 0 && <div className="review invoice-review"><div className="reviewhead"><div><h3>Revisión de artículos</h3><p>La primera columna permite excluir un renglón. Todos los datos son editables.</p></div><button className="confirmimport" onClick={confirm}><Check /> Confirmar e incorporar</button></div>
      <div className="invoice-table"><div className="invoice-row invoice-labels"><span>INCLUIR</span>{fields.map(([, label]) => <span key={label}>{label}</span>)}</div>
        {items.map((item, index) => <div className="invoice-row" key={`${item.itemCode}-${item.lot}-${index}`}><input aria-label={`Incluir ${item.itemCode}`} type="checkbox" checked={item.selected} onChange={(event) => edit(index, "selected", event.target.checked)} />{fields.map(([field, label, type]) => <input key={field} aria-label={label} type={type} step={type === "number" ? "0.01" : undefined} min={type === "number" ? "0" : undefined} value={String(item[field] ?? "")} onChange={(event) => { edit(index, field, event.target.value); if (field === "retailPrice") edit(index, "salePrice", event.target.value); }} />)}</div>)}
      </div></div>}
  </section>;
}
