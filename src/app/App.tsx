import { useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { DevPanel } from '../components/dev/DevPanel';
import { LoginScreen } from '../components/login/LoginScreen';
import { MissionPage } from '../pages/mission/MissionPage';
import { Viewer } from '../pages/mission/Viewer';
import { Incoming } from '../pages/mission/Incoming';
import { Finale } from '../pages/mission/Finale';
import { AlarmEvent } from '../components/alarm/AlarmEvent';
import { useBootSequence } from '../features/terminal/useBootSequence';
import { useOperation } from '../store/operationStore';
import { duckAmbient, logBlip, startAmbient } from '../features/audio/sfx';

function Boot() {
  useBootSequence();
  return null;
}

function Runtime() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('dev')) useOperation.getState().setDevOpen(true);
  }, []);

  // Atmosphere: background track from the first gesture (browser autoplay rule), console blips, ducking under the alarm.
  useEffect(() => {
    const start = () => startAmbient();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    let lastBlip = 0;
    const unsub = useOperation.subscribe((s, prev) => {
      if (s.alarmOnScreen !== prev.alarmOnScreen) duckAmbient(s.alarmOnScreen);
      if (s.logs.length > prev.logs.length && performance.now() - lastBlip > 60) {
        lastBlip = performance.now();
        logBlip(s.logs[s.logs.length - 1].type);
      }
    });
    return () => {
      unsub();
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  return null;
}

export function App() {
  const identity = useOperation((s) => s.identity);
  return (
    <>
      <Runtime />
      {identity ? <Console /> : <LoginScreen />}
      <DevPanel />
    </>
  );
}

function Console() {
  return (
    <>
      <Boot />
      <AppShell>
        <MissionPage />
      </AppShell>
      <Viewer />
      <Incoming />
      <AlarmEvent />
      <Finale />
    </>
  );
}
