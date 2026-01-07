# Design Guidelines - Branch Cleanup Tool

**Version:** 1.0
**Last Updated:** 2026-01-07
**Design System:** shadcn-vue + Tailwind CSS

## Design Philosophy

Minimalist, professional developer tool with clean data presentation and intuitive interactions. Focus on clarity, performance, and accessibility.

---

## Color Palette

### Primary Colors
- **Primary**: `#2563EB` (Blue 600) - Trust, reliability, technical
- **Secondary**: `#3B82F6` (Blue 500) - Supporting actions
- **Success**: `#10B981` (Green 500) - Positive states, merged branches
- **Destructive**: `hsl(var(--destructive))` - Delete actions, warnings

### Background & Surface
- **Background**: `#F8FAFC` (Slate 50) - Light mode
- **Card**: `hsl(var(--card))` - Surface containers
- **Muted**: `hsl(var(--muted))` - Secondary backgrounds

### Text
- **Foreground**: `#1E293B` (Slate 800) - Primary text
- **Muted Foreground**: `#64748B` (Slate 500) - Secondary text
- **Border**: `#E2E8F0` (Slate 200) - Subtle dividers

---

## Typography

### Font Families
```css
font-heading: 'Poppins', sans-serif;  /* Headings, titles */
font-body: 'Open Sans', sans-serif;   /* Body text, UI */
font-mono: monospace;                  /* Code, commit hashes */
```

### Scale
- **Display**: `text-4xl` (36px) - Page title
- **H1**: `text-3xl` (30px) - Section headers
- **H2**: `text-2xl` (24px) - Card titles
- **H3**: `text-xl` (20px) - Subsections
- **Body**: `text-base` (16px) - Default
- **Small**: `text-sm` (14px) - Labels, metadata
- **Tiny**: `text-xs` (12px) - Captions, hints

### Weights
- **Bold**: `font-bold` (700) - Headings, emphasis
- **Semibold**: `font-semibold` (600) - Subheadings
- **Medium**: `font-medium` (500) - Labels
- **Regular**: `font-normal` (400) - Body text

---

## Spacing System

### Component Spacing
- **Gap Small**: `gap-2` (8px) - Icon + text
- **Gap Medium**: `gap-4` (16px) - Form fields
- **Gap Large**: `gap-6` (24px) - Card sections
- **Gap XL**: `gap-8` (32px) - Page sections

### Padding
- **Tight**: `p-4` (16px) - Small cards
- **Standard**: `p-6` (24px) - Default cards
- **Comfortable**: `p-8` (32px) - Page containers

### Margins
- **Stack Small**: `space-y-2` (8px) - Input groups
- **Stack Medium**: `space-y-4` (16px) - Form sections
- **Stack Large**: `space-y-6` (24px) - Card content
- **Stack XL**: `space-y-8` (32px) - Page layout

---

## Components

### Cards
```vue
<Card>
  <CardHeader>
    <CardTitle class="flex items-center gap-2 text-2xl font-heading">
      <Icon class="w-5 h-5 text-primary" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent class="space-y-6">
    <!-- Content -->
  </CardContent>
</Card>
```

**Rules:**
- Use `space-y-6` for main content sections
- Icons 20x20 (w-5 h-5) for titles
- Text-2xl for card titles with font-heading
- Primary color for title icons

### Buttons
```vue
<!-- Primary Action -->
<Button size="lg" class="gap-2 transition-all duration-200 hover:shadow-md">
  <Icon class="w-5 h-5" />
  Action Text
</Button>

<!-- Secondary Action -->
<Button variant="secondary" class="transition-colors duration-200">
  Secondary
</Button>

<!-- Destructive Action -->
<Button variant="destructive" class="gap-2 transition-all duration-200">
  <Trash2 class="w-5 h-5" />
  Delete
</Button>
```

**Rules:**
- Always include icons for primary actions
- 200ms transitions for all hover states
- Gap-2 between icon and text
- Loading states use `<Loader2>` with animate-spin

### Inputs
```vue
<div class="space-y-2">
  <Label for="field" class="text-sm font-medium">Field Label</Label>
  <Input
    id="field"
    v-model="value"
    placeholder="Placeholder text"
    class="transition-colors duration-200"
  />
</div>
```

**Rules:**
- Always pair with Label using matching IDs
- Space-y-2 between label and input
- Include validation icons when applicable
- 200ms transition on focus

### Tables
```vue
<Table>
  <TableHeader>
    <TableRow class="hover:bg-transparent">
      <TableHead class="font-semibold">Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow class="cursor-pointer transition-colors duration-200 hover:bg-muted/50">
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Rules:**
- Cursor-pointer on clickable rows
- Hover:bg-muted/50 for interactive rows
- 200ms transition-colors
- Font-semibold for headers
- No hover on header row

### Badges
```vue
<!-- Default -->
<Badge variant="default">Primary</Badge>

<!-- Secondary (for counts, metadata) -->
<Badge variant="secondary" class="font-mono">main</Badge>
```

**Rules:**
- Use variant="secondary" for metadata (branch names, counts)
- Font-mono for technical data (branch names, commit hashes)

### Empty States
```vue
<div class="flex flex-col items-center gap-3 py-16">
  <div class="rounded-full bg-muted p-4">
    <Icon class="w-8 h-8 text-muted-foreground" />
  </div>
  <p class="text-muted-foreground font-medium">Primary message</p>
  <p class="text-sm text-muted-foreground">Supporting text</p>
</div>
```

**Rules:**
- Icon wrapped in rounded-full bg-muted container
- Primary message in muted-foreground font-medium
- Supporting text text-sm

---

## Icons

### Lucide Vue Icons
```typescript
import {
  GitBranch,       // Branches, git operations
  GitMerge,        // Merged branches
  GitPullRequest,  // Unmerged branches
  FolderGit2,      // Repository
  Search,          // Analyze action
  Filter,          // Filters
  Trash2,          // Delete action
  CheckCircle,     // Success, validation
  AlertCircle,     // Warning, info
  AlertTriangle,   // Warning, destructive
  XCircle,         // Error
  Loader2,         // Loading states
  ChevronsUpDown,  // Combobox
  Check,           // Selected state
} from 'lucide-vue-next';
```

### Icon Sizing
- **Small**: `w-4 h-4` (16px) - Inline, badges
- **Medium**: `w-5 h-5` (20px) - Buttons, titles
- **Large**: `w-6 h-6` (24px) - Page headers
- **XL**: `w-8 h-8` (32px) - Empty states
- **XXL**: `w-12 h-12` (48px) - Hero sections

**Rules:**
- Never use emoji as icons
- Use Lucide icons exclusively
- Match icon color to context (primary, muted-foreground, success, destructive)

---

## Animations & Transitions

### Durations
- **Fast**: `duration-150` (150ms) - Immediate feedback
- **Standard**: `duration-200` (200ms) - Default transitions
- **Medium**: `duration-300` (300ms) - Complex animations
- **Never**: >500ms - Too slow for UI

### Easing
- **Default**: `ease-out` - Entering elements
- **Exit**: `ease-in` - Exiting elements
- **Smooth**: `ease-in-out` - Continuous motion

### Common Patterns
```css
/* Button hover */
transition-all duration-200 hover:shadow-md

/* Interactive elements */
transition-colors duration-200 hover:bg-muted/50

/* Loading spinner */
animate-spin

/* Focus states */
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
```

### Accessibility
Always respect reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Breakpoints

### Tailwind Defaults
- **Mobile**: `< 640px` - Default, mobile-first
- **SM**: `640px` - Small tablets
- **MD**: `768px` - Tablets
- **LG**: `1024px` - Desktops
- **XL**: `1280px` - Large desktops
- **2XL**: `1536px` - Extra large

### Layout Patterns
```vue
<!-- Mobile: stack, Desktop: grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>

<!-- Responsive padding -->
<div class="px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

**Rules:**
- Mobile-first approach (default styles for mobile)
- Test at 320px, 768px, 1024px, 1440px
- Never horizontal scroll on mobile
- Touch targets minimum 44x44px

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 against background

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators
- Logical tab order
- Skip links where needed

**Screen Readers:**
- Semantic HTML (header, main, nav, button)
- ARIA labels on icon-only buttons
- Form labels properly associated
- Status messages announced

**Examples:**
```vue
<!-- Checkbox with label -->
<Checkbox id="field" v-model="value" :aria-label="description" />
<Label for="field">Label text</Label>

<!-- Icon button -->
<Button aria-label="Delete branch">
  <Trash2 class="w-5 h-5" />
</Button>

<!-- Loading state -->
<Button :disabled="isLoading" aria-busy="isLoading">
  <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
  Submit
</Button>
```

---

## Performance

### Optimization Rules
1. **Lazy load icons** - Tree-shakeable imports
2. **Minimize re-renders** - Use computed properties
3. **Debounce inputs** - Async operations
4. **Virtual scrolling** - Long lists (100+ items)
5. **Code splitting** - Route-based chunks

### Bundle Size Targets
- **Initial**: < 300KB gzipped
- **CSS**: < 10KB gzipped
- **Icons**: Import only used icons

---

## Common Patterns

### Form Validation
```vue
<div class="relative">
  <Input v-model="value" class="pr-10" />
  <div class="absolute right-3 top-1/2 -translate-y-1/2">
    <CheckCircle v-if="isValid" class="w-4 h-4 text-success" />
    <AlertCircle v-else class="w-4 h-4 text-muted-foreground" />
  </div>
</div>
```

### Loading States
```vue
<Button :disabled="isLoading">
  <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
  <Search v-else class="w-5 h-5" />
  {{ isLoading ? 'Loading...' : 'Submit' }}
</Button>
```

### Statistics Card
```vue
<div class="flex flex-col items-center gap-3 p-6 rounded-lg border transition-colors duration-200">
  <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
    <Icon class="w-6 h-6 text-primary" />
  </div>
  <div class="text-center">
    <p class="text-4xl font-bold font-heading text-primary">{{ value }}</p>
    <p class="text-sm text-muted-foreground mt-2">Label</p>
  </div>
</div>
```

### Hover Cards
```vue
<Card class="hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
  <!-- Content -->
</Card>
```

---

## Dark Mode Support

Currently using light mode exclusively. For future dark mode:

```css
/* Tailwind config */
darkMode: ['class']

/* Component usage */
<div class="bg-white dark:bg-slate-950">
```

**Color adjustments needed:**
- Background: slate-950
- Foreground: slate-50
- Borders: slate-800
- Muted: slate-900

---

## Quality Checklist

Before shipping any component:

- [ ] All interactive elements have cursor-pointer
- [ ] Hover states with 200ms transitions
- [ ] Icons from Lucide, no emojis
- [ ] Proper labels on all inputs
- [ ] ARIA labels on icon-only buttons
- [ ] Color contrast meets WCAG AA
- [ ] Responsive at 320px, 768px, 1024px
- [ ] Loading states visible
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Focus indicators visible
- [ ] No layout shift on interactions
- [ ] Type check passes
- [ ] Build succeeds

---

## References

- **shadcn-vue**: https://www.shadcn-vue.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Poppins Font**: https://fonts.google.com/specimen/Poppins
- **Open Sans Font**: https://fonts.google.com/specimen/Open+Sans
