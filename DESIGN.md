# Arquitectura y Diseño del Sistema: MeeplePrecios

Este documento define las directrices arquitectónicas, los esquemas de base de datos, el sistema de diseño visual y las convenciones técnicas de **MeeplePrecios**, el comparador de precios de juegos de mesa para el mundo hispanohablante.

---

## 1. Visión General del Producto

*   **Nombre del Proyecto:** MeeplePrecios (meepleprecios.com / preciosjuegosdemesa.es)
*   **Concepto:** El principal comparador independiente de precios de juegos de mesa y accesorios para España y Latinoamérica.
*   **Propuesta de Valor:** Ayudamos a los jugadores a encontrar las mejores ofertas consolidadas considerando envíos e impuestos, y a las tiendas independientes a captar tráfico y ventas mediante enlaces de afiliación automatizados.
*   **Modelo de Negocio:** Afiliación (costo por clic calificado a las tiendas asociadas y comisiones por venta) y suscripciones premium para destacar ofertas.

---

## 2. Audiencia y Personas de Usuario

### 2.1 Jugadores y Compradores
*   **Sofía – La Cazadora de Ofertas**
    *   **Perfil:** 28 años, coleccionista de juegos de mesa en Ciudad de México.
    *   **Objetivos:** Encontrar títulos importados o locales al mejor precio total. Quiere saber si el envío internacional de una tienda en España o EE.UU. le conviene en comparación con una tienda local mexicana.
    *   **Puntos de Dolor:** Las tiendas tienen precios dispares, y calcular los costos de envío uno por uno toma demasiado tiempo. A veces compra un juego que pensaba que estaba en español y le llega en inglés.
    *   **Solución:** Busca el juego en MeeplePrecios, selecciona México como país de entrega y MXN como moneda. La tabla le desglosa el idioma exacto de la edición y el precio total con envío calculado de forma transparente.

### 2.2 Socios y Tiendas (Merchants)
*   **Carlos – Administrador de Tienda Online**
    *   **Perfil:** 35 años, dueño de un e-commerce especializado en juegos de mesa en Madrid.
    *   **Objetivos:** Listar su stock diario en un sitio que concentre a su público objetivo, maximizando el tráfico de alta conversión hacia su web.
    *   **Puntos de Dolor:** Subir juegos a mano a directorios de ofertas es inviable. El stock cambia cada hora debido a preventas y lanzamientos.
    *   **Solución:** Registra su tienda en MeeplePrecios, proporciona la URL de su feed XML auto-generado por Shopify/WooCommerce, y configura su tarifa plana de envíos. El sistema se sincroniza en segundo plano automáticamente.

---

## 3. Alcance de Funcionalidades del MVP (Feature Scope)

*   **Buscador Inteligente con Autocompletado:** Barra de búsqueda predictiva en la cabecera que consulta tanto títulos oficiales de BGG como traducciones y títulos en español.
*   **Ficha Detallada del Juego (`/game/[slug]`):** SEO-friendly. Muestra portada de alta resolución, descripción resumida en español, estadísticas de BGG (peso/complejidad, número recomendado de jugadores, duración) y la tabla comparativa de precios.
*   **Tabla Comparativa Multitienda:** Lista de ofertas ordenadas de menor a mayor precio total. Incluye costo del juego, costo de envío según país de destino, indicador de idioma, stock en tiempo real y enlace de redirección afiliada.
*   **Settings Toolbar Global:** Selector persistente en la cabecera que permite al usuario definir su País de Entrega (para cálculo de envíos) y Moneda de visualización (para conversión en tiempo real).
*   **Historial de Precios:** Gráfico de líneas sin emojis que muestra las fluctuaciones del precio mínimo histórico de cada juego.
*   **Alertas de Precio y Wishlist:** Los usuarios registrados pueden añadir juegos a su lista de seguimiento y activar notificaciones automáticas por correo cuando un título baja de precio.
*   **Portal de Autogestión para Tiendas (Merchant Dashboard):** Permite a las tiendas registrarse, editar sus datos fiscales, subir su logotipo comercial (autocrop a `150x150px` en canvas), definir su matriz de tarifas de envío por país y configurar su feed XML/CSV.
*   **Proceso Cron de Sincronización:** Tarea diaria programada en segundo plano que recorre los feeds XML de las tiendas aprobadas y refresca los precios del sistema.

---

## 4. Interfaz de Usuario y Sistema de Diseño Visual

Seguimos estrictamente el sistema de diseño visual de **El Meeple** para garantizar una experiencia premium, minimalista y libre de saturación cognitiva.

### 4.1 Paleta de Colores Corporativa
| Propósito del Elemento | Nombre del Color | Código Hexadecimal |
| :--- | :--- | :--- |
| Fondo Principal / Base | Blanco roto | `#F5F0E9` |
| Texto Principal / UI Oscura | Carbón suave | `#3A3A3A` |
| Acento Primario / Botones / Destacados | Malva suave | `#8367C7` |
| Acento Secundario / Etiquetas de Estado | Turquesa pastel | `#73D8D4` |
| Alertas / Precios / Errores | Coral deslavado | `#FF9E8A` |

### 4.2 Reglas Críticas de Diseño (UI Rules)
*   **Baneo Estricto de Emojis:** Queda terminantemente prohibido el uso de emojis crudos (como 🎲, ⏰, 👤, 🛒, 📦, ✉️) en elementos de interfaz del usuario (botones, cabeceras, listados, formularios). Se deben reemplazar por iconos vectoriales SVG estilizados con los colores de marca o símbolos tipográficos limpios (e.g. ★, ☆). Las banderas de países para selección de idioma/envío se renderizarán mediante SVG vectoriales específicos.
*   **Visualización de Precios Destacados:** El precio total (Precio Juego + Envío) debe resaltarse visualmente usando el color Coral `#FF9E8A` o Malva `#8367C7` con tipografía de alto peso para destacar el menor precio del mercado.
*   **Carga y Recorte del Logo de Tienda:** Los logotipos de tiendas aliadas subidos durante el onboarding se procesan en el navegador mediante canvas para redimensionarse a exactamente `150x150px` en formato JPEG base64 (manteniendo el peso del registro en base de datos menor a 10 KB).
*   **Modo Oscuro Integrado:** Soporte nativo para clase `.dark` mapeada en la etiqueta `html`. Los fondos cambian a tonos carbón profundo (`#121212`, `#1E1E1E`) y los textos al Blanco Roto (`#F5F0E9`), previniendo destellos blancos durante la carga de página.
*   **Diseño de Estados Vacíos (Zero States):** Al buscar un juego sin coincidencias o aplicar filtros sin resultados, se renderiza una tarjeta informativa estilizada (`data-testid="zero-state-search"`) con sugerencias y un botón de marca para limpiar filtros, usando ilustraciones vectoriales limpias (no emojis).

---

## 5. Arquitectura Técnica (El Stack "ShipFast")

*   **Framework Principal:** Next.js (App Router) en TypeScript, actuando de forma monolítica para el frontend y el backend (Server Actions y API Routes).
*   **Base de Datos (Supabase / PostgreSQL):**
    *   `profiles`: Tabla central de usuarios extendiendo Supabase Auth con columna de rol (`player`, `partner`, `admin`).
    *   `stores`: Datos comerciales de las tiendas aliadas (nombre, slug único, logotipo base64, URL base, estado verificado, URL del feed XML, estado del feed, e-mail del dueño).
    *   `shipping_rates`: Tarifas de envío configuradas por las tiendas. Columnas: `store_id`, `destination_country` (código ISO de 2 letras), `flat_rate` (numérico), `free_shipping_threshold` (numérico, nullable).
    *   `bgg_games_cache`: Catálogo global cacheado de juegos importados desde BGG para evitar límites de tasa. Columnas: `bgg_id`, `name`, `thumbnail`, `weight` (complejidad), `min_players`, `max_players`, `playing_time`, `alternate_names` (array de texto), `last_updated_at`.
    *   `store_games`: Tabla intermedia de ofertas mapeadas por los feeds diarios. Columnas: `store_id`, `bgg_id`, `store_product_url`, `price` (decimal), `stock` (entero/disponibilidad), `edition_language` (texto), `last_updated_at`. Clave única compuesta en `(store_id, bgg_id)`.
    *   `price_alerts`: Registra las solicitudes de notificaciones de bajadas de precio de los usuarios.
    *   `exchange_rates`: Almacena la paridad cambiaria diaria (base EUR).
*   **Row-Level Security (RLS):** RLS activado en todas las tablas.
    *   `SELECT` público para tablas de catálogo de juegos (`bgg_games_cache`), tiendas (`stores`), y ofertas (`store_games`).
    *   `INSERT/UPDATE` protegido por políticas de Supabase restringiendo escrituras a dueños autenticados de sus respectivas tiendas (`store_id` vinculado al e-mail de la sesión).
*   **Integración de Feeds XML:** Procesamiento del feed de cada tienda mediante el parser rápido `fast-xml-parser` en las Server Actions de Supabase y rutas de API.
*   **Integración BGG API:** Consulta segura al endpoint de BoardGameGeek (`https://boardgamegeek.com/xmlapi2/...`) con gestor de cola de reintentos (HTTP 202) y cabecera de autenticación limpia.

---

## 6. Estrategia de Pruebas (TDD)

*   **Desarrollo Dirigido por Pruebas (TDD):** Escribir tests unitarios e integración antes de modificar componentes Next.js o Server Actions.
*   **Pruebas Unitarias y de Integración (Jest + RTL):**
    *   Simular peticiones Supabase y mapeo de XML.
    *   Ejecución serial obligatoria (`--runInBand --forceExit`) para optimizar memoria en JSDOM.
*   **Pruebas E2E de Flujos (Playwright):**
    *   Simulación de usuario configurando entrega a México, visualizando precios convertidos de EUR a MXN con envío integrado en la tabla.
    *   Simulación de onboarding de tienda con recorte de logo e ingreso de URL del feed XML.
    *   Captura automática de vistas en resoluciones Desktop (1280x800) y Móvil (390x844).
