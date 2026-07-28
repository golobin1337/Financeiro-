"use client";

import { useTheme } from "next-themes";
import { useMounted } from "@/lib/use-mounted";

const LIGHT = {
  surface: "#ffffff",
  border: "#e2e2ee",
  muted: "#66667f",
  income: "#2a78d6",
  expense: "#eb6834",
};

const DARK = {
  surface: "#14141f",
  border: "#26263a",
  muted: "#9494b8",
  income: "#3987e5",
  expense: "#d95926",
};

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  return mounted && resolvedTheme === "light" ? LIGHT : DARK;
}
