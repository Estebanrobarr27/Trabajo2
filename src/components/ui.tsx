import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "./icons";

/* ---------- Botón ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "danger" | "ghost" | "soft" | "dark" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string;
};
const btnV = {
  primary: "bg-pine-700 text-white hover:bg-pine-800 active:bg-pine-900 shadow-[0_4px_14px_-4px_rgba(23,86,65,0.5)]",
  accent: "bg-marigold-400 text-pine-900 hover:bg-marigold-500 active:bg-marigold-600 shadow-[0_4px_14px_-4px_rgba(242,180,47,0.6)]",
  danger: "bg-coral-600 text-white hover:bg-coral-700 active:bg-coral-800 shadow-[0_4px_14px_-4px_rgba(220,61,56,0.5)]",
  ghost: "bg-transparent text-pine-800 hover:bg-pine-50 border-2 border-transparent",
  outline: "bg-white text-pine-800 border-2 border-pine-200 hover:border-pine-500 hover:bg-pine-50",
  soft: "bg-pine-100 text-pine-900 hover:bg-pine-200",
  dark: "bg-ink text-paper hover:bg-black",
};
const btnS = {
  sm: "px-3.5 py-2 text-sm gap-1.5",
  md: "px-5 py-2.5 text-base gap-2",
  lg: "px-6 py-3.5 text-lg gap-2",
  xl: "px-8 py-4 text-xl gap-2.5",
};
export function Btn({ variant = "primary", size = "md", icon, className = "", children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none ${btnV[variant]} ${btnS[size]} ${className}`}
    >
      {icon && <Icon n={icon} size={size === "sm" ? 16 : size === "xl" ? 24 : 20} />}
      {children}
    </button>
  );
}

/* ---------- Enlace de llamada ---------- */
export function CallBtn({ tel, label, size = "md", variant = "primary" }: { tel: string; label: string; size?: "sm" | "md" | "lg" | "xl"; variant?: BtnProps["variant"] }) {
  return (
    <a
      href={`tel:${tel.replace(/\s/g, "")}`}
      className={`inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 active:scale-[0.97] ${btnV[variant]} ${btnS[size]}`}
    >
      <Icon n="phone" size={size === "sm" ? 16 : size === "xl" ? 24 : 20} className="mr-2" />
      {label}
    </a>
  );
}

/* ---------- Badge ---------- */
const tones = {
  pine: "bg-pine-100 text-pine-800",
  marigold: "bg-marigold-100 text-marigold-800",
  coral: "bg-coral-100 text-coral-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-200 text-gray-700",
  teal: "bg-teal-100 text-teal-800",
};
export function Badge({ tone = "pine", children, className = "" }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>;
}

export function EstadoPill({ estado }: { estado: string }) {
  const map: Record<string, keyof typeof tones> = {
    SOLICITADO: "gray", RECIBIDO: "blue", ASIGNADO: "marigold", "EN CAMINO": "teal",
    "REALIZANDO MANDADO": "marigold", "EN ENTREGA": "teal", COMPLETADO: "pine", CANCELADO: "coral",
  };
  return <Badge tone={map[estado] ?? "gray"}>{estado}</Badge>;
}

/* ---------- Avatar ---------- */
const avColors = ["bg-pine-600", "bg-marigold-500 text-pine-900", "bg-coral-500", "bg-teal-600", "bg-plum-500", "bg-co-blue"];
export function Avatar({ nombre, size = 44 }: { nombre: string; size?: number }) {
  const ini = nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const color = avColors[(nombre.length * 7) % avColors.length];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {ini}
    </span>
  );
}

/* ---------- Campo con etiqueta ---------- */
export function Field({ label, req, children, hint }: { label: string; req?: boolean; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="lbl">
        {label} {req && <span className="text-coral-600" aria-hidden>*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`inp ${props.className ?? ""}`} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`inp ${props.className ?? ""}`} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`inp resize-y min-h-[96px] ${props.className ?? ""}`} />;
}

/* ---------- Toggle ---------- */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 group"
    >
      <span className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${checked ? "bg-pine-600" : "bg-gray-300"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${checked ? "left-7" : "left-1"}`} />
      </span>
      {label && <span className="text-base font-bold text-pine-900 group-hover:text-pine-700">{label}</span>}
    </button>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-pine-900/60 backdrop-blur-[2px] cursor-default" onClick={onClose} aria-label="Cerrar" />
      <div className={`anim-pop relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-line shadow-lift`}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-card/95 px-6 py-4 backdrop-blur">
          <h3 className="font-display text-xl font-bold text-pine-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-pine-50 hover:text-pine-800 transition-colors" aria-label="Cerrar ventana">
            <Icon n="x" size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Cabecera de sección ---------- */
export function SectionHead({ icon, title, sub, action }: { icon: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-700 text-marigold-300 shrink-0">
          <Icon n={icon} size={22} />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold text-pine-900 leading-tight">{title}</h2>
          {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------- Tarjeta de indicador ---------- */
export function StatCard({ icon, label, value, tone = "pine", delay = 0 }: { icon: string; label: string; value: ReactNode; tone?: keyof typeof tones; delay?: number }) {
  return (
    <div className="card card-hover p-4 anim-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${tones[tone]}`}>
          <Icon n={icon} size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted font-bold truncate">{label}</p>
          <p className="font-display text-2xl font-black text-ink leading-none mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Estado vacío ---------- */
export function Empty({ icon = "info", text }: { icon?: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-line bg-white/60 px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pine-50 text-pine-500">
        <Icon n={icon} size={28} />
      </span>
      <p className="text-muted font-bold max-w-sm">{text}</p>
    </div>
  );
}

/* ---------- Pestañas ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tb) => (
        <button
          key={tb.id} role="tab" aria-selected={active === tb.id} onClick={() => onChange(tb.id)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-bold transition-all duration-200 ${
            active === tb.id ? "bg-pine-700 text-white shadow-[0_4px_14px_-4px_rgba(23,86,65,0.5)]" : "bg-white text-pine-800 border border-line hover:border-pine-400"
          }`}
        >
          {tb.icon && <Icon n={tb.icon} size={18} />}
          {tb.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Logo ---------- */
export function Logo({ dark, size = "md" }: { dark?: boolean; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? 34 : size === "lg" ? 56 : 44;
  const txt = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-2xl";
  return (
    <span className="inline-flex items-center gap-3">
      <span className="flex items-center justify-center rounded-xl bg-marigold-400 text-pine-900 shrink-0" style={{ width: s, height: s }}>
        <Icon n="sun" size={s * 0.62} sw={2.2} />
      </span>
      <span className={`font-display font-black leading-none ${txt} ${dark ? "text-white" : "text-pine-900"}`}>
        juventudes
      </span>
    </span>
  );
}

/* ---------- Confirmación simple ---------- */
export function ConfirmModal({ open, onClose, onYes, title, body, yesLabel, danger }: {
  open: boolean; onClose: () => void; onYes: () => void; title: string; body: string; yesLabel: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-base text-ink mb-6">{body}</p>
      <div className="flex flex-wrap justify-end gap-3">
        <Btn variant="outline" onClick={onClose}>Cancelar</Btn>
        <Btn variant={danger ? "danger" : "primary"} onClick={() => { onYes(); onClose(); }}>{yesLabel}</Btn>
      </div>
    </Modal>
  );
}
