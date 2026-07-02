# Backlog de Historias de Usuario & Validación de Requerimientos - MeeplePrecios

Este documento detalla la planeación de producto para **MeeplePrecios**, la plataforma de comparación de precios de juegos de mesa para el mundo de habla hispana (España y Latinoamérica), clonando las funcionalidades core de [Brettspielpreise](https://brettspielpreise.de/) e implementándolas sobre el stack tecnológico de **El Meeple**.

---

## 1. Definición de Personas (Target Users)

*   **Jugador / Comprador (Player / Buyer):** Coleccionista o entusiasta de los juegos de mesa modernos en España o Latinoamérica que busca adquirir un título específico al menor precio posible, considerando los costos de envío a su país, la disponibilidad inmediata y la versión de idioma (español, inglés, etc.).
*   **Socio / Tienda Aliada (Partner / Online Store):** Dueño o administrador de una tienda en línea de juegos de mesa en el ámbito hispanohablante (tiendas físicas con e-commerce o tiendas 100% online) que desea listar su catálogo y precios en la plataforma para captar tráfico calificado y aumentar sus ventas mediante enlaces de afiliación.
*   **Administrador de la Plataforma (Platform Admin):** Moderador y gestor técnico del sistema, encargado de auditar la calidad de los feeds de datos, resolver problemas de mapeo de nombres de juegos, aprobar nuevas tiendas y actualizar los tipos de cambio de divisas.

---

## 2. Historias de Usuario: Jugador (Descubrimiento y Comparación)

### US-01: Buscador Predictivo Inteligente (Smart Search)
*   **Fórmula:** Como **Jugador**, quiero **escribir el nombre de un juego en una barra de búsqueda predictiva**, para **autocompletar y encontrar rápidamente la ficha del juego sin importar si busco por nombre en español o el título original de BoardGameGeek (BGG)**.
*   **Criterios de Aceptación:**
    1. La barra de búsqueda debe autocompletar resultados a partir de 3 caracteres.
    2. Debe realizar búsquedas insensibles a mayúsculas y acentos sobre el nombre principal y los nombres alternativos (BGG alternate names).
    3. Al seleccionar un juego en el dropdown, redirige directamente a su ficha `/game/[slug]`.
*   **Estado:** **[PLANIFICADO]**

### US-02: Tabla Comparativa de Ofertas y Precios
*   **Fórmula:** Como **Jugador**, quiero **ver una lista detallada de tiendas que venden el juego que busco**, para **comparar el precio base, el costo de envío y el precio total de forma transparente**.
*   **Criterios de Aceptación:**
    1. La tabla comparativa debe listar los resultados ordenados por precio total de menor a mayor por defecto.
    2. Cada fila debe mostrar: Logotipo y nombre de la tienda, calificación de reputación, idioma/edición del juego (representado con banderas SVG, ej. 🇪🇸 para español, 🇬🇧 para inglés), stock (Disponible, Bajo Pedido, Agotado), precio del juego, costo de envío a la ubicación seleccionada y precio total.
    3. Hacer clic en "Ir a la tienda" debe abrir una nueva pestaña redirigiendo al producto con un enlace de afiliado.
*   **Estado:** **[PLANIFICADO]**

### US-03: Configuración Global de Ubicación y Moneda (Toolbar)
*   **Fórmula:** Como **Jugador**, quiero **seleccionar mi país de entrega y mi moneda preferida en la barra superior**, para **ver los costos de envío reales y los precios en mi divisa local**.
*   **Criterios de Aceptación:**
    1. Debe permitir seleccionar países de entrega (España, México, Argentina, Colombia, Chile, Perú, etc.).
    2. Debe permitir seleccionar monedas (EUR, MXN, ARS, COP, CLP, USD).
    3. Cambiar el país debe recalcular inmediatamente los costos de envío en la tabla comparativa usando la matriz de envíos de cada tienda.
    4. Cambiar la moneda debe aplicar la tasa de conversión guardada en la base de datos y cambiar el símbolo de divisa en toda la web.
*   **Estado:** **[PLANIFICADO]**

### US-04: Filtros de Búsqueda y Navegación de Catálogo
*   **Fórmula:** Como **Jugador**, quiero **filtrar los juegos del catálogo general por categoría, mecánicas, precio y disponibilidad**, para **descubrir nuevas ofertas que se ajusten a mis gustos y presupuesto**.
*   **Criterios de Aceptación:**
    1. Permite filtrar solo juegos "En Stock" en al menos una tienda.
    2. Permite usar chips de filtro para categorías y mecánicas obtenidas de BGG (ej. *Estrategia*, *Cooperativo*, *Colocación de Trabajadores*).
    3. Permite definir un rango de precio máximo usando un slider responsivo.
*   **Estado:** **[PLANIFICADO]**

### US-05: Historial y Gráfico de Evolución de Precios
*   **Fórmula:** Como **Jugador**, quiero **ver un gráfico interactivo con el historial de precios mínimos del juego en los últimos meses**, para **saber si la oferta actual es realmente buena o si es mejor esperar**.
*   **Criterios de Aceptación:**
    1. La ficha del juego debe renderizar un gráfico de líneas limpio (usando una librería ligera e interactiva, libre de emojis).
    2. Debe registrar el precio mínimo diario de mercado del juego y permitir filtrar la vista por 30 días, 90 días o 1 año.
*   **Estado:** **[PLANIFICADO]**

### US-06: Lista de Deseos y Alertas de Caída de Precios
*   **Fórmula:** Como **Jugador registrado**, quiero **guardar juegos en mi lista de deseos y configurar una alerta de precio**, para **recibir un correo automático cuando el juego baje del precio que estoy dispuesto a pagar**.
*   **Criterios de Aceptación:**
    1. Permite agregar un juego a la lista de deseos con un botón "Añadir a Wunschliste/Lista".
    2. Si se activa la alerta de precio, solicita el precio objetivo en la moneda seleccionada.
    3. Un proceso programado (cron job) verifica diariamente los precios mínimos y dispara correos vía Resend a los usuarios cuya alerta haya sido superada.
*   **Estado:** **[PLANIFICADO]**

---

## 3. Historias de Usuario: Socio / Tienda Aliada (Merchant)

### US-07: Registro y Onboarding Secuencial de Tiendas
*   **Fórmula:** Como **Dueño de Tienda**, quiero **registrar mi comercio en un formulario secuencial paso a paso**, para **comenzar a listar mis productos en el comparador de precios**.
*   **Criterios de Aceptación:**
    1. El paso 1 vincula la cuenta de la tienda con la sesión activa de NextAuth (correo y nombre del administrador).
    2. El paso 2 solicita datos de la tienda: Nombre comercial, URL del e-commerce, país de origen, y subida del logotipo comercial (que se recortará en canvas a `150x150px`).
    3. El paso 3 solicita ingresar datos fiscales/comerciales de verificación (RFC/NIF) para auditoría de seguridad.
*   **Estado:** **[PLANIFICADO]**

### US-08: Configuración de Matriz de Costos de Envío
*   **Fórmula:** Como **Dueño de Tienda**, quiero **configurar mis costos y condiciones de envío por país de destino desde mi panel de control**, para **que los compradores vean cálculos de envío precisos**.
*   **Criterios de Aceptación:**
    1. Permite definir tarifas planas de envío para diferentes países.
    2. Permite establecer un umbral de envío gratuito (ej. *Envío gratis a España a partir de 50 EUR* o *Gratis a México a partir de 1500 MXN*).
    3. Si un país no está soportado por la tienda, se marca como "No disponible para envío a [País]".
*   **Estado:** **[PLANIFICADO]**

### US-09: Integración de Catálogo vía Feed XML/CSV
*   **Fórmula:** Como **Dueño de Tienda**, quiero **proporcionar la URL del feed XML o CSV de mi inventario en mi panel**, para **que mi catálogo de productos, precios y stock se actualice automáticamente sin intervención manual**.
*   **Criterios de Aceptación:**
    1. Permite ingresar y validar la URL del feed en el panel de la tienda.
    2. El formato del feed debe seguir una especificación estándar de la plataforma (EAN/UPC, título del juego, URL de compra, precio base, stock numérico, e imagen).
    3. El sistema valida la estructura del feed en tiempo real al guardarlo y muestra un badge de estado (Sincronizado, Error de Formato, Fuera de Línea).
*   **Estado:** **[PLANIFICADO]**

### US-10: Panel de Analíticas y Clics de Afiliado
*   **Fórmula:** Como **Dueño de Tienda**, quiero **ver estadísticas de los clics y visitas redirigidas desde MeeplePrecios hacia mi web**, para **medir el retorno de inversión y el tráfico generado**.
*   **Criterios de Aceptación:**
    1. El panel muestra un gráfico de barras con los clics diarios/semanales acumulados.
    2. Muestra un listado de los juegos más visitados que llevaron tráfico a su e-commerce.
*   **Estado:** **[PLANIFICADO]**

---

## 4. Historias de Usuario: Administrador de la Plataforma (Platform Admin)

### US-11: Panel de Auditoría y Verificación de Tiendas
*   **Fórmula:** Como **Administrador de la Plataforma**, quiero **revisar y aprobar las solicitudes de registro de nuevas tiendas**, para **garantizar que solo e-commerce legítimos y seguros se listen en el comparador**.
*   **Criterios de Aceptación:**
    1. Panel seguro en `/admin` con contadores de solicitudes pendientes.
    2. Modal de auditoría que muestra el RFC/NIF, sitio web e historial de la tienda.
    3. Al aprobar (`verified: true`), la tienda se activa en el comparador y su feed comienza a procesarse en el siguiente ciclo cron.
    4. Al rechazar, requiere un motivo de rechazo que se notifica al dueño de la tienda.
*   **Estado:** **[PLANIFICADO]**

### US-12: Diagnóstico y Monitoreo de Feeds
*   **Fórmula:** Como **Administrador de la Plataforma**, quiero **ver el estado general de todas las sincronizaciones de feeds en tiempo real**, para **detectar rápidamente qué tiendas tienen problemas con sus catálogos**.
*   **Criterios de Aceptación:**
    1. Muestra una tabla con el nombre de cada tienda, última sincronización, número de productos mapeados, número de errores de mapeo (ej. juegos sin EAN válido) y estado del feed.
    2. Permite disparar una sincronización manual de emergencia para una tienda específica.
*   **Estado:** **[PLANIFICADO]**

### US-13: Panel de Gestión Cambiaria (Monedas y Divisas)
*   **Fórmula:** Como **Administrador de la Plataforma**, quiero **configurar las tasas de cambio de las monedas principales de soporte**, para **asegurar que las conversiones cambiarias sean precisas para los usuarios**.
*   **Criterios de Aceptación:**
    1. Permite activar/desactivar monedas.
    2. Muestra la tasa cambiaria actual respecto a la moneda base (EUR) y permite forzar una actualización manual o programar una actualización diaria automática con un servicio de Forex (ej. ExchangeRatesAPI).
*   **Estado:** **[PLANIFICADO]**

---

## 5. Requerimientos Técnicos y de Automatización (Backlog Técnico)

### US-14: Sincronización Programada de Feeds de Tiendas (Cron Job)
*   **Fórmula:** Como **Sistema**, quiero **ejecutar un proceso CRON diario en segundo plano**, para **analizar los feeds XML/CSV de todas las tiendas aprobadas y mantener los precios de la base de datos actualizados**.
*   **Criterios de Aceptación:**
    1. El proceso recorre secuencialmente los feeds válidos, utilizando `fast-xml-parser` para leer los datos.
    2. Actualiza los precios, stock y URLs en la tabla relacional `store_games`.
    3. Si un juego del feed no existe en la caché global de juegos de BGG, se encola para descargar sus metadatos desde la API de BGG.
*   **Estado:** **[PLANIFICADO]**

### US-15: Encolamiento y Caché de Metadatos de BoardGameGeek (BGG API)
*   **Fórmula:** Como **Sistema**, quiero **consultar y cachear los metadatos y portadas de los juegos desde BoardGameGeek**, para **evitar sobrepasar el límite de tasa de la API de BGG y acelerar la carga de fichas de juegos**.
*   **Criterios de Aceptación:**
    1. Al mapear un nuevo juego, se verifica en la tabla `bgg_games_cache` por `bgg_id` o código de barra (EAN/UPC).
    2. Si no existe, se hace fetch a `https://boardgamegeek.com/xmlapi2/thing?id=<id>` y se guarda el resultado (nombre original, descripción, imagen, peso, mecánicas, nombres alternativos) en la caché.
    3. Implementa reintentos automáticos ante respuestas HTTP 202 o límites de tasa HTTP 429 de BGG.
*   **Estado:** **[PLANIFICADO]**
