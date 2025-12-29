"use client";
import { useEffect, useState } from "react";

// should match Tailwind breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export type Breakpoint = keyof typeof breakpoints;

interface BreakpointState {
  isAbove: boolean;
  isBelow: boolean;
  isAtOrAbove: boolean;
  isAtOrBelow: boolean;
}

export const useBreakpoint = (bp: Breakpoint): BreakpointState | null => {
  const [state, setState] = useState<BreakpointState | null>(null);

  useEffect(() => {
    const value = breakpoints[bp];

    const aboveQuery = window.matchMedia(`(min-width: ${value + 1}px)`);
    const atOrAboveQuery = window.matchMedia(`(min-width: ${value}px)`);

    const update = () => {
      setState({
        isAbove: aboveQuery.matches,
        isBelow: !atOrAboveQuery.matches,
        isAtOrAbove: atOrAboveQuery.matches,
        isAtOrBelow: !aboveQuery.matches,
      });
    };

    update();

    aboveQuery.addEventListener("change", update);
    atOrAboveQuery.addEventListener("change", update);

    return () => {
      aboveQuery.removeEventListener("change", update);
      atOrAboveQuery.removeEventListener("change", update);
    };
  }, [bp]);

  return state;
};