import { useStore } from '@/store'
import { formatDate, relativeTime } from '@/utils/ids'
import { Grape, FlaskConical, FileText, Package, Wrench } from 'lucide-react'

const typeConfig = {
  'pick': { icon: Grape, color: 'text-[#7A8C6E]', bg: 'bg-[#E8EDE5]', label: 'Pick' },
  'vineyard-task': { icon: Wrench, color: 'text-[#7A8C6E]', bg: 'bg-[#E8EDE5]', label: 'Vineyard' },
  'batch-created': { icon: FlaskConical, color: 'text-[#B85C38]', bg: 'bg-[#F0E6E0]', label: 'Cellar' },
  'batch-action': { icon: FlaskConical, color: 'text-[#B85C38]', bg: 'bg-[#F0E6E0]', label: 'Action' },
  'batch-log': { icon: FlaskConical, color: 'text-[#B85C38]', bg: 'bg-[#F0E6E0]', label: 'Log' },
  'lot-bottled': { icon: Package, color: 'text-[#A8A29E]', bg: 'bg-[#F0EBE3]', label: 'Bottled' },
  'worksheet': { icon: FileText, color: 'text-[#6B6560]', bg: 'bg-[#F0EBE3]', label: 'Worksheet' },
}

export function ActivityFeed() {
  const activity = useStore((s) => s.activity)
  const parcels = useStore((s) => s.parcels)
  const batches = useStore((s) => s.batches)

  const getParcelName = (id?: string) => parcels.find((p) => p.id === id)?.name
  const getBatchId = (id?: string) => batches.find((b) => b.id === id)?.batchId

  const sorted = [...activity].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-serif text-[#1A1814]">Recent Activity</h3>
        <span className="text-xs font-mono text-[#A8A29E]">{activity.length} total</span>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E5DED6] rounded-[4px] p-8 text-center">
          <p className="text-sm font-sans text-[#A8A29E]">No activity yet. Start by logging a pick or adding a vineyard task.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5DED6] rounded-[4px] divide-y divide-[#F0EBE3]">
          {sorted.map((entry) => {
            const config = typeConfig[entry.type] ?? typeConfig['vineyard-task']
            const Icon = config.icon
            return (
              <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#FDFAF7] transition-colors duration-150">
                <div className={`${config.bg} rounded-full p-1.5 flex-shrink-0 mt-0.5`}>
                  <Icon size={13} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-[#1A1814]">{entry.description}</p>
                  {(entry.parcelId || entry.batchId) && (
                    <p className="text-xs font-mono text-[#A8A29E] mt-0.5">
                      {entry.parcelId && getParcelName(entry.parcelId) && (
                        <span>{getParcelName(entry.parcelId)}</span>
                      )}
                      {entry.parcelId && entry.batchId && <span className="mx-1">·</span>}
                      {entry.batchId && getBatchId(entry.batchId) && (
                        <span>{getBatchId(entry.batchId)}</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-mono text-[#A8A29E]">{relativeTime(entry.date)}</p>
                  <p className="text-xs font-mono text-[#C9BEB5] mt-0.5">{formatDate(entry.date)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
