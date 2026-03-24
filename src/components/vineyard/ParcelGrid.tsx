import { useState } from 'react'
import { Plus, Sprout, ArrowRight, Calendar, Edit2 } from 'lucide-react'
import { useStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/utils/ids'
import { Badge } from '@/components/shared/Badge'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input } from '@/components/shared/FormField'
import { AddParcelModal } from './AddParcelModal'
import { AddPickModal } from './AddPickModal'
import { AddTaskModal } from './AddTaskModal'
import type { Parcel } from '@/types'

export function ParcelGrid() {
  const navigate = useNavigate()
  const { parcels, picks, vineyardTasks, updateParcel } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAddParcel, setShowAddParcel] = useState(false)
  const [showAddPick, setShowAddPick] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null)
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'parcelId' | 'clone'>('name')

  const getLastPick = (parcelId: string) => {
    const parcelPicks = picks.filter((p) => p.parcelId === parcelId)
    return parcelPicks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const getLastActivity = (parcelId: string) => {
    const lastPick = getLastPick(parcelId)
    const lastTask = vineyardTasks
      .filter((t) => t.parcelId === parcelId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const items = [lastPick, lastTask].filter(Boolean)
    if (items.length === 0) return null
    return items.sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime())[0]
  }

  const filtered = parcels
    .filter((p) =>
      filter === '' ||
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.parcelId.toLowerCase().includes(filter.toLowerCase()) ||
      p.clone.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'parcelId') return a.parcelId.localeCompare(b.parcelId)
      if (sortBy === 'clone') return a.clone.localeCompare(b.clone)
      return 0
    })

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-10 pt-10 pb-0 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-[#A8A29E] uppercase tracking-widest mb-2">Contrada</p>
          <h1 className="text-3xl font-serif text-[#1A1814]">Vineyard</h1>
          <p className="text-sm font-sans text-[#6B6560] mt-1">{parcels.length} parcels registered</p>
        </div>
        <div className="relative mt-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1814] text-white text-sm font-sans font-medium rounded-[3px] hover:bg-[#2A2420] transition-colors duration-150 cursor-pointer"
          >
            <Plus size={15} />
            Add
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5DED6] rounded-[4px] shadow-lg z-20">
              {[
                { label: 'Add Parcel', action: () => { setShowAddParcel(true); setMenuOpen(false) } },
                { label: 'Log Pick', action: () => { setShowAddPick(true); setMenuOpen(false) } },
                { label: 'Add Task', action: () => { setShowAddTask(true); setMenuOpen(false) } },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full text-left px-4 py-2.5 text-sm font-sans text-[#1A1814] hover:bg-[#F8F5F0] transition-colors cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-10 mt-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search parcels..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm font-sans bg-white border border-[#E5DED6] rounded-[3px] w-64 placeholder:text-[#C9BEB5] focus:outline-none focus:border-[#B85C38] transition-colors"
        />
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-[#A8A29E] mr-2">Sort:</span>
          {(['name', 'parcelId', 'clone'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-xs font-mono rounded-[2px] transition-colors cursor-pointer ${
                sortBy === s
                  ? 'bg-[#1A1814] text-white'
                  : 'text-[#6B6560] hover:text-[#1A1814] hover:bg-[#F0EBE3]'
              }`}
            >
              {s === 'parcelId' ? 'ID' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-10 mt-6 pb-12 grid grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 bg-white border border-[#E5DED6] rounded-[4px] p-12 text-center">
            <Sprout size={32} className="text-[#E5DED6] mx-auto mb-3" />
            <p className="text-sm font-sans text-[#A8A29E]">No parcels found. Add your first parcel to get started.</p>
          </div>
        )}
        {filtered.map((parcel) => (
          <ParcelCard
            key={parcel.id}
            parcel={parcel}
            lastActivity={getLastActivity(parcel.id)}
            pickCount={picks.filter((p) => p.parcelId === parcel.id).length}
            onClick={() => navigate(`/vineyard/${parcel.id}`)}
            onEdit={(e) => { e.stopPropagation(); setEditingParcel(parcel) }}
          />
        ))}
      </div>

      <AddParcelModal open={showAddParcel} onClose={() => setShowAddParcel(false)} />
      <AddPickModal open={showAddPick} onClose={() => setShowAddPick(false)} />
      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} />
      {editingParcel && (
        <EditParcelModal
          parcel={editingParcel}
          onClose={() => setEditingParcel(null)}
          onSave={(updates) => { updateParcel(editingParcel.id, updates); setEditingParcel(null) }}
        />
      )}
    </div>
  )
}

function ParcelCard({
  parcel, lastActivity, pickCount, onClick, onEdit
}: {
  parcel: Parcel
  lastActivity: { date: string } | null | undefined
  pickCount: number
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E5DED6] rounded-[4px] p-5 cursor-pointer hover:border-[#C9BEB5] hover:shadow-sm transition-all duration-150 group relative"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-[#A8A29E]">{parcel.parcelId}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 text-[#C9BEB5] hover:text-[#B85C38] transition-all cursor-pointer"
            title="Edit parcel"
          >
            <Edit2 size={13} />
          </button>
          <ArrowRight size={14} className="text-[#E5DED6] group-hover:text-[#A8A29E] transition-colors" />
        </div>
      </div>

      <h3 className="text-base font-serif text-[#1A1814] mb-1">{parcel.name}</h3>
      <p className="text-xs font-sans text-[#6B6560] mb-4">{parcel.clone}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <Badge variant="sage">{parcel.surfaceArea} ha</Badge>
        <Badge variant="muted">{parcel.yearPlanted}</Badge>
        {pickCount > 0 && <Badge variant="accent">{pickCount} pick{pickCount > 1 ? 's' : ''}</Badge>}
      </div>

      {lastActivity ? (
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#A8A29E]">
          <Calendar size={11} />
          <span>{formatDate(lastActivity.date)}</span>
        </div>
      ) : (
        <p className="text-xs font-mono text-[#C9BEB5]">No activity logged</p>
      )}
    </div>
  )
}

function EditParcelModal({
  parcel, onClose, onSave
}: {
  parcel: Parcel
  onClose: () => void
  onSave: (updates: Partial<Parcel>) => void
}) {
  const [form, setForm] = useState({
    name: parcel.name,
    parcelId: parcel.parcelId,
    clone: parcel.clone,
    surfaceArea: String(parcel.surfaceArea),
    vinesPlanted: String(parcel.vinesPlanted),
    yearPlanted: String(parcel.yearPlanted),
    gps: parcel.gps,
  })
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    onSave({
      name: form.name,
      parcelId: form.parcelId,
      clone: form.clone,
      surfaceArea: parseFloat(form.surfaceArea) || parcel.surfaceArea,
      vinesPlanted: parseInt(form.vinesPlanted) || parcel.vinesPlanted,
      yearPlanted: parseInt(form.yearPlanted) || parcel.yearPlanted,
      gps: form.gps,
    })
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Edit — ${parcel.name}`}
      subtitle={parcel.parcelId}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Name" required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Parcel ID">
            <Input value={form.parcelId} onChange={(e) => set('parcelId', e.target.value)} />
          </FieldWrap>
        </div>
        <FieldWrap label="Clone / Variety">
          <Input value={form.clone} onChange={(e) => set('clone', e.target.value)} />
        </FieldWrap>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Surface Area (ha)">
            <Input type="number" step="0.1" value={form.surfaceArea} onChange={(e) => set('surfaceArea', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Vines Planted">
            <Input type="number" value={form.vinesPlanted} onChange={(e) => set('vinesPlanted', e.target.value)} />
          </FieldWrap>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Year Planted">
            <Input type="number" value={form.yearPlanted} onChange={(e) => set('yearPlanted', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="GPS / Location">
            <Input value={form.gps} onChange={(e) => set('gps', e.target.value)} />
          </FieldWrap>
        </div>
      </div>
    </Modal>
  )
}
