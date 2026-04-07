/**
 * Badge component for status indicators, counts, and labels.
 */
export default function Badge({
  variant = 'default',
  children,
  className = '',
}) {
  const base = 'inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-full'

  const variants = {
    default:  'bg-primary/10 text-primary',
    success:  'bg-success/15 text-success',
    warning:  'bg-warning/15 text-warning',
    danger:   'bg-danger/15 text-danger',
    muted:    'bg-surface-elevated text-text-muted',
  }

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
