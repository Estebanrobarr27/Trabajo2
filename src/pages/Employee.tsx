import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Emergencia, Errand } from "../types";
import { ahora, fmtFecha, fmtHora } from "../types";
import { Icon } from "../components/icons";
import { Avatar, Badge, Btn, CallBtn, Empty, EstadoPill, Input, SectionHead, Tabs } from "../components/ui";
import { ChatBox } from "./Errands";

/* ---------- Tarjeta de emergencia (compartida con el panel admin) ---------- */
export function EmergenciaCard({ e, puedeGestionar, delay = 0 }: { e: Emergencia; puedeGestionar: boolean; delay?: number }) {
  const { state, t, cambiarEstadoEmergencia, notaEmergencia, toast } = useApp();
  const [nota, setNota] = useState("");
  const persona = state.usuarios.find((u) => u.id === e.userId);
  const activa = e.estado === "Activa" || e.estado === "En atención";
  const flujo: Emergencia["estado"][] = ["Activa", "En atención", "Atendida", "Cerrada"];
  const sig = flujo[flujo.indexOf(e.estado) + 1];

  return (
    <article className={`anim-rise overflow-hidden rounded-xl border-2 ${activa ? "border-coral-300" : "border-line"} bg-white`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${activa ? "bg-coral-600 text-white" : "bg-paper"}`}>
        <p className={`font-display text-lg font-black flex items-center gap-2 ${activa ? "" : "text-pine-900"}`}>
          <Icon n="siren" size={22} /> {t("emergencias")}: {persona?.nombre ?? "Usuario"}
        </p>
        <Badge tone={e.estado === "Activa" ? "coral" : e.estado === "En atención" ? "marigold" : e.estado === "Atendida" ? "teal" : "gray"} className={activa ? "!bg-white !text-coral-700" : ""}>
          {e.estado}
        </Badge>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div className="grid gap-3 text-sm content-start">
          <p className="flex items-center gap-2"><Icon n="clock" size={17} className="text-muted" /> {fmtFecha(e.fecha)} · {fmtHora(e.fecha)}</p>
          <p className="flex items-center gap-2"><Icon n="pin" size={17} className="text-coral-600" /> {e.direccion || "Dirección no registrada"}</p>
          {e.ubicacion ? (
            <a className="flex items-center gap-2 font-bold text-pine-700 underline decoration-2 underline-offset-4 hover:text-pine-900"
              href={`https://www.google.com/maps?q=${e.ubicacion.lat},${e.ubicacion.lng}`} target="_blank" rel="noopener noreferrer">
              <Icon n="crosshair" size={17} /> {t("verEnMapa")} · GPS {e.ubicacion.precisa ? "exacto" : "aproximado"}
            </a>
          ) : (
            <p className="flex items-center gap-2 text-muted"><Icon n="crosshair" size={17} /> {t("sinUbicacion")}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <CallBtn tel={e.telefono} label={`${t("llamar")} ${persona?.nombre.split(" ")[0] ?? ""}`} size="sm" variant="danger" />
            <CallBtn tel="123" label="123" size="sm" variant="dark" />
          </div>
          {e.atendidoPor && <p className="text-muted"><strong>{t("atendidoPor")}:</strong> {e.atendidoPor}</p>}

          <div className="rounded-xl bg-paper border border-line p-3.5">
            <p className="lbl !mb-2 text-xs">{t("contactosNotificados")}</p>
            <div className="grid gap-2">
              {e.contactos.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <p className="text-sm"><strong>{c.nombre}</strong> <span className="text-muted">({c.parentesco})</span></p>
                  <CallBtn tel={c.telefono} label={t("llamar")} size="sm" variant="soft" />
                </div>
              ))}
              {e.contactos.length === 0 && <p className="text-sm text-muted">{t("sinDatos")}</p>}
            </div>
          </div>
        </div>

        <div className="content-start">
          <p className="lbl">{t("historialLbl")}</p>
          <ol className="relative grid gap-2.5 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-0.5 before:bg-coral-200 mb-4">
            {[...e.historial].reverse().map((hh, i) => (
              <li key={i} className="relative pl-7 text-sm">
                <span className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${i === 0 ? "bg-coral-500" : "bg-coral-300"}`} />
                <p className="text-muted text-xs">{fmtFecha(hh.fecha)} {fmtHora(hh.fecha)} · <strong className="text-ink">{hh.por}</strong></p>
                <p>{hh.nota}</p>
              </li>
            ))}
          </ol>
          {puedeGestionar && (
            <div className="grid gap-3">
              <div className="flex gap-2">
                <Input value={nota} onChange={(ev) => setNota(ev.target.value)} placeholder="Registrar observación…" aria-label={t("observaciones")}
                  onKeyDown={(ev) => { if (ev.key === "Enter" && nota.trim()) { notaEmergencia(e.id, nota.trim()); setNota(""); toast(t("guardar") + " ✓"); } }} />
                <Btn variant="soft" icon="check" onClick={() => { if (nota.trim()) { notaEmergencia(e.id, nota.trim()); setNota(""); toast(t("guardar") + " ✓"); } }} aria-label={t("guardar")} />
              </div>
              {sig && (
                <Btn variant={sig === "Cerrada" ? "outline" : "danger"} icon="arrowRight" onClick={() => { cambiarEstadoEmergencia(e.id, sig); toast(`${t("estado")}: ${sig}`, "ok"); }}>
                  {t("cambiarEstado")}: {sig}
                </Btn>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- Tarjeta de servicio para el empleado ---------- */
function ServicioCard({ m }: { m: Errand }) {
  const { state, t, cambiarEstadoMandado, reportarUbicacion, toast } = useApp();
  const [obs, setObs] = useState("");
  const cfg = state.config;
  const cliente = state.usuarios.find((u) => u.id === m.clientId);
  const idx = cfg.estadosMandado.indexOf(m.estado);
  const siguiente = idx >= 0 && idx < cfg.estadosMandado.length - 2 ? cfg.estadosMandado[idx + 1] : null;
  const esTerminal = ["COMPLETADO", "CANCELADO"].includes(m.estado);
  const gpsActivo = cfg.gpsHabilitado && !esTerminal;

  const reportar = () => {
    const fallback = () => {
      reportarUbicacion(m.id, { lat: 4.6534, lng: -74.0836, fecha: ahora(), precisa: false });
      toast(t("errorUbicacion"), "warn");
    };
    if (!navigator.geolocation) { fallback(); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        reportarUbicacion(m.id, { lat: pos.coords.latitude, lng: pos.coords.longitude, fecha: ahora(), precisa: true });
        toast("Ubicación compartida con el cliente ✓", "ok");
      },
      fallback,
      { timeout: 4000 },
    );
  };

  return (
    <article className="card card-hover anim-rise p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pine-700 text-marigold-300"><Icon n="briefcase" size={24} /></span>
          <div>
            <p className="font-display text-xl font-bold text-pine-900">{m.tipo}</p>
            <p className="text-sm text-muted">{fmtFecha(m.fecha + "T12:00:00")} · {m.hora} · {m.establecimiento || "—"}</p>
          </div>
        </div>
        <EstadoPill estado={m.estado} />
      </div>

      <div className="mt-4 rounded-xl bg-paper border border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar nombre={cliente?.nombre ?? "?"} size={40} />
            <div>
              <p className="font-black text-pine-900">{cliente?.nombre ?? "Cliente"}</p>
              <p className="text-sm text-muted flex items-center gap-1"><Icon n="pin" size={14} /> {m.dirEntrega}</p>
            </div>
          </div>
          {cliente && <CallBtn tel={cliente.telefono} label={t("llamar")} size="sm" variant="accent" />}
        </div>
        {m.instrucciones && (
          <p className="mt-3 rounded-lg bg-marigold-50 border border-marigold-200 px-3 py-2 text-sm"><strong className="text-marigold-800">{t("instruccionesEspeciales")}:</strong> {m.instrucciones}</p>
        )}
        {m.productos.length > 0 && (
          <ul className="mt-3 grid gap-1 text-sm">
            {m.productos.map((p, i) => (
              <li key={i} className="flex items-center gap-2"><Icon n="check" size={14} className="text-pine-600" /> {p.nombre} — {p.cantidad}{p.marca ? ` · ${p.marca}` : ""}</li>
            ))}
          </ul>
        )}
      </div>

      {!esTerminal && (
        <div className="mt-4 flex flex-wrap gap-2">
          {siguiente && (
            <Btn icon="arrowRight" size="lg" variant={siguiente === "COMPLETADO" ? "accent" : "primary"}
              onClick={() => { cambiarEstadoMandado(m.id, siguiente); toast(`${t("estado")}: ${siguiente}`, "ok"); }}>
              {t("avanzarEstado")}: {siguiente}
            </Btn>
          )}
          {gpsActivo && <Btn icon="crosshair" size="lg" variant="outline" onClick={reportar}>{t("compartirUbicacion")}</Btn>}
        </div>
      )}

      {!esTerminal && (
        <div className="mt-4 flex gap-2">
          <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder={t("observacionServicio")} aria-label={t("observacionServicio")}
            onKeyDown={(e) => { if (e.key === "Enter" && obs.trim()) { cambiarEstadoMandado(m.id, m.estado, obs.trim()); setObs(""); toast(t("guardar") + " ✓"); } }} />
          <Btn variant="soft" onClick={() => { if (obs.trim()) { cambiarEstadoMandado(m.id, m.estado, obs.trim()); setObs(""); toast(t("guardar") + " ✓"); } }} aria-label={t("guardarObservacion")}>
            {t("guardar")}
          </Btn>
        </div>
      )}

      <div className="mt-4"><ChatBox mandado={m} /></div>
    </article>
  );
}

/* ---------- Vista principal del empleado ---------- */
export default function Employee() {
  const { state, user, t, actualizarUsuario, aprobarUsuario, rechazarUsuario, toast } = useApp();
  const [tab, setTab] = useState("servicios");

  const mios = useMemo(() => state.mandados.filter((m) => m.empleadoId === user?.id), [state.mandados, user]);
  const activos = mios.filter((m) => !["COMPLETADO", "CANCELADO"].includes(m.estado));
  const cerrados = mios.filter((m) => ["COMPLETADO", "CANCELADO"].includes(m.estado));
  const emergencias = useMemo(
    () => [...state.emergencias].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [state.emergencias],
  );
  const pendientes = state.usuarios.filter((u) => u.estado === "pendiente");
  const DISP = ["Disponible", "Ocupado", "Fuera de servicio", "En descanso"];

  const tabs = [
    { id: "servicios", label: `${t("servicios")} (${activos.length})`, icon: "clipboard" },
    { id: "emergencias", label: t("emergencias"), icon: "siren" },
  ];

  return (
    <div>
      <SectionHead icon="clipboard" title={t("misServicios")} sub={`${user?.nombre} · ${user?.cargo}`} />

      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <p className="font-black text-pine-900 flex items-center gap-2 mr-2"><Icon n="clock" size={20} className="text-pine-600" /> {t("disponibilidad")}:</p>
        {DISP.map((d) => (
          <button key={d} onClick={() => { actualizarUsuario(user?.id ?? "", { disponibilidad: d }); toast(`${t("disponibilidad")}: ${d}`, "ok"); }}
            className={`chip border-2 transition-all ${user?.disponibilidad === d ? "bg-pine-700 text-white border-pine-700" : "bg-white text-pine-800 border-line hover:border-pine-400"}`}>
            {d}
          </button>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-6 grid gap-5">
        {tab === "servicios" && (
          <>
            {activos.length === 0 && <Empty icon="clipboard" text={t("sinServicios")} />}
            {activos.map((m) => <ServicioCard key={m.id} m={m} />)}
            {cerrados.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-black uppercase tracking-widest text-muted">{t("serviciosCompletados")} ({cerrados.length})</p>
                <div className="grid gap-3">
                  {cerrados.slice(0, 6).map((m) => {
                    const cli = state.usuarios.find((u) => u.id === m.clientId);
                    return (
                      <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                        <p className="font-bold text-pine-900">{m.tipo} · <span className="text-muted font-normal">{cli?.nombre}</span></p>
                        <div className="flex items-center gap-3"><span className="text-sm text-muted">{fmtFecha(m.fecha + "T12:00:00")}</span><EstadoPill estado={m.estado} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        {tab === "emergencias" && (
          <>
            {emergencias.length === 0 && <Empty icon="siren" text={t("sinDatos")} />}
            {emergencias.map((e, i) => <EmergenciaCard key={e.id} e={e} puedeGestionar delay={i * 60} />)}
          </>
        )}
      </div>

      {/* Aprobaciones rápidas (solo encargados) */}
      {user?.rol === "encargado" && (
        <div className="mt-10">
          <SectionHead icon="users" title={t("aprobaciones")} sub="Los registros nuevos deben aprobarse antes de ingresar." />
          {pendientes.length === 0 ? <Empty icon="check" text="No hay solicitudes pendientes. ¡Buen trabajo!" /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendientes.map((u) => (
                <div key={u.id} className="card p-5 border-marigold-300">
                  <div className="flex items-center gap-3">
                    <Avatar nombre={u.nombre} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold text-pine-900 truncate">{u.nombre}</p>
                      <p className="text-sm text-muted truncate">{u.email} · {u.telefono}</p>
                    </div>
                    <Badge tone="marigold">{t("pendiente")}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {u.tipoId} {u.numeroId} · {u.ciudad}, {u.pais} · RH {u.rh || "—"}
                    {u.enfermedadesAtencion && <> · <strong className="text-coral-700">{u.enfermedadesAtencion}</strong></>}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Btn icon="check" onClick={() => { aprobarUsuario(u.id); toast(`${u.nombre}: cuenta aprobada ✓`); }}>{t("aprobar")}</Btn>
                    <Btn variant="outline" icon="x" className="text-coral-700" onClick={() => { rechazarUsuario(u.id); toast(t("rechazar") + " ✓", "warn"); }}>{t("rechazar")}</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
