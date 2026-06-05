# GOAT - Landing Page

Ultra-minimal, high-fidelity landing page for GOAT — the premium iOS fitness intelligence app.

## Features

- **Obsessive Design**: Deep glassmorphism, premium animations, and pixel-perfect details
- **Interactive iPhone Mockups**: 
  - Realistic 3D tilt on hover
  - Mouse-driven studio lighting
  - Idle breathing animation
  - Device extraction modal with layout animation
  - Mobile carousel with scroll-snap
- **Magnetic CTA Button**: Attracts cursor with spring physics
- **Floating Glass Navbar**: Scroll-triggered blur enhancement
- **Premium Animations**: Carefully tuned Framer Motion springs (stiffness: 140-220, damping: 18-28)
- **Mobile-First**: Optimized for all screen sizes
- **Accessibility**: ARIA labels, keyboard focus, reduced motion support

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

## Design System

- **Background**: `#0A0B0F` (deep near-black)
- **Accent**: `#2C41FC` (vibrant electric blue)
- **Glass**: `rgba(255,255,255,0.06)` with `backdrop-blur-3xl`
- **Text Primary**: `#F1F1F3`
- **Text Muted**: `#8A8A90`
- **Typography**: Inter (or system-ui stack)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Customization

### Replace Screenshots

In `src/components/IPhoneMockup.tsx`, find the TODO comment and replace the placeholder UI with your actual app screenshots:

```tsx
{/* TODO: Replace with your actual high-resolution app screenshot */}
<img 
  src="/path/to/your-screenshot.png" 
  alt="App screenshot" 
  className="w-full h-full object-cover" 
/>
```

Recommended resolution: ~1179×2556 or 1290×2796

### Update App Store URL

In `src/components/Navbar.tsx` and `src/components/CTAButton.tsx`, update the App Store URL:

```tsx
href="https://apps.apple.com/app/your-app-id"
```

### Adjust Headline

In `src/components/Hero.tsx`, customize the headline and subheadline:

```tsx
<h1>Precision in <span className="text-accent italic">every rep.</span></h1>
<p>The intelligent edge in fitness training. Track smarter, perform better.</p>
```

### Update App Name

Replace "GOAT" throughout the codebase with your app name:
- `src/App.tsx`
- `src/components/Navbar.tsx`
- `index.html` (title and meta description)

## Performance

- Optimized for 60fps on mid-range devices
- Uses `transform` and `opacity` for animations
- Respects `prefers-reduced-motion`
- Tiny bundle size with tree-shaking

## License

© 2026 GOAT
