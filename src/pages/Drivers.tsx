import { useApp } from "../store";
import { Icon } from "../components/icons";
import { Avatar, Badge, CallBtn, Empty, SectionHead } from "../components/ui";

export default function Drivers() {
  const { state, t } = useApp();
  const activos = state.config.conductores.filter((c) => c.activo);

  return (
    <div>
      <SectionHead
        icon="wheel" title={t("conductoresElegidos")}
        sub="Conductores verificados y elegidos por nuestro equipo. Llámalos con un toque."
      />
      {activos.length === 0 ? (
        <Empty icon="wheel" text={t("sinDatos")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {activos.map((c, i) => (
            <article key={c.id} className="card card-hover anim-rise flex flex-col p-6" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-4">
                <Avatar nombre={c.nombre} size={56} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-bold text-pine-900">{c.nombre}</h3>
                  <p className="flex items-center gap-1 font-black text-marigold-600">
                    <Icon n="star" size={16} className="fill-marigold-400 text-marigold-500" /> {c.rating}
                  </p>
                </div>
                <Badge tone="pine">{t("activo")}</Badge>
              </div>
              <p className="mt-4 flex items-center gap-2 font-bold text-pine-800"><Icon n="bus" size={19} className="text-pine-600" /> {c.vehiculo} · <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-black tracking-widest text-paper">{c.placa}</span></p>
              <p className="mt-2 text-sm text-muted flex-1">{c.nota}</p>
              <div className="mt-5 flex gap-2">
                <CallBtn tel={c.telefono} label={`${t("llamar")} · ${c.telefono}`} size="lg" variant="accent" />
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 rounded-xl bg-pine-50 border-2 border-pine-200 px-5 py-4 text-sm font-bold text-pine-800 flex items-center gap-2">
        <Icon n="shield" size={20} className="text-pine-600 shrink-0" />
        Todos los conductores pasan verificación de antecedentes y capacitación en atención a personas mayores. La lista la administra tu encargado.
      </p>
    </div>
  );
}
