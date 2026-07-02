# Handoff Sprint Memo: MeeplePrecios (Fase 1: Planificación e Historias de Usuario)

Este memorando resume el estado actual del sprint de planificación inicial para el clon de [Brettspielpreise](https://brettspielpreise.de/) adaptado para el mercado hispanohablante.

---

## 1. Detalles del Repositorio y Rama Activa
*   **Repositorio GitHub:** [zapata131/elmeeple-tienda](https://github.com/zapata131/elmeeple-tienda)
*   **Rama de Trabajo:** `main`
*   **Archivos Creados/Configurados:**
    *   [backlog_user_stories.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/backlog_user_stories.md): Backlog completo de historias de usuario (Jugadores, Tiendas Asociadas y Administradores).
    *   [DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/DESIGN.md): Especificación de arquitectura técnica, esquemas Supabase relacionales, y sistema de diseño premium sin emojis.
    *   [AGENTS.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/AGENTS.md): Reglas de agentes de IA, checklist crítico, convenciones de sincronización de feeds y estándares TDD.

---

## 2. Estado de Hitos y Tareas

### Hito 1: Planificación de Producto [100% COMPLETADO]
*   [x] Exploración profunda de Brettspielpreise.de (cabecera, selectores de entrega/moneda, tabla de precios, idioma, y feeds de tiendas).
*   [x] Redacción del backlog de historias de usuario bajo el esquema clásico ágil en español.
*   [x] Codificación de reglas de agentes y arquitectura técnica en `DESIGN.md` y `AGENTS.md`.
*   [x] Creación del repositorio remoto y publicación de 15 issues (US-01 a US-15) correspondientes al backlog de historias de usuario.

### Hito 2: Configuración Inicial de Entorno [PENDIENTE]
*   [ ] Inicialización del proyecto Next.js 16 con TypeScript y configuración de scripts (`dev`, `build`, `test`, `verify`).
*   [ ] Instalación de dependencias core (`@supabase/supabase-js`, `@supabase/ssr`, `fast-xml-parser`, `tailwindcss` v4).
*   [ ] Configuración del entorno de testing local (Jest, JSDOM, Playwright y scripts de base de datos de simulación).

---

## 3. Estado de la Suite de Pruebas (Test Status)
*   **Pruebas Unitarias/Integración (Jest):** Sin iniciar (0 pruebas).
*   **Pruebas E2E (Playwright Walkthroughs):** Sin iniciar.

---

## 4. Listado de Issues Creados en GitHub (https://github.com/zapata131/elmeeple-tienda/issues)
*   `#1` [US-01: Buscador Predictivo Inteligente (Smart Search)](https://github.com/zapata131/elmeeple-tienda/issues/1)
*   `#2` [US-02: Tabla Comparativa de Ofertas y Precios](https://github.com/zapata131/elmeeple-tienda/issues/2)
*   `#3` [US-03: Configuración Global de Ubicación y Moneda (Toolbar)](https://github.com/zapata131/elmeeple-tienda/issues/3)
*   `#4` [US-04: Filtros de Búsqueda y Navegación de Catálogo](https://github.com/zapata131/elmeeple-tienda/issues/4)
*   `#5` [US-05: Historial y Gráfico de Evolución de Precios](https://github.com/zapata131/elmeeple-tienda/issues/5)
*   `#6` [US-06: Lista de Deseos y Alertas de Caída de Precios](https://github.com/zapata131/elmeeple-tienda/issues/6)
*   `#7` [US-07: Registro y Onboarding Secuencial de Tiendas](https://github.com/zapata131/elmeeple-tienda/issues/7)
*   `#8` [US-08: Configuración de Matriz de Costos de Envío](https://github.com/zapata131/elmeeple-tienda/issues/8)
*   `#9` [US-09: Integración de Catálogo vía Feed XML/CSV](https://github.com/zapata131/elmeeple-tienda/issues/9)
*   `#10` [US-10: Panel de Analíticas y Clics de Afiliado](https://github.com/zapata131/elmeeple-tienda/issues/10)
*   `#11` [US-11: Panel de Auditoría y Verificación de Tiendas](https://github.com/zapata131/elmeeple-tienda/issues/11)
*   `#12` [US-12: Diagnóstico y Monitoreo de Feeds](https://github.com/zapata131/elmeeple-tienda/issues/12)
*   `#13` [US-13: Panel de Gestión Cambiaria (Monedas y Divisas)](https://github.com/zapata131/elmeeple-tienda/issues/13)
*   `#14` [US-14: Sincronización Programada de Feeds de Tiendas (Cron Job)](https://github.com/zapata131/elmeeple-tienda/issues/14)
*   `#15` [US-15: Encolamiento y Caché de Metadatos de BoardGameGeek (BGG API)](https://github.com/zapata131/elmeeple-tienda/issues/15)

---

## 5. Próximos Pasos Recomendados (Next Steps)
1.  **Ejecutar la creación de la app Next.js:** Inicializar el boilerplate del e-commerce utilizando `npx` y las reglas definidas en la sección `web_application_development`.
2.  **Configurar base de datos en Supabase:** Crear las migraciones SQL locales basadas en la arquitectura relacional (`profiles`, `stores`, `shipping_rates`, `bgg_games_cache`, `store_games`, `price_alerts`).
3.  **Implementar TDD en el buscador predictivo (US-01):** Comenzar programando las pruebas de autocompletado y búsqueda de juegos.
