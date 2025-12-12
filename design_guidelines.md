# KinoTracker Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Netflix, IMDb, and Letterboxd for movie browsing patterns combined with clean utility-focused design for list management.

**Core Principle**: Poster-first visual browsing with efficient list organization in a cinematic dark theme.

---

## Typography
- **Primary Font**: Inter or DM Sans via Google Fonts
- **Headings**: 
  - App title/logo: 2xl-3xl, semibold
  - Section headers: xl, semibold
  - Movie titles: base-lg, medium
- **Body Text**: sm-base, normal weight
- **Metadata** (year, rating): xs-sm, medium weight with reduced opacity

---

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, and 12 consistently
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Card spacing: p-3 to p-4
- Margins: m-4, m-6, m-8

**Grid System**:
- Movie posters: Grid layout responsive (1 col mobile → 3-4 cols tablet → 5-6 cols desktop)
- Use `grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6` pattern
- Maintain 2:3 aspect ratio for poster cards

---

## Core Components

### Navigation Bar
- Sticky top navigation with app branding (left)
- Search bar (center, expandable on mobile)
- User menu with avatar (right)
- Height: h-16
- Backdrop blur effect for depth

### Search Interface
- Prominent search bar with icon
- Real-time search results in dropdown/overlay
- Movie posters in search results (small thumbnails)
- Quick add-to-list action on search results

### Movie Cards
**Poster-Centric Design**:
- 2:3 aspect ratio container
- Movie poster image (cover fit)
- Hover overlay revealing: title, year, rating, quick action buttons
- Rating badge (top-right corner with star icon)
- Smooth transition on hover (transform scale)

**Card Actions** (on hover):
- "Add to Watched" button
- "Add to Want to Watch" button
- "View Details" (optional, for future expansion)

### List Views
**Two Main Lists**: "Watched" and "Want to Watch"

**List Headers**:
- List title with count badge (e.g., "Watched (24)")
- Filter/sort controls (by date added, rating, title)
- Toggle between grid/compact view

**Empty States**:
- Illustration or icon
- Encouraging message
- Quick search CTA

### Authentication
**Login/Register Modal**:
- Centered modal overlay
- Email/password form
- "Continue with Google" button (prominent, with Google branding)
- Toggle between login/register
- Clean, minimal form design

---

## Dashboard Layout
**Structure**:
1. **Hero/Header Section**: Welcome message, quick stats (total movies watched, etc.)
2. **Search Bar**: Prominent placement below header
3. **Tabs/Sections**: Toggle between "Watched" and "Want to Watch" lists
4. **Movie Grid**: Main content area with poster cards

**Viewport Usage**: Natural content flow, no forced 100vh sections

---

## Images
**Movie Posters**: Core visual element fetched from TMDB API
- Display at highest available quality
- Lazy loading for performance
- Placeholder gradient while loading

**Hero Section**: Optional banner-style header with featured movie backdrop (blurred) and app branding
- If implemented: Backdrop image with gradient overlay
- Text/buttons with blurred background backdrop for readability
- Height: 40-50vh

**Empty State Icons**: Simple iconography from Heroicons for empty lists

---

## Interactions & Micro-animations
**Minimal Motion**:
- Card hover: Subtle scale (1.02-1.05) and overlay fade-in
- Button clicks: Quick scale feedback
- List transitions: Smooth opacity changes
- NO scroll-triggered animations
- NO complex page transitions

---

## Icon Library
**Heroicons** (via CDN) for:
- Search icon
- Star (rating)
- Check mark (watched)
- Bookmark (want to watch)
- User profile
- Menu/settings

---

## Responsive Behavior
**Mobile (< 768px)**:
- 2-column poster grid
- Hamburger menu for navigation
- Search bar full-width
- Compact card layout with essential info visible

**Tablet (768px - 1024px)**:
- 3-4 column poster grid
- Expanded navigation
- Side-by-side list filtering

**Desktop (> 1024px)**:
- 5-6 column poster grid
- Full navigation with search inline
- Optimal poster viewing experience

---

## Accessibility
- Focus states on all interactive elements
- Keyboard navigation for movie cards
- Alt text for all poster images (movie title + year)
- Sufficient contrast ratios (especially important in dark theme)
- ARIA labels for icon-only buttons

---

## Key Design Distinctions
- **Poster-First**: Images dominate the experience
- **Quick Actions**: Minimal clicks to manage lists
- **Cinematic Feel**: Dark theme with high-quality imagery creates immersive browsing
- **Information Density**: Balance between visual appeal and metadata visibility
- **Efficient Organization**: Clear distinction between list states