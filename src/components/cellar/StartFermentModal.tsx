import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input, Select } from '@/components/shared/FormField'
import { useStore } from '@/store'
import { uid, todayISO, generateBatchId } from '@/utils/ids'

interface Props { open: boolean; pickId: string; onClose: () => void }

export function StartFermentModal({ open, pickId, onClose }: Props) {
  const { picks, parcels, tanks, barrels, batches, addBatch, markPickFermentStarted, addActivity, addBatchAction } = useStore()

  const pick = picks.find((p) => p.id === pickId)
  const parcel = parcels.find((p) => p.id === pick?.parcelId)

  const [form, setForm] = useState({
    vesselType: 'tank' as 'tank' | 'barrel',
    vesselId: '',
    nickname: '',
    startDate: todayISO(),
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const allVessels = form.vesselType === 'tank'
    ? tanks.map((t) => ({ id: t.id, label: `${t.tankId} (${t.literage}L)`, status: t.status }))
    : barrels.map((b) => ({ id: b.id, label: `${b.barrelId} — ${b.cooper} ${b.size}L`, status: b.status }))

  const selectedVessel = allVessels.find((v) => v.id === form.vesselId)
  const isUnclean = selectedVessel?.status === 'Unclean'

  const batchId = generateBatchId(parcel?.clone ?? 'BAT', batches)

  const handleSubmit = () => {
    if (!pick || !form.vesselId) return

    const batch = {
      id: uid(),
      batchId,
      nickname: form.nickname,
      pickId: pick.id,
      parcelId: pick.parcelId,
      vesselId: form.vesselId,
      vesselType: form.vesselType,
      startDate: form.startDate,
      status: 'active' as const,
      dailyLog: [],
      actions: [],
      createdAt: new Date().toISOString(),
    }

    addBatch(batch)
    markPickFermentStarted(pick.id)

    if (isUnclean) {
      addBatchAction(batch.id, {
        id: uid(),
        type: 'Tank Cleaning',
        date: form.startDate,
        notes: 'Auto-created: vessel was marked unclean at ferment start',
      })
    }

    addActivity({
      id: uid(),
      type: 'batch-created',
      description: `Ferment started: ${batchId}${form.nickname ? ` — ${form.nickname}` : ''}`,
      date: new Date().toISOString(),
      parcelId: pick.parcelId,
      batchId: batch.id,
    })

    onClose()
  }

  if (!pick || !parcel) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start Ferment"
      subtitle={`${parcel.name} — picked ${pick.date} — ${pick.netWeight}kg net`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.vesselId}>
            Start Ferment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Pre-populated pick info */}
        <div className="bg-[#F8F5F0] border border-[#E5DED6] rounded-[3px] px-4 py-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-mono text-[#A8A29E]">Parcel</p>
            <p className="text-sm font-sans text-[#1A1814] mt-0.5">{parcel.name}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-[#A8A29E]">Net Weight</p>
            <p className="text-sm font-mono text-[#1A1814] mt-0.5">{pick.netWeight} kg</p>
          </div>
          <div>
            <p className="text-xs font-mono text-[#A8A29E]">pH / Baume</p>
            <p className="text-sm font-mono text-[#1A1814] mt-0.5">{pick.ph} / {pick.baume}</p>
          </div>
        </div>

        {/* Batch ID */}
        <div className="bg-[#F0E6E0] border border-[#E5C4B6] rounded-[3px] px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-mono text-[#6B6560]">Auto-generated Batch ID</span>
          <span className="text-sm font-mono font-medium text-[#B85C38]">{batchId}</span>
        </div>

        <FieldWrap label="Nickname (optional)" hint="e.g. 'Home Block Whole Bunch'">
          <Input placeholder="Optional batch nickname" value={form.nickname} onChange={(e) => set('nickname', e.target.value)} />
        </FieldWrap>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Vessel Type" required>
            <Select value={form.vesselType} onChange={(e) => { set('vesselType', e.target.value as 'tank' | 'barrel'); set('vesselId', '') }}>
              <option value="tank">Tank</option>
              <option value="barrel">Barrel</option>
            </Select>
          </FieldWrap>

          <FieldWrap label="Select Vessel" required>
            <Select value={form.vesselId} onChange={(e) => set('vesselId', e.target.value)}>
              <option value="">— Select vessel —</option>
              {allVessels.map((v) => (
                <option key={v.id} value={v.id}>{v.label} {v.status !== 'Clean' ? `(${v.status})` : ''}</option>
              ))}
            </Select>
          </FieldWrap>
        </div>

        {isUnclean && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-200 rounded-[3px]">
            <AlertTriangle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-sans text-yellow-800">
              This vessel is marked <strong>Unclean</strong>. A cleaning action will be auto-created and assigned on save.
            </p>
          </div>
        )}

        <FieldWrap label="Start Date" required>
          <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </FieldWrap>
      </div>
    </Modal>
  )
}
