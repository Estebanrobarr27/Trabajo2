# 🚀 Cómo publicar Juventudes en GitHub Pages (paso a paso)

Esta guía no requiere saber programar. El método recomendado es el de la
carpeta **`docs/`**: no depende de GitHub Actions, de carpetas ocultas,
ni del nombre del repositorio.

---

## ⭐ Método recomendado: carpeta `docs/`

La aplicación ya viene **compilada** dentro de la carpeta `docs/` de este
proyecto (archivo `docs/index.html`, todo incluido).

### 1) Crea el repositorio (si aún no lo tienes)
- Entra a github.com → botón verde **New repository**.
- Ponle el nombre que quieras (el que sea).
- Déjalo **público**. No marques nada más.
- Presiona **Create repository**.

### 2) Sube los archivos
- Entra al repositorio nuevo → **"uploading an existing file"**.
- Arrastra **todas las carpetas y archivos visibles** de este proyecto,
  con especial atención a la carpeta **`docs`** (es la que lleva la app).
- Presiona **Commit changes**.

> No necesitas `node_modules` ni `dist`. La carpeta `docs` es la clave.

### 3) Activa GitHub Pages
- En el repositorio: **Settings** (Configuración) → **Pages** (menú izquierdo).
- En **Source** elige **"Deploy from a branch"** (Implementar desde una rama).
- En **Branch** elige **main** y en la carpeta elige **/docs**.
- Presiona **Save**.

### 4) ¡Listo!
Espera 1 o 2 minutos y abre:

```
https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/
```

Ejemplo: si tu usuario es `estebanrobarr27` y el repo se llama `Aplicacion`:
**https://estebanrobarr27.github.io/Aplicacion/**

---

## 🔄 Para actualizar el sitio después

Cada vez que descargues una versión nueva del proyecto:
1. Entra al repositorio → carpeta `docs` → archivo `index.html`.
2. Ícono del lápiz ✏️ → borra todo → pega el contenido del nuevo
   `docs/index.html` → **Commit changes**.
3. El sitio se actualiza solo en 1–2 minutos.

---

## 🧪 Para probar en tu computador (sin publicar)

Abre la carpeta `dist` y haz doble clic en `index.html`.
(También puedes usar `docs/index.html`, es el mismo archivo.)

---

## 🤖 Método alternativo: GitHub Actions (automático)

El proyecto incluye `.github/workflows/deploy.yml`, que compila y publica
solo con cada cambio. **Solo funciona si esa carpeta oculta llega al
repositorio** — al subir archivos arrastrando desde el explorador, las
carpetas ocultas (las que empiezan con punto) normalmente NO se incluyen.

Para usarlo:
1. Sube el proyecto con **Git** o **GitHub Desktop** (así sí se incluye `.github`).
2. **Settings → Pages → Source: "GitHub Actions"**.
3. Cada push a `main` republicará el sitio automáticamente.

Si el sitio sigue en blanco con este método, casi siempre es porque
`.github/workflows/deploy.yml` no está visible en la lista de archivos
del repositorio. Verifícalo allí; si no aparece, usa el método `docs/`.

---

## ❓ Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| Página en blanco | Pages apunta a la carpeta equivocada. Debe apuntar a **/docs** (o a GitHub Actions si usas ese método). |
| Error 404 | Estás visitando una URL con un nombre de repo que no existe. Revisa el nombre exacto en la barra del repositorio. |
| "Still deploying" | Espera 1–2 minutos y recarga con `Ctrl + F5`. |
| Nada cambia al actualizar | Verifica que hayas hecho Commit de los cambios y que Pages apunte a main + /docs. |
