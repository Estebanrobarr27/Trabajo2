/* ============================================================
   JUVENTUDES — Modelo de datos
   Capa de tipos pura. La persistencia actual usa localStorage
   (ver store.tsx); puede reemplazarse por Supabase (Auth +
   PostgreSQL + RLS) sin tocar la interfaz de la aplicación.
   ============================================================ */

export type Rol = "superadmin" | "encargado" | "empleado" | "cliente" | "familiar";
export type Idioma = "es" | "en";
export type EstadoUsuario = "pendiente" | "activo" | "inactivo";

export interface ContactoEmergencia {
  id: string;
  nombre: string;
  parentesco: string;
  telefono: string;
}

export interface User {
  id: string;
  rol: Rol;
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  estado: EstadoUsuario;
  tipoId: string;
  numeroId: string;
  pais: string;
  ciudad: string;
  rh: string;
  fechaNacimiento: string;
  direccion: string;
  enfermedadesAtencion: string;
  contactos: ContactoEmergencia[];
  disponibilidad: string;
  cargo: string;
  fechaIngreso: string;
  linkedClientId: string | null;
  aprobadoPor: string;
  aprobadoEl: string;
  fechaRegistro: string;
  custom: Record<string, string>;
}

export interface Producto {
  nombre: string;
  cantidad: string;
  marca: string;
}

export interface EventoMandado {
  fecha: string;
  por: string;
  estado: string;
  nota: string;
}

export interface Mensaje {
  id: string;
  de: string;
  texto: string;
  fecha: string;
  leido: boolean;
}

export interface Ubicacion {
  lat: number;
  lng: number;
  fecha: string;
  precisa: boolean;
}

export interface Errand {
  id: string;
  clientId: string;
  solicitadoPorId: string;
  tipo: string;
  descripcion: string;
  productos: Producto[];
  instrucciones: string;
  establecimiento: string;
  dirOrigen: string;
  dirEntrega: string;
  fecha: string;
  hora: string;
  observaciones: string;
  estado: string;
  empleadoId: string | null;
  historial: EventoMandado[];
  mensajes: Mensaje[];
  ubicacion: Ubicacion | null;
  valor: number | null;
  custom: Record<string, string>;
}

export type EstadoEmergencia = "Activa" | "En atención" | "Atendida" | "Cerrada";

export interface Emergencia {
  id: string;
  userId: string;
  fecha: string;
  telefono: string;
  direccion: string;
  ubicacion: Ubicacion | null;
  estado: EstadoEmergencia;
  contactos: ContactoEmergencia[];
  atendidoPor: string;
  historial: { fecha: string; por: string; nota: string }[];
}

export interface VentaGaraje {
  id: string;
  vendedorId: string;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
  contacto: string;
  fecha: string;
  vendido: boolean;
}

export interface Notif {
  id: string;
  para: string;
  titulo: string;
  cuerpo: string;
  fecha: string;
  leida: boolean;
  tipo: "info" | "exito" | "alerta" | "emergencia";
}

export interface AuditEntry {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  modulo: string;
  detalle: string;
}

/* ---------- Salud ---------- */
export interface Medicamento {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horario: string;
  inicio: string;
  fin: string;
  observaciones: string;
}
export interface Alergia {
  id: string;
  tipo: string;
  descripcion: string;
  gravedad: "Leve" | "Moderada" | "Grave";
}
export interface Antecedente {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
}
export interface CitaMedica {
  id: string;
  fecha: string;
  hora: string;
  medico: string;
  especialidad: string;
  lugar: string;
  motivo: string;
  estado: "Programada" | "Completada" | "Cancelada";
}
export interface AlertaMedica {
  id: string;
  tipo: string;
  texto: string;
}
export interface HealthRecord {
  privacidad: boolean;
  rh: string;
  eps: string;
  enfermedadesAtencion: string;
  medicamentos: Medicamento[];
  alergias: Alergia[];
  antecedentes: Antecedente[];
  citas: CitaMedica[];
  alertas: AlertaMedica[];
  custom: Record<string, string>;
}

/* ---------- Configuración dinámica ---------- */
export type FieldType =
  | "texto" | "texto_largo" | "numero" | "fecha" | "hora" | "fecha_hora"
  | "si_no" | "seleccion" | "seleccion_multiple" | "telefono" | "correo"
  | "direccion" | "archivo" | "imagen";

export interface CampoDinamico {
  id: string;
  modulo: string;
  label: string;
  labelEn: string;
  type: FieldType;
  requerido: boolean;
  visible: boolean;
  opciones: string;
  orden: number;
}

export interface Tile {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  url: string;
  interno: string;
  activo: boolean;
}
export interface Tarifa { id: string; servicio: string; servicioEn: string; precio: number; unidad: string; }
export interface EnlaceInteres { id: string; nombre: string; url: string; categoria: string; }
export interface Noticia { id: string; titulo: string; resumen: string; fuente: string; fecha: string; url: string; }
export interface StatPolicia { id: string; label: string; valor: string; nota: string; }
export interface Conductor { id: string; nombre: string; telefono: string; vehiculo: string; placa: string; rating: string; nota: string; activo: boolean; }
export interface LugarEmergencia { id: string; nombre: string; direccion: string; telefono: string; }
export interface NumeroEmergencia { id: string; nombre: string; numero: string; }

export interface PlatformConfig {
  nombreEmpresa: string;
  eslogan: string;
  telefonoContacto: string;
  emailContacto: string;
  ciudad: string;
  tasaUSD: number;
  tasaEUR: number;
  tasaFecha: string;
  colcap: string;
  sp500: string;
  tiles: Tile[];
  tarifas: Tarifa[];
  enlaces: EnlaceInteres[];
  noticias: Noticia[];
  stats: StatPolicia[];
  conductores: Conductor[];
  hospitales: LugarEmergencia[];
  policias: LugarEmergencia[];
  numerosEmergencia: NumeroEmergencia[];
  tiposMandado: string[];
  estadosMandado: string[];
  cancelacionEstados: string[];
  cancelacionRequiereMotivo: boolean;
  chatHabilitado: boolean;
  gpsHabilitado: boolean;
  recordatoriosDias: number;
  familiarAccesoSalud: boolean;
  destinatariosEmergencia: {
    encargados: boolean;
    administradores: boolean;
    empleados: boolean;
    contactos: boolean;
  };
  camposDinamicos: CampoDinamico[];
}

export interface AppState {
  version: number;
  idioma: Idioma;
  currentUserId: string | null;
  usuarios: User[];
  mandados: Errand[];
  emergencias: Emergencia[];
  ventas: VentaGaraje[];
  notificaciones: Notif[];
  auditoria: AuditEntry[];
  salud: Record<string, HealthRecord>;
  config: PlatformConfig;
}

/* ---------- Utilidades ---------- */
export const uid = () => Math.random().toString(36).slice(2, 10);
export const ahora = () => new Date().toISOString();

export const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export const fmtFecha = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};
export const fmtHora = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
};
export const diasDesdeHoy = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};
export const isoDiasAtras = (dias: number, horas = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(d.getHours() - horas);
  return d.toISOString();
};
