import { useState, type ReactNode, type CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, hover = false, onClick, className = '', style }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const isInteractive = hover || !!onClick;

  const cardStyle: CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: hovered && isInteractive ? 'var(--shadow-2)' : 'var(--shadow-1)',
    padding: '20px',
    transition: `all var(--transition-base) var(--ease-out)`,
    transform: hovered && isInteractive ? 'translateY(-2px)' : 'translateY(0)',
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => isInteractive && setHovered(true)}
      onMouseLeave={() => isInteractive && setHovered(false)}
    >
      {children}
    </div>
  );
}
