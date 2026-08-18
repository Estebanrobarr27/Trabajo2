import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { copyFileSync, mkdirSync } from "node:fs";

/* Copia automática: cada compilación deja una copia de la aplicación
   terminada en docs/index.html, lista para GitHub Pages
   ("Deploy from a branch" → carpeta /docs). Sin Actions, sin rutas,
   sin depender del nombre del repositorio. */
const syncDocs = {
  name: "juventudes-sync-docs",
  closeBundle() {
    mkdirSync("docs", { recursive: true });
    copyFileSync("dist/index.html", "docs/index.html");
    console.log("[docs] aplicación copiada a docs/index.html");
  },
};

export default defineConfig({
  // viteSingleFile incrusta TODO el JavaScript y el CSS dentro de index.html:
  // el resultado es un único archivo autocontenido que funciona con DOBLE CLIC
  // (sin servidor) y también publicado en GitHub Pages con cualquier nombre
  // de repositorio (ya no depende de rutas ni de archivos externos).
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile(), syncDocs],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
