# Cognitive Psychology Laws for UX Auditing

This document defines the core cognitive science laws and UX principles that the **UX Expert** must use to audit and refine user interfaces across the platform.

---

## 1. Hick's Law (Decision-Making Fatigue)
> *The time it takes to make a decision increases with the number and complexity of choices.*

### Application in MeeplePrecios
*   **Cart Optimizer**: Instead of overwhelming buyers with dozens of unstructured store permutations, our optimizer highlights "Opción #1: Más Económica" and cleanly structures store breakdowns.
*   **Search Autocomplete**: Autocomplete suggestions are categorized into `Juegos`, `Tiendas`, and `Etiquetas` with keyboard arrow navigation to reduce visual clutter.

---

## 2. Fitts's Law (Reachability and Target Size)
> *The time to acquire a target is a function of the distance to and size of the target.*

### Application in MeeplePrecios
*   **Thumb-Friendly Mobile Layouts**: On mobile screens, all primary action buttons (e.g., "Go to store", "Añadir +", or alert toggles) must be reachable with minimal thumb travel.
*   **Touch Targets**: All buttons, links, and checkboxes on mobile viewports must have a minimum clickable area of `44x44px` with sufficient padding to prevent accidental taps.

---

## 3. Jakob's Law (Familiarity and Mental Models)
> *Users spend most of their time on other sites. They expect your site to work the same way as all the other sites they already know.*

### Application in MeeplePrecios
*   **Price Comparison Tables**: Offers are listed ascending by total cost (base price + shipping), following the established mental model of price comparison aggregators (like Google Shopping or Idealo).
*   **Store Profiles**: Community packaging reviews and vibe tags follow familiar e-commerce trust signals (stars + badges).

---

## 4. Miller's Law (Working Memory Limits)
> *The average person can only keep 7 (plus or minus 2) items in their working memory.*

### Application in MeeplePrecios
*   **Threshold Helper**: When within €15 of free shipping, the Free Shipping Filler Helper recommends exactly up to 3 low-cost accessories rather than an endless catalog scroll.
