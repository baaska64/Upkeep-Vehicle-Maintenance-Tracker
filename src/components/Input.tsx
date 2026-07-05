import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const wrapperStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      letterSpacing: '-0.01em',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: '10px 14px',
      fontSize: '15px',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-text-primary)',
      backgroundColor: 'var(--color-surface)',
      border: `1px solid ${error ? 'var(--tier-warn)' : focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      boxShadow: focused && !error ? '0 0 0 2px var(--color-accent)' : focused && error ? '0 0 0 2px var(--tier-warn)' : 'none',
      transition: `all var(--transition-base) var(--ease-out)`,
      ...style,
    };

    const errorStyle: React.CSSProperties = {
      fontSize: '12px',
      color: 'var(--tier-warn)',
      fontWeight: 500,
    };

    return (
      <div style={wrapperStyle} className={className}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={inputStyle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {error && <span style={errorStyle}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
