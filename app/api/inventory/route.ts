import { env } from "cloudflare:workers";

const owner = (request: Request) => request.headers.get("oai-authenticated-user-id") || "farmacias-abc";
const columns = `id,name,dose,presentation,brand,stock,sale_price AS salePrice,item_code AS itemCode,lot,expiry_date AS expiryDate,product_code AS productCode,unit_code AS unitCode,unit_name AS unitName,retail_price AS retailPrice,discount_percent AS discountPercent,discount_po AS discountPo,discount_so AS discountSo,discount_pcc AS discountPcc,discount_fair AS discountFair,net_price AS netPrice,line_amount AS lineAmount,source_file AS sourceFile,image_info_text AS imageInfoText,image_info_json AS imageInfoJson,image_analyzed_at AS imageAnalyzedAt,COALESCE(entry_date,updated_at) AS entryDate,updated_at AS updatedAt`;
const optionalNumber = (value: unknown) => { if (value === "" || value == null) return null; const number = Number(value); return Number.isFinite(number) ? number : null; };

export async function GET(request: Request) {
  try {
    const result = await env.DB.prepare(`SELECT ${columns} FROM inventory WHERE owner_id=? ORDER BY name,dose`).bind(owner(request)).all();
    return Response.json(result.results);
  } catch (error) {
    console.error("inventory GET failed", error);
    return Response.json({ error: "No fue posible cargar el inventario." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const items = Array.isArray(body.items) ? body.items : [body];
    if (!items.length || items.length > 200) return Response.json({ error: "El archivo debe contener entre 1 y 200 registros." }, { status: 400 });
    const now = new Date().toISOString(), statements = [];
    for (const raw of items) {
      const item = raw as Record<string, unknown>, name = String(item.name || "").trim(), dose = String(item.dose || "").trim() || "Sin especificar", presentation = String(item.presentation || "").trim() || "Sin especificar", brand = String(item.brand || "Genérico").trim(), stock = Math.max(0, Number(item.stock) || 0), salePrice = Number(item.salePrice);
      if (!name || !Number.isFinite(salePrice) || salePrice <= 0) return Response.json({ error: "Cada registro necesita descripción y precio al público válido." }, { status: 400 });
      const values = [owner(request), name, dose, presentation, brand, stock, salePrice, String(item.itemCode || "").trim() || null, String(item.lot || "").trim() || null, String(item.expiryDate || "").trim() || null, String(item.productCode || "").trim() || null, String(item.unitCode || "").trim() || null, String(item.unitName || "").trim() || null, optionalNumber(item.retailPrice), optionalNumber(item.discountPercent), optionalNumber(item.discountPo), optionalNumber(item.discountSo), optionalNumber(item.discountPcc), optionalNumber(item.discountFair), optionalNumber(item.netPrice), optionalNumber(item.lineAmount), String(item.sourceFile || "").trim() || null, now, now];
      const imported = Boolean(item.sourceFile);
      statements.push(env.DB.prepare(`INSERT INTO inventory(owner_id,name,dose,presentation,brand,stock,sale_price,item_code,lot,expiry_date,product_code,unit_code,unit_name,retail_price,discount_percent,discount_po,discount_so,discount_pcc,discount_fair,net_price,line_amount,source_file,entry_date,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_id,name,dose,presentation) DO UPDATE SET brand=excluded.brand,stock=${imported ? "inventory.stock + excluded.stock" : "excluded.stock"},sale_price=excluded.sale_price,item_code=excluded.item_code,lot=excluded.lot,expiry_date=excluded.expiry_date,product_code=excluded.product_code,unit_code=excluded.unit_code,unit_name=excluded.unit_name,retail_price=excluded.retail_price,discount_percent=excluded.discount_percent,discount_po=excluded.discount_po,discount_so=excluded.discount_so,discount_pcc=excluded.discount_pcc,discount_fair=excluded.discount_fair,net_price=excluded.net_price,line_amount=excluded.line_amount,source_file=excluded.source_file,updated_at=excluded.updated_at`).bind(...values));
    }
    await env.DB.batch(statements);
    return Response.json({ ok: true, count: items.length });
  } catch (error) {
    console.error("inventory POST failed", error);
    return Response.json({ error: "No fue posible guardar el medicamento." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id), imageInfoText = String(body.imageInfoText || "").trim(), imageInfoJson = String(body.imageInfoJson || "{}");
    if (!Number.isInteger(id) || !imageInfoText) return Response.json({ error: "No hay información de imagen para guardar." }, { status: 400 });
    let fields: Record<string, unknown> = {};
    try { fields = JSON.parse(imageInfoJson) as Record<string, unknown>; } catch { return Response.json({ error: "La información reconocida no es válida." }, { status: 400 }); }
    const lot = String(fields.Lote || "").trim() || null;
    const expiry = String(fields.Caducidad || "").trim() || null;
    const now = new Date().toISOString();
    const saved = await env.DB.prepare(`UPDATE inventory SET image_info_text=?,image_info_json=?,image_analyzed_at=?,lot=COALESCE(?,lot),expiry_date=COALESCE(?,expiry_date),updated_at=? WHERE id=? AND owner_id=? RETURNING id,image_info_text AS imageInfoText,image_info_json AS imageInfoJson,image_analyzed_at AS imageAnalyzedAt,lot,expiry_date AS expiryDate`).bind(imageInfoText, imageInfoJson, now, lot, expiry, now, id, owner(request)).first();
    if (!saved) return Response.json({ error: "No se encontró el medicamento para actualizarlo." }, { status: 404 });
    return Response.json({ ok: true, item: saved });
  } catch (error) {
    console.error("inventory PATCH failed", error);
    return Response.json({ error: "No fue posible guardar la información de la imagen." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Registro inválido." }, { status: 400 });
    await env.DB.prepare("DELETE FROM inventory WHERE id=? AND owner_id=?").bind(id, owner(request)).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("inventory DELETE failed", error);
    return Response.json({ error: "No fue posible eliminar el registro." }, { status: 503 });
  }
}
