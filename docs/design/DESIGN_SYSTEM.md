# Design System — AM&AA TMR

## Document Information
- **Created:** 2025-01-27
- **Last Updated:** 2025-10-12
- **Version:** 1.2
- **Owner:** Jonathan

## 1) Design Philosophy

### Core Principles
- **"Never looks like WordPress"** - Users experience a premium, product-grade interface
- **Innovative layout** - Asymmetric grids, scrollytelling, micro-interactions
- **Performance-first** - CLS < 0.05, LCP < 2.5s, TTI < 2.5s on 4G
- **Accessibility** - WCAG 2.1 AA compliance, focus management, screen reader support

### Design Goals
- Create a sophisticated, modern interface that feels like a premium SaaS product
- Implement innovative layouts that differentiate from typical WordPress sites
- Ensure excellent performance and accessibility
- Maintain consistency across all touchpoints

## 2) Architecture: WordPress App Shell

### Technical Approach
- **Single deployment** on WP Engine (simpler ops)
- **React islands** for interactive components (`#survey-root`, `#insights-root`, `#app-root`)
- **Custom PHP templates** (marketing.php, app.php) with minimal Gutenberg chrome
- **Design system** with CSS custom properties and component library

### Template Structure (Updated 2025-10-08)
```
wp-content/themes/amaa-tmr/
├── page-marketing.php    # Marketing Shell template (theme root)
├── page-app.php         # App Shell template (theme root)
├── templates/           # Block template parts (header.html, footer.html)
├── assets/
│   ├── css/
│   │   ├── design-tokens.css  # ✅ Implemented - CSS custom properties
│   │   ├── marketing.css      # ✅ Implemented - Marketing layout styles
│   │   ├── app.css           # ✅ Implemented - App shell styles
│   │   └── components.css    # ✅ Implemented - Component library
│   └── js/
│       └── app.js            # ✅ Implemented - Main application logic
```

## 3) Design Tokens

### Color System
```css
:root {
  /* Brand Colors */
  --color-brand-50: #f0f9ff;
  --color-brand-100: #e0f2fe;
  --color-brand-200: #bae6fd;
  --color-brand-300: #7dd3fc;
  --color-brand-400: #38bdf8;
  --color-brand-500: #0ea5e9;
  --color-brand-600: #0B3C5D;  /* Primary brand */
  --color-brand-700: #0369a1;
  --color-brand-800: #075985;
  --color-brand-900: #1e3a8a;

  /* Accent Colors */
  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;
  --color-accent-600: #F29F05;  /* Primary accent */
  --color-accent-700: #d97706;
  --color-accent-800: #b45309;
  --color-accent-900: #92400e;

  /* Neutral Colors */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;

  /* Semantic Colors */
  --color-success-600: #059669;
  --color-warning-600: #d97706;
  --color-error-600: #dc2626;
  --color-info-600: #2563eb;
}
```

### Typography
```css
:root {
  /* Font Families */
  --font-heading: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --font-body: 'Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Spacing System
```css
:root {
  /* 4px base grid system */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
  --space-40: 10rem;    /* 160px */
  --space-48: 12rem;    /* 192px */
  --space-56: 14rem;    /* 224px */
  --space-64: 16rem;    /* 256px */
}
```

### Shadows & Effects
```css
:root {
  /* Box Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

## 4) Component Library

### Core Components

#### Button
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-tight);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px; /* Accessibility */
}

.btn-primary {
  background-color: var(--color-brand-600);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-brand-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-900);
  border: 1px solid var(--color-neutral-300);
}

.btn-secondary:hover {
  background-color: var(--color-neutral-200);
  border-color: var(--color-neutral-400);
}
```

#### Card
```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: var(--space-4);
}

.card-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  margin: 0;
}

.card-body {
  color: var(--color-neutral-700);
  line-height: var(--leading-relaxed);
}
```

#### Input
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  transition: border-color var(--transition-fast);
  background: white;
}

.input:focus {
  outline: none;
  border-color: var(--color-brand-600);
  box-shadow: 0 0 0 3px rgba(11, 60, 93, 0.1);
}

.input::placeholder {
  color: var(--color-neutral-500);
}
```

#### Metric Card
```css
.metric-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
  text-align: center;
  transition: all var(--transition-base);
}

.metric-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.metric-value {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-brand-600);
  margin: 0;
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  margin-top: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-delta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.metric-delta.positive {
  background-color: rgba(5, 150, 105, 0.1);
  color: var(--color-success-600);
}

.metric-delta.negative {
  background-color: rgba(220, 38, 38, 0.1);
  color: var(--color-error-600);
}
```

### Layout Components

#### Container
```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.container-narrow {
  max-width: 800px;
}

.container-wide {
  max-width: 1400px;
}
```

#### Grid
```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

#### Section
```css
.section {
  padding: var(--space-24) 0;
}

.section-sm {
  padding: var(--space-16) 0;
}

.section-lg {
  padding: var(--space-32) 0;
}
```

## 5) Page Layouts

### Homepage Layout
```
┌─────────────────────────────────────┐
│ Header (clean, minimal)             │
├─────────────────────────────────────┤
│ Hero Section                        │
│ - Asymmetric grid                   │
│ - Staggered content blocks          │
│ - CTA buttons                       │
├─────────────────────────────────────┤
│ Scrollytelling Insights             │
│ - Pinned headline left              │
│ - Data scrubs right                 │
│ - Micro-animations                  │
├─────────────────────────────────────┤
│ Credibility Band                    │
│ - Testimonials                      │
│ - Trust indicators                  │
├─────────────────────────────────────┤
│ CTA Section                         │
│ - Clear value proposition           │
│ - Primary action                    │
├─────────────────────────────────────┤
│ Footer (minimal)                    │
└─────────────────────────────────────┘
```

### Survey Layout
```
┌─────────────────────────────────────┐
│ Header (with progress indicator)    │
├─────────────────────────────────────┤
│ Survey Container                    │
│ ┌─────────────────────────────────┐ │
│ │ Progress Bar                    │ │
│ ├─────────────────────────────────┤ │
│ │ Question Card                   │ │
│ │ - Clear question text           │ │
│ │ - Input/select options          │ │
│ │ - Help text                     │ │
│ ├─────────────────────────────────┤ │
│ │ Navigation                      │ │
│ │ - Back button                   │ │
│ │ - Next/Submit button            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Member Portal Layout
```
┌─────────────────────────────────────┐
│ Header (with user menu)             │
├─────────────────────────────────────┤
│ Dashboard Grid                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Reports │ │ Survey  │ │ Quick   │ │
│ │ Card    │ │ Progress│ │ Links   │ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ Insights Section                    │
│ - Interactive charts                │
│ - Hover previews                    │
│ - Data-driven cards                 │
└─────────────────────────────────────┘
```

## 6) Interaction Patterns

### Micro-Interactions
- **Button hover**: Elevation + 2px spread, 150ms
- **Card reveal**: Opacity 0 → 1 + translateY(8px) on in-view
- **Link underline**: Grows left→right on hover
- **Form focus**: Border color change + subtle glow
- **Loading states**: Skeleton screens with shimmer effect

### Page Transitions
- **Route changes**: Fade/slide transitions (250ms)
- **Modal open/close**: Scale + fade (200ms)
- **Tab switching**: Slide animation (150ms)
- **Accordion expand**: Height animation (300ms)

### Scroll Animations
- **In-view reveals**: Elements animate in as they enter viewport
- **Parallax effects**: Subtle background movement on scroll
- **Sticky elements**: Headers and navigation stick appropriately
- **Progress indicators**: Show scroll progress through content

## 7) Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus management**: Visible focus indicators, logical tab order
- **Screen readers**: Proper ARIA labels, semantic HTML
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Motion preferences**: Respect `prefers-reduced-motion`

### Implementation Guidelines
```css
/* Focus styles */
.focusable:focus {
  outline: 2px solid var(--color-brand-600);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid var(--color-neutral-900);
  }
}
```

## 8) Performance Standards

### Core Web Vitals Targets
- **CLS (Cumulative Layout Shift)**: < 0.05
- **LCP (Largest Contentful Paint)**: < 2.5s on 4G
- **TTI (Time to Interactive)**: < 2.5s on 4G
- **FID (First Input Delay)**: < 100ms

### Optimization Strategies
- **Critical CSS**: Inline critical styles, defer non-critical
- **Image optimization**: WebP format, lazy loading, responsive images
- **Font loading**: Preload critical fonts, use font-display: swap
- **JavaScript**: Code splitting, lazy loading, minimal bundle size
- **Caching**: Aggressive caching for static assets

## 9) AI-Powered Design Tools

### Recommended Tools
1. **Uizard**: Convert hand-drawn sketches to digital wireframes
2. **Visily**: Screenshot-to-wireframe conversion + text prompts
3. **Khroma**: AI color palette generation
4. **Figma AI**: Auto-layout, component generation
5. **Cursor AI**: Code generation from design descriptions

### Workflow Integration
1. **Sketch → Uizard**: Convert initial ideas to wireframes
2. **Khroma**: Generate color palettes based on brand requirements
3. **Figma AI**: Create high-fidelity designs with auto-layout
4. **Cursor AI**: Generate CSS/React code from design specifications
5. **Manual refinement**: Polish and optimize based on testing

## 10) Implementation Checklist (Updated 2025-10-12)

### Design System Setup
- [x] Create CSS custom properties file
- [x] Implement core component styles
- [x] Set up typography scale
- [x] Configure color system
- [x] Establish spacing system

### WordPress Integration
- [x] Strip default WordPress styles
- [x] Create custom PHP templates (page-marketing.php, page-app.php)
- [x] Set up React island mount points
- [x] Configure clean URLs and routing
- [x] Implement design tokens

### Component Development
- [x] Build core components (Button, Card, Input)
- [x] Create layout components (Grid, Container, Section)
- [x] Implement interactive components (Dashboard working)
- [x] **Header/Footer System**: Unified navigation with survey CTA and user state
- [x] **Home Page React Island**: Hero, insights, credibility, CTA sections
- [x] **Design System Integration**: CSS properly applied to all pages
- [ ] Add micro-interactions and animations
- [ ] Test accessibility compliance

### Performance Optimization
- [ ] Implement critical CSS
- [ ] Optimize images and fonts
- [ ] Set up code splitting
- [ ] Configure caching
- [ ] Monitor Core Web Vitals

### Testing & Validation
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] User experience testing
- [ ] Design system documentation

---

**Next Steps:**
1. Create wireframes using AI tools (Uizard, Visily)
2. Generate color palettes with Khroma
3. Build high-fidelity designs in Figma
4. Implement design system in WordPress theme
5. Develop React components with design system integration
