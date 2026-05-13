# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**พยากรณ์แห่งดวงดาว (Divination of the Stars)** — A Thai-language tarot card reading website with a mystical, cinematic design.

- **Single Page Application (SPA)**: Multiple section views (landing, category selection, card drawing, results) within one HTML file
- **No Build Process**: Pure HTML/CSS/JavaScript — no npm, no bundling, no compilation
- **Standalone**: Works offline except for card images loaded from jsDelivr CDN
- **Responsive**: Mobile-first design using Tailwind CSS (CDN) + custom CSS
- **Language**: Primary interface in Thai, secondary English decorative text
- **Encyclopedia Page**: Separate tarot guide page with card browsing and spread diagrams

## Tech Stack

### Core Technologies
- **HTML5** — Semantic markup with single-page application structure
- **CSS3** — Custom CSS for atmospheric effects (starfield, mist, moon glow) + premium card fan animations
- **Vanilla JavaScript (ES6+)** — No frameworks, pure JS for card logic and state management
- **Tailwind CSS** — Responsive utility classes (loaded via CDN script, zero configuration)

### External Resources (CDNs)
- **Google Fonts**: 
  - `Cinzel` — English decorative text (titles, English card names)
  - `Noto Serif Thai` — Thai headings and body text
  - `Sarabun` — Thai body text (lighter weight)
- **jsDelivr CDN**: Tarot card images from npm package `tarot-card-img` (Rider-Waite-Smith deck, 1909, Public Domain)
- **Tailwind CSS Play CDN**: https://cdn.tailwindcss.com

### Data
- **tarot-all.json** — Complete tarot card data (78 cards: 22 Major Arcana + 56 Minor Arcana)
  - Card names (Thai + English)
  - Image URLs (jsDelivr CDN)
  - Card meanings for 5 categories (love, study, work, money, general)
  - **Reversed meanings** (meaningsReversed) for all 78 cards
  - Keywords for reversed/upright interpretations

## Key Features

### 🌟 Cinematic Card Fan
- **Premium semi-circular spread** with 160° arc
- **78 cards** arranged in responsive radial pattern
- **Interactive hover states** — cards lift and glow on hover
- **Touch-responsive** — works on mobile devices
- **Reversed cards** — 30% chance, visual rotation + reversed meanings

### ✨ Atmospheric Effects
- **Animated starfield** — 80 twinkling stars with randomized positions
- **Floating mist** — purple gradient with drift animation
- **Glowing moon** — SVG moon with pulsing gold glow effect
- **Card animations** — entrance, selection, and reveal transitions

### 🎴 Tarot Reading System
- **5 Reading Categories**: Love (ความรัก), Study (การเรียน), Work (การทำงาน), Finance (การเงิน), General Life (ดวงชะตาภาพรวม)
- **Dynamic Spread Selection**:
  - **Past-Present-Future spread** — For future-oriented questions (detected via keywords)
  - **Seeker-Situation-Outcome spread** — Default spread for general readings
- **Question keyword detection** — Automatically selects appropriate spread based on question
- **Individual readings** per card + **summary reading** based on overall patterns
- **Reversed card meanings** — Different interpretations when cards appear reversed

### 🃏 Shuffle & Cut Experience
- **Cinematic shuffle animation** — Enhanced riffle shuffle with particle effects
- **Interactive cut deck** — Users can cut the deck to infuse their energy into the cards
- **3D card stack visuals** — Realistic card piles with layered pseudo-elements and shadows
- **Centered cut button** — Positioned at the center of the card fan (54% desktop, 62% mobile)
- **Touch-friendly** — Works on all devices with responsive positioning

### 📚 Tarot Guide Encyclopedia
- **Separate page** (`tarot-guide.html`) with educational content
- **Card browsing** — All 78 cards with images and meanings
- **Spread diagrams** — Interactive SVG diagrams with tooltips
- **Modal system** — Detailed card information view
- **Lazy loading** — Images load as needed

### 📤 Share as Image
- **Canvas-based image generation** — 1080x1080px high-quality export
- **Desktop download** — Automatic PNG download
- **Mobile native share** — Uses `navigator.share()` API
- **Beautiful layout** — Cards centered with mystical design

## File Structure

```
tarot-web/
├── index.html           # Main HTML (Tailwind CDN, section views, all UI)
├── tarot-guide.html     # Encyclopedia/education page
├── css/
│   └── style.css        # Custom CSS (effects, card fan, animations, guide styles)
├── js/
│   ├── app.js           # Card logic, state management, readings, share image
│   └── guide.js         # Guide page functionality (tabs, modal, lazy loading)
├── tarot-all.json       # Complete tarot data (78 cards with meanings + reversed)
├── CLAUDE.md            # This file — Claude Code project documentation
├── CLAUDE_zz_nutz.md    # Backup/old documentation (can be removed)
├── README.md            # User-facing project documentation
├── .gitignore           # Excludes PDFs, text files, macOS/IDE files
└── .git/                # Git repository
```

### Files NOT in Git (see .gitignore)
- `*.pdf` — Original tarot reference PDFs (copyright + large file size)
- `tarot-text.txt` — Text converted from PDF
- `index 2.html` — Backup/duplicate files
- `Reference*.png`, `Screenshot*.png` — Reference images
- `prompt.md` — Project prompts/notes
- `.DS_Store`, `.vscode/`, `.idea/` — macOS and IDE files

## Deployment

### GitHub Pages
- **URL**: https://thanatvij.github.io/tarot/
- **Repo**: https://github.com/Thanatvij/tarot.git
- **Branch**: `main`
- **Source**: Root directory (`/`)
- **No CI/CD** — GitHub Pages directly serves static files

### Deploy Commands
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add responsive mobile improvements"

# Push to main branch (auto-deploys to GitHub Pages)
git push origin main
```

Changes go live within **10-30 seconds** on GitHub Pages.

## Local Development

### Quick Start
```bash
# Option 1: Python HTTP Server (recommended)
python3 -m http.server 8000
# Open http://localhost:8000

# Option 2: Node.js serve
npx serve .
# Open provided URL

# Option 3: Open directly (works, but some browsers restrict local file access)
open index.html  # macOS
# Double-click index.html in file explorer # Windows
```

### Development Workflow
1. Edit files directly (`index.html`, `css/style.css`, `js/app.js`)
2. Refresh browser to see changes
3. No build step required — instant feedback
4. Test responsive behavior using browser DevTools device emulation

## Card Fan Architecture

The **semi-circular card fan** is the signature visual feature of this application.

### CSS Structure
```
.fan-container       /* Outer container with calculated height */
  └── .fan-wrap      /* Center pivot point (absolute, centered horizontally) */
      └── .tarot-card[78] /* Individual cards positioned via transform */
          └── .card-inner
              └── .card-face
                  └── .card-back (SVG pattern)
```

### Transform Formula
Each card is positioned using:
```javascript
transform: translate(x px, -y px) rotate(angle deg)
```

Where:
- `x = sin(angle) × radius`
- `y = cos(angle) × radius`
- `angle` ranges from -70° (leftmost) to +70° (rightmost)
- Cards on the right have higher z-index (stacked on top)

### Responsive Radius Calculation
```javascript
const vw = window.innerWidth;
const radius = vw > 1024 ? 220 : vw > 768 ? 160 : vw > 480 ? 115 : 95;
```

| Breakpoint | Radius | Container Height | Fan Bottom Position |
|------------|--------|------------------|---------------------|
| Desktop (>1024px) | 220px | 564px | 100px |
| Tablet (768-1024px) | 160px | 444px | 60px |
| Mobile (480-768px) | 115px | 379px | 40px |
| Small (≤480px) | 95px | 349px | 30px |

**⚠️ CRITICAL**: When modifying responsive behavior:
- **Never** change the card fan transform logic in `js/app.js` buildFan()
- **Preserve** all custom CSS for `.fan-container`, `.fan-wrap`, `.tarot-card`
- **Test** card fan on all 4 breakpoint sizes
- **Keep** the 160° arc spread (140° angle spread variable)

## Custom CSS vs Tailwind

### Use Custom CSS (css/style.css) for:
- **Card fan transforms** — All `.tarot-card`, `.fan-container`, `.fan-wrap` styles
- **Animation keyframes** — `twinkle`, `drift`, `moon-glow`, `fadeIn`, `cardReveal`, `blockReveal`
- **Glow effects** — Box shadows, gradients, drop-shadow filters
- **Custom components** — `.card-back` SVG pattern, `.divider-ornate`, category card styling
- **Interactive states** — Card hover lift, category selection, button hover effects
- **Guide page styles** — All tarot-guide.html specific styles
- **Reversed card styles** — `.reversed-badge`, `.card-reversed`, `.reading-reversed`

### Use Tailwind for:
- **Responsive spacing** — `px-4 md:px-8`, `py-12 lg:py-20`
- **Responsive text** — `text-sm md:text-base`, `text-xl lg:text-3xl`
- **Layout utilities** — `flex`, `grid`, `w-full sm:w-auto`, `hidden md:block`
- **Button sizing** — `w-full sm:w-auto px-8 md:px-16`
- **Container padding** — Consistent horizontal padding across sections

## JavaScript Architecture

### Global State
```javascript
selectedCategory    // Currently selected category (love/study/work/money/general)
userQuestion        // Optional user question text
drawnCards          // Array of selected card objects
currentDrawIndex    // Which card position (0, 1, 2) user is selecting
currentSpreadType   // 'default' or 'future' - determines which spread to use
TAROT_DATA          // Loaded from tarot-all.json on page load
```

### Key Functions

#### Navigation & State
- `showSection(id)` — Switch between sections (landing → category → draw → result)
- `goToCategory()`, `goToDraw()`, `resetAll()` — Navigation helpers
- `getCurrentPositions()` — Returns appropriate position array based on spread type

#### Spread Detection
- `isFutureQuestion(question)` — Detects if question is future-oriented using keywords
- `FUTURE_KEYWORDS` — Array of Thai keywords for future detection
- `POSITIONS` — Default spread positions (Seeker-Situation-Outcome)
- `POSITIONS_FUTURE` — Future spread positions (Past-Present-Future)

#### Card Fan
- `buildFan()` — Creates 78-card fan with transforms, shuffling, and reversed state (30%)
- `selectCard(id)` — Handles card selection, advances to next position
- `updateDrawStatus()` — Updates draw position indicator

#### Readings
- `showResult()` — Generates and displays all readings (uses meaningsReversed if card.isReversed)
- `generateCardReading(card, position, category)` — Individual card interpretation
- `generateSummaryReading(cards, category)` — Overall pattern analysis

#### Share Image
- `generateShareImage()` — Creates 1080x1080 canvas with mystical design
- `loadImage(url)` — Loads image with CORS for canvas
- `shareResult()` — Handles desktop download or mobile native share
- `downloadImage(blob, fileName)` — Helper for desktop downloads

#### Initialization
- `createStarfield()` — Generates 80 random stars with animations
- `loadTarotData()` — Fetches tarot-all.json from CDN

### Event Listeners (attached in DOMContentLoaded)
- Category cards — Click to select category
- Start Draw button — Enabled when category selected
- Tarot cards — Click to select from fan
- Share button — Click to generate and download/share image

## Color Palette

All colors defined as CSS custom properties in `:root`:

```css
--bg-deep: #0a0014        /* Deep purple-black background */
--bg-mid: #1a0033         /* Mid-purple gradient */
--bg-light: #2d0052       /* Lighter purple for cards/containers */
--gold: #d4af37           /* Primary gold color */
--gold-bright: #ffd700    /* Bright gold for highlights */
--gold-glow: rgba(255, 215, 0, 0.6)  /* Glow effect */
--cream: #f5e6d3          /* Off-white text color */
--purple-mist: rgba(120, 60, 200, 0.3)  /* Atmospheric mist */
```

## Making Changes

### Content & Text Changes
- **HTML structure**: Edit `index.html` directly
- **Thai text**: All user-facing text is in HTML
- **English decorative text**: Titles, card names in English

### Styling Changes
- **Effects/atmosphere**: Edit `css/style.css` (custom CSS)
- **Responsive layout**: Add Tailwind classes to HTML elements
- **New animations**: Add keyframes to `css/style.css`

### Functionality Changes
- **Card logic**: Edit `js/app.js`
- **Guide page**: Edit `js/guide.js`
- **New categories**: Add to `CATEGORY_LABEL` in app.js + update HTML + tarot-all.json
- **Card meanings**: Edit `tarot-all.json` (or regenerate from source)

### Adding New Features
- ✅ Keep standalone approach — no npm packages
- ✅ Use CDN links for any new libraries
- ✅ Maintain mobile-first responsive design
- ✅ Preserve mystical, cinematic aesthetic
- ⚠️ Test on multiple devices/browsers

## Testing Checklist

Before committing changes:

### Functionality
- [ ] All 5 categories selectable
- [ ] Card question input works (optional)
- [ ] Question type detection works (future vs default spread)
- [ ] Card fan renders correctly (78 cards)
- [ ] Card selection works (3 cards max)
- [ ] Reversed cards appear (~30% chance) with correct meanings
- [ ] Readings use correct meanings (upright vs reversed)
- [ ] Share image generation works (desktop download + mobile share)
- [ ] Guide page loads and functions correctly
- [ ] Reset button returns to landing

### Responsive
- [ ] Test on mobile viewport (≤480px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (>1024px)
- [ ] Card fan works on all sizes
- [ ] Buttons are tappable on mobile
- [ ] Guide page responsive on all sizes

### Animations
- [ ] Starfield twinkles
- [ ] Mist floats smoothly
- [ ] Moon glows
- [ ] Card hover effects work
- [ ] Page transitions fade in
- [ ] Guide page scroll reveal works

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (desktop)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Design Principles

1. **Preserve the aesthetic** — Dark purple + gold mystical theme, not modern/minimal
2. **Keep the card fan beautiful** — The semi-circular fan is the signature feature, never compromise it
3. **Mobile-first responsive** — Must work perfectly on phones, scales up to desktop
4. **No build step** — Everything must work by opening index.html
5. **Performance** — Minimal external dependencies, fast loading even on slow connections
6. **Thai language priority** — UI is primarily Thai, English is decorative only

## Thai Language Support

- **Primary language**: Thai (ภาษาไทย)
- **Font stack**: Noto Serif Thai (headings), Sarabun (body text)
- **Reading flow**: Thai text reads left-to-right, same as English
- **Mobile readability**: Ensure text is large enough on mobile (use Tailwind responsive text classes)

## Common Tasks

### Add a new category
1. Add to `CATEGORY_LABEL` in `js/app.js`
2. Add category card HTML in `index.html` section-category
3. Add category-specific meanings to all cards in `tarot-all.json`

### Change card fan appearance
- Edit `.tarot-card` styles in `css/style.css`
- **Never** modify transform formula in `buildFan()`
- Test on all breakpoints

### Add new animation
1. Add `@keyframes` to `css/style.css`
2. Apply with `animation: name duration ease-in-out infinite`
3. Test performance (especially on mobile)

### Fix responsive bug
1. Check if Tailwind class is missing
2. Check custom CSS media queries in `css/style.css`
3. Test in browser DevTools device emulator

## Troubleshooting

### Cards not rendering
- Check browser console for errors
- Verify `tarot-all.json` is loading (check Network tab)
- Check `buildFan()` is being called

### Animations laggy on mobile
- Reduce number of animated elements
- Simplify box-shadows and gradients
- Test on low-end devices

### Tailwind classes not working
- Verify Tailwind CDN is loaded (check Network tab)
- Check for typos in class names
- Ensure custom CSS isn't overriding with higher specificity

### Card fan broken on mobile
- Check responsive radius calculation in `buildFan()`
- Verify container height matches CSS media queries
- Test on actual device, not just emulator

### Share image not working
- Check browser console for CORS errors
- Verify images load with `crossOrigin = 'anonymous'`
- Test on both desktop (download) and mobile (share API)

### Guide page not loading
- Check `tarot-all.json` is accessible
- Verify `guide.js` loads without errors
- Check for JavaScript errors in console

## Reversed Card System

### How it works
1. **Random assignment**: Each card has 30% chance to be reversed when shuffled
2. **Visual indication**: 
   - Card rotated 180° (`card-inner` transform)
   - "(กลับหัว)" text indicator in results
   - Red styling in reading blocks
3. **Meaning selection**: `showResult()` uses `meaningsReversed` when `card.isReversed === true`

### Meaning principles
- **Major Arcana**: Internal blocks, delays, shadow side of upright meanings
- **Wands**: Delays, lack of direction, scattered energy
- **Cups**: Emotional imbalance, withdrawal, disappointment
- **Swords**: Conflicts, mental struggles, bad decisions
- **Pentacles**: Financial issues, lack of security, greed

## Spread Type Detection

### Future keywords (Thai)
จะ, ไหม, มั้ย, อนาคต, หน้า, ต่อไป, รุ่ง, เป้า, ทัน, ได้, เป็นยังไง, ผล, รอด, สำเร็จ, ชนะ, ไปต่อ, แต่ง, รับ

### Spread types
- **POSITIONS_FUTURE**: Past-Present-Future (อดีต-ปัจจุบัน-อนาคต)
- **POSITIONS**: Seeker-Situation-Outcome (เจ้าชะตา-สถานการณ์-บทสรุป)

## Guide Page Architecture

### Key files
- `tarot-guide.html` — Main guide page HTML
- `js/guide.js` — Guide page JavaScript
- `css/style.css` — Guide page styles (after main styles)

### Key features
- **Sticky navigation** — Fixed header with smooth scroll
- **Tab system** — Major/Minor Arcana switching
- **Suit tabs** — Wands/Cups/Swords/Pentacles
- **Lazy loading** — Images load when visible (IntersectionObserver)
- **Modal system** — Click card for detailed view
- **Spread diagrams** — Interactive SVG with position tooltips
- **Scroll reveal** — Sections fade in as you scroll
