export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070d",
        panel: "#0b1020",
        cyanx: "#20f6ff",
        violetx: "#8b5cf6"
      },
      boxShadow: {
        glow: "0 0 36px rgba(32, 246, 255, 0.22)",
        violet: "0 0 36px rgba(139, 92, 246, 0.2)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
