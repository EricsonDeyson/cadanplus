import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 outline-none transition focus:border-cadan-blue-500 ' +
  'focus:ring-2 focus:ring-cadan-blue-500/25';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, className = '', ...props }: FieldProps) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input id={id} className={`${INPUT_CLASS} ${className}`} {...props} />
    </label>
  );
}

export function PasswordField({ label, id, className = '', ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${INPUT_CLASS} pr-11 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  );
}

export function SuccessAlert({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
      {message}
    </p>
  );
}
