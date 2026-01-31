/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("tailwindcss-animate")],
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
          grey400: "#424242",
          grey300: "#626060",
          grey200: "#8E8E8E",
          grey150: "#B8B8B8",
          grey100: "#D6D6D6",
          grey50: "#F9F9F9",
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

        green: {
          primary100: "#3EAF3F",
        },

        blue: {
          primary400: "#0E4395",
          primary300: "#0D47A1",
          primary250: "#2372EC",
          primary150: "#96BFFF",
          primary100: "#F2F7FF",
          primary50: "#F8FAFF",
        },

        error: {
          400: "#F04248",
          200: "#EB8B85",
          50: "#FFF8F8",
        },

        success: {
          400: "#2E7D32",
          300: "#3EAF3F",
          200: "#4ADE80",
          100: "#F2FFF3",
        },

        monochrom: {
          white: "#FFFFFF",
        },

        warning: {
          400: "#EC7600",
          50: "#FFF7F0",
        },

        warning2: {
          400: "#BE8B00",
          50: "#FEF9E6",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      screens: {
        xxl: "1700px",
      },

      keyframes: {
    colorBlink: {
      '0%, 100%': { backgroundColor: 'var(--blink-off)' },
      '50%': { backgroundColor: 'var(--blink-on)' },
    },
  },
  animation: {
    colorBlink: 'colorBlink steps(1, end) 1s  infinite',
  },
    },
  },
};
