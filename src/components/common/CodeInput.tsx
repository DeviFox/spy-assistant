import { useId, useState, type FormEvent } from 'react';
import s from './code.module.css';

/** Code entry with submit. Shows success / error feedback; error plays the red signal slip. */
export function CodeInput({ label, placeholder = 'Введите код', onSubmit, disabled, mono = true, autoFocus }: {
  label: string;
  placeholder?: string;
  onSubmit: (value: string) => { ok: boolean; message: string };
  disabled?: boolean;
  mono?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string; n: number } | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = onSubmit(value);
    setResult((prev) => ({ ...r, n: (prev?.n ?? 0) + 1 }));
    if (r.ok) setValue('');
  };

  const state = result ? (result.ok ? s.ok : s.err) : '';
  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <label htmlFor={id} className="cap">{label}</label>
      <div key={result && !result.ok ? result.n : 'idle'} className={`${s.row} ${state} ${result && !result.ok ? s.shake : ''}`}>
        <input
          id={id}
          className={`${s.input} ${mono ? 'mono' : ''}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          aria-invalid={result ? !result.ok : undefined}
          aria-describedby={`${id}-msg`}
        />
        <button className={s.submit} type="submit" disabled={disabled || !value.trim()}>SUBMIT</button>
      </div>
      <p id={`${id}-msg`} className={`${s.msg} ${state}`} role="status">
        {result && (
          <span key={result.n} className={result.ok ? undefined : 'slip'} style={{ display: 'inline-block' }}>
            {result.ok ? 'ACCESS GRANTED · ' : 'ACCESS DENIED · '}{result.message}
          </span>
        )}
      </p>
    </form>
  );
}
