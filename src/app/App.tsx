import { useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { DevPanel } from '../components/dev/DevPanel';
import { LoginScreen } from '../components/login/LoginScreen';
import { MissionPage } from '../pages/mission/MissionPage';
import { Viewer } from '../pages/mission/Viewer';
import { Incoming } from '../pages/mission/Incoming';
import { AlarmEvent } from '../components/alarm/AlarmEvent';
import { useBootSequence } from '../features/terminal/useBootSequence';
import { useMotionEnabled } from '../features/operation/useMotion';
import { useOperation } from '../store/operationStore';

function Boot() {
  useBootSequence();
  return null;
}

function Runtime() {
  const motion = useMotionEnabled();

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
  }, [motion]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('dev')) useOperation.getState().setDevOpen(true);
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
    </>
  );
}
