/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      // ── Stitch color tokens (exact match from index.html) ──
      colors: {
        // Semantic shadcn tokens
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Stitch design tokens (exact)
        "stitch-primary": "#00639a",
        "stitch-primary-container": "#5BAAEC",
        "stitch-on-primary": "#ffffff",
        "stitch-on-primary-container": "#003d62",
        "stitch-surface": "#f7f9ff",
        "stitch-surface-container": "#eceef4",
        "stitch-surface-container-high": "#e6e8ee",
        "stitch-surface-container-low": "#f1f3f9",
        "stitch-surface-container-lowest": "#ffffff",
        "stitch-on-surface": "#181c20",
        "stitch-on-surface-variant": "#404750",
        "stitch-outline": "#707881",
        "stitch-outline-variant": "#c0c7d1",
        "stitch-secondary": "#545f73",
        "stitch-secondary-container": "#d5e0f8",
        "stitch-on-secondary-container": "#586377",
        "stitch-tertiary": "#805600",
        "stitch-tertiary-container": "#d7982a",
        "stitch-error": "#ba1a1a",
        // Brand shortcuts
        "brand-blue": "#5BAAEC",
        "brand-blue-dark": "#00639a",
        "brand-dark": "#181c20",
        "brand-bg": "#f7f9ff",
        success: { DEFAULT: "#22C55E", foreground: "#fff" },
        warning: { DEFAULT: "#F59E0B", foreground: "#fff" },
        danger: { DEFAULT: "#EF4444", foreground: "#fff" },
      },
      borderRadius: {
        // Stitch: 16px for cards
        "none": "0",
        "sm": "8px",
        "DEFAULT": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
        "2xl": "24px",
        "full": "9999px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
        // Stitch custom families
        "body-md": ["Inter"],
        "body-lg": ["Inter"],
        "body-sm": ["Inter"],
        "h1-hero": ["Poppins"],
        "h2-kpi": ["Poppins"],
        "h3-section": ["Poppins"],
        "label-caps": ["Inter"],
        "data-tabular": ["Inter"],
      },
      fontSize: {
        // Stitch size scale (larger than before)
        "xs": ["13px", { lineHeight: "1.4" }],
        "sm": ["14px", { lineHeight: "1.5" }],
        "base": ["16px", { lineHeight: "1.5" }],
        "lg": ["18px", { lineHeight: "1.6" }],
        "xl": ["20px", { lineHeight: "1.4" }],
        "2xl": ["24px", { lineHeight: "1.3" }],
        "3xl": ["28px", { lineHeight: "1.3" }],
        "4xl": ["32px", { lineHeight: "1.2" }],
        "5xl": ["40px", { lineHeight: "1.2" }],
        // Stitch tokens
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
        "data-tabular": ["15px", { lineHeight: "1", fontWeight: "500" }],
        "h3-section": ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        "h2-kpi": ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        "h1-hero": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
      // Stitch spacing scale
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "xxl": "48px",
        "xxxl": "64px",
      },
      boxShadow: {
        "soft": "0 4px 12px -2px rgba(30, 41, 59, 0.05)",
        "ai-glow": "0 4px 12px -2px rgba(91, 170, 236, 0.2)",
        "card": "0 2px 8px rgba(30, 41, 59, 0.06)",
        "card-hover": "0 6px 24px rgba(91, 170, 236, 0.14)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
