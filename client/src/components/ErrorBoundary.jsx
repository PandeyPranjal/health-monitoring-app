import { Component } from 'react'

/**
 * Global Error Boundary to catch UI rendering crashes.
 * Prevents the application from white-screening.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background text-center animate-fade-in">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
            {/* Alert / Warning Icon */}
            <svg 
              className="w-8 h-8 text-danger" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">Something went wrong</h1>
          <p className="text-sm text-text-muted mb-8 max-w-[280px]">
            We experienced an unexpected error while loading this layout. Please try refreshing the page.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white text-[11px] uppercase tracking-widest font-bold rounded-xl shadow-[0_4px_12px_rgba(108,92,231,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Reload Details
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
