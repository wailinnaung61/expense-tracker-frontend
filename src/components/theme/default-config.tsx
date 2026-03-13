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
    // Default primary color (#11B989 - teal/green)
    defaultPrimaryColor: "teal",

    // Available color options
    availableColors: [
      { name: "slate", value: "#f8fafc", foreground: "#1e293b" },
      { name: "pink", value: "#ec4899", foreground: "#ffffff" },
      { name: "blue", value: "#3b82f6", foreground: "#ffffff" },
      { name: "teal", value: "#157942", foreground: "#ffffff" },
      { name: "purple", value: "#980ffa", foreground: "#ffffff" },
      { name: "red", value: "#ef4444", foreground: "#ffffff" },
      { name: "orange", value: "#f97316", foreground: "#ffffff" },
    ],
  },
};

export default defaultConfig;
