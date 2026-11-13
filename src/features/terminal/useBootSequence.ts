import { useEffect } from 'react';
import { bootSequence, restoredSessionMessage } from '../../data/operation';
import { login } from '../../data/login';
import { useOperation } from '../../store/operationStore';
import { useMotionEnabled } from '../operation/useMotion';

let started = false; // survives StrictMode double-invocation within one page load

/** Prints the boot sequence on first run, or a restore line on reload; then fires `session:ready`. */
export function useBootSequence() {
  const motion = useMotionEnabled();

  useEffect(() => {
    if (started) return;
    started = true;
    const st = useOperation.getState();
    if (st.bootDone) {
      if (st.logs[st.logs.length - 1]?.message !== restoredSessionMessage) st.pushLog('system', restoredSessionMessage);
      st.trigger('session:ready'); // once-guarded; safe to re-fire
      return;
    }
    const step = motion ? 380 : 0;
    const lines = st.identity ? [{ level: 'success' as const, message: login.successLine(st.identity) }, ...bootSequence] : bootSequence;
    const timers = lines.map((line, i) =>
      window.setTimeout(() => useOperation.getState().pushLog(line.level, line.message), step * (i + 1)),
    );
    timers.push(
      window.setTimeout(() => {
        const s = useOperation.getState();
        s.finishBoot();
        s.trigger('session:ready');
      }, step * (lines.length + 1) + (motion ? 500 : 0)),
    );
    // Timers intentionally not cleared: the sequence must complete exactly once per page load.
  }, [motion]);
}
