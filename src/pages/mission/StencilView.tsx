import { useEffect, useRef } from 'react';
import { Icon } from '../../components/common/Icon';
import { modalClose, modalOpen } from '../../features/audio/sfx';
import s from './stencil.module.css';

/**
 * Full-screen image on black, fixed at 513px wide, for laying a paper stencil over the screen.
 * Esc or the exit button closes it.
 */
export function StencilView({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalOpen();
    return modalClose;
  }, []);

  useEffect(() => {
    rootRef.current?.requestFullscreen?.().catch(() => { /* fullscreen denied: the fixed overlay still covers the page */ });
    const onFs = () => !document.fullscreenElement && onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation(); // keep the viewer underneath from closing on Esc
      onClose();
    };
    document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      window.removeEventListener('keydown', onKey, true);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [onClose]);

  return (
    <div ref={rootRef} className={s.root} role="dialog" aria-modal="true" aria-label="Режим чтения">
      <div className={`reg-marks ${s.frame}`}>
        <img className={s.img} src={src} alt={alt} draggable={false} />
      </div>
      <div className={s.bar}>
        <button className={s.btn} onClick={onClose}><Icon name="close" size={14} /> ВЫЙТИ</button>
      </div>
    </div>
  );
}
