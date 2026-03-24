import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { useStore } from '@/store'
import { formatDate, uid } from '@/utils/ids'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/FormField'
import { AddPickModal } from './AddPickModal'
import { AddTaskModal } from './AddTaskModal'

export function ParcelDetail() {
  const { parcelId } = useParams<{ parcelId: string }>()
  const navigate = useNavigate()
  const {
    parcels, picks, vineyardTasks, batches,
    updateParcel, addSeasonRecord, deleteSeasonRecord
  } = useStore()

  const parcel = parcels.find((p) => p.id === parcelId)
  const [showPickModal, setShowPickModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [addingSeason, setAddingSeason] = useState(false)
  const [newSeason, setNewSeason] = useState({ year: String(new Date().getFullYear()), grossTonnage: '', netTonnage: '', notes: '' })

  if (!parcel) {
    return (
      <div className="px-10 pt-10">
        <p className="text-sm font-sans text-[#A8A29E]">Parcel not found.</p>
      </div>
    )
  }

  const parcelPicks = picks.filter((p) => p.parcelId === parcel.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const parcelTasks = vineyardTasks.filter((t) => t.parcelId === parcel.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const parcelBatches = batches.filter((b) => b.parcelId === parcel.id)

  // Build timeline
  type TimelineEntry = { id: string; date: string; type: string; description: string }
  const timeline: TimelineEntry[] = [
    ...parcelPicks.map((p) => ({
      id: p.id, date: p.date, type: 'Pick',
      description: `Pick — ${p.grossWeight}kg gross / ${p.netWeight}kg net  ·  pH ${p.ph}  ·  Baume ${p.baume}`
    })),
    ...parcelTasks.map((t) => ({
      id: t.id, date: t.date, type: t.type, description: `${t.type}${t.notes ? ` — ${t.notes}` : ''}`
    })),
    ...parcelBatches.map((b) => ({
      id: b.id, date: b.startDate, type: 'Ferment',
      description: `Ferment started: ${b.batchId}${b.nickname ? ` — ${b.nickname}` : ''}`
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const startEdit = (field: string, value: string) => {
    setEditingField(field)
    setEditValues({ [field]: value })
  }

  const saveEdit = (field: keyof typeof parcel) => {
    const val = editValues[field]
    const numFields = ['surfaceArea', 'vinesPlanted', 'yearPlanted']
    updateParcel(parcel.id, { [field]: numFields.includes(field as string) ? parseFloat(val) || 0 : val })
    setEditingField(null)
  }

  const handleAddSeason = () => {
    if (!newSeason.year) return
    addSeasonRecord(parcel.id, {
      id: uid(),
      year: parseInt(newSeason.year),
      grossTonnage: parseFloat(newSeason.grossTonnage) || 0,
      netTonnage: parseFloat(newSeason.netTonnage) || 0,
      notes: newSeason.notes,
    })
    setAddingSeason(false)
    setNewSeason({ year: String(new Date().getFullYear()), grossTonnage: '', netTonnage: '', notes: '' })
  }

  const EditableField = ({ label, field, value, type = 'text' }: { label: string; field: string; value: string | number; type?: string }) => {
    const isEditing = editingField === field
    return (
      <div className="flex items-center justify-between py-3 border-b border-[#F0EBE3] group">
        <span className="text-xs font-mono uppercase tracking-wider text-[#A8A29E] w-32">{label}</span>
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 ml-4">
            <Input
              type={type}
              value={editValues[field] ?? ''}
              onChange={(e) => setEditValues({ [field]: e.target.value })}
              autoFocus
              className="flex-1 py-1"
            />
            <button onClick={() => saveEdit(field as keyof typeof parcel)} className="text-[#7A8C6E] hover:text-green-600 cursor-pointer"><Check size={14} /></button>
            <button onClick={() => setEditingField(null)} className="text-[#A8A29E] hover:text-red-500 cursor-pointer"><X size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 ml-4 justify-end">
            <span className="text-sm font-sans text-[#1A1814]">{value || '—'}</span>
            <button
              onClick={() => startEdit(field, String(value))}
              className="opacity-0 group-hover:opacity-100 text-[#C9BEB5] hover:text-[#B85C38] transition-all cursor-pointer"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-full">
      {/* Back header */}
      <div className="px-10 pt-8 pb-0">
        <button
          onClick={() => navigate('/vineyard')}
          className="flex items-center gap-2 text-xs font-mono text-[#A8A29E] hover:text-[#1A1814] transition-colors mb-5 cursor-pointer"
        >
          <ArrowLeft size={13} /> Back to Vineyard
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-[#A8A29E] mb-1">{parcel.parcelId}</p>
            <h1 className="text-3xl font-serif text-[#1A1814]">{parcel.name}</h1>
            <p className="text-sm font-sans text-[#6B6560] mt-1">{parcel.clone}</p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button size="sm" variant="secondary" onClick={() => setShowPickModal(true)}>
              <Plus size={13} /> Log Pick
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowTaskModal(true)}>
              <Plus size={13} /> Add Task
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4">
          <Badge variant="sage">{parcel.surfaceArea} ha</Badge>
          <Badge variant="muted">{parcel.vinesPlanted.toLocaleString()} vines</Badge>
          <Badge variant="muted">Planted {parcel.yearPlanted}</Badge>
          {parcelBatches.length > 0 && <Badge variant="accent">{parcelBatches.length} batch{parcelBatches.length > 1 ? 'es' : ''}</Badge>}
        </div>
      </div>

      <div className="px-10 mt-8 pb-12 grid grid-cols-5 gap-8">
        {/* Left: details */}
        <div className="col-span-3 space-y-8">
          {/* Parcel details */}
          <section>
            <h3 className="text-sm font-serif text-[#1A1814] mb-2">Parcel Details</h3>
            <div className="bg-white border border-[#E5DED6] rounded-[4px] px-4">
              <EditableField label="Name" field="name" value={parcel.name} />
              <EditableField label="Parcel ID" field="parcelId" value={parcel.parcelId} />
              <EditableField label="Clone" field="clone" value={parcel.clone} />
              <EditableField label="Surface Area" field="surfaceArea" value={parcel.surfaceArea} type="number" />
              <EditableField label="Vines Planted" field="vinesPlanted" value={parcel.vinesPlanted} type="number" />
              <EditableField label="Year Planted" field="yearPlanted" value={parcel.yearPlanted} type="number" />
              <EditableField label="GPS" field="gps" value={parcel.gps} />
            </div>
          </section>

          {/* Historical data */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-serif text-[#1A1814]">Historical Seasons</h3>
              <Button size="sm" variant="ghost" onClick={() => setAddingSeason(true)}>
                <Plus size={13} /> Add Season
              </Button>
            </div>
            <div className="bg-white border border-[#E5DED6] rounded-[4px] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0EBE3]">
                    {['Year', 'Gross (t)', 'Net (t)', 'Notes', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#A8A29E]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parcel.historicalData.sort((a, b) => b.year - a.year).map((row) => (
                    <tr key={row.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7]">
                      <td className="px-4 py-3 font-mono text-[#1A1814]">{row.year}</td>
                      <td className="px-4 py-3 font-mono text-[#1A1814]">{row.grossTonnage}</td>
                      <td className="px-4 py-3 font-mono text-[#1A1814]">{row.netTonnage}</td>
                      <td className="px-4 py-3 font-sans text-[#6B6560] text-xs">{row.notes}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteSeasonRecord(parcel.id, row.id)} className="text-[#E5DED6] hover:text-red-400 transition-colors cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {addingSeason && (
                    <tr className="border-b border-[#F0EBE3] bg-[#FDFAF7]">
                      <td className="px-3 py-2"><Input type="number" value={newSeason.year} onChange={(e) => setNewSeason((s) => ({ ...s, year: e.target.value }))} className="w-20 py-1" /></td>
                      <td className="px-3 py-2"><Input type="number" step="0.1" value={newSeason.grossTonnage} onChange={(e) => setNewSeason((s) => ({ ...s, grossTonnage: e.target.value }))} className="w-20 py-1" /></td>
                      <td className="px-3 py-2"><Input type="number" step="0.1" value={newSeason.netTonnage} onChange={(e) => setNewSeason((s) => ({ ...s, netTonnage: e.target.value }))} className="w-20 py-1" /></td>
                      <td className="px-3 py-2"><Input value={newSeason.notes} onChange={(e) => setNewSeason((s) => ({ ...s, notes: e.target.value }))} className="py-1" /></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={handleAddSeason} className="text-[#7A8C6E] hover:text-green-600 cursor-pointer"><Check size={14} /></button>
                          <button onClick={() => setAddingSeason(false)} className="text-[#A8A29E] cursor-pointer"><X size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {parcel.historicalData.length === 0 && !addingSeason && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs font-sans text-[#A8A29E]">No historical data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: activity timeline */}
        <div className="col-span-2">
          <h3 className="text-sm font-serif text-[#1A1814] mb-2">Activity Timeline</h3>
          {timeline.length === 0 ? (
            <div className="bg-white border border-[#E5DED6] rounded-[4px] p-6 text-center">
              <p className="text-xs font-sans text-[#A8A29E]">No activity logged for this parcel.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-[#E5DED6]" />
              <div className="space-y-0">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex gap-4 pl-8 relative pb-5">
                    <div className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-white border border-[#C9BEB5]" />
                    <div className="flex-1">
                      <p className="text-xs font-mono text-[#A8A29E]">{formatDate(entry.date)}</p>
                      <Badge variant={entry.type === 'Pick' ? 'accent' : entry.type === 'Ferment' ? 'sage' : 'muted'} >
                        {entry.type}
                      </Badge>
                      <p className="text-xs font-sans text-[#6B6560] mt-1">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPickModal open={showPickModal} onClose={() => setShowPickModal(false)} defaultParcelId={parcel.id} />
      <AddTaskModal open={showTaskModal} onClose={() => setShowTaskModal(false)} defaultParcelId={parcel.id} />
    </div>
  )
}
