import { useState } from 'react'
import { Car, ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from './Button'
import { AddVehicleForm } from '../features/vehicles/AddVehicleForm'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  const handleVehicleAdded = () => {
    setShowAddVehicle(false)
    setStep(2)
    localStorage.setItem('upkeep-onboarding-complete', 'true')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 glass">
      <div 
        className="w-full max-w-md rounded-3xl p-8 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-3)',
        }}
      >
        {/* Skip button */}
        <button
          onClick={() => {
            localStorage.setItem('upkeep-onboarding-complete', 'true')
            onComplete()
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, var(--tier-good)))',
            }}>
              <Car size={40} className="text-white" />
            </div>
            <h2 className="text-2xl headline text-[var(--color-text-primary)] mb-3">Welcome to Upkeep</h2>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Your personal vehicle maintenance tracker. Know what's due before it's overdue — never miss an oil change, tire rotation, or service again.
            </p>

            <div className="space-y-3 text-left mb-8">
              {[
                'Track all your vehicles in one place',
                'Get smart maintenance reminders',
                'Log fuel fill-ups & track efficiency',
                'Customize service intervals to your needs',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--tier-good)] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <Button variant="primary" fullWidth onClick={() => setStep(1)}>
              Get Started <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Step 1: Add Vehicle Prompt */}
        {step === 1 && !showAddVehicle && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]">
              <Car size={40} className="text-[var(--color-accent)]" />
            </div>
            <h2 className="text-2xl headline text-[var(--color-text-primary)] mb-3">Add Your First Vehicle</h2>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Let's start by adding your car, motorcycle, or scooter. Don't worry — you can always edit the details later!
            </p>
            <Button variant="primary" fullWidth onClick={() => setShowAddVehicle(true)}>
              Add Vehicle <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Step 2: Celebration */}
        {step === 2 && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, var(--tier-good), color-mix(in srgb, var(--tier-good) 70%, var(--color-accent)))',
            }}>
              <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-2xl headline text-[var(--color-text-primary)] mb-3">You're All Set! 🎉</h2>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Your vehicle has been added! Head to the Dashboard to see your maintenance schedule, or explore the app at your own pace.
            </p>
            <Button variant="primary" fullWidth onClick={onComplete}>
              Go to Dashboard <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: step === i ? 24 : 8,
                height: 8,
                backgroundColor: step === i ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Embedded AddVehicleForm */}
      {showAddVehicle && (
        <AddVehicleForm onClose={handleVehicleAdded} />
      )}
    </div>
  )
}
