import { useCallback, useEffect, useState } from 'react';
import type { Segment } from '../api/types';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'meridian-theme';
const SEGMENT_STORAGE_KEY = 'meridian-segment';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredSegment(): Segment | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(SEGMENT_STORAGE_KEY);
  if (saved === 'retail' || saved === 'premium') return saved;
  return null;
}

export function useTheme(defaultCustomerSegment?: Segment) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [segmentOverride, setSegmentOverride] = useState<Segment | null>(
    getStoredSegment
  );

  // Active segment derives from user override first, then customer default, then 'retail'
  const segment: Segment =
    segmentOverride ?? defaultCustomerSegment ?? 'retail';

  // Sync to DOM and localStorage whenever theme changes
  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage access may be restricted
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Sync to DOM and localStorage whenever segment changes
  const setSegment = useCallback((nextSegment: Segment) => {
    setSegmentOverride(nextSegment);
    document.documentElement.setAttribute('data-segment', nextSegment);
    try {
      localStorage.setItem(SEGMENT_STORAGE_KEY, nextSegment);
    } catch {
      // Storage access may be restricted
    }
  }, []);

  const toggleSegment = useCallback(() => {
    setSegment(segment === 'retail' ? 'premium' : 'retail');
  }, [segment, setSegment]);

  // Synchronize document root attributes with external DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-segment', segment);
  }, [theme, segment]);

  return {
    theme,
    segment,
    setTheme,
    toggleTheme,
    setSegment,
    toggleSegment
  };
}
