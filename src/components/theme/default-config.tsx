// Theme configuration options
const defaultConfig = {
  // Default layout (vertical or horizontal)
  defaultLayout: "vertical",

  // Default direction (ltr or rtl)
  defaultDirection: "ltr",

  // Theme options for next-themes
  themeOptions: {
    // Default theme (light, dark, or system)
    defaultTheme: "system",

    // Enable system theme detection
    enableSystem: true,

    // Disable automatic theme detection
    disableTransitionOnChange: false,
  },

  // Available layout options
  availableLayouts: ["vertical", "horizontal"],

  // Available direction options
  availableDirections: ["ltr", "rtl"],

  // Color configuration
  colors: {
    // Default primary color (sky-cyan-teal gradient)
    defaultPrimaryColor: "sky",

    // Available color options
    availableColors: [
      { name: "sky", value: "#0284c7", foreground: "#ffffff" },
      { name: "slate", value: "#f8fafc", foreground: "#1e293b" },
      { name: "pink", value: "#ec4899", foreground: "#ffffff" },
      { name: "blue", value: "#155dfc", foreground: "#ffffff" },
      { name: "teal", value: "#157942", foreground: "#ffffff" },
      { name: "purple", value: "#980ffa", foreground: "#ffffff" },
      { name: "red", value: "#ef4444", foreground: "#ffffff" },
      { name: "orange", value: "#f97316", foreground: "#ffffff" },
    ],
  },
};

export default defaultConfig;
