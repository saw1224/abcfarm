"use client";
import { useEffect, useMemo, useState } from "react";
import LevicInventoryImport from "./levic-inventory-import";
import InventoryImageReader from "./inventory-image-reader";
import "./inventory-enhancements.css";
import {
  Search,
  Pill,
  LayoutDashboard,
  History,
  Users,
  Store,
  Settings,
  LogOut,
  ShieldCheck,
  ExternalLink,
  ArrowUpDown,
  Check,
  Plus,
  Clock3,
  TrendingDown,
  ChevronRight,
  Link2,
  UserRound,
  LockKeyhole,
  Package,
  Share2,
  Trash2,
  Upload,
  FileText,
  X,
} from "lucide-react";
type View =
  | "resumen"
  | "buscar"
  | "historial"
  | "inventario"
  | "usuarios"
  | "farmacias"
  | "config";
type InventoryItem = {
  id: number;
  name: string;
  dose: string;
  presentation: string;
  brand: string;
  stock: number;
  salePrice: number;
  itemCode?: string;
  lot?: string;
  expiryDate?: string;
  productCode?: string;
  unitCode?: string;
  unitName?: string;
  retailPrice?: number;
  discountPercent?: number;
  discountPo?: number;
  discountSo?: number;
  discountPcc?: number;
  discountFair?: number;
  netPrice?: number;
  lineAmount?: number;
  sourceFile?: string;
  imageInfoText?: string;
  imageInfoJson?: string;
  imageAnalyzedAt?: string;
  entryDate: string;
  updatedAt: string;
};
type ImportItem = {
  name: string;
  dose: string;
  presentation: string;
  brand: string;
  stock: string;
  salePrice: string;
  itemCode?: string;
  lot?: string;
  expiryDate?: string;
  productCode?: string;
  unitCode?: string;
  unitName?: string;
  retailPrice?: string;
  discountPercent?: string;
  discountPo?: string;
  discountSo?: string;
  discountPcc?: string;
  discountFair?: string;
  netPrice?: string;
  lineAmount?: string;
  sourceFile?: string;
  selected: boolean;
};
type AppUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  hasPassword: number;
  createdAt: string;
};
type SessionUser = { id: number; name: string; email: string; role: string };
type PharmacySource = {
  sourceKey: string;
  name: string;
  url: string;
  active: boolean;
};
const farms = [
  "Farmacias Guadalajara",
  "Farmacias del Ahorro",
  "Benavides",
  "San Pablo",
  "Farmacias Similares",
  "Walmart",
];
const products = [
  {
    name: "Losartán",
    dose: "50 mg",
    presentation: "30 tabletas",
    brand: "Genérico",
    active: "Losartán potásico",
    category: "Antihipertensivo · ARA-II",
  },
  {
    name: "Losartán",
    dose: "100 mg",
    presentation: "30 tabletas",
    brand: "Genérico",
    active: "Losartán potásico",
    category: "Antihipertensivo · ARA-II",
  },
  {
    name: "Losartán / Hidroclorotiazida",
    dose: "50 mg / 12.5 mg",
    presentation: "30 tabletas",
    brand: "Genérico",
    active: "Losartán + hidroclorotiazida",
    category: "Antihipertensivo combinado",
  },
  {
    name: "Omeprazol",
    dose: "20 mg",
    presentation: "14 cápsulas",
    brand: "Genérico",
    active: "Omeprazol",
    category: "Protector gástrico",
  },
  {
    name: "Omeprazol",
    dose: "40 mg",
    presentation: "14 cápsulas",
    brand: "Genérico",
    active: "Omeprazol",
    category: "Protector gástrico",
  },
  {
    name: "Atorvastatina",
    dose: "20 mg",
    presentation: "30 tabletas",
    brand: "Genérico",
    active: "Atorvastatina cálcica",
    category: "Hipolipemiante · Estatina",
  },
  {
    name: "Metformina",
    dose: "850 mg",
    presentation: "30 tabletas",
    brand: "Genérico",
    active: "Metformina",
    category: "Antidiabético · Biguanida",
  },
  {
    name: "Aspirina Protect",
    dose: "100 mg",
    presentation: "28 tabletas",
    brand: "Bayer",
    active: "Ácido acetilsalicílico",
    category: "Antiagregante plaquetario",
  },
] as const;
const data = [
  [
    "Farmacias Guadalajara",
    "FG",
    "#d9332c",
    "Losartán potásico 50 mg",
    "30 tabletas",
    128.5,
    "Recoge hoy",
    "https://www.farmaciasguadalajara.com",
  ],
  [
    "Farmacias del Ahorro",
    "FA",
    "#009a44",
    "Losartán 50 mg",
    "30 tabletas",
    134,
    "Envío 2 h",
    "https://www.fahorro.com",
  ],
  [
    "Walmart",
    "W",
    "#0874c9",
    "Losartán 50 mg Medimart",
    "30 tabletas",
    139,
    "Recoge mañana",
    "https://www.walmart.com.mx",
  ],
  [
    "Farmacias Similares",
    "FS",
    "#07599b",
    "Losartán 50 mg",
    "30 tabletas",
    143,
    "En sucursal",
    "https://www.farmaciasdesimilares.com",
  ],
  [
    "Benavides",
    "B",
    "#1670b5",
    "Losartán potásico 50 mg",
    "30 tabletas",
    149.9,
    "Envío hoy",
    "https://www.benavides.com.mx",
  ],
  [
    "San Pablo",
    "SP",
    "#00a0a8",
    "Losartán 50 mg",
    "30 tabletas",
    158,
    "Envío 90 min",
    "https://www.farmaciasanpablo.com.mx",
  ],
] as const;
const hist = [
  ["Hoy, 10:42", "Gustavo Sánchez", "Losartán 50 mg", "6", "$128.50"],
  ["Hoy, 09:18", "María López", "Omeprazol 20 mg", "8", "$76.00"],
  ["14 sep, 16:35", "Gustavo Sánchez", "Atorvastatina 20 mg", "7", "$212.00"],
  ["14 sep, 12:04", "Juan Torres", "Metformina 850 mg", "9", "$89.50"],
];
export default function Page() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null),
    [view, setView] = useState<View>("resumen"),
    [query, setQuery] = useState(""),
    [chosen, setChosen] = useState<string[]>([]),
    [searched, setSearched] = useState(false),
    [showOptions, setShowOptions] = useState(false),
    [selectedMed, setSelectedMed] = useState<(typeof products)[number]>(
      products[0],
    ),
    [busy, setBusy] = useState(false),
    [asc, setAsc] = useState(true),
    [warn, setWarn] = useState("");
  const visible = useMemo(
    () =>
      data
        .filter((x) => !chosen.length || chosen.includes(x[0]))
        .sort((a, b) => (asc ? a[5] - b[5] : b[5] - a[5])),
    [chosen, asc],
  );
  const suggestions = useMemo(() => {
    const clean = (v: string) =>
      v
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const q = clean(query);
    return products.filter((p) =>
      clean(
        [p.name, p.dose, p.presentation, p.brand, p.active, p.category].join(
          " ",
        ),
      ).includes(q),
    );
  }, [query]);
  const run = () => {
    if (!query.trim()) {
      setWarn("Escribe al menos un dato: nombre, marca, gramaje o cantidad.");
      return;
    }
    setWarn("");
    setSearched(false);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setShowOptions(true);
    }, 450);
  };
  const choose = (p: (typeof products)[number]) => {
    setSelectedMed(p);
    setShowOptions(false);
    setSearched(true);
  };
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const loadInventory = async () => {
    try {
      const r = await fetch("/api/inventory");
      if (r.ok) setInventory(await r.json());
    } catch {}
  };
  useEffect(() => {
    loadInventory();
  }, []);
  if (!sessionUser) return <Login go={setSessionUser} />;
  const menu = [
    [
      ["resumen", LayoutDashboard, "Resumen"],
      ["buscar", Search, "Buscar medicamento"],
      ["historial", History, "Historial"],
      ["inventario", Package, "Inventario"],
    ],
    ...(sessionUser.role === "Administrador" ? [[
      ["usuarios", Users, "Usuarios"],
      ["farmacias", Store, "Farmacias"],
      ["config", Settings, "Configuración"],
    ]] : []),
  ] as const;
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <img src="/logo-abc-menu.jpeg" alt="Farmacia y Consultorio ABC" />
        </div>
        <nav>
          {menu.map((group, g) => (
            <div key={g}>
              {g === 1 && <label>ADMINISTRACIÓN</label>}
              {group.map(([v, I, l]) => (
                <button
                  className={view === v ? "active" : ""}
                  onClick={() => setView(v)}
                  key={v}
                >
                  <I />
                  {l}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="account">
          <span>{sessionUser.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
          <div>
            <b>{sessionUser.name}</b>
            <small>{sessionUser.role}</small>
          </div>
          <button onClick={() => { setSessionUser(null); setView("resumen"); }} aria-label="Cerrar sesión">
            <LogOut />
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <h1>
              {
                {
                  resumen: "Resumen",
                  buscar: "Buscar medicamento",
                  historial: "Historial de consultas",
                  inventario: "Inventario ABC",
                  usuarios: "Usuarios",
                  farmacias: "Farmacias",
                  config: "Configuración",
                }[view]
              }
            </h1>
            <small>Farmacias ABC · México</small>
          </div>
          <em>
            <ShieldCheck /> Sesión segura
          </em>
        </header>
        <div className="content">
          {view === "resumen" && <Dashboard name={sessionUser.name} open={() => setView("buscar")} />}
          {view === "buscar" && (
            <>
              <section className="searchbox">
                <div className="sectiontitle">
                  <div>
                    <h2>¿Qué medicamento buscas?</h2>
                    <p>
                      Escribe cualquier dato: nombre, marca, gramaje o cantidad.
                    </p>
                  </div>
                  <span>Búsqueda flexible</span>
                </div>
                <div className="query">
                  <Search />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowOptions(false);
                      setSearched(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && run()}
                    placeholder="Ej. Losartán, 50 mg, Bayer o 30 tabletas"
                  />
                  <button onClick={run}>
                    {busy ? "Buscando…" : "Buscar opciones"}
                  </button>
                </div>
                <p className="hint">
                  <Link2 /> También puedes pegar directamente una URL
                </p>
                <div className="filter">
                  <div>
                    <b>Farmacias a consultar</b>
                    <small>Sin selección, consultaremos todas.</small>
                  </div>
                  <div>
                    {farms.map((f) => (
                      <button
                        className={chosen.includes(f) ? "picked" : ""}
                        onClick={() =>
                          setChosen((s) =>
                            s.includes(f)
                              ? s.filter((x) => x !== f)
                              : [...s, f],
                          )
                        }
                        key={f}
                      >
                        {chosen.includes(f) && <Check />}
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                {warn && <p className="warning">{warn}</p>}
              </section>
              {showOptions && (
                <ProductOptions rows={suggestions} choose={choose} />
              )}{" "}
              {searched ? (
                <Results
                  rows={visible}
                  med={selectedMed}
                  own={inventory.find(
                    (i) =>
                      i.name.toLowerCase() === selectedMed.name.toLowerCase() &&
                      i.dose.toLowerCase() === selectedMed.dose.toLowerCase(),
                  )}
                  asc={asc}
                  flip={() => setAsc(!asc)}
                />
              ) : (
                !showOptions && (
                  <div className="empty">
                    <Search />
                    <h3>Busca con un solo criterio</h3>
                    <p>
                      Por ejemplo: “Losartán”, “100 mg”, “Bayer” o “30
                      tabletas”.
                    </p>
                  </div>
                )
              )}
            </>
          )}
          {view === "historial" && (
            <Panel
              title="Todas las consultas"
              sub="Registro de actividad del equipo"
            >
              <HistoryTable />
            </Panel>
          )}
          {view === "inventario" && (
            <InventoryView rows={inventory} reload={loadInventory} />
          )}{" "}
          {sessionUser.role === "Administrador" && view === "usuarios" && <UsersView />}
          {sessionUser.role === "Administrador" && view === "farmacias" && <FarmsView />}
          {sessionUser.role === "Administrador" && view === "config" && <Config />}
        </div>
      </main>
    </div>
  );
}
function Login({ go }: { go: (user: SessionUser) => void }) {
  const [email, setEmail] = useState("admin@farmacia.mx");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true); setMessage("Validando acceso…");
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (response.ok) go(result); else setMessage(result.error || "No fue posible iniciar sesión.");
    } catch { setMessage("No fue posible iniciar sesión."); }
    setLoggingIn(false);
  };
  return (
    <div className="login">
      <section>
        <div className="hero">
          <img
            className="hero-logo"
            src="/logo-abc.png"
            alt="Farmacia y Consultorio ABC"
          />
          <h1>
            Encuentra el mejor precio.
            <br />
            <em>Decide con confianza.</em>
          </h1>
          <p>
            Consulta y compara medicamentos en las principales farmacias de
            México desde un solo lugar.
          </p>
          <div>
            <ShieldCheck />
            <span>
              <b>Información centralizada</b>
              <small>Referencias claras para una mejor decisión</small>
            </span>
          </div>
          <img
            className="hero-doctor"
            src="/doctor-abc.png"
            alt="Doctor de Farmacias ABC"
          />
        </div>
      </section>
      <article>
        <form onSubmit={submit}>
          <div className="loginbrand loginbrand-lockup">
            <img className="loginbrand-logo" src="/logo-abc.png" alt="Farmacia y Consultorio ABC" />
            <img className="loginbrand-doctor" src="/doctor-abc.png" alt="Doctor de Farmacias ABC" />
          </div>
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para continuar</p>
          <label>Correo electrónico</label>
          <span className="field">
            <UserRound />
            <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
          </span>
          <label>Contraseña</label>
          <span className="field">
            <LockKeyhole />
            <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </span>
          <button className="primary" type="submit" disabled={loggingIn}>
            {loggingIn ? "Ingresando…" : "Iniciar sesión"} <ChevronRight />
          </button>
          {message && <p className="loginmessage">{message}</p>}
          <small className="demo">
            <Check /> El acceso utiliza el correo, contraseña y rol configurados
          </small>
        </form>
      </article>
    </div>
  );
}
function Dashboard({ name, open }: { name: string; open: () => void }) {
  return (
    <>
      <section className="welcome">
        <div>
          <small>CENTRO DE CONSULTA</small>
          <h2>Buenos días, {name.split(" ")[0]}</h2>
          <p>
            Compara precios y consulta información farmacológica en segundos.
          </p>
          <button onClick={open}>
            <Search /> Nueva búsqueda
          </button>
        </div>
      </section>
      <div className="metrics">
        <Metric
          I={Search}
          t="Consultas este mes"
          n="124"
          s="12% vs. mes anterior"
        />
        <Metric
          I={TrendingDown}
          t="Ahorro identificado"
          n="$8,460"
          s="Estimación mensual"
        />
        <Metric I={Store} t="Fuentes activas" n="6" s="Todas operando" />
        <Metric I={Users} t="Usuarios activos" n="4" s="1 administrador" />
      </div>
      <Panel
        title="Actividad reciente"
        sub="Últimas búsquedas realizadas por el equipo"
      >
        <HistoryTable short />
      </Panel>
    </>
  );
}
function Metric({ I, t, n, s }: { I: any; t: string; n: string; s: string }) {
  return (
    <div className="metric">
      <I />
      <span>{t}</span>
      <b>{n}</b>
      <small>
        <Check /> {s}
      </small>
    </div>
  );
}
function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panelhead">
        <div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function HistoryTable({ short = false }: { short?: boolean }) {
  return (
    <div className="table">
      <div className="tr th">
        <span>FECHA</span>
        <span>USUARIO</span>
        <span>MEDICAMENTO</span>
        <span>RESULTADOS</span>
        <span>MEJOR PRECIO</span>
      </div>
      {hist.slice(0, short ? 3 : 4).map((r, i) => (
        <div className="tr" key={i}>
          <span>
            <Clock3 />
            {r[0]}
          </span>
          <span>{r[1]}</span>
          <b>{r[2]}</b>
          <span>{r[3]} referencias</span>
          <strong>{r[4]}</strong>
        </div>
      ))}
    </div>
  );
}
function ProductOptions({
  rows,
  choose,
}: {
  rows: readonly (typeof products)[number][];
  choose: (p: (typeof products)[number]) => void;
}) {
  return (
    <section className="options">
      <div className="optionshead">
        <div>
          <h3>Elige el medicamento exacto</h3>
          <p>Encontramos {rows.length} opciones con el criterio escrito.</p>
        </div>
      </div>
      {rows.length ? (
        <div className="optiongrid">
          {rows.map((p, i) => (
            <button onClick={() => choose(p)} key={i}>
              <img
                className="option-med-image"
                src="/medicamento-generico.png"
                alt={"Imagen ilustrativa de " + p.name}
              />
              <div>
                <b>{p.name}</b>
                <strong>
                  {p.dose} · {p.presentation}
                </strong>
                <small>
                  {p.brand} · {p.category}
                </small>
              </div>
              <ChevronRight />
            </button>
          ))}
        </div>
      ) : (
        <div className="nooptions">
          <Search />
          <b>No encontramos coincidencias</b>
          <p>Prueba con otro nombre, marca, gramaje o cantidad.</p>
        </div>
      )}
    </section>
  );
}
function Results({
  rows,
  med,
  own,
  asc,
  flip,
}: {
  rows: (typeof data)[number][];
  med: (typeof products)[number];
  own?: InventoryItem;
  asc: boolean;
  flip: () => void;
}) {
  let min = Math.min(...rows.map((x) => x[5])),
    avg = rows.reduce((a, x) => a + x[5], 0) / rows.length,
    delta = own ? own.salePrice - avg : 0,
    pct = own ? Math.abs((delta / avg) * 100) : 0;
  const share = () => {
    const lines = [
      "Comparación de precios - Farmacias ABC",
      med.name + " " + med.dose + " · " + med.presentation,
      "Mejor precio encontrado: $" + min.toFixed(2),
      "Precio promedio: $" + avg.toFixed(2),
    ];
    if (own)
      lines.push(
        "Precio Farmacias ABC: $" +
          own.salePrice.toFixed(2) +
          " (" +
          (delta <= 0 ? "debajo" : "encima") +
          " del promedio)",
      );
    lines.push("", "Precios de referencia; verificar disponibilidad.");
    window.open(
      "https://web.whatsapp.com/send?text=" +
        encodeURIComponent(lines.join("\n")),
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <>
      <div className="resulthead">
        <div>
          <small>MEDICAMENTO IDENTIFICADO</small>
          <h2>
            {med.name} {med.dose} <em>· {med.presentation}</em>
          </h2>
          <p>{rows.length} referencias comparables.</p>
        </div>
        <div>
          <span>Mejor precio</span>
          <b>{"$" + min.toFixed(2)}</b>
          <small> MXN</small>
        </div>
      </div>
      <div className="resultactions">
        <button className="whatsapp" onClick={share}>
          <Share2 /> Compartir por WhatsApp
        </button>
      </div>
      {own ? (
        <div className={"owncompare " + (delta <= 0 ? "below" : "above")}>
          <div>
            <span>PRECIO FARMACIAS ABC</span>
            <b>{"$" + own.salePrice.toFixed(2)}</b>
          </div>
          <div>
            <span>PROMEDIO ENCONTRADO</span>
            <b>{"$" + avg.toFixed(2)}</b>
          </div>
          <strong>
            {delta <= 0 ? "Debajo" : "Encima"} del promedio por{" "}
            {"$" + Math.abs(delta).toFixed(2)} ({pct.toFixed(1)}%)
          </strong>
        </div>
      ) : (
        <div className="owncompare missing">
          <Package />
          <span>
            <b>Sin precio propio para esta presentación</b>
            <small>
              Agrega el medicamento en Inventario para compararlo
              automáticamente.
            </small>
          </span>
        </div>
      )}
      <div className="results">
        <section className="panel prices">
          <div className="panelhead">
            <div>
              <h3>Farmacias y precios</h3>
              <p>Precios publicados de referencia</p>
            </div>
            <button onClick={flip}>
              <ArrowUpDown /> {asc ? "Menor a mayor" : "Mayor a menor"}
            </button>
          </div>
          {rows.map((r, i) => (
            <div
              className={"price " + (i === 0 && asc ? "best" : "")}
              key={r[0]}
            >
              <span>{i + 1}</span>
              <img
                className="med-thumb"
                src="/medicamento-generico.png"
                alt={"Imagen ilustrativa de " + med.name}
              />
              <i style={{ background: r[2] }}>{r[1]}</i>
              <div>
                <b>{r[0]}</b>
                <small>
                  {med.name} {med.dose} · {med.presentation}
                </small>
                <em>
                  <Check /> Disponible · {r[6]}
                </em>
              </div>
              <strong>
                {"$" + r[5].toFixed(2)}
                <small> MXN</small>
              </strong>
              <a href={r[7]} target="_blank">
                <ExternalLink />
              </a>
            </div>
          ))}
          <p className="notice">
            Precios de referencia. Verifica presentación, disponibilidad y
            precio final directamente con la farmacia.
          </p>
        </section>
        <div className="info">
          <Panel title="Descripción" sub="FICHA DEL MEDICAMENTO">
            <img
              className="med-detail-image"
              src="/medicamento-generico.png"
              alt={"Imagen ilustrativa de " + med.name}
            />
            <p>
              {med.name} contiene {med.active}. Consulta su uso, dosis y
              restricciones con un profesional de la salud.
            </p>
            <dl>
              <dt>Principio activo</dt>
              <dd>{med.active}</dd>
              <dt>Forma farmacéutica</dt>
              <dd>Tableta oral</dd>
            </dl>
          </Panel>
          <Panel title="Clasificación" sub="CATEGORÍA FARMACOLÓGICA">
            <div className="tags">
              <span>{med.category}</span>
              <span>{med.brand}</span>
            </div>
            <p>Clasificación correspondiente al producto seleccionado.</p>
          </Panel>
          <p className="med">
            <ShieldCheck />
            <span>
              <b>Información orientativa</b>
              <br />
              No sustituye la indicación médica.
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
function InventoryView({
  rows,
  reload,
}: {
  rows: InventoryItem[];
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({
      name: "",
      dose: "",
      presentation: "",
      brand: "Genérico",
      stock: "",
      salePrice: "",
      itemCode: "",
      lot: "",
      expiryDate: "",
      productCode: "",
      unitCode: "",
      unitName: "PZA",
      retailPrice: "",
      discountPercent: "",
      discountPo: "",
      discountSo: "",
      discountPcc: "",
      discountFair: "",
      netPrice: "",
      lineAmount: "",
    }),
    [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ lot: "", itemCode: "", productCode: "" });
  const [sort, setSort] = useState<{ key: "name" | "presentation" | "stock" | "salePrice" | "entryDate"; direction: "asc" | "desc" }>({ key: "entryDate", direction: "desc" });
  const filteredRows = useMemo(() => {
    const normalize = (value: unknown) => String(value || "").toLocaleLowerCase("es-MX").trim();
    const visible = rows.filter((item) =>
      normalize(item.lot).includes(normalize(filters.lot)) &&
      normalize(item.itemCode).includes(normalize(filters.itemCode)) &&
      normalize(item.productCode).includes(normalize(filters.productCode)),
    );
    return [...visible].sort((a, b) => {
      const av = sort.key === "entryDate" ? new Date(a.entryDate || a.updatedAt).getTime() : a[sort.key];
      const bv = sort.key === "entryDate" ? new Date(b.entryDate || b.updatedAt).getTime() : b[sort.key];
      const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av || "").localeCompare(String(bv || ""), "es-MX", { numeric: true });
      return sort.direction === "asc" ? result : -result;
    });
  }, [rows, filters, sort]);
  const toggleSort = (key: typeof sort.key) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  const sortLabel = (key: typeof sort.key) => sort.key === key ? (sort.direction === "asc" ? "ascendente" : "descendente") : "ordenar";
  const set = (k: string, v: string) => setForm((x) => ({ ...x, [k]: v }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Guardando…");
    const r = await fetch("/api/inventory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({
        name: "",
        dose: "",
        presentation: "",
        brand: "Genérico",
        stock: "",
        salePrice: "",
        itemCode: "",
        lot: "",
        expiryDate: "",
        productCode: "",
        unitCode: "",
        unitName: "PZA",
        retailPrice: "",
        discountPercent: "",
        discountPo: "",
        discountSo: "",
        discountPcc: "",
        discountFair: "",
        netPrice: "",
        lineAmount: "",
      });
      setMessage("Medicamento guardado.");
      await reload();
    } else {
      const d = await r.json();
      setMessage(d.error || "No fue posible guardar.");
    }
  };
  const remove = async (id: number) => {
    await fetch("/api/inventory?id=" + id, { method: "DELETE" });
    await reload();
  };
  return (
    <>
      <LevicInventoryImport reload={reload} />
      <section className="inventoryform">
        <div>
          <h2>Agregar o actualizar medicamento</h2>
          <p>Registra tu precio de venta para compararlo con el mercado.</p>
        </div>
        <form onSubmit={save}>
          <label>
            Medicamento
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Losartán"
            />
          </label>
          <label>
            Gramaje
            <input
              required
              value={form.dose}
              onChange={(e) => set("dose", e.target.value)}
              placeholder="Ej. 50 mg"
            />
          </label>
          <label>
            Presentación
            <input
              required
              value={form.presentation}
              onChange={(e) => set("presentation", e.target.value)}
              placeholder="Ej. 30 tabletas"
            />
          </label>
          <label>
            Marca
            <input
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </label>
          <label>
            Existencias
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </label>
          <label>
            Precio ABC
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.salePrice}
              onChange={(e) => set("salePrice", e.target.value)}
              placeholder="$0.00"
            />
          </label>
          <details className="manual-invoice-fields">
            <summary><span>Información completa de la factura</span><small>Expandir / contraer</small></summary>
            <div>
              <label>Clave<input value={form.itemCode} onChange={(e) => set("itemCode", e.target.value)} placeholder="Ej. LOE167" /></label>
              <label>Lote<input value={form.lot} onChange={(e) => set("lot", e.target.value)} placeholder="Ej. R2412986" /></label>
              <label>Fecha de caducidad<input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} /></label>
              <label>Cve. Prod.<input value={form.productCode} onChange={(e) => set("productCode", e.target.value)} placeholder="Ej. 51172100" /></label>
              <label>Cve. U.M.<input value={form.unitCode} onChange={(e) => set("unitCode", e.target.value)} placeholder="Ej. H87" /></label>
              <label>U.M.<input value={form.unitName} onChange={(e) => set("unitName", e.target.value)} placeholder="Ej. PZA" /></label>
              <label>Precio al público<input type="number" step="0.01" min="0" value={form.retailPrice} onChange={(e) => set("retailPrice", e.target.value)} placeholder="$0.00" /></label>
              <label>% Desc.<input type="number" step="0.01" min="0" value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)} placeholder="0.00" /></label>
              <label>Desc. P.O.<input type="number" step="0.01" min="0" value={form.discountPo} onChange={(e) => set("discountPo", e.target.value)} placeholder="0.00" /></label>
              <label>Desc. S.O.<input type="number" step="0.01" min="0" value={form.discountSo} onChange={(e) => set("discountSo", e.target.value)} placeholder="0.00" /></label>
              <label>Desc. PCC<input type="number" step="0.01" min="0" value={form.discountPcc} onChange={(e) => set("discountPcc", e.target.value)} placeholder="0.00" /></label>
              <label>Desc. Feria<input type="number" step="0.01" min="0" value={form.discountFair} onChange={(e) => set("discountFair", e.target.value)} placeholder="0.00" /></label>
              <label>Precio neto<input type="number" step="0.0001" min="0" value={form.netPrice} onChange={(e) => set("netPrice", e.target.value)} placeholder="$0.0000" /></label>
              <label>Importe<input type="number" step="0.01" min="0" value={form.lineAmount} onChange={(e) => set("lineAmount", e.target.value)} placeholder="$0.00" /></label>
            </div>
          </details>
          <button className="add" type="submit">
            <Plus /> Guardar medicamento
          </button>
        </form>
        {message && <p className="formmessage">{message}</p>}
      </section>
      <section className="panel inventorylist">
        <div className="panelhead">
          <div>
            <h3>Mi inventario</h3>
            <p>{rows.length} medicamentos registrados</p>
          </div>
        </div>
        <div className="inventoryfilters">
          <label>Filtrar por lote<input value={filters.lot} onChange={(e) => setFilters((x) => ({ ...x, lot: e.target.value }))} placeholder="Ej. R2412986" /></label>
          <label>Filtrar por clave<input value={filters.itemCode} onChange={(e) => setFilters((x) => ({ ...x, itemCode: e.target.value }))} placeholder="Ej. LOE167" /></label>
          <label>Filtrar por Cve. Prod.<input value={filters.productCode} onChange={(e) => setFilters((x) => ({ ...x, productCode: e.target.value }))} placeholder="Ej. 51172100" /></label>
          <button type="button" onClick={() => setFilters({ lot: "", itemCode: "", productCode: "" })}>Limpiar filtros</button>
        </div>
        <p className="filtercount">Mostrando {filteredRows.length} de {rows.length} productos</p>
        {rows.length ? (
          <div className="inventorytable">
            <div className="invrow invhead">
              <button onClick={() => toggleSort("name")} aria-label={`Medicamento, ${sortLabel("name")}`}>MEDICAMENTO <ArrowUpDown />{sort.key === "name" && <small>{sort.direction === "asc" ? "↑" : "↓"}</small>}</button>
              <button onClick={() => toggleSort("presentation")} aria-label={`Presentación, ${sortLabel("presentation")}`}>PRESENTACIÓN / LOTE <ArrowUpDown />{sort.key === "presentation" && <small>{sort.direction === "asc" ? "↑" : "↓"}</small>}</button>
              <button onClick={() => toggleSort("stock")} aria-label={`Existencias, ${sortLabel("stock")}`}>EXISTENCIAS <ArrowUpDown />{sort.key === "stock" && <small>{sort.direction === "asc" ? "↑" : "↓"}</small>}</button>
              <button onClick={() => toggleSort("salePrice")} aria-label={`Precio ABC, ${sortLabel("salePrice")}`}>PRECIO ABC <ArrowUpDown />{sort.key === "salePrice" && <small>{sort.direction === "asc" ? "↑" : "↓"}</small>}</button>
              <button onClick={() => toggleSort("entryDate")} aria-label={`Fecha de ingreso, ${sortLabel("entryDate")}`}>FECHA DE INGRESO <ArrowUpDown />{sort.key === "entryDate" && <small>{sort.direction === "asc" ? "↑" : "↓"}</small>}</button>
              <span />
            </div>
            {filteredRows.map((i) => (
              <div className="inventoryrecord" key={i.id}>
                <div className="invrow">
                  <div>
                    <b>{i.name}</b>
                    <small>
                      {i.itemCode ? `Clave ${i.itemCode}` : i.brand} · {i.dose}
                    </small>
                  </div>
                  <span>{i.itemCode ? `Lote ${i.lot || "—"}` : i.presentation}</span>
                  <span className={i.stock < 5 ? "low" : ""}>
                    {i.stock} {i.unitName || "piezas"}
                  </span>
                  <strong>{"$" + i.salePrice.toFixed(2)}</strong>
                  <time dateTime={i.entryDate || i.updatedAt}>{new Date(i.entryDate || i.updatedAt).toLocaleDateString("es-MX")}</time>
                  <button onClick={() => remove(i.id)} aria-label={"Eliminar " + i.name}>
                    <Trash2 />
                  </button>
                </div>
                {i.itemCode && <details className="invoice-details"><summary><span>Información completa de la factura</span><small>Expandir / contraer</small></summary><div>
                  <span><b>Clave</b>{i.itemCode}</span><span><b>Descripción</b>{i.name}</span><span><b>Lote</b>{i.lot || "—"}</span><span><b>Caducidad</b>{i.expiryDate || "—"}</span>
                  <span><b>Cve. Prod.</b>{i.productCode || "—"}</span><span><b>Cantidad</b>{i.stock}</span><span><b>Cve. U.M.</b>{i.unitCode || "—"}</span><span><b>U.M.</b>{i.unitName || "—"}</span>
                  <span><b>Precio público</b>${Number(i.retailPrice || i.salePrice).toFixed(2)}</span><span><b>% Desc.</b>{i.discountPercent ?? 0}</span><span><b>Desc. P.O.</b>{i.discountPo ?? 0}</span><span><b>Desc. S.O.</b>{i.discountSo ?? 0}</span>
                  <span><b>Desc. PCC</b>{i.discountPcc ?? 0}</span><span><b>Desc. Feria</b>{i.discountFair ?? 0}</span><span><b>Precio neto</b>${Number(i.netPrice || 0).toFixed(4)}</span><span><b>Importe</b>${Number(i.lineAmount || 0).toFixed(2)}</span><span><b>Fecha de ingreso</b>{new Date(i.entryDate || i.updatedAt).toLocaleString("es-MX")}</span>
                </div></details>}
                <InventoryImageReader itemId={i.id} itemName={i.name} existingText={i.imageInfoText || ""} existingJson={i.imageInfoJson || ""} analyzedAt={i.imageAnalyzedAt || ""} reload={reload} />
              </div>
            ))}
            {!filteredRows.length && <div className="no-filter-results"><Search /><b>No hay productos con esos filtros</b><span>Modifica los criterios o presiona “Limpiar filtros”.</span></div>}
          </div>
        ) : (
          <div className="emptyinventory">
            <Package />
            <b>Aún no hay medicamentos</b>
            <p>Agrega uno manualmente o importa un archivo.</p>
          </div>
        )}
      </section>
    </>
  );
}

function parseInventoryText(text: string): ImportItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((x) => x.replace(/\s+/g, " ").trim())
    .filter((x) => x.length > 3);
  return lines
    .map((line) => {
      const price =
        [...line.matchAll(/\$\s*([\d,]+(?:\.\d{1,2})?)/g)]
          .at(-1)?.[1]
          ?.replace(/,/g, "") || "";
      const dose = line.match(/\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|%)\b/i);
      const pack = line.match(
        /\b(?:c\/?|caja\s+(?:con\s+)?|frasco\s+(?:con\s+)?|contenido\s+)?(\d+)\s*(tabletas?|tabs?|cápsulas?|caps?|piezas?|ampolletas?|sobres?|ml)\b/i,
      );
      const stock = line.match(
        /(?:existencias?|stock|cantidad)\s*[:\-]?\s*(\d+)/i,
      );
      let name = line
        .split(/\s{2,}|\||;/)[0]
        .replace(/^\d+[.)-]?\s*/, "")
        .replace(/\$.*$/, "")
        .trim();
      if (dose && name.includes(dose[0]))
        name = name.slice(0, name.indexOf(dose[0])).trim();
      return {
        name,
        dose: dose?.[0] || "",
        presentation: pack?.[0] || "",
        brand: "Genérico",
        stock: stock?.[1] || "0",
        salePrice: price,
        selected: Boolean(name && price),
      };
    })
    .filter(
      (x) => x.name && !/^total|subtotal|inventario|medicamento$/i.test(x.name),
    )
    .slice(0, 200);
}
function InventoryImport({ reload }: { reload: () => Promise<void> }) {
  const [items, setItems] = useState<ImportItem[]>([]),
    [filename, setFilename] = useState(""),
    [state, setState] = useState("");
  const readFile = async (file: File) => {
    setState("Leyendo archivo…");
    setFilename(file.name);
    try {
      let text = "";
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() })
          .promise;
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n),
            content = await page.getTextContent();
          text +=
            (content.items as Array<{ str?: string }>)
              .map((x) => x.str || "")
              .join(" ") + "\n";
        }
      } else if (lower.endsWith(".docx")) {
        const mammoth = await import("mammoth/mammoth.browser");
        text = (
          await mammoth.extractRawText({
            arrayBuffer: await file.arrayBuffer(),
          })
        ).value;
      } else if (lower.endsWith(".txt") || lower.endsWith(".csv")) {
        text = await file.text();
      } else {
        throw new Error("Formato no compatible");
      }
      const parsed = parseInventoryText(text);
      setItems(parsed);
      setState(
        parsed.length
          ? `Se detectaron ${parsed.length} posibles registros. Revísalos antes de confirmar.`
          : "No se detectaron renglones de inventario. Verifica que el archivo contenga texto seleccionable y precios con $.",
      );
    } catch {
      setItems([]);
      setState(
        "No pudimos leer el archivo. Usa PDF con texto, Word .docx, TXT o CSV; los documentos escaneados requieren OCR.",
      );
    }
  };
  const edit = (i: number, k: keyof ImportItem, v: string | boolean) =>
    setItems((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const confirm = async () => {
    const selected = items.filter(
      (x) => x.selected && x.name && Number(x.salePrice) > 0,
    );
    if (!selected.length) {
      setState("Selecciona al menos un registro con nombre y precio válido.");
      return;
    }
    setState("Incorporando al inventario…");
    const r = await fetch("/api/inventory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: selected }),
    });
    if (r.ok) {
      setState(`${selected.length} registros incorporados correctamente.`);
      setItems([]);
      await reload();
    } else {
      const d = await r.json();
      setState(d.error || "No fue posible incorporar los registros.");
    }
  };
  return (
    <section className="importbox">
      <div className="importintro">
        <span>
          <Upload />
        </span>
        <div>
          <h2>Importar inventario desde archivo</h2>
          <p>
            Sube un PDF o Word. Nada se guarda hasta que revises y confirmes.
          </p>
        </div>
        <label className="uploadbutton">
          <FileText /> Seleccionar archivo
          <input
            type="file"
            accept=".pdf,.docx,.txt,.csv"
            onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
          />
        </label>
      </div>
      {filename && (
        <p className="importstatus">
          <b>{filename}</b> · {state}
        </p>
      )}
      {items.length > 0 && (
        <div className="review">
          <div className="reviewhead">
            <div>
              <h3>Revisión previa</h3>
              <p>
                Edita los datos y desmarca los renglones que no deseas importar.
              </p>
            </div>
            <button className="confirmimport" onClick={confirm}>
              <Check /> Confirmar e incorporar
            </button>
          </div>
          <div className="reviewtable">
            <div className="reviewrow reviewlabels">
              <span>INCLUIR</span>
              <span>MEDICAMENTO</span>
              <span>GRAMAJE</span>
              <span>PRESENTACIÓN</span>
              <span>MARCA</span>
              <span>EXISTENCIAS</span>
              <span>PRECIO</span>
            </div>
            {items.map((x, i) => (
              <div className="reviewrow" key={i}>
                <input
                  type="checkbox"
                  checked={x.selected}
                  onChange={(e) => edit(i, "selected", e.target.checked)}
                />
                <input
                  value={x.name}
                  onChange={(e) => edit(i, "name", e.target.value)}
                  aria-label="Medicamento"
                />
                <input
                  value={x.dose}
                  onChange={(e) => edit(i, "dose", e.target.value)}
                  placeholder="50 mg"
                />
                <input
                  value={x.presentation}
                  onChange={(e) => edit(i, "presentation", e.target.value)}
                  placeholder="30 tabletas"
                />
                <input
                  value={x.brand}
                  onChange={(e) => edit(i, "brand", e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  value={x.stock}
                  onChange={(e) => edit(i, "stock", e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={x.salePrice}
                  onChange={(e) => edit(i, "salePrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function UsersView() {
  const [users, setUsers] = useState<AppUser[]>([]),
    [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      role: "Empleado",
      status: "Activo",
    });
  const load = async () => {
    const r = await fetch("/api/users");
    if (r.ok) setUsers(await r.json());
  };
  useEffect(() => {
    load();
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Guardando…");
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (r.ok) {
      setMessage("Usuario agregado correctamente.");
      setForm({ name: "", email: "", password: "", role: "Empleado", status: "Activo" });
      setOpen(false);
      await load();
    } else setMessage(d.error || "No fue posible guardar.");
  };
  const toggle = async (u: AppUser) => {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: u.id,
        status: u.status === "Activo" ? "Inactivo" : "Activo",
      }),
    });
    await load();
  };
  const remove = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetch("/api/users?id=" + id, { method: "DELETE" });
    await load();
  };
  const changePassword = async (u: AppUser) => {
    const password = prompt(`Escribe la nueva contraseña para ${u.name} (mínimo 6 caracteres):`);
    if (password === null) return;
    const response = await fetch("/api/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: u.id, password }) });
    const result = await response.json();
    setMessage(response.ok ? `Contraseña actualizada para ${u.name}.` : result.error || "No fue posible cambiar la contraseña.");
    if (response.ok) await load();
  };
  return (
    <Panel title="Gestión de usuarios" sub="Administra accesos y permisos">
      <button className="add" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Plus />}
        {open ? " Cancelar" : " Nuevo usuario"}
      </button>
      {open && (
        <form className="userform" onSubmit={save}>
          <label>
            Nombre completo
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Correo electrónico
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Contraseña
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <label>
            Rol
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option>Empleado</option>
              <option>Administrador</option>
            </select>
          </label>
          <label>
            Estado
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </label>
          <button className="add" type="submit">
            <Check /> Guardar usuario
          </button>
        </form>
      )}
      {message && <p className="formmessage">{message}</p>}
      <div className="cards">
        {users.length ? (
          users.map((u) => (
            <div className="user" key={u.id}>
              <i>
                {u.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)}
              </i>
              <div>
                <b>{u.name}</b>
                <small>{u.email} · {u.hasPassword ? "Contraseña configurada" : "Sin contraseña"}</small>
              </div>
              <span>{u.role}</span>
              <button
                className={u.status === "Activo" ? "status on" : "status"}
                onClick={() => toggle(u)}
              >
                {u.status}
              </button>
              <button className="passworduser" onClick={() => changePassword(u)} aria-label={"Cambiar contraseña de " + u.name} title="Cambiar contraseña"><LockKeyhole /></button>
              <button
                className="deleteuser"
                onClick={() => remove(u.id)}
                aria-label={"Eliminar " + u.name}
              >
                <Trash2 />
              </button>
            </div>
          ))
        ) : (
          <div className="emptyusers">
            <Users />
            <b>No hay usuarios registrados</b>
            <p>Selecciona “Nuevo usuario” para agregar el primero.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}
function FarmsView() {
  const defaults: PharmacySource[] = farms.map((name, i) => ({
    sourceKey: name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-"),
    name,
    url: data[i]?.[7] || "https://www.google.com",
    active: true,
  }));
  const [sources, setSources] = useState(defaults),
    [editing, setEditing] = useState<PharmacySource | null>(null),
    [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/pharmacy-sources")
      .then((r) => (r.ok ? r.json() : []))
      .then((saved: PharmacySource[]) =>
        setSources(
          defaults.map(
            (d) => saved.find((s) => s.sourceKey === d.sourceKey) || d,
          ),
        ),
      )
      .catch(() => {});
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setMessage("Guardando…");
    const r = await fetch("/api/pharmacy-sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editing),
      }),
      body = await r.json();
    if (r.ok) {
      setSources((x) =>
        x.map((s) => (s.sourceKey === editing.sourceKey ? editing : s)),
      );
      setMessage("Configuración guardada.");
      setEditing(null);
    } else setMessage(body.error || "No fue posible guardar.");
  };
  return (
    <>
      <div className="pagehead">
        <div>
          <h3>Fuentes de consulta</h3>
          <p>Configura la dirección web y disponibilidad de cada farmacia</p>
        </div>
      </div>
      {message && <p className="sourcemessage">{message}</p>}
      <div className="farmgrid">
        {sources.map((f, i) => (
          <div
            className={"farm " + (!f.active ? "disabled" : "")}
            key={f.sourceKey}
          >
            <i style={{ background: data[i]?.[2] || "#147d71" }}>
              {data[i]?.[1] || f.name[0]}
            </i>
            <h3>{f.name}</h3>
            <p className="sourceurl">{f.url}</p>
            <span className={f.active ? "" : "off"}>
              {f.active ? "Activa" : "Inactiva"}
            </span>
            <button
              onClick={() => {
                setEditing({ ...f });
                setMessage("");
              }}
            >
              Configurar <ChevronRight />
            </button>
          </div>
        ))}
      </div>
      {editing && (
        <div
          className="sourcemodal"
          role="dialog"
          aria-modal="true"
          aria-label={"Configurar " + editing.name}
        >
          <form onSubmit={save}>
            <div className="sourcehead">
              <div>
                <small>FUENTE DE CONSULTA</small>
                <h2>Configurar {editing.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>
            <label>
              Nombre de la farmacia
              <input
                required
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>
            <label>
              Dirección web de búsqueda
              <input
                required
                type="url"
                value={editing.url}
                onChange={(e) =>
                  setEditing({ ...editing, url: e.target.value })
                }
                placeholder="https://..."
              />
              <small>
                Utiliza la dirección oficial donde se publican los medicamentos.
              </small>
            </label>
            <label className="sourceactive">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              <span>
                <b>Fuente activa</b>
                <small>
                  Se incluirá entre las farmacias disponibles para consultar.
                </small>
              </span>
            </label>
            <div className="sourceactions">
              <button type="button" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="add" type="submit">
                <Check /> Guardar configuración
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function Config() {
  return (
    <div className="config">
      <Panel
        title="Preferencias de búsqueda"
        sub="Comportamiento predeterminado"
      >
        <label>
          Máximo de referencias
          <select defaultValue="10">
            <option>5</option>
            <option>10</option>
            <option>20</option>
          </select>
        </label>
        <label>
          Orden predeterminado
          <select>
            <option>Menor a mayor</option>
            <option>Mayor a menor</option>
          </select>
        </label>
        <label>
          Guardar historial
          <input type="checkbox" defaultChecked />
        </label>
      </Panel>
      <Panel title="Información y seguridad" sub="Protección y avisos">
        <p className="securebox">
          <ShieldCheck />
          <span>
            <b>Sesiones protegidas</b>
            <br />
            El usuario debe identificarse antes de acceder.
          </span>
        </p>
        <p className="securebox">
          <Check />
          <span>
            <b>Aviso farmacológico activo</b>
            <br />
            La información se presenta como orientación.
          </span>
        </p>
        <button className="add">Guardar cambios</button>
      </Panel>
    </div>
  );
}
