'use client';
import { useEffect } from 'react';
import { initTheme } from '@/lib/themes';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    initTheme();
  }, []);
  return <>{children}</>;
}
