import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '@/store'
import { SummaryCards } from './SummaryCards'
import { ActivityFeed } from './ActivityFeed'
import { WorksheetBuilder } from './WorksheetBuilder'

export function Overview() {
  const [worksheetOpen, setWorksheetOpen] = useState(false)
  const picks = useStore((s) => s.picks)
  const batches = useStore((s) => s.batches)

  const pendingFerments = picks.filter((p) => !p.fermentStarted).length
  const activeBatches = batches.filter((b) => b.status === 'active').length

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="px-10 pt-10 pb-0 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-[#A8A29E] uppercase tracking-widest mb-2">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-3xl font-serif text-[#1A1814]">Overview</h1>
        </div>
        <button
          onClick={() => setWorksheetOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B85C38] text-white text-sm font-sans font-medium rounded-[3px] hover:bg-[#A04E2E] transition-colors duration-150 cursor-pointer mt-1"
        >
          <Plus size={15} />
          Today's Worksheet
        </button>
      </div>

      {/* Alerts */}
      {pendingFerments > 0 && (
        <div className="mx-10 mt-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-[3px] flex items-center gap-3">
          <span className="text-yellow-600 text-sm">⚠</span>
          <p className="text-sm font-sans text-yellow-800">
            <span className="font-medium">{pendingFerments} {pendingFerments === 1 ? 'pick' : 'picks'}</span> awaiting ferment start in Cellar.
          </p>
          <a href="/cellar" className="ml-auto text-xs font-mono text-yellow-700 hover:text-yellow-900 border-b border-yellow-400 transition-colors">
            Go to Cellar →
          </a>
        </div>
      )}

      {/* Active ferments indicator */}
      {activeBatches > 0 && (
        <div className="mx-10 mt-3 px-4 py-3 bg-[#E8EDE5] border border-[#C5D0BE] rounded-[3px] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#7A8C6E] animate-pulse" />
          <p className="text-sm font-sans text-[#4A6040]">
            <span className="font-medium">{activeBatches} active {activeBatches === 1 ? 'ferment' : 'ferments'}</span> in progress.
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="px-10 mt-8">
        <SummaryCards />
      </div>

      {/* Activity feed */}
      <div className="px-10 mt-8 pb-12">
        <ActivityFeed />
      </div>

      {/* Worksheet builder modal */}
      <WorksheetBuilder open={worksheetOpen} onClose={() => setWorksheetOpen(false)} />
    </div>
  )
}
