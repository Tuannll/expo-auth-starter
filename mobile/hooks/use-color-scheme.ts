import { useThemeStore } from '@/store/useThemeStore';

export function useColorScheme() {
  return useThemeStore((state) => state.colorScheme);
}
