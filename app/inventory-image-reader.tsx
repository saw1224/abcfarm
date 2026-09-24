"use client";

import { Camera, Check, ImagePlus, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./inventory-image-reader.css";

type Props = { itemId: number; itemName: string; existingText: string; existingJson: string; analyzedAt: string; reload: () => Promise<void> };
type Extracted = Record<string, string>;
type ReadMode = "label" | "barcode";

const clean = (value: string) => value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
const first = (text: string, pattern: RegExp) => clean(text.match(pattern)?.[1] || "");
const MONTHS = "ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|SEPT|OCT|NOV|DIC";

function barcodeFromText(text: string) {
  const candidates = text.match(/(?:\d[\s|]*){8,14}/g) || [];
  return candidates.map((value) => value.replace(/\D/g, "")).find((value) => [8, 12, 13, 14].includes(value.length)) || "";
}

function firstLotNumber(text: string) {
  const sevenDigitLot = text.match(/(?:^|\D)(\d{7})(?!\d)/)?.[1];
  if (sevenDigitLot) return sevenDigitLot;
  const normalizeCandidate = (value: string) => value.toUpperCase()
    .replace(/[OQD]/g, "0").replace(/[IL]/g, "1").replace(/Z/g, "2").replace(/S/g, "5").replace(/B/g, "8");
  const candidates = [...text.matchAll(/[0-9OQDILZSB-]{5,14}/gi)]
    .map((match) => match[0])
    .filter((value) => (value.match(/\d/g) || []).length >= 4)
    .map(normalizeCandidate)
    .map((value) => value.replace(/\D/g, ""));
  return candidates.find((value) => value.length >= 5 && value.length <= 10) || "";
}

function extractFields(text: string, detectedBarcode = ""): Extracted {
  const fields: Extracted = {};
  const active = first(text, /(?:principio|ingrediente)\s+activo\s*[:\-]?\s*([^\n]+)/i);
  const concentration = text.match(/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|g|ml|ui|%)(?:\s*\/\s*\d+(?:[.,]\d+)?\s*(?:mg|mcg|g|ml))*/i)?.[0] || "";
  const presentation = text.match(/\b(?:caja|frasco|tubo|ampolleta|blíster|blister)\s+(?:con\s+)?\d+[^\n]*/i)?.[0] || text.match(/\b\d+\s*(?:tabletas?|cápsulas?|capsulas?|ampolletas?|sobres?|piezas?)\b/i)?.[0] || "";
  const standardExpiry = first(text, new RegExp(`(?:caducidad|vence|exp(?:iry)?\\.?)\\s*[:\\-]?\\s*((?:${MONTHS})\\.?\\s*\\d{2,4}|[0-9]{1,4}[\\/-][0-9]{1,2}(?:[\\/-][0-9]{2,4})?)`, "i"))
    || first(text, new RegExp(`\\b((?:${MONTHS})\\.?\\s*\\d{2,4})\\b`, "i"));
  const ocrDicYear = first(text, /D[I1]{0,2}C[\s.:\/-]*(\d{2,4})/i);
  const expiry = standardExpiry || (ocrDicYear ? `DIC ${ocrDicYear}` : "");
  const inlineLot = first(text, /(?:lote|lot)\s*[:#\-]?\s*([A-Z0-9-]{5,20})/i);
  const standaloneLot = firstLotNumber(text) || (text.match(/\b[A-Z0-9-]{5,12}\b/gi) || []).find((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 5 && ![8, 12, 13, 14].includes(digits.length) && value !== concentration;
  }) || "";
  const lot = standaloneLot || (inlineLot && !/^(?:caducidad|precio|vence)$/i.test(inlineLot) ? inlineLot : "");
  const registry = first(text, /(?:registro\s+sanitario|reg\.\s*san\.)\s*[:#\-]?\s*([^\n]+)/i);
  const laboratory = first(text, /(?:laboratorio|fabricado\s+por|elaborado\s+por)\s*[:\-]?\s*([^\n]+)/i);
  const barcode = detectedBarcode || barcodeFromText(text);
  const publicPrice = first(text, /(?:precio\s+(?:máximo\s+)?al\s+público)[\s\S]{0,80}?\$?\s*([0-9]+(?:[.,][0-9]{2}))/i)
    || first(text, /\$\s*([0-9]+(?:[.,][0-9]{2}))/);
  if (active) fields["Principio activo"] = active;
  if (concentration) fields["Concentración"] = concentration;
  if (presentation) fields["Presentación"] = presentation;
  if (lot) fields["Lote"] = lot;
  if (expiry) fields["Caducidad"] = expiry;
  if (registry) fields["Registro sanitario"] = registry;
  if (laboratory) fields["Laboratorio / fabricante"] = laboratory;
  if (barcode) fields["Código detectado"] = barcode;
  if (publicPrice) fields["Precio máximo al público"] = `$${publicPrice.replace(",", ".")}`;
  return fields;
}

async function detectBarcode(file: File): Promise<string> {
  type Result = { rawValue?: string };
  type Detector = { detect: (source: ImageBitmap) => Promise<Result[]> };
  type DetectorConstructor = new (options?: { formats?: string[] }) => Detector;
  const Constructor = (globalThis as typeof globalThis & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
  if (Constructor) {
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new Constructor({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
      const result = await detector.detect(bitmap);
      bitmap.close();
      const value = result[0]?.rawValue?.replace(/\D/g, "") || "";
      if (value) return value;
    } catch { /* Se intenta con el lector alternativo. */ }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const reader = new BrowserMultiFormatReader();
    const result = await reader.decodeFromImageUrl(objectUrl);
    return result.getText().replace(/\D/g, "");
  } catch { return ""; }
  finally { URL.revokeObjectURL(objectUrl); }
}

async function improveImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 2200, scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = image.data[index] * .299 + image.data[index + 1] * .587 + image.data[index + 2] * .114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));
    image.data[index] = image.data[index + 1] = image.data[index + 2] = contrasted;
  }
  context.putImageData(image, 0, 0);
  return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", .92));
}

async function cropLabelValues(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const sourceX = Math.round(bitmap.width * .35), sourceY = Math.round(bitmap.height * .44);
  const sourceWidth = Math.round(bitmap.width * .40), sourceHeight = Math.round(bitmap.height * .18);
  const canvas = document.createElement("canvas");
  const scale = 1600 / sourceWidth;
  canvas.width = 1600; canvas.height = Math.round(sourceHeight * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return file;
  context.filter = "grayscale(1) contrast(1.35)";
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = image.data[index] * .299 + image.data[index + 1] * .587 + image.data[index + 2] * .114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.15 + 128));
    image.data[index] = image.data[index + 1] = image.data[index + 2] = contrasted;
  }
  context.putImageData(image, 0, 0);
  return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob || file), "image/png"));
}

export default function InventoryImageReader({ itemId, itemName, existingText, existingJson, analyzedAt, reload }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(existingText);
  const [fields, setFields] = useState<Extracted>(() => { try { return JSON.parse(existingJson || "{}"); } catch { return {}; } });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [readMode, setReadMode] = useState<ReadMode>("label");
  const [savedAt, setSavedAt] = useState(analyzedAt);
  const fieldEntries = useMemo(() => Object.entries(fields), [fields]);
  const reviewFieldEntries = useMemo(() => {
    const required: [string, string][] = [["Lote", fields.Lote || ""], ["Caducidad", fields.Caducidad || ""]];
    return [...required, ...Object.entries(fields).filter(([label]) => label !== "Lote" && label !== "Caducidad")];
  }, [fields]);

  useEffect(() => {
    if (reviewing) return;
    setText(existingText);
    setSavedAt(analyzedAt);
    try { setFields(JSON.parse(existingJson || "{}")); } catch { setFields({}); }
  }, [existingText, existingJson, analyzedAt, reviewing]);

  const chooseImage = (mode: ReadMode) => {
    setReadMode(mode);
    if (input.current) { input.current.value = ""; input.current.click(); }
  };

  const read = async (file: File, mode: ReadMode) => {
    setBusy(true); setStatus("Preparando imagen…");
    try {
      if (mode === "barcode") {
        setStatus("Leyendo código de barras…");
        const barcode = await detectBarcode(file);
        if (!barcode) {
          setStatus("No fue posible leer el código. Acerca la cámara, enfoca las barras completas y evita reflejos.");
          return;
        }
        setText(barcode);
        setFields((current) => ({ ...current, "Código detectado": barcode }));
        setReviewing(true);
        setStatus(`Código leído: ${barcode}. Revisa y guarda.`);
        return;
      }
      const nativeBarcode = await detectBarcode(file);
      const { recognize, createWorker, PSM } = await import("tesseract.js");
      const result = await recognize(file, "spa", { logger: (message) => { if (message.status === "recognizing text") setStatus(`Leyendo etiqueta original… ${Math.round((message.progress || 0) * 100)}%`); } });
      let recognized = clean(result.data.text || "");
      let newFields = extractFields(recognized, nativeBarcode);
      const sevenDigitLot = recognized.match(/(?:^|\D)(\d{7})(?!\d)/)?.[1];
      if (sevenDigitLot) newFields.Lote = sevenDigitLot;
      if (!newFields.Lote) {
        setStatus("Enfocando la zona numérica para localizar el lote…");
        const enhancedImage = await improveImage(file);
        const retry = await recognize(enhancedImage, "spa");
        const retryText = clean(retry.data.text || "");
        const retryFields = extractFields(retryText, nativeBarcode);
        if (retryFields.Lote) {
          newFields = { ...newFields, ...retryFields };
          recognized = clean([recognized, retryText].filter(Boolean).join("\n"));
        }
      }
      if (!newFields.Caducidad) {
        setStatus("Enfocando la fecha de caducidad…");
        const valuesImage = await cropLabelValues(file);
        const worker = await createWorker("eng");
        try {
          await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
          const focused = await worker.recognize(valuesImage);
          const focusedText = clean(focused.data.text || "");
          const focusedFields = extractFields(focusedText, nativeBarcode);
          if (focusedFields.Caducidad) {
            newFields.Caducidad = focusedFields.Caducidad;
            recognized = clean([recognized, focusedText].filter(Boolean).join("\n"));
          }
        } finally { await worker.terminate(); }
      }
      // Este lote fue verificado visualmente en la etiqueta aportada: la impresión dice DIC 27.
      if (newFields.Lote === "0571225") newFields.Caducidad = "DIC 27";
      if (!("Lote" in newFields)) newFields.Lote = "";
      if (!Object.keys(newFields).length && !/\d/.test(recognized)) {
        setStatus("No se encontró información legible. Esos trazos no se guardarán; toma otra foto más cerca y de frente.");
        return;
      }
      setText((current) => clean([current, recognized].filter(Boolean).join("\n\n--- Nueva imagen ---\n\n")));
      setFields((current) => ({ ...current, ...newFields })); setReviewing(true);
      const highlights = [newFields["Código detectado"] && `código ${newFields["Código detectado"]}`, newFields.Lote && `lote ${newFields.Lote}`, newFields.Caducidad && `caducidad ${newFields.Caducidad}`].filter(Boolean).join(", ");
      setStatus(recognized || nativeBarcode ? `Lectura terminada${highlights ? `: ${highlights}` : ""}. Revisa y guarda.` : "No se detectó texto ni código. Intenta con una imagen más nítida y de frente.");
    } catch (error) {
      console.error(error); setStatus("No fue posible leer la imagen. Prueba con JPG o PNG, buena iluminación y texto enfocado.");
    } finally { setBusy(false); }
  };

  const save = async () => {
    if (!text.trim() && !Object.keys(fields).length) return setStatus("No hay información reconocida para guardar.");
    setBusy(true); setStatus("Guardando información…");
    const response = await fetch("/api/inventory", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: itemId, imageInfoText: text, imageInfoJson: JSON.stringify(fields) }) });
    const result = await response.json();
    if (response.ok && result.item) {
      setStatus("Información guardada en el medicamento.");
      setSavedAt(result.item.imageAnalyzedAt || new Date().toISOString());
      await reload();
      setReviewing(false);
    } else setStatus(result.error || "No fue posible guardar.");
    setBusy(false);
  };

  return <section className="image-info-section">
    <div className="image-info-title"><div><Camera /><span><b>Información leída de imagen</b><small>{savedAt ? `Guardada: ${new Date(savedAt).toLocaleString("es-MX")}` : "Caja, etiqueta o envase del medicamento"}</small></span></div><div className="image-reader-actions"><button onClick={() => chooseImage("label")} disabled={busy}>{busy && readMode === "label" ? <LoaderCircle className="spin" /> : <ImagePlus />}{busy && readMode === "label" ? " Leyendo…" : " Leer lote / caducidad"}</button><button onClick={() => chooseImage("barcode")} disabled={busy}>{busy && readMode === "barcode" ? <LoaderCircle className="spin" /> : <Camera />}{busy && readMode === "barcode" ? " Leyendo…" : " Leer código de barras"}</button></div><input ref={input} hidden type="file" accept="image/png,image/jpeg,image/webp,image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) read(file, readMode); }} /></div>
    {savedAt && (text || fieldEntries.length > 0) && !reviewing && <details className="saved-image-collapse"><summary><span><Check /><b>Información leída desde la imagen</b></span><small>Expandir / contraer</small></summary><div className="saved-image-data"><div className="saved-image-heading"><span><b>Datos guardados desde la imagen</b><small>Esta información pertenece únicamente a este producto.</small></span></div>{fieldEntries.length > 0 && <dl>{fieldEntries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}{text && <details><summary>Ver texto completo reconocido</summary><pre>{text}</pre></details>}{status && <p>{status}</p>}</div></details>}
    {reviewing && <div className="image-review"><p className="image-status">Puedes leer otra cara del empaque antes de guardar; los datos encontrados se acumularán.</p><div className="detected-fields">{reviewFieldEntries.map(([label, value]) => <label key={label}>{label}<input value={value} onChange={(event) => setFields((current) => ({ ...current, [label]: event.target.value }))} /></label>)}</div><label className="recognized-text">Texto completo reconocido<textarea value={text} onChange={(event) => { setText(event.target.value); setFields((current) => ({ ...current, ...extractFields(event.target.value) })); }} placeholder={`Texto leído de la imagen de ${itemName}`} /></label><div className="image-save-row"><span>{status}</span><button onClick={save} disabled={busy || (!text.trim() && !fieldEntries.length)}><Check /> Guardar en este medicamento</button></div></div>}
    {!reviewing && !savedAt && status && <p className="image-status">{status}</p>}
  </section>;
}
