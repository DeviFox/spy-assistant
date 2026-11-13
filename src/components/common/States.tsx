import type { ReactNode } from 'react';
import { Icon } from './Icon';
import s from './common.module.css';

export function EmptyState({ code = 'DATA NOT FOUND', message, children }: { code?: string; message: string; children?: ReactNode }) {
  return (
    <div className={s.empty} role="status">
      <span className={`${s.emptyCode} mono`}>{code}</span>
      <p className={s.emptyMsg}>{message}</p>
      {children}
    </div>
  );
}

export function LockedState({ code = 'LOCKED', message }: { code?: string; message: string }) {
  return (
    <div className={`${s.empty} ${s.locked}`} role="status">
      <Icon name="lock" size={20} className={s.lockIcon} />
      <span className={`${s.emptyCode} mono`}>{code}</span>
      <p className={s.emptyMsg}>{message}</p>
    </div>
  );
}

export function PageHeader({ title, meta, children }: { title: string; meta?: string; children?: ReactNode }) {
  return (
    <header className={s.pageHeader}>
      <div>
        <h1 className={s.pageTitle}>{title}</h1>
        {meta && <p className={s.pageMeta}>{meta}</p>}
      </div>
      {children && <div className={s.pageAside}>{children}</div>}
    </header>
  );
}

/** A titled region with a thin header strip. The panel label is a technical caption, not an eyebrow. */
export function Panel({ label, aside, children, className, bodyClassName }: {
  label: string; aside?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string;
}) {
  return (
    <section className={`${s.panel} ${className ?? ''}`} aria-label={label}>
      <header className={s.panelHead}>
        <h2 className={s.panelLabel}>{label}</h2>
        {aside && <div className={s.panelAside}>{aside}</div>}
      </header>
      <div className={`${s.panelBody} ${bodyClassName ?? ''}`}>{children}</div>
    </section>
  );
}
