# Plan de Migración a Entorno NPM Moderno

Este documento detalla el plan de acción para transformar el proyecto actual (HTML/JS Vanilla) a una aplicación moderna basada en componentes, gestionada por NPM (vía `pnpm`).

## 🛠 Tech Stack Sugerido (Herramientas Recomendadas)

Para una aplicación tipo "Ruleta", buscamos rendimiento, facilidad para manejar el estado y animaciones fluidas.

1.  **Core & Build Tool:**
    *   **[Vite](https://vitejs.dev/):** Extremadamente rápido para desarrollo y build. Reemplaza a las configuraciones complejas de Webpack.
    *   **[React](https://react.dev/):** Librería estándar para interfaces de usuario. Facilita la gestión de la lógica de la ruleta mediante componentes.
    *   **[TypeScript](https://www.typescriptlang.org/):** Añade tipado estático, reduciendo errores (bugs) drásticamente a largo plazo.

2.  **Estilos & UI:**
    *   **[Tailwind CSS](https://tailwindcss.com/):** (Recomendado) Framework de utilidad para estilos rápidos y modernos sin salir del HTML/JSX.
    *   *Alternativa:* **Bootstrap 5** (Si prefieres un enfoque más clásico/estructurado).
    *   **[Framer Motion](https://www.framer.com/motion/):** La mejor librería para animaciones en React. Crucial para el movimiento de la ruleta.

3.  **Gestión de Paquetes:**
    *   **`pnpm`:** (Tu preferencia) Rápido y eficiente con el espacio en disco.

4.  **Calidad de Código:**
    *   **ESLint + Prettier:** Para mantener el código limpio y consistente.
    *   **Path Aliases:** Configuración de `@/` para importaciones limpias.

---

## 📅 Plan de Acción Paso a Paso

### Fase 1: Inicialización del Entorno
1.  **Backup:** Asegurar que los archivos actuales (`index.html`, `script.js`, `style.css`) estén respaldados (o bajo control de versiones).
2.  **Inicializar Proyecto:** Crear el `package.json` usando `pnpm`.
3.  **Instalar Dependencias Core:** React, React DOM.
4.  **Instalar Dependencias de Desarrollo:** Vite, TypeScript, plugins de Vite, Types para React.

### Fase 2: Configuración
1.  **TypeScript:** Crear `tsconfig.json` configurado para React + Vite.
2.  **Vite:** Crear `vite.config.ts`.
    *   Configurar el plugin de React.
    *   **Importante:** Configurar el alias `@/` apuntando a `src/`.
3.  **Scripts:** Añadir comandos `dev`, `build`, y `preview` al `package.json`.

### Fase 3: Reestructuración de Archivos
Crear la siguiente estructura de carpetas:
```text
/
├── public/           (Assets estáticos como imágenes)
├── src/
│   ├── assets/       (Estilos globales, fuentes)
│   ├── components/   (Componentes: Wheel.tsx, Controls.tsx, WinnerModal.tsx)
│   ├── hooks/        (Lógica reutilizable: useRoulette.ts)
│   ├── types/        (Definiciones TS: interfaces de jugadores/premios)
│   ├── App.tsx       (Componente principal)
│   ├── main.tsx      (Punto de entrada)
│   └── index.css     (Estilos globales/Tailwind)
├── index.html        (Movido a la raíz para Vite)
└── ...config files
```

### Fase 4: Migración de Código (Porting)
1.  **HTML a JSX:** Mover la estructura de `index.html` a `App.tsx` y componentes individuales.
2.  **CSS:**
    *   Opción A (Tailwind): Reemplazar clases CSS por utilidades de Tailwind.
    *   Opción B (CSS Modules): Renombrar `style.css` y modularizarlo.
3.  **Lógica (JS a TS):**
    *   Convertir las variables globales de `script.js` a **React State** (`useState`).
    *   Mover la lógica de giro y cálculo de ganador a funciones o custom hooks dentro de los componentes.
    *   Tipar las variables (ej: definir la interfaz `Prize`).

### Fase 5: Limpieza y Verificación
1.  Eliminar los archivos antiguos (`script.js`, `style.css` raíz).
2.  Ejecutar linter y formatter.
3.  Probar el build de producción.

---

## 🚀 ¿Cómo proceder?

Si estás de acuerdo con este plan, puedo comenzar con la **Fase 1 y 2** inmediatamente: inicializando el proyecto con Vite y configurando las herramientas base.
