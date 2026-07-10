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
                            // Warm neutrals: remap Tailwind's cold gray ramp and
                            // pure black onto taupe tints derived from cream/ink,
                            // so every existing text-gray / text-black usage
                            // renders on-brand without per-file class changes.
                            black: "#1a1a1a",
                            gray: {
                                        50: "#faf6ec",
                                        100: "#f0e9d8",
                                        200: "#e2d8c2",
                                        300: "#c9bda3",
                                        400: "#a89d87",
                                        500: "#847a67",
                                        600: "#615a4b",
                                        700: "#494438",
                                        800: "#312d26",
                                        900: "#211e19",
                            },
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
