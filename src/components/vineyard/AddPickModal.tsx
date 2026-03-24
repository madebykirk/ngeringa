import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input, Textarea, Select } from '@/components/shared/FormField'
import { useStore } from '@/store'
import { uid, todayISO } from '@/utils/ids'

interface Props { open: boolean; onClose: () => void; defaultParcelId?: string }

export function AddPickModal({ open, onClose, defaultParcelId }: Props) {
  const { parcels, addPick, addActivity } = useStore()
  const [form, setForm] = useState({
    parcelId: defaultParcelId ?? '',
    date: todayISO(),
    grossWeight: '',
    netWeight: '',
    ph: '',
    baume: '',
    notes: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const parcel = parcels.find((p) => p.id === form.parcelId)

  const handleSubmit = () => {
    if (!form.parcelId || !form.date) return
    const pick = {
      id: uid(),
      parcelId: form.parcelId,
      date: form.date,
      grossWeight: parseFloat(form.grossWeight) || 0,
      netWeight: parseFloat(form.netWeight) || 0,
      ph: parseFloat(form.ph) || 0,
      baume: parseFloat(form.baume) || 0,
      notes: form.notes,
      fermentStarted: false,
      createdAt: new Date().toISOString(),
    }
    addPick(pick)
    addActivity({
      id: uid(),
      type: 'pick',
      description: `Pick logged: ${parcel?.name ?? 'Unknown'} — ${form.grossWeight}kg gross`,
      date: new Date().toISOString(),
      parcelId: form.parcelId,
    })
    onClose()
    setForm({ parcelId: defaultParcelId ?? '', date: todayISO(), grossWeight: '', netWeight: '', ph: '', baume: '', notes: '' })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Pick"
      subtitle="Record a vineyard pick and fruit metrics"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.parcelId}>Log Pick</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FieldWrap label="Parcel" required>
          <Select value={form.parcelId} onChange={(e) => set('parcelId', e.target.value)}>
            <option value="">— Select parcel —</option>
            {parcels.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.parcelId})</option>
            ))}
          </Select>
        </FieldWrap>

        <FieldWrap label="Date" required>
          <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </FieldWrap>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Gross Weight (kg)">
            <Input type="number" step="0.1" placeholder="4800" value={form.grossWeight} onChange={(e) => set('grossWeight', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Net Weight (kg)">
            <Input type="number" step="0.1" placeholder="4500" value={form.netWeight} onChange={(e) => set('netWeight', e.target.value)} />
          </FieldWrap>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="pH">
            <Input type="number" step="0.01" placeholder="3.45" value={form.ph} onChange={(e) => set('ph', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Baume / Brix">
            <Input type="number" step="0.1" placeholder="12.5" value={form.baume} onChange={(e) => set('baume', e.target.value)} />
          </FieldWrap>
        </div>

        <FieldWrap label="Notes">
          <Textarea placeholder="Condition of fruit, picking crew, weather..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </FieldWrap>
      </div>
    </Modal>
  )
}
