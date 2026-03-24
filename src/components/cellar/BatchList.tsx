import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, AlertTriangle, ArrowRight, Plus, ChevronDown } from 'lucide-react'
import { useStore } from '@/store'
import { formatDate } from '@/utils/ids'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { StartFermentModal } from './StartFermentModal'
import { ActionModal } from './ActionModal'
import type { Batch } from '@/types'

export function BatchList() {
  const navigate = useNavigate()
  const { picks, batches, parcels } = useStore()
  const [startFermentPickId, setStartFermentPickId] = useState<string | null>(null)
  const [actionBatchId, setActionBatchId] = useState<string | null>(null)
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pendingPicks = picks.filter((p) => !p.fermentStarted)
  const getParcel = (id: string) => parcels.find((p) => p.id === id)
  const activeBatches = batches.filter((b) => b.status === 'active')

  const filtered = batches
    .filter((b) => filterStatus === 'all' || b.status === filterStatus)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  // Close dropdown on outside click
  useEffect(() => {
    if (!batchDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBatchDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [batchDropdownOpen])

  const handleSelectBatch = (batchId: string) => {
    setBatchDropdownOpen(false)
    setActionBatchId(batchId)
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-10 pt-10 pb-0 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1814]">Cellar</h1>
          <p className="text-sm font-sans text-[#6B6560] mt-1">
            {activeBatches.length} active · {batches.length} total batches
          </p>
        </div>

        {/* + Add Action — always visible, click-controlled batch picker */}
        <div className="mt-1 relative" ref={dropdownRef}>
          <button
            onClick={() => setBatchDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1814] text-white text-sm font-sans font-medium rounded-[3px] hover:bg-[#2A2420] transition-colors duration-150 cursor-pointer"
          >
            <Plus size={15} />
            Add Action
            <ChevronDown size={13} className={`transition-transform duration-150 ${batchDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {batchDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-[#E5DED6] rounded-[4px] z-30"
              style={{ boxShadow: '0 4px 24px rgba(26,24,20,0.12)' }}>
              <p className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-[#A8A29E] border-b border-[#F0EBE3]">
                Select batch
              </p>
              {activeBatches.length === 0 ? (
                <div className="px-4 py-4 text-xs font-sans text-[#A8A29E] text-center">
                  No active batches yet.<br />
                  <span className="text-[#C9BEB5]">Log a pick in Vineyard to start a ferment.</span>
                </div>
              ) : (
                activeBatches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBatch(b.id)}
                    className="w-full text-left px-4 py-3 hover:bg-[#F8F5F0] transition-colors cursor-pointer border-b border-[#F8F5F0] last:border-0"
                  >
                    <span className="font-mono text-xs text-[#B85C38] block">{b.batchId}</span>
                    <span className="text-sm font-sans text-[#1A1814]">
                      {b.nickname || getParcel(b.parcelId)?.name || '—'}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending ferment action banners */}
      {pendingPicks.length > 0 && (
        <div className="mx-10 mt-6 space-y-2">
          {pendingPicks.map((pick) => {
            const parcel = getParcel(pick.parcelId)
            return (
              <div key={pick.id} className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-[3px]">
                <AlertTriangle size={15} className="text-yellow-600 flex-shrink-0" />
                <p className="text-sm font-sans text-yellow-800 flex-1">
                  <span className="font-medium">Ready to start ferment:</span>{' '}
                  {parcel?.name ?? 'Unknown'} — picked {formatDate(pick.date)} — {pick.netWeight}kg net
                </p>
                <Button size="sm" variant="primary" onClick={() => setStartFermentPickId(pick.id)}>
                  Start Ferment
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="px-10 mt-6 flex items-center gap-1">
        {(['all', 'active', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
              filterStatus === s
                ? 'bg-[#1A1814] text-white'
                : 'text-[#6B6560] hover:text-[#1A1814] hover:bg-[#F0EBE3]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Batch list */}
      <div className="px-10 mt-4 pb-12">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E5DED6] rounded-[4px] p-12 text-center">
            <FlaskConical size={32} className="text-[#E5DED6] mx-auto mb-3" />
            <p className="text-sm font-sans text-[#A8A29E]">
              {batches.length === 0
                ? 'No batches yet. Log a vineyard pick to start a ferment.'
                : 'No batches matching this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((batch) => (
              <BatchRow
                key={batch.id}
                batch={batch}
                parcelName={getParcel(batch.parcelId)?.name}
                onClick={() => navigate(`/cellar/${batch.id}`)}
                onAddAction={(e) => { e.stopPropagation(); setActionBatchId(batch.id) }}
              />
            ))}
          </div>
        )}
      </div>

      {startFermentPickId && (
        <StartFermentModal
          open={!!startFermentPickId}
          pickId={startFermentPickId}
          onClose={() => setStartFermentPickId(null)}
        />
      )}
      {actionBatchId && (
        <ActionModal
          open={!!actionBatchId}
          batchId={actionBatchId}
          onClose={() => setActionBatchId(null)}
        />
      )}
    </div>
  )
}

function BatchRow({
  batch, parcelName, onClick, onAddAction
}: {
  batch: Batch
  parcelName?: string
  onClick: () => void
  onAddAction: (e: React.MouseEvent) => void
}) {
  const lastLog = [...batch.dailyLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E5DED6] rounded-[4px] px-5 py-4 cursor-pointer hover:border-[#C9BEB5] transition-colors duration-150 group flex items-center gap-4"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${batch.status === 'active' ? 'bg-[#B85C38]' : 'bg-[#C9BEB5]'}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-medium text-[#1A1814]">{batch.batchId}</span>
          {batch.nickname && <span className="text-sm font-sans text-[#6B6560]">— {batch.nickname}</span>}
        </div>
        <p className="text-xs font-sans text-[#A8A29E] mt-0.5">
          {parcelName} · {batch.vesselType === 'tank' ? 'Tank' : 'Barrel'} · Started {formatDate(batch.startDate)}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {lastLog && (
          <div className="flex items-center gap-4 text-xs font-mono text-[#6B6560]">
            {lastLog.ph !== null && <span>pH {lastLog.ph}</span>}
            {lastLog.baume !== null && <span>{lastLog.baume}° Be</span>}
            {lastLog.temperature !== null && <span>{lastLog.temperature}°C</span>}
          </div>
        )}
        <Badge variant={batch.status === 'active' ? 'accent' : 'muted'}>{batch.status}</Badge>
        {batch.status === 'active' && (
          <button
            onClick={onAddAction}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#B85C38] border border-[#E5C4B6] rounded-[2px] hover:bg-[#F0E6E0] transition-all cursor-pointer"
          >
            <Plus size={11} /> Action
          </button>
        )}
        <ArrowRight size={14} className="text-[#E5DED6] group-hover:text-[#A8A29E] transition-colors" />
      </div>
    </div>
  )
}
