import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import defaultConfig from "./default-config";

// Define allowed direction type
type Direction = "ltr" | "rtl";
type PrimaryColor = "teal" | "pink" | "blue" | "purple" | "red" | "orange" | "cyan" | "rose" | "indigo" | "amber";

const COLOR_OPTIONS: { key: PrimaryColor; bg: string }[] = [
  { key: "teal",   bg: "#11B989" },
  { key: "pink",   bg: "#ec4899" },
  { key: "blue",   bg: "#3b82f6" },
  { key: "purple", bg: "#a855f7" },
  { key: "red",    bg: "#ef4444" },
  { key: "orange", bg: "#f97316" },
  { key: "cyan",   bg: "#06b6d4" },
  { key: "rose",   bg: "#f43f5e" },
  { key: "indigo", bg: "#6366f1" },
  { key: "amber",  bg: "#f59e0b" },
];

// Strongly type the context value
interface ThemeContextType {
  layout: string;
  setLayout: (layout: string) => void;
  direction: Direction;
  setDirection: (direction: Direction) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
  config: typeof defaultConfig;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  layout: defaultConfig.defaultLayout,
  setLayout: () => {},
  direction: defaultConfig.defaultDirection as Direction,
  setDirection: () => {},
  primaryColor: (defaultConfig.colors?.defaultPrimaryColor as PrimaryColor) || "teal",
  setPrimaryColor: () => {},
  config: defaultConfig,
});

// Hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Custom hook that combines theme context with next-themes
export const useTheme = () => {
  const nextTheme = useNextTheme();
  const themeContext = useThemeContext();

  return {
    ...nextTheme,
    ...themeContext,
  };
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Layout and direction state
  const [layout, setLayout] = useState<string>(defaultConfig.defaultLayout);
  const [direction, setDirection] = useState<Direction>(
    defaultConfig.defaultDirection as Direction
  );
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(
    (defaultConfig.colors?.defaultPrimaryColor as PrimaryColor) || "teal"
  );
  const [mounted, setMounted] = useState(false);

  // Apply color theme to DOM
  const applyColorTheme = (color: PrimaryColor) => {
    const root = document.documentElement;
    root.classList.remove(...COLOR_OPTIONS.map((c) => `theme-${c.key}`));
    root.classList.add(`theme-${color}`);
    root.style.setProperty("--primary", `var(--${color})`);
    root.style.setProperty("--primary-foreground", `var(--${color}-foreground)`);
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Load saved preferences from localStorage if available
    try {
      const savedLayout = localStorage.getItem("layout");
      const savedDirection = localStorage.getItem("direction");
      const savedColor = localStorage.getItem("primaryColor") as PrimaryColor | null;

      if (savedLayout && defaultConfig.availableLayouts.includes(savedLayout)) {
        setLayout(savedLayout);
      }

      if (
        savedDirection &&
        defaultConfig.availableDirections.includes(savedDirection)
      ) {
        setDirection(savedDirection as Direction);
      }

      if (savedColor && COLOR_OPTIONS.some(c => c.key === savedColor)) {
        setPrimaryColorState(savedColor);
        applyColorTheme(savedColor);
      } else {
        // Apply default color on first load
        const defaultColor = (defaultConfig.colors?.defaultPrimaryColor as PrimaryColor) || "teal";
        applyColorTheme(defaultColor);
      }
    } catch (error) {
      console.error("Error loading theme preferences:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle layout change
  const handleLayoutChange = (newLayout: string) => {
    if (newLayout !== layout) {
      setLayout(newLayout);
    }
  };

  // Handle direction change
  const handleDirectionChange = (newDirection: Direction) => {
    if (newDirection !== direction) {
      setDirection(newDirection);
    }
  };

  // Handle primary color change
  const handlePrimaryColorChange = (newColor: PrimaryColor) => {
    if (newColor !== primaryColor) {
      setPrimaryColorState(newColor);
      applyColorTheme(newColor);
    }
  };

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("layout", layout);
        localStorage.setItem("direction", direction);
        localStorage.setItem("primaryColor", primaryColor);

        // Apply direction to html element
        document.documentElement.dir = direction;
      } catch (error) {
        console.error("Error saving theme preferences:", error);
      }
    }
  }, [layout, direction, primaryColor, mounted]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      layout,
      setLayout: handleLayoutChange,
      direction,
      setDirection: handleDirectionChange,
      primaryColor,
      setPrimaryColor: handlePrimaryColorChange,
      config: defaultConfig,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout, direction, primaryColor]
  );

  // If not mounted yet, return null to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={defaultConfig.themeOptions.defaultTheme}
        enableSystem={defaultConfig.themeOptions.enableSystem}
        disableTransitionOnChange={
          defaultConfig.themeOptions.disableTransitionOnChange
        }
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}
