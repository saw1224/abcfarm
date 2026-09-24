import { env } from "cloudflare:workers";
import { hashPassword, verifyPassword } from "../password";

const owner = (request: Request) => request.headers.get("oai-authenticated-user-id") || "farmacias-abc";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) return Response.json({ error: "Escribe un correo y una contraseña válidos." }, { status: 400 });
    const bootstrapEmail = String(env.ADMIN_EMAIL || "admin@farmacia.mx").trim().toLowerCase();
    const bootstrapPassword = String(env.ADMIN_PASSWORD || "");
    const isBootstrap = Boolean(bootstrapPassword) && email === bootstrapEmail && password === bootstrapPassword;
    if (isBootstrap) {
      try {
        const credentials = await hashPassword(password);
        await env.DB.prepare("INSERT INTO app_users(owner_id,name,email,role,status,password_salt,password_hash,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(owner_id,email) DO UPDATE SET name=excluded.name,role='Administrador',status='Activo',password_salt=excluded.password_salt,password_hash=excluded.password_hash").bind(owner(request), "Gustavo Sánchez", email, "Administrador", "Activo", credentials.salt, credentials.hash, new Date().toISOString()).run();
      } catch (bootstrapError) {
        console.error("admin bootstrap persistence failed", bootstrapError);
      }
      return Response.json({ id: 0, name: "Gustavo Sánchez", email, role: "Administrador" });
    }
    const user = await env.DB.prepare("SELECT id,name,email,role,status,password_salt AS passwordSalt,password_hash AS passwordHash FROM app_users WHERE owner_id=? AND email=?").bind(owner(request), email).first<Record<string, unknown>>();
    if (!user || !user.passwordSalt || !user.passwordHash || !(await verifyPassword(password, String(user.passwordSalt), String(user.passwordHash)))) return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    if (user.status !== "Activo") return Response.json({ error: "Este usuario está inactivo. Solicita acceso al administrador." }, { status: 403 });
    return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error("auth POST failed", error);
    return Response.json({ error: "No fue posible iniciar sesión." }, { status: 503 });
  }
}
