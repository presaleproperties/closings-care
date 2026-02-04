

## Premium Floating Mobile Navigation Upgrade

This plan enhances the mobile navigation bar with a true floating design and elevated premium aesthetics.

---

### Changes Overview

**File to modify:** `src/components/layout/MobileNav.tsx`

---

### 1. Increased Bottom Spacing (Floating Effect)

- Change bottom positioning from `bottom-0` to `bottom-4` (16px from edge)
- Increase the safe area calculation to `pb-[calc(env(safe-area-inset-bottom,12px)+8px)]`
- Remove `mb-2` since we're using absolute positioning offset instead

This creates clear visual separation from the browser's bottom toolbar.

---

### 2. Enhanced Floating Island Design

- Reduce max-width slightly (`max-w-[380px]`) for a more compact, pill-like shape
- Add a subtle outer border ring with gradient for depth
- Increase border-radius to `rounded-[28px]` for a softer, more modern look

---

### 3. Premium Shadow & Depth Upgrade

Replace current shadow with a more dramatic, layered shadow system:
- Primary shadow layer for depth
- Emerald-tinted ambient glow underneath
- Subtle inner highlight for glass realism

---

### 4. Enhanced Glass Effect

- Increase backdrop blur to `backdrop-blur-3xl`
- Add a subtle gradient border effect
- Enhance the top highlight shimmer with animation potential

---

### 5. Refined Active State

- Add a subtle pill background behind active item
- Enhance the glow effect for the active icon
- Add micro-interaction improvements

---

### Technical Details

```text
Nav Container Changes:
  - Position: bottom-0 → bottom-4
  - Padding: Adjusted safe-area calculation
  - Width: max-w-md → max-w-[380px]

Glass Container Changes:
  - Border radius: 24px → 28px
  - Shadow: 6-layer premium shadow system
  - Border: Added gradient border effect
  - Backdrop: Enhanced blur intensity

Visual Effects:
  - Outer glow: Increased intensity
  - Top highlight: Dual-layer shimmer
  - Active states: Enhanced glow and background
```

---

### Expected Result

A floating navigation island that:
- Sits comfortably above browser toolbars
- Has a premium, Apple-inspired glass aesthetic
- Features rich shadows and depth
- Feels modern and high-end

