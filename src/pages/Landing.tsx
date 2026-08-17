import { useState } from "react";
import { useApp } from "../store";
import type { Idioma, Rol } from "../types";
import { Icon } from "../components/icons";
import { Btn, Field, Input, Select, Textarea, Logo } from "../components/ui";
import { DynamicFields } from "../components/DynamicFields";

type Vista = "login" | "registro" | "enviado";

const DEMOS = [
  { rol: "Persona mayor", email: "cliente@juventudes.co", pass: "cliente123", icon: "heart" },
  { rol: "Familiar", email: "familiar@juventudes.co", pass: "familiar123", icon: "users" },
  { rol: "Empleado", email: "luis@juventudes.co", pass: "empleado123", icon: "clipboard" },
  { rol: "Encargado", email: "andres@juventudes.co", pass: "encargado123", icon: "list" },
  { rol: "Superadmin", email: "gloria@juventudes.co", pass: "admin123", icon: "shield" },
];

export default function Landing() {
  const { t, lang, setLang, login, registrar, toast } = useApp();
  const [vista, setVista] = useState<Vista>("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [recover, setRecover] = useState(false);

  /* registro */
  const [paso, setPaso] = useState(1);
  const [rol, setRol] = useState<Rol>("cliente");
  const [f, setF] = useState({
    nombre: "", email: "", telefono: "", password: "", tipoId: "CC", numeroId: "",
    pais: "Colombia", ciudad: "", rh: "", fechaNacimiento: "", direccion: "",
    enfermedadesAtencion: "", eps: "",
  });
  const [c1, setC1] = useState({ nombre: "", parentesco: "", telefono: "" });
  const [c2, setC2] = useState({ nombre: "", parentesco: "", telefono: "" });
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [errPaso, setErrPaso] = useState("");

  const up = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const entrar = (em: string, pw: string) => {
    setError(""); setAviso("");
    const r = login(em, pw);
    if (r === "bad") setError(t("correoLbl") + " / " + t("contrasenaLbl") + ": datos incorrectos. Verifica e intenta de nuevo.");
    if (r === "pendiente") setAviso("pendiente");
    if (r === "inactivo") setAviso("inactivo");
    if (r === "ok") toast(t("bienvenida"), "ok");
  };

  const validarPaso = (p: number): boolean => {
    if (p === 1) {
      if (!f.nombre.trim() || !f.email.trim() || !f.telefono.trim() || !f.password.trim() || !f.numeroId.trim() || !f.ciudad.trim() || !f.fechaNacimiento) {
        setErrPaso("Completa todos los campos obligatorios (*) para continuar.");
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(f.email)) { setErrPaso("El correo electrónico no parece válido."); return false; }
      if (f.password.length < 6) { setErrPaso("La contraseña debe tener al menos 6 caracteres."); return false; }
    }
    if (p === 2) {
      if (!c1.nombre.trim() || !c1.telefono.trim() || !c2.nombre.trim() || !c2.telefono.trim()) {
        setErrPaso("Los dos contactos de emergencia son obligatorios (nombre y teléfono).");
        return false;
      }
    }
    setErrPaso("");
    return true;
  };

  const enviarRegistro = () => {
    registrar({
      ...f, rol,
      contactos: [
        { id: "c1", nombre: c1.nombre, parentesco: c1.parentesco, telefono: c1.telefono },
        { id: "c2", nombre: c2.nombre, parentesco: c2.parentesco, telefono: c2.telefono },
      ],
      custom,
    });
    setVista("enviado");
  };

  const LangSwitch = (
    <div className="flex rounded-full border-2 border-pine-200 bg-white p-1" role="group" aria-label={t("idiomaLbl")}>
      {(["es", "en"] as Idioma[]).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 text-sm font-black uppercase transition-colors ${lang === l ? "bg-pine-700 text-white" : "text-pine-700 hover:bg-pine-50"}`}>
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* -------- Panel de marca -------- */}
      <aside className="relative overflow-hidden bg-pine-800 px-6 py-8 sm:px-10 lg:min-h-screen lg:py-10 flex flex-col">
        <div className="tri-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[26px] border-pine-700/60" aria-hidden />
        <div className="absolute -left-16 bottom-24 h-64 w-64 rounded-full border-[20px] border-pine-700/40" aria-hidden />

        <div className="relative flex items-center justify-between gap-4">
          <Logo dark />
          {LangSwitch}
        </div>

        <div className="relative mt-8 grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:mt-4">
          <div>
            <p className="chip bg-marigold-400 text-pine-900 anim-rise">
              <Icon n="pin" size={16} /> Bogotá · Colombia — línea 123
            </p>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.04] text-white anim-rise d1">
              Cuidar a quienes <em className="text-marigold-300 not-italic underline decoration-marigold-400/50 decoration-4 underline-offset-8">nos cuidaron</em>
            </h1>
            <p className="mt-5 max-w-md text-lg text-pine-100/90 anim-rise d2">{t("tagline")}</p>
            <ul className="mt-7 grid max-w-md gap-3 text-white anim-rise d3">
              {[
                ["siren", "Botón de pánico con ubicación GPS, 24/7"],
                ["clipboard", "Mandados, medicamentos y diligencias con seguimiento"],
                ["calendar", "Citas médicas con recordatorios desde 3 días antes"],
                ["lock", "Información médica privada y protegida"],
              ].map(([ic, txt]) => (
                <li key={ic} className="flex items-center gap-3 rounded-xl bg-pine-700/50 px-4 py-3 backdrop-blur-sm border border-pine-600/50">
                  <span className="text-marigold-300"><Icon n={ic} size={22} /></span>
                  <span className="font-bold">{txt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden lg:block anim-rise d2">
            <div className="mx-auto flex w-[22rem] xl:w-[24rem] items-end justify-center overflow-hidden rounded-t-full rounded-b-3xl border-[10px] border-marigold-400/90 bg-pine-700 shadow-lift">
              <img
                src="https://image.qwenlm.ai/generated-images/10a457c6-b73f-43c2-9bb0-8cae49489002/_result.png"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                alt="Acompañante de Juventudes entregando un mercado a una persona mayor"
                className="h-[30rem] xl:h-[32rem] w-full object-cover"
              />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-marigold-300 -z-0" aria-hidden>
                <Icon n="sun" size={90} sw={1.4} />
              </span>
            </div>
            <div className="floaty absolute -left-6 top-24 rounded-xl bg-white px-4 py-3 shadow-lift border border-line">
              <p className="text-sm font-black text-pine-900">Mandado en camino</p>
              <p className="text-xs text-muted flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pine-500 blink-dot" /> Luis va hacia el Exito</p>
            </div>
            <div className="floaty absolute -right-2 bottom-16 rounded-xl bg-coral-600 px-4 py-3 shadow-lift text-white" style={{ animationDelay: "1.2s" }}>
              <p className="text-sm font-black flex items-center gap-2"><Icon n="siren" size={18} /> Pánico atendido en 4 min</p>
            </div>
          </div>
        </div>

        <p className="relative mt-8 text-sm text-pine-200/80 anim-rise d4">
          Equipo verificado · Acompañamiento humano · Hecho en Colombia 🇨🇴
        </p>
      </aside>

      {/* -------- Panel de autenticación -------- */}
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center">
        <div className="mx-auto w-full max-w-xl">
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Logo size="sm" />
            {LangSwitch}
          </div>

          {vista === "enviado" ? (
            <div className="card anim-pop p-8 sm:p-10 text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pine-100 text-pine-700">
                <Icon n="check" size={42} sw={2.4} />
              </span>
              <h2 className="mt-5 font-display text-3xl font-black text-pine-900">{t("solicitudEnviada")}</h2>
              <p className="mt-3 text-lg text-muted">{t("solicitudEnviadaDesc")}</p>
              <Btn size="lg" className="mt-7" onClick={() => { setVista("login"); setPaso(1); }}>{t("yaTengoCuenta")}</Btn>
            </div>
          ) : (
            <div className="card anim-rise shadow-lift overflow-hidden">
              <div className="grid grid-cols-2 border-b border-line">
                {(["login", "registro"] as Vista[]).map((v) => (
                  <button key={v} onClick={() => { setVista(v); setError(""); setAviso(""); setErrPaso(""); }}
                    className={`py-4 font-display text-lg sm:text-xl font-bold transition-colors ${vista === v ? "bg-pine-700 text-white" : "bg-white text-pine-800 hover:bg-pine-50"}`}>
                    {v === "login" ? t("ingresar") : t("crearCuenta")}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">
                {vista === "login" && (
                  <form onSubmit={(e) => { e.preventDefault(); entrar(email, pass); }} className="grid gap-4">
                    <Field label={t("correoLbl")} req><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@correo.co" autoComplete="email" required /></Field>
                    <Field label={t("contrasenaLbl")} req><Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" required /></Field>

                    {error && <p className="rounded-xl bg-coral-50 border-2 border-coral-200 px-4 py-3 text-coral-800 font-bold" role="alert">{error}</p>}
                    {aviso === "pendiente" && (
                      <div className="rounded-xl bg-marigold-50 border-2 border-marigold-200 px-4 py-3" role="status">
                        <p className="font-black text-marigold-800 flex items-center gap-2"><Icon n="clock" size={18} /> {t("cuentaPendiente")}</p>
                        <p className="text-marigold-800/90 text-sm mt-1">{t("cuentaPendienteDesc")}</p>
                      </div>
                    )}
                    {aviso === "inactivo" && <p className="rounded-xl bg-coral-50 border-2 border-coral-200 px-4 py-3 text-coral-800 font-bold">{t("cuentaInactiva")}</p>}

                    <Btn type="submit" size="xl" icon="arrowRight" className="w-full">{t("entrar")}</Btn>

                    <button type="button" onClick={() => setRecover(!recover)} className="text-left font-bold text-pine-700 underline decoration-2 underline-offset-4 hover:text-pine-900">
                      {t("olvidaste")}
                    </button>
                    {recover && (
                      <div className="anim-rise rounded-xl bg-pine-50 border-2 border-pine-200 p-4 grid gap-3">
                        <p className="text-sm text-pine-800">{t("recuperar")}</p>
                        <div className="flex gap-2">
                          <Input type="email" placeholder={t("correoLbl")} aria-label={t("correoLbl")} />
                          <Btn type="button" variant="soft" onClick={() => { toast(t("enviar") + " ✓", "ok"); setRecover(false); }}>{t("enviar")}</Btn>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {vista === "registro" && (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2" aria-label={`${t("paso")} ${paso} / 3`}>
                      {[1, 2, 3].map((n) => (
                        <span key={n} className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${n <= paso ? "bg-pine-600" : "bg-line"}`} />
                      ))}
                    </div>
                    <p className="font-display text-xl font-bold text-pine-900">
                      {t("paso")} {paso} · {paso === 1 ? t("datosPersonales") : paso === 2 ? t("contactosEmergenciaLbl") : t("revisarEnviar")}
                    </p>

                    {paso === 1 && (
                      <div className="grid gap-4 anim-rise">
                        <div>
                          <span className="lbl">{t("eligeRol")}</span>
                          <div className="grid grid-cols-2 gap-3">
                            {(["cliente", "familiar"] as Rol[]).map((r) => (
                              <button key={r} type="button" onClick={() => setRol(r)}
                                className={`rounded-xl border-2 p-4 text-left font-bold transition-all ${rol === r ? "border-pine-600 bg-pine-50 text-pine-900 shadow-lift" : "border-line bg-white text-muted hover:border-pine-300"}`}>
                                <Icon n={r === "cliente" ? "heart" : "users"} size={26} className="mb-2 text-pine-700" />
                                {r === "cliente" ? t("rolCliente") : t("rolFamiliar")}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Field label={t("nombreCompleto")} req><Input value={f.nombre} onChange={(e) => up("nombre", e.target.value)} placeholder="Ej: María Fernanda López" /></Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label={t("tipoId")} req>
                            <Select value={f.tipoId} onChange={(e) => up("tipoId", e.target.value)}>
                              {["CC", "CE", "TI", "Pasaporte"].map((x) => <option key={x}>{x}</option>)}
                            </Select>
                          </Field>
                          <Field label={t("numeroId")} req><Input value={f.numeroId} onChange={(e) => up("numeroId", e.target.value)} placeholder="41.587.963" /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label={t("pais")} req><Input value={f.pais} onChange={(e) => up("pais", e.target.value)} /></Field>
                          <Field label={t("ciudad")} req><Input value={f.ciudad} onChange={(e) => up("ciudad", e.target.value)} placeholder="Bogotá" /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label={t("fechaNacimiento")} req><Input type="date" value={f.fechaNacimiento} onChange={(e) => up("fechaNacimiento", e.target.value)} /></Field>
                          <Field label={t("rh")} req>
                            <Select value={f.rh} onChange={(e) => up("rh", e.target.value)}>
                              <option value="">—</option>
                              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((x) => <option key={x}>{x}</option>)}
                            </Select>
                          </Field>
                        </div>
                        <Field label={t("direccionLbl")}><Input value={f.direccion} onChange={(e) => up("direccion", e.target.value)} placeholder="Cra 15 #82-45, Chapinero" /></Field>
                        <Field label={t("correoLbl")} req><Input type="email" value={f.email} onChange={(e) => up("email", e.target.value)} /></Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label={t("celularLbl")} req><Input type="tel" value={f.telefono} onChange={(e) => up("telefono", e.target.value)} placeholder="315 000 0000" /></Field>
                          <Field label={t("contrasenaLbl")} req><Input type="password" value={f.password} onChange={(e) => up("password", e.target.value)} /></Field>
                        </div>
                      </div>
                    )}

                    {paso === 2 && (
                      <div className="grid gap-5 anim-rise">
                        {[{ c: c1, setC: setC1, lbl: t("contacto1") }, { c: c2, setC: setC2, lbl: t("contacto2") }].map(({ c, setC, lbl }, i) => (
                          <fieldset key={i} className="rounded-xl border-2 border-coral-100 bg-coral-50/50 p-4">
                            <legend className="px-2 font-black text-coral-800 flex items-center gap-2"><Icon n="siren" size={18} /> {lbl}</legend>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <Field label={t("nombre")} req><Input value={c.nombre} onChange={(e) => setC({ ...c, nombre: e.target.value })} /></Field>
                              <Field label={t("parentesco")}><Input value={c.parentesco} onChange={(e) => setC({ ...c, parentesco: e.target.value })} placeholder="Hijo(a)" /></Field>
                              <Field label={t("telefono")} req><Input type="tel" value={c.telefono} onChange={(e) => setC({ ...c, telefono: e.target.value })} /></Field>
                            </div>
                          </fieldset>
                        ))}
                        <Field label={t("enfermedadesAtencion")} hint="Esta información solo la verá personal autorizado.">
                          <Textarea value={f.enfermedadesAtencion} onChange={(e) => up("enfermedadesAtencion", e.target.value)} placeholder={t("enfermedadesAtencionPh")} />
                        </Field>
                        <Field label={t("epsLbl")}>
                          <Select value={f.eps} onChange={(e) => up("eps", e.target.value)}>
                            <option value="">—</option>
                            {["Sanitas", "Sura", "Compensar", "Nueva EPS", "Famisanar", "Otra"].map((x) => <option key={x}>{x}</option>)}
                          </Select>
                        </Field>
                        <DynamicFields modulo="registro" values={custom} onChange={setCustom} />
                      </div>
                    )}

                    {paso === 3 && (
                      <div className="grid gap-3 anim-rise">
                        {[
                          [t("nombreCompleto"), f.nombre], [t("tipoId") + " / " + t("numeroId"), `${f.tipoId} ${f.numeroId}`],
                          [t("pais") + " / " + t("ciudad"), `${f.pais}, ${f.ciudad}`], [t("rh"), f.rh],
                          [t("fechaNacimiento"), f.fechaNacimiento], [t("direccionLbl"), f.direccion || "—"],
                          [t("correoLbl"), f.email], [t("celularLbl"), f.telefono], [t("epsLbl"), f.eps || "—"],
                          [t("contacto1"), `${c1.nombre} (${c1.parentesco || "—"}) · ${c1.telefono}`],
                          [t("contacto2"), `${c2.nombre} (${c2.parentesco || "—"}) · ${c2.telefono}`],
                          [t("enfermedadesAtencion"), f.enfermedadesAtencion || "—"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-start justify-between gap-4 rounded-xl bg-paper px-4 py-3 border border-line">
                            <span className="text-sm font-black text-pine-800/70 uppercase tracking-wide">{k}</span>
                            <span className="text-right font-bold">{v}</span>
                          </div>
                        ))}
                        <p className="rounded-xl bg-marigold-50 border-2 border-marigold-200 px-4 py-3 text-sm text-marigold-900 font-bold flex gap-2">
                          <Icon n="clock" size={20} className="shrink-0 text-marigold-600" /> {t("solicitudEnviadaDesc")}
                        </p>
                      </div>
                    )}

                    {errPaso && <p className="rounded-xl bg-coral-50 border-2 border-coral-200 px-4 py-3 text-coral-800 font-bold" role="alert">{errPaso}</p>}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Btn type="button" variant="outline" onClick={() => (paso > 1 ? setPaso(paso - 1) : setVista("login"))} icon="chevronRight" className="rotate-180">
                        {paso === 1 ? t("volver") : t("anterior")}
                      </Btn>
                      {paso < 3
                        ? <Btn type="button" size="lg" onClick={() => validarPaso(paso) && setPaso(paso + 1)} icon="arrowRight">{t("siguiente")}</Btn>
                        : <Btn type="button" size="lg" variant="accent" onClick={enviarRegistro} icon="check">{t("enviarSolicitud")}</Btn>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acceso demo */}
          {vista === "login" && (
            <div className="anim-rise d2 mt-6">
              <p className="text-center text-sm font-black uppercase tracking-widest text-muted">{t("demoAcceso")}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {DEMOS.map((d) => (
                  <button key={d.email} onClick={() => entrar(d.email, d.pass)}
                    className="chip bg-white border-2 border-pine-200 text-pine-800 hover:border-pine-500 hover:bg-pine-50 transition-colors !py-2 !px-4">
                    <Icon n={d.icon} size={16} /> {d.rol}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-muted">
                {t("correoLbl")}: cliente@juventudes.co · {t("contrasenaLbl")}: cliente123
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
