import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define theme options
export type ThemeType = "light" | "dark" | "neural-red" | "neural-default";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isNeural: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Try to get stored theme or default to 'neural-default'
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const storedTheme = localStorage.getItem("theme") as ThemeType;
    return storedTheme || "neural-default";
  });

  const isNeural = theme === "neural-default" || theme === "neural-red";

  // Update theme in localStorage and document classes when theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);

    const root = document.documentElement;

    // Remove any existing theme classes
    root.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-neural-default",
      "theme-neural-red"
    );

    // Add the new theme class
    root.classList.add(`theme-${theme}`);

    // Update color scheme meta tag
    const colorScheme = theme === "light" ? "light" : "dark";
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute("content", colorScheme);

    // Toggle dark class for base styling
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  // Wrapper for setTheme to handle any side effects
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isNeural }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
