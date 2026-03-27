import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Wrench, Star, Search, MessageSquare, Coins,
  LogOut, Menu, X, Bell, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';

export function WorkerLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t, locale, toggle } = useLang();
  const { balance } = useTokens();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: '/dashboard/worker', icon: LayoutDashboard, label: t('navDashboard') },
    { to: '/dashboard/worker/profile', icon: User, label: t('navMyProfile') },
    { to: '/dashboard/worker/services', icon: Wrench, label: t('navMyServices') },
    { to: '/dashboard/worker/browse', icon: Search, label: t('navBrowseJobs') },
    { to: '/dashboard/worker/messages', icon: MessageSquare, label: t('navWorkerMessages') },
    { to: '/dashboard/worker/reviews', icon: Star, label: t('navReviews') },
    { to: '/dashboard/worker/credits', icon: Coins, label: t('navCredits') },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-900 text-white">
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">OI</span>
          </div>
          <span className="font-semibold">Ouvriers Ivoiriens</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard/worker'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        {/* Token balance chip */}
        <NavLink
          to="/dashboard/worker/credits"
          className="flex items-center justify-between px-3 py-2 mb-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Coins size={15} className={balance > 0 ? 'text-yellow-400' : 'text-gray-500'} />
            <span className="text-xs text-gray-300">{t('creditsUnit')}</span>
          </div>
          <span className={`text-sm font-bold ${balance > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{balance}</span>
        </NavLink>

        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{t('roleArtisan')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          {t('navLogout')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block w-64 flex-shrink-0 h-full"><Sidebar /></div>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 flex-shrink-0 h-full"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggle}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
