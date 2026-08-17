import { useEffect } from "react";
import { useApp } from "../store";
import type { Tile } from "../types";
import { fmtCOP, fmtFecha } from "../types";
import { Icon } from "../components/icons";
import { Badge, CallBtn, SectionHead, StatCard } from "../components/ui";
import { TickerIndicadores, PanelIndicadores } from "../components/Indicadores";

const tileColor: Record<string, string> = {
  pine: "bg-pine-700 text-marigold-300",
  marigold: "bg-marigold-400 text-pine-900",
  coral: "bg-coral-600 text-white",
  blue: "bg-co-blue text-white",
  plum: "bg-[#7c4a6b] text-white",
  teal: "bg-teal-700 text-white",
  olive: "bg-[#6b7f3a] text-white",
  slate: "bg-ink text-marigold-300",
};

export default function Home({ go, anchor }: { go: (target: string) => void; anchor?: string | null }) {
  const { state, user, t, lang } = useApp();
  const cfg = state.config;

  useEffect(() => {
    if (anchor) {
      window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [anchor]);

  const loc = (es: string, en: string) => (lang === "en" ? en : es);
  const saludo = () => {
    const fecha = new Date().toLocaleDateString(lang === "es" ? "es-CO" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
  };

  const onTile = (tile: Tile) => {
    if (tile.url) { window.open(tile.url, "_blank", "noopener"); return; }
    go(tile.interno);
  };

  const categorias = [...new Set(cfg.enlaces.map((e) => e.categoria))];

  return (
    <div className="grid gap-10">
      {/* ------- Saludo + tasas ------- */}
      <section className="anim-rise relative overflow-hidden rounded-2xl bg-pine-800 px-6 py-7 sm:px-9 sm:py-8 text-white">
        <div className="tri-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden />
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border-[14px] border-pine-700/70" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-marigold-300 font-bold">{saludo()}</p>
            <h1 className="font-display text-4xl sm:text-5xl font-black mt-1">{t("hola")}, {user?.nombre.split(" ")[0]}</h1>
            <p className="mt-2 text-pine-100/90 max-w-lg">{cfg.eslogan}</p>
          </div>
        </div>
      </section>

      {/* ------- Indicadores del mercado (en vivo) ------- */}
      <section className="anim-rise d1 grid gap-5">
        <TickerIndicadores />
        <PanelIndicadores />
      </section>

      {/* ------- Cuadros de servicios ------- */}
      <section>
        <SectionHead icon="sparkle" title={t("queNecesitas")} sub={loc("Toca un cuadro para empezar. Los enlaces los configura tu encargado.", "Tap a card to start. Links are configured by your coordinator.")} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cfg.tiles.filter((x) => x.activo).map((tile, i) => (
            <button key={tile.id} onClick={() => onTile(tile)}
              className={`card card-hover group anim-rise flex flex-col items-start gap-4 p-5 text-left transition-transform duration-300 hover:-translate-y-1 ${tile.url ? "border-marigold-300" : ""}`}
              style={{ animationDelay: `${i * 55}ms` }}>
              <span className={`flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${tileColor[tile.color] ?? tileColor.pine}`}>
                <Icon n={tile.icon} size={30} />
              </span>
              <span className="font-display text-lg sm:text-xl font-bold leading-tight text-pine-900">
                {lang === "en" && tile.labelEn ? tile.labelEn : tile.label}
              </span>
              <span className="mt-auto flex items-center gap-1 text-sm font-black text-pine-600 group-hover:gap-2.5 transition-all">
                {tile.url ? loc("Sitio externo", "External site") : loc("Abrir", "Open")} <Icon n="arrowRight" size={16} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ------- Emergencia ------- */}
      <section>
        <SectionHead icon="siren" title={t("lineasEmergencia")} sub={loc("Un toque llama directo desde tu teléfono.", "One tap calls straight from your phone.")} />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="anim-rise rounded-2xl bg-coral-600 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-coral-500/60" aria-hidden />
            <p className="font-display text-2xl font-black">123</p>
            <p className="text-coral-100 font-bold">{loc("Línea nacional de emergencias", "National emergency line")}</p>
            <div className="mt-5"><CallBtn tel="123" label={t("llamar") + " 123"} size="lg" variant="dark" /></div>
          </div>
          <div className="card p-5 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              {cfg.numerosEmergencia.filter((n) => n.numero !== "123").map((n) => (
                <div key={n.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-black text-pine-900 truncate">{n.nombre}</p>
                    <p className="font-display text-xl font-black text-coral-700">{n.numero}</p>
                  </div>
                  <CallBtn tel={n.numero} label={t("llamar")} size="sm" variant="danger" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="card p-5">
            <h3 className="font-display text-xl font-bold text-pine-900 flex items-center gap-2 mb-4"><Icon n="heart" size={22} className="text-coral-600" /> {t("tusContactos")}</h3>
            <div className="grid gap-3">
              {(user?.contactos ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-paper border border-line px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-black text-pine-900 truncate">{c.nombre}</p>
                    <p className="text-sm text-muted">{c.parentesco} · {c.telefono}</p>
                  </div>
                  <CallBtn tel={c.telefono} label={t("llamar")} size="sm" />
                </div>
              ))}
              {(!user?.contactos.length) && <p className="text-muted">{t("sinDatos")}</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-xl font-bold text-pine-900 flex items-center gap-2 mb-4"><Icon n="medical" size={22} className="text-coral-600" /> {t("hospitalesCerca")}</h3>
            <ul className="grid gap-3">
              {cfg.hospitales.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-pine-900 leading-tight">{h.nombre}</p>
                    <p className="text-sm text-muted truncate">{h.direccion}</p>
                  </div>
                  <CallBtn tel={h.telefono} label={t("llamar")} size="sm" variant="soft" />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-xl font-bold text-pine-900 flex items-center gap-2 mb-4"><Icon n="shield" size={22} className="text-co-blue" /> {t("policiaCerca")}</h3>
            <ul className="grid gap-3">
              {cfg.policias.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-pine-900 leading-tight">{p.nombre}</p>
                    <p className="text-sm text-muted truncate">{p.direccion}</p>
                  </div>
                  <CallBtn tel={p.telefono} label={t("llamar")} size="sm" variant="outline" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------- Tarifas + seguridad ------- */}
      <section id="seguridad" className="scroll-mt-24">
        <SectionHead icon="wallet" title={t("tarifasServicios")} sub={loc("Precios claros en pesos colombianos (COP).", "Clear prices in Colombian pesos (COP).")} />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card overflow-hidden lg:col-span-2">
            <table className="w-full">
              <thead className="bg-pine-50 border-b border-line">
                <tr>
                  <th className="th">{loc("Servicio", "Service")}</th>
                  <th className="th text-right">{loc("Valor", "Price")}</th>
                  <th className="th hidden sm:table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {cfg.tarifas.map((tf, i) => (
                  <tr key={tf.id} className={`border-b border-line/70 transition-colors hover:bg-marigold-50/60 ${i % 2 ? "bg-paper/60" : ""}`}>
                    <td className="td font-bold text-pine-900">{lang === "en" ? tf.servicioEn : tf.servicio}</td>
                    <td className="td text-right font-display text-lg font-black text-pine-800 whitespace-nowrap">{fmtCOP(tf.precio)}</td>
                    <td className="td text-sm text-muted hidden sm:table-cell">{tf.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="anim-rise rounded-2xl bg-ink text-paper p-6 flex flex-col relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[14px] border-pine-800" aria-hidden />
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-marigold-400 text-pine-900"><Icon n="shield" size={30} /></span>
            <h3 className="mt-4 font-display text-2xl font-black text-white">{t("escoltasSeguridad")}</h3>
            <p className="mt-2 text-paper/80 flex-1">{t("escoltasDesc")}</p>
            <p className="mt-4 font-display text-3xl font-black text-marigold-300">{fmtCOP(cfg.tarifas.find((x) => x.id === "tf9")?.precio ?? 60000)}<span className="text-base text-paper/70 font-body font-bold"> / {loc("hora", "hour")}</span></p>
            <div className="mt-5"><CallBtn tel={cfg.telefonoContacto} label={loc("Solicitar ahora", "Request now")} size="lg" variant="accent" /></div>
          </div>
        </div>
      </section>

      {/* ------- Noticias + estadísticas ------- */}
      <section className="grid gap-8 xl:grid-cols-[1.25fr_1fr]">
        <div>
          <SectionHead icon="news" title={t("noticias")} />
          <div className="grid gap-4">
            {cfg.noticias.map((n, i) => (
              <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer"
                className="card card-hover anim-rise group flex gap-4 p-5 transition-transform hover:-translate-y-0.5" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-marigold-100 text-marigold-700 group-hover:bg-marigold-400 group-hover:text-pine-900 transition-colors">
                  <Icon n="news" size={24} />
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
                    <Badge tone="marigold" className="!text-xs">{n.fuente}</Badge> {fmtFecha(n.fecha)}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-pine-900 leading-snug group-hover:text-pine-700 group-hover:underline decoration-2 underline-offset-4">{n.titulo}</h3>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{n.resumen}</p>
                </div>
                <Icon n="arrowRight" size={20} className="ml-auto shrink-0 self-center text-pine-400 group-hover:text-pine-700 group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <SectionHead icon="shield" title={t("statsPolicia")} sub={t("statsNota")} />
          <div className="grid grid-cols-2 gap-4">
            {cfg.stats.map((s, i) => (
              <StatCard key={s.id} icon="activity" label={s.label} value={s.valor} tone={i % 2 ? "marigold" : "pine"} delay={i * 70} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted italic">{t("statsNota")}</p>

          <div className="card mt-6 p-5">
            <h3 className="font-display text-xl font-bold text-pine-900 flex items-center gap-2 mb-4"><Icon n="globe" size={22} className="text-pine-600" /> {t("enlacesInteres")}</h3>
            {categorias.map((cat) => (
              <div key={cat} className="mb-3 last:mb-0">
                <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {cfg.enlaces.filter((e) => e.categoria === cat).map((e) => (
                    <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer"
                      className="chip bg-pine-50 text-pine-800 border border-pine-200 hover:bg-pine-700 hover:text-white transition-colors">
                      <Icon n="arrowRight" size={14} /> {e.nombre}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
