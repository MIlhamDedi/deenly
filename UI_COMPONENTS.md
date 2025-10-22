# Deenly UI Component Library

A consistent, accessible, and beautiful component library with full dark mode support.

## 🎨 Design Principles

- **Consistent**: All components follow the same design patterns
- **Accessible**: WCAG AA compliant with proper ARIA labels
- **Dark Mode**: Full support with smooth transitions
- **Responsive**: Mobile-first design approach
- **Semantic**: Meaningful HTML structure

---

## 📦 Components

### Button

A versatile button component with multiple variants and sizes.

**Variants:**
- `primary` - Teal background, white text (default)
- `secondary` - Gold background, teal text
- `outline` - Transparent with teal border
- `ghost` - Transparent, teal text
- `white` - White background, dark text (perfect for dark backgrounds)

**Sizes:**
- `sm` - Small (px-3 py-1.5)
- `md` - Medium (px-4 py-2) - default
- `lg` - Large (px-6 py-3)

**Props:**
- `variant`: Button style variant
- `size`: Button size
- `isLoading`: Shows loading spinner
- `disabled`: Disables button
- All standard button HTML attributes

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg">
  Click Me
</Button>

<Button variant="white" size="lg">
  Get Started Free
</Button>
```

---

### Input

Form input component with validation states.

**Props:**
- `label`: Input label text
- `error`: Error message to display
- `helperText`: Helper text below input
- All standard input HTML attributes

**Usage:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

---

### Card

Flexible card component for content containers.

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardContent` - Main content
- `CardFooter` - Footer section

**Props (Card):**
- `hover`: Enable hover effect
- `padding`: 'none' | 'sm' | 'md' | 'lg'

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card hover padding="lg">
  <CardHeader>
    <CardTitle>Journey Name</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

---

### Typography

Consistent text components.

**Heading:**
- Levels: 1, 2, 3, 4
- Responsive sizing
- Dark mode support

**Text:**
- Variants: 'body', 'muted', 'small', 'large'
- Consistent coloring

**Usage:**
```tsx
import { Heading, Text } from '@/components/ui';

<Heading level={1}>Main Title</Heading>
<Heading level={2}>Subtitle</Heading>
<Text variant="body">Body text content</Text>
<Text variant="muted">Secondary information</Text>
```

---

### Modal

Reusable modal component with backdrop.

**Props:**
- `isOpen`: Controls visibility
- `onClose`: Close callback
- `title`: Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl'

**Features:**
- Backdrop click to close
- Escape key to close
- Body scroll lock when open
- Smooth animations

**Usage:**
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create Journey"
  size="lg"
>
  Modal content here
</Modal>
```

---

### ThemeToggle

Dark mode toggle button.

**Features:**
- Automatic system preference detection
- Persists to localStorage
- Smooth transitions
- Moon/Sun icons

**Usage:**
```tsx
import { ThemeToggle } from '@/components/ui';

<ThemeToggle />
```

---

## 🎨 Color Palette

### Teal (Primary)
- `teal-50` to `teal-950`: Light to dark
- Used for: Buttons, links, accents

### Gold (Accent)
- `gold-50` to `gold-950`: Beige to gold
- Used for: Highlights, secondary actions

### Gray (Neutral)
- Used for: Text, backgrounds, borders
- Dark mode: Inverted grays

---

## 🌓 Dark Mode

All components support dark mode via Tailwind's `dark:` variants.

**How it works:**
1. ThemeProvider wraps the app
2. Adds `dark` class to `<html>` when enabled
3. Components use `dark:` prefixed classes
4. Automatic transitions

**Example:**
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

---

## 📱 Responsive Design

All components are mobile-first:
- Base styles for mobile
- `sm:`, `md:`, `lg:` breakpoints
- Flexible layouts
- Touch-friendly sizes

---

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Screen reader support

---

## 🚀 Best Practices

1. **Always import from index:**
   ```tsx
   import { Button, Card, Input } from '@/components/ui';
   ```

2. **Use semantic variants:**
   - Primary actions: `variant="primary"`
   - Secondary actions: `variant="secondary"`
   - Destructive: Add custom classes

3. **Consistent spacing:**
   - Use Tailwind spacing scale
   - gap-4, p-6, mb-8, etc.

4. **Dark mode:**
   - Test all components in both modes
   - Use appropriate contrast

---

## 🎯 Component Checklist

When creating new components:
- [ ] Light mode styles
- [ ] Dark mode styles
- [ ] Responsive breakpoints
- [ ] Accessibility (ARIA, keyboard)
- [ ] TypeScript types
- [ ] Loading states (if applicable)
- [ ] Error states (if applicable)
- [ ] Documentation

---

Built with ❤️ for Rani
