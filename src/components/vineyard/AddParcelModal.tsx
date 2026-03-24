import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input } from '@/components/shared/FormField'
import { useStore } from '@/store'
import { uid } from '@/utils/ids'

interface Props { open: boolean; onClose: () => void }

export function AddParcelModal({ open, onClose }: Props) {
  const { parcels, addParcel, addActivity } = useStore()
  const [form, setForm] = useState({
    name: '', parcelId: '', clone: '', surfaceArea: '', vinesPlanted: '',
    gps: '', yearPlanted: String(new Date().getFullYear()),
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name || !form.clone) return
    const nextId = `VYD-${String(parcels.length + 1).padStart(3, '0')}`
    const parcel = {
      id: uid(),
      parcelId: form.parcelId || nextId,
      name: form.name,
      clone: form.clone,
      surfaceArea: parseFloat(form.surfaceArea) || 0,
      vinesPlanted: parseInt(form.vinesPlanted) || 0,
      gps: form.gps,
      yearPlanted: parseInt(form.yearPlanted) || new Date().getFullYear(),
      historicalData: [],
      createdAt: new Date().toISOString(),
    }
    addParcel(parcel)
    addActivity({
      id: uid(),
      type: 'vineyard-task',
      description: `Parcel added: ${form.name}`,
      date: new Date().toISOString(),
      parcelId: parcel.id,
    })
    onClose()
    setForm({ name: '', parcelId: '', clone: '', surfaceArea: '', vinesPlanted: '', gps: '', yearPlanted: String(new Date().getFullYear()) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Parcel"
      subtitle="Register a new vineyard parcel"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name || !form.clone}>Add Parcel</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Name" required>
            <Input placeholder="Home Block" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Parcel ID" hint="Auto-generated if blank">
            <Input placeholder="VYD-001" value={form.parcelId} onChange={(e) => set('parcelId', e.target.value)} />
          </FieldWrap>
        </div>
        <FieldWrap label="Clone / Variety" required>
          <Input placeholder="Pinot Noir MV6" value={form.clone} onChange={(e) => set('clone', e.target.value)} />
        </FieldWrap>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Surface Area (ha)">
            <Input type="number" step="0.1" placeholder="1.2" value={form.surfaceArea} onChange={(e) => set('surfaceArea', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Vines Planted">
            <Input type="number" placeholder="3200" value={form.vinesPlanted} onChange={(e) => set('vinesPlanted', e.target.value)} />
          </FieldWrap>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Year Planted">
            <Input type="number" placeholder="1997" value={form.yearPlanted} onChange={(e) => set('yearPlanted', e.target.value)} />
          </FieldWrap>
          <FieldWrap label="GPS / Location">
            <Input placeholder="-35.12, 138.74" value={form.gps} onChange={(e) => set('gps', e.target.value)} />
          </FieldWrap>
        </div>
      </div>
    </Modal>
  )
}
