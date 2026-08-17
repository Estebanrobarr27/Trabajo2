import { useMemo, useState } from "react";
import { useApp } from "../store";
import { fmtCOP, fmtFecha } from "../types";
import { Icon } from "../components/icons";
import { Badge, Btn, CallBtn, ConfirmModal, Empty, Field, Input, Modal, SectionHead, Select, Textarea } from "../components/ui";

const CATS = ["Hogar", "Muebles", "Electrodomésticos", "Ropa", "Libros", "Otro"];
const catIcon: Record<string, string> = { Hogar: "home", Muebles: "tag", "Electrodomésticos": "settings", Ropa: "heart", Libros: "doc", Otro: "sparkle" };

export default function Garage() {
  const { state, user, t, addVenta, toggleVendido, delVenta, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [soloMios, setSoloMios] = useState(false);
  const [cat, setCat] = useState("todas");
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", descripcion: "", precio: "", categoria: "Hogar", contacto: user?.telefono ?? "" });

  const ventas = useMemo(() => state.ventas.filter((v) => {
    if (soloMios && v.vendedorId !== user?.id) return false;
    if (cat !== "todas" && v.categoria !== cat) return false;
    if (q && !(v.titulo + v.descripcion).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [state.ventas, soloMios, cat, q, user]);

  const publicar = () => {
    if (!form.titulo.trim() || !form.precio || !form.contacto.trim()) {
      toast("Completa título, precio y teléfono de contacto.", "warn");
      return;
    }
    addVenta({ ...form, precio: Number(form.precio), vendedorId: user?.id ?? "" });
    toast("¡Tu artículo ya está publicado en la vitrina!", "ok");
    setOpen(false);
    setForm({ titulo: "", descripcion: "", precio: "", categoria: "Hogar", contacto: user?.telefono ?? "" });
  };

  return (
    <div>
      <SectionHead
        icon="tag" title={t("ventas")} sub={user?.rol === "cliente" || user?.rol === "familiar" ? "Publica lo que ya no uses y vende entre la comunidad Juventudes." : "Vitrina comunitaria de artículos publicados por usuarios."}
        action={<Btn icon="plus" size="lg" onClick={() => setOpen(true)}>{t("publicarVenta")}</Btn>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Icon n="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("buscar")} className="!pl-12" aria-label={t("buscar")} />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="!w-auto" aria-label={t("categoria")}>
          <option value="todas">{t("todos")}</option>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <button onClick={() => setSoloMios(!soloMios)}
          className={`chip border-2 transition-colors !py-2.5 ${soloMios ? "bg-pine-700 text-white border-pine-700" : "bg-white text-pine-800 border-line hover:border-pine-400"}`}>
          <Icon n="user" size={16} /> {t("misAnuncios")}
        </button>
      </div>

      {ventas.length === 0 ? (
        <Empty icon="tag" text={t("sinDatos")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ventas.map((v, i) => {
            const vendedor = state.usuarios.find((u) => u.id === v.vendedorId);
            const mio = v.vendedorId === user?.id;
            return (
              <article key={v.id} className={`card card-hover anim-rise flex flex-col overflow-hidden ${v.vendido ? "opacity-70" : ""}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className={`flex h-28 items-center justify-center ${v.vendido ? "bg-gray-200 text-gray-500" : "bg-pine-700 text-marigold-300"}`}>
                  <Icon n={catIcon[v.categoria] ?? "tag"} size={48} sw={1.5} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-pine-900 leading-snug">{v.titulo}</h3>
                    <Badge tone={v.vendido ? "coral" : "pine"}>{v.vendido ? t("vendido") : t("disponible")}</Badge>
                  </div>
                  <p className="mt-2 text-muted flex-1">{v.descripcion}</p>
                  <p className="mt-3 font-display text-2xl font-black text-pine-800">{fmtCOP(v.precio)}</p>
                  <p className="mt-1 text-sm text-muted">{v.categoria} · {vendedor?.nombre ?? "Usuario"} · {fmtFecha(v.fecha)}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {!v.vendido && <CallBtn tel={v.contacto} label={t("llamar")} size="sm" variant="accent" />}
                    {mio && (
                      <>
                        <Btn size="sm" variant="soft" icon={v.vendido ? "refresh" : "check"} onClick={() => { toggleVendido(v.id); toast(v.vendido ? "Marcado como disponible." : "¡Felicidades! Marcado como vendido.", "ok"); }}>
                          {v.vendido ? "Reactivar" : t("marcarVendido")}
                        </Btn>
                        <Btn size="sm" variant="ghost" icon="trash" onClick={() => setDelId(v.id)} className="text-coral-700 hover:bg-coral-50">{t("eliminar")}</Btn>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t("publicarVenta")}>
        <div className="grid gap-4">
          <Field label={t("tituloAnuncio")} req><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Bicicleta clásica en buen estado" /></Field>
          <Field label={t("descripcion")}><Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("precio")} req><Input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="150000" /></Field>
            <Field label={t("categoria")} req>
              <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label={t("contactoLbl")} req><Input type="tel" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></Field>
          <Btn size="lg" icon="check" onClick={publicar} className="justify-self-end">{t("publicarVenta")}</Btn>
        </div>
      </Modal>

      <ConfirmModal
        open={!!delId} onClose={() => setDelId(null)}
        onYes={() => { if (delId) { delVenta(delId); toast("Anuncio eliminado.", "ok"); } }}
        title={t("eliminar")} body="¿Seguro que deseas eliminar este anuncio? Esta acción no se puede deshacer." yesLabel={t("eliminar")} danger
      />
    </div>
  );
}
