import { useState } from 'react'
import { Plus, Trash2, Package } from 'lucide-react'
import { useStore } from '@/store'
import { uid } from '@/utils/ids'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { FieldWrap, Input, Textarea, Select } from '@/components/shared/FormField'
import { DatabaseManager } from './DatabaseManager'
import type { BottledLot } from '@/types'

const tabs = ['Bottled Lots', 'Tanks', 'Barrels', 'Equipment', 'Chemicals'] as const
type Tab = typeof tabs[number]

export function Inventory() {
  const [activeTab, setActiveTab] = useState<Tab>('Bottled Lots')
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-10 pt-10 pb-0 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-[#A8A29E] uppercase tracking-widest mb-2">Contrada</p>
          <h1 className="text-3xl font-serif text-[#1A1814]">Inventory</h1>
        </div>
        {activeTab === 'Bottled Lots' && (
          <Button variant="primary" className="mt-1" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Lot
          </Button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="px-10 mt-6 flex items-center gap-0 border-b border-[#E5DED6]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors duration-150 cursor-pointer border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-[#B85C38] border-[#B85C38]'
                : 'text-[#6B6560] border-transparent hover:text-[#1A1814]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-10 mt-6 pb-12">
        {activeTab === 'Bottled Lots' && <BottledLotsTable onAdd={() => setShowAdd(true)} />}
        {activeTab !== 'Bottled Lots' && <DatabaseManager type={activeTab} />}
      </div>

      <AddLotModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

function BottledLotsTable({ onAdd }: { onAdd: () => void }) {
  const { bottledLots, parcels, deleteBottledLot } = useStore()
  const [filterVintage, setFilterVintage] = useState('')
  const [filterVariety, setFilterVariety] = useState('')

  const vintages = [...new Set(bottledLots.map((l) => l.vintage))].sort((a, b) => b - a)

  const filtered = bottledLots
    .filter((l) => !filterVintage || String(l.vintage) === filterVintage)
    .filter((l) => !filterVariety || l.variety.toLowerCase().includes(filterVariety.toLowerCase()))

  const getParcel = (id: string) => parcels.find((p) => p.id === id)

  if (bottledLots.length === 0) {
    return (
      <div className="bg-white border border-[#E5DED6] rounded-[4px] p-12 text-center">
        <Package size={32} className="text-[#E5DED6] mx-auto mb-3" />
        <p className="text-sm font-sans text-[#A8A29E]">No bottled lots yet.</p>
        <button onClick={onAdd} className="mt-3 text-xs font-mono text-[#B85C38] hover:underline cursor-pointer">Add first lot →</button>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={filterVintage}
          onChange={(e) => setFilterVintage(e.target.value)}
          className="px-3 py-2 text-sm font-sans bg-white border border-[#E5DED6] rounded-[3px] text-[#1A1814] focus:outline-none focus:border-[#B85C38]"
        >
          <option value="">All vintages</option>
          {vintages.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <input
          placeholder="Filter by variety..."
          value={filterVariety}
          onChange={(e) => setFilterVariety(e.target.value)}
          className="px-3 py-2 text-sm font-sans bg-white border border-[#E5DED6] rounded-[3px] placeholder:text-[#C9BEB5] focus:outline-none focus:border-[#B85C38]"
        />
        <span className="text-xs font-mono text-[#A8A29E] ml-auto">{filtered.length} lots</span>
      </div>

      <div className="bg-white border border-[#E5DED6] rounded-[4px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F0EBE3]">
              {['Lot ID', 'Vintage', 'Parcel', 'Variety', 'Clone', 'Method', 'Vessel', 'Alc %', 'Bottles', ''].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#A8A29E] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lot) => (
              <tr key={lot.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] group">
                <td className="px-4 py-3 font-mono text-xs text-[#B85C38]">{lot.lotId}</td>
                <td className="px-4 py-3 font-mono">{lot.vintage}</td>
                <td className="px-4 py-3 font-sans text-[#6B6560] text-xs">{getParcel(lot.parcelId)?.name ?? '—'}</td>
                <td className="px-4 py-3 font-sans">{lot.variety}</td>
                <td className="px-4 py-3 font-sans text-xs text-[#6B6560]">{lot.clone}</td>
                <td className="px-4 py-3 font-sans text-xs">{lot.fermentMethod}</td>
                <td className="px-4 py-3 font-sans text-xs">{lot.vesselAged}</td>
                <td className="px-4 py-3 font-mono">{lot.alc}%</td>
                <td className="px-4 py-3 font-mono">{lot.bottles.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteBottledLot(lot.id)}
                    className="text-[#E5DED6] group-hover:text-red-300 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AddLotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { parcels, bottledLots, addBottledLot, addActivity } = useStore()
  const [form, setForm] = useState({
    vintage: String(new Date().getFullYear()),
    parcelId: '',
    variety: '',
    clone: '',
    fermentMethod: '',
    vesselAged: '',
    alc: '',
    bottles: '',
    notes: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.variety) return
    const nextNum = bottledLots.length + 1
    const lot: BottledLot = {
      id: uid(),
      lotId: `LOT-${String(nextNum).padStart(3, '0')}`,
      vintage: parseInt(form.vintage),
      parcelId: form.parcelId,
      variety: form.variety,
      clone: form.clone,
      fermentMethod: form.fermentMethod,
      vesselAged: form.vesselAged,
      alc: parseFloat(form.alc) || 0,
      bottles: parseInt(form.bottles) || 0,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }
    addBottledLot(lot)
    addActivity({
      id: uid(),
      type: 'lot-bottled',
      description: `Lot bottled: ${form.variety} ${form.vintage} — ${form.bottles} bottles`,
      date: new Date().toISOString(),
      parcelId: form.parcelId || undefined,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Bottled Lot"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.variety}>Add Lot</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Vintage" required>
            <Input type="number" value={form.vintage} onChange={(e) => set('vintage', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Parcel">
            <Select value={form.parcelId} onChange={(e) => set('parcelId', e.target.value)}>
              <option value="">— Select parcel —</option>
              {parcels.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FieldWrap>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Variety" required>
            <Input placeholder="Pinot Noir" value={form.variety} onChange={(e) => set('variety', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Clone">
            <Input placeholder="MV6" value={form.clone} onChange={(e) => set('clone', e.target.value)} />
          </FieldWrap>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Ferment Method">
            <Input placeholder="Whole bunch, destemmed, co-ferment..." value={form.fermentMethod} onChange={(e) => set('fermentMethod', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Vessel Aged">
            <Input placeholder="Old French oak, 228L barrel..." value={form.vesselAged} onChange={(e) => set('vesselAged', e.target.value)} />
          </FieldWrap>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Alc %">
            <Input type="number" step="0.1" placeholder="13.5" value={form.alc} onChange={(e) => set('alc', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Bottles Made">
            <Input type="number" placeholder="1200" value={form.bottles} onChange={(e) => set('bottles', e.target.value)} />
          </FieldWrap>
        </div>
        <FieldWrap label="Notes">
          <Textarea rows={2} placeholder="Additional notes..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </FieldWrap>
      </div>
    </Modal>
  )
}
