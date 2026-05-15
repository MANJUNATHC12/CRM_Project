import { Activity, User, FileText, Briefcase, Plus, Check, Search, Calendar, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://localhost:5146/api/activities?limit=100', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
        });
        if (response.ok) {
          setActivities(await response.json());
        }
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getIconForAction = (entityType, action) => {
      const type = entityType.toLowerCase();
      const act = action.toLowerCase();
      if (type.includes('customer')) return <User size={16} className="text-blue-500" />;
      if (type.includes('lead')) return <Briefcase size={16} className="text-purple-500" />;
      if (type.includes('note')) return <FileText size={16} className="text-amber-500" />;
      if (act.includes('created')) return <Plus size={16} className="text-emerald-500" />;
      return <Activity size={16} className="text-slate-500" />;
  };

  const getActionColor = (action) => {
       const act = action.toLowerCase();
       if (act.includes('created')) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
       if (act.includes('updated')) return 'text-blue-700 bg-blue-50 border-blue-100';
       if (act.includes('deleted')) return 'text-red-700 bg-red-50 border-red-100';
       return 'text-slate-700 bg-slate-50 border-slate-200';
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">Review all centralized system operations and user footprints.</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="text" placeholder="Filter activities..." className="w-full bg-white border border-slate-200 rounded-md py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 transition-colors" />
             </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
             <div className="p-8 text-center text-slate-500 text-sm">Loading activity logs...</div>
          ) : activities.length === 0 ? (
             <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                 <Activity size={48} className="text-slate-300" />
                 <div><h3 className="text-base font-semibold text-slate-900">No Activity Yet</h3><p className="text-sm">When users interact with CRM entities, records will appear here.</p></div>
             </div>
          ) : (
            <div className="divide-y divide-slate-100">
                {activities.map((act) => (
                    <div key={act.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                            {getIconForAction(act.entityType, act.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                   {act.userName} <span className="font-normal text-slate-500">performed operation on</span> {act.entityType}
                                </p>
                                <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1.5"><Calendar size={12}/> {new Date(act.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getActionColor(act.action)}`}>
                                    {act.action}
                                </span>
                                {act.details && <span className="text-xs text-slate-500 truncate">{act.details}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
