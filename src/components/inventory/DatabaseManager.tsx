import { useState } from 'react'
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react'
import { useStore } from '@/store'
import { uid } from '@/utils/ids'
import { Button } from '@/components/shared/Button'
import { Input, Select } from '@/components/shared/FormField'
import type { Tank, Barrel, Chemical, VesselStatus, ChemicalCategory } from '@/types'

type ManagerType = 'Tanks' | 'Barrels' | 'Equipment' | 'Chemicals'

export function DatabaseManager({ type }: { type: ManagerType }) {
  if (type === 'Tanks') return <TankManager />
  if (type === 'Barrels') return <BarrelManager />
  if (type === 'Equipment') return <EquipmentManager />
  if (type === 'Chemicals') return <ChemicalManager />
  return null
}

// ─── Tank Manager ─────────────────────────────────────────────────────────────

function TankManager() {
  const { tanks, addTank, updateTank, deleteTank } = useStore()
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ tankId: '', literage: '', status: 'Clean' as VesselStatus, notes: '' })
  const [editing, setEditing] = useState<string | null>(null)
  const [editVals, setEditVals] = useState<Partial<Tank>>({})

  const handleAdd = () => {
    addTank({ id: uid(), tankId: newRow.tankId || `TNK-${tanks.length + 1}`, literage: parseInt(newRow.literage) || 0, status: newRow.status, notes: newRow.notes })
    setAdding(false)
    setNewRow({ tankId: '', literage: '', status: 'Clean', notes: '' })
  }

  return (
    <DbTable
      title="Tanks"
      headers={['Tank ID', 'Literage', 'Status', 'Notes', '']}
      onAdd={() => setAdding(true)}
      addingRow={adding && (
        <tr className="border-b border-[#F0EBE3] bg-[#FDFAF7]">
          <td className="px-3 py-2"><Input value={newRow.tankId} onChange={(e) => setNewRow((r) => ({ ...r, tankId: e.target.value }))} placeholder="TNK-004" className="py-1" /></td>
          <td className="px-3 py-2"><Input type="number" value={newRow.literage} onChange={(e) => setNewRow((r) => ({ ...r, literage: e.target.value }))} placeholder="2000" className="py-1 w-20" /></td>
          <td className="px-3 py-2">
            <Select value={newRow.status} onChange={(e) => setNewRow((r) => ({ ...r, status: e.target.value as VesselStatus }))} className="py-1">
              <option>Clean</option><option>Unclean</option><option>Other</option>
            </Select>
          </td>
          <td className="px-3 py-2"><Input value={newRow.notes} onChange={(e) => setNewRow((r) => ({ ...r, notes: e.target.value }))} className="py-1" /></td>
          <td className="px-3 py-2"><SaveCancelButtons onSave={handleAdd} onCancel={() => setAdding(false)} /></td>
        </tr>
      )}
    >
      {tanks.map((tank) => (
        <tr key={tank.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] group">
          {editing === tank.id ? (
            <>
              <td className="px-3 py-2"><Input value={editVals.tankId ?? tank.tankId} onChange={(e) => setEditVals((v) => ({ ...v, tankId: e.target.value }))} className="py-1" /></td>
              <td className="px-3 py-2"><Input type="number" value={editVals.literage ?? tank.literage} onChange={(e) => setEditVals((v) => ({ ...v, literage: parseInt(e.target.value) }))} className="py-1 w-20" /></td>
              <td className="px-3 py-2">
                <Select value={editVals.status ?? tank.status} onChange={(e) => setEditVals((v) => ({ ...v, status: e.target.value as VesselStatus }))} className="py-1">
                  <option>Clean</option><option>Unclean</option><option>Other</option>
                </Select>
              </td>
              <td className="px-3 py-2"><Input value={editVals.notes ?? tank.notes} onChange={(e) => setEditVals((v) => ({ ...v, notes: e.target.value }))} className="py-1" /></td>
              <td className="px-3 py-2"><SaveCancelButtons onSave={() => { updateTank(tank.id, editVals); setEditing(null) }} onCancel={() => setEditing(null)} /></td>
            </>
          ) : (
            <>
              <td className="px-4 py-3 font-mono text-sm text-[#1A1814]">{tank.tankId}</td>
              <td className="px-4 py-3 font-mono">{tank.literage}L</td>
              <td className="px-4 py-3">
                <StatusBadge status={tank.status} />
              </td>
              <td className="px-4 py-3 text-xs text-[#6B6560]">{tank.notes}</td>
              <td className="px-4 py-3">
                <RowActions onEdit={() => { setEditing(tank.id); setEditVals({}) }} onDelete={() => deleteTank(tank.id)} />
              </td>
            </>
          )}
        </tr>
      ))}
    </DbTable>
  )
}

// ─── Barrel Manager ───────────────────────────────────────────────────────────

function BarrelManager() {
  const { barrels, addBarrel, updateBarrel, deleteBarrel } = useStore()
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ barrelId: '', cooper: '', size: '228', oakOrigin: '', age: '0', status: 'Clean' as VesselStatus, notes: '' })
  const [editing, setEditing] = useState<string | null>(null)
  const [editVals, setEditVals] = useState<Partial<Barrel>>({})

  const handleAdd = () => {
    addBarrel({ id: uid(), barrelId: newRow.barrelId || `BRL-${barrels.length + 1}`, cooper: newRow.cooper, size: parseInt(newRow.size) || 228, oakOrigin: newRow.oakOrigin, age: parseInt(newRow.age) || 0, status: newRow.status, notes: newRow.notes })
    setAdding(false)
    setNewRow({ barrelId: '', cooper: '', size: '228', oakOrigin: '', age: '0', status: 'Clean', notes: '' })
  }

  return (
    <DbTable
      title="Barrels"
      headers={['Barrel ID', 'Cooper', 'Size', 'Oak Origin', 'Age', 'Status', 'Notes', '']}
      onAdd={() => setAdding(true)}
      addingRow={adding && (
        <tr className="border-b border-[#F0EBE3] bg-[#FDFAF7]">
          <td className="px-3 py-2"><Input value={newRow.barrelId} onChange={(e) => setNewRow((r) => ({ ...r, barrelId: e.target.value }))} placeholder="BRL-004" className="py-1" /></td>
          <td className="px-3 py-2"><Input value={newRow.cooper} onChange={(e) => setNewRow((r) => ({ ...r, cooper: e.target.value }))} placeholder="François Frères" className="py-1" /></td>
          <td className="px-3 py-2"><Input type="number" value={newRow.size} onChange={(e) => setNewRow((r) => ({ ...r, size: e.target.value }))} placeholder="228" className="py-1 w-16" /></td>
          <td className="px-3 py-2"><Input value={newRow.oakOrigin} onChange={(e) => setNewRow((r) => ({ ...r, oakOrigin: e.target.value }))} placeholder="Allier" className="py-1" /></td>
          <td className="px-3 py-2"><Input type="number" value={newRow.age} onChange={(e) => setNewRow((r) => ({ ...r, age: e.target.value }))} placeholder="0" className="py-1 w-14" /></td>
          <td className="px-3 py-2">
            <Select value={newRow.status} onChange={(e) => setNewRow((r) => ({ ...r, status: e.target.value as VesselStatus }))} className="py-1">
              <option>Clean</option><option>Unclean</option><option>Other</option>
            </Select>
          </td>
          <td className="px-3 py-2"><Input value={newRow.notes} onChange={(e) => setNewRow((r) => ({ ...r, notes: e.target.value }))} className="py-1" /></td>
          <td className="px-3 py-2"><SaveCancelButtons onSave={handleAdd} onCancel={() => setAdding(false)} /></td>
        </tr>
      )}
    >
      {barrels.map((barrel) => (
        <tr key={barrel.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] group">
          {editing === barrel.id ? (
            <>
              <td className="px-4 py-3 font-mono text-xs">{barrel.barrelId}</td>
              <td className="px-3 py-2"><Input value={editVals.cooper ?? barrel.cooper} onChange={(e) => setEditVals((v) => ({ ...v, cooper: e.target.value }))} className="py-1" /></td>
              <td className="px-4 py-3 font-mono text-xs">{barrel.size}L</td>
              <td className="px-3 py-2"><Input value={editVals.oakOrigin ?? barrel.oakOrigin} onChange={(e) => setEditVals((v) => ({ ...v, oakOrigin: e.target.value }))} className="py-1" /></td>
              <td className="px-3 py-2"><Input type="number" value={editVals.age ?? barrel.age} onChange={(e) => setEditVals((v) => ({ ...v, age: parseInt(e.target.value) }))} className="py-1 w-14" /></td>
              <td className="px-3 py-2">
                <Select value={editVals.status ?? barrel.status} onChange={(e) => setEditVals((v) => ({ ...v, status: e.target.value as VesselStatus }))} className="py-1">
                  <option>Clean</option><option>Unclean</option><option>Other</option>
                </Select>
              </td>
              <td className="px-3 py-2"><Input value={editVals.notes ?? barrel.notes} onChange={(e) => setEditVals((v) => ({ ...v, notes: e.target.value }))} className="py-1" /></td>
              <td className="px-3 py-2"><SaveCancelButtons onSave={() => { updateBarrel(barrel.id, editVals); setEditing(null) }} onCancel={() => setEditing(null)} /></td>
            </>
          ) : (
            <>
              <td className="px-4 py-3 font-mono text-sm text-[#1A1814]">{barrel.barrelId}</td>
              <td className="px-4 py-3 text-sm font-sans">{barrel.cooper}</td>
              <td className="px-4 py-3 font-mono">{barrel.size}L</td>
              <td className="px-4 py-3 text-sm font-sans text-[#6B6560]">{barrel.oakOrigin}</td>
              <td className="px-4 py-3 font-mono">{barrel.age}yr</td>
              <td className="px-4 py-3"><StatusBadge status={barrel.status} /></td>
              <td className="px-4 py-3 text-xs text-[#6B6560]">{barrel.notes}</td>
              <td className="px-4 py-3"><RowActions onEdit={() => { setEditing(barrel.id); setEditVals({}) }} onDelete={() => deleteBarrel(barrel.id)} /></td>
            </>
          )}
        </tr>
      ))}
    </DbTable>
  )
}

// ─── Equipment Manager ────────────────────────────────────────────────────────

function EquipmentManager() {
  const { equipment, addEquipment, deleteEquipment } = useStore()
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ type: 'destemmer' as 'destemmer' | 'press', makeModel: '', capacity: '', lastServiceDate: '', notes: '' })

  const handleAdd = () => {
    addEquipment({ id: uid(), equipmentId: `EQP-${equipment.length + 1}`, type: newRow.type, makeModel: newRow.makeModel, capacity: newRow.capacity, lastServiceDate: newRow.lastServiceDate, notes: newRow.notes })
    setAdding(false)
    setNewRow({ type: 'destemmer', makeModel: '', capacity: '', lastServiceDate: '', notes: '' })
  }

  return (
    <DbTable title="Equipment" headers={['ID', 'Type', 'Make / Model', 'Capacity', 'Last Service', 'Notes', '']} onAdd={() => setAdding(true)}
      addingRow={adding && (
        <tr className="border-b border-[#F0EBE3] bg-[#FDFAF7]">
          <td className="px-4 py-3 text-xs font-mono text-[#A8A29E]">auto</td>
          <td className="px-3 py-2">
            <Select value={newRow.type} onChange={(e) => setNewRow((r) => ({ ...r, type: e.target.value as 'destemmer' | 'press' }))} className="py-1">
              <option value="destemmer">Destemmer</option>
              <option value="press">Press</option>
            </Select>
          </td>
          <td className="px-3 py-2"><Input value={newRow.makeModel} onChange={(e) => setNewRow((r) => ({ ...r, makeModel: e.target.value }))} className="py-1" /></td>
          <td className="px-3 py-2"><Input value={newRow.capacity} onChange={(e) => setNewRow((r) => ({ ...r, capacity: e.target.value }))} className="py-1 w-24" /></td>
          <td className="px-3 py-2"><Input type="date" value={newRow.lastServiceDate} onChange={(e) => setNewRow((r) => ({ ...r, lastServiceDate: e.target.value }))} className="py-1" /></td>
          <td className="px-3 py-2"><Input value={newRow.notes} onChange={(e) => setNewRow((r) => ({ ...r, notes: e.target.value }))} className="py-1" /></td>
          <td className="px-3 py-2"><SaveCancelButtons onSave={handleAdd} onCancel={() => setAdding(false)} /></td>
        </tr>
      )}
    >
      {equipment.map((eq) => (
        <tr key={eq.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] group">
          <td className="px-4 py-3 font-mono text-xs text-[#A8A29E]">{eq.equipmentId}</td>
          <td className="px-4 py-3 font-sans text-xs capitalize">{eq.type}</td>
          <td className="px-4 py-3 font-sans">{eq.makeModel}</td>
          <td className="px-4 py-3 font-mono text-xs">{eq.capacity}</td>
          <td className="px-4 py-3 font-mono text-xs text-[#6B6560]">{eq.lastServiceDate || '—'}</td>
          <td className="px-4 py-3 text-xs text-[#6B6560]">{eq.notes}</td>
          <td className="px-4 py-3"><RowActions onDelete={() => deleteEquipment(eq.id)} /></td>
        </tr>
      ))}
    </DbTable>
  )
}

// ─── Chemical Manager ─────────────────────────────────────────────────────────

function ChemicalManager() {
  const { chemicals, addChemical, updateChemical, deleteChemical } = useStore()
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ name: '', category: 'SO2' as ChemicalCategory, stock: '', unit: '', notes: '' })
  const [editing, setEditing] = useState<string | null>(null)
  const [editVals, setEditVals] = useState<Partial<Chemical>>({})

  const categories: ChemicalCategory[] = ['Fining agent', 'Nutrient', 'SO2', 'Acid', 'Enzyme', 'Other']

  const handleAdd = () => {
    addChemical({ id: uid(), name: newRow.name, category: newRow.category, stock: parseFloat(newRow.stock) || 0, unit: newRow.unit, notes: newRow.notes })
    setAdding(false)
    setNewRow({ name: '', category: 'SO2', stock: '', unit: '', notes: '' })
  }

  return (
    <DbTable title="Chemicals & Inputs" headers={['Name', 'Category', 'Stock', 'Unit', 'Notes', '']} onAdd={() => setAdding(true)}
      addingRow={adding && (
        <tr className="border-b border-[#F0EBE3] bg-[#FDFAF7]">
          <td className="px-3 py-2"><Input value={newRow.name} onChange={(e) => setNewRow((r) => ({ ...r, name: e.target.value }))} placeholder="Potassium metabisulphite" className="py-1" /></td>
          <td className="px-3 py-2">
            <Select value={newRow.category} onChange={(e) => setNewRow((r) => ({ ...r, category: e.target.value as ChemicalCategory }))} className="py-1">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </td>
          <td className="px-3 py-2"><Input type="number" value={newRow.stock} onChange={(e) => setNewRow((r) => ({ ...r, stock: e.target.value }))} className="py-1 w-20" /></td>
          <td className="px-3 py-2"><Input value={newRow.unit} onChange={(e) => setNewRow((r) => ({ ...r, unit: e.target.value }))} placeholder="kg" className="py-1 w-16" /></td>
          <td className="px-3 py-2"><Input value={newRow.notes} onChange={(e) => setNewRow((r) => ({ ...r, notes: e.target.value }))} className="py-1" /></td>
          <td className="px-3 py-2"><SaveCancelButtons onSave={handleAdd} onCancel={() => setAdding(false)} /></td>
        </tr>
      )}
    >
      {chemicals.map((chem) => (
        <tr key={chem.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] group">
          {editing === chem.id ? (
            <>
              <td className="px-4 py-3 font-sans">{chem.name}</td>
              <td className="px-3 py-2">
                <Select value={editVals.category ?? chem.category} onChange={(e) => setEditVals((v) => ({ ...v, category: e.target.value as ChemicalCategory }))} className="py-1">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </td>
              <td className="px-3 py-2"><Input type="number" value={editVals.stock ?? chem.stock} onChange={(e) => setEditVals((v) => ({ ...v, stock: parseFloat(e.target.value) }))} className="py-1 w-20" /></td>
              <td className="px-4 py-3 font-mono text-xs">{chem.unit}</td>
              <td className="px-3 py-2"><Input value={editVals.notes ?? chem.notes} onChange={(e) => setEditVals((v) => ({ ...v, notes: e.target.value }))} className="py-1" /></td>
              <td className="px-3 py-2"><SaveCancelButtons onSave={() => { updateChemical(chem.id, editVals); setEditing(null) }} onCancel={() => setEditing(null)} /></td>
            </>
          ) : (
            <>
              <td className="px-4 py-3 font-sans text-sm">{chem.name}</td>
              <td className="px-4 py-3"><Badge variant="muted">{chem.category}</Badge></td>
              <td className="px-4 py-3 font-mono">{chem.stock}</td>
              <td className="px-4 py-3 font-mono text-xs text-[#6B6560]">{chem.unit}</td>
              <td className="px-4 py-3 text-xs text-[#6B6560]">{chem.notes}</td>
              <td className="px-4 py-3"><RowActions onEdit={() => { setEditing(chem.id); setEditVals({}) }} onDelete={() => deleteChemical(chem.id)} /></td>
            </>
          )}
        </tr>
      ))}
    </DbTable>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

import type { ReactNode } from 'react'

function DbTable({ title, headers, children, onAdd, addingRow }: {
  title: string
  headers: string[]
  children: ReactNode
  onAdd: () => void
  addingRow?: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-serif text-[#1A1814]">{title}</h3>
        <Button size="sm" variant="ghost" onClick={onAdd}><Plus size={13} /> Add Row</Button>
      </div>
      <div className="bg-white border border-[#E5DED6] rounded-[4px] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F0EBE3]">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#A8A29E] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {addingRow}
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: VesselStatus }) {
  const v = status === 'Clean' ? 'sage' : status === 'Unclean' ? 'warning' : 'muted'
  return <Badge variant={v as 'sage' | 'warning' | 'muted'}>{status}</Badge>
}

function SaveCancelButtons({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-1">
      <button onClick={onSave} className="text-[#7A8C6E] hover:text-green-600 cursor-pointer"><Check size={14} /></button>
      <button onClick={onCancel} className="text-[#A8A29E] cursor-pointer"><X size={14} /></button>
    </div>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {onEdit && (
        <button onClick={onEdit} className="text-[#C9BEB5] hover:text-[#B85C38] cursor-pointer"><Edit2 size={13} /></button>
      )}
      <button onClick={onDelete} className="text-[#C9BEB5] hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
    </div>
  )
}

function Badge({ children, variant }: { children: ReactNode; variant: string }) {
  const variants: Record<string, string> = {
    sage: 'bg-[#E8EDE5] text-[#7A8C6E] border-[#C5D0BE]',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    muted: 'bg-transparent text-[#A8A29E] border-[#E5DED6]',
    accent: 'bg-[#F0E6E0] text-[#B85C38] border-[#E5C4B6]',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-[2px] border ${variants[variant] ?? variants.muted}`}>
      {children}
    </span>
  )
}
