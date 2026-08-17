import { Component, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AppProvider, useApp } from "./store";
import type { Idioma, Ubicacion } from "./types";
import { ahora, fmtFecha, fmtHora } from "./types";
import { Icon } from "./components/icons";
import { Avatar, Badge, Btn, CallBtn, Logo } from "./components/ui";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Errands from "./pages/Errands";
import Health from "./pages/Health";
import Garage from "./pages/Garage";
import Employee from "./pages/Employee";
import Admin from "./pages/Admin";
import Drivers from "./pages/Drivers";

/* ---------- Utilidad: ubicación GPS con tolerancia a fallos ---------- */
const getUbi = (): Promise<Ubicacion | null> =>
  new Promise((res) => {
    if (!navigator.geolocation) { res(null); return; }
    const to = window.setTimeout(() => res(null), 3500);
    navigator.geolocation.getCurrentPosition(
      (p) => { window.clearTimeout(to); res({ lat: p.coords.latitude, lng: p.coords.longitude, fecha: ahora(), precisa: true }); },
      () => { window.clearTimeout(to); res(null); },
      { timeout: 3000 },
    );
  });

/* ---------- Botón de pánico: flujo completo ---------- */
function PanicOverlay({ onClose }: { onClose: () => void }) {
  const { t, activarEmergencia, user } = useApp();
  const [fase, setFase] = useState<"cuenta" | "enviando" | "listo">("cuenta");
  const [n, setN] = useState(3);
  const [gpsOk, setGpsOk] = useState(true);
  const cancelado = useRef(false);

  useEffect(() => {
    if (fase !== "cuenta") return;
    if (n <= 0) { void activar(); return; }
    const to = window.setTimeout(() => setN((v) => v - 1), 1000);
    return () => window.clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, fase]);

  const activar = async () => {
    setFase("enviando");
    const ubi = await getUbi();
    if (cancelado.current) return;
    setGpsOk(!!ubi);
    activarEmergencia(ubi);
    setFase("listo");
  };

  if (fase === "cuenta") {
    return (
      <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-coral-700 px-6 text-center text-white">
        <span className="panic-pulse flex h-28 w-28 items-center justify-center rounded-full bg-coral-600 border-4 border-white/40"><Icon n="siren" size={56} sw={2.1} /></span>
        <p className="font-display text-3xl sm:text-4xl font-black">{t("cuentaRegresiva")}</p>
        <p key={n} className="count-pulse font-display text-[8rem] sm:text-[10rem] font-black leading-none text-marigold-300">{Math.max(n, 1)}</p>
        <p className="text-xl font-bold text-coral-100">{t("pulsaCancelar")}</p>
        <Btn variant="dark" size="xl" icon="x" onClick={() => { cancelado.current = true; onClose(); }} className="!px-14 !text-2xl">
          {t("cancelar").toUpperCase()}
        </Btn>
      </div>
    );
  }

  if (fase === "enviando") {
    return (
      <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-coral-800 px-6 text-center text-white">
        <span className="panic-pulse flex h-28 w-28 items-center justify-center rounded-full bg-coral-600"><Icon n="siren" size={56} /></span>
        <p className="font-display text-3xl font-black">{t("enviandoAyuda")}</p>
        <p className="text-coral-100 font-bold flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-white blink-dot" /> GPS · 123 · {t("tusContactos")}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-pine-800 px-6 text-center text-white overflow-y-auto py-10">
      <span className="anim-pop flex h-28 w-28 items-center justify-center rounded-full bg-marigold-400 text-pine-900"><Icon n="check" size={60} sw={2.4} /></span>
      <p className="font-display text-4xl sm:text-5xl font-black anim-rise">{t("ayudaEnCamino")}</p>
      <p className="max-w-lg text-lg text-pine-100 anim-rise d1">{t("emergenciaActivadaDesc")}</p>
      <div className="anim-rise d2 grid w-full max-w-md gap-2 rounded-2xl bg-pine-700/70 border border-pine-600 p-5 text-left">
        <p className="flex items-center gap-2 font-bold"><Icon n="user" size={19} className="text-marigold-300" /> {user?.nombre}</p>
        <p className="flex items-center gap-2 font-bold"><Icon n="phone" size={19} className="text-marigold-300" /> {user?.telefono}</p>
        <p className="flex items-center gap-2 font-bold"><Icon n="pin" size={19} className="text-marigold-300" /> {user?.direccion || "Dirección no registrada"}</p>
        {!gpsOk && <p className="mt-1 rounded-lg bg-marigold-400/20 border border-marigold-400/40 px-3 py-2 text-sm font-bold text-marigold-200">{t("errorUbicacion")}</p>}
      </div>
      <div className="anim-rise d3 flex flex-wrap justify-center gap-3">
        <CallBtn tel="123" label={t("llamar123")} size="xl" variant="danger" />
        <Btn variant="accent" size="xl" icon="check" onClick={onClose}>{t("cerrar")}</Btn>
      </div>
    </div>
  );
}

function PanicFab({ onClick }: { onClick: () => void }) {
  const { t } = useApp();
  return (
    <button
      onClick={onClick} aria-label={t("botonPanico")}
      className="panic-pulse fixed bottom-24 right-4 z-[70] flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full bg-coral-600 text-white shadow-lift transition-transform duration-200 hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
    >
      <Icon n="siren" size={34} sw={2.1} />
      <span className="text-xs font-black tracking-widest">{t("botonPanico")}</span>
    </button>
  );
}

/* ---------- Campana de notificaciones ---------- */
const TIPO_ESTILO: Record<string, string> = {
  info: "bg-blue-100 text-blue-700", exito: "bg-pine-100 text-pine-700",
  alerta: "bg-marigold-100 text-marigold-700", emergencia: "bg-coral-100 text-coral-700",
};
const TIPO_ICON: Record<string, string> = { info: "bell", exito: "check", alerta: "clock", emergencia: "siren" };

function Bell() {
  const { state, user, t, lang, marcarNotifsLeidas } = useApp();
  const [open, setOpen] = useState(false);
  const mias = state.notificaciones.filter((x) => x.para === user?.id);
  const noLeidas = mias.filter((x) => !x.leida).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label={t("notificaciones")}
        className="relative rounded-full p-2.5 text-pine-800 hover:bg-pine-50 transition-colors">
        <Icon n="bell" size={24} />
        {noLeidas > 0 && (
          <span className="anim-pop absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-600 px-1 text-[11px] font-black text-white">
            {noLeidas}
          </span>
        )}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label={t("cerrar")} />
          <div className="anim-pop absolute right-0 z-50 mt-2 w-[min(92vw,26rem)] overflow-hidden rounded-xl border border-line bg-card shadow-lift">
            <div className="flex items-center justify-between border-b border-line bg-pine-50 px-4 py-3">
              <p className="font-display text-lg font-bold text-pine-900">{t("notificaciones")}</p>
              <Btn size="sm" variant="soft" icon="check" onClick={() => marcarNotifsLeidas()}>{lang === "es" ? "Marcar leídas" : "Mark read"}</Btn>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {mias.length === 0 && <p className="px-5 py-8 text-center text-muted font-bold">{t("sinDatos")}</p>}
              {mias.slice(0, 15).map((x) => (
                <div key={x.id} className={`flex gap-3 border-b border-line/60 px-4 py-3.5 ${x.leida ? "opacity-65" : "bg-marigold-50/50"}`}>
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TIPO_ESTILO[x.tipo]}`}>
                    <Icon n={TIPO_ICON[x.tipo]} size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-pine-900 leading-tight">{x.titulo}</p>
                    <p className="text-sm text-muted">{x.cuerpo}</p>
                    <p className="mt-1 text-xs font-bold text-muted">{fmtFecha(x.fecha)} · {fmtHora(x.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Avisos flotantes ---------- */
function Toasts() {
  const { toasts } = useApp();
  const color: Record<string, string> = {
    ok: "bg-pine-700 text-white", warn: "bg-marigold-400 text-pine-900", error: "bg-coral-600 text-white",
  };
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[95] grid w-max max-w-[92vw] -translate-x-1/2 gap-2 lg:bottom-8">
      {toasts.map((x) => (
        <p key={x.id} className={`anim-pop rounded-full px-5 py-3 text-center font-bold shadow-lift ${color[x.tipo]}`}>{x.msg}</p>
      ))}
    </div>
  );
}

/* ---------- Estructura principal ---------- */
function Shell() {
  const { state, user, t, lang, setLang, logout } = useApp();
  const [view, setView] = useState("inicio");
  const [presetTipo, setPresetTipo] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [panic, setPanic] = useState(false);

  useEffect(() => {
    setView("inicio"); setPresetTipo(null); setAnchor(null); setPanic(false);
    window.scrollTo(0, 0);
  }, [user?.id]);

  if (!user) return <Landing />;

  const esClienteOa = user.rol === "cliente" || user.rol === "familiar";

  const go = (target: string) => {
    if (target.startsWith("mandado:")) { setPresetTipo(target.slice(7)); setView("mandados"); }
    else if (target === "seguridad") { setView("inicio"); setAnchor("seguridad"); }
    else { setPresetTipo(null); setAnchor(null); setView(target); }
    window.scrollTo({ top: 0 });
  };

  const nav = [
    { id: "inicio", icon: "home", lbl: t("inicio") },
    { id: "mandados", icon: "briefcase", lbl: t("mandados") },
    { id: "salud", icon: "medical", lbl: t("salud") },
    { id: "ventas", icon: "tag", lbl: t("ventas") },
  ];

  const activas = state.emergencias.filter((e) => e.estado === "Activa" || e.estado === "En atención");
  const rolNombre: Record<string, string> = {
    superadmin: t("rolSuperadmin"), encargado: "Encargado", empleado: t("rolEmpleado"),
    cliente: t("rolCliente"), familiar: t("rolFamiliar"),
  };

  const contenido = () => {
    if (!esClienteOa) {
      if (user.rol === "empleado") return <Employee />;
      return <Admin mode={user.rol === "superadmin" ? "super" : "encargado"} />;
    }
    switch (view) {
      case "mandados": return <Errands presetTipo={presetTipo} />;
      case "salud": return <Health />;
      case "ventas": return <Garage />;
      case "conductores": return <Drivers />;
      default: return <Home go={go} anchor={anchor} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Encabezado */}
      <header className="sticky top-0 z-[60]">
        <div className="tri-stripe h-1.5" aria-hidden />
        <div className="border-b border-line bg-white/95 backdrop-blur px-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 py-2.5">
            <button onClick={() => go("inicio")} aria-label={t("inicio")}><Logo size="sm" /></button>
            <div className="flex items-center gap-1 sm:gap-2.5">
              <Badge tone="pine" className="hidden sm:inline-flex">{rolNombre[user.rol]}</Badge>
              <div className="flex rounded-full border-2 border-pine-200 bg-white p-0.5" role="group" aria-label={t("idiomaLbl")}>
                {(["es", "en"] as Idioma[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`rounded-full px-2.5 py-1 text-xs font-black uppercase transition-colors ${lang === l ? "bg-pine-700 text-white" : "text-pine-700 hover:bg-pine-50"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <Bell />
              <div className="hidden md:flex items-center gap-2.5 border-l border-line pl-3">
                <Avatar nombre={user.nombre} size={38} />
                <div className="leading-tight">
                  <p className="text-sm font-black text-pine-900">{user.nombre}</p>
                  <p className="text-xs text-muted">{user.ciudad}</p>
                </div>
              </div>
              <button onClick={logout} aria-label={t("salir")} title={t("salir")}
                className="rounded-full p-2.5 text-coral-700 hover:bg-coral-50 transition-colors">
                <Icon n="logout" size={22} />
              </button>
            </div>
          </div>
          {esClienteOa && (
            <nav className="mx-auto hidden max-w-7xl gap-1.5 pb-2.5 md:flex" aria-label="Principal">
              {nav.map((x) => (
                <button key={x.id} onClick={() => go(x.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold transition-colors ${view === x.id ? "bg-pine-700 text-white" : "text-pine-800 hover:bg-pine-50"}`}>
                  <Icon n={x.icon} size={18} /> {x.lbl}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Alerta de emergencias activas (personal) */}
      {!esClienteOa && activas.length > 0 && (
        <div className="border-b-2 border-coral-700 bg-coral-600 px-4 py-2.5 text-white">
          <p className="mx-auto flex max-w-7xl items-center gap-2.5 font-black">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-coral-700"><Icon n="siren" size={16} /></span>
            {activas.length} {t("emergencias").toLowerCase()} {activas.length === 1 ? "activa" : "activas"} — revísalas en la pestaña {t("emergencias")}.
          </p>
        </div>
      )}

      {/* Contenido */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:pb-16 pb-32">
        {contenido()}

        {esClienteOa && (
          <footer className="anim-rise mt-14 overflow-hidden rounded-2xl bg-pine-800 text-white">
            <div className="tri-stripe h-1.5" aria-hidden />
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <Logo dark size="sm" />
                <p className="text-sm text-pine-200 max-w-xs">{state.config.eslogan}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                <span className="flex items-center gap-2"><Icon n="pin" size={17} className="text-marigold-300" /> {state.config.ciudad}</span>
                <span className="flex items-center gap-2"><Icon n="mail" size={17} className="text-marigold-300" /> {state.config.emailContacto}</span>
                <CallBtn tel={state.config.telefonoContacto} label={state.config.telefonoContacto} size="sm" variant="accent" />
              </div>
            </div>
          </footer>
        )}
      </main>

      {/* Navegación móvil */}
      {esClienteOa && (
        <nav className="fixed inset-x-0 bottom-0 z-[60] border-t-2 border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Principal">
          <div className="grid grid-cols-4">
            {nav.map((x) => (
              <button key={x.id} onClick={() => go(x.id)}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-black transition-colors ${view === x.id ? "text-pine-700" : "text-muted"}`}>
                <span className={`rounded-xl px-3.5 py-1 transition-colors ${view === x.id ? "bg-pine-100" : ""}`}><Icon n={x.icon} size={22} /></span>
                {x.lbl}
              </button>
            ))}
          </div>
        </nav>
      )}

      {esClienteOa && <PanicFab onClick={() => setPanic(true)} />}
      {panic && <PanicOverlay onClose={() => setPanic(false)} />}
    </div>
  );
}

/* ---------- Red de seguridad: nunca una pantalla en blanco ---------- */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-paper px-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-coral-100 text-coral-700">
            <Icon n="alert" size={40} />
          </span>
          <h1 className="font-display text-3xl font-black text-pine-900">Algo salió mal</h1>
          <p className="max-w-md text-muted font-bold">
            La aplicación encontró un error inesperado. Recarga la página para continuar;
            tu información guardada está segura.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-pine-700 px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Icon n="refresh" size={22} /> Recargar aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Shell />
        <Toasts />
      </AppProvider>
    </ErrorBoundary>
  );
}
