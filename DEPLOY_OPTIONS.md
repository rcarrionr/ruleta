# 🚀 Guía de Despliegue (Deploy) Gratuito

Tu aplicación es un proyecto "Estático" (HTML/CSS/JS generado por Vite), lo que significa que puedes alojarlo gratis en proveedores de alto rendimiento sin necesidad de pagar servidores.

Antes de subir, asegúrate de generar la versión final:
```bash
pnpm build
```
Esto creará una carpeta `dist/` con tu aplicación lista.

---

## 🥇 Opción 1: Vercel (Recomendada)
Ideal para proyectos React/Vite. Es la plataforma más rápida y fácil de configurar.

### Método A: Vía GitHub (Automático)
1. Sube tu código a un repositorio de **GitHub**.
2. Ve a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub.
3. Haz clic en **"Add New Project"** e importa tu repositorio.
4. Vercel detectará automáticamente que es **Vite**.
5. Dale a **Deploy**.
   * *Ventaja:* Cada vez que hagas un `git push`, tu web se actualizará sola.

### Método B: Vía CLI (Desde la terminal)
1. Instala Vercel CLI: `pnpm add -g vercel`
2. Ejecuta en tu terminal:
   ```bash
   vercel
   ```
3. Sigue las instrucciones (Enter, Enter, Enter...).
4. ¡Listo! Te dará una URL terminada en `.vercel.app`.

---

## 🥈 Opción 2: Netlify (Drag & Drop)
Perfecto si no quieres usar comandos ni GitHub.

1. Ejecuta `pnpm build` en tu proyecto.
2. Ve a [netlify.com](https://www.netlify.com) y regístrate.
3. En tu panel, verás un área que dice **"Drag sites here"**.
4. Arrastra la carpeta `dist` (que se creó dentro de tu proyecto) y suéltala ahí.
5. En segundos tendrás tu URL en línea.

---

## 🥉 Opción 3: GitHub Pages
Si ya tienes el código en GitHub y quieres que viva ahí.

1. En `vite.config.ts`, agrega la base con el nombre de tu repo:
   ```ts
   export default defineConfig({
     base: "/nombre-de-tu-repo/", // IMPORTANTE
     plugins: [react()],
     // ...
   })
   ```
2. Instala el paquete para publicar:
   ```bash
   pnpm add -D gh-pages
   ```
3. Agrega este script en `package.json`:
   ```json
   "deploy": "gh-pages -d dist"
   ```
4. Ejecuta:
   ```bash
   pnpm build
   pnpm run deploy
   ```

---

## 💡 Recomendación Personal
Usa **Vercel (Método A)** o **Netlify**. Son los que requieren menos configuración y ofrecen HTTPS (candadito verde) y dominio gratis automáticamente.
