import { Activity, User, FileText, Briefcase, Plus, Check, Search, Calendar, RefreshCw, Trash2, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchActivities = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchActivities();
  }, []);

  const getIconForAction = (entityType, action) => {
      const type = (entityType || '').toLowerCase();
      const act = (action || '').toLowerCase();
      if (type.includes('customer')) return <User size={16} className="text-blue-600" />;
      if (type.includes('lead')) return <Briefcase size={16} className="text-purple-600" />;
      if (type.includes('note')) return <FileText size={16} className="text-amber-600" />;
      if (act.includes('created')) return <Plus size={16} className="text-emerald-600" />;
      return <Activity size={16} className="text-slate-600" />;
  };

  const getActionColor = (action) => {
       const act = (action || '').toLowerCase();
       if (act.includes('created')) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
       if (act.includes('updated')) return 'text-blue-700 bg-blue-50 border-blue-100';
       if (act.includes('deleted')) return 'text-red-700 bg-red-50 border-red-100';
       return 'text-slate-700 bg-slate-50 border-slate-200';
  }

  // Filter logic
  const filteredActivities = activities.filter(act => {
    const matchesSearch = 
      (act.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (act.entityType || '').toLowerCase().includes(search.toLowerCase()) ||
      (act.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (act.details || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesEntity = entityFilter === 'all' || (act.entityType || '').toLowerCase().includes(entityFilter.toLowerCase());
    const matchesAction = actionFilter === 'all' || (act.action || '').toLowerCase().includes(actionFilter.toLowerCase());
    
    return matchesSearch && matchesEntity && matchesAction;
  });

  // Analytics logic
  const totalCount = activities.length;
  const createdCount = activities.filter(a => (a.action || '').toLowerCase().includes('created')).length;
  const updatedCount = activities.filter(a => (a.action || '').toLowerCase().includes('updated')).length;
  const deletedCount = activities.filter(a => (a.action || '').toLowerCase().includes('deleted')).length;

  return (
    <div className="max-w-6xl mx-auto w-full px-2 py-4 space-y-6 flex flex-col min-h-screen">
      
      {/* Dashboard Title & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">Review all centralized system operations and user footprints.</p>
        </div>
        <button 
          onClick={fetchActivities}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-500' : 'text-slate-400'} />
          Refresh Log
        </button>
      </div>

      {/* Analytics Scorecards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Operations</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : totalCount}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Activity size={22} />
          </div>
        </div>

        {/* Created card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Created Records</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : createdCount}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <Plus size={22} />
          </div>
        </div>

        {/* Updated card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Updated Records</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : updatedCount}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <RefreshCw size={20} />
          </div>
        </div>

        {/* Deleted card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deleted Records</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : deletedCount}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <Trash2 size={20} />
          </div>
        </div>
      </div>

      {/* Main filterable board area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        
        {/* Search & Select filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search user, action, details..." 
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                />
             </div>
             
             <div className="flex gap-2 w-full md:w-auto">
               <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm flex-1 md:flex-none">
                 <Filter size={13} className="text-slate-400" />
                 <select 
                   value={entityFilter}
                   onChange={e => setEntityFilter(e.target.value)}
                   className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
                 >
                   <option value="all">All Entities</option>
                   <option value="lead">Leads Only</option>
                   <option value="customer">Customers Only</option>
                   <option value="note">Notes Only</option>
                 </select>
               </div>

               <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm flex-1 md:flex-none">
                 <Filter size={13} className="text-slate-400" />
                 <select 
                   value={actionFilter}
                   onChange={e => setActionFilter(e.target.value)}
                   className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
                 >
                   <option value="all">All Actions</option>
                   <option value="created">Created</option>
                   <option value="updated">Updated</option>
                   <option value="deleted">Deleted</option>
                 </select>
               </div>
             </div>
        </div>
        
        {/* Dynamic Activity List */}
        <div className="flex-1 min-h-[400px]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 animate-pulse font-medium text-sm flex items-center justify-center gap-2">
               <RefreshCw className="animate-spin text-blue-500" size={16} /> Loading activity logs...
             </div>
          ) : filteredActivities.length === 0 ? (
             <div className="p-20 flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                 <Activity size={48} className="text-slate-200" />
                 <div>
                   <h3 className="text-base font-semibold text-slate-800">No Matching Activities</h3>
                   <p className="text-sm text-slate-400 mt-1">Try relaxing your search terms or filters.</p>
                 </div>
             </div>
          ) : (
            <div className="relative p-6">
              {/* Timeline Connector Line */}
              <div className="absolute left-[2.25rem] top-8 bottom-8 w-[2px] bg-slate-100 z-0"></div>
              
              <div className="space-y-6 relative z-10">
                  {filteredActivities.map((act) => (
                      <div key={act.id} className="flex items-start gap-4 group">
                          {/* Left Icon Badge */}
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:shadow transition-all duration-200">
                              {getIconForAction(act.entityType, act.action)}
                          </div>
                          
                          {/* Content Card */}
                          <div className="flex-1 bg-white hover:bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow transition-all duration-200">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                  <p className="text-sm font-semibold text-slate-800">
                                     {act.userName} <span className="font-normal text-slate-500">performed operation on</span> {act.entityType}
                                  </p>
                                  <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                    <Calendar size={11} className="text-slate-400" />
                                    {new Date(act.createdAt).toLocaleString()}
                                  </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2.5">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm ${getActionColor(act.action)}`}>
                                      {act.action}
                                  </span>
                                  {act.details && (
                                    <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 font-medium">
                                      {act.details}
                                    </span>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
