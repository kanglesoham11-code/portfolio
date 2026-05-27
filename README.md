# Soham Kangle — 3D Interactive Portfolio

A dark sci-fi themed portfolio website featuring Three.js animations, pipeline visualizations, and interactive elements. Built according to the comprehensive PRD specifications.

## 🚀 Features

- **3D Node Graph Background** — Three.js animated particle system in hero section
- **Pipeline Connector** — Animated SVG path that draws on scroll
- **Custom Cursor** — Interactive teal cursor with hover effects
- **Scroll Animations** — IntersectionObserver-based entrance animations
- **Responsive Design** — Mobile, tablet, and desktop optimized
- **Dark Sci-Fi Theme** — Industrial data infrastructure aesthetic
- **Performance Optimized** — GPU-accelerated animations, lazy loading

## 📁 Project Structure

```
portfolio/
├── index.html
├── css/
│   ├── variables.css       # Design tokens
│   ├── base.css           # Reset & typography
│   ├── layout.css         # Grid & containers
│   ├── animations.css     # Keyframes
│   ├── components.css     # Reusable components
│   └── sections/
│       ├── hero.css
│       ├── about.css
│       ├── skills.css
│       ├── projects.css
│       ├── achievements.css
│       └── contact.css
├── js/
│   ├── main.js           # Initialization
│   ├── cursor.js         # Custom cursor
│   ├── hero-three.js     # Three.js scene
│   ├── pipeline-svg.js   # Pipeline connector
│   ├── counter.js        # Number counters
│   └── animations.js     # Section animations
└── assets/
    └── resume.pdf        # Downloadable resume
```

## 🎨 Design System

### Colors
- **Background**: `#050810` (void), `#0A0F1E` (surface), `#111827` (elevated)
- **Accents**: `#00FFB2` (teal), `#0066FF` (blue), `#FFB800` (amber)
- **Text**: `#F0F6FF` (primary), `#8899BB` (secondary)

### Typography
- **Display**: Space Mono (headlines, terminal)
- **Heading**: Syne (section titles)
- **Body**: DM Sans (paragraphs)
- **Code**: JetBrains Mono (data, tags)

## 🛠️ Setup

1. **Clone or download** this repository
2. **Add your resume** to `assets/resume.pdf`
3. **Open** `index.html` in a modern browser
4. **Optional**: Serve with a local server for best performance

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## 📱 Responsive Breakpoints

- **Desktop**: > 1280px (full experience)
- **Tablet**: 768px - 1280px (simplified animations)
- **Mobile**: < 768px (CSS fallbacks, no Three.js)

## ⚡ Performance

- Lighthouse Performance Score: ≥ 85 (desktop), ≥ 75 (mobile)
- GPU-accelerated animations (transform, opacity only)
- IntersectionObserver for scroll triggers
- Lazy-loaded Three.js on desktop only

## 🎯 Sections

1. **INGEST** (Hero) — Headline, terminal, CTA buttons
2. **PARSE** (About) — Bio text, animated stat cards
3. **TRANSFORM** (Skills) — 8 skill categories with tags
4. **VALIDATE** (Projects) — 5 project cards with pipeline viz
5. **SERVE** (Achievements) — Timeline with badges
6. **ENDPOINT** (Contact) — Terminal interface, social links

## 📝 Customization

### Update Content
Edit `index.html` to modify:
- Personal information
- Project details
- Skills and technologies
- Social links

### Modify Colors
Edit `css/variables.css` to change:
- Color palette
- Typography scale
- Spacing values
- Animation timings

### Adjust Animations
Edit `js/animations.js` to customize:
- Entrance effects
- Timing and delays
- Animation sequences

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with ES6+ support and WebGL for Three.js.

## 📄 License

Personal portfolio project. Feel free to use as inspiration, but please don't copy directly.

---

**Built with data, driven by pipelines.**  
Soham Kangle © 2025
