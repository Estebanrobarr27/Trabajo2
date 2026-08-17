# 🚀 Cómo subir Juventudes a GitHub (paso a paso)

Esta guía no requiere saber programar. Sigue los pasos en orden.

---

## ⚠️ Antes de empezar: el nombre del repositorio

El archivo `vite.config.js` contiene esta línea:

```js
base: "/Trabajo-de-don-Oscar/"
```

**El nombre del repositorio que crees debe ser exactamente ese.**
Si le pones otro nombre (por ejemplo `Aplicacion`), la página quedará en
blanco. Dos opciones:

- **Opción A (recomendada):** crea el repositorio con el nombre
  `Trabajo-de-don-Oscar`. No tocas nada más.
- **Opción B:** si quieres otro nombre, pide que te ajusten el `base`
  en `vite.config.js` antes de subir (es un cambio de una línea).

---

## MÉTODO 1 — Desde la página web de GitHub (el más fácil)

No necesitas instalar nada.

### Paso 1 · Descarga el proyecto
Descarga el proyecto completo desde tu entorno de trabajo y
descomprímelo en una carpeta, por ejemplo en el Escritorio.

### Paso 2 · Limpia la carpeta
Dentro de la carpeta descargada, **elimina** estas dos carpetas
(el sitio las genera solo, no se deben subir):

- `node_modules`
- `dist`

### Paso 3 · Muestra los archivos ocultos
El proyecto tiene una carpeta llamada `.github` que es indispensable
para el despliegue automático. Por defecto los sistemas la ocultan:

- **Windows:** en el Explorador → pestaña *Vista* → marca
  *Elementos ocultos*.
- **Mac:** en el Finder presiona `Cmd + Shift + .` (punto).

### Paso 4 · Crea el repositorio nuevo
1. Entra a https://github.com e inicia sesión.
2. Haz clic en el botón verde **New repository** (arriba a la derecha,
   en el símbolo **+**).
3. En *Repository name* escribe: `Trabajo-de-don-Oscar`
4. Déjalo en **Public**.
5. **NO** marques "Add a README file".
6. Presiona **Create repository**.

### Paso 5 · Sube los archivos
1. Entra al repositorio que acabas de crear.
2. Haz clic en el enlace **"uploading an existing file"**.
3. Abre el Explorador/Finder en la carpeta del proyecto (ya limpia)
   y **arrastra TODO su contenido** a la zona de carga de GitHub:
   las carpetas `src`, `public`, `.github` y los archivos sueltos
   (`index.html`, `package.json`, `vite.config.js`, etc.).
4. Espera a que carguen y abajo presiona **Commit changes**.

### Paso 6 · Activa GitHub Pages (solo la primera vez)
1. Dentro del repositorio, haz clic en **Settings**
   (el engranaje, arriba).
2. En el menú izquierdo, haz clic en **Pages**.
3. En **Source**, abre el menú y elige **GitHub Actions**.
4. Listo — se guarda solo.

### Paso 7 · Verifica que tu página esté en línea
1. Haz clic en la pestaña **Actions** del repositorio.
2. Verás un proceso llamado *"Deploy to GitHub Pages"* ejecutándose
   (círculo amarillo) y luego con un check verde ✔.
3. Abre tu sitio en:

   ```
   https://TU-USUARIO.github.io/Trabajo-de-don-Oscar/
   ```

   (reemplaza `TU-USUARIO` por tu nombre de usuario de GitHub).

🎉 **¡Listo!** A partir de ahora, cada vez que subas cambios al
repositorio, la página se actualizará sola en 1 o 2 minutos.

---

## MÉTODO 2 — Con la terminal (si prefieres Git)

Instala Git desde https://git-scm.com, abre una terminal dentro de la
carpeta del proyecto (ya sin `node_modules` ni `dist`) y ejecuta:

```bash
git init
git branch -M main
git add .
git commit -m "Juventudes: aplicación completa"
git remote add origin https://github.com/TU-USUARIO/Trabajo-de-don-Oscar.git
git push -u origin main
```

Cuando te pida credenciales, usa tu usuario de GitHub y un
*Personal Access Token* (no tu contraseña). Para crear el token:
GitHub → Settings → Developer settings → Personal access tokens →
Generate new token (marca el permiso **repo**).

Después sigue el **Paso 6** del Método 1 (activar GitHub Actions
en Settings → Pages).

---

## ❓ Problemas comunes

| Problema | Solución |
|---|---|
| La página se ve **en blanco** | El nombre del repositorio no coincide con el `base` de `vite.config.js`. Renombra el repositorio o pide ajustar el archivo. |
| Error **404** al cargar | En Settings → Pages, *Source* debe decir **GitHub Actions**, no "Deploy from a branch". |
| Actions no aparece | Verifica que hayas subido la carpeta oculta `.github` completa (Paso 3). |
| La página muestra una versión vieja | Espera 1–2 minutos o recarga con `Ctrl + Shift + R`. |

---

## 📦 ¿Qué hace cada carpeta del proyecto?

- `src/` — el código de la aplicación (React + TypeScript).
- `public/` — archivos extra que se copian al sitio final.
- `.github/workflows/deploy.yml` — la receta automática: cada push a
  `main` instala dependencias, compila con `npm run build` y publica
  la carpeta `dist` en GitHub Pages.
- `vite.config.js` — configuración del build (incluye el `base`).
- `dist/` — resultado compilado. **No se sube**: lo genera GitHub.
