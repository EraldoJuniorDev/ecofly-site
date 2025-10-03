import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Cores eco-friendly
        eco: {
          primary: '142 69% 58%',
          secondary: '160 84% 39%',
          light: '120 60% 96%',
          dark: '162 63% 41%',
          nature: '82 84% 67%'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(2deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-2deg)' }
        },
        'bounce-gentle': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'translateY(-10px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(142, 176, 148, 0.4)',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(142, 176, 148, 0.8)',
            opacity: '0.8'
          }
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'morph': {
          '0%, 100%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
          '25%': { borderRadius: '50% 50% 20% 80% / 25% 75% 25% 75%' },
          '50%': { borderRadius: '80% 20% 50% 50% / 75% 25% 75% 25%' },
          '75%': { borderRadius: '20% 80% 40% 60% / 60% 40% 80% 20%' }
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-in-left': {
          from: {
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'fade-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(30px)'
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          to: {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'scale-out': {
          from: {
            opacity: '1',
            transform: 'scale(1)'
          },
          to: {
            opacity: '0',
            transform: 'scale(0.9)'
          }
        },
        'slide-in-bottom': {
          from: {
            opacity: '0',
            transform: 'translateY(100%)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'skeleton': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float-delayed 4s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.8s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'scale-out': 'scale-out 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-in-bottom': 'slide-in-bottom 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'skeleton': 'skeleton 1.5s ease-in-out infinite'
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;