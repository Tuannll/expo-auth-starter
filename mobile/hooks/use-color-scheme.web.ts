import { useThemeStore } from '@/store/useThemeStore';
import { useEffect } from 'react';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const setHasHydrated = useThemeStore((state) => state.setHasHydrated);

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
