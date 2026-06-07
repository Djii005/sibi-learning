/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Friendly grass-green primary (Duolingo-adjacent).
        // White-on-600+ verified ≥4.5:1; muted-fg-on-50..200 verified ≥4.5:1.
        brand: {
          50: "#f1fbe3",
          100: "#e0f6c5",
          200: "#c7ee92",
          300: "#a8e45c",
          400: "#7ac532",
          500: "#58cc02",
          600: "#43a102",
          700: "#367f02",
          800: "#2c5f08",
          900: "#1f4106",
        },
        // Sunny accent — used sparingly for badges, not as bg behind body text.
        accent: {
          50: "#fff8df",
          100: "#fff0b8",
          200: "#ffe57a",
          300: "#ffd84f",
          400: "#ffc800",
          500: "#e5b400",
          600: "#b88a00",
          700: "#8a6800",
        },
        // Coral for alerts/errors.
        coral: {
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffbcbc",
          300: "#ff8d8d",
          400: "#ff6464",
          500: "#ff4b4b",
          600: "#cc2929",
          700: "#9c1c1c",
        },
        // Warm neutral surface scale (replaces cold slate).
        cream: {
          50: "#fffdf7",
          100: "#fff9ee",
          200: "#fbf1dc",
          300: "#f5e7c2",
          400: "#eed59c",
          500: "#dfc377",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(67,161,2,0.18), 0 4px 18px -8px rgba(31,65,6,0.18)",
        pop: "0 4px 0 0 #2c5f08",
        "pop-coral": "0 4px 0 0 #9c1c1c",
        "pop-cream": "0 4px 0 0 #dfc377",
      },
      fontFamily: {
        sans: [
          "Nunito",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
