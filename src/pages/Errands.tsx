import { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import type { Errand, Mensaje, Producto } from "../types";
import { diasDesdeHoy, fmtFecha, fmtHora, fmtCOP } from "../types";
import { Icon } from "../components/icons";
import { Avatar, Badge, Btn, CallBtn, Empty, EstadoPill, Field, Input, Modal, SectionHead, Select, Tabs, Textarea } from "../components/ui";
import { DynamicFields } from "../components/DynamicFields";

/* ---------------- Chat del servicio (compartido con empleados) ---------------- */
export function ChatBox({ mandado }: { mandado: Errand }) {
  const { state, user, t, agregarMensaje, marcarChatLeido } = useApp();
  const [txt, setTxt] = useState("");
  const habilitado = state.config.chatHabilitado;

  useEffect(() => {
    if (habilitado) marcarChatLeido(mandado.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mandado.id, mandado.mensajes.length, habilitado]);

  if (!habilitado) {
    return (
      <p className="rounded-xl bg-paper border-2 border-dashed border-line px-4 py-4 text-muted font-bold flex items-center gap-2">
        <Icon n="lock" size={18} /> {t("chatDeshabilitado")}
      </p>
    );
  }

  const enviar = () => {
    const limpio = txt.trim();
    if (!limpio) return;
    agregarMensaje(mandado.id, limpio);
    setTxt("");
  };

  const nombreDe = (id: string) => state.usuarios.find((u) => u.id === id)?.nombre.split(" ")[0] ?? "Usuario";

  return (
    <div className="rounded-xl border border-line bg-paper/70 overflow-hidden">
      <p className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5 font-black text-pine-900">
        <Icon n="chat" size={18} className="text-pine-600" /> {t("chatLbl")}
      </p>
      <div className="max-h-64 overflow-y-auto p-4 grid gap-2.5">
        {mandado.mensajes.length === 0 && <p className="text-sm text-muted text-center py-3">{t("sinDatos")}</p>}
        {mandado.mensajes.map((m: Mensaje) => {
          const mio = m.de === user?.id;
          return (
            <div key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] ${mio ? "bg-pine-700 text-white rounded-br-md" : "bg-white border border-line rounded-bl-md"}`}>
                {!mio && <p className="text-xs font-black text-pine-600 mb-0.5">{nombreDe(m.de)}</p>}
                <p>{m.texto}</p>
                <p className={`mt-1 text-[11px] font-bold flex items-center gap-1 justify-end ${mio ? "text-pine-200" : "text-muted"}`}>
                  {fmtHora(m.fecha)} {mio && <Icon n={m.leido ? "check" : "clock"} size={12} />}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 border-t border-line bg-white p-3">
        <Input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t("escribirMensaje")}
          onKeyDown={(e) => e.key === "Enter" && enviar()} aria-label={t("escribirMensaje")} />
        <Btn onClick={enviar} icon="send" aria-label={t("enviar")} className="!px-4" />
      </div>
    </div>
  );
}

/* ---------------- Formulario de solicitud ---------------- */
function NuevaSolicitud({ presetTipo, onDone }: { presetTipo: string | null; onDone: () => void }) {
  const { state, user, t, crearMandado, toast } = useApp();
  const cfg = state.config;
  const clientId = user?.rol === "familiar" && user.linkedClientId ? user.linkedClientId : user?.id ?? "";
  const cliente = state.usuarios.find((u) => u.id === clientId);

  const [f, setF] = useState({
    tipo: presetTipo ?? "", descripcion: "", instrucciones: "", establecimiento: "",
    dirOrigen: "", dirEntrega: cliente?.direccion ?? user?.direccion ?? "", fecha: diasDesdeHoy(0),
    hora: "10:00", observaciones: "",
  });
  const [prods, setProds] = useState<Producto[]>([{ nombre: "", cantidad: "1", marca: "" }]);
  const [custom, setCustom] = useState<Record<string, string>>({});

  useEffect(() => { if (presetTipo) setF((p) => ({ ...p, tipo: presetTipo })); }, [presetTipo]);

  const upProd = (i: number, k: keyof Producto, v: string) =>
    setProds((p) => p.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const enviar = () => {
    if (!f.tipo) { toast("Selecciona el tipo de servicio.", "warn"); return; }
    if (!f.descripcion.trim() && !prods.some((p) => p.nombre.trim())) { toast("Describe qué necesitas o agrega productos.", "warn"); return; }
    crearMandado({
      ...f, solicitadoPorId: user?.id ?? "", clientId,
      productos: prods.filter((p) => p.nombre.trim()),
      custom,
    });
    toast(t("mandadoCreado"), "ok");
    setF({ ...f, descripcion: "", instrucciones: "", establecimiento: "", observaciones: "" });
    setProds([{ nombre: "", cantidad: "1", marca: "" }]);
    setCustom({});
    onDone();
  };

  return (
    <div className="card anim-rise p-6 sm:p-8">
      {user?.rol === "familiar" && cliente && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-marigold-50 border-2 border-marigold-200 px-4 py-3 font-bold text-marigold-900">
          <Icon n="users" size={20} /> Solicitas en nombre de <strong>{cliente.nombre}</strong>.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-4 content-start">
          <Field label={t("tipoServicio")} req>
            <Select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="">—</option>
              {cfg.tiposMandado.map((tp) => <option key={tp}>{tp}</option>)}
            </Select>
          </Field>
          <Field label={t("descripcion")} req>
            <Textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Ej: Necesito el mercado de la semana…" />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="lbl !mb-0">{t("productosLbl")}</span>
              <Btn size="sm" variant="soft" icon="plus" onClick={() => setProds([...prods, { nombre: "", cantidad: "1", marca: "" }])}>{t("agregarProducto")}</Btn>
            </div>
            <div className="grid gap-3">
              {prods.map((p, i) => (
                <div key={i} className="grid grid-cols-[1.5fr_0.8fr_1fr_auto] gap-2 items-center rounded-xl bg-paper border border-line p-2.5">
                  <Input value={p.nombre} onChange={(e) => upProd(i, "nombre", e.target.value)} placeholder={t("producto")} aria-label={t("producto")} />
                  <Input value={p.cantidad} onChange={(e) => upProd(i, "cantidad", e.target.value)} placeholder={t("cantidad")} aria-label={t("cantidad")} />
                  <Input value={p.marca} onChange={(e) => upProd(i, "marca", e.target.value)} placeholder={t("marca") + " " + t("opcional").toLowerCase()} aria-label={t("marca")} />
                  <button onClick={() => setProds(prods.filter((_, j) => j !== i))} disabled={prods.length === 1}
                    className="rounded-full p-2 text-coral-600 hover:bg-coral-50 disabled:opacity-30 transition-colors" aria-label={t("eliminar")}>
                    <Icon n="trash" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Field label={t("instruccionesEspeciales")}>
            <Textarea value={f.instrucciones} onChange={(e) => setF({ ...f, instrucciones: e.target.value })} className="min-h-[70px]" />
          </Field>
        </div>

        <div className="grid gap-4 content-start">
          <Field label={t("establecimiento")}>
            <Input value={f.establecimiento} onChange={(e) => setF({ ...f, establecimiento: e.target.value })} placeholder="Ej: Exito Chapinero" />
          </Field>
          <Field label={t("dirOrigen")}>
            <Input value={f.dirOrigen} onChange={(e) => setF({ ...f, dirOrigen: e.target.value })} placeholder="Calle 57 #13-45" />
          </Field>
          <Field label={t("dirEntrega")} req>
            <Input value={f.dirEntrega} onChange={(e) => setF({ ...f, dirEntrega: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("fechaSolicitada")} req><Input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Field>
            <Field label={t("horaSolicitada")} req><Input type="time" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} /></Field>
          </div>
          <Field label={t("observaciones")}>
            <Textarea value={f.observaciones} onChange={(e) => setF({ ...f, observaciones: e.target.value })} className="min-h-[70px]" />
          </Field>
          <DynamicFields modulo="mandado" values={custom} onChange={setCustom} />
          <Btn size="xl" icon="check" onClick={enviar} className="mt-1">{t("crearSolicitud")}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Detalle de un mandado ---------------- */
function MandadoCard({ m, esCliente }: { m: Errand; esCliente: boolean }) {
  const { state, user, t, cancelarMandado, toast } = useApp();
  const [abierto, setAbierto] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const cfg = state.config;

  const emp = state.usuarios.find((u) => u.id === m.empleadoId);
  const solicitante = state.usuarios.find((u) => u.id === m.solicitadoPorId);
  const puedeCancelar = esCliente && cfg.cancelacionEstados.includes(m.estado);
  const muestraGps = cfg.gpsHabilitado && ["EN CAMINO", "EN ENTREGA"].includes(m.estado);
  const noLeidos = m.mensajes.filter((x) => x.de !== user?.id && !x.leido).length;

  return (
    <article className="card card-hover overflow-hidden anim-rise">
      <button onClick={() => setAbierto(!abierto)} className="flex w-full items-center gap-4 p-5 text-left" aria-expanded={abierto}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine-50 text-pine-700"><Icon n="briefcase" size={26} /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-bold text-pine-900">{m.tipo}</span>
            <EstadoPill estado={m.estado} />
            {noLeidos > 0 && <Badge tone="marigold">{noLeidos} 💬</Badge>}
          </span>
          <span className="mt-0.5 block text-sm text-muted truncate">
            {fmtFecha(m.fecha + "T12:00:00")} · {m.hora} · {m.establecimiento || m.descripcion.slice(0, 48)}
          </span>
        </span>
        <Icon n="chevronDown" size={22} className={`text-muted transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="border-t border-line bg-paper/50 p-5 grid gap-5 anim-rise">
          {m.descripcion && <p className="text-ink"><strong className="text-pine-800">{t("descripcion")}:</strong> {m.descripcion}</p>}

          {m.productos.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full text-sm">
                <thead className="bg-pine-50"><tr><th className="th">{t("producto")}</th><th className="th">{t("cantidad")}</th><th className="th">{t("marca")}</th></tr></thead>
                <tbody>
                  {m.productos.map((p, i) => (
                    <tr key={i} className="border-t border-line/70"><td className="td font-bold">{p.nombre}</td><td className="td">{p.cantidad}</td><td className="td text-muted">{p.marca || "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {m.instrucciones && <p className="rounded-xl bg-marigold-50 border border-marigold-200 px-4 py-3"><strong className="text-marigold-800">{t("instruccionesEspeciales")}:</strong> {m.instrucciones}</p>}
            {m.observaciones && <p className="rounded-xl bg-white border border-line px-4 py-3"><strong className="text-pine-800">{t("observaciones")}:</strong> {m.observaciones}</p>}
            <p className="rounded-xl bg-white border border-line px-4 py-3 flex gap-2"><Icon n="pin" size={18} className="text-coral-600 shrink-0 mt-0.5" /> <span><strong>{t("dirOrigen")}:</strong> {m.dirOrigen || "—"}<br /><strong>{t("dirEntrega")}:</strong> {m.dirEntrega}</span></p>
            <p className="rounded-xl bg-white border border-line px-4 py-3 flex gap-2 items-start"><Icon n="wallet" size={18} className="text-pine-600 shrink-0 mt-0.5" /> <span><strong>{t("valorEstimado")}:</strong> {m.valor ? fmtCOP(m.valor) : "—"}<br />{solicitante && m.solicitadoPorId !== m.clientId ? `${t("solicitadoPor")}: ${solicitante.nombre}` : ""}</span></p>
          </div>

          {/* Asignado + GPS */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="lbl !mb-2">{t("empleadoAsignado")}</p>
              {emp ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar nombre={emp.nombre} />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-pine-900">{emp.nombre}</p>
                    <p className="text-sm text-muted">{emp.cargo} · {emp.telefono}</p>
                  </div>
                  {esCliente && <CallBtn tel={emp.telefono} label={t("llamar")} size="sm" variant="accent" />}
                </div>
              ) : (
                <p className="text-muted font-bold flex items-center gap-2"><Icon n="clock" size={18} /> {t("sinAsignar")}</p>
              )}
              {muestraGps && (
                <div className="mt-4 rounded-xl bg-pine-50 border border-pine-200 p-3.5">
                  <p className="flex items-center gap-2 font-black text-pine-900 text-sm"><Icon n="crosshair" size={17} className="text-pine-600" /> {t("ubicacionEmpleado")} <span className="h-2 w-2 rounded-full bg-pine-500 blink-dot" /></p>
                  {m.ubicacion ? (
                    <>
                      <a href={`https://www.google.com/maps?q=${m.ubicacion.lat},${m.ubicacion.lng}`} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 font-bold text-pine-700 underline decoration-2 underline-offset-4 hover:text-pine-900">
                        <Icon n="pin" size={17} /> {t("verMapa")}
                      </a>
                      <p className="mt-1 text-xs text-muted">GPS · {fmtHora(m.ubicacion.fecha)} · {m.ubicacion.precisa ? "Precisa" : t("sinUbicacion")}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-muted">{t("sinUbicacion")}</p>
                  )}
                </div>
              )}
            </div>

            {/* Historial */}
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="lbl !mb-3">{t("historialLbl")}</p>
              <ol className="relative grid gap-3 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-0.5 before:bg-pine-200">
                {[...m.historial].reverse().map((h, i) => (
                  <li key={i} className="relative pl-7">
                    <span className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${i === 0 ? "bg-pine-600" : "bg-pine-300"}`} />
                    <p className="text-sm"><strong className="text-pine-900">{h.estado}</strong> <span className="text-muted">· {fmtFecha(h.fecha)} {fmtHora(h.fecha)}</span></p>
                    <p className="text-xs text-muted">{h.por}{h.nota ? ` — ${h.nota}` : ""}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Chat */}
          {cfg.chatHabilitado && <ChatBox mandado={m} />}

          {/* Cancelar */}
          {esCliente && (
            <div className="flex justify-end">
              {puedeCancelar ? (
                <Btn variant="outline" icon="x" className="text-coral-700 border-coral-200 hover:border-coral-500 hover:bg-coral-50" onClick={() => setCancelOpen(true)}>
                  {t("cancelarMandado")}
                </Btn>
              ) : (
                !["COMPLETADO", "CANCELADO"].includes(m.estado) && <p className="text-sm text-muted font-bold">{t("noPuedeCancelar")}</p>
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={t("cancelarMandado")}>
        <div className="grid gap-4">
          <Field label={t("motivoCancelacion")} req={cfg.cancelacionRequiereMotivo}>
            <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Cuéntanos por qué cancelas…" />
          </Field>
          <div className="flex justify-end gap-3">
            <Btn variant="outline" onClick={() => setCancelOpen(false)}>{t("volver")}</Btn>
            <Btn variant="danger" icon="check" onClick={() => {
              if (cfg.cancelacionRequiereMotivo && !motivo.trim()) { toast(t("motivoCancelacion"), "warn"); return; }
              cancelarMandado(m.id, motivo.trim() || "Sin motivo");
              setCancelOpen(false); setMotivo("");
              toast(t("cancelada") + " ✓", "ok");
            }}>{t("confirmar")}</Btn>
          </div>
        </div>
      </Modal>
    </article>
  );
}



/* ---------------- Vista principal ---------------- */
export default function Errands({ presetTipo }: { presetTipo: string | null }) {
  const { state, user, t } = useApp();
  const [tab, setTab] = useState(presetTipo ? "solicitar" : "mios");
  useEffect(() => { if (presetTipo) setTab("solicitar"); }, [presetTipo]);

  const clientId = user?.rol === "familiar" && user.linkedClientId ? user.linkedClientId : user?.id ?? "";
  const mios = useMemo(
    () => state.mandados.filter((m) => m.clientId === clientId || m.solicitadoPorId === user?.id),
    [state.mandados, clientId, user],
  );
  const activos = mios.filter((m) => !["COMPLETADO", "CANCELADO"].includes(m.estado));
  const cerrados = mios.filter((m) => ["COMPLETADO", "CANCELADO"].includes(m.estado));

  return (
    <div>
      <SectionHead icon="briefcase" title={t("mandados")} sub={t("queNecesitas")} />
      <Tabs
        tabs={[
          { id: "solicitar", label: t("solicitarMandado"), icon: "plus" },
          { id: "mios", label: `${t("misMandados")} (${mios.length})`, icon: "list" },
        ]}
        active={tab} onChange={setTab}
      />

      <div className="mt-6">
        {tab === "solicitar" && <NuevaSolicitud presetTipo={presetTipo} onDone={() => setTab("mios")} />}
        {tab === "mios" && (
          <div className="grid gap-4">
            {mios.length === 0 && <Empty icon="briefcase" text={t("sinMandados")} />}
            {activos.map((m) => <MandadoCard key={m.id} m={m} esCliente />)}
            {cerrados.length > 0 && (
              <p className="mt-4 text-sm font-black uppercase tracking-widest text-muted">{t("serviciosCompletados")}</p>
            )}
            {cerrados.map((m) => <MandadoCard key={m.id} m={m} esCliente />)}
          </div>
        )}
      </div>
    </div>
  );
}


