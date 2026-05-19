import { cn } from "@/lib/utils";

/**
 * Lightweight labelled-field shell used by all 6 Lab forms.
 * Avoids pulling in a 3rd-party form lib for day 1.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[var(--color-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed",
        props.className,
      )}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[88px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)] resize-y disabled:opacity-60 disabled:cursor-not-allowed",
        props.className,
      )}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full text-left flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 hover:border-[var(--color-brand)] transition-colors",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <span className="flex-1">
        <span className="block text-sm font-medium text-[var(--color-text)]">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-[var(--color-muted)] mt-0.5">
            {description}
          </span>
        )}
      </span>
      <span
        className={cn(
          "shrink-0 w-9 h-5 rounded-full p-0.5 transition-colors mt-0.5",
          checked ? "bg-[var(--color-brand)]" : "bg-[var(--color-border)]",
        )}
      >
        <span
          className={cn(
            "block w-4 h-4 bg-white rounded-full transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
    </button>
  );
}
