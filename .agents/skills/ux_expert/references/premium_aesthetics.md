# Premium Visual Standards and Aesthetics Specification

This document defines the high-end UI tokens, glassmorphism CSS templates, tactile transitions, and vector SVG specifications required to maintain the **MeeplePrecios** premium brand aesthetic.

---

## 1. Tailwind Semantic Theme Configuration

Our official brand color tokens defined in `DESIGN.md`:
*   `Blanco Roto`: `#F5F0E9` (Main layouts, cards, backgrounds)
*   `Carbón Suave`: `#3A3A3A` (Primary text, headers, borders)
*   `Malva Suave`: `#8367C7` (Primary interactive highlights, buttons, badges)
*   `Coral`: `#FF9E8A` (Alert badges, warnings, price drops)
*   `Turquesa`: `#73D8D4` (Verified merchant indicators, success badges)

---

## 2. Premium Glassmorphism Templates

*   **Floating Cards & Dropdowns**:
    `bg-[#F5F0E9]/95 border border-[#3A3A3A]/10 shadow-2xl backdrop-blur-md`
*   **Comparison Rows & Cards**:
    `bg-white/90 border border-gray-200 hover:border-[#8367C7]/40 hover:shadow-md transition-all duration-200 rounded-2xl`

---

## 3. Tactile Transitions and Micro-Animations

*   **Interactive Controls**:
    `transition-all duration-200 ease-in-out hover:scale-[1.015] active:scale-[0.985]`
*   **Loading States**:
    Use clean pulse or smooth CSS spinners with brand colors (`border-indigo-650`).

---

## 4. Vector SVG Iconography Specifications (No Emojis)

Raw, colorful emojis are strictly prohibited in user-facing UI elements. Use high-fidelity SVG vectors or clean typographic glyphs (such as `★` and `☆` for ratings or SVG checkmarks for verified storefronts).
