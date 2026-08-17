import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  AppState, ContactoEmergencia, Emergencia, Errand, HealthRecord, Idioma,
  Notif, PlatformConfig, Rol, Ubicacion, User, VentaGaraje,
} from "./types";
import { ahora, uid } from "./types";
import { seedState } from "./data/seed";
import { translate } from "./i18n";

/* ============================================================
   Store central de Juventudes.
   Persistencia local (localStorage) con la misma forma que
   tendría una API real: cada acción audita, notifica y valida.
   Para producción: reemplazar loadState/mutate por Supabase
   (Auth, PostgreSQL + RLS, Realtime y Storage) sin tocar la UI.
   ============================================================ */

const KEY = "juventudes_app_v1";

function loadState(): AppState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s && s.version === 1 && Array.isArray(s.usuarios)) {
        // El estado guardado se combina con la semilla: así los campos
        // agregados en versiones nuevas (colcap, sp500, etc.) siempre
        // existen aunque el navegador tenga datos de una versión anterior.
        return { ...seed, ...s, config: { ...seed.config, ...(s.config ?? {}) } };
      }
    }
  } catch {
    /* estado corrupto: se regenera la semilla */
  }
  return seed;
}

const pushNotif = (s: AppState, para: string[], titulo: string, cuerpo: string, tipo: Notif["tipo"]): AppState => ({
  ...s,
  notificaciones: [
    ...para.map((p) => ({ id: uid(), para: p, titulo, cuerpo, fecha: ahora(), leida: false, tipo })),
    ...s.notificaciones,
  ].slice(0, 300),
});

const pushAudit = (s: AppState, usuario: string, accion: string, modulo: string, detalle: string): AppState => ({
  ...s,
  auditoria: [{ id: uid(), fecha: ahora(), usuario, accion, modulo, detalle }, ...s.auditoria].slice(0, 500),
});

const idsDeRoles = (s: AppState, roles: Rol[]) =>
  s.usuarios.filter((u) => u.estado === "activo" && roles.includes(u.rol)).map((u) => u.id);

const saludVacia = (rh = "", eps = "", enf = ""): HealthRecord => ({
  privacidad: false, rh, eps, enfermedadesAtencion: enf,
  medicamentos: [], alergias: [], antecedentes: [], citas: [], alertas: [], custom: {},
});

export interface RegistroData {
  nombre: string; email: string; telefono: string; password: string; rol: Rol;
  tipoId: string; numeroId: string; pais: string; ciudad: string; rh: string;
  fechaNacimiento: string; direccion: string; enfermedadesAtencion: string; eps: string;
  contactos: ContactoEmergencia[]; custom: Record<string, string>;
}

interface Toast { id: string; msg: string; tipo: "ok" | "warn" | "error"; }

interface Ctx {
  state: AppState;
  user: User | null;
  toasts: Toast[];
  t: (k: string) => string;
  lang: Idioma;
  setLang: (l: Idioma) => void;
  toast: (msg: string, tipo?: Toast["tipo"]) => void;

  login: (email: string, password: string) => "ok" | "bad" | "pendiente" | "inactivo";
  logout: () => void;
  registrar: (data: RegistroData) => void;
  aprobarUsuario: (id: string) => void;
  rechazarUsuario: (id: string) => void;
  toggleUsuario: (id: string) => void;

  crearMandado: (d: Partial<Errand> & { clientId: string; solicitadoPorId: string; tipo: string }) => void;
  cambiarEstadoMandado: (id: string, estado: string, nota?: string) => void;
  asignarEmpleado: (mandadoId: string, empleadoId: string) => void;
  agregarMensaje: (mandadoId: string, texto: string) => void;
  marcarChatLeido: (mandadoId: string) => void;
  reportarUbicacion: (mandadoId: string, ubi: Ubicacion) => void;
  cancelarMandado: (id: string, motivo: string) => void;

  activarEmergencia: (ubi: Ubicacion | null) => Emergencia;
  cambiarEstadoEmergencia: (id: string, estado: Emergencia["estado"]) => void;
  notaEmergencia: (id: string, nota: string) => void;

  getSalud: (clientId: string) => HealthRecord;
  updateSalud: (clientId: string, fn: (h: HealthRecord) => HealthRecord, accion?: string) => void;

  addVenta: (v: Omit<VentaGaraje, "id" | "fecha" | "vendido">) => void;
  toggleVendido: (id: string) => void;
  delVenta: (id: string) => void;

  setConfig: (fn: (c: PlatformConfig) => PlatformConfig, detalle?: string) => void;
  marcarNotifsLeidas: () => void;
  notificar: (para: string[], titulo: string, cuerpo: string, tipo?: Notif["tipo"]) => void;
  actualizarUsuario: (id: string, patch: Partial<User>) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* cuota llena */ }
  }, [state]);

  const toast = (msg: string, tipo: Toast["tipo"] = "ok") => {
    const id = uid();
    setToasts((ts) => [...ts, { id, msg, tipo }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4500);
  };

  const user = state.usuarios.find((u) => u.id === state.currentUserId) ?? null;
  const lang = state.idioma;
  const t = (k: string) => translate(lang, k);
  const me = () => ref.current.usuarios.find((u) => u.id === ref.current.currentUserId);

  const setLang = (l: Idioma) => setState((s) => ({ ...s, idioma: l }));

  /* ---------- Autenticación ---------- */
  const login: Ctx["login"] = (email, password) => {
    const s = ref.current;
    const u = s.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) return "bad";
    if (u.estado === "pendiente") return "pendiente";
    if (u.estado === "inactivo") return "inactivo";
    setState((p) => pushAudit({ ...p, currentUserId: u.id }, u.nombre, "Inicio de sesión", "Autenticación", "Ingresó a la plataforma."));
    return "ok";
  };

  const logout = () => setState((p) => ({ ...p, currentUserId: null }));

  const registrar: Ctx["registrar"] = (data) => {
    const s = ref.current;
    const nuevo: User = {
      id: uid(), rol: data.rol, nombre: data.nombre, email: data.email, telefono: data.telefono,
      password: data.password, estado: "pendiente", tipoId: data.tipoId, numeroId: data.numeroId,
      pais: data.pais, ciudad: data.ciudad, rh: data.rh, fechaNacimiento: data.fechaNacimiento,
      direccion: data.direccion, enfermedadesAtencion: data.enfermedadesAtencion,
      contactos: data.contactos, disponibilidad: "Disponible", cargo: "", fechaIngreso: "",
      linkedClientId: data.rol === "familiar" ? data.custom.linkedClientId ?? null : null,
      aprobadoPor: "", aprobadoEl: "", fechaRegistro: ahora(), custom: data.custom,
    };
    setState((p) => {
      let n = pushAudit({ ...p, usuarios: [...p.usuarios, nuevo] }, data.nombre, "Registro", "Usuarios", `Solicitó registro como ${data.rol}.`);
      n = pushNotif(n, idsDeRoles(p, ["encargado", "superadmin"]), "Registro por aprobar", `${data.nombre} solicitó una cuenta y espera aprobación.`, "alerta");
      return n;
    });
  };

  const aprobarUsuario = (id: string) => setState((p) => {
    const u = p.usuarios.find((x) => x.id === id);
    if (!u) return p;
    const por = me()?.nombre ?? "Administración";
    let n: AppState = {
      ...p,
      usuarios: p.usuarios.map((x) => (x.id === id ? { ...x, estado: "activo" as const, aprobadoPor: por, aprobadoEl: ahora() } : x)),
    };
    n = pushNotif(n, [id], "¡Cuenta aprobada!", "Tu cuenta de Juventudes fue aprobada. Ya puedes ingresar.", "exito");
    n = pushAudit(n, por, "Aprobación", "Usuarios", `Aprobó la cuenta de ${u.nombre}.`);
    return n;
  });

  const rechazarUsuario = (id: string) => setState((p) => {
    const u = p.usuarios.find((x) => x.id === id);
    if (!u) return p;
    const por = me()?.nombre ?? "Administración";
    return pushAudit(
      { ...p, usuarios: p.usuarios.map((x) => (x.id === id ? { ...x, estado: "inactivo" as const } : x)) },
      por, "Rechazo", "Usuarios", `Rechazó la solicitud de ${u.nombre}.`,
    );
  });

  const toggleUsuario = (id: string) => setState((p) => {
    const u = p.usuarios.find((x) => x.id === id);
    if (!u) return p;
    const nuevoEstado = u.estado === "activo" ? "inactivo" : "activo";
    return pushAudit(
      { ...p, usuarios: p.usuarios.map((x) => (x.id === id ? { ...x, estado: nuevoEstado as User["estado"] } : x)) },
      me()?.nombre ?? "—", nuevoEstado === "activo" ? "Activación" : "Desactivación", "Usuarios", `${nuevoEstado === "activo" ? "Activó" : "Desactivó"} la cuenta de ${u.nombre}.`,
    );
  });

  /* ---------- Mandados ---------- */
  const crearMandado: Ctx["crearMandado"] = (d) => {
    const autor = me();
    const m: Errand = {
      id: uid(), clientId: d.clientId, solicitadoPorId: d.solicitadoPorId, tipo: d.tipo,
      descripcion: d.descripcion ?? "", productos: d.productos ?? [], instrucciones: d.instrucciones ?? "",
      establecimiento: d.establecimiento ?? "", dirOrigen: d.dirOrigen ?? "", dirEntrega: d.dirEntrega ?? "",
      fecha: d.fecha ?? "", hora: d.hora ?? "", observaciones: d.observaciones ?? "",
      estado: "SOLICITADO", empleadoId: null,
      historial: [{ fecha: ahora(), por: autor?.nombre ?? "Usuario", estado: "SOLICITADO", nota: "Solicitud creada." }],
      mensajes: [], ubicacion: null, valor: d.valor ?? null, custom: d.custom ?? {},
    };
    setState((p) => {
      let n = pushAudit({ ...p, mandados: [m, ...p.mandados] }, autor?.nombre ?? "Usuario", "Creación", "Mandados", `Creó mandado de ${d.tipo}.`);
      n = pushNotif(n, idsDeRoles(p, ["encargado", "superadmin"]), "Nuevo mandado", `${autor?.nombre ?? "Un usuario"} solicitó: ${d.tipo}.`, "info");
      return n;
    });
  };

  const cambiarEstadoMandado: Ctx["cambiarEstadoMandado"] = (id, estado, nota = "") => setState((p) => {
    const m = p.mandados.find((x) => x.id === id);
    if (!m) return p;
    const por = me()?.nombre ?? "Sistema";
    const ev = { fecha: ahora(), por, estado, nota };
    let n: AppState = {
      ...p,
      mandados: p.mandados.map((x) => (x.id === id ? { ...x, estado, historial: [...x.historial, ev] } : x)),
    };
    const avisar = [m.clientId, m.solicitadoPorId, ...(m.empleadoId ? [m.empleadoId] : [])].filter((v, i, a) => a.indexOf(v) === i);
    n = pushNotif(n, avisar, "Cambio de estado", `El mandado "${m.tipo}" pasó a ${estado}.`, estado === "CANCELADO" ? "alerta" : "info");
    n = pushAudit(n, por, "Cambio de estado", "Mandados", `"${m.tipo}" → ${estado}.`);
    return n;
  });

  const asignarEmpleado: Ctx["asignarEmpleado"] = (mandadoId, empleadoId) => setState((p) => {
    const m = p.mandados.find((x) => x.id === mandadoId);
    const emp = p.usuarios.find((x) => x.id === empleadoId);
    if (!m || !emp) return p;
    const por = me()?.nombre ?? "Administración";
    let n: AppState = {
      ...p,
      mandados: p.mandados.map((x) =>
        x.id === mandadoId
          ? {
              ...x, empleadoId,
              estado: x.estado === "SOLICITADO" || x.estado === "RECIBIDO" ? "ASIGNADO" : x.estado,
              historial: [...x.historial, { fecha: ahora(), por, estado: x.estado, nota: `Asignado a ${emp.nombre}.` }],
            }
          : x,
      ),
    };
    n = pushNotif(n, [empleadoId], "Servicio asignado", `Tienes un nuevo servicio: ${m.tipo} (${m.fecha} ${m.hora}).`, "info");
    n = pushNotif(n, [m.clientId, m.solicitadoPorId].filter((v, i, a) => a.indexOf(v) === i), "Mandado asignado", `${emp.nombre} realizará tu mandado "${m.tipo}".`, "exito");
    n = pushAudit(n, por, "Asignación", "Mandados", `Asignó "${m.tipo}" a ${emp.nombre}.`);
    return n;
  });

  const agregarMensaje: Ctx["agregarMensaje"] = (mandadoId, texto) => setState((p) => {
    const m = p.mandados.find((x) => x.id === mandadoId);
    const autor = me();
    if (!m || !autor) return p;
    const msg = { id: uid(), de: autor.id, texto, fecha: ahora(), leido: false };
    const otro = autor.id === m.clientId || autor.id === m.solicitadoPorId ? m.empleadoId : m.clientId;
    let n: AppState = {
      ...p,
      mandados: p.mandados.map((x) => (x.id === mandadoId ? { ...x, mensajes: [...x.mensajes, msg] } : x)),
    };
    if (otro) n = pushNotif(n, [otro], "Nuevo mensaje", `${autor.nombre}: ${texto.slice(0, 80)}`, "info");
    return n;
  });

  const marcarChatLeido: Ctx["marcarChatLeido"] = (mandadoId) => setState((p) => {
    const yo = p.currentUserId;
    return {
      ...p,
      mandados: p.mandados.map((x) =>
        x.id === mandadoId ? { ...x, mensajes: x.mensajes.map((ms) => (ms.de !== yo ? { ...ms, leido: true } : ms)) } : x,
      ),
    };
  });

  const reportarUbicacion: Ctx["reportarUbicacion"] = (mandadoId, ubi) => setState((p) => {
    const por = me()?.nombre ?? "Empleado";
    let n: AppState = {
      ...p,
      mandados: p.mandados.map((x) => (x.id === mandadoId ? { ...x, ubicacion: ubi } : x)),
    };
    const m = p.mandados.find((x) => x.id === mandadoId);
    if (m) n = pushNotif(n, [m.clientId, m.solicitadoPorId].filter((v, i, a) => a.indexOf(v) === i), "Ubicación actualizada", `${por} compartió su ubicación en el mandado "${m.tipo}".`, "info");
    return pushAudit(n, por, "GPS", "Mandados", "Compartió ubicación durante un servicio.");
  });

  const cancelarMandado: Ctx["cancelarMandado"] = (id, motivo) => setState((p) => {
    const m = p.mandados.find((x) => x.id === id);
    if (!m) return p;
    const por = me()?.nombre ?? "Usuario";
    let n: AppState = {
      ...p,
      mandados: p.mandados.map((x) =>
        x.id === id ? { ...x, estado: "CANCELADO", historial: [...x.historial, { fecha: ahora(), por, estado: "CANCELADO", nota: `Cancelado. Motivo: ${motivo}` }] } : x,
      ),
    };
    n = pushNotif(n, [...idsDeRoles(p, ["encargado", "superadmin"]), ...(m.empleadoId ? [m.empleadoId] : [])], "Mandado cancelado", `"${m.tipo}" fue cancelado por ${por}.`, "alerta");
    return pushAudit(n, por, "Cancelación", "Mandados", `Canceló "${m.tipo}". Motivo: ${motivo}`);
  });

  /* ---------- Emergencias ---------- */
  const activarEmergencia: Ctx["activarEmergencia"] = (ubi) => {
    const s = ref.current;
    const u = s.usuarios.find((x) => x.id === s.currentUserId);
    const e: Emergencia = {
      id: uid(), userId: u?.id ?? "", fecha: ahora(), telefono: u?.telefono ?? "",
      direccion: u?.direccion ?? "", ubicacion: ubi, estado: "Activa",
      contactos: u?.contactos ?? [], atendidoPor: "",
      historial: [{ fecha: ahora(), por: u?.nombre ?? "Usuario", nota: "Botón de pánico activado." }],
    };
    setState((p) => {
      const d = p.config.destinatariosEmergencia;
      const roles: Rol[] = [];
      if (d.encargados) roles.push("encargado");
      if (d.administradores) roles.push("superadmin");
      if (d.empleados) roles.push("empleado");
      let n = pushNotif(
        { ...p, emergencias: [e, ...p.emergencias] }, idsDeRoles(p, roles),
        "🚨 EMERGENCIA ACTIVADA", `${u?.nombre ?? "Usuario"} activó el botón de pánico.`, "emergencia",
      );
      n = pushAudit(n, u?.nombre ?? "Usuario", "Pánico", "Emergencias", "Activó el botón de pánico.");
      return n;
    });
    return e;
  };

  const cambiarEstadoEmergencia: Ctx["cambiarEstadoEmergencia"] = (id, estado) => setState((p) => {
    const por = me()?.nombre ?? "Administración";
    let n: AppState = {
      ...p,
      emergencias: p.emergencias.map((x) =>
        x.id === id
          ? {
              ...x, estado,
              atendidoPor: estado === "En atención" && !x.atendidoPor ? por : x.atendidoPor,
              historial: [...x.historial, { fecha: ahora(), por, nota: `Estado cambiado a: ${estado}.` }],
            }
          : x,
      ),
    };
    const e = p.emergencias.find((x) => x.id === id);
    const nom = p.usuarios.find((x) => x.id === e?.userId)?.nombre ?? "";
    if (e) n = pushNotif(n, [e.userId], "Actualización de emergencia", `Tu emergencia pasó a "${estado}".`, estado === "Cerrada" ? "exito" : "info");
    return pushAudit(n, por, "Atención", "Emergencias", `Emergencia de ${nom} → ${estado}.`);
  });

  const notaEmergencia: Ctx["notaEmergencia"] = (id, nota) => setState((p) => {
    const por = me()?.nombre ?? "—";
    return {
      ...p,
      emergencias: p.emergencias.map((x) => (x.id === id ? { ...x, historial: [...x.historial, { fecha: ahora(), por, nota }] } : x)),
    };
  });

  /* ---------- Salud ---------- */
  const getSalud: Ctx["getSalud"] = (clientId) => {
    const u = ref.current.usuarios.find((x) => x.id === clientId);
    return ref.current.salud[clientId] ?? saludVacia(u?.rh, u?.custom.eps, u?.enfermedadesAtencion);
  };

  const updateSalud: Ctx["updateSalud"] = (clientId, fn, accion = "Edición") => setState((p) => {
    const base = p.salud[clientId] ?? saludVacia();
    const por = me()?.nombre ?? "Usuario";
    return pushAudit(
      { ...p, salud: { ...p.salud, [clientId]: fn(base) } }, por, accion, "Salud", "Actualizó información médica.",
    );
  });

  /* ---------- Ventas de garaje ---------- */
  const addVenta: Ctx["addVenta"] = (v) => setState((p) => {
    const por = me()?.nombre ?? "Usuario";
    const venta: VentaGaraje = { ...v, id: uid(), fecha: ahora(), vendido: false };
    return pushAudit({ ...p, ventas: [venta, ...p.ventas] }, por, "Publicación", "Ventas de garaje", `Publicó "${v.titulo}".`);
  });
  const toggleVendido = (id: string) => setState((p) => ({
    ...p, ventas: p.ventas.map((v) => (v.id === id ? { ...v, vendido: !v.vendido } : v)),
  }));
  const delVenta = (id: string) => setState((p) => ({ ...p, ventas: p.ventas.filter((v) => v.id !== id) }));

  /* ---------- Configuración ---------- */
  const setConfig: Ctx["setConfig"] = (fn, detalle = "Ajuste de configuración") => setState((p) =>
    pushAudit({ ...p, config: fn(p.config) }, me()?.nombre ?? "Administración", "Configuración", "Plataforma", detalle),
  );

  const marcarNotifsLeidas = () => setState((p) => {
    const yo = p.currentUserId;
    return { ...p, notificaciones: p.notificaciones.map((n) => (n.para === yo ? { ...n, leida: true } : n)) };
  });

  const notificar: Ctx["notificar"] = (para, titulo, cuerpo, tipo = "info") =>
    setState((p) => pushNotif(p, para, titulo, cuerpo, tipo));

  const actualizarUsuario: Ctx["actualizarUsuario"] = (id, patch) => setState((p) => {
    const u = p.usuarios.find((x) => x.id === id);
    return pushAudit(
      { ...p, usuarios: p.usuarios.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
      me()?.nombre ?? "—", "Edición", "Usuarios", `Actualizó el perfil de ${u?.nombre ?? id}.`,
    );
  });

  const value: Ctx = {
    state, user, toasts, t, lang, setLang, toast,
    login, logout, registrar, aprobarUsuario, rechazarUsuario, toggleUsuario,
    crearMandado, cambiarEstadoMandado, asignarEmpleado, agregarMensaje, marcarChatLeido,
    reportarUbicacion, cancelarMandado, activarEmergencia, cambiarEstadoEmergencia, notaEmergencia,
    getSalud, updateSalud, addVenta, toggleVendido, delVenta, setConfig, marcarNotifsLeidas,
    notificar, actualizarUsuario,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
