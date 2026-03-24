import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Textarea, Select, Input } from '@/components/shared/FormField'
import { useStore } from '@/store'
import { uid, todayISO } from '@/utils/ids'
import type { BatchActionType } from '@/types'

interface ActionDef {
  type: BatchActionType
  label: string
  description: string
  icon: string
}

const ACTION_DEFS: ActionDef[] = [
  { type: 'Clean',    label: 'Clean',         description: 'Clean a tank or barrel',             icon: '🧹' },
  { type: 'Addition', label: 'Addition',       description: 'Add a chemical or input',            icon: '⚗️' },
  { type: 'Sample',   label: 'Take a Sample',  description: 'Record pH, Baumé, and/or temp',      icon: '🧪' },
  { type: 'Rack',     label: 'Rack',           description: 'Move wine from one vessel to another',icon: '↔️' },
  { type: 'Pumpover', label: 'Pumpover',       description: 'Pump over a tank',                   icon: '🔄' },
  { type: 'Plunge',   label: 'Plunge',         description: 'Plunge a tank',                      icon: '⬇️' },
  { type: 'Bottle',   label: 'Bottle',         description: 'Bottle this batch',                  icon: '🍾' },
  { type: 'Filter',   label: 'Filter',         description: 'Filter this batch',                  icon: '🔽' },
  { type: 'Settle',   label: 'Settle',         description: 'Allow batch to settle',              icon: '⏱️' },
]

interface Props { open: boolean; batchId: string; onClose: () => void }

export function ActionModal({ open, batchId, onClose }: Props) {
  const { users, tanks, barrels, chemicals, addBatchAction, addActivity, batches } = useStore()
  const batch = batches.find((b) => b.id === batchId)

  const [step, setStep] = useState<'pick' | 'detail'>('pick')
  const [selectedType, setSelectedType] = useState<BatchActionType | null>(null)

  // Shared fields
  const [date, setDate] = useState(todayISO())
  const [assignedUserId, setAssignedUserId] = useState('')
  const [notes, setNotes] = useState('')

  // Clean
  const [cleanVesselId, setCleanVesselId] = useState('')
  const [cleanVesselType, setCleanVesselType] = useState<'tank' | 'barrel'>('tank')

  // Addition
  const [chemicalId, setChemicalId] = useState('')
  const [chemicalAmount, setChemicalAmount] = useState('')

  // Sample
  const [samplePh, setSamplePh] = useState('')
  const [sampleBaume, setSampleBaume] = useState('')
  const [sampleTemp, setSampleTemp] = useState('')

  // Rack
  const [fromVesselId, setFromVesselId] = useState('')
  const [fromVesselType, setFromVesselType] = useState<'tank' | 'barrel'>('tank')
  const [toVesselId, setToVesselId] = useState('')
  const [toVesselType, setToVesselType] = useState<'tank' | 'barrel'>('tank')

  // Bottle
  const [bottleCount, setBottleCount] = useState('')

  const activeUsers = users.filter((u) => u.status === 'active')
  const allChemicals = chemicals

  const allVessels = (type: 'tank' | 'barrel') =>
    type === 'tank'
      ? tanks.map((t) => ({ id: t.id, label: `${t.tankId} (${t.literage}L)` }))
      : barrels.map((b) => ({ id: b.id, label: `${b.barrelId} — ${b.cooper} ${b.size}L` }))

  const selectedChemical = chemicals.find((c) => c.id === chemicalId)

  const handleClose = () => {
    setStep('pick')
    setSelectedType(null)
    setDate(todayISO())
    setAssignedUserId('')
    setNotes('')
    setCleanVesselId('')
    setChemicalId('')
    setChemicalAmount('')
    setSamplePh('')
    setSampleBaume('')
    setSampleTemp('')
    setFromVesselId('')
    setToVesselId('')
    setBottleCount('')
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedType) return

    const action = {
      id: uid(),
      type: selectedType,
      date,
      notes,
      assignedUserId: assignedUserId || undefined,
      // Type-specific
      ...(selectedType === 'Clean' && {
        vesselId: cleanVesselId,
        vesselType: cleanVesselType,
      }),
      ...(selectedType === 'Addition' && {
        chemicalId,
        chemicalAmount: parseFloat(chemicalAmount) || undefined,
        chemicalUnit: selectedChemical?.unit,
      }),
      ...(selectedType === 'Sample' && {
        samplePh: samplePh ? parseFloat(samplePh) : null,
        sampleBaume: sampleBaume ? parseFloat(sampleBaume) : null,
        sampleTemp: sampleTemp ? parseFloat(sampleTemp) : null,
      }),
      ...(selectedType === 'Rack' && {
        vesselId: fromVesselId,
        vesselType: fromVesselType,
        toVesselId,
        toVesselType,
      }),
      ...(selectedType === 'Bottle' && {
        bottleCount: parseInt(bottleCount) || undefined,
      }),
    }

    addBatchAction(batchId, action)

    // Build description
    let desc = `${selectedType}`
    if (selectedType === 'Addition' && selectedChemical) desc += ` — ${selectedChemical.name}${chemicalAmount ? ` ${chemicalAmount}${selectedChemical.unit}` : ''}`
    if (selectedType === 'Sample') {
      const parts = [samplePh && `pH ${samplePh}`, sampleBaume && `${sampleBaume}° Bé`, sampleTemp && `${sampleTemp}°C`].filter(Boolean)
      if (parts.length) desc += ` — ${parts.join(' / ')}`
    }
    if (selectedType === 'Rack') {
      const fromLabel = allVessels(fromVesselType).find((v) => v.id === fromVesselId)?.label
      const toLabel = allVessels(toVesselType).find((v) => v.id === toVesselId)?.label
      if (fromLabel && toLabel) desc += ` — ${fromLabel} → ${toLabel}`
    }
    if (batch) desc += ` (${batch.batchId})`

    addActivity({
      id: uid(),
      type: 'batch-action',
      description: desc,
      date: new Date().toISOString(),
      batchId,
    })

    handleClose()
  }

  // ── Step 1: pick action type ──────────────────────────────────────────────
  if (step === 'pick') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Add Cellar Action"
        subtitle={`Batch: ${batch?.batchId ?? ''}${batch?.nickname ? ` — ${batch.nickname}` : ''}`}
        size="md"
      >
        <div className="grid grid-cols-3 gap-2">
          {ACTION_DEFS.map((def) => (
            <button
              key={def.type}
              onClick={() => { setSelectedType(def.type); setStep('detail') }}
              className="flex flex-col items-start gap-1.5 p-3.5 bg-white border border-[#E5DED6] rounded-[4px] hover:border-[#B85C38] hover:bg-[#FFF8F5] transition-all duration-150 cursor-pointer text-left group"
            >
              <span className="text-lg leading-none">{def.icon}</span>
              <span className="text-sm font-sans font-medium text-[#1A1814] group-hover:text-[#B85C38] transition-colors">{def.label}</span>
              <span className="text-[10px] font-sans text-[#A8A29E] leading-tight">{def.description}</span>
            </button>
          ))}
        </div>
      </Modal>
    )
  }

  // ── Step 2: fill in details ───────────────────────────────────────────────
  const def = ACTION_DEFS.find((d) => d.type === selectedType)!

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${def.icon} ${def.label}`}
      subtitle={`Batch: ${batch?.batchId ?? ''}${batch?.nickname ? ` — ${batch.nickname}` : ''}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => setStep('pick')}>← Back</Button>
          <Button variant="primary" onClick={handleSubmit}>Save Action</Button>
        </>
      }
    >
      <div className="space-y-4">

        {/* CLEAN */}
        {selectedType === 'Clean' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldWrap label="Vessel Type" required>
                <Select value={cleanVesselType} onChange={(e) => { setCleanVesselType(e.target.value as 'tank' | 'barrel'); setCleanVesselId('') }}>
                  <option value="tank">Tank</option>
                  <option value="barrel">Barrel</option>
                </Select>
              </FieldWrap>
              <FieldWrap label="Vessel" required>
                <Select value={cleanVesselId} onChange={(e) => setCleanVesselId(e.target.value)}>
                  <option value="">— Select —</option>
                  {allVessels(cleanVesselType).map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </Select>
              </FieldWrap>
            </div>
          </div>
        )}

        {/* ADDITION */}
        {selectedType === 'Addition' && (
          <div className="space-y-4">
            <FieldWrap label="Chemical / Input" required>
              <Select value={chemicalId} onChange={(e) => setChemicalId(e.target.value)}>
                <option value="">— Select chemical —</option>
                {allChemicals.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
              </Select>
            </FieldWrap>
            {allChemicals.length === 0 && (
              <p className="text-xs text-[#A8A29E] font-sans">No chemicals in inventory. Add them under Inventory → Chemicals.</p>
            )}
            <FieldWrap label={`Amount${selectedChemical ? ` (${selectedChemical.unit})` : ''}`}>
              <Input type="number" step="0.01" placeholder="0.5" value={chemicalAmount} onChange={(e) => setChemicalAmount(e.target.value)} />
            </FieldWrap>
          </div>
        )}

        {/* SAMPLE */}
        {selectedType === 'Sample' && (
          <div className="space-y-4">
            <p className="text-xs font-sans text-[#6B6560]">Record any or all measurements. Leave blank to skip.</p>
            <div className="grid grid-cols-3 gap-4">
              <FieldWrap label="pH">
                <Input type="number" step="0.01" placeholder="3.45" value={samplePh} onChange={(e) => setSamplePh(e.target.value)} />
              </FieldWrap>
              <FieldWrap label="Baumé / Brix">
                <Input type="number" step="0.1" placeholder="8.2" value={sampleBaume} onChange={(e) => setSampleBaume(e.target.value)} />
              </FieldWrap>
              <FieldWrap label="Temp (°C)">
                <Input type="number" step="0.1" placeholder="22" value={sampleTemp} onChange={(e) => setSampleTemp(e.target.value)} />
              </FieldWrap>
            </div>
          </div>
        )}

        {/* RACK */}
        {selectedType === 'Rack' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldWrap label="From Type">
                <Select value={fromVesselType} onChange={(e) => { setFromVesselType(e.target.value as 'tank' | 'barrel'); setFromVesselId('') }}>
                  <option value="tank">Tank</option>
                  <option value="barrel">Barrel</option>
                </Select>
              </FieldWrap>
              <FieldWrap label="From Vessel" required>
                <Select value={fromVesselId} onChange={(e) => setFromVesselId(e.target.value)}>
                  <option value="">— Select —</option>
                  {allVessels(fromVesselType).map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </Select>
              </FieldWrap>
              <FieldWrap label="To Type">
                <Select value={toVesselType} onChange={(e) => { setToVesselType(e.target.value as 'tank' | 'barrel'); setToVesselId('') }}>
                  <option value="tank">Tank</option>
                  <option value="barrel">Barrel</option>
                </Select>
              </FieldWrap>
              <FieldWrap label="To Vessel" required>
                <Select value={toVesselId} onChange={(e) => setToVesselId(e.target.value)}>
                  <option value="">— Select —</option>
                  {allVessels(toVesselType).map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </Select>
              </FieldWrap>
            </div>
          </div>
        )}

        {/* PUMPOVER */}
        {selectedType === 'Pumpover' && (
          <FieldWrap label="Tank">
            <Select value={fromVesselId} onChange={(e) => setFromVesselId(e.target.value)}>
              <option value="">— Select tank —</option>
              {tanks.map((t) => <option key={t.id} value={t.id}>{t.tankId} ({t.literage}L)</option>)}
            </Select>
          </FieldWrap>
        )}

        {/* PLUNGE */}
        {selectedType === 'Plunge' && (
          <FieldWrap label="Tank">
            <Select value={fromVesselId} onChange={(e) => setFromVesselId(e.target.value)}>
              <option value="">— Select tank —</option>
              {tanks.map((t) => <option key={t.id} value={t.id}>{t.tankId} ({t.literage}L)</option>)}
            </Select>
          </FieldWrap>
        )}

        {/* BOTTLE */}
        {selectedType === 'Bottle' && (
          <FieldWrap label="Bottles Filled">
            <Input type="number" placeholder="1200" value={bottleCount} onChange={(e) => setBottleCount(e.target.value)} />
          </FieldWrap>
        )}

        {/* FILTER / SETTLE — no extra fields beyond notes */}
        {(selectedType === 'Filter' || selectedType === 'Settle') && (
          <p className="text-xs font-sans text-[#A8A29E]">Add any relevant observations in the notes below.</p>
        )}

        {/* Shared: date + assigned + notes */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#F0EBE3]">
          <FieldWrap label="Date" required>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Assigned To">
            <Select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
              <option value="">— Unassigned —</option>
              {activeUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </FieldWrap>
        </div>

        <FieldWrap label="Notes">
          <Textarea
            placeholder="Quantities, observations, conditions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FieldWrap>
      </div>
    </Modal>
  )
}
