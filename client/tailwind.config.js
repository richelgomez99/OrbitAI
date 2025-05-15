/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'], // or 'media' if you prefer OS-level dark mode detection
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Base Colors from Orbit Color Strategy
        'orbit-primary-background': '#0E0E10',
        'orbit-card-surface': '#1A1A1E',
        'orbit-border': '#2B2B31',
        'orbit-text-primary': '#FFFFFF',
        'orbit-text-secondary': '#B0B0C3',
        'orbit-text-muted': '#555568',

        // Mode Accent Colors (using CSS variables for dynamic theming)
        // These will be utility classes like bg-orbit-accent, text-orbit-accent
        'orbit-accent': 'hsl(var(--orbit-accent-hsl))',
        'orbit-accent-foreground': 'hsl(var(--orbit-accent-foreground-hsl))', // For text on accent backgrounds
        'orbit-accent-light': 'hsla(var(--orbit-accent-hsl), var(--orbit-accent-light-opacity, 0.2))', // Accent with adjustable opacity
        
        // Shadcn UI theming conventions (can be mapped to our Orbit colors)
        border: 'hsl(var(--border))', // Using a generic border variable
        input: 'hsl(var(--input))', // Using a generic input border variable
        ring: 'hsl(var(--ring))', // Focus rings, etc.
        background: 'hsl(var(--background))', // Primary background
        foreground: 'hsl(var(--foreground))', // Primary text
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Main interactive elements, maps to orbit-accent
          foreground: 'hsl(var(--primary-foreground))', // Text on primary elements, maps to orbit-accent-foreground
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // Secondary buttons, less prominent elements
          foreground: 'hsl(var(--secondary-foreground))', // Text on secondary elements
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // Destructive actions (e.g., delete)
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // Muted backgrounds or text (maps to orbit-text-muted or a light gray)
          foreground: 'hsl(var(--muted-foreground))', // Muted text (maps to orbit-text-secondary or similar)
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // General accent, can map to orbit-accent
          foreground: 'hsl(var(--accent-foreground))', // Text on accent
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))', // Popover background (maps to orbit-card-surface)
          foreground: 'hsl(var(--popover-foreground))', // Popover text (maps to orbit-text-primary)
        },
        card: {
          DEFAULT: 'hsl(var(--card))', // Card background (maps to orbit-card-surface)
          foreground: 'hsl(var(--card-foreground))', // Card text (maps to orbit-text-primary)
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
