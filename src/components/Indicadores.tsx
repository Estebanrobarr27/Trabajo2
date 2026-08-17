import { useCallback, useEffect, useState } from "react";
import { useApp } from "../store";
import { Icon } from "./icons";

/* ============================================================
   Indicadores de mercado (dólar, euro, Bitcoin, oro, índices).
   Datos en vivo de APIs públicas gratuitas y sin credenciales:
   - Tasas de cambio: open.er-api.com (USD → todas las monedas)
   - Bitcoin y oro (PAXG): api.coingecko.com
   Los índices (COLCAP, S&P 500) son referenciales: los define el
   superadministrador en Configuración → Plataforma.
   Si no hay conexión, se usan los valores de referencia configurados.
   ============================================================ */

export interface Indicador {
  id: string;
  nombre: string;
  nombreEn: string;
  valor: number;
  unidad: "cop" | "usd" | "pts";
  variacion: number | null;
  notaVar: string | null;
  vivo: boolean;
  icono: string;
}

interface DatosVivos {
  usd: number | null;
  eur: number | null;
  btc: number | null;
  btcVar: number | null;
  oro: number | null;
  oroVar: number | null;
}

const conTimeout = (url: string, ms = 7000) => {
  const ctrl = new AbortController();
  const to = window.setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => window.clearTimeout(to));
};

const redondear = (n: number) => Math.round(n * 100) / 100;

async function traerVivos(): Promise<DatosVivos> {
  const r: DatosVivos = { usd: null, eur: null, btc: null, btcVar: null, oro: null, oroVar: null };
  try {
    const res = await conTimeout("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const j = (await res.json()) as { rates?: Record<string, number> };
      const cop = j.rates?.COP;
      const eur = j.rates?.EUR;
      if (cop) r.usd = Math.round(cop);
      if (cop && eur) r.eur = Math.round(cop / eur);
    }
  } catch { /* sin conexión: se usan valores de referencia */ }
  try {
    const res = await conTimeout(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_24hr_change=true",
    );
    if (res.ok) {
      const j = (await res.json()) as {
        bitcoin?: { usd?: number; usd_24h_change?: number };
        "pax-gold"?: { usd?: number; usd_24h_change?: number };
      };
      if (j.bitcoin?.usd) { r.btc = j.bitcoin.usd; r.btcVar = j.bitcoin.usd_24h_change ?? null; }
      if (j["pax-gold"]?.usd) { r.oro = j["pax-gold"].usd; r.oroVar = j["pax-gold"].usd_24h_change ?? null; }
    }
  } catch { /* sin conexión: se ocultan los indicadores cripto */ }
  return r;
}

export function useIndicadores() {
  const { state } = useApp();
  const cfg = state.config;
  const [vivos, setVivos] = useState<DatosVivos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizado, setActualizado] = useState<Date | null>(null);

  const refrescar = useCallback(async () => {
    setCargando(true);
    const d = await traerVivos();
    setVivos(d);
    setActualizado(new Date());
    setCargando(false);
  }, []);

  useEffect(() => {
    void refrescar();
    const iv = window.setInterval(() => void refrescar(), 5 * 60 * 1000);
    return () => window.clearInterval(iv);
  }, [refrescar]);

  const pct = (vivo: number, ref: number) => (ref > 0 ? redondear(((vivo - ref) / ref) * 100) : null);
  const aNumero = (s: string | undefined) => Number(String(s ?? "").replace(/\./g, "").replace(",", ".")) || 0;

  const lista: Indicador[] = [
    {
      id: "usd", icono: "dollar", nombre: "Dólar (TRM)", nombreEn: "Dollar (TRM)", unidad: "cop",
      valor: vivos?.usd ?? cfg.tasaUSD,
      variacion: vivos?.usd ? pct(vivos.usd, cfg.tasaUSD) : null,
      notaVar: "vs. ref", vivo: !!vivos?.usd,
    },
    {
      id: "eur", icono: "euro", nombre: "Euro", nombreEn: "Euro", unidad: "cop",
      valor: vivos?.eur ?? cfg.tasaEUR,
      variacion: vivos?.eur ? pct(vivos.eur, cfg.tasaEUR) : null,
      notaVar: "vs. ref", vivo: !!vivos?.eur,
    },
    {
      id: "colcap", icono: "chart", nombre: "COLCAP (Colombia)", nombreEn: "COLCAP (Colombia)", unidad: "pts",
      valor: aNumero(cfg.colcap), variacion: null, notaVar: null, vivo: false,
    },
    {
      id: "sp500", icono: "activity", nombre: "S&P 500", nombreEn: "S&P 500", unidad: "pts",
      valor: aNumero(cfg.sp500), variacion: null, notaVar: null, vivo: false,
    },
  ];
  if (vivos?.btc) lista.splice(2, 0, {
    id: "btc", icono: "btc", nombre: "Bitcoin", nombreEn: "Bitcoin", unidad: "usd",
    valor: vivos.btc, variacion: vivos.btcVar !== null ? redondear(vivos.btcVar) : null,
    notaVar: "24 h", vivo: true,
  });
  if (vivos?.oro) lista.splice(3, 0, {
    id: "oro", icono: "gold", nombre: "Oro (oz)", nombreEn: "Gold (oz)", unidad: "usd",
    valor: vivos.oro, variacion: vivos.oroVar !== null ? redondear(vivos.oroVar) : null,
    notaVar: "24 h", vivo: true,
  });

  return { lista, cargando, actualizado, refrescar };
}

/* ---------- Formato por idioma ---------- */
const fmtValor = (i: Indicador, lang: string) => {
  const locale = lang === "es" ? "es-CO" : "en-US";
  if (i.unidad === "cop") return "$ " + new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(i.valor);
  if (i.unidad === "usd") return "US$ " + new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(i.valor);
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(i.valor) + " pts";
};

const VarChip = ({ i, lang }: { i: Indicador; lang: string }) => {
  if (i.variacion === null) return null;
  const up = i.variacion >= 0;
  const locale = lang === "es" ? "es-CO" : "en-US";
  const txt = (up ? "+" : "") + new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(i.variacion) + "%";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${up ? "bg-pine-100 text-pine-800" : "bg-coral-100 text-coral-800"}`}>
      <span className="text-[9px]" aria-hidden>{up ? "▲" : "▼"}</span>
      {txt}
      {i.notaVar && <span className="font-bold opacity-70">· {i.notaVar}</span>}
    </span>
  );
};

/* ---------- Franja de cotización en movimiento ---------- */
export function TickerIndicadores() {
  const { lista } = useIndicadores();
  const { lang } = useApp();
  const linea = (prefijo: string) => (
    <div className="flex shrink-0 items-center" aria-hidden={prefijo === "b"}>
      {lista.map((i) => (
        <span key={prefijo + i.id} className="mx-5 inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold">
          <Icon n={i.icono} size={15} className="text-marigold-300" />
          <span className="text-pine-100">{lang === "en" ? i.nombreEn : i.nombre}</span>
          <span className="font-display text-base font-black text-white">{fmtValor(i, lang)}</span>
          {i.variacion !== null && (
            <span className={`text-xs font-black ${i.variacion >= 0 ? "text-pine-300" : "text-coral-300"}`}>
              {i.variacion >= 0 ? "▲" : "▼"}{Math.abs(i.variacion).toFixed(2)}%
            </span>
          )}
          <span className="mx-3 h-1 w-1 rounded-full bg-pine-600" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker-wrap relative overflow-hidden rounded-xl bg-pine-900 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" role="marquee" aria-label="Indicadores del mercado">
      <div className="ticker-track flex w-max">{linea("a")}{linea("b")}</div>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-pine-900 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-pine-900 to-transparent" aria-hidden />
    </div>
  );
}

/* ---------- Panel de tarjetas ---------- */
export function PanelIndicadores() {
  const { lista, cargando, actualizado, refrescar } = useIndicadores();
  const { lang, t } = useApp();
  const loc = (es: string, en: string) => (lang === "es" ? es : en);
  const hora = actualizado?.toLocaleTimeString(lang === "es" ? "es-CO" : "en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-700 text-marigold-300"><Icon n="dollar" size={22} /></span>
          <div>
            <h2 className="font-display text-2xl font-bold text-pine-900 leading-tight flex items-center gap-2.5">
              {loc("Indicadores del mercado", "Market indicators")}
              <span className="chip !px-2.5 !py-0.5 !text-[11px] bg-pine-100 text-pine-800">
                <span className={`h-2 w-2 rounded-full ${cargando ? "bg-marigold-500" : "bg-pine-500"} blink-dot`} />
                {cargando ? loc("CONSULTANDO…", "LOADING…") : loc("EN VIVO", "LIVE")}
              </span>
            </h2>
            <p className="text-sm text-muted">{loc("Dólar, euro, materias primas y acciones clave.", "Dollar, euro, commodities and key stocks.")}</p>
          </div>
        </div>
        <button onClick={() => void refrescar()}
          className="inline-flex items-center gap-2 rounded-full border-2 border-pine-200 bg-white px-4 py-2 font-bold text-pine-800 transition-all hover:border-pine-500 hover:bg-pine-50 active:scale-95">
          <Icon n="refresh" size={17} className={cargando ? "animate-spin" : ""} /> {t("actualizarLbl")}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {lista.map((i, idx) => (
          <article key={i.id} className="card card-hover group relative overflow-hidden p-4 anim-rise" style={{ animationDelay: `${idx * 60}ms` }}>
            <span className="absolute -right-4 -top-4 text-pine-50 transition-colors duration-300 group-hover:text-marigold-100">
              <Icon n={i.icono} size={84} sw={1.1} />
            </span>
            <div className="relative">
              <p className="text-[13px] font-black uppercase tracking-wide text-muted">{lang === "en" ? i.nombreEn : i.nombre}</p>
              {cargando && !actualizado ? (
                <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-pine-100" />
              ) : (
                <p className="font-display text-[1.45rem] font-black text-pine-900 leading-tight mt-1 tabular-nums">{fmtValor(i, lang)}</p>
              )}
              <div className="mt-2 flex min-h-[24px] items-center gap-2">
                <VarChip i={i} lang={lang} />
                {!i.vivo && <span className="rounded-full bg-paper border border-line px-2.5 py-1 text-[11px] font-black text-muted">{loc("REFERENCIAL", "REFERENCE")}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <Icon n="clock" size={14} />
        {loc("Actualizado", "Updated")} {hora ?? "—"}.
        {loc(
          "Tasas y cripto en vivo (open.er-api.com · CoinGecko); índices referenciales configurados por el administrador. Sin conexión se muestran los valores de referencia.",
          "Live FX & crypto (open.er-api.com · CoinGecko); reference indexes set by the administrator. Offline, reference values are shown.",
        )}
      </p>
    </div>
  );
}
