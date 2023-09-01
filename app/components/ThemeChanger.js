import { useTheme } from "next-themes";
import Sun from "./icons/Sun";
import Moon from "./icons/Moon";

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className=" transition-all ease-in-out"
    >
      {theme === "light" ? <Sun /> : <Moon />}
    </button>
  );
}
