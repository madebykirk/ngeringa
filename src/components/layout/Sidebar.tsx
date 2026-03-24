import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Package,
  Settings,
  FileText,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/vineyard', label: 'Vineyard', icon: Sprout, exact: false },
  { to: '/cellar', label: 'Cellar', icon: FlaskConical, exact: false },
  { to: '/inventory', label: 'Inventory', icon: Package, exact: false },
  { to: '/worksheets', label: 'Worksheets', icon: FileText, exact: false },
  { to: '/settings', label: 'Settings', icon: Settings, exact: false },
]

export function Sidebar() {
  return (
    <aside
      className="fixed top-0 left-0 h-full w-[220px] flex flex-col z-40"
      style={{ backgroundColor: '#1A1814' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <NgeringaLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[3px] text-sm font-sans transition-all duration-150 group
               ${isActive
                ? 'bg-white/10 text-white'
                : 'text-[#8A837B] hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={`flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-[#B85C38]' : 'text-current'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[10px] font-mono" style={{ color: '#4A4540' }}>
          by Kirk Simmons
        </p>
      </div>
    </aside>
  )
}

// Ngeringa logo — actual brand asset
function NgeringaLogo() {
  return (
    <img
      src="/ngeringa-logo.png"
      alt="Ngeringa"
      style={{
        width: '148px',
        height: 'auto',
        borderRadius: '3px',
        display: 'block',
        opacity: 0.92,
      }}
    />
  )
}
