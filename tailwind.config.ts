import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#f0f8ff",
          100: "#d6f0ff",
          200: "#a9e0ff",
          300: "#6ecbff",
          400: "#3ab5ff",
          500: "#1496ff",
          600: "#0a79d6",
          700: "#075ea7",
          800: "#064b82",
          900: "#063f6b"
        }
      }
    }
  },
  plugins: [forms]
};

export default config;
