/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#38bdf8",
          purple: "#a855f7",
          teal: "#34d399"
        }
      },
      boxShadow: {
        glow: "0 10px 50px rgba(56, 189, 248, 0.25)"
      }
    }
  },
  plugins: []
};

