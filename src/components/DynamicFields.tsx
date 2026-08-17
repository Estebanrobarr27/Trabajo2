import { useApp } from "../store";
import type { CampoDinamico } from "../types";
import { Field, Input, Select, Textarea } from "./ui";

/* Renderiza los campos configurados por el superadministrador
   para un módulo dado (registro, mandado, salud…). Si el admin
   crea, renombra o desactiva campos, este formulario cambia solo. */

export function DynamicFields({ modulo, values, onChange }: {
  modulo: string;
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const { state, lang } = useApp();
  const fields = state.config.camposDinamicos
    .filter((f) => f.modulo === modulo && f.visible)
    .sort((a, b) => a.orden - b.orden);
  if (fields.length === 0) return null;

  const set = (id: string, val: string) => onChange({ ...values, [id]: val });
  const label = (f: CampoDinamico) => (lang === "en" && f.labelEn ? f.labelEn : f.label);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const v = values[f.id] ?? "";
        const opts = f.opciones.split("|").filter(Boolean);
        const req = f.requerido;
        const common = { required: req, value: v };
        switch (f.type) {
          case "texto_largo":
            return (
              <div key={f.id} className="sm:col-span-2">
                <Field label={label(f)} req={req}>
                  <Textarea {...common} onChange={(e) => set(f.id, e.target.value)} />
                </Field>
              </div>
            );
          case "numero":
            return <div key={f.id}><Field label={label(f)} req={req}><Input type="number" {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
          case "fecha":
            return <div key={f.id}><Field label={label(f)} req={req}><Input type="date" {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
          case "hora":
            return <div key={f.id}><Field label={label(f)} req={req}><Input type="time" {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
          case "fecha_hora":
            return <div key={f.id}><Field label={label(f)} req={req}><Input type="datetime-local" {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
          case "si_no":
            return (
              <div key={f.id}>
                <Field label={label(f)} req={req}>
                  <Select {...common} onChange={(e) => set(f.id, e.target.value)}>
                    <option value="">—</option>
                    {(opts.length ? opts : ["Sí", "No"]).map((o) => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </Field>
              </div>
            );
          case "seleccion":
            return (
              <div key={f.id}>
                <Field label={label(f)} req={req}>
                  <Select {...common} onChange={(e) => set(f.id, e.target.value)}>
                    <option value="">—</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </Field>
              </div>
            );
          case "seleccion_multiple": {
            const sel = v ? v.split(", ") : [];
            const flip = (o: string) => {
              const next = sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o];
              set(f.id, next.join(", "));
            };
            return (
              <div key={f.id} className="sm:col-span-2">
                <span className="lbl">{label(f)} {req && <span className="text-coral-600">*</span>}</span>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o) => (
                    <button key={o} type="button" onClick={() => flip(o)}
                      className={`chip border-2 transition-colors ${sel.includes(o) ? "bg-pine-700 text-white border-pine-700" : "bg-white text-pine-800 border-line hover:border-pine-400"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          case "telefono":
            return <div key={f.id}><Field label={label(f)} req={req}><Input type="tel" {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
          case "correo":
            return <div key={f.id}><Field label={label(f)} req={req}><Input type="email" {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
          case "archivo":
          case "imagen":
            return (
              <div key={f.id}>
                <Field label={label(f)} req={req}>
                  <input
                    type="file" accept={f.type === "imagen" ? "image/*" : undefined}
                    className="inp file:mr-3 file:rounded-full file:border-0 file:bg-pine-100 file:px-4 file:py-2 file:font-bold file:text-pine-800"
                    onChange={(e) => set(f.id, e.target.files?.[0]?.name ?? v)}
                  />
                  {v && <span className="mt-1 block text-sm text-muted">📎 {v}</span>}
                </Field>
              </div>
            );
          default:
            return <div key={f.id}><Field label={label(f)} req={req}><Input {...common} onChange={(e) => set(f.id, e.target.value)} /></Field></div>;
        }
      })}
    </div>
  );
}
