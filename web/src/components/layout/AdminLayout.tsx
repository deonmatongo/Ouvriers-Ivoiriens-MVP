import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, CreditCard, AlertTriangle,
  BarChart3, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { locale, toggle } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const base = (import.meta.env.VITE_ADMIN_BASE_PATH as string | undefined) ?? '/admin';
  const nav = [
    { to: base || '/', icon: LayoutDashboard, labelFr: 'Vue d\'ensemble', labelEn: 'Overview' },
    { to: `${base}/users`, icon: Users, labelFr: 'Utilisateurs', labelEn: 'Users' },
    { to: `${base}/verification`, icon: ShieldCheck, labelFr: 'Vérification', labelEn: 'Verification' },
    { to: `${base}/transactions`, icon: CreditCard, labelFr: 'Transactions', labelEn: 'Transactions' },
    { to: `${base}/disputes`, icon: AlertTriangle, labelFr: 'Litiges', labelEn: 'Disputes' },
    { to: `${base}/analytics`, icon: BarChart3, labelFr: 'Analytique', labelEn: 'Analytics' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">OI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Ouvriers Ivoiriens</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-600 text-white tracking-wide">
              ADMIN
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, labelFr, labelEn }) => (
          <NavLink
            key={to}
            to={to}
            end={to === (base || '/')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {locale === 'fr' ? labelFr : labelEn}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-slate-400">Administrateur</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          {locale === 'fr' ? 'Déconnexion' : 'Logout'}
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
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="hidden md:block text-sm font-semibold text-gray-700">
              {locale === 'fr' ? 'Panneau d\'administration' : 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span className="hidden sm:block text-xs font-medium text-gray-600">Admin</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
