import { WifiIcon, RefreshIcon, ActivityIcon } from '../../components/icons'
import { Badge } from '../../components'

export default function WearableConnect({ 
  fitbitStatus, 
  isSyncing, 
  onFitbitConnect, 
  onFitbitSync, 
  onFitbitDisconnect 
}) {
  return (
    <div className="bg-surface rounded-[var(--radius-xl)] shadow-card overflow-hidden">
      <div className="p-5 border-b border-border/50 bg-gradient-to-br from-surface to-surface-elevated">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <WifiIcon className="w-4 h-4 text-accent" />
          Wearable Devices
        </h3>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          Sync your wearables to automatically keep your health metrics up to date.
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* ── Fitbit Card ── */}
        <div className={`p-4 rounded-2xl border transition-all duration-300
          ${fitbitStatus?.connected 
            ? 'border-accent/40 bg-accent/5' 
            : 'border-border bg-surface hover:border-accent/20'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                ${fitbitStatus?.connected ? 'bg-accent/20' : 'bg-surface-elevated'}`}>
                <ActivityIcon className={`w-5 h-5 ${fitbitStatus?.connected ? 'text-accent' : 'text-text-muted'}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Fitbit</h4>
                <p className="text-[10px] text-text-muted">
                  {fitbitStatus?.connected ? `ID: ${fitbitStatus.fitbit_user_id}` : 'Not connected'}
                </p>
              </div>
            </div>
            {fitbitStatus?.connected ? (
              <Badge variant="success" className="animate-fade-in text-[10px] uppercase font-bold py-1 px-2">Active</Badge>
            ) : (
              <Badge variant="muted" className="text-[10px] uppercase font-bold py-1 px-2">Disconnected</Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {fitbitStatus?.connected ? (
              <>
                <button
                  onClick={onFitbitSync}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 bg-accent text-white text-[11px] uppercase tracking-widest font-bold rounded-xl shadow-[0_4px_12px_rgba(0,210,211,0.25)] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <RefreshIcon className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Data'}
                </button>
                <button
                  onClick={onFitbitDisconnect}
                  className="px-4 py-2.5 bg-danger/10 text-danger text-[11px] uppercase tracking-widest font-bold rounded-xl hover:bg-danger/20 active:scale-[0.98] transition-all"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={onFitbitConnect}
                className="w-full py-2.5 bg-accent text-white text-[11px] uppercase tracking-widest font-bold rounded-xl shadow-[0_4px_12px_rgba(0,210,211,0.25)] hover:bg-accent/90 active:scale-[0.98] transition-all"
              >
                Connect Fitbit
              </button>
            )}
          </div>
        </div>

        {/* ── Google Fit Card ── */}
        <div className="p-4 rounded-2xl border border-border bg-surface-elevated/30 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Google Fit</h4>
                <p className="text-[10px] text-text-muted">Not connected</p>
              </div>
            </div>
            <Badge variant="muted" className="text-[9px] uppercase font-bold py-1 px-2 border border-border">Coming Soon</Badge>
          </div>
          <button
            disabled
            className="w-full py-2.5 bg-surface-elevated text-text-muted text-[11px] uppercase tracking-widest font-bold rounded-xl cursor-not-allowed border border-border/50"
          >
            Connect Google Fit
          </button>
        </div>
        
      </div>
    </div>
  )
}
