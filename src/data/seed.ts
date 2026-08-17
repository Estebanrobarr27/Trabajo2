import type { AppState, User, Errand, Emergencia } from "../types";
import { ahora, diasDesdeHoy, isoDiasAtras } from "../types";

/* ============================================================
   Datos iniciales de la plataforma (demo funcional).
   En producción esta semilla se reemplaza por la base de datos
   (Supabase/PostgreSQL + RLS). Ningún dato médico real debe
   inventarse aquí: son ejemplos editables por el administrador.
   ============================================================ */

const hoy = diasDesdeHoy(0);

const mkUser = (u: Partial<User> & Pick<User, "id" | "rol" | "nombre" | "email" | "telefono">): User => ({
  password: "123456",
  estado: "activo",
  tipoId: "CC",
  numeroId: "",
  pais: "Colombia",
  ciudad: "Bogotá",
  rh: "",
  fechaNacimiento: "",
  direccion: "",
  enfermedadesAtencion: "",
  contactos: [],
  disponibilidad: "Disponible",
  cargo: "",
  fechaIngreso: "",
  linkedClientId: null,
  aprobadoPor: "Sistema",
  aprobadoEl: isoDiasAtras(60),
  fechaRegistro: isoDiasAtras(60),
  custom: {},
  ...u,
});

const usuarios: User[] = [
  mkUser({
    id: "u-gloria", rol: "superadmin", nombre: "Gloria Ramírez", email: "gloria@juventudes.co",
    telefono: "601 555 0101", password: "admin123", cargo: "Superadministradora", fechaIngreso: "2022-01-10",
  }),
  mkUser({
    id: "u-andres", rol: "encargado", nombre: "Andrés Pérez", email: "andres@juventudes.co",
    telefono: "300 555 1010", password: "encargado123", cargo: "Coordinador de servicios", fechaIngreso: "2022-03-01",
  }),
  mkUser({
    id: "u-luis", rol: "empleado", nombre: "Luis Martínez", email: "luis@juventudes.co",
    telefono: "310 555 2020", password: "empleado123", cargo: "Auxiliar de mandados",
    fechaIngreso: "2023-02-15", disponibilidad: "Disponible",
  }),
  mkUser({
    id: "u-carolina", rol: "empleado", nombre: "Carolina Díaz", email: "carolina@juventudes.co",
    telefono: "311 555 3030", password: "empleado123", cargo: "Auxiliar de mandados",
    fechaIngreso: "2023-06-20", disponibilidad: "Ocupado",
  }),
  mkUser({
    id: "u-maria", rol: "cliente", nombre: "María Fernanda López", email: "cliente@juventudes.co",
    telefono: "315 555 4040", password: "cliente123", tipoId: "CC", numeroId: "41.587.963",
    rh: "O+", fechaNacimiento: "1947-03-12", direccion: "Cra 15 #82-45, Apto 302, Chapinero, Bogotá",
    enfermedadesAtencion: "Hipertensión arterial y diabetes tipo 2",
    contactos: [
      { id: "c1", nombre: "Jorge López", parentesco: "Hijo", telefono: "310 555 2211" },
      { id: "c2", nombre: "Marta Ruiz", parentesco: "Sobrina", telefono: "311 555 3322" },
    ],
    custom: { viveSolo: "Sí" },
  }),
  mkUser({
    id: "u-rosa", rol: "cliente", nombre: "Rosa Elvira Mejía", email: "rosa@correo.co",
    telefono: "316 555 5050", password: "rosa123", tipoId: "CC", numeroId: "28.445.102",
    rh: "A+", fechaNacimiento: "1942-11-05", direccion: "Calle 100 #14-20, Usaquén, Bogotá",
    enfermedadesAtencion: "Artrosis de rodilla, riesgo de caída",
    contactos: [
      { id: "c3", nombre: "Claudia Mejía", parentesco: "Hija", telefono: "312 555 6060" },
      { id: "c4", nombre: "Pedro Mejía", parentesco: "Hijo", telefono: "313 555 7070" },
    ],
  }),
  mkUser({
    id: "u-juan", rol: "familiar", nombre: "Juan Pablo López", email: "familiar@juventudes.co",
    telefono: "310 555 2211", password: "familiar123", tipoId: "CC", numeroId: "79.654.321",
    linkedClientId: "u-maria", pais: "Colombia", ciudad: "Bogotá",
  }),
  mkUser({
    id: "u-carlos", rol: "cliente", nombre: "Carlos Rodríguez", email: "carlos.rodriguez@correo.co",
    telefono: "318 555 8080", password: "carlos123", estado: "pendiente", tipoId: "CE",
    numeroId: "E-88.123.456", pais: "España", ciudad: "Medellín", rh: "B+",
    fechaNacimiento: "1951-07-22", direccion: "Cra 35 #10-18, El Poblado, Medellín",
    enfermedadesAtencion: "Asma leve",
    contactos: [
      { id: "c5", nombre: "Lucía Rodríguez", parentesco: "Esposa", telefono: "318 555 9090" },
      { id: "c6", nombre: "Ana Rodríguez", parentesco: "Hija", telefono: "319 555 0101" },
    ],
    aprobadoPor: "", aprobadoEl: "", fechaRegistro: isoDiasAtras(1, 3),
  }),
];

const mandados: Errand[] = [
  {
    id: "m-1", clientId: "u-maria", solicitadoPorId: "u-maria", tipo: "Mercado y domicilios",
    descripcion: "Mercado de la semana: frutas, verduras y leche deslactosada.",
    productos: [
      { nombre: "Leche deslactosada", cantidad: "6 litros", marca: "Alpina" },
      { nombre: "Banano", cantidad: "2 kilos", marca: "" },
      { nombre: "Pan integral", cantidad: "2 paquetes", marca: "Bimbo" },
    ],
    instrucciones: "La leche debe ser deslactosada, la señora María no la puede cambiar. Entregar en portería si no responde.",
    establecimiento: "Supermercado Exito Chapinero", dirOrigen: "Cra 13 #57-10, Chapinero",
    dirEntrega: "Cra 15 #82-45, Apto 302, Chapinero, Bogotá", fecha: hoy, hora: "10:00",
    observaciones: "Pagar con efectivo entregado por la clienta.",
    estado: "REALIZANDO MANDADO", empleadoId: "u-luis",
    historial: [
      { fecha: isoDiasAtras(1, 4), por: "María Fernanda López", estado: "SOLICITADO", nota: "Solicitud creada desde la aplicación." },
      { fecha: isoDiasAtras(1, 3), por: "Andrés Pérez", estado: "RECIBIDO", nota: "Solicitud revisada y aceptada." },
      { fecha: isoDiasAtras(1, 2), por: "Andrés Pérez", estado: "ASIGNADO", nota: "Asignado a Luis Martínez." },
      { fecha: isoDiasAtras(0, 3), por: "Luis Martínez", estado: "EN CAMINO", nota: "Voy hacia el supermercado." },
      { fecha: isoDiasAtras(0, 1), por: "Luis Martínez", estado: "REALIZANDO MANDADO", nota: "Comprando los productos de la lista." },
    ],
    mensajes: [
      { id: "ms1", de: "u-maria", texto: "Buenos días, don Luis. ¿Me puede traer también un paquete de café?", fecha: isoDiasAtras(0, 2), leido: true },
      { id: "ms2", de: "u-luis", texto: "¡Claro que sí, doña María! Se lo llevo con el mercado.", fecha: isoDiasAtras(0, 2), leido: true },
      { id: "ms3", de: "u-luis", texto: "Ya terminé las compras, voy en camino a su apartamento.", fecha: isoDiasAtras(0, 1), leido: false },
    ],
    ubicacion: { lat: 4.6311, lng: -74.0836, fecha: isoDiasAtras(0, 1), precisa: true },
    valor: 18000, custom: {},
  },
  {
    id: "m-2", clientId: "u-maria", solicitadoPorId: "u-juan", tipo: "Medicamentos",
    descripcion: "Compra de medicamentos de la fórmula mensual en la droguería.",
    productos: [
      { nombre: "Losartán 50 mg", cantidad: "1 caja (30)", marca: "MK" },
      { nombre: "Metformina 850 mg", cantidad: "1 caja (60)", marca: "Genfar" },
    ],
    instrucciones: "Llevar la fórmula médica escaneada. Si no hay MK, servir genérico certificado.",
    establecimiento: "Droguería La Rebaja Chapinero", dirOrigen: "Calle 57 #13-45",
    dirEntrega: "Cra 15 #82-45, Apto 302, Chapinero, Bogotá", fecha: diasDesdeHoy(1), hora: "15:30",
    observaciones: "Solicitado por su hijo Juan Pablo (autorizado).",
    estado: "SOLICITADO", empleadoId: null,
    historial: [{ fecha: isoDiasAtras(0, 5), por: "Juan Pablo López", estado: "SOLICITADO", nota: "Solicitud creada por familiar autorizado." }],
    mensajes: [], ubicacion: null, valor: 9000, custom: {},
  },
  {
    id: "m-3", clientId: "u-maria", solicitadoPorId: "u-maria", tipo: "Transporte",
    descripcion: "Acompañamiento y transporte a la cita de cardiología.",
    productos: [], instrucciones: "Esperar en el consultorio hasta que termine la cita y acompañarla de regreso a casa.",
    establecimiento: "Fundación Santa Fe", dirOrigen: "Cra 7 #131-10, Usaquén",
    dirEntrega: "Cra 15 #82-45, Apto 302, Chapinero, Bogotá", fecha: diasDesdeHoy(-3), hora: "08:00",
    observaciones: "Llevar carnet de la EPS.",
    estado: "COMPLETADO", empleadoId: "u-carolina",
    historial: [
      { fecha: isoDiasAtras(4), por: "María Fernanda López", estado: "SOLICITADO", nota: "" },
      { fecha: isoDiasAtras(4), por: "Andrés Pérez", estado: "ASIGNADO", nota: "Asignado a Carolina Díaz." },
      { fecha: isoDiasAtras(3, 5), por: "Carolina Díaz", estado: "EN CAMINO", nota: "" },
      { fecha: isoDiasAtras(3, 1), por: "Carolina Díaz", estado: "COMPLETADO", nota: "Cita atendida, la señora llegó bien a casa." },
    ],
    mensajes: [], ubicacion: null, valor: 35000, custom: {},
  },
  {
    id: "m-4", clientId: "u-maria", solicitadoPorId: "u-maria", tipo: "Correspondencia",
    descripcion: "Recoger un paquete certificado en la oficina de correo.",
    productos: [{ nombre: "Paquete certificado #CP4471", cantidad: "1", marca: "" }],
    instrucciones: "Presentar la cédula de la señora María para reclamar el paquete.",
    establecimiento: "Servientra Chapinero", dirOrigen: "Calle 63 #14-30",
    dirEntrega: "Cra 15 #82-45, Apto 302, Chapinero, Bogotá", fecha: hoy, hora: "17:00",
    observaciones: "",
    estado: "RECIBIDO", empleadoId: null,
    historial: [
      { fecha: isoDiasAtras(0, 6), por: "María Fernanda López", estado: "SOLICITADO", nota: "" },
      { fecha: isoDiasAtras(0, 4), por: "Andrés Pérez", estado: "RECIBIDO", nota: "En cola de asignación." },
    ],
    mensajes: [], ubicacion: null, valor: 8000, custom: {},
  },
];

const emergencias: Emergencia[] = [
  {
    id: "e-1", userId: "u-rosa", fecha: isoDiasAtras(0, 2), telefono: "316 555 5050",
    direccion: "Calle 100 #14-20, Usaquén, Bogotá",
    ubicacion: { lat: 4.6908, lng: -74.0351, fecha: isoDiasAtras(0, 2), precisa: true },
    estado: "En atención",
    contactos: [
      { id: "c3", nombre: "Claudia Mejía", parentesco: "Hija", telefono: "312 555 6060" },
      { id: "c4", nombre: "Pedro Mejía", parentesco: "Hijo", telefono: "313 555 7070" },
    ],
    atendidoPor: "Andrés Pérez",
    historial: [
      { fecha: isoDiasAtras(0, 2), por: "Rosa Elvira Mejía", nota: "Botón de pánico activado." },
      { fecha: isoDiasAtras(0, 2), por: "Sistema", nota: "Notificados: coordinadores, administradores y contactos de emergencia." },
      { fecha: isoDiasAtras(0, 1), por: "Andrés Pérez", nota: "Luis Martínez se desplazó al lugar. Estado: en atención." },
    ],
  },
  {
    id: "e-2", userId: "u-maria", fecha: isoDiasAtras(21), telefono: "315 555 4040",
    direccion: "Cra 15 #82-45, Apto 302, Chapinero, Bogotá", ubicacion: null,
    estado: "Cerrada",
    contactos: [
      { id: "c1", nombre: "Jorge López", parentesco: "Hijo", telefono: "310 555 2211" },
      { id: "c2", nombre: "Marta Ruiz", parentesco: "Sobrina", telefono: "311 555 3322" },
    ],
    atendidoPor: "Gloria Ramírez",
    historial: [
      { fecha: isoDiasAtras(21), por: "María Fernanda López", nota: "Botón de pánico activado por prueba solicitada." },
      { fecha: isoDiasAtras(21), por: "Gloria Ramírez", nota: "Confirmada como prueba. Cerrada sin novedad." },
    ],
  },
];

export const seedState = (): AppState => ({
  version: 1,
  idioma: "es",
  currentUserId: null,
  usuarios,
  mandados,
  emergencias,
  ventas: [
    {
      id: "v-1", vendedorId: "u-maria", titulo: "Máquina de coser Singer clásica",
      descripcion: "En excelente estado, con pedal original y accesorios. Ideal para coleccionistas.",
      precio: 250000, categoria: "Hogar", contacto: "315 555 4040", fecha: isoDiasAtras(5), vendido: false,
    },
    {
      id: "v-2", vendedorId: "u-rosa", titulo: "Radio antigua de madera",
      descripcion: "Radio de los años 60, funciona perfectamente. Sonido cálido y único.",
      precio: 180000, categoria: "Electrodomésticos", contacto: "316 555 5050", fecha: isoDiasAtras(3), vendido: false,
    },
    {
      id: "v-3", vendedorId: "u-juan", titulo: "Juego de sillas de comedor (4)",
      descripcion: "Sillas de madera de cedro, restauradas y tapizadas nuevas.",
      precio: 420000, categoria: "Muebles", contacto: "310 555 2211", fecha: isoDiasAtras(9), vendido: true,
    },
  ],
  notificaciones: [
    {
      id: "n-1", para: "u-maria", titulo: "Tu mandado está en camino",
      cuerpo: "Luis Martínez va en camino con tu mercado. Puedes seguirlo desde Mis mandados.",
      fecha: isoDiasAtras(0, 3), leida: false, tipo: "info",
    },
    {
      id: "n-2", para: "u-maria", titulo: "Cita médica próxima",
      cuerpo: "Recuerda tu cita de Cardiología. Te avisaremos 3 días antes.",
      fecha: isoDiasAtras(1), leida: false, tipo: "alerta",
    },
    {
      id: "n-3", para: "u-luis", titulo: "Servicio asignado",
      cuerpo: "Tienes asignado el mercado de María Fernanda López para hoy a las 10:00.",
      fecha: isoDiasAtras(1, 2), leida: true, tipo: "info",
    },
    {
      id: "n-4", para: "u-andres", titulo: "Registro por aprobar",
      cuerpo: "Carlos Rodríguez solicitó una cuenta y espera tu aprobación.",
      fecha: isoDiasAtras(1, 3), leida: false, tipo: "alerta",
    },
    {
      id: "n-5", para: "u-gloria", titulo: "Registro por aprobar",
      cuerpo: "Carlos Rodríguez solicitó una cuenta y espera aprobación.",
      fecha: isoDiasAtras(1, 3), leida: false, tipo: "alerta",
    },
  ],
  auditoria: [
    { id: "a-1", fecha: isoDiasAtras(1, 3), usuario: "Sistema", accion: "Registro", modulo: "Usuarios", detalle: "Carlos Rodríguez solicitó registro como cliente." },
    { id: "a-2", fecha: isoDiasAtras(1, 2), usuario: "Andrés Pérez", accion: "Asignación", modulo: "Mandados", detalle: "Asignó el mercado m-1 a Luis Martínez." },
    { id: "a-3", fecha: isoDiasAtras(0, 2), usuario: "Rosa Elvira Mejía", accion: "Pánico", modulo: "Emergencias", detalle: "Activó el botón de pánico desde su dispositivo." },
    { id: "a-4", fecha: isoDiasAtras(0, 1), usuario: "Andrés Pérez", accion: "Atención", modulo: "Emergencias", detalle: "Marcó la emergencia e-1 como 'En atención'." },
    { id: "a-5", fecha: isoDiasAtras(0, 5), usuario: "Juan Pablo López", accion: "Creación", modulo: "Mandados", detalle: "Creó solicitud de medicamentos para María Fernanda López." },
  ],
  salud: {
    "u-maria": {
      privacidad: false, rh: "O+", eps: "Sanitas",
      enfermedadesAtencion: "Hipertensión arterial y diabetes tipo 2",
      medicamentos: [
        { id: "med1", nombre: "Losartán", dosis: "50 mg", frecuencia: "1 vez al día", horario: "7:00 a. m.", inicio: "2023-01-10", fin: "", observaciones: "Tomar con el desayuno." },
        { id: "med2", nombre: "Metformina", dosis: "850 mg", frecuencia: "2 veces al día", horario: "8:00 a. m. y 8:00 p. m.", inicio: "2022-06-01", fin: "", observaciones: "Con las comidas." },
      ],
      alergias: [{ id: "al1", tipo: "Medicamento", descripcion: "Penicilina", gravedad: "Grave" }],
      antecedentes: [
        { id: "an1", tipo: "Cirugía", descripcion: "Cirugía de cataratas (ojo derecho)", fecha: "2019-08-14" },
        { id: "an2", tipo: "Diagnóstico", descripcion: "Hipertensión arterial esencial", fecha: "2010-05-02" },
      ],
      citas: [
        { id: "ci1", fecha: diasDesdeHoy(9), hora: "09:30", medico: "Dra. Camila Reyes", especialidad: "Cardiología", lugar: "Fundación Santa Fe, Usaquén", motivo: "Control de presión arterial", estado: "Programada" },
        { id: "ci2", fecha: diasDesdeHoy(-20), hora: "10:00", medico: "Dr. Iván Castro", especialidad: "Endocrinología", lugar: "Clínica Shaio", motivo: "Control de glicemia", estado: "Completada" },
      ],
      alertas: [
        { id: "alm1", tipo: "Alergia grave", texto: "Alergia grave a la penicilina." },
        { id: "alm2", tipo: "Riesgo de caída", texto: "Usa bastón en superficies irregulares." },
      ],
      custom: {},
    },
    "u-rosa": {
      privacidad: false, rh: "A+", eps: "Sura",
      enfermedadesAtencion: "Artrosis de rodilla, riesgo de caída",
      medicamentos: [
        { id: "med3", nombre: "Acetaminofén", dosis: "500 mg", frecuencia: "Cada 8 horas si hay dolor", horario: "Según necesidad", inicio: "2024-02-01", fin: "", observaciones: "No exceder 3 g al día." },
      ],
      alergias: [], antecedentes: [{ id: "an3", tipo: "Diagnóstico", descripcion: "Artrosis de rodilla bilateral", fecha: "2020-03-11" }],
      citas: [{ id: "ci3", fecha: diasDesdeHoy(4), hora: "11:00", medico: "Dr. Andrés Umaña", especialidad: "Ortopedia", lugar: "Hospital San José", motivo: "Valoración de rodilla", estado: "Programada" }],
      alertas: [{ id: "alm3", tipo: "Riesgo de caída", texto: "Requiere acompañamiento en escaleras." }],
      custom: {},
    },
  },
  config: {
    nombreEmpresa: "Juventudes",
    eslogan: "Asistencia y mandados con corazón, para personas mayores en Colombia.",
    telefonoContacto: "601 555 0100",
    emailContacto: "hola@juventudes.co",
    ciudad: "Bogotá, Colombia",
    tasaUSD: 4120,
    tasaEUR: 4485,
    tasaFecha: hoy,
    tiles: [
      { id: "t-transporte", label: "Transporte", labelEn: "Transport", icon: "bus", color: "pine", url: "", interno: "mandado:Transporte", activo: true },
      { id: "t-apoyo", label: "Apoyo y compañía", labelEn: "Support & company", icon: "heart", color: "marigold", url: "", interno: "mandado:Apoyo y compañía", activo: true },
      { id: "t-salud", label: "Servicios médicos", labelEn: "Health services", icon: "medical", color: "coral", url: "", interno: "salud", activo: true },
      { id: "t-correspondencia", label: "Correspondencia", labelEn: "Mail & parcels", icon: "mail", color: "blue", url: "", interno: "mandado:Correspondencia", activo: true },
      { id: "t-diligencias", label: "Diligencias personales", labelEn: "Personal errands", icon: "briefcase", color: "plum", url: "", interno: "mandado:Diligencias personales", activo: true },
      { id: "t-conductores", label: "Conductores elegidos", labelEn: "Trusted drivers", icon: "wheel", color: "teal", url: "", interno: "conductores", activo: true },
      { id: "t-ventas", label: "Ventas de garaje", labelEn: "Garage sales", icon: "tag", color: "olive", url: "", interno: "ventas", activo: true },
      { id: "t-escoltas", label: "Escoltas y seguridad", labelEn: "Escorts & security", icon: "shield", color: "slate", url: "", interno: "seguridad", activo: true },
    ],
    tarifas: [
      { id: "tf1", servicio: "Mercado y domicilio", servicioEn: "Groceries & delivery", precio: 18000, unidad: "por mandado" },
      { id: "tf2", servicio: "Mandado exprés", servicioEn: "Express errand", precio: 12000, unidad: "por mandado" },
      { id: "tf3", servicio: "Compra de medicamentos", servicioEn: "Medication purchase", precio: 9000, unidad: "por mandado" },
      { id: "tf4", servicio: "Correspondencia y paquetes", servicioEn: "Mail & parcels", precio: 8000, unidad: "por mandado" },
      { id: "tf5", servicio: "Diligencias personales", servicioEn: "Personal errands", precio: 15000, unidad: "por mandado" },
      { id: "tf6", servicio: "Acompañamiento y apoyo", servicioEn: "Companionship & support", precio: 30000, unidad: "por hora" },
      { id: "tf7", servicio: "Traslado acompañado a EPS", servicioEn: "Assisted EPS transfer", precio: 25000, unidad: "por traslado" },
      { id: "tf8", servicio: "Transporte asistido", servicioEn: "Assisted transport", precio: 35000, unidad: "por hora" },
      { id: "tf9", servicio: "Escolta y seguridad privada", servicioEn: "Escort & private security", precio: 60000, unidad: "por hora" },
    ],
    enlaces: [
      { id: "e1", nombre: "El Tiempo", url: "https://www.eltiempo.com", categoria: "Noticias" },
      { id: "e2", nombre: "El Espectador", url: "https://www.elespectador.com", categoria: "Noticias" },
      { id: "e3", nombre: "Blu Radio", url: "https://www.bluradio.com", categoria: "Noticias" },
      { id: "e4", nombre: "Policía Nacional de Colombia", url: "https://www.policia.gov.co", categoria: "Instituciones" },
      { id: "e5", nombre: "Ministerio de Salud", url: "https://www.minsalud.gov.co", categoria: "Salud" },
      { id: "e6", nombre: "EPS Sanitas", url: "https://www.epssanitas.com", categoria: "Salud" },
      { id: "e7", nombre: "Alcaldía de Bogotá", url: "https://www.bogota.gov.co", categoria: "Instituciones" },
    ],
    noticias: [
      { id: "no1", titulo: "Bogotá amplía horarios de atención prioritaria para adultos mayores en bancos y notarías", resumen: "La medida busca reducir las filas y los tiempos de espera para las personas mayores en trámites presenciales.", fuente: "El Tiempo", fecha: isoDiasAtras(1), url: "https://www.eltiempo.com" },
      { id: "no2", titulo: "Jornada nacional de vacunación: puntos especiales para mayores de 60 años", resumen: "Las secretarías de salud habilitaron carpas prioritarias en parques principales durante todo el mes.", fuente: "Blu Radio", fecha: isoDiasAtras(2), url: "https://www.bluradio.com" },
      { id: "no3", titulo: "Programa de acompañamiento telefónico llega a 12.000 personas mayores", resumen: "Voluntarios llaman semanalmente a adultos mayores que viven solos para verificar su bienestar.", fuente: "El Espectador", fecha: isoDiasAtras(4), url: "https://www.elespectador.com" },
      { id: "no4", titulo: "TransMilenio estrena vagones preferenciales con asientos ampliados", resumen: "Los nuevos espacios priorizan a personas mayores, mujeres embarazadas y personas con movilidad reducida.", fuente: "El Tiempo", fecha: isoDiasAtras(6), url: "https://www.eltiempo.com" },
    ],
    stats: [
      { id: "s1", label: "Percepción de seguridad urbana", valor: "38 %", nota: "Personas que se sienten seguras en su barrio (encuesta nacional, configurable)." },
      { id: "s2", label: "Homicidios por cada 100.000 hab.", valor: "24,3", nota: "Tasa nacional anual reportada por autoridades." },
      { id: "s3", label: "Reducción de hurtos en Bogotá", valor: "−17 %", nota: "Variación frente al año anterior en localidades priorizadas." },
      { id: "s4", label: "Policías de apoyo al ciudadano", valor: "21.400", nota: "Uniformados disponibles en la capital para acompañamiento." },
    ],
    conductores: [
      { id: "cd1", nombre: "Hernán Torres", telefono: "320 555 1111", vehiculo: "Toyota Corolla gris", placa: "JKL 421", rating: "4,9", nota: "Experiencia en transporte de adultos mayores. Silla de apoyo disponible.", activo: true },
      { id: "cd2", nombre: "Patricia Gómez", telefono: "321 555 2222", vehiculo: "Renault Duster blanca", placa: "MNO 873", rating: "5,0", nota: "Vehículo alto, fácil acceso. Acompaña hasta la puerta.", activo: true },
      { id: "cd3", nombre: "Rafael Ortiz", telefono: "322 555 3333", vehiculo: "Hyundai Accent azul", placa: "PQR 154", rating: "4,8", nota: "Disponibilidad nocturna para citas médicas tempranas.", activo: true },
    ],
    hospitales: [
      { id: "h1", nombre: "Hospital Universitario San Ignacio", direccion: "Cra 7 #40-62, Chapinero", telefono: "601 594 8800" },
      { id: "h2", nombre: "Fundación Santa Fe de Bogotá", direccion: "Cra 7 #131-10, Usaquén", telefono: "601 603 0303" },
      { id: "h3", nombre: "Clínica Shaio", direccion: "Diag 115 #89-55, Suba", telefono: "601 645 1100" },
      { id: "h4", nombre: "Hospital San José", direccion: "Cra 1 #36-70, Teusaquillo", telefono: "601 353 8008" },
    ],
    policias: [
      { id: "p1", nombre: "Estación de Policía Chapinero", direccion: "Calle 57 #13-20", telefono: "123" },
      { id: "p2", nombre: "Estación de Policía Usaquén", direccion: "Cra 7 #118-03", telefono: "123" },
      { id: "p3", nombre: "CAI Parque de la 93", direccion: "Cra 13 #93A-20", telefono: "123" },
    ],
    numerosEmergencia: [
      { id: "ne1", nombre: "Línea nacional de emergencias", numero: "123" },
      { id: "ne2", nombre: "Ambulancias (Cruz Roja)", numero: "125" },
      { id: "ne3", nombre: "Bomberos", numero: "119" },
      { id: "ne4", nombre: "Defensa Civil", numero: "132" },
      { id: "ne5", nombre: "Policía desde celular", numero: "112" },
      { id: "ne6", nombre: "Línea de orientación a la mujer", numero: "155" },
    ],
    tiposMandado: ["Mercado y domicilios", "Medicamentos", "Transporte", "Correspondencia", "Diligencias personales", "Apoyo y compañía", "Traslado EPS", "Otro"],
    estadosMandado: ["SOLICITADO", "RECIBIDO", "ASIGNADO", "EN CAMINO", "REALIZANDO MANDADO", "EN ENTREGA", "COMPLETADO", "CANCELADO"],
    cancelacionEstados: ["SOLICITADO", "RECIBIDO", "ASIGNADO"],
    cancelacionRequiereMotivo: true,
    chatHabilitado: true,
    gpsHabilitado: true,
    recordatoriosDias: 3,
    familiarAccesoSalud: true,
    destinatariosEmergencia: { encargados: true, administradores: true, empleados: true, contactos: true },
    camposDinamicos: [
      { id: "cf1", modulo: "registro", label: "¿Vive solo(a)?", labelEn: "Lives alone?", type: "si_no", requerido: true, visible: true, opciones: "Sí|No", orden: 1 },
      { id: "cf2", modulo: "registro", label: "¿Cómo supo de Juventudes?", labelEn: "How did you hear about us?", type: "seleccion", requerido: false, visible: true, opciones: "Un familiar|Publicidad|Recomendación|Otro", orden: 2 },
      { id: "cf3", modulo: "mandado", label: "Presupuesto máximo (COP)", labelEn: "Max budget (COP)", type: "numero", requerido: false, visible: true, opciones: "", orden: 1 },
      { id: "cf4", modulo: "salud", label: "Medicina prepagada o póliza", labelEn: "Prepaid health plan or policy", type: "texto", requerido: false, visible: true, opciones: "", orden: 1 },
    ],
  },
});

export const AHORA = ahora;
