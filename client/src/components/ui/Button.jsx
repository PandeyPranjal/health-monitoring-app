/**
 * Reusable Button component.
 *
 * Variants:
 *   - "primary"   — Solid primary button
 *   - "secondary" — Outlined primary button
 *   - "ghost"     — Text-only button
 *   - "danger"    — Red solid button
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ...props
}) {
  const base = `inline-flex items-center justify-center font-semibold
                rounded-[var(--radius-md)] transition-all duration-200
                active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none`

  const variants = {
    primary:   'bg-primary text-white shadow-button hover:bg-primary-dark',
    secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5',
    ghost:     'bg-transparent text-text-secondary hover:bg-surface-elevated',
    danger:    'bg-danger text-white hover:bg-danger/90',
  }

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
