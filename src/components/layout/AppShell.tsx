import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Toasts, AccessBanner } from '../common/Toasts';
import s from './layout.module.css';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={s.shell}>
      <a className={s.skip} href="#main">К содержимому</a>
      <TopBar />
      <main id="main" className={s.main}>
        <div className={`${s.page} page-in`}>{children}</div>
      </main>
      <Toasts />
      <AccessBanner />
    </div>
  );
}
