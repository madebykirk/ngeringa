import { Sprout, FlaskConical, Package } from 'lucide-react'
import { useStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export function SummaryCards() {
  const navigate = useNavigate()
  const parcels = useStore((s) => s.parcels)
  const picks = useStore((s) => s.picks)
  const batches = useStore((s) => s.batches)
  const bottledLots = useStore((s) => s.bottledLots)

  const currentYear = new Date().getFullYear()
  const thisSeason = picks.filter((p) => new Date(p.date).getFullYear() === currentYear)
  const activeBatches = batches.filter((b) => b.status === 'active')
  const completedBatches = batches.filter((b) => b.status === 'completed')
  const totalBottles = bottledLots.reduce((sum, l) => sum + l.bottles, 0)
  const vintages = [...new Set(bottledLots.map((l) => l.vintage))].sort((a, b) => b - a)

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Vineyard card */}
      <SummaryCard
        icon={<Sprout size={18} className="text-[#7A8C6E]" />}
        label="Vineyard"
        onClick={() => navigate('/vineyard')}
      >
        <StatRow label="Total parcels" value={parcels.length} />
        <StatRow label="Active picks this season" value={thisSeason.length} />
        <StatRow label="Surface area" value={`${parcels.reduce((s, p) => s + p.surfaceArea, 0).toFixed(1)} ha`} />
      </SummaryCard>

      {/* Cellar card */}
      <SummaryCard
        icon={<FlaskConical size={18} className="text-[#B85C38]" />}
        label="Cellar"
        onClick={() => navigate('/cellar')}
      >
        <StatRow label="Active ferments" value={activeBatches.length} accent />
        <StatRow label="Completed batches" value={completedBatches.length} />
        <StatRow label="Total batches" value={batches.length} />
      </SummaryCard>

      {/* Inventory card */}
      <SummaryCard
        icon={<Package size={18} className="text-[#A8A29E]" />}
        label="Inventory"
        onClick={() => navigate('/inventory')}
      >
        <StatRow label="Bottled lots" value={bottledLots.length} />
        <StatRow label="Total bottles" value={totalBottles.toLocaleString()} />
        <StatRow
          label="Current vintage"
          value={vintages.length > 0 ? String(vintages[0]) : '—'}
        />
      </SummaryCard>
    </div>
  )
}

function SummaryCard({
  icon, label, children, onClick
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E5DED6] rounded-[4px] p-5 cursor-pointer hover:border-[#C9BEB5] transition-colors duration-150 group"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="text-xs font-mono uppercase tracking-widest text-[#6B6560]">{label}</span>
        <span className="ml-auto text-xs font-mono text-[#C9BEB5] group-hover:text-[#A8A29E] transition-colors">→</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {children}
      </div>
    </div>
  )
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs font-sans text-[#A8A29E]">{label}</span>
      <span className={`text-sm font-mono font-medium ${accent ? 'text-[#B85C38]' : 'text-[#1A1814]'}`}>
        {value}
      </span>
    </div>
  )
}
