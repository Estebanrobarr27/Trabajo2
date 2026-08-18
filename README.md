# 🌞 Juventudes — Asistencia y mandados para personas mayores

Plataforma de asistencia, mandados y acompañamiento para personas mayores en **Colombia**.

Permite a personas mayores (y a sus familiares) solicitar mandados, gestionar información médica, citas y emergencias; y al equipo operativo asignar, dar seguimiento y controlar cada servicio.

> **Sitio publicado:** [https://estebanrobarr27.github.io/Trabajo-de-don-Oscar/](https://estebanrobarr27.github.io/Trabajo-de-don-Oscar/)

## ✨ Características

- **5 roles** con permisos diferenciados: Superadministrador, Encargado, Empleado, Cliente (persona mayor) y Familiar.
- **Sistema de mandados**: solicitud, asignación, seguimiento por estados, historial completo y cancelaciones configurables.
- **Botón de pánico** con cuenta regresiva, ubicación GPS y alertas a contactos de emergencia y personal autorizado.
- **Información médica**: medicamentos, alergias, antecedentes, citas, alertas y modo de privacidad.
- **Ventas de garaje**, conductores elegidos, tasas de cambio, noticias y líneas de emergencia.
- **Configuración dinámica**: el superadministrador puede crear campos, estados, tarifas y enlaces sin tocar código.
- **Multilingüe**: español e inglés.
- **Responsive** y pensado para personas mayores: botones grandes, alto contraste y tipografía legible.

## 🔑 Acceso de demostración

| Rol            | Correo                  | Contraseña    |
| -------------- | ----------------------- | ------------- |
| Cliente        | `cliente@juventudes.co` | `cliente123`  |
| Familiar       | `familiar@juventudes.co`| `familiar123` |
| Empleado       | `luis@juventudes.co`    | `empleado123` |
| Encargado      | `andres@juventudes.co`  | `encargado123`|
| Superadmin     | `gloria@juventudes.co`  | `admin123`    |

> Los registros nuevos quedan **pendientes de aprobación** por un Encargado.

## 🚀 Ejecutar en local

```bash
npm install     # instalar dependencias
npm run dev     # entorno de desarrollo (http://localhost:3000)
npm run build   # compilar para producción (carpeta dist)
```

## ☁️ Despliegue automático (GitHub Actions)

Cada `push` a la rama `main` ejecuta un flujo que instala dependencias, compila la aplicación y publica la carpeta `dist` en **GitHub Pages**.

- Flujo: `.github/workflows/deploy.yml`
- Configuración de rutas: `vite.config.js` (`base: "/Trabajo-de-don-Oscar/"`)

### Activar GitHub Pages (solo la primera vez)

1. En el repositorio: **Settings → Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Haz un `push` a `main` y espera a que el flujo termine.

## 🗂️ Estructura

```
src/
├── main.tsx          # punto de entrada
├── App.tsx           # shell, navegación, botón de pánico
├── store.tsx         # estado global, auth y acciones
├── types.ts          # modelo de datos
├── i18n.ts           # traducciones (es/en)
├── data/seed.ts      # datos iniciales
├── components/       # ui, iconos, campos dinámicos
└── pages/            # vistas por rol y módulo
```

## 🛠️ Tecnologías

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- GitHub Actions + GitHub Pages

---

Hecho con 🇨🇴 en Colombia.
