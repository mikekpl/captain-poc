import type { Config } from "tailwindcss";

// CSS variables store R G B channel values so Tailwind opacity modifiers work (e.g. bg-primary/10)
function v(varName: string) {
  return `rgb(var(${varName}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: v("--background"),
        foreground: v("--foreground"),
        card: { DEFAULT: v("--card"), foreground: v("--card-foreground") },
        primary: { DEFAULT: v("--primary"), foreground: v("--primary-foreground") },
        secondary: { DEFAULT: v("--secondary"), foreground: v("--secondary-foreground") },
        muted: { DEFAULT: v("--muted"), foreground: v("--muted-foreground") },
        accent: { DEFAULT: v("--accent"), foreground: v("--accent-foreground") },
        destructive: { DEFAULT: v("--destructive"), foreground: v("--destructive-foreground") },
        border: v("--border"),
        input: v("--input"),
        ring: v("--ring"),
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
