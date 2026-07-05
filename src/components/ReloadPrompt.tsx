import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

export function ReloadPrompt() {
  // Check for updates every hour
  const period = 60 * 60 * 1000

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        setInterval(async () => {
          if (r.installing || !navigator) return
          if (('connection' in navigator) && !navigator.onLine) return
          await r.update()
        }, period)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated') {
            setInterval(async () => {
              if (r.installing || !navigator) return
              if (('connection' in navigator) && !navigator.onLine) return
              await r.update()
            }, period)
          }
        })
      }
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5">
      <div className="glass p-4 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-lg)] flex items-start gap-4 max-w-sm">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1">Update Available</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            A new version of Upkeep is ready. Reload to apply changes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              Reload
            </button>
            <button
              onClick={close}
              className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium rounded-lg hover:border-[var(--color-accent)] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button onClick={close} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
