import { useEffect, useState } from 'react';
import { useOperation } from '../../store/operationStore';

const query = '(prefers-reduced-motion: reduce)';

/** Effective motion setting: user preference, falling back to the OS setting. */
export function useMotionEnabled() {
  const pref = useOperation((s) => s.motion);
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return pref === 'on' ? true : pref === 'off' ? false : !reduced;
}
