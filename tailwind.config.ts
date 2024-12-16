/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
	theme: {
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
		borderRadius: {
		  lg: `var(--radius)`,
		  md: `calc(var(--radius) - 2px)`,
		  sm: "calc(var(--radius) - 4px)",
		},
		keyframes: {
		  'fade-in': {
			'0%': { opacity: '0', transform: 'translateX(8px)' },
			'100%': { opacity: '1', transform: 'translateX(0)' },
		  },
		  'expand': {
			'0%': { height: '60px' },
			'100%': { height: '610px' },
		  }
		},
		animation: {
		  'fade-in': 'fade-in 0.3s ease-out 0.4s forwards',
		  'expand': 'expand 0.5s ease-out forwards',
		}
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }
  