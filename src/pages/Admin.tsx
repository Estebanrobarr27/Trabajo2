import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { CampoDinamico, FieldType } from "../types";
import { fmtFecha, fmtHora, uid } from "../types";
import { Icon } from "../components/icons";
import { Avatar, Badge, Btn, Empty, EstadoPill, Field, Input, SectionHead, Select, StatCard, Tabs, Toggle } from "../components/ui";
import { EmergenciaCard } from "./Employee";

const ROL_TONE: Record<string, "pine" | "marigold" | "coral" | "blue" | "teal"> = {
  superadmin: "coral", encargado: "marigold", empleado: "teal", cliente: "pine", familiar: "blue",
};
const TIPOS_CAMPO: FieldType[] = ["texto", "texto_largo", "numero", "fecha", "hora", "fecha_hora", "si_no", "seleccion", "seleccion_multiple", "telefono", "correo", "direccion", "archivo", "imagen"];

/* ---------- Editor genérico de listas configurables ---------- */
function EditList<T extends { id: string }>({ title, icon, items, cols, onChange, makeNew }: {
  title: string; icon: string;
  items: T[];
  cols: { k: string; l: string }[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setAbierto(!abierto)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-pine-50/60 transition-colors">
        <span className="flex items-center gap-3 font-display text-lg font-bold text-pine-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-100 text-pine-700"><Icon n={icon} size={20} /></span>
          {title} <Badge tone="gray">{items.length}</Badge>
        </span>
        <Icon n="chevronDown" size={20} className={`text-muted transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && (
        <div className="border-t border-line p-5 grid gap-3 anim-rise">
          {items.map((it) => {
            const rec = it as unknown as Record<string, unknown>;
            return (
              <div key={it.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper p-3">
                {cols.map((c) =>
                  typeof rec[c.k] === "boolean" ? (
                    <label key={c.k} className="flex items-center gap-2 text-sm font-bold text-pine-800">
                      <input type="checkbox" checked={rec[c.k] as boolean}
                        onChange={(e) => onChange(items.map((x) => (x.id === it.id ? ({ ...x, [c.k]: e.target.checked } as T) : x)))}
                        className="h-5 w-5 accent-pine-700" />
                      {c.l}
                    </label>
                  ) : (
                    <input key={c.k} value={String(rec[c.k] ?? "")} placeholder={c.l} aria-label={c.l}
                      onChange={(e) => onChange(items.map((x) => (x.id === it.id ? ({ ...x, [c.k]: e.target.value } as T) : x)))}
                      className="inp !py-2 !text-sm flex-1 min-w-[130px]" />
                  ),
                )}
                <button onClick={() => onChange(items.filter((x) => x.id !== it.id))}
                  className="rounded-full p-2 text-coral-600 hover:bg-coral-50 transition-colors" aria-label="Eliminar">
                  <Icon n="trash" size={18} />
                </button>
              </div>
            );
          })}
          <Btn variant="soft" icon="plus" onClick={() => onChange([...items, makeNew()])}>Agregar</Btn>
        </div>
      )}
    </div>
  );
}

/* ---------- Editor de campos dinámicos ---------- */
function CamposEditor({ modulo }: { modulo: string }) {
  const { state, setConfig } = useApp();
  const campos = state.config.camposDinamicos.filter((f) => f.modulo === modulo).sort((a, b) => a.orden - b.orden);
  const up = (id: string, patch: Partial<CampoDinamico>) =>
    setConfig((c) => ({ ...c, camposDinamicos: c.camposDinamicos.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  return (
    <div className="grid gap-3">
      {campos.length === 0 && <p className="text-muted font-bold">Este módulo no tiene campos personalizados. La estructura base siempre está disponible.</p>}
      {campos.map((f, i) => (
        <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-3">
          <input className="inp !py-2 !text-sm flex-1 min-w-[150px]" value={f.label} placeholder="Nombre del campo" aria-label="Nombre del campo"
            onChange={(e) => up(f.id, { label: e.target.value })} />
          <input className="inp !py-2 !text-sm flex-1 min-w-[130px]" value={f.labelEn} placeholder="Name (EN)" aria-label="Nombre en inglés"
            onChange={(e) => up(f.id, { labelEn: e.target.value })} />
          <select className="inp !py-2 !text-sm !w-auto" value={f.type} onChange={(e) => up(f.id, { type: e.target.value as FieldType })} aria-label="Tipo de campo">
            {TIPOS_CAMPO.map((tp) => <option key={tp} value={tp}>{tp.replace("_", " ")}</option>)}
          </select>
          <input className="inp !py-2 !text-sm flex-1 min-w-[150px]" value={f.opciones} placeholder="Opciones (a|b|c)" aria-label="Opciones"
            onChange={(e) => up(f.id, { opciones: e.target.value })} />
          <label className="flex items-center gap-1.5 text-sm font-bold text-pine-800">
            <input type="checkbox" checked={f.requerido} onChange={(e) => up(f.id, { requerido: e.target.checked })} className="h-5 w-5 accent-pine-700" /> Oblig.
          </label>
          <label className="flex items-center gap-1.5 text-sm font-bold text-pine-800">
            <input type="checkbox" checked={f.visible} onChange={(e) => up(f.id, { visible: e.target.checked })} className="h-5 w-5 accent-pine-700" /> Visible
          </label>
          <div className="flex gap-1">
            <button disabled={i === 0} onClick={() => { const otro = campos[i - 1]; up(f.id, { orden: otro.orden }); up(otro.id, { orden: f.orden }); }}
              className="rounded-full p-2 text-pine-600 hover:bg-pine-50 disabled:opacity-30" aria-label="Subir">↑</button>
            <button disabled={i === campos.length - 1} onClick={() => { const otro = campos[i + 1]; up(f.id, { orden: otro.orden }); up(otro.id, { orden: f.orden }); }}
              className="rounded-full p-2 text-pine-600 hover:bg-pine-50 disabled:opacity-30" aria-label="Bajar">↓</button>
            <button onClick={() => setConfig((c) => ({ ...c, camposDinamicos: c.camposDinamicos.filter((x) => x.id !== f.id) }))}
              className="rounded-full p-2 text-coral-600 hover:bg-coral-50" aria-label="Eliminar campo"><Icon n="trash" size={17} /></button>
          </div>
        </div>
      ))}
      <Btn variant="soft" icon="plus" className="justify-self-start"
        onClick={() => setConfig((c) => ({
          ...c,
          camposDinamicos: [...c.camposDinamicos, { id: uid(), modulo, label: "Nuevo campo", labelEn: "New field", type: "texto", requerido: false, visible: true, opciones: "", orden: campos.length + 1 }],
        }))}>
        Agregar campo
      </Btn>
    </div>
  );
}

/* ---------- Vista principal ---------- */
export default function Admin({ mode }: { mode: "encargado" | "super" }) {
  const { state, user, t, aprobarUsuario, rechazarUsuario, toggleUsuario, cambiarEstadoMandado, asignarEmpleado, setConfig, toast } = useApp();
  const cfg = state.config;
  const esSuper = mode === "super";

  const tabs = [
    { id: "panel", label: t("panel"), icon: "activity" },
    ...(esSuper ? [{ id: "usuarios", label: t("usuarios"), icon: "users" }] : []),
    { id: "mandados", label: t("mandados"), icon: "briefcase" },
    { id: "emergencias", label: t("emergencias"), icon: "siren" },
    esSuper ? { id: "config", label: t("config"), icon: "settings" } : { id: "vinculos", label: t("vinculos"), icon: "globe" },
    ...(esSuper ? [{ id: "auditoria", label: t("auditoria"), icon: "doc" }] : []),
  ];
  const [tab, setTab] = useState("panel");
  const [q, setQ] = useState("");
  const [fEstado, setFEstado] = useState("todos");
  const [subTab, setSubTab] = useState("cuadros");
  const [modCampo, setModCampo] = useState("registro");
  const [gen, setGen] = useState({
    nombreEmpresa: cfg.nombreEmpresa, eslogan: cfg.eslogan, telefonoContacto: cfg.telefonoContacto,
    emailContacto: cfg.emailContacto, ciudad: cfg.ciudad, tasaUSD: String(cfg.tasaUSD),
    tasaEUR: String(cfg.tasaEUR), recordatoriosDias: String(cfg.recordatoriosDias),
    colcap: cfg.colcap, sp500: cfg.sp500,
  });

  const kpi = useMemo(() => {
    const u = state.usuarios;
    const m = state.mandados;
    const enCurso = ["ASIGNADO", "EN CAMINO", "REALIZANDO MANDADO", "EN ENTREGA"];
    return {
      clientes: u.filter((x) => x.rol === "cliente" && x.estado === "activo").length,
      familiares: u.filter((x) => x.rol === "familiar" && x.estado === "activo").length,
      empleados: u.filter((x) => (x.rol === "empleado" || x.rol === "encargado") && x.estado === "activo").length,
      disponibles: u.filter((x) => x.rol === "empleado" && x.estado === "activo" && x.disponibilidad === "Disponible").length,
      porAsignar: m.filter((x) => ["SOLICITADO", "RECIBIDO"].includes(x.estado)).length,
      enProceso: m.filter((x) => enCurso.includes(x.estado)).length,
      completados: m.filter((x) => x.estado === "COMPLETADO").length,
      cancelados: m.filter((x) => x.estado === "CANCELADO").length,
      emergencias: state.emergencias.filter((x) => ["Activa", "En atención"].includes(x.estado)).length,
      citas: Object.values(state.salud).reduce((acc, s) => acc + s.citas.filter((c) => c.estado === "Programada").length, 0),
      pendientes: u.filter((x) => x.estado === "pendiente").length,
    };
  }, [state]);

  const pendientes = state.usuarios.filter((x) => x.estado === "pendiente");
  const usuariosFiltrados = state.usuarios.filter((x) => !q || (x.nombre + x.email + x.numeroId).toLowerCase().includes(q.toLowerCase()));
  const mandadosFiltrados = state.mandados.filter((m) => fEstado === "todos" || m.estado === fEstado);
  const auditFiltrada = state.auditoria.filter((a) => !q || (a.usuario + a.accion + a.modulo + a.detalle).toLowerCase().includes(q.toLowerCase()));

  const guardarGeneral = () => {
    setConfig((c) => ({
      ...c, nombreEmpresa: gen.nombreEmpresa, eslogan: gen.eslogan, telefonoContacto: gen.telefonoContacto,
      emailContacto: gen.emailContacto, ciudad: gen.ciudad, tasaUSD: Number(gen.tasaUSD) || c.tasaUSD,
      tasaEUR: Number(gen.tasaEUR) || c.tasaEUR, recordatoriosDias: Number(gen.recordatoriosDias) || 3,
      colcap: gen.colcap.trim() || c.colcap, sp500: gen.sp500.trim() || c.sp500,
      tasaFecha: new Date().toISOString().slice(0, 10),
    }), "Parámetros generales actualizados");
    toast(t("guardar") + " ✓");
  };

  return (
    <div>
      <SectionHead icon="activity" title={t("panelAdmin")} sub={`${cfg.nombreEmpresa} · ${user?.nombre}`} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-6">
        {/* ================= PANEL ================= */}
        {tab === "panel" && (
          <div className="grid gap-6 anim-rise">
            {pendientes.length > 0 && (
              <section className="rounded-2xl border-2 border-marigold-300 bg-marigold-50 p-5">
                <h3 className="font-display text-xl font-black text-marigold-900 flex items-center gap-2 mb-4">
                  <Icon n="clock" size={22} /> {t("aprobaciones")} ({pendientes.length})
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {pendientes.map((u2) => (
                    <div key={u2.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-marigold-200 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar nombre={u2.nombre} size={40} />
                        <div className="min-w-0">
                          <p className="font-black text-pine-900 truncate">{u2.nombre} <Badge tone="gray" className="!text-xs ml-1">{u2.rol}</Badge></p>
                          <p className="text-sm text-muted truncate">{u2.email} · {u2.ciudad} · RH {u2.rh || "—"} · {fmtFecha(u2.fechaRegistro)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Btn size="sm" icon="check" onClick={() => { aprobarUsuario(u2.id); toast(`${u2.nombre}: cuenta aprobada ✓`); }}>{t("aprobar")}</Btn>
                        <Btn size="sm" variant="outline" icon="x" className="text-coral-700" onClick={() => { rechazarUsuario(u2.id); toast("Solicitud rechazada", "warn"); }}>{t("rechazar")}</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              <StatCard icon="heart" label={t("clientesActivos")} value={kpi.clientes} tone="pine" delay={0} />
              <StatCard icon="users" label={t("familiaresLbl")} value={kpi.familiares} tone="blue" delay={40} />
              <StatCard icon="user" label={t("empleadosLbl")} value={kpi.empleados} tone="teal" delay={80} />
              <StatCard icon="check" label={t("empleadosDisponibles")} value={kpi.disponibles} tone="pine" delay={120} />
              <StatCard icon="briefcase" label={t("mandadosPendientes")} value={kpi.porAsignar} tone="marigold" delay={160} />
              <StatCard icon="activity" label={t("enProceso")} value={kpi.enProceso} tone="teal" delay={200} />
              <StatCard icon="check" label={t("completadosLbl")} value={kpi.completados} tone="pine" delay={240} />
              <StatCard icon="x" label={t("canceladosLbl")} value={kpi.cancelados} tone="coral" delay={280} />
              <StatCard icon="siren" label={t("emergenciasActivas")} value={kpi.emergencias} tone="coral" delay={320} />
              <StatCard icon="calendar" label={t("citasProximas")} value={kpi.citas} tone="marigold" delay={360} />
              <StatCard icon="bell" label={t("notificaciones")} value={state.notificaciones.filter((n) => n.para === user?.id && !n.leida).length} tone="blue" delay={400} />
              <StatCard icon="clock" label={t("aprobaciones")} value={kpi.pendientes} tone="marigold" delay={440} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
              <div className="card p-5">
                <h3 className="font-display text-lg font-bold text-pine-900 mb-4">{t("estadosMandadosLbl")}</h3>
                {cfg.estadosMandado.map((e) => {
                  const n = state.mandados.filter((m) => m.estado === e).length;
                  const max = Math.max(1, ...cfg.estadosMandado.map((x) => state.mandados.filter((m) => m.estado === x).length));
                  return (
                    <div key={e} className="mb-2.5">
                      <div className="flex justify-between text-sm font-bold text-pine-900"><span>{e}</span><span>{n}</span></div>
                      <div className="h-2.5 rounded-full bg-line overflow-hidden">
                        <div className="h-full rounded-full bg-pine-600 transition-all duration-700" style={{ width: `${(n / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card p-5">
                <h3 className="font-display text-lg font-bold text-pine-900 mb-4">{t("actividadReciente")}</h3>
                <ol className="grid gap-3">
                  {state.auditoria.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex gap-3 text-sm border-b border-line/60 pb-3 last:border-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-50 text-pine-600"><Icon n="activity" size={16} /></span>
                      <div>
                        <p><strong className="text-pine-900">{a.usuario}</strong> · <Badge tone="gray" className="!text-xs">{a.modulo}</Badge> <span className="font-bold">{a.accion}</span></p>
                        <p className="text-muted">{a.detalle}</p>
                        <p className="text-xs text-muted mt-0.5">{fmtFecha(a.fecha)} · {fmtHora(a.fecha)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ================= USUARIOS ================= */}
        {tab === "usuarios" && (
          <div className="anim-rise">
            <div className="relative mb-4 max-w-md">
              <Icon n="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("buscar")} className="!pl-12" aria-label={t("buscar")} />
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-pine-50 border-b border-line">
                  <tr><th className="th">{t("nombre")}</th><th className="th">Rol</th><th className="th">{t("correo")}</th><th className="th">{t("telefono")}</th><th className="th">{t("estado")}</th><th className="th">{t("acciones")}</th></tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u2) => (
                    <tr key={u2.id} className="border-b border-line/70 hover:bg-paper/70 transition-colors">
                      <td className="td">
                        <div className="flex items-center gap-3"><Avatar nombre={u2.nombre} size={38} />
                          <div><p className="font-black text-pine-900">{u2.nombre}</p><p className="text-xs text-muted">{u2.tipoId} {u2.numeroId} · {u2.ciudad}</p></div>
                        </div>
                      </td>
                      <td className="td"><Badge tone={ROL_TONE[u2.rol]}>{u2.rol}</Badge></td>
                      <td className="td text-sm">{u2.email}</td>
                      <td className="td text-sm whitespace-nowrap">{u2.telefono}</td>
                      <td className="td"><Badge tone={u2.estado === "activo" ? "pine" : u2.estado === "pendiente" ? "marigold" : "coral"}>{u2.estado}</Badge></td>
                      <td className="td">
                        <div className="flex gap-1.5">
                          {u2.estado === "pendiente" && (
                            <>
                              <Btn size="sm" icon="check" onClick={() => { aprobarUsuario(u2.id); toast("Cuenta aprobada ✓"); }}>{t("aprobar")}</Btn>
                              <Btn size="sm" variant="outline" icon="x" className="text-coral-700" onClick={() => rechazarUsuario(u2.id)}>{t("rechazar")}</Btn>
                            </>
                          )}
                          {u2.estado !== "pendiente" && u2.id !== user?.id && (
                            <Btn size="sm" variant={u2.estado === "activo" ? "outline" : "soft"} icon={u2.estado === "activo" ? "eyeOff" : "check"}
                              onClick={() => { toggleUsuario(u2.id); toast(u2.estado === "activo" ? "Cuenta desactivada" : "Cuenta activada", "warn"); }}>
                              {u2.estado === "activo" ? t("inactivo") : t("activo")}
                            </Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MANDADOS ================= */}
        {tab === "mandados" && (
          <div className="anim-rise">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className="!w-auto" aria-label={t("estado")}>
                <option value="todos">{t("todos")}</option>
                {cfg.estadosMandado.map((e) => <option key={e}>{e}</option>)}
              </Select>
              <p className="text-sm text-muted font-bold">{mandadosFiltrados.length} {t("mandados").toLowerCase()}</p>
            </div>
            {mandadosFiltrados.length === 0 ? <Empty icon="briefcase" text={t("sinDatos")} /> : (
              <div className="grid gap-4">
                {mandadosFiltrados.map((m) => {
                  const cli = state.usuarios.find((x) => x.id === m.clientId);
                  return (
                    <div key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
                      <div className="min-w-[200px] flex-1">
                        <p className="font-display text-lg font-bold text-pine-900">{m.tipo}</p>
                        <p className="text-sm text-muted">{cli?.nombre} · {fmtFecha(m.fecha + "T12:00:00")} {m.hora} · {m.establecimiento || m.descripcion.slice(0, 40)}</p>
                      </div>
                      <EstadoPill estado={m.estado} />
                      <label className="flex items-center gap-2 text-sm font-bold text-pine-800">
                        {t("asignarEmpleado")}:
                        <select className="inp !py-2 !text-sm !w-auto" value={m.empleadoId ?? ""} aria-label={t("asignarEmpleado")}
                          onChange={(e) => { if (e.target.value) { asignarEmpleado(m.id, e.target.value); toast(t("asignarEmpleado") + " ✓"); } }}>
                          <option value="">{t("sinAsignar")}</option>
                          {state.usuarios.filter((x) => x.rol === "empleado" && x.estado === "activo").map((x) => (
                            <option key={x.id} value={x.id}>{x.nombre} ({x.disponibilidad})</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold text-pine-800">
                        {t("estado")}:
                        <select className="inp !py-2 !text-sm !w-auto" value={m.estado} aria-label={t("cambiarEstado")}
                          onChange={(e) => { cambiarEstadoMandado(m.id, e.target.value, "Cambio manual desde el panel."); toast(`${t("estado")}: ${e.target.value}`, "ok"); }}>
                          {cfg.estadosMandado.map((e) => <option key={e}>{e}</option>)}
                        </select>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= EMERGENCIAS ================= */}
        {tab === "emergencias" && (
          <div className="grid gap-5 anim-rise">
            {state.emergencias.length === 0 && <Empty icon="siren" text={t("sinDatos")} />}
            {[...state.emergencias].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((e, i) => (
              <EmergenciaCard key={e.id} e={e} puedeGestionar delay={i * 60} />
            ))}
          </div>
        )}

        {/* ================= CONFIG / VÍNCULOS ================= */}
        {(tab === "config" || tab === "vinculos") && (
          <div className="anim-rise">
            <Tabs
              tabs={
                esSuper
                  ? [
                      { id: "general", label: t("general"), icon: "settings" },
                      { id: "cuadros", label: "Cuadros y vínculos", icon: "globe" },
                      { id: "contenido", label: t("contenido"), icon: "news" },
                      { id: "reglas", label: t("reglas"), icon: "shield" },
                      { id: "estados", label: t("estadosMandadosLbl"), icon: "list" },
                      { id: "campos", label: t("camposDinamicosLbl"), icon: "edit" },
                    ]
                  : [
                      { id: "cuadros", label: "Cuadros y vínculos", icon: "globe" },
                      { id: "contenido", label: t("contenido"), icon: "news" },
                    ]
              }
              active={esSuper ? subTab : (subTab === "general" || subTab === "reglas" || subTab === "estados" || subTab === "campos" ? "cuadros" : subTab)}
              onChange={setSubTab}
            />

            <div className="mt-6">
              {subTab === "general" && esSuper && (
                <div className="card max-w-3xl p-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre de la empresa"><Input value={gen.nombreEmpresa} onChange={(e) => setGen({ ...gen, nombreEmpresa: e.target.value })} /></Field>
                  <Field label="Ciudad"><Input value={gen.ciudad} onChange={(e) => setGen({ ...gen, ciudad: e.target.value })} /></Field>
                  <div className="sm:col-span-2"><Field label="Eslogan"><Input value={gen.eslogan} onChange={(e) => setGen({ ...gen, eslogan: e.target.value })} /></Field></div>
                  <Field label={t("telefono")}><Input value={gen.telefonoContacto} onChange={(e) => setGen({ ...gen, telefonoContacto: e.target.value })} /></Field>
                  <Field label={t("correo")}><Input value={gen.emailContacto} onChange={(e) => setGen({ ...gen, emailContacto: e.target.value })} /></Field>
                  <Field label={t("tasaUSD")}><Input type="number" value={gen.tasaUSD} onChange={(e) => setGen({ ...gen, tasaUSD: e.target.value })} /></Field>
                  <Field label={t("tasaEUR")}><Input type="number" value={gen.tasaEUR} onChange={(e) => setGen({ ...gen, tasaEUR: e.target.value })} /></Field>
                  <Field label={t("colcapLbl")} hint={t("tasasReferencia")}><Input value={gen.colcap} onChange={(e) => setGen({ ...gen, colcap: e.target.value })} placeholder="1.565,20" /></Field>
                  <Field label={t("sp500Lbl")}><Input value={gen.sp500} onChange={(e) => setGen({ ...gen, sp500: e.target.value })} placeholder="5.942,10" /></Field>
                  <Field label="Días de recordatorio de citas"><Input type="number" value={gen.recordatoriosDias} onChange={(e) => setGen({ ...gen, recordatoriosDias: e.target.value })} /></Field>
                  <div className="sm:col-span-2 flex justify-end"><Btn icon="check" size="lg" onClick={guardarGeneral}>{t("guardar")}</Btn></div>
                </div>
              )}

              {subTab === "cuadros" && (
                <div className="grid gap-4">
                  <p className="rounded-xl bg-marigold-50 border-2 border-marigold-200 px-4 py-3 text-sm font-bold text-marigold-900 flex gap-2">
                    <Icon n="info" size={20} className="shrink-0 text-marigold-600" />
                    Si un cuadro tiene un enlace externo, la aplicación abrirá esa página; si no, abrirá el módulo interno. Los cambios se guardan al escribir.
                  </p>
                  {cfg.tiles.map((tile) => (
                    <div key={tile.id} className="card flex flex-wrap items-center gap-3 p-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-700 text-marigold-300"><Icon n={tile.icon} size={22} /></span>
                      <input className="inp !py-2 !text-sm flex-1 min-w-[160px]" value={tile.label} aria-label="Nombre del cuadro"
                        onChange={(e) => setConfig((c) => ({ ...c, tiles: c.tiles.map((x) => (x.id === tile.id ? { ...x, label: e.target.value } : x)) }), "Cuadro renombrado")} />
                      <input className="inp !py-2 !text-sm flex-[2] min-w-[220px]" value={tile.url} placeholder="https://… (enlace externo opcional)" aria-label="Enlace externo"
                        onChange={(e) => setConfig((c) => ({ ...c, tiles: c.tiles.map((x) => (x.id === tile.id ? { ...x, url: e.target.value } : x)) }), "Vínculo del cuadro actualizado")} />
                      <Toggle checked={tile.activo} onChange={(v) => setConfig((c) => ({ ...c, tiles: c.tiles.map((x) => (x.id === tile.id ? { ...x, activo: v } : x)) }), "Cuadro activado/desactivado")} label={tile.activo ? t("activo") : t("inactivo")} />
                    </div>
                  ))}
                </div>
              )}

              {subTab === "contenido" && (
                <div className="grid gap-4">
                  <EditList title="Enlaces de interés" icon="globe" items={cfg.enlaces}
                    cols={[{ k: "nombre", l: "Nombre" }, { k: "url", l: "URL" }, { k: "categoria", l: "Categoría" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, enlaces: r }), "Enlaces editados")}
                    makeNew={() => ({ id: uid(), nombre: "Nuevo enlace", url: "https://", categoria: "Noticias" })} />
                  <EditList title={t("noticias")} icon="news" items={cfg.noticias}
                    cols={[{ k: "titulo", l: "Título" }, { k: "fuente", l: "Fuente" }, { k: "url", l: "URL" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, noticias: r.map((x) => ({ ...x, fecha: x.fecha || new Date().toISOString() })) }), "Noticias editadas")}
                    makeNew={() => ({ id: uid(), titulo: "Nueva noticia", resumen: "Resumen…", fuente: "Fuente", fecha: new Date().toISOString(), url: "https://" })} />
                  <EditList title="Indicadores de seguridad" icon="shield" items={cfg.stats}
                    cols={[{ k: "label", l: "Indicador" }, { k: "valor", l: "Valor" }, { k: "nota", l: "Nota" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, stats: r }), "Indicadores editados")}
                    makeNew={() => ({ id: uid(), label: "Indicador", valor: "0", nota: "" })} />
                  <EditList title={t("hospitalesCerca")} icon="medical" items={cfg.hospitales}
                    cols={[{ k: "nombre", l: "Nombre" }, { k: "direccion", l: "Dirección" }, { k: "telefono", l: "Teléfono" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, hospitales: r }), "Hospitales editados")}
                    makeNew={() => ({ id: uid(), nombre: "Hospital", direccion: "", telefono: "" })} />
                  <EditList title={t("policiaCerca")} icon="shield" items={cfg.policias}
                    cols={[{ k: "nombre", l: "Nombre" }, { k: "direccion", l: "Dirección" }, { k: "telefono", l: "Teléfono" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, policias: r }), "Estaciones editadas")}
                    makeNew={() => ({ id: uid(), nombre: "Estación", direccion: "", telefono: "123" })} />
                  <EditList title={t("lineasEmergencia")} icon="phone" items={cfg.numerosEmergencia}
                    cols={[{ k: "nombre", l: "Nombre" }, { k: "numero", l: "Número" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, numerosEmergencia: r }), "Líneas editadas")}
                    makeNew={() => ({ id: uid(), nombre: "Línea", numero: "123" })} />
                  <EditList title={t("conductoresElegidos")} icon="wheel" items={cfg.conductores}
                    cols={[{ k: "nombre", l: "Nombre" }, { k: "telefono", l: "Teléfono" }, { k: "vehiculo", l: "Vehículo" }, { k: "placa", l: "Placa" }, { k: "nota", l: "Nota" }, { k: "activo", l: "Activo" }]}
                    onChange={(r) => setConfig((c) => ({ ...c, conductores: r }), "Conductores editados")}
                    makeNew={() => ({ id: uid(), nombre: "Conductor", telefono: "", vehiculo: "", placa: "", rating: "5,0", nota: "", activo: true })} />
                </div>
              )}

              {subTab === "reglas" && esSuper && (
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="card p-6 grid gap-5 content-start">
                    <h3 className="font-display text-lg font-bold text-pine-900">Funciones</h3>
                    <Toggle checked={cfg.chatHabilitado} onChange={(v) => setConfig((c) => ({ ...c, chatHabilitado: v }), "Chat habilitado/deshabilitado")} label="Chat cliente ↔ empleado" />
                    <Toggle checked={cfg.gpsHabilitado} onChange={(v) => setConfig((c) => ({ ...c, gpsHabilitado: v }), "GPS habilitado/deshabilitado")} label="Seguimiento GPS en servicios" />
                    <Toggle checked={cfg.cancelacionRequiereMotivo} onChange={(v) => setConfig((c) => ({ ...c, cancelacionRequiereMotivo: v }), "Regla de cancelación")} label="Cancelar exige motivo" />
                    <Toggle checked={cfg.familiarAccesoSalud} onChange={(v) => setConfig((c) => ({ ...c, familiarAccesoSalud: v }), "Acceso familiar a salud")} label="Familiares autorizados ven salud" />
                    <div>
                      <p className="lbl">Estados en los que el cliente puede cancelar</p>
                      <div className="flex flex-wrap gap-2">
                        {cfg.estadosMandado.filter((e) => e !== "CANCELADO" && e !== "COMPLETADO").map((e) => {
                          const on = cfg.cancelacionEstados.includes(e);
                          return (
                            <button key={e} onClick={() => setConfig((c) => ({ ...c, cancelacionEstados: on ? c.cancelacionEstados.filter((x) => x !== e) : [...c.cancelacionEstados, e] }), "Estados de cancelación")}
                              className={`chip border-2 transition-colors ${on ? "bg-coral-600 text-white border-coral-600" : "bg-white text-pine-800 border-line hover:border-coral-300"}`}>
                              {e}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="card p-6 grid gap-5 content-start">
                    <h3 className="font-display text-lg font-bold text-pine-900">{t("destinatariosLbl")}</h3>
                    <p className="text-sm text-muted">¿Quién recibe las alertas del botón de pánico?</p>
                    {([
                      ["encargados", "Encargados / coordinadores"],
                      ["administradores", "Superadministradores"],
                      ["empleados", "Empleados en servicio"],
                      ["contactos", "Contactos de emergencia (llamada/SMS)"],
                    ] as const).map(([k, lbl]) => (
                      <Toggle key={k} checked={cfg.destinatariosEmergencia[k]}
                        onChange={(v) => setConfig((c) => ({ ...c, destinatariosEmergencia: { ...c.destinatariosEmergencia, [k]: v } }), "Destinatarios de emergencia")}
                        label={lbl} />
                    ))}
                  </div>
                </div>
              )}

              {subTab === "estados" && esSuper && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {([["estadosMandado", t("estadosMandadosLbl"), "siren"], ["tiposMandado", t("tiposMandadoLbl"), "briefcase"]] as const).map(([key, lbl, ic]) => (
                    <div key={key} className="card p-6">
                      <h3 className="font-display text-lg font-bold text-pine-900 flex items-center gap-2 mb-4"><Icon n={ic} size={20} className="text-pine-600" /> {lbl}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {cfg[key].map((e) => (
                          <span key={e} className="chip bg-pine-50 border border-pine-200 text-pine-800">
                            {e}
                            <button onClick={() => setConfig((c) => ({ ...c, [key]: c[key].filter((x) => x !== e) }), `${lbl}: eliminado`)} aria-label={`Quitar ${e}`}
                              className="text-coral-600 hover:text-coral-800"><Icon n="x" size={13} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input id={`nuevo-${key}`} placeholder="Nuevo…" aria-label="Nuevo elemento"
                          onKeyDown={(ev) => {
                            const el = ev.target as HTMLInputElement;
                            if (ev.key === "Enter" && el.value.trim()) {
                              setConfig((c) => ({ ...c, [key]: [...c[key], el.value.trim()] }), `${lbl}: agregado`);
                              el.value = "";
                            }
                          }} />
                        <Btn variant="soft" icon="plus" onClick={(ev) => {
                          const el = document.getElementById(`nuevo-${key}`) as HTMLInputElement;
                          if (el?.value.trim()) { setConfig((c) => ({ ...c, [key]: [...c[key], el.value.trim()] }), `${lbl}: agregado`); el.value = ""; }
                          void ev;
                        }}>{t("agregar")}</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {subTab === "campos" && esSuper && (
                <div className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h3 className="font-display text-lg font-bold text-pine-900 flex items-center gap-2"><Icon n="edit" size={20} className="text-pine-600" /> {t("camposDinamicosLbl")}</h3>
                    <label className="flex items-center gap-2 font-bold text-pine-800">{t("modulo")}:
                      <Select value={modCampo} onChange={(e) => setModCampo(e.target.value)} className="!w-auto !py-2">
                        {["registro", "mandado", "salud", "empleado", "familiar", "contacto"].map((m2) => <option key={m2}>{m2}</option>)}
                      </Select>
                    </label>
                  </div>
                  <p className="text-sm text-muted mb-4">Estos campos aparecen automáticamente en los formularios de <strong>{modCampo}</strong>, sin tocar código. Tipos disponibles: texto, número, fecha, hora, sí/no, selección, selección múltiple, teléfono, correo, dirección, archivo e imagen.</p>
                  <CamposEditor modulo={modCampo} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= AUDITORÍA ================= */}
        {tab === "auditoria" && (
          <div className="anim-rise">
            <div className="relative mb-4 max-w-md">
              <Icon n="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("buscar")} className="!pl-12" aria-label={t("buscar")} />
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-pine-50 border-b border-line">
                  <tr><th className="th">{t("fecha")}</th><th className="th">Usuario</th><th className="th">Acción</th><th className="th">{t("modulo")}</th><th className="th">Detalle</th></tr>
                </thead>
                <tbody>
                  {auditFiltrada.slice(0, 60).map((a) => (
                    <tr key={a.id} className="border-b border-line/70 hover:bg-paper/70 transition-colors text-sm">
                      <td className="td whitespace-nowrap text-muted">{fmtFecha(a.fecha)} · {fmtHora(a.fecha)}</td>
                      <td className="td font-bold text-pine-900">{a.usuario}</td>
                      <td className="td"><Badge tone="gray">{a.accion}</Badge></td>
                      <td className="td">{a.modulo}</td>
                      <td className="td text-muted">{a.detalle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
