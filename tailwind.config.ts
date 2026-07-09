import type { Config } from "tailwindcss";

/*
  Frame & Form Studio brand palette (matches ff-hub)
  Cream #F2EBD8 · Warm Tan #C29870 · Forest #3D4A2F · Ink #1A1A1A
  sage/cream tokens are remapped to the studio palette.
*/
const config: Config = {
    content: [
          "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        ],
    theme: {
          extend: {
                  colors: {
                            sage: {
                                        DEFAULT: "#c29870",
                                        dark: "#b3855c",
                                        darker: "#3d4a2f",
                            },
                            cream: {
                                        DEFAULT: "#f2ebd8",
                                        dark: "#e9dfc7",
                            },
                            tan: "#c29870",
                            forest: "#3d4a2f",
                            ink: "#1a1a1a",
                            background: "var(--background)",
                            foreground: "var(--foreground)",
                  },
                  fontFamily: {
                            heading: ["var(--font-cormorant)", "Georgia", "serif"],
                  },
          },
    },
    plugins: [],
};
export default config;
