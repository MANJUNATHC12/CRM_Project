import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Activity, CheckSquare, TrendingUp, Settings, Zap, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Leads', icon: Briefcase, path: '/leads' },
    { name: 'Activity Log', icon: Activity, path: '/activity' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Reports', icon: TrendingUp, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-full z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600">
          <Zap size={24} className="fill-blue-600" />
          <span className="text-lg font-bold text-slate-900 tracking-tight">NexusCRM</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <NavLink to="/login" className="flex items-center gap-3 px-3 py-2 w-full rounded-md font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150">
          <LogOut size={18} />
          Sign Out
        </NavLink>
      </div>
    </aside>
  );
}
