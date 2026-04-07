import { ChevronRightIcon } from '../icons'

/**
 * Reusable Card component for stats, info panels, and content blocks.
 *
 * Variants:
 *   - "default"  — White card with subtle shadow
 *   - "gradient" — Gradient background (for hero/featured cards)
 *   - "outlined" — Border-only card
 *
 * Props:
 *   - icon       — React element for the top-left icon
 *   - iconBg     — Tailwind bg class for icon container (e.g., "bg-primary/10")
 *   - title      — Card title text
 *   - value      — Large display value (e.g., "72 bpm")
 *   - subtitle   — Secondary text below value
 *   - trend      — "up" | "down" | null — shows trend indicator
 *   - trendValue — e.g., "+3%"
 *   - onClick    — Makes card interactive/clickable
 *   - children   — Custom content
 *   - className  — Additional classes
 */
export default function Card({
  variant = 'default',
  icon,
  iconBg = 'bg-primary/10',
  title,
  value,
  subtitle,
  trend,
  trendValue,
  onClick,
  children,
  className = '',
}) {
  const baseClasses = 'rounded-[var(--radius-lg)] p-4 transition-all duration-200'

  const variantClasses = {
    default: 'bg-surface shadow-card hover:shadow-card-hover',
    gradient: 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-button',
    outlined: 'bg-surface border border-border hover:border-primary/30',
  }

  const isClickable = !!onClick
  const clickableClasses = isClickable
    ? 'cursor-pointer active:scale-[0.98]'
    : ''

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Header row: icon + title + optional chevron */}
      {(icon || title) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center ${iconBg}`}>
                {icon}
              </div>
            )}
            {title && (
              <span className={`text-sm font-semibold ${variant === 'gradient' ? 'text-white/90' : 'text-text-secondary'}`}>
                {title}
              </span>
            )}
          </div>
          {isClickable && (
            <ChevronRightIcon className={`w-4 h-4 ${variant === 'gradient' ? 'text-white/50' : 'text-text-muted'}`} />
          )}
        </div>
      )}

      {/* Value display */}
      {value && (
        <div className="flex items-end gap-2 mb-1">
          <span className={`text-2xl font-bold leading-none ${variant === 'gradient' ? 'text-white' : 'text-text-primary'}`}>
            {value}
          </span>
          {trend && trendValue && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full
              ${trend === 'up'   ? 'bg-success/15 text-success' : ''}
              ${trend === 'down' ? 'bg-danger/15 text-danger' : ''}
            `}>
              {trendValue}
            </span>
          )}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className={`text-xs ${variant === 'gradient' ? 'text-white/60' : 'text-text-muted'}`}>
          {subtitle}
        </p>
      )}

      {/* Custom content */}
      {children}
    </div>
  )
}
