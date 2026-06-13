"use client"

import { Suspense } from "react"
import { WizardProvider, STEP_ORDER, STEP_LABELS, useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StepMatch } from "@/components/wizard/StepMatch"
import { StepBackground } from "@/components/wizard/StepBackground"
import { StepTemplate } from "@/components/wizard/StepTemplate"
import { StepAudio } from "@/components/wizard/StepAudio"
import { StepPreview } from "@/components/wizard/StepPreview"
import { StepDownload } from "@/components/wizard/StepDownload"
import type { WizardStep } from "@/types"

const stepComponents: Record<WizardStep, React.FC> = {
  match: StepMatch,
  background: StepBackground,
  template: StepTemplate,
  audio: StepAudio,
  preview: StepPreview,
  download: StepDownload,
}

function WizardContent() {
  const { step, goToStep, nextStep, prevStep, isFirstStep, isLastStep } = useWizard()
  const StepComponent = stepComponents[step]
  const stepIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#030803" }}>
      {/* Header */}
      <header className="border-b px-6 py-4" style={{ borderColor: "#1b4d1b" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl" style={{ fontFamily: "Flick, sans-serif", color: "#ffffff" }}>
            QuickCut
          </h1>
          <span className="text-xs font-mono" style={{ color: "#a3a3a3" }}>
            Step {stepIndex + 1} of {STEP_ORDER.length}
          </span>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="border-b px-6 py-3" style={{ borderColor: "#1b4d1b" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-0">
          {STEP_ORDER.map((s, i) => {
            const isActive = s === step
            const isPast = i < stepIndex
            return (
              <button
                key={s}
                onClick={() => goToStep(s)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors",
                  isActive && "text-primary",
                  isPast && "text-green2",
                  !isActive && !isPast && "text-gray"
                )}
                style={isActive ? { color: "#00ff41" } : isPast ? { color: "#5CFF6A" } : { color: "#a3a3a3" }}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
                  isActive && "border-primary bg-primary/10",
                  isPast && "border-green2 bg-green2/10",
                  !isActive && !isPast && "border-gray"
                )}>
                  {isPast ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
                {i < STEP_ORDER.length - 1 && (
                  <span className="mx-1 opacity-30">→</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <StepComponent />
        </div>
      </main>

      {/* Navigation */}
      <footer className="border-t px-6 py-4" style={{ borderColor: "#1b4d1b" }}>
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep}
            className="font-mono text-xs"
            style={{ borderColor: "#1b4d1b", color: isFirstStep ? "#1b4d1b" : "#00ff41" }}
          >
            ← Back
          </Button>
          {!isLastStep ? (
            <Button
              onClick={nextStep}
              className="font-mono text-xs"
              style={{ background: "#00ff41", color: "#000" }}
            >
              Continue →
            </Button>
          ) : null}
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <WizardProvider>
        <WizardContent />
      </WizardProvider>
    </Suspense>
  )
}
