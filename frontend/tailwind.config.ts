import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
	darkMode: 'class',
	content: [
	  "./src/**/*.{js,ts,jsx,tsx,html}", // Include paths to all your files
	  "./app/**/*.{js,ts,jsx,tsx,html}",
	],  theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        fontFamily: {
          sans: [
            'Inter',
            'Roboto',
            'Helvetica Neue',
            'sans-serif',
          ],
          serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        },
        fontSize: {
          'body': ['1rem', { lineHeight: '1.6' }],          // 16px - Body text
          'small': ['0.875rem', { lineHeight: '1.4' }],     // 14px - Small text
          'h1': ['2.25rem', { lineHeight: '1.2' }],         // 36px - H1
          'h2': ['1.75rem', { lineHeight: '1.3' }],         // 28px - H2
          'h3': ['1.375rem', { lineHeight: '1.4' }],        // 22px - H3
          'button': ['1rem', { lineHeight: '1.5' }],        // 16px - Buttons
          'nav': ['1rem', { lineHeight: '1.5' }],           // 16px - Navigation
          'nav-lg': ['1.125rem', { lineHeight: '1.5' }],    // 18px - Large navigation
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
          "gradient-x": {
            "0%, 100%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
          },
          "fade-in": {
            "0%": { opacity: "0" },
            "100%": { opacity: "1" },
          },
          "slide-in-left": {
            "0%": { transform: "translateX(-100%)" },
            "100%": { transform: "translateX(0)" },
          },
          "slide-in-left-strong": {
            "0%": { transform: "translateX(-100%)", opacity: "0" },
            "50%": { transform: "translateX(-50%)", opacity: "0.5" },
            "100%": { transform: "translateX(0)", opacity: "1" },
          },
          "slide-down": {
            "0%": { transform: "translateY(-10px)", opacity: "0" },
            "100%": { transform: "translateY(0)", opacity: "1" },
          },
          "pulse-scale": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
          },
          "slide-in-right": {
            "0%": { 
              transform: "translateX(100%) scale(0.8)", 
              opacity: "0" 
            },
            "50%": { 
              transform: "translateX(-5%) scale(1.02)", 
              opacity: "0.8" 
            },
            "100%": { 
              transform: "translateX(0) scale(1)", 
              opacity: "1" 
            },
          },
          "shrink-width": {
            "0%": { width: "100%" },
            "100%": { width: "0%" },
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "gradient-x": "gradient-x 10s ease infinite",
          "fade-in": "fade-in 0.3s ease-out",
          "slideInLeft": "slide-in-left 0.3s ease-out",
          "slideInLeftStrong": "slide-in-left-strong 0.5s ease-out",
          "slideDown": "slide-down 0.3s ease-out",
          "pulseScale": "pulse-scale 2s ease-in-out infinite",
          "slide-in-right": "slide-in-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "shrink-width": "shrink-width linear forwards",
        },
      },
    },
	plugins: [
	  // Add DaisyUI as a plugin
	  daisyui,
	],
	daisyui: {
	  // Your DaisyUI configuration options here
	}
};

export default config;
