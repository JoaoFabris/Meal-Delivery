// src/hooks/useCountUp.ts
'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountUp(
  target: number,
  duration = 1200,
  startOnMount = false,
) {
  const [count, setCount] = useState(startOnMount ? 0 : target);
  const triggered = useRef(startOnMount);

  function start() {
    if (triggered.current) return;
    triggered.current = true;

    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return { count, start };
}
