import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)' },
  md: { padding: '10px 20px', fontSize: '15px', borderRadius: 'var(--radius-md)' },
  lg: { padding: '14px 28px', fontSize: '17px', borderRadius: 'var(--radius-md)' },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent)',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    border: '1px solid transparent',
  },
};

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: `all var(--transition-base) var(--ease-out)`,
    width: fullWidth ? '100%' : undefined,
    userSelect: 'none',
    outline: 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) return;
    const el = e.currentTarget;
    el.style.transform = 'translateY(-1px)';
    el.style.boxShadow = 'var(--shadow-2)';
    if (variant === 'primary') {
      el.style.backgroundColor = 'var(--color-accent-hover)';
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    el.style.transform = 'translateY(0)';
    el.style.boxShadow = 'none';
    if (variant === 'primary') {
      el.style.backgroundColor = 'var(--color-accent)';
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) return;
    e.currentTarget.style.transform = 'scale(0.98)';
  }

  function handleMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) return;
    e.currentTarget.style.transform = 'translateY(-1px)';
  }

  return (
    <button
      disabled={isDisabled}
      className={className}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
