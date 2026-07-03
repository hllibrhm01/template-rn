import { useColorScheme } from "react-native";
import { darkTokens, lightTokens } from "@/constants/theme";

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTokens : lightTokens;
}
