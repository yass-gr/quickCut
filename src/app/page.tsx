"use client"

import { WizardProvider } from "@/context/WizardContext"
import { MatchSelector } from "@/components/wizard/MatchSelector"
import { PreviewPlayer } from "@/components/wizard/PreviewPlayer"
import { RenderQueue } from "@/components/wizard/RenderQueue"
import { SettingsPanel } from "@/components/wizard/SettingsPanel"

export default function Home() {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-background p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-flick text-white">QuickCut</h1>
          <p className="text-xs text-gray font-mono">Football Video Factory</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4">
            <SettingsPanel />
            <RenderQueue />
          </div>

          <div>
            <PreviewPlayer />
          </div>

          <div>
            <MatchSelector />
          </div>
        </div>
      </div>
    </WizardProvider>
  )
}
