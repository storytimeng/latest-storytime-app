import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./views/**/*.{ts,tsx}",
    "./json/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.3rem",
        sm: "1.3rem",
        md: "1.3rem",
        lg: "2rem",
        xl: "2.5rem",
      },
    },
    extend: {
      fontFamily: {
        // === DESIGN TOKEN FONTS ===
        magnetik: ["var(--font-magnetik)", "sans-serif"],
        "timeless-tourist": ["var(--font-timeless-tourist)", "serif"],
        manrope: ["Manrope", "sans-serif"],

        // Keep existing Magnetik variations for granular control
        "magnetik-thin": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-light": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-regular": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-medium": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-semibold": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-bold": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-extrabold": ["var(--font-magnetik)", "sans-serif"],
        "magnetik-heavy": ["var(--font-magnetik)", "sans-serif"],
      },
      screens: {
        xs: { max: "380px" },
        sm: "600px",
      },
      animation: {
        "blur-in": "blur-in 1s ease-out",
      },
      keyframes: {
        "blur-in": {
          "0%": {
            filter: "blur(10px)",
          },
          "100%": {
            filter: "blur(0px)",
          },
        },
      },
      colors: {
        // === DESIGN TOKEN COLORS ===
        // Primary Colors
        "primary-shade-1": "var(--primary-shade-1)",
        "primary-shade-2": "var(--primary-shade-2)",
        "primary-shade-3": "var(--primary-shade-3)",
        "primary-shade-4": "var(--primary-shade-4)",
        "primary-shade-5": "var(--primary-shade-5)",
        "primary-shade-6": "var(--primary-shade-6)",
        "primary-colour": "var(--primary-colour)",
        "dark-primary-colour": "var(--dark-primary-colour)",

        // Universal & Grey Colors
        "universal-white": "var(--universal-white)",
        "lightest-grey": "var(--lightest-grey)",
        "light-grey-1": "var(--light-grey-1)",
        "light-grey-2": "var(--light-grey-2)",
        "light-grey-3": "var(--light-grey-3)",
        "grey-1": "var(--grey-1)",
        "grey-2": "var(--grey-2)",

        // Black & Dark Greys
        "pure-black": "var(--pure-black)",
        "black-1": "var(--black-1)",
        "black-2": "var(--black-2)",
        "black-3": "var(--black-3)",
        "dark-grey-1": "var(--dark-grey-1)",
        "dark-grey-2": "var(--dark-grey-2)",
        "dark-grey-3": "var(--dark-grey-3)",

        // Accent Colors
        "accent-shade-1": "var(--accent-shade-1)",
        "accent-shade-2": "var(--accent-shade-2)",
        "accent-shade-3": "var(--accent-shade-3)",
        "accent-colour": "var(--accent-colour)",
        "accent-dark": "var(--accent-dark)",

        // Complimentary Colors
        "complimentary-shade-1": "var(--complimentary-shade-1)",
        "complimentary-shade-2": "var(--complimentary-shade-2)",
        "complimentary-shade-3": "var(--complimentary-shade-3)",
        "complimentary-colour": "var(--complimentary-colour)",
        "complimentary-dark-1": "var(--complimentary-dark-1)",
        "complimentary-dark-2": "var(--complimentary-dark-2)",

        // Utility Colors
        red: "var(--red)",
        green: "var(--green)",
        yellow: "var(--yellow)",

        // === SHADCN/UI COLORS ===
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        // === DESIGN TOKEN FONT SIZES ===
        "2xs": "var(--font-size-2xs)",
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        // Additional sizes for typography styles
        "10px": "10px",
        "12px": "12px",
        "14px": "14px",
        "16px": "16px",
        "18px": "18px",
        "20px": "20px",
        "24px": "24px",
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      boxShadow: {
        // === DESIGN TOKEN EFFECTS ===
        "design-token": "var(--shadow)",
        shadow: "var(--shadow)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },

  plugins: [
    tailwindcssAnimate,
    heroui as any,
    // Design Token Typography Plugin
    function ({ addUtilities }: any) {
      const designTokenTypography = {
        // === Header Text Styles ===
        ".header-text-bold-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "24px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "-0.96px", // -4% of 24px
        },
        ".header-text-medium-auto": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "24px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".header-text-small-auto": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "24px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".header-text-bold": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "24px",
          fontWeight: "400",
          lineHeight: "34px",
          letterSpacing: "0",
        },
        ".header-text-medium": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "24px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".header-text-small": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "24px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },

        // === Title Text Styles ===
        ".title-text-auto-bold": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "20px",
          fontWeight: "600",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".title-text-auto-medium": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "20px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".title-text-auto-regular": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "20px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".title-text-bold": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "20px",
          fontWeight: "400",
          lineHeight: "30px",
          letterSpacing: "0",
        },
        ".title-text-medium": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "20px",
          fontWeight: "400",
          lineHeight: "30px",
          letterSpacing: "0",
        },
        ".title-text-regular": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "20px",
          fontWeight: "400",
          lineHeight: "30px",
          letterSpacing: "0",
        },

        // === Title Small Text Styles ===
        ".title-text-small-auto-bold": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "18px",
          fontWeight: "600",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".title-text-auto-small-medium": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "18px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".title-text-auto-small-regular": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "18px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".title-text-small-bold": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "18px",
          fontWeight: "400",
          lineHeight: "28px",
          letterSpacing: "0",
        },
        ".title-text-small-medium": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "18px",
          fontWeight: "400",
          lineHeight: "28px",
          letterSpacing: "0",
        },
        ".title-text-small-regular": {
          fontFamily: "var(--font-timeless-tourist), serif",
          fontSize: "18px",
          fontWeight: "400",
          lineHeight: "28px",
          letterSpacing: "0",
        },

        // === Body Big Text Styles ===
        ".body-text-big-bold-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "16px",
          fontWeight: "800",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-big-medium-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "16px",
          fontWeight: "500",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-big-regular-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "16px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-big-bold": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "16px",
          fontWeight: "800",
          lineHeight: "22px",
          letterSpacing: "0",
        },
        ".body-text-big-medium": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "16px",
          fontWeight: "500",
          lineHeight: "26px",
          letterSpacing: "0",
        },
        ".body-text-big-regular": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "16px",
          fontWeight: "400",
          lineHeight: "26px",
          letterSpacing: "0",
        },

        // === Body Small Text Styles ===
        ".body-text-small-bold-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "14px",
          fontWeight: "800",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-small-medium-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-small-regular-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-small-bold": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "14px",
          fontWeight: "800",
          lineHeight: "20px",
          letterSpacing: "0",
        },
        ".body-text-small-medium": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "20px",
          letterSpacing: "0",
        },
        ".body-text-small-regular": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "14px",
          fontWeight: "300", // Light weight as specified
          lineHeight: "20px",
          letterSpacing: "0",
        },

        // === Body Text 12px Styles (was duplicated as "Body text small") ===
        ".body-text-12-bold-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "12px",
          fontWeight: "800",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-12-medium-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "12px",
          fontWeight: "500",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-12-regular-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "12px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-12-bold": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "12px",
          fontWeight: "800",
          lineHeight: "22px",
          letterSpacing: "0",
        },
        ".body-text-12-medium": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "12px",
          fontWeight: "500",
          lineHeight: "20px",
          letterSpacing: "0",
        },
        ".body-text-12-regular": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "12px",
          fontWeight: "400",
          lineHeight: "20px",
          letterSpacing: "0",
        },

        // === Body Smallest Text Styles (10px) ===
        ".body-text-smallest-bold-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "10px",
          fontWeight: "800",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-smallest-medium-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "10px",
          fontWeight: "500",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-smallest-regular-auto": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "10px",
          fontWeight: "400",
          lineHeight: "1", // 100% = 1 in CSS
          letterSpacing: "0",
        },
        ".body-text-smallest-bold": {
          fontFamily: "Manrope, sans-serif", // Uses Manrope as specified
          fontSize: "10px",
          fontWeight: "800",
          lineHeight: "20px",
          letterSpacing: "0",
        },
        ".body-text-smallest-medium": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "10px",
          fontWeight: "500",
          lineHeight: "18px",
          letterSpacing: "0",
        },
        ".body-text-smallest-regular": {
          fontFamily: "var(--font-magnetik), sans-serif",
          fontSize: "10px",
          fontWeight: "400",
          lineHeight: "14px",
          letterSpacing: "0",
        },
      };

      addUtilities(designTokenTypography);
    },
  ],
} satisfies Config;
