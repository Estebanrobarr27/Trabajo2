import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { CitaMedica, Medicamento } from "../types";
import { diasDesdeHoy, fmtFecha, uid } from "../types";
import { Icon } from "../components/icons";
import { Badge, Btn, ConfirmModal, Empty, EstadoPill, Field, Input, Modal, SectionHead, Select, Tabs, Textarea, Toggle } from "../components/ui";
import { DynamicFields } from "../components/DynamicFields";

const medVacio = (): Medicamento => ({ id: "", nombre: "", dosis: "", frecuencia: "", horario: "", inicio: "", fin: "", observaciones: "" });

export default function Health() {
  const { state, user, t, getSalud, updateSalud, crearMandado, notificar, toast } = useApp();
  const cfg = state.config;
  const clientId = user?.rol === "familiar" && user.linkedClientId ? user.linkedClientId : user?.id ?? "";
  const cliente = state.usuarios.find((u) => u.id === clientId);
  const accesoFamiliar = user?.rol !== "familiar" || cfg.familiarAccesoSalud;
  const h = getSalud(clientId);

  const [tab, setTab] = useState("resumen");
  const [med, setMed] = useState<Medicamento | null>(null);
  const [cita, setCita] = useState<CitaMedica | null>(null);
  const [delMed, setDelMed] = useState<string | null>(null);
  const [custom, setCustom] = useState<Record<string, string>>(h.custom);

  const traslados = useMemo(
    () => state.mandados.filter((m) => m.clientId === clientId && m.tipo === "Traslado EPS"),
    [state.mandados, clientId],
  );

  if (!accesoFamiliar) {
    return <Empty icon="lock" text="El administrador no ha autorizado tu acceso a la información médica. Comunícate con Juventudes." />;
  }

  const guardarCustom = () => { updateSalud(clientId, (r) => ({ ...r, custom }), "Campos personalizados"); toast(t("guardar") + " ✓"); };

  const guardarMed = () => {
    if (!med || !med.nombre.trim()) { toast("Escribe el nombre del medicamento.", "warn"); return; }
    updateSalud(clientId, (r) => {
      const existe = r.medicamentos.some((m) => m.id === med.id);
      const lista = existe ? r.medicamentos.map((m) => (m.id === med.id ? med : m)) : [...r.medicamentos, { ...med, id: med.id || uid() }];
      return { ...r, medicamentos: lista };
    }, "Medicamento");
    toast(t("guardar") + " ✓");
    setMed(null);
  };

  const agendarCita = () => {
    if (!cita || !cita.fecha || !cita.medico.trim()) { toast("Completa fecha y médico.", "warn"); return; }
    updateSalud(clientId, (r) => ({ ...r, citas: [...r.citas, { ...cita, id: uid(), estado: "Programada" }] }), "Cita médica");
    const dias = Math.ceil((new Date(cita.fecha + "T12:00:00").getTime() - Date.now()) / 86400000);
    if (dias <= cfg.recordatoriosDias) {
      notificar([clientId], "Recordatorio de cita", `Tu cita de ${cita.especialidad || "medicina"} con ${cita.medico} es el ${fmtFecha(cita.fecha + "T12:00:00")} a las ${cita.hora}.`, "alerta");
    }
    toast(t("agendarCita") + " ✓");
    setCita(null);
  };

  const pedirTraslado = () => {
    crearMandado({
      clientId, solicitadoPorId: user?.id ?? "", tipo: "Traslado EPS",
      descripcion: `Traslado acompañado a la EPS ${h.eps || "asignada"} para ${cliente?.nombre ?? "la persona usuaria"}.`,
      dirEntrega: cliente?.direccion ?? "",
      instrucciones: "Acompañar durante el trayecto y permanecer hasta que inicie la atención.",
      fecha: diasDesdeHoy(1), hora: "08:00", valor: cfg.tarifas.find((x) => x.id === "tf7")?.precio ?? 25000,
    });
    toast("Solicitud de traslado creada. La verás en Mandados.", "ok");
  };

  const bloqueado = h.privacidad;

  return (
    <div>
      <SectionHead icon="medical" title={t("miSalud")} sub={cliente ? `${cliente.nombre} · RH ${h.rh || "—"} · EPS ${h.eps || "—"}` : undefined} />

      {/* Botón de privacidad */}
      <div className={`card mb-6 flex flex-wrap items-center justify-between gap-4 p-5 ${bloqueado ? "border-marigold-300 bg-marigold-50" : ""}`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${bloqueado ? "bg-marigold-400 text-pine-900" : "bg-pine-100 text-pine-700"}`}>
            <Icon n={bloqueado ? "lock" : "unlock"} size={24} />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-pine-900">{t("modoPrivacidad")}</p>
            <p className="text-sm text-muted">{t("privacidadDesc")}</p>
          </div>
        </div>
        <Toggle checked={bloqueado} onChange={(v) => updateSalud(clientId, (r) => ({ ...r, privacidad: v }), "Privacidad")} label={bloqueado ? "Activado" : "Desactivado"} />
      </div>

      {bloqueado ? (
        <div className="card anim-pop flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-marigold-100 text-marigold-700"><Icon n="lock" size={40} /></span>
          <p className="font-display text-2xl font-black text-pine-900">Información médica protegida</p>
          <p className="max-w-md text-muted">{t("privacidadDesc")}</p>
          <Btn variant="accent" size="lg" icon="unlock" onClick={() => updateSalud(clientId, (r) => ({ ...r, privacidad: false }), "Privacidad")}>
            Ver mi información
          </Btn>
        </div>
      ) : (
        <>
          <Tabs
            tabs={[
              { id: "resumen", label: "Resumen", icon: "clipboard" },
              { id: "medicamentos", label: t("medicamentosLbl"), icon: "pill" },
              { id: "eps", label: t("trasladosEps"), icon: "truck" },
              { id: "citas", label: t("citasMedicas"), icon: "calendar" },
            ]}
            active={tab} onChange={setTab}
          />

          <div className="mt-6">
            {tab === "resumen" && (
              <div className="grid gap-5 lg:grid-cols-2 anim-rise">
                <div className="card p-5">
                  <h3 className="font-display text-lg font-bold text-pine-900 mb-3 flex items-center gap-2"><Icon n="alert" size={20} className="text-coral-600" /> {t("alertasMedicas")}</h3>
                  <div className="grid gap-2.5">
                    {h.alertas.map((a) => (
                      <p key={a.id} className="flex items-center gap-3 rounded-xl bg-coral-50 border-2 border-coral-200 px-4 py-3 font-bold text-coral-900">
                        <Icon n="alert" size={20} className="text-coral-600 shrink-0" /> <span><strong>{a.tipo}:</strong> {a.texto}</span>
                      </p>
                    ))}
                    {h.alertas.length === 0 && <p className="text-muted">{t("sinDatos")}</p>}
                  </div>
                  <h3 className="font-display text-lg font-bold text-pine-900 mt-6 mb-3">{t("alergiasLbl")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {h.alergias.map((a) => (
                      <Badge key={a.id} tone={a.gravedad === "Grave" ? "coral" : a.gravedad === "Moderada" ? "marigold" : "gray"}>
                        {a.descripcion} · {a.gravedad}
                      </Badge>
                    ))}
                    {h.alergias.length === 0 && <p className="text-muted">{t("sinDatos")}</p>}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-display text-lg font-bold text-pine-900 mb-3 flex items-center gap-2"><Icon n="activity" size={20} className="text-pine-600" /> {t("antecedentesLbl")} y atención</h3>
                  <p className="rounded-xl bg-paper border border-line px-4 py-3 mb-3">
                    <strong className="text-pine-800">{t("enfermedadesAtencion")}:</strong> {h.enfermedadesAtencion || "—"}
                  </p>
                  <ol className="relative grid gap-3 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-0.5 before:bg-pine-200">
                    {[...h.antecedentes].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((a) => (
                      <li key={a.id} className="relative pl-7">
                        <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-pine-500" />
                        <p className="text-sm"><strong className="text-pine-900">{a.tipo}</strong> · <span className="text-muted">{fmtFecha(a.fecha + "T12:00:00")}</span></p>
                        <p className="text-sm text-muted">{a.descripcion}</p>
                      </li>
                    ))}
                    {h.antecedentes.length === 0 && <p className="text-muted">{t("sinDatos")}</p>}
                  </ol>
                </div>

                <div className="card p-5 lg:col-span-2">
                  <h3 className="font-display text-lg font-bold text-pine-900 mb-3 flex items-center gap-2"><Icon n="settings" size={20} className="text-pine-600" /> Información adicional (campos del administrador)</h3>
                  <DynamicFields modulo="salud" values={custom} onChange={setCustom} />
                  {Object.keys(state.config.camposDinamicos.filter((f) => f.modulo === "salud" && f.visible)).length > 0 && (
                    <div className="mt-4"><Btn variant="soft" icon="check" onClick={guardarCustom}>{t("guardar")}</Btn></div>
                  )}
                </div>
              </div>
            )}

            {tab === "medicamentos" && (
              <div className="anim-rise">
                <div className="mb-4 flex justify-end">
                  <Btn icon="plus" size="lg" onClick={() => setMed(medVacio())}>{t("agregarMedicamento")}</Btn>
                </div>
                {h.medicamentos.length === 0 ? <Empty icon="pill" text={t("sinDatos")} /> : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {h.medicamentos.map((m) => (
                      <div key={m.id} className="card card-hover p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-100 text-pine-700"><Icon n="pill" size={22} /></span>
                            <div>
                              <p className="font-display text-lg font-bold text-pine-900">{m.nombre} <span className="text-muted font-body text-sm font-bold">{m.dosis}</span></p>
                              <p className="text-sm text-muted">{m.frecuencia} · {m.horario}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setMed(m)} className="rounded-full p-2 text-pine-600 hover:bg-pine-50" aria-label={t("editar")}><Icon n="edit" size={18} /></button>
                            <button onClick={() => setDelMed(m.id)} className="rounded-full p-2 text-coral-600 hover:bg-coral-50" aria-label={t("eliminar")}><Icon n="trash" size={18} /></button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-muted border-t border-line pt-3">
                          {t("inicioLbl")}: {m.inicio ? fmtFecha(m.inicio + "T12:00:00") : "—"} · {t("finLbl")}: {m.fin ? fmtFecha(m.fin + "T12:00:00") : "Continuo"}
                          {m.observaciones && <> · {m.observaciones}</>}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "eps" && (
              <div className="anim-rise grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                <div className="card p-6 flex flex-col">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-pine-700 text-marigold-300"><Icon n="truck" size={28} /></span>
                  <h3 className="mt-4 font-display text-2xl font-black text-pine-900">{t("solicitarTraslado")}</h3>
                  <p className="mt-2 text-muted flex-1">{t("trasladoDesc")}</p>
                  <p className="mt-4 rounded-xl bg-pine-50 border border-pine-200 px-4 py-3 font-bold text-pine-800">EPS actual: {h.eps || "Por definir"}</p>
                  <Btn size="xl" icon="truck" className="mt-5" onClick={pedirTraslado}>{t("solicitarTraslado")}</Btn>
                </div>
                <div>
                  <p className="lbl">{t("trasladosEps")} ({traslados.length})</p>
                  <div className="grid gap-3">
                    {traslados.length === 0 && <Empty icon="truck" text={t("sinDatos")} />}
                    {traslados.map((m) => (
                      <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="font-black text-pine-900">{m.tipo}</p>
                          <p className="text-sm text-muted">{fmtFecha(m.fecha + "T12:00:00")} · {m.hora} · {m.descripcion.slice(0, 60)}</p>
                        </div>
                        <EstadoPill estado={m.estado} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "citas" && (
              <div className="anim-rise">
                <p className="mb-4 rounded-xl bg-marigold-50 border-2 border-marigold-200 px-4 py-3 font-bold text-marigold-900 flex items-center gap-2">
                  <Icon n="bell" size={20} className="text-marigold-600 shrink-0" />
                  {t("recordatorioCitas").replace("{d}", String(cfg.recordatoriosDias))}
                </p>
                <div className="mb-4 flex justify-end">
                  <Btn icon="plus" size="lg" onClick={() => setCita({ id: "", fecha: diasDesdeHoy(3), hora: "09:00", medico: "", especialidad: "", lugar: "", motivo: "", estado: "Programada" })}>
                    {t("agendarCita")}
                  </Btn>
                </div>
                {h.citas.length === 0 ? <Empty icon="calendar" text={t("sinDatos")} /> : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...h.citas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((c) => {
                      const proxima = c.estado === "Programada" && new Date(c.fecha + "T23:59:00").getTime() > Date.now();
                      return (
                        <div key={c.id} className={`card card-hover p-5 ${proxima ? "border-marigold-300" : ""}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl font-black ${proxima ? "bg-marigold-400 text-pine-900" : "bg-pine-50 text-pine-700"}`}>
                                <span className="text-xl leading-none">{c.fecha.slice(8, 10)}</span>
                                <span className="text-[11px] uppercase">{new Date(c.fecha + "T12:00:00").toLocaleDateString("es-CO", { month: "short" })}</span>
                              </span>
                              <div>
                                <p className="font-display text-lg font-bold text-pine-900">{c.especialidad || c.medico}</p>
                                <p className="text-sm text-muted">{c.hora} · {c.medico}</p>
                              </div>
                            </div>
                            <Badge tone={c.estado === "Programada" ? "marigold" : c.estado === "Completada" ? "pine" : "coral"}>{c.estado}</Badge>
                          </div>
                          <p className="mt-3 text-sm text-muted flex items-center gap-2"><Icon n="pin" size={16} /> {c.lugar || "—"}</p>
                          <p className="mt-1 text-sm text-muted"><strong>{t("motivo")}:</strong> {c.motivo || "—"}</p>
                          {c.estado === "Programada" && (
                            <div className="mt-4 flex gap-2">
                              <Btn size="sm" variant="soft" icon="check" onClick={() => { updateSalud(clientId, (r) => ({ ...r, citas: r.citas.map((x) => x.id === c.id ? { ...x, estado: "Completada" } : x) }), "Cita"); toast(t("completada") + " ✓"); }}>{t("completada")}</Btn>
                              <Btn size="sm" variant="ghost" icon="x" className="text-coral-700 hover:bg-coral-50" onClick={() => { updateSalud(clientId, (r) => ({ ...r, citas: r.citas.map((x) => x.id === c.id ? { ...x, estado: "Cancelada" } : x) }), "Cita"); toast(t("cancelada"), "warn"); }}>{t("cancelada")}</Btn>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal medicamento */}
      <Modal open={!!med} onClose={() => setMed(null)} title={t("agregarMedicamento")}>
        {med && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("nombre")} req><Input value={med.nombre} onChange={(e) => setMed({ ...med, nombre: e.target.value })} placeholder="Losartán" /></Field>
              <Field label={t("dosis")}><Input value={med.dosis} onChange={(e) => setMed({ ...med, dosis: e.target.value })} placeholder="50 mg" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("frecuencia")}><Input value={med.frecuencia} onChange={(e) => setMed({ ...med, frecuencia: e.target.value })} placeholder="1 vez al día" /></Field>
              <Field label={t("horario")}><Input value={med.horario} onChange={(e) => setMed({ ...med, horario: e.target.value })} placeholder="7:00 a. m." /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("inicioLbl")}><Input type="date" value={med.inicio} onChange={(e) => setMed({ ...med, inicio: e.target.value })} /></Field>
              <Field label={t("finLbl")}><Input type="date" value={med.fin} onChange={(e) => setMed({ ...med, fin: e.target.value })} /></Field>
            </div>
            <Field label={t("observaciones")}><Textarea value={med.observaciones} onChange={(e) => setMed({ ...med, observaciones: e.target.value })} className="min-h-[70px]" /></Field>
            <div className="flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setMed(null)}>{t("cancelar")}</Btn>
              <Btn icon="check" onClick={guardarMed}>{t("guardar")}</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal cita */}
      <Modal open={!!cita} onClose={() => setCita(null)} title={t("agendarCita")}>
        {cita && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("fecha")} req><Input type="date" value={cita.fecha} onChange={(e) => setCita({ ...cita, fecha: e.target.value })} /></Field>
              <Field label={t("hora")} req><Input type="time" value={cita.hora} onChange={(e) => setCita({ ...cita, hora: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("medico")} req><Input value={cita.medico} onChange={(e) => setCita({ ...cita, medico: e.target.value })} placeholder="Dra. Camila Reyes" /></Field>
              <Field label={t("especialidad")}><Input value={cita.especialidad} onChange={(e) => setCita({ ...cita, especialidad: e.target.value })} placeholder="Cardiología" /></Field>
            </div>
            <Field label={t("lugar")}><Input value={cita.lugar} onChange={(e) => setCita({ ...cita, lugar: e.target.value })} placeholder="Fundación Santa Fe" /></Field>
            <Field label={t("motivo")}><Textarea value={cita.motivo} onChange={(e) => setCita({ ...cita, motivo: e.target.value })} className="min-h-[70px]" /></Field>
            <div className="flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setCita(null)}>{t("cancelar")}</Btn>
              <Btn icon="check" onClick={agendarCita}>{t("guardar")}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!delMed} onClose={() => setDelMed(null)}
        onYes={() => { updateSalud(clientId, (r) => ({ ...r, medicamentos: r.medicamentos.filter((m) => m.id !== delMed) }), "Medicamento"); toast(t("eliminar") + " ✓"); }}
        title={t("eliminar")} body="¿Eliminar este medicamento del registro? Quedará trazabilidad en la auditoría." yesLabel={t("eliminar")} danger
      />
    </div>
  );
}
