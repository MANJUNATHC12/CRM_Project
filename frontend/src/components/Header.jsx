import { Bell, Search, User, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('crm_token');
        if (!token) return;
        const [notifRes, countRes] = await Promise.all([
          fetch('http://localhost:5146/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5146/api/notifications/unread-count', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (notifRes.ok) setNotifications(await notifRes.json());
        if (countRes.ok) setUnreadCount((await countRes.json()).count);
      } catch (err) {
        console.error('Failed to load notifications');
      }
    };
    fetchNotifications();
    
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
       await fetch('http://localhost:5146/api/notifications/read-all', { 
           method: 'PUT',
           headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` } 
       });
       setUnreadCount(0);
       setNotifications(notifications.map(n => ({...n, isRead: true})));
    } catch {}
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 z-10 sticky top-0">
      
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search leads, contacts, deals..." 
            className="w-full bg-slate-100 hover:bg-slate-200/50 focus:bg-white border border-transparent focus:border-blue-500 rounded-md py-2 text-sm pl-10 pr-4 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-1 justify-end items-center gap-4 md:gap-6">
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="text-slate-600 hover:text-blue-600 relative p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
            </button>
            
            {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                   {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium tracking-wide">Mark all read</button>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <Bell size={24} className="text-slate-300"/>
                            <p className="text-xs font-medium">You're all caught up!</p>
                        </div>
                    ) : notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-50 text-sm ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                            <div className="flex justify-between items-start gap-2">
                               <p className={`font-medium ${!n.isRead ? 'text-blue-900' : 'text-slate-700'} mb-0.5`}>{n.title}</p>
                               <span className="text-[10px] text-slate-400 shrink-0 uppercase font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                    <Link to="/activity" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 tracking-wide uppercase flex items-center justify-center gap-1">
                        <FileText size={12}/> View Activity Log
                    </Link>
                </div>
            </div>
            )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
        
        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 group-hover:bg-slate-200 transition-colors">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight text-left">
              <span className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
              <span className="text-[11px] text-slate-500">{user?.role || 'User'}</span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
               <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
               </div>
               <div className="p-1">
                 <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"><User size={16}/> Profile</Link>
                 <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                     <LogOut size={16}/> Sign Out
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
