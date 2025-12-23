import { useEffect, useState } from 'react';

export function useLiteMode() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const prefersLowPower = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fpsLow = false; // extend: detect device GPU
    setLite(prefersLowPower || fpsLow);
  }, []);
  return { lite, setLite };
}

